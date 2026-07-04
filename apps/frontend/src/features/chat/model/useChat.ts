import { useCallback, useRef, useState } from 'react';
import { streamAssistantMessage } from '@/shared/api';
import { useTherapyFlow } from '@/features/session';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const GREETING: ChatMessage = {
  role: 'assistant',
  content:
    'Hola, soy Ataraxia. Este es un espacio seguro y confidencial para acompañarte. ' +
    'Cuéntame, ¿cómo te sientes hoy y qué te trae por aquí?',
};

export function useChat() {
  const { sessionId, accessToken, reportCrisis } = useTherapyFlow();
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  return { messages, sending, error, send };
}
