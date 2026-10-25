import { describe, expect, test } from 'bun:test';

import { parseRetryAfterMs } from './retry-after.ts';

describe('parseRetryAfterMs', () => {
  const now = Date.UTC(2026, 9, 25, 12, 0, 0);

  test('parses delta-seconds', () => {
    expect(parseRetryAfterMs('30', now)).toBe(30_000);
    expect(parseRetryAfterMs('1.5', now)).toBe(1_500);
  });

  test('parses HTTP-date', () => {
    const retryAt = new Date(now + 45_000).toUTCString();
    expect(parseRetryAfterMs(retryAt, now)).toBe(45_000);
  });

  test('uses a short floor for zero or expired timestamps', () => {
    expect(parseRetryAfterMs('0', now)).toBe(1_000);
    expect(parseRetryAfterMs(new Date(now - 10_000).toUTCString(), now)).toBe(1_000);
  });

  test('caps long waits at one hour', () => {
    expect(parseRetryAfterMs('7200', now)).toBe(60 * 60_000);
    expect(parseRetryAfterMs(new Date(now + 4 * 60 * 60_000).toUTCString(), now)).toBe(60 * 60_000);
  });

  test('rejects signed values instead of parsing them as legacy dates', () => {
    expect(parseRetryAfterMs('-1', now)).toBe(5 * 60_000);
    expect(parseRetryAfterMs('+1', now)).toBe(5 * 60_000);
  });

  test('falls back for missing or invalid values', () => {
    expect(parseRetryAfterMs(undefined, now)).toBe(5 * 60_000);
    expect(parseRetryAfterMs('later', now)).toBe(5 * 60_000);
    expect(parseRetryAfterMs('', now, 20_000)).toBe(20_000);
  });
});
