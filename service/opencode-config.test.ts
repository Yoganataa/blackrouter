import { describe, expect, test } from 'bun:test';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import type { RouterConfig } from '../contract.ts';
import {
  buildProviderEntry,
  parseJsonc,
  readRegistration,
  registerProvider,
  removeProvider,
  resolveConfigFile,
  stripJsonComments,
} from './opencode-config.ts';

const config: RouterConfig = {
  version: 1,
  port: 20128,
  apiKey: 'br-local-key',
  upstream: 'https://opencode.ai/zen/v1',
  selectedModels: [],
  fallbackModels: [],
  modelCombos: [],
  proxyPools: [],
  proxyStrategy: 'single',
  activePoolId: null,
  stickyLimit: 1,
  rtkEnabled: true,
};

const withTempFile = (text: string | null, run: (file: string) => void): void => {
  const directory = mkdtempSync(path.join(tmpdir(), 'blackrouter-config-'));
  const file = path.join(directory, 'opencode.json');
  if (text !== null) writeFileSync(file, text);
  try {
    run(file);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
};

describe('reading JSONC', () => {
  test('drops comments and trailing commas', () => {
    const text = `{
      // the file OpenCode reads
      "providers": { "acme": { "name": "Acme" /* inline */ } },
    }`;
    const { value, hadComments } = parseJsonc(text);
    expect(hadComments).toBe(true);
    expect(value).toEqual({ providers: { acme: { name: 'Acme' } } });
  });

  test('keeps a URL that contains a double slash', () => {
    const { text } = stripJsonComments('{ "baseURL": "https://llm.example/v1" }');
    expect(JSON.parse(text)).toEqual({ baseURL: 'https://llm.example/v1' });
  });
});

describe('which config file is written', () => {
  test('prefers json, then jsonc, then a new json', () => {
    const home = mkdtempSync(path.join(tmpdir(), 'blackrouter-home-'));
    const directory = path.join(home, '.config', 'opencode');
    mkdirSync(directory, { recursive: true });
    try {
      expect(path.basename(resolveConfigFile(home))).toBe('opencode.json');

      writeFileSync(path.join(directory, 'opencode.jsonc'), '{}');
      expect(path.basename(resolveConfigFile(home))).toBe('opencode.jsonc');

      writeFileSync(path.join(directory, 'opencode.json'), '{}');
      expect(path.basename(resolveConfigFile(home))).toBe('opencode.json');
    } finally {
      rmSync(home, { recursive: true, force: true });
    }
  });
});

describe('registering the provider', () => {
  test('adds the block, keeps every other entry, and backs the file up', () => {
    withTempFile(
      JSON.stringify(
        {
          theme: 'dark',
          providers: { acme: { name: 'Acme', package: 'aisdk:@ai-sdk/openai' } },
        },
        null,
        2,
      ),
      (file) => {
        const result = registerProvider(file, config, [
          { id: 'x-free', name: 'X' },
          { id: 'y-free', name: 'Y' },
        ]);

        const written = JSON.parse(readFileSync(file, 'utf8'));
        expect(written.theme).toBe('dark');
        expect(Object.keys(written.providers)).toEqual(['acme', 'blackrouter']);
        expect(written.providers.blackrouter).toEqual({
          name: 'BlackRouter',
          package: 'aisdk:@ai-sdk/openai-compatible',
          settings: { baseURL: 'http://127.0.0.1:20128/v1', apiKey: 'br-local-key' },
          models: {
            'x-free': {
              modelID: 'x-free',
              name: 'X',
              limit: { context: 131072, output: 8192 },
              capabilities: { tools: true, input: ['text'], output: ['text'] },
            },
            'y-free': {
              modelID: 'y-free',
              name: 'Y',
              limit: { context: 131072, output: 8192 },
              capabilities: { tools: true, input: ['text'], output: ['text'] },
            },
          },
        });
        expect(JSON.parse(readFileSync(`${file}.blackrouter.backup`, 'utf8'))).toEqual({
          theme: 'dark',
          providers: { acme: { name: 'Acme', package: 'aisdk:@ai-sdk/openai' } },
        });
        expect(result.registration).toEqual({
          providerId: 'blackrouter',
          path: file,
          installed: true,
          models: 2,
          modelIds: ['x-free', 'y-free'],
        });
        expect(result.warnings).toEqual([]);
      },
    );
  });

  test('rewrites a legacy provider entry as a providers entry', () => {
    withTempFile(JSON.stringify({ provider: { blackrouter: { name: 'old' }, other: {} } }), (file) => {
      const result = registerProvider(file, config, [{ id: 'x-free', name: 'X' }]);
      const written = JSON.parse(readFileSync(file, 'utf8'));
      expect(written.provider).toEqual({ other: {} });
      expect(written.providers.blackrouter.name).toBe('BlackRouter');
      expect(result.warnings.join(' ')).toContain('`provider` entry');
    });
  });

  test('refuses a file it cannot read and leaves it alone', () => {
    withTempFile('{ "providers": ', (file) => {
      expect(() => registerProvider(file, config, [{ id: 'x-free', name: 'X' }])).toThrow(
        /could not be read/,
      );
      expect(readFileSync(file, 'utf8')).toBe('{ "providers": ');
    });
  });
});

describe('reading and removing the registration', () => {
  test('reports nothing for a missing file', () => {
    withTempFile(null, (file) => {
      expect(readRegistration(file)).toEqual({
        providerId: 'blackrouter',
        path: file,
        installed: false,
        models: 0,
        modelIds: [],
      });
    });
  });

  test('removes only BlackRouter and drops an empty section', () => {
    withTempFile(null, (file) => {
      registerProvider(file, config, [{ id: 'x-free', name: 'X' }]);
      const result = removeProvider(file);
      const written = JSON.parse(readFileSync(file, 'utf8'));
      expect(written.providers).toBeUndefined();
      expect(result.registration.installed).toBe(false);
    });
  });

  test('keeps another provider next to ours', () => {
    withTempFile(JSON.stringify({ providers: { acme: { name: 'Acme' } } }), (file) => {
      registerProvider(file, config, [{ id: 'x-free', name: 'X' }]);
      removeProvider(file);
      expect(JSON.parse(readFileSync(file, 'utf8')).providers).toEqual({ acme: { name: 'Acme' } });
    });
  });

  test('reads a legacy entry as installed', () => {
    withTempFile(JSON.stringify({ provider: { blackrouter: { models: { 'x-free': {} } } } }), (file) => {
      expect(readRegistration(file).installed).toBe(true);
      expect(readRegistration(file).modelIds).toEqual(['x-free']);
    });
  });
});

describe('the written block', () => {
  test('carries the endpoint, the key and the picked models with enriched capabilities', () => {
    expect(
      buildProviderEntry({ port: 31000, apiKey: 'k' }, [
        { id: 'x-free', name: 'X' },
        { id: 'deepseek-r1-free', name: 'DeepSeek R1 Free' },
      ]),
    ).toEqual({
      name: 'BlackRouter',
      package: 'aisdk:@ai-sdk/openai-compatible',
      settings: { baseURL: 'http://127.0.0.1:31000/v1', apiKey: 'k' },
      models: {
        'x-free': {
          modelID: 'x-free',
          name: 'X',
          limit: { context: 131072, output: 8192 },
          capabilities: { tools: true, input: ['text'], output: ['text'] },
        },
        'deepseek-r1-free': {
          modelID: 'deepseek-r1-free',
          name: 'DeepSeek R1 Free',
          limit: { context: 131072, output: 16384 },
          capabilities: { tools: true, input: ['text'], output: ['text'] },
          variants: [
            { id: 'low', settings: { reasoningEffort: 'low' } },
            { id: 'medium', settings: { reasoningEffort: 'medium' } },
            { id: 'high', settings: { reasoningEffort: 'high' } },
          ],
        },
      },
    });
  });
});
