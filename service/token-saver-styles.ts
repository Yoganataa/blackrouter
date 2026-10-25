import type { CavemanLevel, PonytailLevel } from '../contract.ts';

const CAVEMAN_PROMPTS: Record<Exclude<CavemanLevel, 'off'>, string> = {
  lite: [
    'Answer concisely in complete sentences. Remove pleasantries, filler, repetition, and unnecessary hedging.',
    'Preserve the user’s language and exact code, identifiers, paths, commands, URLs, and error strings.',
    'Keep security warnings, irreversible-action confirmations, and ordered steps clear.',
  ].join(' '),
  full: [
    'Use terse technical language; compact phrases are acceptable when unambiguous.',
    'Remove filler and redundant explanations. Preserve the user’s language and all technical literals exactly.',
    'Do not compress security warnings, irreversible-action confirmations, or ordered steps where ambiguity could cause mistakes.',
  ].join(' '),
  ultra: [
    'Use the fewest words that retain correctness and clarity. Prefer compact, direct answers.',
    'Never alter code, identifiers, paths, commands, URLs, or error strings.',
    'Keep safety warnings and destructive-action confirmations explicit. Keep multi-step sequences unambiguous.',
  ].join(' '),
};

const PONYTAIL_PROMPTS: Record<Exclude<PonytailLevel, 'off'>, string> = {
  lite: [
    'When writing code, prefer the smallest correct change.',
    'Check YAGNI, standard library, native platform features, and already-installed dependencies before adding abstractions or packages.',
    'Never omit explicitly requested behavior, trust-boundary validation, error handling, security, or accessibility.',
    'For non-trivial logic, include one runnable check or a focused test.',
  ].join(' '),
  full: [
    'Act as an efficient senior developer. Prefer deletion over addition and the smallest correct diff.',
    'Use standard library, native platform features, and existing dependencies first.',
    'Avoid unrequested factories, one-implementation interfaces, configuration that never changes, and scaffolding for hypothetical future needs.',
    'Never remove required behavior, validation, error handling, security, or accessibility. Test non-trivial logic.',
  ].join(' '),
  ultra: [
    'Minimize implementation and explanation aggressively. Choose the smallest correct change; delete unnecessary code before adding code.',
    'Do not add new dependencies, abstractions, or future-proof scaffolding unless the task requires them.',
    'Do not simplify away requested behavior, validation, error handling, security, or accessibility. Add a runnable check for non-trivial logic.',
  ].join(' '),
};

/**
 * Appends opt-in response/code-economy instructions to the system message.
 * Works only on OpenAI-compatible chat message arrays; other shapes are left untouched.
 */
export const applyTokenSaverStyles = (
  body: Record<string, unknown>,
  cavemanLevel: CavemanLevel = 'off',
  ponytailLevel: PonytailLevel = 'off',
): boolean => {
  const prompts: string[] = [];
  if (cavemanLevel !== 'off') prompts.push(CAVEMAN_PROMPTS[cavemanLevel]);
  if (ponytailLevel !== 'off') prompts.push(PONYTAIL_PROMPTS[ponytailLevel]);
  if (prompts.length === 0 || !Array.isArray(body.messages)) return false;

  const instruction = prompts.join('\n\n');
  const messages = body.messages as unknown[];
  const systemIndex = messages.findIndex((message) =>
    !!message && typeof message === 'object' && !Array.isArray(message) &&
    (message as Record<string, unknown>).role === 'system',
  );
  const current = systemIndex >= 0 ? messages[systemIndex] as Record<string, unknown> : null;

  if (current && typeof current.content === 'string') {
    const existing = current.content.trim();
    current.content = existing ? existing + '\n\n' + instruction : instruction;
  } else {
    messages.unshift({ role: 'system', content: instruction });
  }
  return true;
};
