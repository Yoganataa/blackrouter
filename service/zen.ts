import type { CavemanLevel, PonytailLevel } from '../contract.ts';

import { compressMessages } from './rtk.ts';
import { applyTokenSaverStyles } from './token-saver-styles.ts';
// @ts-ignore - the selected provider core is copied from upstream JavaScript.
import { generateSessionId } from './core/provider-adapter.js';

export const sessionId = generateSessionId;

export type PreparedChat = {
  /** The client body after BlackRouter's optional token savers. */
  body: string;
  /** Whether the client asked for a stream. */
  stream: boolean;
  model: string;
};

export type PrepareChatOptions = {
  rtkEnabled?: boolean;
  cavemanLevel?: CavemanLevel;
  ponytailLevel?: PonytailLevel;
};

/**
 * Normalize the OpenAI-compatible body before handing it to the native provider
 * executor. Provider identity, request headers, tool fingerprinting, endpoint
 * selection and provider-native body transforms are owned by the core executor.
 */
export const prepareChat = (raw: string, options?: boolean | PrepareChatOptions): PreparedChat => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('The request body is not JSON.');
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('The request body must be a JSON object.');
  }

  const body = parsed as Record<string, unknown>;
  const stream = body.stream === true;
  const model = typeof body.model === 'string' ? body.model : '';
  if (!Array.isArray(body.messages)) {
    throw new Error('The request body has no messages.');
  }

  const effectiveOptions: PrepareChatOptions = typeof options === 'boolean'
    ? { rtkEnabled: options }
    : (options ?? {});
  const rtkEnabled = effectiveOptions.rtkEnabled ?? true;
  if (rtkEnabled) compressMessages(body, true);

  // Keep optional BlackRouter response-style settings outside the native
  // provider adapter. Upstream RTK runs before prompt injection.
  applyTokenSaverStyles(
    body,
    effectiveOptions.cavemanLevel ?? 'off',
    effectiveOptions.ponytailLevel ?? 'off',
  );

  if (body.max_completion_tokens !== undefined && body.max_tokens === undefined) {
    body.max_tokens = body.max_completion_tokens;
  }
  if (body.reasoning_effort === 'auto') delete body.reasoning_effort;
  body.stream = true;
  return { body: JSON.stringify(body), stream, model };
};
