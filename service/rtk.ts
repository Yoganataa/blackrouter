/**
 * Compatibility facade for the RTK implementation copied from upstream RTK source.
 *
 * Keep upstream behavior in service/core/rtk unchanged. This module
 * retains BlackRouter's existing export names and boolean compressMessages API.
 */

// @ts-ignore - upstream JS is copied verbatim to make source updates easy to audit.
import { compressMessages as upstreamCompressMessages, compressText as upstreamCompressText } from './core/rtk/index.js';
// @ts-ignore - upstream JS is copied verbatim to make source updates easy to audit.
import { autoDetectFilter as upstreamAutoDetectFilter } from './core/rtk/autodetect.js';
// @ts-ignore - upstream JS is copied verbatim to make source updates easy to audit.
import { buildOutput } from './core/rtk/filters/buildOutput.js';
// @ts-ignore - upstream JS is copied verbatim to make source updates easy to audit.
import { dedupLog } from './core/rtk/filters/dedupLog.js';
// @ts-ignore - upstream JS is copied verbatim to make source updates easy to audit.
import { find } from './core/rtk/filters/find.js';
// @ts-ignore - upstream JS is copied verbatim to make source updates easy to audit.
import { gitDiff } from './core/rtk/filters/gitDiff.js';
// @ts-ignore - upstream JS is copied verbatim to make source updates easy to audit.
import { gitLog } from './core/rtk/filters/gitLog.js';
// @ts-ignore - upstream JS is copied verbatim to make source updates easy to audit.
import { gitStatus } from './core/rtk/filters/gitStatus.js';
// @ts-ignore - upstream JS is copied verbatim to make source updates easy to audit.
import { grep } from './core/rtk/filters/grep.js';
// @ts-ignore - upstream JS is copied verbatim to make source updates easy to audit.
import { ls } from './core/rtk/filters/ls.js';
// @ts-ignore - upstream JS is copied verbatim to make source updates easy to audit.
import { readNumbered } from './core/rtk/filters/readNumbered.js';
// @ts-ignore - upstream JS is copied verbatim to make source updates easy to audit.
import { searchList } from './core/rtk/filters/searchList.js';
// @ts-ignore - upstream JS is copied verbatim to make source updates easy to audit.
import { smartTruncate as upstreamSmartTruncate } from './core/rtk/filters/smartTruncate.js';
// @ts-ignore - upstream JS is copied verbatim to make source updates easy to audit.
import { tree } from './core/rtk/filters/tree.js';

type TextFilter = ((input: string) => string) & { filterName?: string };

// These aliases preserve existing BlackRouter exports; auto-detection returns
// the original upstream function references, so equality checks remain stable.
export const compactBuildOutput: TextFilter = buildOutput;
export const compactDedupLog: TextFilter = dedupLog;
export const compactFind: TextFilter = find;
export const compactGitDiff: TextFilter = gitDiff;
export const compactGitLog: TextFilter = gitLog;
export const compactGitStatus: TextFilter = gitStatus;
export const compactGrep: TextFilter = grep;
export const compactLs: TextFilter = ls;
export const compactReadNumbered: TextFilter = readNumbered;
export const compactSearchList: TextFilter = searchList;
export const compactTree: TextFilter = tree;
export const smartTruncate: TextFilter = upstreamSmartTruncate;
export const compactSmartTruncate: TextFilter = upstreamSmartTruncate;

/** Retain the pre-port text-compression helper for downstream imports. */
export const compressText = upstreamCompressText;

export const autoDetectFilter = (input: string): TextFilter | null =>
  upstreamAutoDetectFilter(input) as TextFilter | null;

/**
 * Upstream returns stats; older BlackRouter callers expect a boolean.
 * Adapt only the return shape, not the upstream compression implementation.
 */
export const compressMessages = (body: Record<string, unknown>, enabled = true): boolean => {
  const stats = upstreamCompressMessages(body, enabled) as { hits?: unknown[] } | null;
  return Boolean(stats?.hits?.length);
};
