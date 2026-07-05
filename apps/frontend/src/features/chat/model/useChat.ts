import { useCallback, useRef, useState } from 'react';
import { streamAssistantMessage } from '@/shared/api';
import { useTherapyFlow } from '@/features/session';
import { replyToVoice, transcribeVoice } from '@/features/session/api/sessionApi';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const GREETING: ChatMessage = {
  role: 'assistant',
  content:
    'Hola, soy Ataraxia. Este es un espacio seguro y confidencial para acompañarte. ' +
    'Cuéntame, ¿cómo te sientes hoy?',
};

export function useChat() {
  const { sessionId, accessToken, reportCrisis } = useTherapyFlow();
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioSrc, setAudioSrc] = useState<string | null>(null);
  const assistantIndex = useRef<number>(-1);

  const appendAssistantToken = useCallback((value: string) => {
    setMessages((prev) => {
      const next = [...prev];
      const idx = assistantIndex.current;
      if (idx >= 0 && next[idx]) {
        next[idx] = { ...next[idx], content: next[idx].content + value };
      }
      return next;
    });
  }, []);

  const send = useCallback(
    async (content: string) => {
      const trimmed = content.trim();
      if (!trimmed || sending || !sessionId || !accessToken) return;

      setError(null);
      setSending(true);
      setMessages((prev) => {
        const next = [...prev, { role: 'user' as const, content: trimmed }, { role: 'assistant' as const, content: '' }];
        assistantIndex.current = next.length - 1;
        return next;
      });

      await streamAssistantMessage(sessionId, accessToken, trimmed, {
        onToken: appendAssistantToken,
        onCrisis: (crisis) => {
          appendAssistantToken(crisis.message);
          reportCrisis(crisis);
        },
        onError: (message) => setError(message),
      });

      setSending(false);
    },
    [sending, sessionId, accessToken, appendAssistantToken, reportCrisis],
  );

  // Inserta en el hilo mensajes generados localmente (transcripciones del modo
  // de voz). TODO(voz): estos mensajes no se persisten en el backend ni pasan
  // por el clasificador de crisis; solo existen en el cliente.
  const appendLocal = useCallback((message: ChatMessage) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const sendVoiceTranscript = useCallback(
    async (transcript: string) => {
      const trimmed = transcript.trim();
      if (!trimmed || sending || !sessionId || !accessToken) return;

      setError(null);
      setSending(true);
      setAudioSrc(null);
      setMessages((prev) => [...prev, { role: 'user' as const, content: trimmed }]);

      try {
        const { transcript: normalizedTranscript } = await transcribeVoice(
          accessToken,
          sessionId,
          trimmed,
        );
        const reply = await replyToVoice(accessToken, sessionId, normalizedTranscript);
        setMessages((prev) => [...prev, { role: 'assistant' as const, content: reply.text }]);
        if (reply.crisis) reportCrisis(reply.crisis);
        if (reply.audio) {
          setAudioSrc(`data:${reply.audio.mimeType};base64,${reply.audio.audioBase64}`);
        } else if (!reply.crisis) {
          setError(
            reply.voiceConfigured
              ? 'La respuesta está disponible en texto, pero no se pudo generar el audio.'
              : 'La respuesta está disponible en texto; ElevenLabs no está configurado en el servidor.',
          );
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'No se pudo procesar la voz.');
      } finally {
        setSending(false);
      }
    },
    [accessToken, reportCrisis, sending, sessionId],
  );

  return { messages, sending, error, audioSrc, send, appendLocal, sendVoiceTranscript };
}
