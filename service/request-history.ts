import { chmodSync, existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import path from 'node:path';

import { requestEntrySchema, type RequestEntry } from '../contract.ts';

export const REQUEST_HISTORY_LIMIT = 200;
const HISTORY_FILE_NAME = 'requests.jsonl';

export type RequestHistoryStore = {
  path: string;
  load(): RequestEntry[];
  save(entries: readonly RequestEntry[]): void;
};

/**
 * Local metadata-only request history. Prompts, tool outputs, API keys, and
 * response bodies are never written to this file.
 */
export const createRequestHistoryStore = (
  configFilePath: string,
  limit = REQUEST_HISTORY_LIMIT,
): RequestHistoryStore => {
  const file = path.join(path.dirname(configFilePath), HISTORY_FILE_NAME);
  const boundedLimit = Math.max(1, Math.min(Math.floor(limit), 5_000));

  const load = (): RequestEntry[] => {
    if (!existsSync(file)) return [];
    try {
      const lines = readFileSync(file, 'utf8')
        .split(/\r?\n/)
        .filter((line) => line.trim().length > 0)
        .slice(0, boundedLimit);
      const entries: RequestEntry[] = [];
      for (const line of lines) {
        try {
          const value: unknown = JSON.parse(line);
          const parsed = requestEntrySchema.safeParse(value);
          if (parsed.success) entries.push(parsed.data);
        } catch {
          // Ignore a corrupted line without discarding the rest of the history.
        }
      }
      return entries;
    } catch (error) {
      console.warn('[blackrouter] could not read request history:', error);
      return [];
    }
  };

  const save = (entries: readonly RequestEntry[]): void => {
    const recent = entries.slice(0, boundedLimit).map((entry) => requestEntrySchema.parse(entry));
    mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
    const temp = `${file}.tmp`;
    const text = recent.map((entry) => JSON.stringify(entry)).join('\n');
    writeFileSync(temp, text ? `${text}\n` : '', { encoding: 'utf8', mode: 0o600 });
    renameSync(temp, file);
    try {
      chmodSync(file, 0o600);
    } catch {
      // Windows filesystems may ignore POSIX mode bits; the file stays in the user's profile.
    }
  };

  return { path: file, load, save };
};
