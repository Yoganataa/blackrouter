import { describe, expect, test } from 'bun:test';

import { prepareChat, sessionId } from './zen.ts';
// @ts-ignore - the selected provider core is copied from upstream JavaScript.
import { prepareProviderRequest } from './core/provider-adapter.js';

const SESSION_RE = /^ses_[0-9a-f]{12}[0-9A-Za-z]{14}$/;

describe('native provider core', () => {
  test('uses the provider executor session-id generator', () => {
    expect(sessionId()).toMatch(SESSION_RE);
    expect(sessionId()).not.toBe(sessionId());
  });

  test('prepares chat input without duplicating provider fingerprint logic', () => {
    const prepared = prepareChat(JSON.stringify({
      model: 'big-pickle',
      messages: [{ role: 'user', content: 'hello' }],
      stream: false,
    }), { rtkEnabled: false });

    const body = JSON.parse(prepared.body);
    expect(prepared.stream).toBe(false);
    expect(body.stream).toBe(true);
    expect(body.tools).toBeUndefined();
    expect(body.messages[0].content).toBe('hello');
  });

  test('native OpenCode executor owns chat URL, headers, and fingerprint tools', async () => {
    const session = sessionId();
    const prepared = await prepareProviderRequest({
      model: 'big-pickle',
      body: { model: 'big-pickle', messages: [{ role: 'user', content: 'hello' }], stream: false },
      session,
    });

    expect(prepared.url.toString()).toBe('https://opencode.ai/inference/v1/chat/completions');
    expect(prepared.headers.authorization).toBe('Bearer public');
    expect(prepared.headers['user-agent']).toBe('opencode/latest/2.0.26/cli');
    expect(prepared.headers['x-opencode-session']).toBe(session);
    expect(prepared.headers['x-opencode-session-id']).toBe(session);

    const body = JSON.parse(prepared.body);
    expect(body.stream).toBe(true);
    const names = body.tools.map((tool: any) => tool?.function?.name ?? tool?.name);
    expect(names).toContain('read');
    expect(names).toContain('shell');
  });

  test('native translator and executor select the Responses endpoint for Muse Spark', async () => {
    const prepared = await prepareProviderRequest({
      model: 'muse-spark-1.3-contributor-free',
      body: {
        model: 'muse-spark-1.3-contributor-free',
        messages: [
          { role: 'system', content: 'Be concise.' },
          { role: 'user', content: 'Summarize this.' },
        ],
        max_tokens: 8,
        stream: false,
      },
      session: sessionId(),
    });

    expect(prepared.url.toString()).toBe('https://opencode.ai/inference/v1/responses');
    const body = JSON.parse(prepared.body);
    expect(body.input).toBeInstanceOf(Array);
    expect(body.messages).toBeUndefined();
    expect(body.instructions).toBe('Be concise.');
    expect(body.stream).toBe(true);
    expect(body.store).toBe(false);
  });

  test('native translator and executor select the Messages endpoint for Union Alpha', async () => {
    const prepared = await prepareProviderRequest({
      model: 'union-alpha',
      body: {
        model: 'union-alpha',
        messages: [
          { role: 'system', content: 'Use tools where useful.' },
          { role: 'user', content: 'List files.' },
        ],
        max_tokens: 128,
        stream: false,
      },
      session: sessionId(),
    });

    expect(prepared.url.toString()).toBe('https://opencode.ai/inference/v1/messages');
    expect(prepared.headers['anthropic-version']).toBe('2023-06-01');
    const body = JSON.parse(prepared.body);
    expect(body.stream).toBe(true);
    expect(body.messages).toBeInstanceOf(Array);
    expect(body.messages[0].role).toBe('user');
    expect(body.system).toContain('Use tools where useful.');
    expect(body.system).toContain('Do not call the read and shell tools');
    expect(body.tools.some((tool: any) => tool.name === 'read' && tool.input_schema && !tool.function)).toBe(true);
    expect(body.tools.some((tool: any) => tool.name === 'shell' && tool.input_schema && !tool.function)).toBe(true);
    expect(body.tools.every((tool: any) => !tool.function)).toBe(true);
  });
});

describe('preparing a client chat body', () => {
  test('forces upstream streaming while preserving the client output preference', () => {
    const streamed = prepareChat(JSON.stringify({ model: 'x-free', messages: [{ role: 'user', content: 'hi' }], stream: true }));
    expect(streamed.stream).toBe(true);
    expect(JSON.parse(streamed.body).stream).toBe(true);
    expect(streamed.model).toBe('x-free');

    const plain = prepareChat(JSON.stringify({ model: 'x-free', messages: [{ role: 'user', content: 'hi' }] }));
    expect(plain.stream).toBe(false);
    expect(JSON.parse(plain.body).stream).toBe(true);
  });

  test('keeps response-style profiles independent from provider transformation', () => {
    const prepared = prepareChat(JSON.stringify({
      model: 'x-free',
      messages: [{ role: 'user', content: 'Explain this error.' }],
    }), { rtkEnabled: false, cavemanLevel: 'ultra' });
    const parsed = JSON.parse(prepared.body);
    expect(parsed.messages[0].role).toBe('system');
    expect(parsed.messages[0].content).toContain('fewest words');
    expect(parsed.messages[1].role).toBe('user');
  });

  test('refuses a body that is not a chat request', () => {
    expect(() => prepareChat('not json')).toThrow(/not JSON/);
    expect(() => prepareChat('[]')).toThrow(/JSON object/);
    expect(() => prepareChat('{"model":"x-free"}')).toThrow(/no messages/);
  });

  test('maps max_completion_tokens to max_tokens for chat compatibility', () => {
    const prepared = prepareChat(JSON.stringify({
      model: 'x-free',
      messages: [{ role: 'user', content: 'hi' }],
      max_completion_tokens: 4096,
    }), { rtkEnabled: false });
    expect(JSON.parse(prepared.body).max_tokens).toBe(4096);
  });

  test('applies RTK message compression when enabled', () => {
    let diff = 'diff --git a/test.ts b/test.ts\n@@ -1,1 +1,200 @@\n';
    for (let i = 0; i < 200; i++) diff += '+line ' + i + '\n';

    const prepared = prepareChat(JSON.stringify({
      model: 'x-free',
      messages: [{ role: 'tool', content: diff }],
    }), true);
    expect(JSON.parse(prepared.body).messages[0].content).toContain('lines truncated');
  });

  test('bypasses RTK message compression when disabled', () => {
    let diff = 'diff --git a/test.ts b/test.ts\n@@ -1,1 +1,200 @@\n';
    for (let i = 0; i < 200; i++) diff += '+line ' + i + '\n';

    const prepared = prepareChat(JSON.stringify({
      model: 'x-free',
      messages: [{ role: 'tool', content: diff }],
    }), false);
    expect(JSON.parse(prepared.body).messages[0].content).toBe(diff);
  });
});
