import { describe, expect, test } from 'bun:test';

import { createUsageObserver, extractTokenUsage } from './usage-observer.ts';

const observe = (input: string): Promise<{ output: string; usage: Array<Record<string, number>> }> =>
  new Promise((resolve, reject) => {
    const usage: Array<Record<string, number>> = [];
    const observer = createUsageObserver((item) => {
      usage.push(item as Record<string, number>);
    });
    let output = '';
    observer.on('data', (chunk: Buffer | string) => {
      output += Buffer.isBuffer(chunk) ? chunk.toString('utf8') : chunk;
    });
    observer.on('error', reject);
    observer.on('end', () => resolve({ output, usage }));
    // Split the body to exercise partial UTF-8/SSE chunks.
    observer.write(Buffer.from(input.slice(0, 13)));
    observer.end(Buffer.from(input.slice(13)));
  });

describe('token usage observer', () => {
  test('extracts OpenAI usage names and derives total tokens when needed', () => {
    expect(extractTokenUsage({ usage: { prompt_tokens: 12, completion_tokens: 4 } })).toEqual({
      inputTokens: 12,
      outputTokens: 4,
      totalTokens: 16,
    });
  });

  test('extracts Responses API usage names', () => {
    expect(extractTokenUsage({ response: { usage: { input_tokens: 9, output_tokens: 5, total_tokens: 14 } } })).toEqual({
      inputTokens: 9,
      outputTokens: 5,
      totalTokens: 14,
    });
  });

  test('passes streamed content through byte-for-byte and records usage-bearing frames', async () => {
    const input = [
      'data: ' + JSON.stringify({ choices: [{ index: 0, delta: { content: 'Hello' }, finish_reason: null }] }),
      '',
      'data: ' + JSON.stringify({ choices: [], usage: { prompt_tokens: 20, completion_tokens: 6, total_tokens: 26 } }),
      '',
      'data: [DONE]',
      '',
    ].join('\n');
    const result = await observe(input);
    expect(result.output).toBe(input);
    expect(result.usage).toEqual([{ inputTokens: 20, outputTokens: 6, totalTokens: 26 }]);
  });

  test('does not invent usage when upstream omits token metrics', async () => {
    const input = 'data: ' + JSON.stringify({ choices: [{ index: 0, delta: { content: 'hello' } }] }) + '\n\n';
    const result = await observe(input);
    expect(result.output).toBe(input);
    expect(result.usage).toEqual([]);
    expect(extractTokenUsage({ choices: [] })).toBeNull();
  });
});
