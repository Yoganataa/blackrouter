import { Transform } from 'node:stream';
import { StringDecoder } from 'node:string_decoder';

export type OpenCodeLane = 'chat' | 'responses' | 'messages';

type AnyObject = Record<string, any>;

const cleanModelId = (modelId: string): string => {
  const clean = modelId.replace(/\([^()]+\)\s*$/, '').trim();
  // Strip only our OpenCode provider namespace. Some upstream model ids
  // contain their own namespace (for example vendor/model); keep that intact.
  return clean.startsWith('blackrouter/') ? clean.slice('blackrouter/'.length) : clean;
};

export const resolveOpenCodeLane = (upstream: string, modelId: string): OpenCodeLane => {
  let isOpenCode = false;
  try {
    isOpenCode = new URL(upstream).hostname.toLowerCase().includes('opencode.ai');
  } catch {
    return 'chat';
  }
  if (!isOpenCode) return 'chat';
  const base = cleanModelId(modelId).split('/').pop()?.toLowerCase() ?? '';
  if (/^muse[-_]?spark(?:$|[-_:.\s])/.test(base)) return 'responses';
  if (/^union[-_]?alpha(?:$|[-_:.\s])/.test(base)) return 'messages';
  return 'chat';
};

const parseArgs = (value: unknown): AnyObject => {
  if (value && typeof value === 'object' && !Array.isArray(value)) return value as AnyObject;
  if (typeof value === 'string') {
    try {
      const parsed: unknown = JSON.parse(value);
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed as AnyObject : {};
    } catch {
      return {};
    }
  }
  return {};
};

const textOf = (value: unknown): string => {
  if (typeof value === 'string') return value;
  if (Array.isArray(value)) {
    return value.map((part) => {
      if (!part || typeof part !== 'object') return '';
      const block = part as AnyObject;
      if (typeof block.text === 'string') return block.text;
      if (typeof block.content === 'string') return block.content;
      return '';
    }).join('');
  }
  if (value === null || value === undefined) return '';
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const textBlocks = (value: unknown, role: 'user' | 'assistant'): AnyObject[] => {
  if (typeof value === 'string') {
    return value ? [{ type: role === 'assistant' ? 'output_text' : 'input_text', [role === 'assistant' ? 'text' : 'text']: value }] : [];
  }
  if (!Array.isArray(value)) return [];
  const blocks: AnyObject[] = [];
  for (const part of value) {
    if (!part || typeof part !== 'object') continue;
    const block = part as AnyObject;
    if (block.type === 'text' && typeof block.text === 'string') {
      blocks.push({ type: role === 'assistant' ? 'output_text' : 'input_text', text: block.text });
    } else if (role === 'user' && block.type === 'image_url') {
      const imageUrl = typeof block.image_url === 'string' ? block.image_url : block.image_url?.url;
      if (typeof imageUrl === 'string' && imageUrl) {
        blocks.push({ type: 'input_image', image_url: imageUrl, detail: block.image_url?.detail || 'auto' });
      }
    } else if (role === 'user' && (block.type === 'input_image' || block.type === 'image')) {
      const imageUrl = block.image_url || block.url || block.file_id;
      if (typeof imageUrl === 'string' && imageUrl) {
        blocks.push({ type: 'input_image', image_url: imageUrl, detail: block.detail || 'auto' });
      }
    }
  }
  return blocks;
};

const maxTokensFrom = (body: AnyObject): number | undefined => {
  for (const key of ['max_output_tokens', 'max_completion_tokens', 'max_tokens']) {
    const value = body[key];
    if (typeof value === 'number' && Number.isFinite(value) && value > 0) return Math.max(16, Math.floor(value));
  }
  return undefined;
};

const responseFormatToText = (responseFormat: unknown): AnyObject | undefined => {
  if (!responseFormat || typeof responseFormat !== 'object') return undefined;
  const rf = responseFormat as AnyObject;
  if (rf.type === 'json_object') return { format: { type: 'json_object' } };
  if (rf.type === 'json_schema' && rf.json_schema && typeof rf.json_schema === 'object') {
    const schema = rf.json_schema as AnyObject;
    if (!schema.schema) return undefined;
    return {
      format: {
        type: 'json_schema',
        name: typeof schema.name === 'string' && schema.name ? schema.name : 'response',
        schema: schema.schema,
        ...(typeof schema.strict === 'boolean' ? { strict: schema.strict } : {}),
      },
    };
  }
  return undefined;
};

const responseToolChoice = (choice: unknown): unknown => {
  if (typeof choice === 'string') return choice;
  if (!choice || typeof choice !== 'object') return undefined;
  const value = choice as AnyObject;
  if (value.type === 'function' && value.function?.name) return { type: 'function', name: value.function.name };
  return value;
};

const chatToResponses = (body: AnyObject): AnyObject => {
  const input: AnyObject[] = [];
  const instructions: string[] = typeof body.instructions === 'string' ? [body.instructions] : [];
  const pendingCallIds: string[] = [];
  const messages = Array.isArray(body.messages) ? body.messages : [];

  for (const rawMessage of messages) {
    if (!rawMessage || typeof rawMessage !== 'object') continue;
    const message = rawMessage as AnyObject;
    const role = typeof message.role === 'string' ? message.role : 'user';
    if (role === 'system' || role === 'developer') {
      const text = textOf(message.content);
      if (text.trim()) instructions.push(text);
      continue;
    }
    if (role === 'tool' || role === 'function') {
      const suppliedId = typeof message.tool_call_id === 'string' ? message.tool_call_id : '';
      let callId = suppliedId;
      if (callId) {
        const index = pendingCallIds.indexOf(callId);
        if (index >= 0) pendingCallIds.splice(index, 1);
      } else if (pendingCallIds.length > 0) {
        callId = pendingCallIds.shift()!;
      } else {
        callId = `call_tool_${input.length}`;
      }
      input.push({ type: 'function_call_output', call_id: callId.slice(0, 64), output: textOf(message.content) });
      continue;
    }

    if (role === 'user' || role === 'assistant') {
      const content = textBlocks(message.content, role);
      if (content.length > 0) input.push({ type: 'message', role, content });
    }

    if (role === 'assistant' && Array.isArray(message.tool_calls)) {
      for (const rawCall of message.tool_calls) {
        if (!rawCall || typeof rawCall !== 'object') continue;
        const call = rawCall as AnyObject;
        const fn = call.function && typeof call.function === 'object' ? call.function as AnyObject : {};
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

  if (input.length === 0) input.push({ type: 'message', role: 'user', content: [{ type: 'input_text', text: '...' }] });

  const result: AnyObject = {
    model: cleanModelId(typeof body.model === 'string' ? body.model : ''),
    input,
    stream: true,
    store: false,
  };
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
  const tools = Array.isArray(body.tools) ? body.tools : [];
  const responseTools: AnyObject[] = [];
  for (const rawTool of tools) {
    if (!rawTool || typeof rawTool !== 'object') continue;
    const tool = rawTool as AnyObject;
    const fn = tool.function && typeof tool.function === 'object' ? tool.function as AnyObject : tool;
    if (typeof fn.name !== 'string' || !fn.name) continue;
    responseTools.push({
      type: 'function',
      name: fn.name,
      ...(typeof fn.description === 'string' ? { description: fn.description } : {}),
      parameters: fn.parameters && typeof fn.parameters === 'object'
        ? fn.parameters
        : { type: 'object', properties: {} },
      ...(typeof fn.strict === 'boolean' ? { strict: fn.strict } : {}),
    });
  }
  if (responseTools.length) result.tools = responseTools;
  const toolChoice = responseToolChoice(body.tool_choice);
  if (toolChoice !== undefined) result.tool_choice = toolChoice;
  const text = responseFormatToText(body.response_format);
  if (text) result.text = text.format;
  return result;
};

const imageBlockToMessages = (part: AnyObject): AnyObject | null => {
  const imageUrl = typeof part.image_url === 'string' ? part.image_url : part.image_url?.url;
  if (typeof imageUrl !== 'string' || !imageUrl) return null;
  const dataMatch = /^data:([^;]+);base64,(.+)$/s.exec(imageUrl);
  if (dataMatch) {
    return { type: 'image', source: { type: 'base64', media_type: dataMatch[1], data: dataMatch[2] } };
  }
  return { type: 'image', source: { type: 'url', url: imageUrl } };
};

const contentToMessages = (value: unknown): AnyObject[] => {
  if (typeof value === 'string') return value ? [{ type: 'text', text: value }] : [];
  if (!Array.isArray(value)) return [];
  const blocks: AnyObject[] = [];
  for (const rawPart of value) {
    if (!rawPart || typeof rawPart !== 'object') continue;
    const part = rawPart as AnyObject;
    if (part.type === 'text' && typeof part.text === 'string') blocks.push({ type: 'text', text: part.text });
    else if (part.type === 'image_url') {
      const image = imageBlockToMessages(part);
      if (image) blocks.push(image);
    }
  }
  return blocks;
};

const mergeMessageTurns = (messages: AnyObject[]): AnyObject[] => {
  const merged: AnyObject[] = [];
  for (const message of messages) {
    const last = merged[merged.length - 1];
    if (last && last.role === message.role && Array.isArray(last.content) && Array.isArray(message.content)) {
      last.content.push(...message.content);
    } else {
      merged.push({ ...message, content: Array.isArray(message.content) ? [...message.content] : message.content });
    }
  }
  return merged;
};

const chatToMessages = (body: AnyObject): AnyObject => {
  const messages: AnyObject[] = [];
  const systemParts: string[] = typeof body.system === 'string' ? [body.system] : [];
  if (typeof body.instructions === 'string') systemParts.push(body.instructions);
  const rawMessages = Array.isArray(body.messages) ? body.messages : [];
  const pendingToolIds: string[] = [];

  for (const rawMessage of rawMessages) {
    if (!rawMessage || typeof rawMessage !== 'object') continue;
    const message = rawMessage as AnyObject;
    const role = typeof message.role === 'string' ? message.role : 'user';
    if (role === 'system' || role === 'developer') {
      const systemText = textOf(message.content);
      if (systemText.trim()) systemParts.push(systemText);
      continue;
    }
    if (role === 'tool' || role === 'function') {
      const suppliedId = typeof message.tool_call_id === 'string' ? message.tool_call_id : '';
      let callId = suppliedId;
      if (callId) {
        const index = pendingToolIds.indexOf(callId);
        if (index >= 0) pendingToolIds.splice(index, 1);
      } else if (pendingToolIds.length > 0) {
        callId = pendingToolIds.shift()!;
      } else {
        callId = `call_tool_${messages.length}`;
      }
      messages.push({
        role: 'user',
        content: [{
          type: 'tool_result',
          tool_use_id: callId,
          content: textOf(message.content),
        }],
      });
      continue;
    }

    const content: AnyObject[] = contentToMessages(message.content);
    if (role === 'assistant' && Array.isArray(message.tool_calls)) {
      for (const rawCall of message.tool_calls) {
        if (!rawCall || typeof rawCall !== 'object') continue;
        const call = rawCall as AnyObject;
        const fn = call.function && typeof call.function === 'object' ? call.function as AnyObject : {};
        if (typeof fn.name !== 'string' || !fn.name.trim()) continue;
        const id = typeof call.id === 'string' && call.id ? call.id : `call_${messages.length}_${content.length}`;
        pendingToolIds.push(id);
        content.push({ type: 'tool_use', id, name: fn.name, input: parseArgs(fn.arguments) });
      }
    }
    if (content.length) messages.push({ role: role === 'assistant' ? 'assistant' : 'user', content });
  }

  let tools: AnyObject[] = [];
  if (Array.isArray(body.tools)) {
    tools = body.tools.flatMap((rawTool: unknown) => {
      if (!rawTool || typeof rawTool !== 'object') return [];
      const tool = rawTool as AnyObject;
      const fn = tool.function && typeof tool.function === 'object' ? tool.function as AnyObject : tool;
      if (typeof fn.name !== 'string' || !fn.name) return [];
      return [{
        name: fn.name,
        ...(typeof fn.description === 'string' ? { description: fn.description } : {}),
        input_schema: fn.parameters && typeof fn.parameters === 'object'
          ? fn.parameters
          : { type: 'object', properties: {} },
      }];
    });
  }

  const result: AnyObject = {
    model: cleanModelId(typeof body.model === 'string' ? body.model : ''),
    max_tokens: maxTokensFrom(body) ?? 4096,
    stream: true,
    messages: mergeMessageTurns(messages),
  };
  if (systemParts.length) result.system = systemParts.join('\n\n');
  if (tools.length) result.tools = tools;
  if (typeof body.temperature === 'number') result.temperature = body.temperature;
  if (typeof body.top_p === 'number') result.top_p = body.top_p;
  if (Array.isArray(body.stop)) result.stop_sequences = body.stop;
  if (body.metadata && typeof body.metadata === 'object') result.metadata = body.metadata;
  if (body.tool_choice !== undefined) {
    const choice = body.tool_choice;
    if (typeof choice === 'string') {
      if (choice === 'required') result.tool_choice = { type: 'any' };
      else result.tool_choice = { type: choice === 'none' ? 'none' : 'auto' };
    } else if (choice && typeof choice === 'object') {
      const rawChoice = choice as AnyObject;
      if (rawChoice.type === 'function' && rawChoice.function?.name) result.tool_choice = { type: 'tool', name: rawChoice.function.name };
      else if (rawChoice.type === 'required' || rawChoice.type === 'any') result.tool_choice = { type: 'any' };
      else result.tool_choice = { type: 'auto' };
    }
  }
  return result;
};

export const prepareOpenCodeRequestBody = (
  raw: string,
  lane: OpenCodeLane,
  normalizeChatModelId = false,
): string => {
  if (lane === 'chat' && !normalizeChatModelId) return raw;
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('The prepared upstream request is not JSON.');
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('The prepared upstream request must be a JSON object.');
  }
  const body = parsed as AnyObject;
  if (lane === 'chat') {
    if (typeof body.model === 'string') body.model = cleanModelId(body.model);
    return JSON.stringify(body);
  }
  return JSON.stringify(lane === 'responses' ? chatToResponses(body) : chatToMessages(body));
};

type SseFrame = { event: string; data: string };

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

const responseErrorMessage = (payload: AnyObject): string => {
  const response = payload.response && typeof payload.response === 'object' ? payload.response as AnyObject : {};
  const error = payload.error && typeof payload.error === 'object'
    ? payload.error as AnyObject
    : response.error && typeof response.error === 'object'
      ? response.error as AnyObject
      : payload;
  return typeof error.message === 'string' ? error.message : JSON.stringify(error);
};

export const createOpenCodeResponseTransform = (lane: OpenCodeLane, requestedModel: string): Transform | null => {
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
    stream.push(Buffer.from(`data: ${JSON.stringify(payload)}\n\n`));
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
