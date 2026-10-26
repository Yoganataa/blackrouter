import { Transform } from 'node:stream';
import { StringDecoder } from 'node:string_decoder';
// @ts-ignore - native helper copied from the upstream provider core.
import { restoreToolNames } from './core/utils/opencodeFingerprint.js';

export type OpenCodeLane = 'chat' | 'responses' | 'messages';
type AnyObject = Record<string, any>;
type SseFrame = { event: string; data: string };

// This adapter only translates provider response streams back to OpenAI chat SSE.
// Request body translation is handled by the native provider executor/translator.
const cleanModelId = (modelId: string): string => {
  const clean = modelId.replace(/\([^()]+\)\s*$/, '').trim();
  return clean.startsWith('blackrouter/') ? clean.slice('blackrouter/'.length) : clean;
};

const parseFrame = (frame: string): SseFrame | null => {
  const lines = frame.split(/\r?\n/);
  let event = '';
  const data: string[] = [];
  for (const line of lines) {
    if (!line || line.startsWith(':')) continue;
    if (line.startsWith('event:')) event = line.slice(6).trim();
    else if (line.startsWith('data:')) data.push(line.slice(5).trimStart());
  }
  if (!data.length) return null;
  return { event, data: data.join('\n') };
};

export const createToolNameRestoreTransform = (
  toolNameMap?: Map<string, string> | null,
): Transform | null => {
  if (!toolNameMap?.size) return null;

  const decoder = new StringDecoder('utf8');
  let buffer = '';
  const stream = new Transform({
    transform(chunk: Buffer | string, _encoding, callback) {
      try {
        buffer += typeof chunk === 'string' ? chunk : decoder.write(chunk);
        let separator = /\r?\n\r?\n/.exec(buffer);
        while (separator && separator.index !== undefined) {
          const frame = buffer.slice(0, separator.index);
          buffer = buffer.slice(separator.index + separator[0].length);
          processFrame(frame);
          separator = /\r?\n\r?\n/.exec(buffer);
        }
        callback();
      } catch (error) {
        callback(error instanceof Error ? error : new Error(String(error)));
      }
    },
    flush(callback) {
      try {
        buffer += decoder.end();
        if (buffer.trim()) processFrame(buffer);
        callback();
      } catch (error) {
        callback(error instanceof Error ? error : new Error(String(error)));
      }
    },
  });

  const processFrame = (rawFrame: string): void => {
    const frame = parseFrame(rawFrame);
    if (!frame || frame.data === '[DONE]') {
      stream.push(Buffer.from(rawFrame + '\n\n'));
      return;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(frame.data);
    } catch {
      stream.push(Buffer.from(rawFrame + '\n\n'));
      return;
    }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      stream.push(Buffer.from(rawFrame + '\n\n'));
      return;
    }
    const restored = restoreToolNames(parsed as AnyObject, toolNameMap);
    const eventLine = frame.event ? `event: ${frame.event}\n` : '';
    stream.push(Buffer.from(`${eventLine}data: ${JSON.stringify(restored)}\n\n`));
  };

  return stream;
};

const responseErrorMessage = (payload: AnyObject): string => {
  const response = payload.response && typeof payload.response === 'object' ? payload.response as AnyObject : {};
  const error = payload.error && typeof payload.error === 'object'
    ? payload.error as AnyObject
    : response.error && typeof response.error === 'object'
      ? response.error as AnyObject
      : payload;
  return typeof error.message === 'string' ? error.message : JSON.stringify(error);
};

export const createOpenCodeResponseTransform = (lane: OpenCodeLane, requestedModel: string, toolNameMap?: Map<string, string> | null): Transform | null => {
  if (lane === 'chat') return null;

  const decoder = new StringDecoder('utf8');
  let buffer = '';
  let responseId = `chatcmpl-blackrouter-${Date.now()}`;
  const model = cleanModelId(requestedModel);
  const created = Math.floor(Date.now() / 1000);
  let outputTokens = 0;
  let inputTokens = 0;
  let finishReason = 'stop';
  let finished = false;
  let sawToolCall = false;

  const responseToolIndices = new Map<string, number>();
  const responseToolIds = new Map<string, string>();
  const responseToolArgs = new Map<number, string>();
  const responseToolArgsDeltaSeen = new Set<number>();
  let responseToolCount = 0;

  const messageToolIndices = new Map<number, number>();
  const messageToolIds = new Map<number, string>();
  const messageToolNames = new Map<number, string>();
  const messageToolArgsDeltaSeen = new Set<number>();
  let messageToolCount = 0;
  let messageStopReason = 'end_turn';

  const emitData = (payload: AnyObject): void => {
    const restored = toolNameMap?.size ? restoreToolNames(payload, toolNameMap) : payload;
    stream.push(Buffer.from(`data: ${JSON.stringify(restored)}\n\n`));
  };
  const emitChunk = (delta: AnyObject, finish: string | null = null, usage?: AnyObject): void => {
    const chunk: AnyObject = {
      id: responseId,
      object: 'chat.completion.chunk',
      created,
      model,
      choices: [{ index: 0, delta, finish_reason: finish }],
    };
    if (usage) chunk.usage = usage;
    emitData(chunk);
  };
  const emitToolStart = (index: number, id: string, name: string): void => {
    sawToolCall = true;
    emitChunk({ tool_calls: [{ index, id, type: 'function', function: { name, arguments: '' } }] });
  };
  const emitError = (payload: AnyObject): void => {
    if (finished) return;
    emitData({ error: { type: 'upstream_error', message: responseErrorMessage(payload) } });
    emitData({ choices: [{ index: 0, delta: {}, finish_reason: 'stop' }] });
    stream.push(Buffer.from('data: [DONE]\n\n'));
    finished = true;
  };
  const emitFinish = (reason: string, usage?: AnyObject): void => {
    if (finished) return;
    const normalizedReason = sawToolCall ? 'tool_calls' : reason;
    const finalUsage = usage ?? (inputTokens || outputTokens ? {
      prompt_tokens: inputTokens,
      completion_tokens: outputTokens,
      total_tokens: inputTokens + outputTokens,
    } : undefined);
    emitChunk({}, normalizedReason, finalUsage);
    stream.push(Buffer.from('data: [DONE]\n\n'));
    finished = true;
  };

  const processResponsesEvent = (event: string, payload: AnyObject): void => {
    const type = event || (typeof payload.type === 'string' ? payload.type : '');
    if (type === 'response.created' || type === 'response.in_progress') {
      const responseObject = payload.response && typeof payload.response === 'object' ? payload.response as AnyObject : {};
      if (typeof responseObject.id === 'string') responseId = responseObject.id;
      if (typeof responseObject.model === 'string') responseId = responseObject.id || responseId;
      return;
    }
    if (type === 'response.output_text.delta' || type === 'response.text.delta') {
      if (typeof payload.delta === 'string' && payload.delta) emitChunk({ content: payload.delta });
      return;
    }
    if (type === 'response.reasoning_summary_text.delta' || type === 'response.reasoning_text.delta' || type === 'response.thought.delta') {
      if (typeof payload.delta === 'string' && payload.delta) emitChunk({ reasoning_content: payload.delta });
      return;
    }
    if (type === 'response.refusal.delta') {
      if (typeof payload.delta === 'string' && payload.delta) emitChunk({ content: payload.delta });
      return;
    }
    if (type === 'response.output_item.added') {
      const item = payload.item && typeof payload.item === 'object' ? payload.item as AnyObject : null;
      if (!item || (item.type !== 'function_call' && item.type !== 'custom_tool_call')) return;
      const callId = (typeof item.call_id === 'string' && item.call_id) || (typeof item.id === 'string' && item.id) || `call_${responseToolCount}`;
      const itemId = typeof payload.item_id === 'string' ? payload.item_id : (typeof item.id === 'string' ? item.id : callId);
      let index = responseToolIndices.get(itemId) ?? responseToolIndices.get(callId);
      if (index === undefined) {
        index = responseToolCount++;
        responseToolIndices.set(itemId, index);
        responseToolIndices.set(callId, index);
      }
      responseToolIds.set(itemId, callId);
      responseToolIds.set(callId, callId);
      const name = typeof item.name === 'string' ? item.name : '';
      if (name) emitToolStart(index, callId, name);
      const args = typeof item.arguments === 'string' ? item.arguments : '';
      if (args) responseToolArgs.set(index, args);
      return;
    }
    if (type === 'response.function_call_arguments.delta' || type === 'response.custom_tool_call_input.delta') {
      const itemId = typeof payload.item_id === 'string' ? payload.item_id : '';
      const rawCallId = typeof payload.call_id === 'string' ? payload.call_id : '';
      let index = responseToolIndices.get(itemId);
      if (index === undefined && rawCallId) index = responseToolIndices.get(rawCallId);
      if (index === undefined) {
        index = responseToolCount++;
        const key = itemId || rawCallId || `call_${index}`;
        const callId = rawCallId || key;
        responseToolIndices.set(key, index);
        responseToolIndices.set(callId, index);
        responseToolIds.set(key, callId);
        responseToolIds.set(callId, callId);
        emitToolStart(index, callId, typeof payload.name === 'string' ? payload.name : '');
      }
      const callId = responseToolIds.get(itemId) || responseToolIds.get(rawCallId) || rawCallId || `call_${index}`;
      const delta = typeof payload.delta === 'string' ? payload.delta : '';
      if (delta) {
        responseToolArgsDeltaSeen.add(index);
        responseToolArgs.set(index, (responseToolArgs.get(index) ?? '') + delta);
        emitChunk({ tool_calls: [{ index, id: callId, type: 'function', function: { arguments: delta } }] });
      }
      return;
    }
    if (type === 'response.output_item.done') {
      const item = payload.item && typeof payload.item === 'object' ? payload.item as AnyObject : null;
      if (item && (item.type === 'function_call' || item.type === 'custom_tool_call')) {
        const itemId = typeof payload.item_id === 'string' ? payload.item_id : (typeof item.id === 'string' ? item.id : '');
        const callId = typeof item.call_id === 'string' ? item.call_id : itemId;
        const index = responseToolIndices.get(itemId) ?? responseToolIndices.get(callId);
        const args = typeof item.arguments === 'string' ? item.arguments : (index === undefined ? '' : responseToolArgs.get(index) ?? '');
        if (index !== undefined && args && !responseToolArgsDeltaSeen.has(index)) {
          responseToolArgsDeltaSeen.add(index);
          responseToolArgs.set(index, args);
          emitChunk({ tool_calls: [{ index, id: callId, type: 'function', function: { arguments: args } }] });
        }
      }
      return;
    }
    if (type === 'response.completed') {
      const responseObject = payload.response && typeof payload.response === 'object' ? payload.response as AnyObject : {};
      const usage = responseObject.usage && typeof responseObject.usage === 'object' ? responseObject.usage as AnyObject : {};
      inputTokens = Number(usage.input_tokens) || 0;
      outputTokens = Number(usage.output_tokens) || 0;
      const output = Array.isArray(responseObject.output) ? responseObject.output as AnyObject[] : [];
      if (output.some((item) => item && (item.type === 'function_call' || item.type === 'custom_tool_call'))) sawToolCall = true;
      emitFinish('stop', inputTokens || outputTokens ? { prompt_tokens: inputTokens, completion_tokens: outputTokens, total_tokens: Number(usage.total_tokens) || inputTokens + outputTokens } : undefined);
      return;
    }
    if (type === 'response.incomplete') {
      emitFinish('length');
      return;
    }
    if (type === 'response.failed' || type === 'error') {
      emitError(payload);
    }
  };

  const processMessagesEvent = (event: string, payload: AnyObject): void => {
    const type = event || (typeof payload.type === 'string' ? payload.type : '');
    if (type === 'message_start') {
      const message = payload.message && typeof payload.message === 'object' ? payload.message as AnyObject : {};
      if (typeof message.id === 'string') responseId = message.id;
      const usage = message.usage && typeof message.usage === 'object' ? message.usage as AnyObject : {};
      inputTokens = Number(usage.input_tokens) || 0;
      return;
    }
    if (type === 'content_block_start') {
      const block = payload.content_block && typeof payload.content_block === 'object' ? payload.content_block as AnyObject : {};
      const index = Number(payload.index) || 0;
      if (block.type === 'text' && typeof block.text === 'string' && block.text) {
        emitChunk({ content: block.text });
      } else if (block.type === 'thinking' && typeof block.thinking === 'string' && block.thinking) {
        emitChunk({ reasoning_content: block.thinking });
      } else if (block.type === 'tool_use') {
        let toolIndex = messageToolIndices.get(index);
        if (toolIndex === undefined) {
          toolIndex = messageToolCount++;
          messageToolIndices.set(index, toolIndex);
        }
        const id = typeof block.id === 'string' && block.id ? block.id : `call_${toolIndex}`;
        const name = typeof block.name === 'string' ? block.name : '';
        messageToolIds.set(index, id);
        messageToolNames.set(index, name);
        emitToolStart(toolIndex, id, name);
        const args = block.input && typeof block.input === 'object' && Object.keys(block.input).length ? JSON.stringify(block.input) : '';
        if (args) {
          messageToolArgsDeltaSeen.add(index);
          emitChunk({ tool_calls: [{ index: toolIndex, id, type: 'function', function: { arguments: args } }] });
        }
      }
      return;
    }
    if (type === 'content_block_delta') {
      const index = Number(payload.index) || 0;
      const delta = payload.delta && typeof payload.delta === 'object' ? payload.delta as AnyObject : {};
      if (delta.type === 'text_delta' && typeof delta.text === 'string' && delta.text) emitChunk({ content: delta.text });
      else if ((delta.type === 'thinking_delta' || delta.type === 'redacted_thinking_delta') && typeof delta.thinking === 'string' && delta.thinking) emitChunk({ reasoning_content: delta.thinking });
      else if (delta.type === 'input_json_delta' && typeof delta.partial_json === 'string' && delta.partial_json) {
        const toolIndex = messageToolIndices.get(index);
        const id = messageToolIds.get(index) || `call_${toolIndex ?? index}`;
        if (toolIndex !== undefined) {
          messageToolArgsDeltaSeen.add(index);
          emitChunk({ tool_calls: [{ index: toolIndex, id, type: 'function', function: { arguments: delta.partial_json } }] });
        }
      }
      return;
    }
    if (type === 'message_delta') {
      const delta = payload.delta && typeof payload.delta === 'object' ? payload.delta as AnyObject : {};
      if (typeof delta.stop_reason === 'string') messageStopReason = delta.stop_reason;
      const usage = payload.usage && typeof payload.usage === 'object' ? payload.usage as AnyObject : {};
      outputTokens = Number(usage.output_tokens) || outputTokens;
      return;
    }
    if (type === 'message_stop') {
      const reason = messageStopReason === 'tool_use' ? 'tool_calls' : messageStopReason === 'max_tokens' ? 'length' : 'stop';
      emitFinish(reason, inputTokens || outputTokens ? { prompt_tokens: inputTokens, completion_tokens: outputTokens, total_tokens: inputTokens + outputTokens } : undefined);
      return;
    }
    if (type === 'error') emitError(payload);
  };

  const processFrame = (rawFrame: string): void => {
    const frame = parseFrame(rawFrame);
    if (!frame || frame.data === '[DONE]') {
      if (frame?.data === '[DONE]') emitFinish(finishReason);
      return;
    }
    let parsed: unknown;
    try { parsed = JSON.parse(frame.data); } catch { return; }
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return;
    const payload = parsed as AnyObject;
    if (payload.error && typeof payload.error === 'object') {
      emitError(payload);
      return;
    }
    if (lane === 'responses') processResponsesEvent(frame.event, payload);
    else processMessagesEvent(frame.event, payload);
  };

  const stream = new Transform({
    transform(chunk: Buffer | string, _encoding, callback) {
      try {
        buffer += typeof chunk === 'string' ? chunk : decoder.write(chunk);
        let separator = /\r?\n\r?\n/.exec(buffer);
        while (separator && separator.index !== undefined) {
          const frame = buffer.slice(0, separator.index);
          buffer = buffer.slice(separator.index + separator[0].length);
          processFrame(frame);
          separator = /\r?\n\r?\n/.exec(buffer);
        }
        callback();
      } catch (error) {
        callback(error instanceof Error ? error : new Error(String(error)));
      }
    },
    flush(callback) {
      try {
        buffer += decoder.end();
        if (buffer.trim()) processFrame(buffer);
        if (!finished) emitFinish(finishReason);
        callback();
      } catch (error) {
        callback(error instanceof Error ? error : new Error(String(error)));
      }
    },
  });

  return stream;
};
