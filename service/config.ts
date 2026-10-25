import { randomBytes } from 'node:crypto';
import { chmodSync, existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';

import { routerConfigSchema, type RouterConfig } from '../contract.ts';

/**
 * Where BlackRouter keeps its own settings.
 *
 * The service owns this file, not the panel: the router has to come up with
 * the same key and port after OpenChamber restarts, before anyone opens the
 * panel. The file holds the local API key and proxy pool settings, written
 * with owner-only permissions.
 */

/** 9router's default port, kept so an existing client config keeps working. */
export const DEFAULT_PORT = 20128;
export const OPENCODE_ZEN = 'https://opencode.ai/zen/v1';

export const createApiKey = (): string => `sk-${randomBytes(24).toString('hex')}`;

export const defaultConfig = (): RouterConfig => ({
  version: 1,
  port: DEFAULT_PORT,
  apiKey: createApiKey(),
  upstream: OPENCODE_ZEN,
  selectedModels: [],
  fallbackModels: [],
  modelCombos: [],
  proxyPools: [],
  proxyStrategy: 'single',
  activePoolId: null,
  stickyLimit: 1,
  rtkEnabled: true,
});

export const defaultConfigPath = (home = homedir()): string =>
  path.join(home, '.openchamber', 'blackrouter', 'config.json');

const writeOwnerOnly = (file: string, text: string): void => {
  mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
  const temporary = `${file}.tmp`;
  writeFileSync(temporary, text, { encoding: 'utf8', mode: 0o600 });
  renameSync(temporary, file);
  try {
    chmodSync(file, 0o600);
  } catch {
    // Windows ignores the mode bits on most filesystems; the file still lands
    // in the user's profile, which is the protection that matters there.
  }
};

export type ConfigStore = {
  path: string;
  load(): RouterConfig;
  save(config: RouterConfig): void;
};

/**
 * Read the settings, or start from defaults.
 *
 * A file that no longer parses is moved aside instead of overwritten: it may
 * be the only copy of custom settings the user still has in their notes.
 */
export const createConfigStore = (file = defaultConfigPath()): ConfigStore => ({
  path: file,
  load: () => {
    if (!existsSync(file)) {
      const config = defaultConfig();
      writeOwnerOnly(file, `${JSON.stringify(config, null, 2)}\n`);
      return config;
    }

    let raw: unknown;
    try {
      raw = JSON.parse(readFileSync(file, 'utf8'));
    } catch (error) {
      const aside = `${file}.invalid-${Date.now()}`;
      renameSync(file, aside);
      console.error(`[blackrouter] could not read ${file}, moved it to ${aside}:`, error);
      const config = defaultConfig();
      writeOwnerOnly(file, `${JSON.stringify(config, null, 2)}\n`);
      return config;
    }

    if (raw && typeof raw === 'object') {
      const rawObj = raw as Record<string, unknown>;
      if (typeof rawObj.apiKey === 'string' && !rawObj.apiKey.startsWith('sk-')) {
        rawObj.apiKey = rawObj.apiKey.startsWith('br-')
          ? `sk-${rawObj.apiKey.slice(3)}`
          : `sk-${rawObj.apiKey}`;
      }
      if (!('proxyPools' in rawObj)) {
        const legacyRaw = raw as { relay?: { kind?: string; url?: string } };
        if (legacyRaw.relay && legacyRaw.relay.url) {
          rawObj.proxyPools = [
            {
              id: 'legacy-relay',
              name: `${legacyRaw.relay.kind || 'Legacy'} Relay`,
              type: legacyRaw.relay.kind === 'none' ? 'http' : legacyRaw.relay.kind || 'http',
              proxyUrl: legacyRaw.relay.url,
              isActive: true,
            },
          ];
        } else {
          rawObj.proxyPools = [];
        }
      }
    }

    const parsed = routerConfigSchema.safeParse(raw);
    if (!parsed.success) {
      const aside = `${file}.invalid-${Date.now()}`;
      renameSync(file, aside);
      console.error(`[blackrouter] ${file} did not match the settings shape, moved it to ${aside}`);
      const config = defaultConfig();
      writeOwnerOnly(file, `${JSON.stringify(config, null, 2)}\n`);
      return config;
    }
    return parsed.data;
  },
  save: (config) => {
    const parsed = routerConfigSchema.parse(config);
    writeOwnerOnly(file, `${JSON.stringify(parsed, null, 2)}\n`);
  },
});
