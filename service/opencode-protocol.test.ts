import { describe, expect, test } from 'bun:test';

import { createOpenCodeResponseTransform, createToolNameRestoreTransform } from './opencode-protocol.ts';

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

const collectRestored = (input: string, toolNameMap: Map<string, string>): Promise<string> =>
  new Promise((resolve, reject) => {
    const transform = createToolNameRestoreTransform(toolNameMap);
    if (!transform) {
      reject(new Error('Expected a tool-name restore transform.'));
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

const parseOpenAiChunks = (sse: string): Array<Record<string, any>> => sse
  .split(/\r?\n/)
  .flatMap((line) => {
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

describe('provider response stream adapters', () => {
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
  test('restores native tool aliases in OpenAI Chat SSE without changing other fields', async () => {
    const original = {
      id: 'chatcmpl_1',
      choices: [{
        index: 0,
        delta: { tool_calls: [{ index: 0, function: { name: 'read_client', arguments: '' } }] },
      }],
    };
    const input = 'data: ' + JSON.stringify(original) + '\n\ndata: [DONE]\n\n';
    const output = await collectRestored(input, new Map([['read_client', 'read']]));
    const chunks = parseOpenAiChunks(output);

    expect(chunks[0]?.choices?.[0]?.delta?.tool_calls?.[0]?.function?.name).toBe('read');
    expect(output).toContain('data: [DONE]');
  });

  test('lifts OpenCode Free reasoning aliases for OpenAI clients', async () => {
    const input = [
      'data: ' + JSON.stringify({ id: 'chatcmpl_reasoning', choices: [{ index: 0, delta: { reasoning: 'think A' } }] }),
      '',
      'data: ' + JSON.stringify({ id: 'chatcmpl_reasoning', choices: [{ index: 0, delta: { reasoning_details: [{ text: 'think B' }, { content: ' think C' }] } }] }),
      '',
      'data: ' + JSON.stringify({ id: 'chatcmpl_reasoning', choices: [{ index: 0, delta: { reasoning_content: 'canonical' } }] }),
      '',
      'data: [DONE]',
      '',
      '',
    ].join('\\n');
    const output = await collectRestored(input, new Map());
    const chunks = parseOpenAiChunks(output);

    expect(chunks[0]?.choices?.[0]?.delta?.reasoning_content).toBe('think A');
    expect(chunks[0]?.choices?.[0]?.delta?.reasoning).toBe('think A');
    expect(chunks[1]?.choices?.[0]?.delta?.reasoning_content).toBe('think B think C');
    expect(chunks[2]?.choices?.[0]?.delta?.reasoning_content).toBe('canonical');
    expect(output).toContain('data: [DONE]');
  });

});
