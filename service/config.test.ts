import { describe, expect, test } from 'bun:test';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { DEFAULT_PORT, createApiKey, createConfigStore, defaultConfig, defaultConfigPath } from './config.ts';

const withDirectory = (run: (directory: string) => void): void => {
  const directory = mkdtempSync(path.join(tmpdir(), 'blackrouter-settings-'));
  try {
    run(directory);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
};

describe('the router settings', () => {
  test('start from the shared defaults', () => {
    const config = defaultConfig();
    expect(config.port).toBe(DEFAULT_PORT);
    expect(config.upstreamApiKey).toBe('');
    expect(config.proxyPools).toEqual([]);
    expect(config.modelCombos).toEqual([]);
    expect(config.proxyStrategy).toBe('single');
    expect(config.stickyLimit).toBe(1);
    expect(config.cavemanLevel).toBe('off');
    expect(config.ponytailLevel).toBe('off');
    expect(config.apiKey.startsWith('sk-')).toBe(true);
    expect(createApiKey()).not.toBe(createApiKey());
    expect(defaultConfigPath('/home/person').endsWith(path.join('.openchamber', 'blackrouter', 'config.json'))).toBe(true);
  });

  test('write a file on first load and read it back', () => {
    withDirectory((directory) => {
      const file = path.join(directory, 'config.json');
      const store = createConfigStore(file);
      const created = store.load();
      expect(existsSync(file)).toBe(true);
      expect(JSON.parse(readFileSync(file, 'utf8'))).toEqual(created);

      store.save({ ...created, port: 25000, selectedModels: ['x-free'] });
      expect(store.load().port).toBe(25000);
      expect(store.load().selectedModels).toEqual(['x-free']);
    });
  });

  test('migrates legacy relay configuration into proxyPools', () => {
    withDirectory((directory) => {
      const file = path.join(directory, 'config.json');
      writeFileSync(
        file,
        JSON.stringify({
          version: 1,
          port: DEFAULT_PORT,
          apiKey: 'br-legacy-key',
          upstream: 'https://opencode.ai/zen/v1',
          selectedModels: [],
          relay: { kind: 'cloudflare', url: 'https://migrated.workers.dev', secret: 'abc' },
        }),
      );
      const loaded = createConfigStore(file).load();
      expect(loaded.modelCombos).toEqual([]);
      expect(loaded.cavemanLevel).toBe('off');
      expect(loaded.ponytailLevel).toBe('off');
      expect(loaded.proxyPools.length).toBe(1);
      expect(loaded.proxyPools[0]?.type).toBe('cloudflare');
      expect(loaded.proxyPools[0]?.proxyUrl).toBe('https://migrated.workers.dev');
      expect(loaded.proxyPools[0]?.isActive).toBe(true);
    });
  });

  test('move a broken file aside instead of overwriting it', () => {
    withDirectory((directory) => {
      const file = path.join(directory, 'config.json');
      writeFileSync(file, '{ not json');
      const loaded = createConfigStore(file).load();
      expect(loaded.port).toBe(DEFAULT_PORT);
      expect(readdirSync(directory).some((name) => name.startsWith('config.json.invalid-'))).toBe(true);
      expect(readFileSync(file, 'utf8')).toContain('"version": 1');
    });
  });

  test('treat a shape that no longer matches as broken', () => {
    withDirectory((directory) => {
      const file = path.join(directory, 'config.json');
      writeFileSync(file, JSON.stringify({ version: 1, port: 'twenty' }));
      expect(createConfigStore(file).load().port).toBe(DEFAULT_PORT);
      expect(readFileSync(file, 'utf8')).toContain('"apiKey"');
    });
  });
});
