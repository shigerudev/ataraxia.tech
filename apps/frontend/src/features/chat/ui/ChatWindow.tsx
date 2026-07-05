import { FormEvent, useEffect, useRef, useState } from 'react';
import { BrandMark, IconLock, IconSend } from '@/shared/ui';
import { useTherapyFlow } from '@/features/session';
import { useChat } from '../model/useChat';

function AssistantAvatar({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const dims = size === 'md' ? 'h-10 w-10' : 'h-7 w-7';
  const mark = size === 'md' ? 'h-5 w-5' : 'h-3.5 w-3.5';
  return (
    <span className={`relative grid shrink-0 place-items-center rounded-full bg-navy text-white ${dims}`} aria-hidden="true">
      <BrandMark className={mark} />
      {size === 'md' && (
        <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green" />
      )}
    </span>
  );
}

export function ChatWindow() {
  const { goToRegistration } = useTherapyFlow();
  const { messages, sending, error, send } = useChat();
  const [draft, setDraft] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const canSend = draft.trim().length > 0 && !sending;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!canSend) return;
    const value = draft;
    setDraft('');
    await send(value);
  }

  return (
    <div className="card flex min-h-[520px] flex-1 flex-col overflow-hidden p-0 sm:p-0">
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
        <button type="button" className="btn--light px-4 py-2 text-sm" onClick={goToRegistration}>
          Finalizar sesión
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
          return (
            <div key={i} className={`flex items-end gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}>
              {!isUser && <AssistantAvatar size="sm" />}
              <div
                className={`max-w-[82%] rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${
                  isUser
                    ? 'rounded-br-md bg-navy text-white'
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
                  msg.content
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
          className="max-h-36 flex-1 resize-none rounded-md2 border border-hairline px-4 py-2.5 text-[15px] text-ink transition placeholder:text-muted/60 focus:border-navy focus:outline-none focus:ring-4 focus:ring-navy/10"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              void handleSubmit(e);
            }
          }}
        />
        <button
          type="submit"
          disabled={!canSend}
          aria-label="Enviar mensaje"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-navy text-white transition hover:bg-navy-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-navy/25 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <IconSend className="h-[18px] w-[18px] -translate-x-px" />
        </button>
      </form>

      <p className="bg-white px-6 pb-3 text-center text-xs text-muted">
        Si estás en una emergencia, contacta de inmediato a los servicios de
        emergencia de tu localidad.
      </p>
    </div>
  );
}
