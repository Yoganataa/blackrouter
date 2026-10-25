import { describe, expect, test } from 'bun:test';

import { aggregateStream } from './sse.ts';

const event = (payload: unknown): string => `data: ${JSON.stringify(payload)}\n\n`;

describe('folding a stream into one answer', () => {
  test('joins content, thinking and usage', () => {
    const text =
      event({ id: 'chatcmpl-1', model: 'x-free', created: 42, choices: [{ index: 0, delta: { role: 'assistant', content: 'Hel' } }] }) +
      event({ id: 'chatcmpl-1', choices: [{ index: 0, delta: { content: 'lo' } }] }) +
      event({ id: 'chatcmpl-1', choices: [{ index: 0, delta: {}, finish_reason: 'stop' }], usage: { prompt_tokens: 3, completion_tokens: 2 } }) +
      'data: [DONE]\n\n';

    expect(aggregateStream(text)).toEqual({
      id: 'chatcmpl-1',
      object: 'chat.completion',
      created: 42,
      model: 'x-free',
      choices: [
        {
          index: 0,
          message: { role: 'assistant', content: 'Hello' },
          finish_reason: 'stop',
        },
      ],
      usage: { prompt_tokens: 3, completion_tokens: 2 },
    });
  });

  test('joins tool call fragments by index', () => {
    const text =
      event({ choices: [{ index: 0, delta: { tool_calls: [{ index: 1, id: 'call_b', function: { name: 'shell', arguments: '{"comm' } }] } }] }) +
      event({ choices: [{ index: 0, delta: { tool_calls: [{ index: 0, id: 'call_a', function: { name: 'read', arguments: '{"path":"a"}' } }] } }] }) +
      event({ choices: [{ index: 0, delta: { tool_calls: [{ index: 1, function: { arguments: 'and":"ls"}' } }] } }] }) +
      event({ choices: [{ index: 0, delta: {}, finish_reason: 'tool_calls' }] });

    const answer = aggregateStream(text);
    const message = (answer.choices as Array<{ message: { tool_calls: Array<unknown> } }>)[0]?.message;
    expect(message?.tool_calls).toEqual([
      { id: 'call_a', type: 'function', function: { name: 'read', arguments: '{"path":"a"}' } },
      { id: 'call_b', type: 'function', function: { name: 'shell', arguments: '{"command":"ls"}' } },
    ]);
    expect((answer.choices as Array<{ finish_reason: string }>)[0]?.finish_reason).toBe('tool_calls');
  });

  test('passes an upstream error object through', () => {
    const text = event({ error: { type: 'FreeTierError', message: 'nope' } });
    expect(aggregateStream(text)).toEqual({ error: { type: 'FreeTierError', message: 'nope' } });
  });

  test('survives junk between events', () => {
    const text = `: keep-alive\n\nnot data\n${event({ choices: [{ index: 0, delta: { content: 'ok' } }] })}`;
    const answer = aggregateStream(text);
    const message = (answer.choices as Array<{ message: { content: string } }>)[0]?.message;
    expect(message?.content).toBe('ok');
  });
});
