/**
 * Compatibility facade for the RTK implementation vendored from decolua/9router.
 *
 * Keep upstream behavior in service/vendor/9router-rtk unchanged. This module
 * retains BlackRouter's existing export names and boolean compressMessages API.
 */

// @ts-ignore - upstream JS is vendored verbatim to make source updates easy to audit.
import { compressMessages as upstreamCompressMessages } from './vendor/9router-rtk/index.js';
// @ts-ignore - upstream JS is vendored verbatim to make source updates easy to audit.
import { autoDetectFilter as upstreamAutoDetectFilter } from './vendor/9router-rtk/autodetect.js';
// @ts-ignore - upstream JS is vendored verbatim to make source updates easy to audit.
import { buildOutput } from './vendor/9router-rtk/filters/buildOutput.js';
// @ts-ignore - upstream JS is vendored verbatim to make source updates easy to audit.
import { dedupLog } from './vendor/9router-rtk/filters/dedupLog.js';
// @ts-ignore - upstream JS is vendored verbatim to make source updates easy to audit.
import { find } from './vendor/9router-rtk/filters/find.js';
// @ts-ignore - upstream JS is vendored verbatim to make source updates easy to audit.
import { gitDiff } from './vendor/9router-rtk/filters/gitDiff.js';
// @ts-ignore - upstream JS is vendored verbatim to make source updates easy to audit.
import { gitLog } from './vendor/9router-rtk/filters/gitLog.js';
// @ts-ignore - upstream JS is vendored verbatim to make source updates easy to audit.
import { gitStatus } from './vendor/9router-rtk/filters/gitStatus.js';
// @ts-ignore - upstream JS is vendored verbatim to make source updates easy to audit.
import { grep } from './vendor/9router-rtk/filters/grep.js';
// @ts-ignore - upstream JS is vendored verbatim to make source updates easy to audit.
import { ls } from './vendor/9router-rtk/filters/ls.js';
// @ts-ignore - upstream JS is vendored verbatim to make source updates easy to audit.
import { readNumbered } from './vendor/9router-rtk/filters/readNumbered.js';
// @ts-ignore - upstream JS is vendored verbatim to make source updates easy to audit.
import { searchList } from './vendor/9router-rtk/filters/searchList.js';
// @ts-ignore - upstream JS is vendored verbatim to make source updates easy to audit.
import { smartTruncate as upstreamSmartTruncate } from './vendor/9router-rtk/filters/smartTruncate.js';
// @ts-ignore - upstream JS is vendored verbatim to make source updates easy to audit.
import { tree } from './vendor/9router-rtk/filters/tree.js';

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

export const autoDetectFilter = (input: string): TextFilter | null =>
  upstreamAutoDetectFilter(input) as TextFilter | null;

/**
 * Upstream returns stats; older BlackRouter callers expect a boolean.
 * Adapt only the return shape, not the upstream compression implementation.
 */
export const compressMessages = (body: Record<string, unknown>, enabled: boolean): boolean => {
  const stats = upstreamCompressMessages(body, enabled) as { hits?: unknown[] } | null;
  return Boolean(stats?.hits?.length);
};
