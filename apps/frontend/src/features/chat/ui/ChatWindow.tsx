import { FormEvent, useEffect, useRef, useState } from 'react';
import { Button } from '@/shared/ui';
import { useTherapyFlow } from '@/features/session';
import { useChat } from '../model/useChat';

export function ChatWindow() {
  const { goToRegistration } = useTherapyFlow();
  const { messages, sending, error, send } = useChat();
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const value = draft;
    setDraft('');
    await send(value);
  }

  return (
    <div className="card p-0 overflow-hidden flex flex-col h-[70vh] min-h-[520px]">
      <header className="flex items-center justify-between px-6 py-4 border-b border-hairline">
        <div className="flex flex-col">
          <span className="font-display font-bold text-navy leading-tight">Ataraxia</span>
          <span className="text-xs text-muted">Conversación confidencial</span>
        </div>
        <button
          type="button"
          className="btn--light text-sm px-4 py-2"
          onClick={goToRegistration}
        >
          Finalizar sesión
        </button>
      </header>

      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3 bg-bg" ref={scrollRef}>
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`w-fit max-w-[82%] px-4 py-3 rounded-2xl text-[15px] leading-relaxed ${
              msg.role === 'user'
                ? 'ml-auto bg-navy text-white rounded-br-md'
                : 'mr-auto bg-white border border-hairline text-ink rounded-bl-md'
            }`}
          >
            {msg.content || (msg.role === 'assistant' && sending ? '…' : '')}
          </div>
        ))}
      </div>

      {error && (
        <p className="px-6 pt-3 text-pink font-medium text-sm" role="alert">
          {error}
        </p>
      )}

      <form
        className="flex items-end gap-3 px-6 py-4 border-t border-hairline bg-white"
        onSubmit={handleSubmit}
      >
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Escribe cómo te sientes…"
          rows={2}
          className="flex-1 resize-none border border-hairline rounded-md2 px-4 py-2.5 text-ink placeholder:text-muted/60 transition focus:outline-none focus:border-navy"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void handleSubmit(e);
            }
          }}
        />
        <Button type="submit" loading={sending} disabled={!draft.trim()}>
          Enviar
        </Button>
      </form>
    </div>
  );
}
