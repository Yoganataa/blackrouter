import { describe, expect, test } from 'bun:test';

import {
  createOpenCodeResponseTransform,
  prepareOpenCodeRequestBody,
  resolveOpenCodeLane,
} from './opencode-protocol.ts';

const collect = (lane: 'responses' | 'messages', model: string, input: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const transform = createOpenCodeResponseTransform(lane, model);
    if (!transform) {
      reject(new Error('Expected a protocol transform.'));
      return;
    }
    let output = '';
    transform.on('data', (chunk: Buffer | string) => {
      output += Buffer.isBuffer(chunk) ? chunk.toString('utf8') : chunk;
    });
    transform.on('error', reject);
    transform.on('end', () => resolve(output));
    transform.end(input);
  });

const frame = (event: string, payload: unknown): string =>
  `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;

const parseOpenAiChunks = (sse: string): Array<Record<string, any>> =>
  sse.split(/\r?\n/).flatMap((line) => {
    const trimmed = line.trim();
    if (!trimmed.startsWith('data:')) return [];
    const raw = trimmed.slice(5).trim();
    if (!raw || raw === '[DONE]') return [];
    try {
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? [parsed] : [];
    } catch {
      return [];
    }
  });

describe('OpenCode model-specific wire formats', () => {
  test('selects Responses and Messages only for OpenCode Zen models', () => {
    expect(resolveOpenCodeLane('https://opencode.ai/zen/v1', 'blackrouter/muse-spark-1.3-contributor-free')).toBe('responses');
    expect(resolveOpenCodeLane('https://opencode.ai/zen/v1', 'blackrouter/union-alpha')).toBe('messages');
    expect(resolveOpenCodeLane('https://custom.example/v1', 'muse-spark-1.3-contributor-free')).toBe('chat');
    expect(resolveOpenCodeLane('https://opencode.ai/zen/v1', 'deepseek-v4.1-flash-free')).toBe('chat');
  });

  test('strips only the BlackRouter provider namespace from regular chat model ids', () => {
    const raw = JSON.stringify({
      model: 'blackrouter/vendor-a/model-free',
      messages: [{ role: 'user', content: 'Hi' }],
    });
    expect(JSON.parse(prepareOpenCodeRequestBody(raw, 'chat', true)).model).toBe('vendor-a/model-free');
    expect(JSON.parse(prepareOpenCodeRequestBody(raw, 'chat', false)).model).toBe('blackrouter/vendor-a/model-free');
  });

  test('converts Chat Completions into a Responses body, flattening tools and preserving tool linkage', () => {
    const prepared = prepareOpenCodeRequestBody(JSON.stringify({
      model: 'blackrouter/muse-spark-1.3-contributor-free',
      stream: true,
      max_tokens: 8,
      messages: [
        { role: 'system', content: 'Be concise.' },
        { role: 'user', content: 'Run a command.' },
        { role: 'assistant', content: null, tool_calls: [
          { id: 'call-1', type: 'function', function: { name: 'shell', arguments: '{"command":"ls"}' } },
        ] },
        { role: 'tool', tool_call_id: 'call-1', content: 'file.txt' },
      ],
      tools: [{ type: 'function', function: { name: 'shell', description: 'Run command', parameters: { type: 'object', properties: { command: { type: 'string' } } } } }],
    }), 'responses');
    const body = JSON.parse(prepared);

    expect(body.model).toBe('muse-spark-1.3-contributor-free');
    expect(body.stream).toBe(true);
    expect(body.store).toBe(false);
    expect(body.max_output_tokens).toBe(16);
    expect(body.max_tokens).toBeUndefined();
    expect(body.instructions).toBe('Be concise.');
    expect(body.input.some((item: any) => item.type === 'function_call' && item.call_id === 'call-1' && item.name === 'shell')).toBe(true);
    expect(body.input.some((item: any) => item.type === 'function_call_output' && item.call_id === 'call-1' && item.output === 'file.txt')).toBe(true);
    expect(body.tools[0]).toMatchObject({ type: 'function', name: 'shell', description: 'Run command' });
    expect(body.tools[0].function).toBeUndefined();
  });

  test('converts Chat Completions into a Messages body with system, tool schemas, and paired tool results', () => {
    const prepared = prepareOpenCodeRequestBody(JSON.stringify({
      model: 'blackrouter/union-alpha',
      stream: true,
      max_tokens: 128,
      messages: [
        { role: 'system', content: 'Use tools when needed.' },
        { role: 'user', content: 'List files.' },
        { role: 'assistant', content: null, tool_calls: [
          { id: 'call-1', type: 'function', function: { name: 'shell', arguments: '{"command":"ls"}' } },
        ] },
        { role: 'tool', tool_call_id: 'call-1', content: 'a.txt' },
      ],
      tools: [{ type: 'function', function: { name: 'shell', description: 'Run shell', parameters: { type: 'object', properties: { command: { type: 'string' } } } } }],
    }), 'messages');
    const body = JSON.parse(prepared);

    expect(body.model).toBe('union-alpha');
    expect(body.stream).toBe(true);
    expect(body.system).toBe('Use tools when needed.');
    expect(body.messages[1].role).toBe('assistant');
    expect(body.messages[1].content[0]).toMatchObject({ type: 'tool_use', id: 'call-1', name: 'shell', input: { command: 'ls' } });
    expect(body.messages[2].role).toBe('user');
    expect(body.messages[2].content[0]).toMatchObject({ type: 'tool_result', tool_use_id: 'call-1', content: 'a.txt' });
    expect(body.tools[0]).toMatchObject({ name: 'shell', description: 'Run shell', input_schema: { type: 'object' } });
  });

  test('converts Responses SSE into OpenAI Chat Completions SSE', async () => {
    const output = await collect('responses', 'muse-spark-1.3-contributor-free', [
      frame('response.created', { type: 'response.created', response: { id: 'resp_1', model: 'muse-spark-1.3-contributor-free' } }),
      frame('response.output_text.delta', { type: 'response.output_text.delta', delta: 'Hello' }),
      frame('response.completed', {
        type: 'response.completed',
        response: {
          status: 'completed',
          usage: { input_tokens: 12, output_tokens: 3, total_tokens: 15 },
          output: [{ type: 'message' }],
        },
      }),
    ].join(''));
    const chunks = parseOpenAiChunks(output);

    expect(chunks.some((chunk) => chunk.choices?.[0]?.delta?.content === 'Hello')).toBe(true);
    expect(chunks.some((chunk) => chunk.choices?.[0]?.finish_reason === 'stop')).toBe(true);
    expect(chunks.some((chunk) => chunk.usage?.prompt_tokens === 12 && chunk.usage?.completion_tokens === 3)).toBe(true);
    expect(output).toContain('data: [DONE]');
  });

  test('converts Messages SSE text and tool-use events into OpenAI chunks', async () => {
    const output = await collect('messages', 'union-alpha', [
      frame('message_start', { type: 'message_start', message: { id: 'msg_1', usage: { input_tokens: 5 } } }),
      frame('content_block_start', { type: 'content_block_start', index: 0, content_block: { type: 'text', text: 'Hi ' } }),
      frame('content_block_delta', { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: 'there' } }),
      frame('content_block_start', { type: 'content_block_start', index: 1, content_block: { type: 'tool_use', id: 'tool-1', name: 'shell', input: {} } }),
      frame('content_block_delta', { type: 'content_block_delta', index: 1, delta: { type: 'input_json_delta', partial_json: '{"command":"ls"}' } }),
      frame('message_delta', { type: 'message_delta', delta: { stop_reason: 'tool_use' }, usage: { output_tokens: 2 } }),
      frame('message_stop', { type: 'message_stop' }),
    ].join(''));
    const chunks = parseOpenAiChunks(output);

    expect(chunks.some((chunk) => chunk.choices?.[0]?.delta?.content === 'Hi ')).toBe(true);
    expect(chunks.some((chunk) => chunk.choices?.[0]?.delta?.content === 'there')).toBe(true);
    expect(chunks.some((chunk) => chunk.choices?.[0]?.delta?.tool_calls?.[0]?.function?.name === 'shell')).toBe(true);
    expect(chunks.some((chunk) => chunk.choices?.[0]?.delta?.tool_calls?.[0]?.function?.arguments === '{"command":"ls"}')).toBe(true);
    expect(chunks.some((chunk) => chunk.choices?.[0]?.finish_reason === 'tool_calls')).toBe(true);
    expect(chunks.some((chunk) => chunk.usage?.prompt_tokens === 5 && chunk.usage?.completion_tokens === 2)).toBe(true);
    expect(output).toContain('data: [DONE]');
  });
});
