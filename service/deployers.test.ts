import { describe, expect, test } from 'bun:test';

import { CLOUDFLARE_WORKER_CODE, DENO_RELAY_CODE, NETLIFY_RELAY_CODE, testRelay, testRelayOrProxy } from './deployers.ts';

describe('deployers testRelay', () => {

  test('redacts credentials in relay connectivity-test failures', async () => {
    const mockFetch = async () => {
      throw new Error('request to https://alice:relay-secret@relay.example/?api_key=relay-key failed');
    };
    const result = await testRelay('https://test-relay.workers.dev', 5000, mockFetch as unknown as typeof fetch);
    expect(result.ok).toBe(false);
    expect(result.error).not.toContain('alice');
    expect(result.error).not.toContain('relay-secret');
    expect(result.error).not.toContain('relay-key');
  });

  test('generated relay handlers do not return raw exception messages', () => {
    for (const source of [CLOUDFLARE_WORKER_CODE, DENO_RELAY_CODE, NETLIFY_RELAY_CODE]) {
      expect(source).not.toContain('error.message');
      expect(source).toContain('Relay fetch failed');
    }
  });

  test('returns ok: true when relay responds successfully to test request', async () => {
    let capturedTarget = '';
    let capturedPath = '';

    const mockFetch = async (_url: string | URL | Request, init?: RequestInit) => {
      const headers = init?.headers as Record<string, string>;
      capturedTarget = headers['x-relay-target'] || '';
      capturedPath = headers['x-relay-path'] || '';
      return new Response(JSON.stringify({ url: 'https://httpbin.org/get' }), {
        status: 200,
        statusText: 'OK',
      });
    };

    const res = await testRelay('https://test-relay.workers.dev', 5000, mockFetch as unknown as typeof fetch);
    expect(res.ok).toBe(true);
    expect(res.status).toBe(200);
    expect(capturedTarget).toBe('https://httpbin.org');
    expect(capturedPath).toBe('/get');
  });

  test('returns ok: false when relay returns non-200 status', async () => {
    const mockFetch = async () =>
      new Response(JSON.stringify({ error: 'Gateway timeout' }), {
        status: 504,
        statusText: 'Gateway Timeout',
      });

    const res = await testRelay('https://test-relay.workers.dev', 5000, mockFetch as unknown as typeof fetch);
    expect(res.ok).toBe(false);
    expect(res.status).toBe(504);
    expect(res.error).toContain('504');
  });

  test('returns ok: false when fetch throws error', async () => {
    const mockFetch = async () => {
      throw new Error('Network error');
    };

    const res = await testRelay('https://test-relay.workers.dev', 5000, mockFetch as unknown as typeof fetch);
    expect(res.ok).toBe(false);
    expect(res.status).toBe(500);
    expect(res.error).toBe('Network error');
  });

  test('testRelayOrProxy delegates to testRelay for serverless relays', async () => {
    let called = false;
    const mockFetch = async () => {
      called = true;
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    };
    const res = await testRelayOrProxy(
      { type: 'cloudflare', proxyUrl: 'https://relay.workers.dev' },
      5000,
      mockFetch as unknown as typeof fetch,
    );
    expect(called).toBe(true);
    expect(res.ok).toBe(true);
  });
});
