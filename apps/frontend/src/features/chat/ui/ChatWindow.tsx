import { FormEvent, lazy, Suspense, useEffect, useRef, useState } from 'react';
import { BrandMark, IconLock, IconPhone, IconSend } from '@/shared/ui';
import { useTherapyFlow } from '@/features/session';
import { useChat } from '../model/useChat';

// Carga diferida: el SDK de voz (ElevenLabs + WebRTC) solo se descarga cuando
// el usuario abre el modo voz, no en la carga inicial de la página.
const VoiceOverlay = lazy(() =>
  import('@/features/voice').then((m) => ({ default: m.VoiceOverlay })),
);

function AssistantAvatar({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const dims = size === 'md' ? 'h-10 w-10' : 'h-7 w-7';
  const mark = size === 'md' ? 'h-5 w-5' : 'h-3.5 w-3.5';
  return (
    <span className={`relative grid shrink-0 place-items-center rounded-full bg-brand text-white ${dims}`} aria-hidden="true">
      <BrandMark className={mark} />
      {size === 'md' && (
        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 animate-ping-green rounded-full border-2 border-white bg-green" />
      )}
    </span>
  );
}

function normalizeForIntent(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function ChatWindow() {
  const { goToRegistration, step } = useTherapyFlow();
  const { messages, sending, error, send, sendVoiceTranscript } = useChat();
  const [draft, setDraft] = useState('');
  const [voiceOpen, setVoiceOpen] = useState(false);
  // Reinicia la animación de "despegue" del icono de enviar en cada envío.
  const [flightSeq, setFlightSeq] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const callButtonRef = useRef<HTMLButtonElement>(null);
  const voiceWasOpen = useRef(false);
  const lastVoiceTranscriptRef = useRef<string>('');

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  // Ante una crisis, el overlay de voz se cierra (desmonta y cuelga la sesión);
  // el CrisisOverlay del flujo toma el primer plano.
  useEffect(() => {
    if (step === 'crisis') setVoiceOpen(false);
  }, [step]);

  // Ciclo de foco del diálogo modal: al cerrar la voz, regresa al botón de llamada.
  useEffect(() => {
    if (voiceWasOpen.current && !voiceOpen) callButtonRef.current?.focus();
    voiceWasOpen.current = voiceOpen;
  }, [voiceOpen]);

  const canSend = draft.trim().length > 0 && !sending;

  async function handleVoiceTranscript(role: 'user' | 'assistant', content: string) {
    if (role !== 'user') return;
    const normalized = normalizeForIntent(content).trim();
    if (!normalized || normalized === lastVoiceTranscriptRef.current) return;
    lastVoiceTranscriptRef.current = normalized;
    await sendVoiceTranscript(content);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSend) return;
    const value = draft;
    setDraft('');
    setFlightSeq((seq) => seq + 1);
    await send(value);
  }

  return (
    <div className="card relative flex min-h-0 flex-1 flex-col overflow-hidden p-0 sm:p-0">
      {/* El contenido queda inerte (sin foco ni interacción) mientras el modo voz está activo. */}
      <div className="flex min-h-0 flex-1 flex-col" inert={voiceOpen}>
        <header className="flex items-center justify-between gap-3 border-b border-hairline bg-white px-4 py-3.5 sm:px-6">
          <div className="flex items-center gap-3">
            <AssistantAvatar />
            <div className="flex flex-col leading-tight">
              <span className="font-display font-bold text-navy">Ataraxia</span>
              <span className="inline-flex items-center gap-1 text-xs text-muted">
                <IconLock className="h-3 w-3" />
                Conversación confidencial
              </span>
            </div>
          </div>
          <button
            type="button"
            className="btn--light whitespace-nowrap px-3 py-2 text-sm sm:px-4"
            onClick={goToRegistration}
          >
            Continuar a registro
          </button>
        </header>

        <div
          className="flex-1 space-y-4 overflow-y-auto bg-bg px-4 py-5 sm:px-6"
          ref={scrollRef}
          aria-live="polite"
        >
          {messages.map((msg, i) => {
            const isUser = msg.role === 'user';
            const typing = !isUser && sending && msg.content === '';
            const streaming = !isUser && sending && msg.content !== '' && i === messages.length - 1;
            return (
              <div
                key={i}
                className={`flex items-end gap-2.5 ${
                  isUser ? 'animate-message-in-right justify-end' : 'animate-message-in-left justify-start'
                }`}
              >
                {!isUser && <AssistantAvatar size="sm" />}
                <div
                  className={`max-w-[82%] overflow-hidden break-words rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${
                    isUser
                      ? 'rounded-br-md bg-brand text-white'
                      : 'rounded-bl-md border border-hairline bg-white text-ink shadow-soft'
                  }`}
                >
                  {typing ? (
                    <span className="flex items-center gap-1 py-1" aria-label="Ataraxia está escribiendo">
                      <span className="typing-dot" />
                      <span className="typing-dot [animation-delay:0.15s]" />
                      <span className="typing-dot [animation-delay:0.3s]" />
                    </span>
                  ) : (
                    <>
                      {msg.content}
                      {streaming && (
                        <span
                          className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] animate-caret rounded-full bg-primary/70"
                          aria-hidden="true"
                        />
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {error && (
          <p className="form-error px-4 pt-3 sm:px-6" role="alert">
            {error}
          </p>
        )}

        <form
          className="flex items-end gap-2.5 border-t border-hairline bg-white px-4 py-4 sm:px-6"
          onSubmit={handleSubmit}
        >
          <label htmlFor="chat-draft" className="sr-only">
            Escribe tu mensaje
          </label>
          <textarea
            id="chat-draft"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Escribe cómo te sientes…"
            rows={2}
            className="max-h-36 flex-1 resize-none rounded-md2 border border-hairline px-4 py-2.5 text-base text-ink transition placeholder:text-muted/60 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/15 sm:text-[15px]"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                void handleSubmit(e);
              }
            }}
          />
          <button
            type="button"
            ref={callButtonRef}
            onClick={() => setVoiceOpen(true)}
            disabled={sending}
            aria-label="Llamar a Ataraxia"
            title="Llamar a Ataraxia"
            className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-brand text-white shadow-soft transition hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 sm:h-16 sm:w-16"
          >
            <IconPhone className="h-7 w-7 sm:h-8 sm:w-8" />
          </button>
          <button
            type="submit"
            disabled={!canSend}
            aria-label="Enviar mensaje"
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-hairline bg-white text-primary-dark transition hover:bg-lavender focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span key={flightSeq} className={`grid place-items-center ${flightSeq > 0 ? 'animate-send-fly' : ''}`}>
              <IconSend className="h-[18px] w-[18px] -translate-x-px" />
            </span>
          </button>
        </form>

        <p className="bg-white px-6 pb-3 text-center text-xs text-muted">
          Si estás en una emergencia, contacta de inmediato a los servicios de
          emergencia de tu localidad.
        </p>
      </div>

      {voiceOpen && (
        <Suspense fallback={<div className="voice-overlay" aria-hidden="true" />}>
          <VoiceOverlay
            onTranscript={handleVoiceTranscript}
            onClose={() => setVoiceOpen(false)}
          />
        </Suspense>
      )}
    </div>
  );
}
