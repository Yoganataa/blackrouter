import type { JsonValue } from '../json.ts';
import { isJsonObject, type JsonObject } from './json.ts';

/**
 * Turn the upstream's event stream into one chat completion.
 *
 * The free tier only answers with a stream, so a client that asked for a
 * single JSON answer gets the stream read here and folded into the shape it
 * expects. Tool calls arrive in pieces and are joined by their index.
 */
const chunkOf = (line: string): JsonObject | null => {
  const trimmed = line.trim();
  if (!trimmed.startsWith('data:')) return null;
  const payload = trimmed.slice('data:'.length).trim();
  if (!payload || payload === '[DONE]') return null;
  try {
    const parsed: JsonValue = JSON.parse(payload);
    return isJsonObject(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

type ToolCall = { id: string; name: string; arguments: string };

export const aggregateStream = (text: string): JsonObject => {
  let id = '';
  let model = '';
  let created = 0;
  let content = '';
  let reasoning = '';
  let finish: string | null = null;
  let usage: JsonObject | null = null;
  const toolCalls = new Map<number, ToolCall>();

  for (const line of text.split('\n')) {
    const chunk = chunkOf(line);
    if (!chunk) continue;
    if (isJsonObject(chunk.error)) return chunk;
    if (typeof chunk.id === 'string') id = chunk.id;
    if (typeof chunk.model === 'string') model = chunk.model;
    if (typeof chunk.created === 'number') created = chunk.created;
    if (isJsonObject(chunk.usage)) usage = chunk.usage;

    const choices = Array.isArray(chunk.choices) ? chunk.choices : [];
    const choice = choices.find(isJsonObject);
    if (!choice) continue;
    if (typeof choice.finish_reason === 'string') finish = choice.finish_reason;
    const delta = isJsonObject(choice.delta) ? choice.delta : null;
    if (!delta) continue;

    if (typeof delta.content === 'string') content += delta.content;
    if (typeof delta.reasoning_content === 'string') reasoning += delta.reasoning_content;

    const calls = Array.isArray(delta.tool_calls) ? delta.tool_calls : [];
    for (const raw of calls) {
      if (!isJsonObject(raw)) continue;
      const index = typeof raw.index === 'number' ? raw.index : 0;
      const fn = isJsonObject(raw.function) ? raw.function : null;
      const current = toolCalls.get(index) ?? { id: '', name: '', arguments: '' };
      if (typeof raw.id === 'string' && raw.id) current.id = raw.id;
      if (fn && typeof fn.name === 'string' && fn.name) current.name = fn.name;
      if (fn && typeof fn.arguments === 'string') current.arguments += fn.arguments;
      toolCalls.set(index, current);
    }
  }

  const message: JsonObject = { role: 'assistant', content };
  if (reasoning) message.reasoning_content = reasoning;
  if (toolCalls.size > 0) {
    message.tool_calls = [...toolCalls.entries()]
      .sort(([left], [right]) => left - right)
      .map(([index, call]) => ({
        id: call.id || `call_${index}`,
        type: 'function',
        function: { name: call.name, arguments: call.arguments || '{}' },
      }));
  }

  const answer: JsonObject = {
    id: id || `chatcmpl-blackrouter-${Date.now()}`,
    object: 'chat.completion',
    created: created || Math.floor(Date.now() / 1000),
    model,
    choices: [{ index: 0, message, finish_reason: finish ?? (toolCalls.size > 0 ? 'tool_calls' : 'stop') }],
  };
  if (usage) {
    answer.usage = usage;
    // `stream_options` is a streaming-only field; an OpenAI client ignores it
    // on a completion, but keeping the shape clean is cheaper than explaining it.
    delete answer.usage.completion_tokens_details;
  }
  return answer;
};
