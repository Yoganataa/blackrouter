import { Transform } from 'node:stream';
import { StringDecoder } from 'node:string_decoder';

const cleanModelId = (modelId) => {
  let clean = String(modelId || '').replace(/\([^()]+\)\s*$/, '').trim();
  if (clean.includes('/')) clean = clean.split('/').pop() || clean;
  return clean;
};

export const resolveOpenCodeLane = (upstream, modelId) => {
  let host = '';
  try { host = new URL(upstream).hostname.toLowerCase(); } catch { return 'chat'; }
  if (!host.includes('opencode.ai')) return 'chat';
  const base = cleanModelId(modelId).toLowerCase();
  if (/^muse[-_]?spark(?:$|[-_:.\s])/.test(base)) return 'responses';
  if (/^union[-_]?alpha(?:$|[-_:.\s])/.test(base)) return 'messages';
  return 'chat';
};

const asObject = (value) => value && typeof value === 'object' && !Array.isArray(value) ? value : {};
const parseArgs = (value) => {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value;
  if (typeof value === 'string') {
    try { return asObject(JSON.parse(value)); } catch { return {}; }
  }
  return {};
};
const textOf = (value) => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) return value.map((v) => {
    const item = asObject(v);
    return typeof item.text === 'string' ? item.text : typeof item.content === 'string' ? item.content : '';
  }).join('');
  if (value == null) return '';
  try { return JSON.stringify(value); } catch { return String(value); }
};
const maxTokensFrom = (body) => {
  for (const key of ['max_output_tokens', 'max_completion_tokens', 'max_tokens']) {
    const value = body[key];
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) return Math.max(16, Math.floor(value));
  }
  return undefined;
};
const contentBlocks = (value, role) => {
  if (typeof value === 'string') return value ? [{ type: role === 'assistant' ? 'output_text' : 'input_text', text: value }] : [];
  if (!Array.isArray(value)) return [];
  const blocks = [];
  for (const partValue of value) {
    const part = asObject(partValue);
    if (part.type === 'text' && typeof part.text === 'string') {
      blocks.push({ type: role === 'assistant' ? 'output_text' : 'input_text', text: part.text });
    } else if (role === 'user' && part.type === 'image_url') {
      const url = typeof part.image_url === 'string' ? part.image_url : part.image_url?.url;
      if (typeof url === 'string' && url) blocks.push({ type: 'input_image', image_url: url, detail: part.image_url?.detail || 'auto' });
    } else if (role === 'user' && ['input_image', 'image'].includes(part.type)) {
      const url = part.image_url || part.url || part.file_id;
      if (typeof url === 'string' && url) blocks.push({ type: 'input_image', image_url: url, detail: part.detail || 'auto' });
    }
  }
  return blocks;
};
const responsesToolChoice = (choice) => {
  if (typeof choice === 'string') return choice;
  const value = asObject(choice);
  if (value.type === 'function' && value.function?.name) return { type: 'function', name: value.function.name };
  return choice && typeof choice === 'object' ? value : undefined;
};
const responseText = (responseFormat) => {
  const value = asObject(responseFormat);
  if (value.type === 'json_object') return { type: 'json_object' };
  if (value.type === 'json_schema') {
    const schema = asObject(value.json_schema);
    if (!schema.schema) return undefined;
    return {
      type: 'json_schema',
      name: typeof schema.name === 'string' && schema.name ? schema.name : 'response',
      schema: schema.schema,
      ...(typeof schema.strict === 'boolean' ? { strict: schema.strict } : {}),
    };
  }
  return undefined;
};
const chatToResponses = (body) => {
  const input = [];
  const instructions = typeof body.instructions === 'string' ? [body.instructions] : [];
  const pendingCallIds = [];
  for (const messageValue of Array.isArray(body.messages) ? body.messages : []) {
    const message = asObject(messageValue);
    const role = typeof message.role === 'string' ? message.role : 'user';
    if (role === 'system' || role === 'developer') {
      const text = textOf(message.content);
      if (text.trim()) instructions.push(text);
      continue;
    }
    if (role === 'tool' || role === 'function') {
      const supplied = typeof message.tool_call_id === 'string' ? message.tool_call_id : '';
      let callId = supplied;
      if (callId) {
        const index = pendingCallIds.indexOf(callId);
        if (index >= 0) pendingCallIds.splice(index, 1);
      } else if (pendingCallIds.length) callId = pendingCallIds.shift();
      else callId = `call_tool_${input.length}`;
      input.push({ type: 'function_call_output', call_id: callId.slice(0, 64), output: textOf(message.content) });
      continue;
    }
    if (role === 'user' || role === 'assistant') {
      const content = contentBlocks(message.content, role);
      if (content.length) input.push({ type: 'message', role, content });
    }
    if (role === 'assistant' && Array.isArray(message.tool_calls)) {
      for (const callValue of message.tool_calls) {
        const call = asObject(callValue);
        const fn = asObject(call.function);
        if (typeof fn.name !== 'string' || !fn.name.trim()) continue;
        const callId = (typeof call.id === 'string' && call.id ? call.id : `call_${input.length}`).slice(0, 64);
        pendingCallIds.push(callId);
        input.push({
          type: 'function_call',
          call_id: callId,
          name: fn.name,
          arguments: typeof fn.arguments === 'string' ? fn.arguments : JSON.stringify(fn.arguments ?? {}),
        });
      }
    }
  }
  if (!input.length) input.push({ type: 'message', role: 'user', content: [{ type: 'input_text', text: '...' }] });
  const result = { model: cleanModelId(body.model), input, stream: true, store: false };
  if (instructions.length) result.instructions = instructions.join('\n\n');
  const maxTokens = maxTokensFrom(body);
  if (maxTokens !== undefined) result.max_output_tokens = maxTokens;
  for (const key of ['temperature', 'top_p', 'parallel_tool_calls', 'metadata', 'include']) {
    if (body[key] !== undefined) result[key] = body[key];
  }
  if (body.reasoning && typeof body.reasoning === 'object') result.reasoning = body.reasoning;
  else if (typeof body.reasoning_effort === 'string' && body.reasoning_effort !== 'auto') {
    result.reasoning = { effort: body.reasoning_effort === 'max' ? 'xhigh' : body.reasoning_effort, summary: 'auto' };
  }
  const tools = [];
  for (const toolValue of Array.isArray(body.tools) ? body.tools : []) {
    const tool = asObject(toolValue);
    const fn = asObject(tool.function || tool);
    if (typeof fn.name !== 'string' || !fn.name) continue;
    tools.push({
      type: 'function',
      name: fn.name,
      ...(typeof fn.description === 'string' ? { description: fn.description } : {}),
      parameters: asObject(fn.parameters).type ? fn.parameters : { type: 'object', properties: {} },
      ...(typeof fn.strict === 'boolean' ? { strict: fn.strict } : {}),
    });
  }
  if (tools.length) result.tools = tools;
  const toolChoice = responsesToolChoice(body.tool_choice);
  if (toolChoice !== undefined) result.tool_choice = toolChoice;
  const text = responseText(body.response_format);
  if (text) result.text = { format: text };
  return result;
};
const imageToMessages = (part) => {
  const imageUrl = typeof part.image_url === 'string' ? part.image_url : part.image_url?.url;
  if (typeof imageUrl !== 'string' || !imageUrl) return null;
  const match = /^data:([^;]+);base64,(.+)$/s.exec(imageUrl);
  return match
    ? { type: 'image', source: { type: 'base64', media_type: match[1], data: match[2] } }
    : { type: 'image', source: { type: 'url', url: imageUrl } };
};
const messagesContent = (value) => {
  if (typeof value === 'string') return value ? [{ type: 'text', text: value }] : [];
  if (!Array.isArray(value)) return [];
  const out = [];
  for (const partValue of value) {
    const part = asObject(partValue);
    if (part.type === 'text' && typeof part.text === 'string') out.push({ type: 'text', text: part.text });
    else if (part.type === 'image_url') {
      const image = imageToMessages(part);
      if (image) out.push(image);
    }
  }
  return out;
};
const mergeTurns = (messages) => {
  const merged = [];
  for (const message of messages) {
    const last = merged[merged.length - 1];
    if (last && last.role === message.role && Array.isArray(last.content) && Array.isArray(message.content)) last.content.push(...message.content);
    else merged.push({ ...message, content: Array.isArray(message.content) ? [...message.content] : message.content });
  }
  return merged;
};
const chatToMessages = (body) => {
  const messages = [];
  const systems = [];
  if (typeof body.system === 'string') systems.push(body.system);
  if (typeof body.instructions === 'string') systems.push(body.instructions);
  const pendingToolIds = [];
  for (const messageValue of Array.isArray(body.messages) ? body.messages : []) {
    const message = asObject(messageValue);
    const role = typeof message.role === 'string' ? message.role : 'user';
    if (role === 'system' || role === 'developer') {
      const value = textOf(message.content);
      if (value.trim()) systems.push(value);
      continue;
    }
    if (role === 'tool' || role === 'function') {
      const supplied = typeof message.tool_call_id === 'string' ? message.tool_call_id : '';
      let callId = supplied;
      if (callId) {
        const index = pendingToolIds.indexOf(callId);
        if (index >= 0) pendingToolIds.splice(index, 1);
      } else if (pendingToolIds.length) callId = pendingToolIds.shift();
      else callId = `call_tool_${messages.length}`;
      messages.push({ role: 'user', content: [{ type: 'tool_result', tool_use_id: callId, content: textOf(message.content) }] });
      continue;
    }
    const content = messagesContent(message.content);
    if (role === 'assistant' && Array.isArray(message.tool_calls)) {
      for (const callValue of message.tool_calls) {
        const call = asObject(callValue);
        const fn = asObject(call.function);
        if (typeof fn.name !== 'string' || !fn.name.trim()) continue;
        const id = typeof call.id === 'string' && call.id ? call.id : `call_${messages.length}_${content.length}`;
        pendingToolIds.push(id);
        content.push({ type: 'tool_use', id, name: fn.name, input: parseArgs(fn.arguments) });
      }
    }
    if (content.length) messages.push({ role: role === 'assistant' ? 'assistant' : 'user', content });
  }
  const tools = [];
  for (const toolValue of Array.isArray(body.tools) ? body.tools : []) {
    const tool = asObject(toolValue);
    const fn = asObject(tool.function || tool);
    if (typeof fn.name !== 'string' || !fn.name) continue;
    tools.push({
      name: fn.name,
      ...(typeof fn.description === 'string' ? { description: fn.description } : {}),
      input_schema: asObject(fn.parameters).type ? fn.parameters : { type: 'object', properties: {} },
    });
  }
  const result = {
    model: cleanModelId(body.model),
    max_tokens: maxTokensFrom(body) ?? 4096,
    stream: true,
    messages: mergeTurns(messages),
  };
  if (systems.length) result.system = systems.join('\n\n');
  if (tools.length) result.tools = tools;
  if (typeof body.temperature === 'number') result.temperature = body.temperature;
  if (typeof body.top_p === 'number') result.top_p = body.top_p;
  if (Array.isArray(body.stop)) result.stop_sequences = body.stop;
  if (body.metadata && typeof body.metadata === 'object') result.metadata = body.metadata;
  if (body.tool_choice !== undefined) {
    const choice = body.tool_choice;
    if (typeof choice === 'string') result.tool_choice = { type: choice === 'required' ? 'any' : choice === 'none' ? 'none' : 'auto' };
    else {
      const raw = asObject(choice);
      if (raw.type === 'function' && raw.function?.name) result.tool_choice = { type: 'tool', name: raw.function.name };
      else if (raw.type === 'required' || raw.type === 'any') result.tool_choice = { type: 'any' };
      else result.tool_choice = { type: 'auto' };
    }
  }
  return result;
};
export const prepareOpenCodeRequestBody = (raw, lane) => {
  if (lane === 'chat') return raw;
  let parsed;
  try { parsed = JSON.parse(raw); } catch { throw new Error('The prepared upstream request is not JSON.'); }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('The prepared upstream request must be a JSON object.');
  return JSON.stringify(lane === 'responses' ? chatToResponses(parsed) : chatToMessages(parsed));
};

const parseFrame = (frame) => {
  let event = '';
  const data = [];
  for (const line of frame.split(/\r?\n/)) {
    if (!line || line.startsWith(':')) continue;
    if (line.startsWith('event:')) event = line.slice(6).trim();
    else if (line.startsWith('data:')) data.push(line.slice(5).trimStart());
  }
  return data.length ? { event, data: data.join('\n') } : null;
};
const getErrorMessage = (payload) => {
  const response = asObject(payload.response);
  const error = asObject(payload.error && typeof payload.error === 'object' ? payload.error : response.error && typeof response.error === 'object' ? response.error : payload);
  return typeof error.message === 'string' ? error.message : JSON.stringify(error);
};

export const createOpenCodeResponseTransform = (lane, requestedModel) => {
  if (lane === 'chat') return null;
  const decoder = new StringDecoder('utf8');
  let buffer = '';
  let responseId = `chatcmpl-blackrouter-${Date.now()}`;
  const model = cleanModelId(requestedModel);
  const created = Math.floor(Date.now() / 1000);
  let inputTokens = 0;
  let outputTokens = 0;
  let finished = false;
  let sawToolCall = false;
  let stopReason = 'end_turn';
  const responseToolIndices = new Map();
  const responseToolIds = new Map();
  const responseToolArgs = new Map();
  const responseToolArgsDeltaSeen = new Set();
  let responseToolCount = 0;
  const messageToolIndices = new Map();
  const messageToolIds = new Map();
  const messageToolArgsDeltaSeen = new Set();
  let messageToolCount = 0;

  let stream;
  const emit = (payload) => stream.push(Buffer.from(`data: ${JSON.stringify(payload)}\n\n`));
  const chunk = (delta, finish = null, usage) => {
    const item = { id: responseId, object: 'chat.completion.chunk', created, model, choices: [{ index: 0, delta, finish_reason: finish }] };
    if (usage) item.usage = usage;
    emit(item);
  };
  const toolStart = (index, id, name) => {
    sawToolCall = true;
    chunk({ tool_calls: [{ index, id, type: 'function', function: { name, arguments: '' } }] });
  };
  const finish = (reason, usage) => {
    if (finished) return;
    chunk({}, sawToolCall ? 'tool_calls' : reason, usage || (inputTokens || outputTokens ? { prompt_tokens: inputTokens, completion_tokens: outputTokens, total_tokens: inputTokens + outputTokens } : undefined));
    stream.push(Buffer.from('data: [DONE]\n\n'));
    finished = true;
  };
  const fail = (payload) => {
    if (finished) return;
    emit({ error: { type: 'upstream_error', message: getErrorMessage(payload) } });
    emit({ choices: [{ index: 0, delta: {}, finish_reason: 'stop' }] });
    stream.push(Buffer.from('data: [DONE]\n\n'));
    finished = true;
  };

  const responsesEvent = (type, payload) => {
    if (type === 'response.created' || type === 'response.in_progress') {
      const response = asObject(payload.response);
      if (typeof response.id === 'string') responseId = response.id;
      return;
    }
    if (type === 'response.output_text.delta' || type === 'response.text.delta' || type === 'response.refusal.delta') {
      if (typeof payload.delta === 'string' && payload.delta) chunk({ content: payload.delta });
      return;
    }
    if (type === 'response.reasoning_summary_text.delta' || type === 'response.reasoning_text.delta' || type === 'response.thought.delta') {
      if (typeof payload.delta === 'string' && payload.delta) chunk({ reasoning_content: payload.delta });
      return;
    }
    if (type === 'response.output_item.added') {
      const item = asObject(payload.item);
      if (item.type !== 'function_call' && item.type !== 'custom_tool_call') return;
      const callId = typeof item.call_id === 'string' && item.call_id ? item.call_id : typeof item.id === 'string' && item.id ? item.id : `call_${responseToolCount}`;
      const itemId = typeof payload.item_id === 'string' ? payload.item_id : typeof item.id === 'string' ? item.id : callId;
      let index = responseToolIndices.get(itemId);
      if (index === undefined) index = responseToolIndices.get(callId);
      if (index === undefined) {
        index = responseToolCount++;
        responseToolIndices.set(itemId, index);
        responseToolIndices.set(callId, index);
      }
      responseToolIds.set(itemId, callId);
      responseToolIds.set(callId, callId);
      toolStart(index, callId, typeof item.name === 'string' ? item.name : '');
      const args = typeof item.arguments === 'string' ? item.arguments : '';
      if (args) responseToolArgs.set(index, args);
      return;
    }
    if (type === 'response.function_call_arguments.delta' || type === 'response.custom_tool_call_input.delta') {
      const itemId = typeof payload.item_id === 'string' ? payload.item_id : '';
      const callIdRaw = typeof payload.call_id === 'string' ? payload.call_id : '';
      let index = responseToolIndices.get(itemId);
      if (index === undefined && callIdRaw) index = responseToolIndices.get(callIdRaw);
      if (index === undefined) {
        index = responseToolCount++;
        const key = itemId || callIdRaw || `call_${index}`;
        const callId = callIdRaw || key;
        responseToolIndices.set(key, index);
        responseToolIndices.set(callId, index);
        responseToolIds.set(key, callId);
        responseToolIds.set(callId, callId);
        toolStart(index, callId, typeof payload.name === 'string' ? payload.name : '');
      }
      const callId = responseToolIds.get(itemId) || responseToolIds.get(callIdRaw) || callIdRaw || `call_${index}`;
      const delta = typeof payload.delta === 'string' ? payload.delta : '';
      if (delta) {
        responseToolArgsDeltaSeen.add(index);
        responseToolArgs.set(index, (responseToolArgs.get(index) || '') + delta);
        chunk({ tool_calls: [{ index, id: callId, type: 'function', function: { arguments: delta } }] });
      }
      return;
    }
    if (type === 'response.output_item.done') {
      const item = asObject(payload.item);
      if (item.type === 'function_call' || item.type === 'custom_tool_call') {
        const itemId = typeof payload.item_id === 'string' ? payload.item_id : typeof item.id === 'string' ? item.id : '';
        const callId = typeof item.call_id === 'string' ? item.call_id : itemId;
        const index = responseToolIndices.get(itemId) ?? responseToolIndices.get(callId);
        const args = typeof item.arguments === 'string' ? item.arguments : (index === undefined ? '' : responseToolArgs.get(index) || '');
        if (index !== undefined && args && !responseToolArgsDeltaSeen.has(index)) {
          responseToolArgsDeltaSeen.add(index);
          responseToolArgs.set(index, args);
          chunk({ tool_calls: [{ index, id: callId, type: 'function', function: { arguments: args } }] });
        }
      }
      return;
    }
    if (type === 'response.completed') {
      const response = asObject(payload.response);
      const usage = asObject(response.usage);
      inputTokens = Number(usage.input_tokens) || 0;
      outputTokens = Number(usage.output_tokens) || 0;
      if (Array.isArray(response.output) && response.output.some((item) => ['function_call', 'custom_tool_call'].includes(asObject(item).type))) sawToolCall = true;
      finish('stop', inputTokens || outputTokens ? { prompt_tokens: inputTokens, completion_tokens: outputTokens, total_tokens: Number(usage.total_tokens) || inputTokens + outputTokens } : undefined);
      return;
    }
    if (type === 'response.incomplete') {
      finish('length');
      return;
    }
    if (type === 'response.failed' || type === 'error') fail(payload);
  };

  const messagesEvent = (type, payload) => {
    if (type === 'message_start') {
      const message = asObject(payload.message);
      if (typeof message.id === 'string') responseId = message.id;
      inputTokens = Number(asObject(message.usage).input_tokens) || 0;
      return;
    }
    if (type === 'content_block_start') {
      const block = asObject(payload.content_block);
      const index = Number(payload.index) || 0;
      if (block.type === 'text' && typeof block.text === 'string' && block.text) chunk({ content: block.text });
      else if (block.type === 'thinking' && typeof block.thinking === 'string' && block.thinking) chunk({ reasoning_content: block.thinking });
      else if (block.type === 'tool_use') {
        let toolIndex = messageToolIndices.get(index);
        if (toolIndex === undefined) {
          toolIndex = messageToolCount++;
          messageToolIndices.set(index, toolIndex);
        }
        const id = typeof block.id === 'string' && block.id ? block.id : `call_${toolIndex}`;
        toolStart(toolIndex, id, typeof block.name === 'string' ? block.name : '');
        const args = asObject(block.input);
        if (Object.keys(args).length) {
          messageToolArgsDeltaSeen.add(index);
          chunk({ tool_calls: [{ index: toolIndex, id, type: 'function', function: { arguments: JSON.stringify(args) } }] });
        }
        messageToolIds.set(index, id);
      }
      return;
    }
    if (type === 'content_block_delta') {
      const index = Number(payload.index) || 0;
      const delta = asObject(payload.delta);
      if (delta.type === 'text_delta' && typeof delta.text === 'string' && delta.text) chunk({ content: delta.text });
      else if ((delta.type === 'thinking_delta' || delta.type === 'redacted_thinking_delta') && typeof delta.thinking === 'string' && delta.thinking) chunk({ reasoning_content: delta.thinking });
      else if (delta.type === 'input_json_delta' && typeof delta.partial_json === 'string' && delta.partial_json) {
        const toolIndex = messageToolIndices.get(index);
        const id = messageToolIds.get(index) || `call_${toolIndex ?? index}`;
        if (toolIndex !== undefined) {
          messageToolArgsDeltaSeen.add(index);
          chunk({ tool_calls: [{ index: toolIndex, id, type: 'function', function: { arguments: delta.partial_json } }] });
        }
      }
      return;
    }
    if (type === 'message_delta') {
      const delta = asObject(payload.delta);
      if (typeof delta.stop_reason === 'string') stopReason = delta.stop_reason;
      outputTokens = Number(asObject(payload.usage).output_tokens) || outputTokens;
      return;
    }
    if (type === 'message_stop') {
      finish(stopReason === 'tool_use' ? 'tool_calls' : stopReason === 'max_tokens' ? 'length' : 'stop');
      return;
    }
    if (type === 'error') fail(payload);
  };

  const processFrame = (frame) => {
    const parsedFrame = parseFrame(frame);
    if (!parsedFrame) return;
    if (parsedFrame.data === '[DONE]') { finish('stop'); return; }
    let payload;
    try { payload = JSON.parse(parsedFrame.data); } catch { return; }
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return;
    if (payload.error && typeof payload.error === 'object') { fail(payload); return; }
    const type = parsedFrame.event || (typeof payload.type === 'string' ? payload.type : '');
    if (lane === 'responses') responsesEvent(type, payload);
    else messagesEvent(type, payload);
  };

  stream = new Transform({
    transform(data, _encoding, callback) {
      try {
        buffer += Buffer.isBuffer(data) ? decoder.write(data) : String(data);
        let match = /\r?\n\r?\n/.exec(buffer);
        while (match && match.index !== undefined) {
          const frame = buffer.slice(0, match.index);
          buffer = buffer.slice(match.index + match[0].length);
          processFrame(frame);
          match = /\r?\n\r?\n/.exec(buffer);
        }
        callback();
      } catch (error) { callback(error instanceof Error ? error : new Error(String(error))); }
    },
    flush(callback) {
      try {
        buffer += decoder.end();
        if (buffer.trim()) processFrame(buffer);
        if (!finished) finish('stop');
        callback();
      } catch (error) { callback(error instanceof Error ? error : new Error(String(error))); }
    },
  });
  return stream;
};
