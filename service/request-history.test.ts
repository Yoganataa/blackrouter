import { describe, expect, test } from 'bun:test';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { createRequestHistoryStore } from './request-history.ts';

const withTempDirectory = async (run: (directory: string) => Promise<void> | void): Promise<void> => {
  const directory = mkdtempSync(path.join(tmpdir(), 'blackrouter-history-'));
  try {
    await run(directory);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
};

const entry = (at: number) => ({
  at,
  method: 'POST',
  path: '/v1/chat/completions',
  model: 'fallback-model',
  requestedModel: 'primary-model',
  status: 200,
  ms: 125,
  poolName: 'Direct',
  fallbackUsed: true,
  fallbackReason: 'HTTP 429 (primary-model)',
  inputTokens: 300,
  outputTokens: 40,
  totalTokens: 340,
});

describe('persistent request history', () => {
  test('loads saved metadata after recreating the store', async () => {
    await withTempDirectory((directory) => {
      const configFile = path.join(directory, 'config.json');
      const first = createRequestHistoryStore(configFile);
      first.save([entry(300), entry(200)]);

      const reopened = createRequestHistoryStore(configFile);
      expect(reopened.load()).toEqual([entry(300), entry(200)]);
      const storedText = readFileSync(reopened.path, 'utf8');
      expect(storedText).not.toContain('prompt');
      expect(storedText).not.toContain('tool output');
    });
  });

  test('keeps only the most recent bounded entries', async () => {
    await withTempDirectory((directory) => {
      const store = createRequestHistoryStore(path.join(directory, 'config.json'), 2);
      store.save([entry(300), entry(200), entry(100)]);
      expect(store.load().map((item) => item.at)).toEqual([300, 200]);
    });
  });

  test('skips malformed rows and invalid entries without losing valid rows', async () => {
    await withTempDirectory((directory) => {
      const store = createRequestHistoryStore(path.join(directory, 'config.json'));
      store.save([entry(300), entry(200)]);
      writeFileSync(store.path, `{broken json}\n${JSON.stringify(entry(100))}\n`);
      expect(store.load().map((item) => item.at)).toEqual([100]);
    });
  });
});
