import { describe, expect, test } from 'bun:test';

import { ensureFreeTierTools, freeTierHeaders, prepareChat, requestId, sessionId } from './zen.ts';

const SESSION_RE = /^ses_[0-9a-f]{12}[0-9A-Za-z]{14}$/;
const REQUEST_RE = /^msg_[0-9a-f]{12}[0-9A-Za-z]{14}$/;

describe('the free-tier identity', () => {
  test('mints ids in the shape the upstream checks', () => {
    expect(sessionId()).toMatch(SESSION_RE);
    expect(requestId()).toMatch(REQUEST_RE);
    expect(sessionId()).not.toBe(sessionId());
    expect(requestId()).not.toBe(requestId());
  });

  test('carries the headers every call needs', () => {
    const headers = freeTierHeaders('ses_0123456789abcdefghijklmn');
    expect(headers.authorization).toBe('Bearer public');
    expect(headers['user-agent']).toMatch(/^opencode\/(latest|\d+)/);
    expect(headers['x-opencode-client']).toBe('cli');
    expect(headers['x-opencode-session']).toBe('ses_0123456789abcdefghijklmn');
    expect(headers['x-opencode-session-id']).toBe('ses_0123456789abcdefghijklmn');
  });
});

describe('making a client body acceptable', () => {
  test('adds the gate tools without touching the caller ones', () => {
    const body = {
      tools: [{ type: 'function', function: { name: 'write', parameters: { type: 'object' } } }],
    };
    ensureFreeTierTools(body);
    const names = (body.tools as Array<{ function: { name: string } }>).map((tool) => tool.function.name);
    expect(names).toEqual(['write', 'read', 'shell']);
  });

  test('keeps a caller tool that already has a gate name', () => {
    const body = {
      tools: [{ type: 'function', function: { name: 'read', description: 'mine', parameters: { type: 'object' } } }],
    };
    ensureFreeTierTools(body);
    expect((body.tools as Array<{ function: { description: string } }>)[0]?.function.description).toBe('mine');
    expect(body.tools).toHaveLength(2);
  });

  test('forces the stream the upstream insists on, and remembers the client choice', () => {
    const streamed = prepareChat(JSON.stringify({ model: 'x-free', messages: [], stream: true }));
    expect(streamed.stream).toBe(true);
    expect(JSON.parse(streamed.body).stream).toBe(true);
    expect(streamed.model).toBe('x-free');

    const plain = prepareChat(JSON.stringify({ model: 'x-free', messages: [] }));
    expect(plain.stream).toBe(false);
    expect(JSON.parse(plain.body).stream).toBe(true);
  });

  test('refuses a body that is not a chat request', () => {
    expect(() => prepareChat('not json')).toThrow(/not JSON/);
    expect(() => prepareChat('[]')).toThrow(/JSON object/);
    expect(() => prepareChat('{"model":"x-free"}')).toThrow(/no messages/);
  });

  test('maps max_completion_tokens to max_tokens for chat completions compatibility', () => {
    const prepared = prepareChat(
      JSON.stringify({ model: 'x-free', messages: [], max_completion_tokens: 4096 }),
    );
    const parsed = JSON.parse(prepared.body);
    expect(parsed.max_tokens).toBe(4096);
  });

  test('applies RTK message compression when enabled', () => {
    let diff = 'diff --git a/test.ts b/test.ts\n@@ -1,1 +1,200 @@\n';
    for (let i = 0; i < 200; i++) diff += `+line ${i}\n`;

    const prepared = prepareChat(
      JSON.stringify({
        model: 'x-free',
        messages: [{ role: 'tool', content: diff }],
      }),
      true,
    );
    const parsed = JSON.parse(prepared.body);
    expect(parsed.messages[0].content).toContain('lines truncated');
  });

  test('bypasses RTK message compression when rtkEnabled is false', () => {
    let diff = 'diff --git a/test.ts b/test.ts\n@@ -1,1 +1,200 @@\n';
    for (let i = 0; i < 200; i++) diff += `+line ${i}\n`;

    const prepared = prepareChat(
      JSON.stringify({
        model: 'x-free',
        messages: [{ role: 'tool', content: diff }],
      }),
      false,
    );
    const parsed = JSON.parse(prepared.body);
    expect(parsed.messages[0].content).toBe(diff);
  });

  test('injects placeholder reasoning_content for assistant messages missing it', () => {
    const prepared = prepareChat(
      JSON.stringify({
        model: 'deepseek-v4.1-flash-free',
        messages: [
          { role: 'user', content: 'hello' },
          { role: 'assistant', content: 'hi' },
          { role: 'user', content: 'how are you?' },
        ],
      }),
    );
    const parsed = JSON.parse(prepared.body);
    expect(parsed.messages[1].reasoning_content).toBe(' ');
  });
});
