import { WebSocketConnection } from '@elevenlabs/react';

/*
 * Puente del facilitador IA de la sala grupal (Fase 2 del spec 006).
 *
 * El anfitrión (el par con menor peerId presente) conecta un agente de
 * ElevenLabs por WebSocket y lo "sienta" en la malla WebRTC:
 *
 *   entrada del agente  <-  micrófono del anfitrión + streams remotos
 *                           (mezcla WebAudio, PCM16 mono a la tasa del agente)
 *   salida del agente   ->  monitor local del anfitrión + pista saliente
 *                           mezclada (mic + agente) que sustituye a la pista
 *                           de solo-mic vía RTCRtpSender.replaceTrack
 *                           (sin renegociación)
 *
 * Se usa la capa de conexión pública del SDK (WebSocketConnection) para no
 * reimplementar el protocolo: negocia formatos, acepta user_audio_chunk y
 * entrega audio/ping/interrupción. La API key jamás toca el frontend: el
 * agentId es público (igual que en la sala individual); para agentes privados
 * usar una signed URL generada por el backend.
 *
 * Decisiones anti-eco (mix-minus):
 * - La salida del agente NO se conecta a su propia entrada.
 * - El monitor local se reproduce vía <audio> alimentado por un
 *   MediaStreamAudioDestinationNode, no vía ctx.destination: en Chromium el
 *   audio de WebAudio no entra a la referencia del AEC y el micrófono del
 *   anfitrión re-inyectaría al agente su propia voz.
 * - A los pares solo viaja mic + agente (nunca los remotos: se oirían a sí
 *   mismos con retardo).
 *
 * Dependencia externa: en Chrome un MediaStream remoto es silencioso dentro
 * de WebAudio salvo que también esté adjunto a un elemento de audio
 * (crbug.com/933677). Los RemoteAudioSink de GroupRoom cumplen ese requisito;
 * no deben desmontarse mientras el puente esté activo.
 */

export interface FacilitatorBridgeState {
  active: boolean;
  speaking: boolean;
}

export interface FacilitatorBridgeOptions {
  agentId: string;
  micStream: MediaStream;
  onStateChange: (state: FacilitatorBridgeState) => void;
  onError: (message: string) => void;
  /** Aviso de desconexión no solicitada (el hook decide si reintenta). */
  onDisconnected: () => void;
}

/** Duración de cada bloque de audio enviado al agente (ms). */
const CHUNK_MS = 50;
/** Colchón de programación para absorber jitter del audio del agente (s). */
const PLAYBACK_SLACK = 0.06;

/** Código del AudioWorklet de captura: la mezcla ya llega sumada por WebAudio;
 *  remuestrea a la tasa del agente (interpolación lineal; identidad si el
 *  contexto ya corre a esa tasa) y publica bloques Int16. */
const CAPTURE_WORKLET = `
class FacilitatorCapture extends AudioWorkletProcessor {
  constructor(options) {
    super();
    const { targetRate, chunkMs } = options.processorOptions;
    this.step = sampleRate / targetRate;
    this.pos = 0;
    this.prev = 0;
    this.chunk = new Int16Array(Math.round((targetRate * chunkMs) / 1000));
    this.filled = 0;
  }
  process(inputs) {
    const ch = inputs[0] && inputs[0][0];
    if (!ch) return true;
    let pos = this.pos;
    for (;;) {
      const idx = Math.floor(pos);
      if (idx >= ch.length) break;
      const frac = pos - idx;
      const before = idx === 0 ? this.prev : ch[idx - 1];
      const sample = before + (ch[idx] - before) * frac;
      const clamped = Math.max(-1, Math.min(1, sample));
      this.chunk[this.filled] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
      this.filled += 1;
      if (this.filled === this.chunk.length) {
        this.port.postMessage(this.chunk.slice(0));
        this.filled = 0;
      }
      pos += this.step;
    }
    this.pos = pos - ch.length;
    this.prev = ch[ch.length - 1];
    return true;
  }
}
registerProcessor('facilitator-capture', FacilitatorCapture);
`;

function int16ToBase64(samples: Int16Array): string {
  const bytes = new Uint8Array(samples.buffer, samples.byteOffset, samples.byteLength);
  let binary = '';
  // En bloques: expandir el arreglo completo revienta el límite de argumentos.
  const BLOCK = 0x8000;
  for (let i = 0; i < bytes.length; i += BLOCK) {
    binary += String.fromCodePoint(...bytes.subarray(i, i + BLOCK));
  }
  return btoa(binary);
}

function base64ToInt16(b64: string): Int16Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.codePointAt(i) ?? 0;
  return new Int16Array(bytes.buffer, 0, Math.floor(bytes.length / 2));
}

/** Mantiene un AudioContext corriendo (autoplay policy / pestaña en reposo). */
function keepRunning(ctx: AudioContext): void {
  void ctx.resume().catch(() => undefined);
  ctx.onstatechange = () => {
    if (ctx.state === 'suspended') void ctx.resume().catch(() => undefined);
  };
}

/**
 * Ciclo de vida: `start()` una vez; `addRemoteStream`/`removeRemoteStream`/
 * `sendContext` mientras vive; `stop()` al salir o al ceder el rol de
 * anfitrión. Una instancia no es reutilizable después de `stop()`.
 */
export class FacilitatorBridge {
  private readonly opts: FacilitatorBridgeOptions;

  private connection: WebSocketConnection | null = null;
  private stopped = false;

  // Captura hacia el agente (contexto a la tasa del agente cuando se puede).
  private captureCtx: AudioContext | null = null;
  private mixBus: GainNode | null = null;
  private captureNode: AudioWorkletNode | ScriptProcessorNode | null = null;
  private readonly remoteSources = new Map<string, MediaStreamAudioSourceNode>();

  // Salida del agente: monitor local + mezcla saliente hacia los pares.
  private playbackCtx: AudioContext | null = null;
  private agentGain: GainNode | null = null;
  private mixedDest: MediaStreamAudioDestinationNode | null = null;
  private monitorEl: HTMLAudioElement | null = null;
  private readonly scheduledSources = new Set<AudioBufferSourceNode>();
  private nextPlayTime = 0;
  private lastEmitted: FacilitatorBridgeState | null = null;

  constructor(opts: FacilitatorBridgeOptions) {
    this.opts = opts;
  }

  /** Pista saliente (mic + agente) que sustituye a la de solo micrófono. */
  getMixedTrack(): MediaStreamTrack | null {
    return this.mixedDest?.stream.getAudioTracks()[0] ?? null;
  }

  isActive(): boolean {
    return Boolean(this.connection) && !this.stopped;
  }

  async start(): Promise<void> {
    try {
      const connection = await WebSocketConnection.create({ agentId: this.opts.agentId });
      if (this.stopped) {
        connection.close();
        return;
      }

      // El WS de agentes solo emite PCM o u-law; aquí soportamos PCM.
      if (connection.outputFormat.format !== 'pcm' || connection.inputFormat.format !== 'pcm') {
        connection.close();
        throw new Error(
          `El agente grupal debe usar audio PCM (formato recibido: ${connection.inputFormat.format}/${connection.outputFormat.format}).`,
        );
      }
      this.connection = connection;

      // ---- Salida: agente -> monitor local (AEC-visible) + mezcla a pares --
      const playbackCtx = new AudioContext();
      this.playbackCtx = playbackCtx;
      keepRunning(playbackCtx);

      this.agentGain = playbackCtx.createGain();
      this.mixedDest = new MediaStreamAudioDestinationNode(playbackCtx, {
        channelCount: 1,
        channelCountMode: 'explicit',
      });
      const monitorDest = playbackCtx.createMediaStreamDestination();
      this.agentGain.connect(this.mixedDest);
      this.agentGain.connect(monitorDest);
      playbackCtx.createMediaStreamSource(this.opts.micStream).connect(this.mixedDest);

      const monitorEl = new Audio();
      monitorEl.srcObject = monitorDest.stream;
      monitorEl.autoplay = true;
      void monitorEl.play().catch(() => undefined);
      this.monitorEl = monitorEl;

      // ---- Entrada: mic + remotos -> mixBus -> captura PCM16 ----
      // Pedir el contexto ya a la tasa del agente delega el remuestreo de
      // calidad al navegador; si el dispositivo no lo permite, el worklet
      // interpola.
      const targetRate = connection.inputFormat.sampleRate;
      let captureCtx: AudioContext;
      try {
        captureCtx = new AudioContext({ sampleRate: targetRate });
      } catch {
        captureCtx = new AudioContext();
      }
      this.captureCtx = captureCtx;
      keepRunning(captureCtx);

      this.mixBus = captureCtx.createGain();
      captureCtx.createMediaStreamSource(this.opts.micStream).connect(this.mixBus);
      await this.setupCapture(captureCtx, targetRate);
      if (this.stopped) return;

      connection.onMessage((event) => {
        if (event.type === 'ping') {
          connection.sendMessage({ type: 'pong', event_id: event.ping_event.event_id });
        } else if (event.type === 'interruption') {
          this.cancelScheduledAudio();
        }
      });
      connection.onDisconnect((details) => {
        if (this.stopped) return;
        this.cancelScheduledAudio();
        if (details.reason === 'error' || details.reason === 'agent') {
          this.opts.onDisconnected();
        }
      });
      connection.addListener((event) => this.playAgentAudio(event.audio_base_64));

      this.emitState();
    } catch (err) {
      this.connection?.close();
      this.connection = null;
      this.teardownAudio();
      if (!this.stopped) {
        this.opts.onError(
          err instanceof Error ? err.message : 'No fue posible conectar al facilitador IA.',
        );
      }
      throw err;
    }
  }

  addRemoteStream(peerId: string, stream: MediaStream): void {
    const ctx = this.captureCtx;
    const mixBus = this.mixBus;
    if (!ctx || !mixBus || this.stopped || this.remoteSources.has(peerId)) return;
    try {
      const source = ctx.createMediaStreamSource(stream);
      source.connect(mixBus);
      this.remoteSources.set(peerId, source);
    } catch {
      /* sin este stream el agente simplemente no escucha a ese par */
    }
  }

  removeRemoteStream(peerId: string): void {
    const source = this.remoteSources.get(peerId);
    if (source) {
      try {
        source.disconnect();
      } catch {
        /* ya desconectado */
      }
      this.remoteSources.delete(peerId);
    }
  }

  /** Contexto no interruptivo para el agente (p.ej. entradas/salidas de la sala). */
  sendContext(text: string): void {
    if (this.stopped || !this.connection) return;
    try {
      this.connection.sendMessage({ type: 'contextual_update', text });
    } catch {
      /* mejor perder contexto que tirar la sesión */
    }
  }

  stop(): void {
    if (this.stopped) return;
    this.stopped = true;
    this.cancelScheduledAudio();
    this.connection?.close();
    this.connection = null;
    this.teardownAudio();
  }

  // ---- Internos -----------------------------------------------------------

  private async setupCapture(ctx: AudioContext, targetRate: number): Promise<void> {
    const mixBus = this.mixBus;
    if (!mixBus) return;

    const send = (samples: Int16Array) => {
      if (this.stopped || !this.connection) return;
      try {
        this.connection.sendMessage({ user_audio_chunk: int16ToBase64(samples) });
      } catch {
        /* socket cerrándose: onDisconnect decide el reintento */
      }
    };

    // El nodo de captura debe alcanzar destination para que el grafo procese;
    // gain 0 evita oír la mezcla de entrada.
    const silent = ctx.createGain();
    silent.gain.value = 0;
    silent.connect(ctx.destination);

    if (ctx.audioWorklet) {
      const moduleUrl = URL.createObjectURL(
        new Blob([CAPTURE_WORKLET], { type: 'application/javascript' }),
      );
      try {
        await ctx.audioWorklet.addModule(moduleUrl);
      } finally {
        URL.revokeObjectURL(moduleUrl);
      }
      if (this.stopped) return;
      const node = new AudioWorkletNode(ctx, 'facilitator-capture', {
        numberOfInputs: 1,
        numberOfOutputs: 1,
        channelCount: 1,
        channelCountMode: 'explicit',
        channelInterpretation: 'speakers',
        processorOptions: { targetRate, chunkMs: CHUNK_MS },
      });
      node.port.onmessage = (evt: MessageEvent<Int16Array>) => send(evt.data);
      mixBus.connect(node);
      node.connect(silent);
      this.captureNode = node;
      return;
    }

    // Respaldo para navegadores sin AudioWorklet: ScriptProcessor (deprecado
    // pero universal). Mismo remuestreo lineal en el hilo principal.
    const processor = ctx.createScriptProcessor(4096, 1, 1);
    const step = ctx.sampleRate / targetRate;
    const chunk = new Int16Array(Math.round((targetRate * CHUNK_MS) / 1000));
    let filled = 0;
    let pos = 0;
    let prev = 0;
    processor.onaudioprocess = (evt) => {
      const ch = evt.inputBuffer.getChannelData(0);
      for (;;) {
        const idx = Math.floor(pos);
        if (idx >= ch.length) break;
        const frac = pos - idx;
        const before = idx === 0 ? prev : ch[idx - 1];
        const sample = before + (ch[idx] - before) * frac;
        const clamped = Math.max(-1, Math.min(1, sample));
        chunk[filled] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
        filled += 1;
        if (filled === chunk.length) {
          send(chunk.slice(0));
          filled = 0;
        }
        pos += step;
      }
      pos -= ch.length;
      prev = ch.at(-1) ?? prev;
    };
    mixBus.connect(processor);
    processor.connect(silent);
    this.captureNode = processor;
  }

  private playAgentAudio(base64: string): void {
    const ctx = this.playbackCtx;
    const agentGain = this.agentGain;
    const connection = this.connection;
    if (!ctx || !agentGain || !connection || this.stopped) return;
    const samples = base64ToInt16(base64);
    if (samples.length === 0) return;
    // El buffer conserva la tasa del agente; el contexto remuestrea al vuelo.
    const buffer = ctx.createBuffer(1, samples.length, connection.outputFormat.sampleRate);
    const channel = buffer.getChannelData(0);
    for (let i = 0; i < samples.length; i += 1) channel[i] = samples[i] / 0x8000;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(agentGain);
    const startAt = Math.max(ctx.currentTime + PLAYBACK_SLACK, this.nextPlayTime);
    source.start(startAt);
    this.nextPlayTime = startAt + buffer.duration;
    this.scheduledSources.add(source);
    source.onended = () => {
      this.scheduledSources.delete(source);
      this.emitState();
    };
    this.emitState();
  }

  private cancelScheduledAudio(): void {
    this.scheduledSources.forEach((source) => {
      source.onended = null;
      try {
        source.stop();
      } catch {
        /* aún no iniciaba */
      }
    });
    this.scheduledSources.clear();
    this.nextPlayTime = 0;
    this.emitState();
  }

  private emitState(): void {
    if (this.stopped) return;
    const state: FacilitatorBridgeState = {
      active: this.isActive(),
      speaking: this.scheduledSources.size > 0,
    };
    if (
      this.lastEmitted?.active === state.active &&
      this.lastEmitted?.speaking === state.speaking
    ) {
      return;
    }
    this.lastEmitted = state;
    this.opts.onStateChange(state);
  }

  private teardownAudio(): void {
    this.remoteSources.forEach((source) => {
      try {
        source.disconnect();
      } catch {
        /* ya desconectado */
      }
    });
    this.remoteSources.clear();
    if (this.captureNode) {
      if ('port' in this.captureNode) this.captureNode.port.onmessage = null;
      else this.captureNode.onaudioprocess = null;
      try {
        this.captureNode.disconnect();
      } catch {
        /* ya desconectado */
      }
      this.captureNode = null;
    }
    if (this.monitorEl) {
      this.monitorEl.pause();
      this.monitorEl.srcObject = null;
      this.monitorEl = null;
    }
    this.mixBus = null;
    this.agentGain = null;
    this.mixedDest = null;
    for (const ctx of [this.captureCtx, this.playbackCtx]) {
      if (ctx) {
        ctx.onstatechange = null;
        void ctx.close().catch(() => undefined);
      }
    }
    this.captureCtx = null;
    this.playbackCtx = null;
  }
}
