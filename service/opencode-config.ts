import { existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import path from 'node:path';

import type { JsonValue } from '../json.ts';
import { endpointFor, type Registration, type RouterConfig, type RouterModel } from '../contract.ts';
import { configUnreadable } from './errors.ts';
import { isJsonObject, type JsonObject } from './json.ts';
import { resolveModelMetadata } from './model-metadata.ts';

/**
 * Registering BlackRouter as a provider in OpenCode.
 *
 * OpenChamber has its own provider form, but a guest cannot call it: the
 * panel has no route to the server, and the service owns no session. What the
 * service can do is write the same block that form writes — a v2 `providers`
 * entry with an OpenAI-compatible package, a `settings.baseURL` and the
 * models — into the user's OpenCode config, then read it back to say what is
 * installed.
 */

export const PROVIDER_ID = 'blackrouter';
const PROVIDER_NAME = 'BlackRouter';
/** The same package OpenChamber writes for an OpenAI-compatible provider. */
const PROVIDER_PACKAGE = 'aisdk:@ai-sdk/openai-compatible';

/**
 * `opencode.json` when it exists, then `opencode.jsonc`, else a new
 * `opencode.json`. OpenCode lets the json file win, so writing a fresh
 * `opencode.json` beside someone's `opencode.jsonc` would hide their config.
 */
export const resolveConfigFile = (home = homedir(), exists = existsSync): string => {
  const directory = path.join(home, '.config', 'opencode');
  const json = path.join(directory, 'opencode.json');
  if (exists(json)) return json;
  const jsonc = path.join(directory, 'opencode.jsonc');
  if (exists(jsonc)) return jsonc;
  return json;
};

/**
 * Strip `//` and comment `/* *\/` blocks outside strings, then trailing commas.
 * OpenCode accepts JSONC; JSON.parse does not.
 */
export const stripJsonComments = (text: string): { text: string; hadComments: boolean } => {
  let out = '';
  let hadComments = false;
  let inString = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index] ?? '';
    const next = text[index + 1] ?? '';

    if (inLineComment) {
      if (char === '\n') {
        inLineComment = false;
        out += char;
      }
      continue;
    }
    if (inBlockComment) {
      if (char === '*' && next === '/') {
        inBlockComment = false;
        index += 1;
      }
      continue;
    }
    if (inString) {
      out += char;
      if (char === '\\') {
        out += next;
        index += 1;
        continue;
      }
      if (char === '"') inString = false;
      continue;
    }
    if (char === '"') {
      inString = true;
      out += char;
      continue;
    }
    if (char === '/' && next === '/') {
      hadComments = true;
      inLineComment = true;
      index += 1;
      continue;
    }
    if (char === '/' && next === '*') {
      hadComments = true;
      inBlockComment = true;
      index += 1;
      continue;
    }
    out += char;
  }

  return { text: out.replace(/,(\s*[}\]])/g, '$1'), hadComments };
};

export const parseJsonc = (text: string): { value: JsonValue; hadComments: boolean } => {
  const stripped = stripJsonComments(text);
  const value: JsonValue = JSON.parse(stripped.text);
  return { value, hadComments: stripped.hadComments };
};

const readConfig = (file: string): { data: JsonObject; hadComments: boolean; existed: boolean } => {
  if (!existsSync(file)) {
    return { data: { $schema: 'https://opencode.ai/config.json' }, hadComments: false, existed: false };
  }
  const text = readFileSync(file, 'utf8');
  let parsed: { value: JsonValue; hadComments: boolean };
  try {
    parsed = parseJsonc(text);
  } catch (error) {
    throw configUnreadable(
      `OpenCode's config at ${file} could not be read, so nothing was changed. ${error instanceof Error ? error.message : String(error)}`,
    );
  }
  if (!isJsonObject(parsed.value)) {
    throw configUnreadable(`OpenCode's config at ${file} is not a JSON object, so nothing was changed.`);
  }
  return { data: parsed.value, hadComments: parsed.hadComments, existed: true };
};

const writeConfig = (file: string, data: JsonObject): void => {
  mkdirSync(path.dirname(file), { recursive: true });
  const temporary = `${file}.blackrouter.tmp`;
  writeFileSync(temporary, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
  renameSync(temporary, file);
};

/** The block OpenCode reads. Same shape OpenChamber's provider form writes. */
export const buildProviderEntry = (
  config: Pick<RouterConfig, 'port' | 'apiKey'>,
  models: readonly RouterModel[],
): JsonObject => ({
  name: PROVIDER_NAME,
  package: PROVIDER_PACKAGE,
  settings: {
    baseURL: endpointFor(config),
    apiKey: config.apiKey,
  },
  models: Object.fromEntries(
    models.map((model) => {
      const meta = resolveModelMetadata(model.id);
      const entry: JsonObject = {
        modelID: model.id,
        name: model.name,
        limit: {
          context: model.limit?.context ?? meta.limit.context,
          output: model.limit?.output ?? meta.limit.output,
        },
        capabilities: {
          tools: model.capabilities?.tools ?? meta.capabilities.tools,
          input: model.capabilities?.input ?? meta.capabilities.input,
          output: model.capabilities?.output ?? meta.capabilities.output,
        },
      };
      const variants = model.variants ?? meta.variants;
      if (variants && variants.length > 0) {
        entry.variants = variants as unknown as JsonValue;
      }
      return [model.id, entry];
    }),
  ),
});

const sectionOf = (data: JsonObject, key: 'providers' | 'provider'): JsonObject | null => {
  const section = data[key];
  if (section === undefined) return null;
  if (!isJsonObject(section)) {
    throw configUnreadable(`OpenCode's config has a \`${key}\` entry that is not an object, so nothing was changed.`);
  }
  return section;
};

export type RegisterResult = { registration: Registration; warnings: string[] };

export const readRegistration = (file: string): Registration => {
  const empty: Registration = {
    providerId: PROVIDER_ID,
    path: file,
    installed: false,
    models: 0,
    modelIds: [],
  };
  if (!existsSync(file)) return empty;
  try {
    const { value } = parseJsonc(readFileSync(file, 'utf8'));
    if (!isJsonObject(value)) return empty;
    const providers = isJsonObject(value.providers) ? value.providers : {};
    const legacy = isJsonObject(value.provider) ? value.provider : {};
    const entry = providers[PROVIDER_ID] ?? legacy[PROVIDER_ID];
    if (!isJsonObject(entry)) return empty;
    const modelIds = isJsonObject(entry.models) ? Object.keys(entry.models) : [];
    return { ...empty, installed: true, models: modelIds.length, modelIds };
  } catch {
    return empty;
  }
};

/** Write or refresh the provider block, keeping everything else in the file. */
export const registerProvider = (
  file: string,
  config: RouterConfig,
  models: readonly RouterModel[],
): RegisterResult => {
  const { data, hadComments, existed } = readConfig(file);
  const warnings: string[] = [];
  if (hadComments) {
    warnings.push('Comments in OpenCode\'s config are not kept when it is rewritten.');
  }
  if (existed) {
    // A byte copy, so a bad merge is always one rename away from gone.
    writeFileSync(`${file}.blackrouter.backup`, readFileSync(file));
  }

  const providers = sectionOf(data, 'providers') ?? {};
  providers[PROVIDER_ID] = buildProviderEntry(config, models);
  data.providers = providers;

  const legacy = sectionOf(data, 'provider');
  if (legacy && legacy[PROVIDER_ID] !== undefined) {
    delete legacy[PROVIDER_ID];
    if (Object.keys(legacy).length === 0) delete data.provider;
    warnings.push('The older `provider` entry for BlackRouter was replaced by the `providers` entry.');
  }

  writeConfig(file, data);
  return { registration: readRegistration(file), warnings };
};

/** Drop the provider block. A missing block is not an error. */
export const removeProvider = (file: string): { registration: Registration; warnings: string[] } => {
  if (!existsSync(file)) {
    return { registration: readRegistration(file), warnings: [] };
  }
  const { data, hadComments } = readConfig(file);
  const warnings: string[] = [];
  if (hadComments) warnings.push('Comments in OpenCode\'s config are not kept when it is rewritten.');

  let changed = false;
  const providers = sectionOf(data, 'providers');
  if (providers && providers[PROVIDER_ID] !== undefined) {
    delete providers[PROVIDER_ID];
    if (Object.keys(providers).length === 0) delete data.providers;
    changed = true;
  }
  const legacy = sectionOf(data, 'provider');
  if (legacy && legacy[PROVIDER_ID] !== undefined) {
    delete legacy[PROVIDER_ID];
    if (Object.keys(legacy).length === 0) delete data.provider;
    changed = true;
  }

  if (changed) {
    writeFileSync(`${file}.blackrouter.backup`, readFileSync(file));
    writeConfig(file, data);
  }
  return { registration: readRegistration(file), warnings };
};
