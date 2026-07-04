import { apiUrl } from './helpers';

export interface CrisisInfo {
  message: string;
  hotlines: { name: string; phone: string }[];
}

export interface StreamHandlers {
  onToken?: (value: string) => void;
  onCrisis?: (crisis: CrisisInfo) => void;
  onDone?: () => void;
  onError?: (message: string) => void;
}

interface ParsedEvent {
  event: string;
  data: string;
}

function parseChunk(raw: string): ParsedEvent | null {
  let event = 'message';
  const dataLines: string[] = [];
  for (const line of raw.split('\n')) {
    if (line.startsWith('event:')) event = line.slice(6).trim();
    else if (line.startsWith('data:')) dataLines.push(line.slice(5).trim());
  }
  if (dataLines.length === 0) return null;
  return { event, data: dataLines.join('\n') };
}

/**
 * Envía un mensaje del usuario y consume la respuesta SSE del backend
 * (tokens en streaming, evento de crisis o error).
 */
export async function streamAssistantMessage(
  sessionId: string,
  accessToken: string,
  content: string,
  handlers: StreamHandlers,
): Promise<void> {
  const response = await fetch(apiUrl(`/api/sessions/${sessionId}/messages`), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ content }),
  });

  if (!response.ok || !response.body) {
    handlers.onError?.('No se pudo conectar con el asistente.');
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const parts = buffer.split('\n\n');
    buffer = parts.pop() ?? '';

    for (const part of parts) {
      const parsed = parseChunk(part);
      if (!parsed) continue;

      if (parsed.event === 'token') {
        const payload = JSON.parse(parsed.data) as { value: string };
        handlers.onToken?.(payload.value);
      } else if (parsed.event === 'crisis') {
        handlers.onCrisis?.(JSON.parse(parsed.data) as CrisisInfo);
      } else if (parsed.event === 'done') {
        handlers.onDone?.();
      } else if (parsed.event === 'error') {
        const payload = JSON.parse(parsed.data) as { error: string };
        handlers.onError?.(payload.error);
      }
    }
  }

  handlers.onDone?.();
}
