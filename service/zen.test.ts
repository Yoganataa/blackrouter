import { describe, expect, test } from 'bun:test';

// @ts-ignore - upstream core modules are JavaScript and intentionally retain source parity.
import {
  applyEnvFingerprint,
  applyFingerprintTools,
} from './core/utils/opencodeFingerprint.js';
// @ts-ignore - upstream core modules are JavaScript and intentionally retain source parity.
import { translateSessionId } from './core/executors/opencode.js';
// @ts-ignore - native capability modules are copied from upstream JavaScript.
import { getCapabilitiesForModel } from './core/providers/capabilities.js';
// @ts-ignore - native capability modules are copied from upstream JavaScript.
import { getThinkingLevels } from './core/providers/thinkingLevels.js';

type FingerprintTool = {
  type?: string;
  name?: string;
  function?: {
    name?: string;
    description?: string;
    parameters?: { required?: string[]; [key: string]: unknown };
  };
  [key: string]: unknown;
};

type FingerprintBody = {
  instructions?: string;
  system?: string;
  tools: FingerprintTool[];
  messages: Array<{ role: string; content: string }>;
};

describe('official OpenCode free-tier regressions adapted from 9Router #5222', () => {
  test('adds the CLI environment marker without replacing caller instructions', () => {
    const responses = { instructions: 'Keep answers brief.' };
    expect(applyEnvFingerprint(responses, true)).toBe(true);
    expect(responses.instructions).toContain('Keep answers brief.');
    expect(responses.instructions).toContain('<env>');
    expect(responses.instructions).toContain('Working directory:');
  });

  test('does not duplicate an existing CLI environment marker', () => {
    const body = { instructions: 'Caller prompt\n<env>\nexisting\n</env>' };
    expect(applyEnvFingerprint(body, true)).toBe(false);
    expect(body.instructions.match(/<env>/g)).toHaveLength(1);
  });

  test('fingerprints OpenCode read/shell tools and accepts host shell wording', () => {
    const body: FingerprintBody = { tools: [], messages: [{ role: 'user', content: 'hello' }] };
    applyFingerprintTools(body, false);
    const shell = body.tools.find((tool) => tool.function?.name === 'shell');
    expect(shell).toBeDefined();
    if (!shell?.function) throw new Error('OpenCode shell fingerprint tool was not generated');
    expect(shell.function.description).toContain('Execute a shell command');
    expect(shell.function.parameters?.required).toEqual(['command']);
  });


  test('fingerprints Messages requests in the top-level system field', () => {
    const body: FingerprintBody = { tools: [], messages: [{ role: 'user', content: 'hello' }] };
    applyFingerprintTools(body, false, { claude: true });
    expect(body.system).toContain('<env>');
    expect(body.system).toContain('Working directory:');
    expect(body.messages.some((message: { role?: string }) => message.role === 'system')).toBe(false);
    const shell = body.tools.find((tool: { function?: { name?: string } }) => tool.function?.name === 'shell');
    expect(shell).toBeDefined();
  });

  test('uses a current-time, stable translated session for foreign conversation ids', () => {
    const before = Date.now();
    const id = translateSessionId('claude:conversation-5222-regression', 'claude');
    const after = Date.now();
    expect(id).toMatch(SESSION_RE);
    expect(translateSessionId('claude:conversation-5222-regression', 'claude')).toBe(id);

    // The 12-hex prefix stores a 36-bit millisecond timestamp, so compare
    // circularly modulo 2^36 just like the upstream regression test.
    const MOD = 2 ** 36;
    const timestampField = BigInt('0x' + id.slice(4, 16));
    const counter = Number((~timestampField) & 0xfffn);
    const decodedTime = Number(((~timestampField) & ((1n << 48n) - 1n)) >> 12n);
    const circularDistance = (a: number, b: number) =>
      Math.min((a - b + MOD) % MOD, (b - a + MOD) % MOD);

    expect(counter).toBe(1);
    expect(circularDistance(decodedTime, before % MOD)).toBeLessThanOrEqual(after - before + 1000);
  });
});



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
    expect(prepared.headers['user-agent']).toBe('opencode/latest/2.1.4/cli');
    expect(prepared.headers['x-opencode-session']).toBe(session);
    expect(prepared.headers['x-opencode-session-id']).toBe(session);

    const body = JSON.parse(prepared.body);
    expect(body.stream).toBe(true);
    const names = body.tools.map((tool: any) => tool?.function?.name ?? tool?.name);
    expect(names).toContain('read');
    expect(names).toContain('shell');
  });


  test('translates foreign conversation sessions to a current timestamp and reuses them', async () => {
    const before = Date.now();
    const first = await prepareProviderRequest({
      model: 'big-pickle',
      body: { model: 'big-pickle', messages: [{ role: 'user', content: 'hello' }], stream: true },
      session: 'claude:timestamp-regression',
    });
    const after = Date.now();
    const session = first.headers['x-opencode-session'];
    const prefix = BigInt('0x' + session.slice(4, 16));
    const decoded = Number((~prefix & ((1n << 48n) - 1n)) >> 12n);
    const mod = 2 ** 36;
    const distance = Math.min((decoded - (before % mod) + mod) % mod, ((before % mod) - decoded + mod) % mod);
    expect(distance).toBeLessThanOrEqual(after - before + 1000);

    const second = await prepareProviderRequest({
      model: 'big-pickle',
      body: { model: 'big-pickle', messages: [{ role: 'user', content: 'continue' }], stream: true },
      session: 'claude:timestamp-regression',
    });
    expect(second.headers['x-opencode-session']).toBe(session);
  });

  test('adds an OpenCode environment marker without replacing caller instructions', async () => {
    const prepared = await prepareProviderRequest({
      model: 'muse-spark-1.3-contributor-free',
      body: { model: 'muse-spark-1.3-contributor-free', messages: [
        { role: 'system', content: 'Preserve my system instructions.' },
        { role: 'user', content: 'hello' },
      ], stream: true },
      session: sessionId(),
    });
    const body = JSON.parse(prepared.body);
    expect(body.instructions).toContain('Preserve my system instructions.');
    expect(body.instructions).toContain('<env>');
    expect(body.instructions).toContain('Workspace root folder:');
  });

  test('preserves a map for caller tools renamed by the native executor', async () => {
    const prepared = await prepareProviderRequest({
      model: 'blackrouter/big-pickle',
      body: {
        model: 'blackrouter/big-pickle',
        messages: [{ role: 'user', content: 'Use my file-reading tool.' }],
        tools: [{
          type: 'function',
          function: {
            name: 'read',
            description: 'Caller-defined read tool.',
            parameters: { type: 'object', properties: { path: { type: 'string' } } },
          },
        }],
        stream: true,
      },
      session: sessionId(),
    });

    expect(prepared.toolNameMap).toBeInstanceOf(Map);
    expect(prepared.toolNameMap.get('read_client')).toBe('read');
    const body = JSON.parse(prepared.body);
    const names = body.tools.map((tool: any) => tool?.function?.name ?? tool?.name);
    expect(names).toContain('read_client');
    expect(names).toContain('read');
    expect(names).toContain('shell');
  });

  test('matches the native Responses route for future Muse Spark catalog variants', async () => {
    const prepared = await prepareProviderRequest({
      model: 'blackrouter/muse-spark-1.4-contributor-free',
      body: {
        model: 'blackrouter/muse-spark-1.4-contributor-free',
        messages: [{ role: 'user', content: 'hello' }],
        max_tokens: 8,
        stream: true,
      },
      session: sessionId(),
    });

    expect(prepared.url.toString()).toBe('https://opencode.ai/inference/v1/responses');
    expect(JSON.parse(prepared.body).input).toBeInstanceOf(Array);
    expect(prepared.lane).toBe('responses');
  });

  test('uses the native Chat route for unlisted OpenCode Free models', async () => {
    const prepared = await prepareProviderRequest({
      model: 'blackrouter/mimo-v2.6-flash-free',
      body: {
        model: 'blackrouter/mimo-v2.6-flash-free',
        messages: [{ role: 'user', content: 'hello' }],
        stream: true,
      },
      session: sessionId(),
    });

    expect(prepared.url.toString()).toBe('https://opencode.ai/inference/v1/chat/completions');
    expect(JSON.parse(prepared.body).model).toBe('mimo-v2.6-flash-free');
    expect(prepared.lane).toBe('chat');
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
    expect(body.instructions).toContain('Be concise.');
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
    expect(body.system.map((block: any) => block.text ?? '').join('\n')).toContain('Use tools where useful.');
    expect(body.system.map((block: any) => block.text ?? '').join('\n')).toContain('Do not call the `read` or `shell` tools');
    expect(body.tools.some((tool: any) => tool.name === 'read' && tool.input_schema && !tool.function)).toBe(true);
    expect(body.tools.some((tool: any) => tool.name === 'shell' && tool.input_schema && !tool.function)).toBe(true);
    expect(body.tools.every((tool: any) => !tool.function)).toBe(true);
  });
});


describe('upstream OpenCode fingerprint collision normalization', () => {
  test('normalizes host-specific shell wording in place when the schema is compatible', async () => {
    // @ts-ignore - upstream helper is JavaScript and intentionally retains source parity.
    // @ts-ignore - upstream helper is JavaScript and intentionally retains source parity.
    const { concealFingerprintToolNames } = await import('./core/utils/opencodeFingerprint.js');
    const shell = {
      type: 'function',
      function: {
        name: 'shell',
        description: 'Execute a shell command and return its output. Commands run on Windows using powershell. Quote file paths containing spaces or special characters. Prefer dedicated tools over shell commands when possible. When output is large, the full result is saved to a file and a truncated preview is returned. Rely on automatic truncation unless filtering the output is more useful. Commands accept an optional timeout, background commands have no timeout by default. Background commands return immediately, and you will be notified when they complete.',
        parameters: { type: 'object', properties: { command: { type: 'string' } }, required: ['command'] },
      },
    };
    const { tools, map } = concealFingerprintToolNames([shell]);
    expect(map.size).toBe(0);
    expect(tools.map((tool: any) => tool.function?.name ?? tool.name)).toEqual(['shell']);
    expect((tools[0] as any).function.description).toContain('Linux using bash');
    expect(tools.some((tool: any) => tool.function?.name === 'shell_client')).toBe(false);
  });

  test('keeps colliding aliases unique when shell_client is already a caller tool', async () => {
    // @ts-ignore - upstream helper is JavaScript and intentionally retains source parity.
    const { concealFingerprintToolNames } = await import('./core/utils/opencodeFingerprint.js');
    const tools = [
      { type: 'function', function: { name: 'shell_client', description: 'caller plugin', parameters: { type: 'object', properties: {} } } },
      { type: 'function', function: { name: 'shell', description: 'caller shell', parameters: { type: 'object', properties: { command: { type: 'string' }, custom: { type: 'string' } }, required: ['command', 'custom'] } } },
    ];
    const result = concealFingerprintToolNames(tools);
    const names = result.tools.map((tool: any) => tool.function?.name ?? tool.name);
    expect(names).toContain('shell_client');
    expect(names).toContain('shell_client2');
    expect(new Set(names).size).toBe(names.length);
    expect(result.map.get('shell_client2')).toBe('shell');
  });
});

describe('native TLS transport is passed through', () => {
  test('exposes a callable direct TLS fetch on native OpenCode Free requests', async () => {
    const prepared = await prepareProviderRequest({ model: 'oc/big-pickle', body: { model: 'oc/big-pickle', messages: [{ role: 'user', content: 'Hello' }] }, session: 'tls-seam-test' });
    expect(typeof prepared.directFetch).toBe('function');
    expect(prepared.url.toString()).toContain('/inference/v1/chat/completions');

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
describe('official OpenCode Free model reasoning fixes', () => {
  test('publishes the full OpenAI reasoning enum for MiMo v2.6 Free', () => {
    expect(getCapabilitiesForModel('opencode', 'mimo-v2.6-flash-free')).toMatchObject({
      reasoning: true,
      thinkingFormat: 'openai',
      thinkingCanDisable: true,
      contextWindow: 1048576,
      maxOutput: 131072,
    });
    expect(getThinkingLevels('opencode', 'oc/mimo-v2.6-flash-free')).toEqual([
      'none', 'minimal', 'low', 'medium', 'high', 'xhigh', 'max',
    ]);
  });

  test('keeps GLM 5.3 Free on reasoning_effort and never advertises disable', () => {
    expect(getCapabilitiesForModel('opencode', 'glm-5.3-flash-free')).toMatchObject({
      reasoning: true,
      thinkingFormat: 'openai',
      thinkingCanDisable: false,
    });
    expect(getThinkingLevels('opencode', 'glm-5.3-flash-free')).toEqual([
      'minimal', 'low', 'medium', 'high', 'xhigh',
    ]);
  });

  test('advertises low/high/max for DeepSeek v4.1 Flash Free and caps its context', () => {
    expect(getCapabilitiesForModel('opencode', 'deepseek-v4.1-flash-free')).toMatchObject({
      reasoning: true,
      thinkingFormat: 'deepseek',
      contextWindow: 330000,
      maxOutput: 128000,
    });
    expect(getThinkingLevels('opencode', 'oc/deepseek-v4.1-flash-free')).toEqual([
      'low', 'high', 'max',
    ]);
  });
});

});
