/**
 * RTK (Repetitive Tool Knowledge) Token Saver for BlackRouter.
 *
 * Compresses tool result content (git diff, git status, grep, large outputs)
 * in LLM request messages in-place before forwarding upstream, saving 20-40%
 * tokens on coding agent loops.
 */

const MIN_COMPRESS_SIZE = 256;
const RAW_CAP = 500 * 1024;
const DETECT_WINDOW = 2048;
const GIT_DIFF_HUNK_MAX_LINES = 100;
const GREP_PER_FILE_MAX = 5;
const SMART_TRUNCATE_MIN_LINES = 80;
const SMART_TRUNCATE_HEAD = 30;
const SMART_TRUNCATE_TAIL = 20;

// ─── Filters ───────────────────────────────────────────────────────────────────

export function compactGitDiff(diff: string): string {
  const result: string[] = [];
  let currentFile = '';
  let added = 0;
  let removed = 0;
  let inHunk = false;
  let hunkShown = 0;
  let hunkSkipped = 0;

  const lines = diff.split('\n');

  for (const line of lines) {
    if (line.startsWith('diff --git')) {
      if (hunkSkipped > 0) {
        result.push(`  ... (${hunkSkipped} lines truncated)`);
        hunkSkipped = 0;
      }
      if (currentFile && (added > 0 || removed > 0)) {
        result.push(`  +${added} -${removed}`);
      }
      const parts = line.split(' b/');
      currentFile = parts.length > 1 ? parts.slice(1).join(' b/') : 'unknown';
      result.push(`\n${currentFile}`);
      added = 0;
      removed = 0;
      inHunk = false;
      hunkShown = 0;
    } else if (line.startsWith('@@')) {
      if (hunkSkipped > 0) {
        result.push(`  ... (${hunkSkipped} lines truncated)`);
        hunkSkipped = 0;
      }
      inHunk = true;
      hunkShown = 0;
      result.push(`  ${line}`);
    } else if (inHunk) {
      if (line.startsWith('+') && !line.startsWith('+++')) {
        added += 1;
        if (hunkShown < GIT_DIFF_HUNK_MAX_LINES) {
          result.push(`  ${line}`);
          hunkShown += 1;
        } else {
          hunkSkipped += 1;
        }
      } else if (line.startsWith('-') && !line.startsWith('---')) {
        removed += 1;
        if (hunkShown < GIT_DIFF_HUNK_MAX_LINES) {
          result.push(`  ${line}`);
          hunkShown += 1;
        } else {
          hunkSkipped += 1;
        }
      }
    }
  }

  if (hunkSkipped > 0) {
    result.push(`  ... (${hunkSkipped} lines truncated)`);
  }
  if (currentFile && (added > 0 || removed > 0)) {
    result.push(`  +${added} -${removed}`);
  }

  return result.join('\n').trim();
}

export function compactGitStatus(input: string): string {
  const lines = input.split('\n');
  if (lines.length === 0 || (lines.length === 1 && !lines[0]?.trim())) {
    return 'Clean working tree';
  }

  let branch = '';
  const stagedFiles: string[] = [];
  const modifiedFiles: string[] = [];
  const untrackedFiles: string[] = [];

  for (const raw of lines) {
    if (!raw.trim()) continue;
    const longBranch = raw.match(/^On branch (\S+)/);
    if (longBranch && longBranch[1]) {
      branch = longBranch[1];
      continue;
    }
    if (raw.startsWith('##')) {
      branch = raw.replace(/^##\s*/, '');
      continue;
    }
    if (raw.length >= 3 && /^[ MADRCU?!][ MADRCU?!] /.test(raw)) {
      const x = raw[0];
      const y = raw[1];
      const file = raw.slice(3);
      if (raw.slice(0, 2) === '??') {
        untrackedFiles.push(file);
      } else if (x && 'MADRC'.includes(x)) {
        stagedFiles.push(file);
      }
      if (y === 'M' || y === 'D') {
        modifiedFiles.push(file);
      }
    }
  }

  const out: string[] = [];
  if (branch) out.push(`* ${branch}`);
  if (stagedFiles.length > 0) out.push(`+ Staged: ${stagedFiles.length} files`);
  if (modifiedFiles.length > 0) out.push(`~ Modified: ${modifiedFiles.length} files`);
  if (untrackedFiles.length > 0) out.push(`? Untracked: ${untrackedFiles.length} files`);

  return out.length > 0 ? out.join('\n') : input;
}

export function compactGrep(input: string): string {
  const byFile = new Map<string, Array<[string, string]>>();
  let total = 0;

  for (const line of input.split('\n')) {
    const first = line.indexOf(':');
    if (first === -1) continue;
    const second = line.indexOf(':', first + 1);
    if (second === -1) continue;
    const file = line.slice(0, first);
    const lineNumStr = line.slice(first + 1, second);
    const content = line.slice(second + 1);
    if (!/^\d+$/.test(lineNumStr)) continue;

    total++;
    let fileMatches = byFile.get(file);
    if (!fileMatches) {
      fileMatches = [];
      byFile.set(file, fileMatches);
    }
    fileMatches.push([lineNumStr, content]);
  }

  if (total === 0) return input;

  const files = Array.from(byFile.keys()).sort();
  let out = `${total} matches across ${files.length} files:\n\n`;

  for (const file of files) {
    const matches = byFile.get(file) || [];
    out += `[${file}] (${matches.length}):\n`;
    const show = matches.slice(0, GREP_PER_FILE_MAX);
    for (const [lineNum, content] of show) {
      out += `  ${lineNum.padStart(4)}: ${content.trim()}\n`;
    }
    if (matches.length > GREP_PER_FILE_MAX) {
      out += `  ... +${matches.length - GREP_PER_FILE_MAX} more\n`;
    }
    out += '\n';
  }

  return out.trim();
}

export function smartTruncate(input: string): string {
  const lines = input.split('\n');
  if (lines.length < SMART_TRUNCATE_MIN_LINES) return input;

  const head = lines.slice(0, SMART_TRUNCATE_HEAD);
  const tail = lines.slice(lines.length - SMART_TRUNCATE_TAIL);
  const cut = lines.length - head.length - tail.length;
  return [...head, `... +${cut} lines truncated ...`, ...tail].join('\n');
}

// ─── Filter Detection ─────────────────────────────────────────────────────────

type FilterFn = (text: string) => string;

const RE_GIT_DIFF = /^diff --git /m;
const RE_GIT_DIFF_HUNK = /^@@ /m;
const RE_GIT_STATUS = /^On branch |^nothing to commit|^Changes (not |to be )|^Untracked files:/m;

export function autoDetectFilter(text: string): FilterFn | null {
  const head = text.length > DETECT_WINDOW ? text.slice(0, DETECT_WINDOW) : text;

  if (RE_GIT_DIFF.test(head) || RE_GIT_DIFF_HUNK.test(head)) return compactGitDiff;
  if (RE_GIT_STATUS.test(head)) return compactGitStatus;

  const lines = head.split('\n').filter((l) => l.trim().length > 0);
  const first5 = lines.slice(0, 5);
  const grepMatchCount = first5.filter((l) => {
    const first = l.indexOf(':');
    if (first === -1) return false;
    const second = l.indexOf(':', first + 1);
    if (second === -1) return false;
    return /^\d+$/.test(l.slice(first + 1, second));
  }).length;

  if (grepMatchCount >= 2) return compactGrep;

  if (text.split('\n').length >= SMART_TRUNCATE_MIN_LINES) return smartTruncate;

  return null;
}

// ─── Text Compression ──────────────────────────────────────────────────────────

export function compressText(text: string): string {
  const bytesIn = text.length;
  if (bytesIn < MIN_COMPRESS_SIZE || bytesIn > RAW_CAP) return text;

  const fn = autoDetectFilter(text);
  if (!fn) return text;

  try {
    const out = fn(text);
    if (!out || out.length === 0 || out.length >= bytesIn) return text;
    return out;
  } catch {
    return text;
  }
}

// ─── Message Compressor ───────────────────────────────────────────────────────

export function compressMessages(body: Record<string, unknown>, enabled = true): boolean {
  if (!enabled || !body) return false;

  const items = Array.isArray(body.messages) ? body.messages : null;
  if (!items) return false;

  let anyCompressed = false;

  for (let i = 0; i < items.length; i++) {
    const msg = items[i] as Record<string, unknown> | null;
    if (!msg) continue;

    // OpenAI tool response: { role: 'tool', content: '...' }
    if (msg.role === 'tool' && typeof msg.content === 'string') {
      const compressed = compressText(msg.content);
      if (compressed !== msg.content) {
        msg.content = compressed;
        anyCompressed = true;
      }
      continue;
    }

    // Anthropic / array-based content: { content: [{ type: 'tool_result', content: '...' }] }
    if (Array.isArray(msg.content)) {
      for (let j = 0; j < msg.content.length; j++) {
        const block = msg.content[j] as Record<string, unknown> | null;
        if (!block || block.type !== 'tool_result' || block.is_error === true) continue;

        if (typeof block.content === 'string') {
          const compressed = compressText(block.content);
          if (compressed !== block.content) {
            block.content = compressed;
            anyCompressed = true;
          }
        }
      }
    }
  }

  return anyCompressed;
}
