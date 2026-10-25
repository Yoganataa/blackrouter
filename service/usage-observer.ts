import { Transform } from 'node:stream';
import { StringDecoder } from 'node:string_decoder';

export type TokenUsage = {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
};

type JsonObject = Record<string, unknown>;

const objectOf = (value: unknown): JsonObject | null =>
  value !== null && typeof value === 'object' && !Array.isArray(value)
    ? value as JsonObject
    : null;

const tokenCount = (value: unknown): number | undefined =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0
    ? Math.floor(value)
    : undefined;

/** Reads common OpenAI, Responses, and Anthropic token-usage field names. */
export const extractTokenUsage = (payload: unknown): TokenUsage | null => {
  const root = objectOf(payload);
  if (!root) return null;
  const response = objectOf(root.response);
  const message = objectOf(root.message);
  const usage = objectOf(root.usage)
    ?? objectOf(response?.usage)
    ?? objectOf(message?.usage);
  if (!usage) return null;

  const inputTokens = tokenCount(usage.prompt_tokens) ?? tokenCount(usage.input_tokens);
  const outputTokens = tokenCount(usage.completion_tokens) ?? tokenCount(usage.output_tokens);
  const totalTokens = tokenCount(usage.total_tokens)
    ?? (inputTokens !== undefined && outputTokens !== undefined ? inputTokens + outputTokens : undefined);
  if (inputTokens === undefined && outputTokens === undefined && totalTokens === undefined) return null;

  return {
    ...(inputTokens !== undefined ? { inputTokens } : {}),
    ...(outputTokens !== undefined ? { outputTokens } : {}),
    ...(totalTokens !== undefined ? { totalTokens } : {}),
  };
};

const inspectSseFrame = (frame: string, onUsage: (usage: TokenUsage) => void): void => {
  const data: string[] = [];
  for (const line of frame.split(/\r?\n/)) {
    if (line.startsWith('data:')) data.push(line.slice(5).trimStart());
  }
  if (!data.length) return;
  const raw = data.join('\n').trim();
  if (!raw || raw === '[DONE]') return;
  try {
    const payload: unknown = JSON.parse(raw);
    const usage = extractTokenUsage(payload);
    if (usage) onUsage(usage);
  } catch {
    // Non-JSON SSE frames pass through untouched.
  }
};

/**
 * A pass-through transform that observes usage-bearing SSE frames without
 * buffering or modifying the content sent to the client.
 */
export const createUsageObserver = (
  onUsage: (usage: TokenUsage) => void,
): Transform => {
  const decoder = new StringDecoder('utf8');
  let buffer = '';

  const inspect = (text: string): void => {
    buffer += text;
    let match = /\r?\n\r?\n/.exec(buffer);
    while (match && match.index !== undefined) {
      const frame = buffer.slice(0, match.index);
      buffer = buffer.slice(match.index + match[0].length);
      inspectSseFrame(frame, (usage) => {
        try { onUsage(usage); } catch { /* Observability must not break responses. */ }
      });
      match = /\r?\n\r?\n/.exec(buffer);
    }
    if (buffer.length > 1024 * 1024) {
      // Malformed/very large frames must not create unbounded observer memory.
      buffer = buffer.slice(-64 * 1024);
    }
  };

  return new Transform({
    transform(chunk: Buffer | string, _encoding, callback) {
      try {
        const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        inspect(decoder.write(bytes));
        this.push(bytes);
        callback();
      } catch (error) {
        callback(error instanceof Error ? error : new Error(String(error)));
      }
    },
    flush(callback) {
      try {
        inspect(decoder.end());
        if (buffer.trim()) {
          inspectSseFrame(buffer, (usage) => {
            try { onUsage(usage); } catch { /* Observability must not break responses. */ }
          });
        }
        callback();
      } catch (error) {
        callback(error instanceof Error ? error : new Error(String(error)));
      }
    },
  });
};
