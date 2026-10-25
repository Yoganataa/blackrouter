import { randomBytes } from 'node:crypto';

import type { CavemanLevel, PonytailLevel } from '../contract.ts';
import type { JsonValue } from '../json.ts';
import { isJsonObject, type JsonObject } from './json.ts';
import { compressMessages } from './rtk.ts';
import { applyTokenSaverStyles } from './token-saver-styles.ts';

/**
 * The client identity the OpenCode Zen free tier expects.
 *
 * The free pool answers only requests that look like they come from OpenCode
 * itself: its user agent, its client headers, a session id in its format, a
 * per-request id, and its own toolbox in the body. Requests without them are
 * refused with `FreeTierError`, whatever the key. Verified against the live
 * endpoint; the shapes below are the ones the official client sends.
 */
const BASE62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

/** Empty arguments, enough for the gate; the caller's own tool with that name wins. */
export const FINGERPRINT_TOOLS = ['read', 'shell'] as const;

export const FINGERPRINT_TOOL_DEFINITIONS: Record<
  string,
  { name: string; description: string; parameters: Record<string, JsonValue> }
> = {
  read: {
    name: 'read',
    description:
      'Read the contents of a file or directory. Supports text files, images, and PDFs. Images and PDFs are presented directly to the model. Each text line is prefixed by its 1-based line number as <line>: <content>. The prefix is for reference and is not part of the file content. Directory entries are returned one per line. Use offset and limit to read large files or directories in sections. Prefer one larger read over many small slices, and use grep to find specific content in large files.',
    parameters: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'File or directory to read' },
        offset: {
          type: 'integer',
          minimum: 0,
          description: 'The line or directory entry to start reading from (1-based)',
        },
        limit: {
          type: 'integer',
          minimum: 0,
          description:
            'The maximum number of lines or directory entries to read (defaults to and capped at 2000)',
        },
      },
      required: ['path'],
      additionalProperties: false,
    },
  },
  shell: {
    name: 'shell',
    description:
      'Execute a shell command and return its output. Commands run on Linux using bash. Quote file paths containing spaces or special characters. Prefer dedicated tools over shell commands when possible. When output is large, the full result is saved to a file and a truncated preview is returned. Rely on automatic truncation unless filtering the output is more useful. Commands accept an optional timeout, background commands have no timeout by default. Background commands return immediately, and you will be notified when they complete.',
    parameters: {
      type: 'object',
      properties: {
        command: { type: 'string', description: 'Shell command string to execute' },
        workdir: {
          type: 'string',
          description:
            'Working directory to execute the command in. Defaults to the current working directory. When possible, avoid changing directories in the command and set the working directory here instead.',
        },
        timeout: {
          type: 'integer',
          minimum: 0,
          description:
            'Timeout in milliseconds. Set to 0 to disable the timeout. Defaults to 120000 for foreground commands. Background commands have no timeout by default.',
        },
        background: {
          type: 'boolean',
          description:
            "Run the command in the background and return immediately (useful for dev servers and long-running builds). You do not need to use '&' at the end of the command when using this parameter. You will be notified when it completes. DO NOT poll for completion.",
        },
      },
      required: ['command'],
      additionalProperties: false,
    },
  },
};

const randomTail = (): string => {
  const bytes = randomBytes(14);
  let out = '';
  for (let index = 0; index < 14; index += 1) out += BASE62[(bytes[index] ?? 0) % 62];
  return out;
};

/** `ses_` + 12 hex of a descending timestamp + 14 base62 characters. */
export const sessionId = (now = Date.now()): string => {
  const prefix = (~(BigInt(now) * 0x1000n + 1n) & ((1n << 48n) - 1n)).toString(16).padStart(12, '0');
  return `ses_${prefix}${randomTail()}`;
};

/** `msg_` + 12 hex of the millisecond timestamp + 14 base62 characters. */
export const requestId = (now = Date.now()): string => {
  const value = BigInt(now) * 0x1000n + 1n;
  const time = Array.from({ length: 6 }, (_, index) =>
    Number((value >> BigInt(40 - 8 * index)) & 0xffn)
      .toString(16)
      .padStart(2, '0'),
  ).join('');
  return `msg_${time}${randomTail()}`;
};

/** Headers every free-tier call carries. The session stays stable for this process. */
export const freeTierHeaders = (session: string): Record<string, string> => ({
  authorization: 'Bearer public',
  'user-agent': 'opencode/latest/2.0.26/cli',
  'x-opencode-client': 'cli',
  'x-opencode-project': 'global',
  'x-opencode-session': session,
  'x-opencode-session-id': session,
  'x-session-affinity': session,
  'x-session-id': session,
});

const toolNameOf = (tool: JsonValue): string => {
  if (!isJsonObject(tool)) return '';
  const fn = isJsonObject(tool.function) ? tool.function : null;
  if (typeof tool.name === 'string' && tool.name.trim()) return tool.name.trim();
  if (fn && typeof fn.name === 'string') return fn.name.trim();
  return '';
};

/**
 * Add the tools the gate looks for, leaving every tool the caller declared.
 *
 * A caller that already sends `read` keeps its own definition: the upstream
 * checks that the names are present, not what they do.
 */
export const ensureFreeTierTools = (body: JsonObject): void => {
  const tools = Array.isArray(body.tools) ? body.tools : [];
  const present = new Set(tools.map((tool) => toolNameOf(tool)).filter((name) => name.length > 0));
  for (const name of FINGERPRINT_TOOLS) {
    if (present.has(name)) continue;
    const def = FINGERPRINT_TOOL_DEFINITIONS[name];
    tools.push({
      type: 'function',
      function: {
        name: def.name,
        description: def.description,
        parameters: def.parameters,
      },
    });
  }
  body.tools = tools;
};

export type PreparedChat = {
  /** The body to send upstream, already carrying the free-tier requirements. */
  body: string;
  /** What the client asked for. The upstream only ever answers with a stream. */
  stream: boolean;
  model: string;
};

export type PrepareChatOptions = {
  rtkEnabled?: boolean;
  cavemanLevel?: CavemanLevel;
  ponytailLevel?: PonytailLevel;
};

/**
 * Read the client's chat body and make it acceptable to the free tier.
 *
 * `stream` is forced on upstream: a non-streaming request is refused there.
 * The router remembers what the client wanted and turns the stream back into
 * one JSON answer when the client asked for that.
 */
export const prepareChat = (raw: string, options?: boolean | PrepareChatOptions): PreparedChat => {
  let parsed: JsonValue;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('The request body is not JSON.');
  }
  if (!isJsonObject(parsed)) {
    throw new Error('The request body must be a JSON object.');
  }
  const stream = parsed.stream === true;
  const model = typeof parsed.model === 'string' ? parsed.model : '';
  if (!parsed.messages) {
    throw new Error('The request body has no messages.');
  }
  const effectiveOptions: PrepareChatOptions = typeof options === 'boolean'
    ? { rtkEnabled: options }
    : (options ?? {});
  applyTokenSaverStyles(
    parsed,
    effectiveOptions.cavemanLevel ?? 'off',
    effectiveOptions.ponytailLevel ?? 'off',
  );

  ensureFreeTierTools(parsed);

  // Zen reasoning models reject multi-turn history whose assistant messages
  // carry no reasoning_content with 400 missing_required_parameter. Inject
  // placeholder if missing.
  if (Array.isArray(parsed.messages)) {
    for (const msg of parsed.messages) {
      if (isJsonObject(msg) && msg.role === 'assistant') {
        if (typeof msg.reasoning_content !== 'string' || msg.reasoning_content.length === 0) {
          msg.reasoning_content = ' ';
        }
      }
    }
  }

  const rtkEnabled = effectiveOptions.rtkEnabled ?? true;
  if (rtkEnabled) {
    compressMessages(parsed as Record<string, unknown>, true);
  }

  if (parsed.max_completion_tokens !== undefined && parsed.max_tokens === undefined) {
    parsed.max_tokens = parsed.max_completion_tokens;
  }

  if (parsed.reasoning_effort === 'auto') {
    delete parsed.reasoning_effort;
  }

  parsed.stream = true;
  return { body: JSON.stringify(parsed), stream, model };
};
