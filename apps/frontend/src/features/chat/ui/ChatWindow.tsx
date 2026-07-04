import { FormEvent, useEffect, useRef, useState } from 'react';
import { Button } from '@/shared/ui';
import { useTherapyFlow } from '@/features/session';
import { useChat } from '../model/useChat';
import './ChatWindow.css';

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
    <div className="chat">
      <header className="chat__header">
        <div>
          <span className="chat__brand">Ataraxia</span>
          <span className="chat__status">Conversación confidencial</span>
        </div>
        <button type="button" className="chat__finish" onClick={goToRegistration}>
          Finalizar sesión
        </button>
      </header>

      <div className="chat__messages" ref={scrollRef}>
        {messages.map((msg, i) => (
          <div key={i} className={`chat__bubble chat__bubble--${msg.role}`}>
            {msg.content || (msg.role === 'assistant' && sending ? '…' : '')}
          </div>
        ))}
      </div>

      {error && (
        <p className="chat__error" role="alert">
          {error}
        </p>
      )}

      <form className="chat__composer" onSubmit={handleSubmit}>
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Escribe cómo te sientes…"
          rows={2}
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
