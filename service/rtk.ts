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

const GIT_LOG_MAX_LINES = 200;
const DEDUP_LINE_MAX = 2000;
const FIND_PER_DIR_MAX = 10;
const FIND_TOTAL_DIR_MAX = 20;
const LS_EXT_SUMMARY_TOP = 5;
const TREE_MAX_LINES = 200;
const SEARCH_LIST_PER_DIR_MAX = 10;
const SEARCH_LIST_TOTAL_DIR_MAX = 20;
const READ_NUMBERED_MIN_HIT_RATIO = 0.7;
const LS_NOISE_DIRS = new Set([
  'node_modules', '.git', 'target', '__pycache__', '.next', 'dist', 'build',
  '.cache', '.turbo', '.vercel', '.pytest_cache', '.mypy_cache', '.tox',
  '.venv', 'venv', 'env', 'coverage', '.nyc_output', '.idea', '.vscode',
  '.vs', '.eggs', '.DS_Store', 'Thumbs.db',
]);

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
      } else if (line.startsWith('\\')) {
        // Do not include unified-diff metadata such as "\\ No newline at end of file".
      } else if (hunkShown < GIT_DIFF_HUNK_MAX_LINES) {
        // Context is essential for code agents; keep it within the same hunk cap.
        result.push(`  ${line}`);
        hunkShown += 1;
      } else {
        hunkSkipped += 1;
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

export function compactGitLog(text: string, maxLines = GIT_LOG_MAX_LINES): string {
  if (!text) return '';
  const lines = String(text).split('\n');
  const out: string[] = [];
  let skipped = 0;
  let inCommit = false;
  let subjectSeen = false;

  const pushLine = (line: string): void => {
    if (out.length < maxLines) out.push(line);
    else skipped += 1;
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const trimmed = line.trim();
    if (/^commit [0-9a-f]{7,40}$/i.test(trimmed) || /^[*|/\\ ]+commit [0-9a-f]{7,40}/i.test(trimmed)) {
      inCommit = true;
      subjectSeen = false;
      pushLine(line);
      continue;
    }
    if (inCommit) {
      if (/^(Author|Date):/i.test(trimmed)) {
        pushLine(trimmed);
        continue;
      }
      if (!trimmed) continue;
      if (!subjectSeen && /^[*|/\\ ]*    \S/.test(line)) {
        pushLine('  Subject: ' + trimmed);
        subjectSeen = true;
        continue;
      }
      if (/^\d+ files? changed/.test(trimmed)) {
        pushLine('  ' + trimmed);
        continue;
      }
      if (/^diff --git /.test(trimmed)) {
        pushLine('  ... diff body omitted');
        continue;
      }
      continue;
    }

    const graphMatch = trimmed.match(/^[*|/\\ ]+([0-9a-f]{7,40}\s+.+)/i);
    if (graphMatch) {
      pushLine(graphMatch[1]);
      continue;
    }
    if (/^[0-9a-f]{7,40}\s+/.test(trimmed)) {
      pushLine(trimmed);
      continue;
    }
    if (/^[*|/\\ ]+$/.test(trimmed) && /[*|/\\]/.test(trimmed)) continue;
    pushLine(trimmed);
  }
  if (skipped > 0) out.push('... (' + skipped + ' more lines)');
  const result = out.join('\n');
  return !result || result.length > text.length ? text : result;
}

export function compactBuildOutput(input: string): string {
  const lines = input.split('\n');
  const errors: string[] = [];
  const warnings: string[] = [];
  const deprecations: string[] = [];
  let summary = '';
  let compilingCount = 0;
  let downloadingCount = 0;
  let inCompilerError = false;
  const errorContinuation = /^\s*(-->|\\||\d+\s*\\||=)/;

  for (const line of lines) {
    const trimmed = line.trim();
    if (inCompilerError) {
      if (!trimmed) {
        inCompilerError = false;
        continue;
      }
      if (errorContinuation.test(line)) {
        errors.push(line);
        continue;
      }
      inCompilerError = false;
    }
    if (!trimmed) continue;

    if (/^npm (ERR!|error)/i.test(trimmed) || /^yarn error/i.test(trimmed)) {
      errors.push(line);
      continue;
    }
    if (/^npm warn deprecated/i.test(trimmed)) {
      deprecations.push(line);
      continue;
    }
    if (/^npm warn/i.test(trimmed) || /^yarn warn/i.test(trimmed)) {
      warnings.push(line);
      continue;
    }
    if (/^error(\[|:)/i.test(trimmed) || trimmed.startsWith('error -->')) {
      errors.push(line);
      inCompilerError = true;
      continue;
    }
    if (/^warning(\[|:)/i.test(trimmed) || trimmed.startsWith('warning -->')) {
      warnings.push(line);
      inCompilerError = true;
      continue;
    }
    if (/^ERROR:/i.test(trimmed) || /^\[ERROR\]/i.test(trimmed) || /^BUILD FAILED/i.test(trimmed)) {
      errors.push(line);
      continue;
    }
    if (/^\[WARNING\]/i.test(trimmed)) {
      warnings.push(line);
      continue;
    }
    if (/^Compiling\s+\S+/i.test(trimmed)) {
      compilingCount += 1;
      continue;
    }
    if (/^Downloading\s+\S+/i.test(trimmed) || /^Fetching\s+/i.test(trimmed)) {
      downloadingCount += 1;
      continue;
    }
    if (
      /^(added|removed|changed|audited|installed)\s+\d+\s+package/i.test(trimmed) ||
      /^Finished\s+/i.test(trimmed) ||
      /^BUILD SUCCESS/i.test(trimmed) ||
      /^\d+\s+(vulnerabilities|packages?|warnings?|errors?)/i.test(trimmed) ||
      /^Successfully (installed|built)/i.test(trimmed) ||
      /^To address .* issues/i.test(trimmed) ||
      /^Run \`npm (audit|fund)\`/i.test(trimmed) ||
      /packages are looking for funding/i.test(trimmed)
    ) {
      summary = summary ? summary + '\n' + line : line;
    }
  }

  let out = '';
  for (const line of deprecations.slice(0, 3)) out += line + '\n';
  if (deprecations.length > 3) out += '... +' + (deprecations.length - 3) + ' more deprecated packages\n';
  if (compilingCount > 0) out += 'Compiled ' + compilingCount + ' packages\n';
  if (downloadingCount > 0) out += 'Downloaded ' + downloadingCount + ' packages\n';
  for (const line of errors) out += line + '\n';
  for (const line of warnings.slice(0, 5)) out += line + '\n';
  if (warnings.length > 5) out += '... +' + (warnings.length - 5) + ' more warnings\n';
  if (summary) out += summary + '\n';
  const result = out.replace(/\n+$/, '');
  return result || input;
}

export function compactFind(input: string): string {
  const paths = input.split('\n').filter((line) => line.trim());
  if (paths.length === 0) return input;
  const byDir = new Map<string, string[]>();
  for (const rawPath of paths) {
    const lastSep = Math.max(rawPath.lastIndexOf('/'), rawPath.lastIndexOf('\\'));
    const dir = lastSep === -1 ? '.' : (rawPath.slice(0, lastSep) || '/');
    const basename = lastSep === -1 ? rawPath : rawPath.slice(lastSep + 1);
    const items = byDir.get(dir) ?? [];
    items.push(basename);
    byDir.set(dir, items);
  }
  const dirs = Array.from(byDir.keys()).sort();
  let out = paths.length + ' files in ' + dirs.length + ' dirs:\n\n';
  for (const dir of dirs.slice(0, FIND_TOTAL_DIR_MAX)) {
    const files = byDir.get(dir) ?? [];
    out += dir.replace(/\\/g, '/') + '/  (' + files.length + ')\n';
    for (const file of files.slice(0, FIND_PER_DIR_MAX)) out += '  ' + file + '\n';
    if (files.length > FIND_PER_DIR_MAX) out += '  +' + (files.length - FIND_PER_DIR_MAX) + '\n';
  }
  if (dirs.length > FIND_TOTAL_DIR_MAX) out += '\n+' + (dirs.length - FIND_TOTAL_DIR_MAX) + ' more dirs\n';
  const result = out.replace(/\n+$/, '');
  return result.length < input.length ? result : input;
}

export function compactLs(input: string): string {
  const datePattern = /\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}\s+(\d{4}|\d{2}:\d{2})\s+/;
  const dirs: string[] = [];
  const files: Array<[string, string]> = [];
  const extensions = new Map<string, number>();
  const humanSize = (bytes: number): string => bytes >= 1048576
    ? (bytes / 1048576).toFixed(1) + 'M'
    : bytes >= 1024 ? (bytes / 1024).toFixed(1) + 'K' : bytes + 'B';

  for (const line of input.split('\n')) {
    if (line.startsWith('total ') || line.length === 0) continue;
    const match = datePattern.exec(line);
    if (!match) continue;
    const name = line.slice(match.index + match[0].length);
    const before = line.slice(0, match.index).split(/\s+/).filter(Boolean);
    if (before.length < 4) continue;
    const fileType = before[0]?.charAt(0);
    let size = 0;
    for (let i = before.length - 1; i >= 0; i -= 1) {
      const value = Number(before[i]);
      if (Number.isInteger(value) && String(value) === before[i]) {
        size = value;
        break;
      }
    }
    if (name === '.' || name === '..' || LS_NOISE_DIRS.has(name)) continue;
    if (fileType === 'd') {
      dirs.push(name);
    } else if (fileType === '-' || fileType === 'l') {
      const dot = name.lastIndexOf('.');
      const ext = dot > 0 ? name.slice(dot) : 'no ext';
      extensions.set(ext, (extensions.get(ext) ?? 0) + 1);
      files.push([name, humanSize(size)]);
    }
  }
  if (dirs.length === 0 && files.length === 0) return input;
  let out = '';
  for (const dir of dirs) out += dir + '/\n';
  for (const [name, size] of files) out += name + '  ' + size + '\n';
  let summary = '\nSummary: ' + files.length + ' files, ' + dirs.length + ' dirs';
  if (extensions.size > 0) {
    const ordered = Array.from(extensions.entries()).sort((a, b) => b[1] - a[1]);
    summary += ' (' + ordered.slice(0, LS_EXT_SUMMARY_TOP).map(([ext, count]) => count + ' ' + ext).join(', ');
    if (ordered.length > LS_EXT_SUMMARY_TOP) summary += ', +' + (ordered.length - LS_EXT_SUMMARY_TOP) + ' more';
    summary += ')';
  }
  const result = out + summary;
  return result.length < input.length ? result : input;
}

export function compactTree(input: string): string {
  const lines = input.split('\n');
  const filtered: string[] = [];
  for (const line of lines) {
    if (line.includes('director') && line.includes('file')) continue;
    if (line.trim() === '' && filtered.length === 0) continue;
    filtered.push(line);
  }
  while (filtered.length > 0 && filtered[filtered.length - 1]?.trim() === '') filtered.pop();
  if (filtered.length > TREE_MAX_LINES) {
    const cut = filtered.length - TREE_MAX_LINES;
    return filtered.slice(0, TREE_MAX_LINES).join('\n') + '\n... +' + cut + ' more lines';
  }
  return filtered.join('\n');
}

export function compactSearchList(input: string): string {
  const lines = input.split('\n');
  const header = lines[0] ?? '';
  const paths: string[] = [];
  for (const raw of lines.slice(1)) {
    const trimmed = raw.trim();
    if (trimmed.startsWith('- ')) paths.push(trimmed.slice(2));
  }
  if (paths.length === 0) return input;
  const byDir = new Map<string, string[]>();
  for (const path of paths) {
    const slash = path.lastIndexOf('/');
    const dir = slash === -1 ? '.' : (path.slice(0, slash) || '/');
    const basename = slash === -1 ? path : path.slice(slash + 1);
    const files = byDir.get(dir) ?? [];
    files.push(basename);
    byDir.set(dir, files);
  }
  const dirs = Array.from(byDir.keys()).sort();
  let out = header + '\n' + paths.length + ' files in ' + dirs.length + ' dirs:\n\n';
  for (const dir of dirs.slice(0, SEARCH_LIST_TOTAL_DIR_MAX)) {
    const names = byDir.get(dir) ?? [];
    out += dir + '/ (' + names.length + '):\n';
    for (const name of names.slice(0, SEARCH_LIST_PER_DIR_MAX)) out += '  ' + name + '\n';
    if (names.length > SEARCH_LIST_PER_DIR_MAX) out += '  +' + (names.length - SEARCH_LIST_PER_DIR_MAX) + '\n';
    out += '\n';
  }
  if (dirs.length > SEARCH_LIST_TOTAL_DIR_MAX) out += '+' + (dirs.length - SEARCH_LIST_TOTAL_DIR_MAX) + ' more dirs\n';
  const result = out.replace(/\n+$/, '');
  return result.length < input.length ? result : input;
}

export function compactReadNumbered(input: string): string {
  const lines = input.split('\n');
  if (lines.length < SMART_TRUNCATE_MIN_LINES) return input;
  const sample = lines.slice(0, 100).filter((line) => line.length > 0);
  if (sample.length < 5) return input;
  const hits = sample.filter((line) => /^\s*\d+\|/.test(line)).length;
  if (hits / sample.length < READ_NUMBERED_MIN_HIT_RATIO) return input;
  const head = lines.slice(0, SMART_TRUNCATE_HEAD);
  const tail = lines.slice(Math.max(head.length, lines.length - SMART_TRUNCATE_TAIL));
  const cut = lines.length - head.length - tail.length;
  if (cut <= 0) return input;
  return [...head, '... +' + cut + ' lines truncated (file continues)', ...tail].join('\n');
}

export function compactDedupLog(input: string): string {
  const lines = input.split('\n');
  const out: string[] = [];
  let previous: string | null = null;
  let runCount = 0;
  let blankStreak = 0;
  const flushRun = (): void => {
    if (previous !== null && runCount > 1) out.push('  ... (' + (runCount - 1) + ' duplicate lines)');
  };
  for (const line of lines) {
    if (!line.trim()) {
      if (blankStreak < 1) out.push(line);
      blankStreak += 1;
      flushRun();
      previous = null;
      runCount = 0;
      continue;
    }
    blankStreak = 0;
    if (line === previous) {
      runCount += 1;
      continue;
    }
    flushRun();
    out.push(line);
    previous = line;
    runCount = 1;
    if (out.length >= DEDUP_LINE_MAX) {
      out.push('... (truncated at ' + DEDUP_LINE_MAX + ' lines)');
      return out.join('\n');
    }
  }
  flushRun();
  return out.join('\n');
}

export function compactSmartTruncate(input: string): string {
  return smartTruncate(input);
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
const RE_GIT_LOG = /^[*|/\\ ]*commit [0-9a-f]{7,40}$/m;
const RE_BUILD_OUTPUT = /^(npm (warn|error|ERR!)|yarn (warn|error)|\s*Compiling\s+\S+|\s*Downloading\s+\S+|added \d+ package|\[ERROR\]|BUILD (SUCCESS|FAILED)|\s*Finished\s+|Successfully (installed|built)|ERROR:)/im;
const RE_TREE_GLYPH = /[├└]──|│  /;
const RE_LS_ROW = /^[-dlbcps][rwx-]{9}/m;
const RE_LS_TOTAL = /^total \d+$/m;
const RE_SEARCH_LIST_HEADER = /^Result of search in '[^']*' \(total \d+ files?\):/;

export function autoDetectFilter(text: string): FilterFn | null {
  const head = text.length > DETECT_WINDOW ? text.slice(0, DETECT_WINDOW) : text;
  if (RE_GIT_LOG.test(head) || isGitOneline(head)) return compactGitLog;
  if (RE_GIT_DIFF.test(head) || RE_GIT_DIFF_HUNK.test(head)) return compactGitDiff;
  if (RE_GIT_STATUS.test(head) || isMostlyPorcelain(head)) return compactGitStatus;
  if (RE_BUILD_OUTPUT.test(head)) return compactBuildOutput;

  const lines = head.split('\n');
  const nonEmpty = lines.filter((line) => line.trim().length > 0);
  const firstFive = nonEmpty.slice(0, 5);
  if (firstFive.some(isGrepLine)) return compactGrep;
  if (nonEmpty.length >= 3 && nonEmpty.every(isPathLike)) return compactFind;
  if (RE_TREE_GLYPH.test(head)) return compactTree;
  if (RE_LS_TOTAL.test(head) || countMatches(head, RE_LS_ROW) >= 3) return compactLs;
  if (RE_SEARCH_LIST_HEADER.test(head)) return compactSearchList;
  if (lines.length >= SMART_TRUNCATE_MIN_LINES && isLineNumbered(lines)) return compactReadNumbered;
  if (nonEmpty.length >= 5) return compactDedupLog;
  if (text.split('\n').length >= SMART_TRUNCATE_MIN_LINES) return compactSmartTruncate;
  return null;
}

function isGitOneline(text: string): boolean {
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean).slice(0, 8);
  return lines.length >= 2 && lines.every((line) => /^[*|/\\ ]*[0-9a-f]{7,40}\s+\S+/i.test(line));
}

function isGrepLine(line: string): boolean {
  const first = line.indexOf(':');
  if (first === -1) return false;
  const second = line.indexOf(':', first + 1);
  if (second === -1) return false;
  return /^\d+$/.test(line.slice(first + 1, second));
}

function isPathLike(line: string): boolean {
  const value = line.trim();
  if (!value) return false;
  if (/^[A-Za-z]:[\\/]/.test(value)) return true;
  if (value.includes(':')) return false;
  return value.startsWith('.') || value.startsWith('/') || value.includes('/') || value.includes('\\');
}

function isLineNumbered(lines: string[]): boolean {
  const sample = lines.slice(0, 100).filter((line) => line.length > 0);
  if (sample.length < 5) return false;
  const hits = sample.filter((line) => /^\s*\d+\|/.test(line)).length;
  return hits / sample.length >= READ_NUMBERED_MIN_HIT_RATIO;
}

function isMostlyPorcelain(head: string): boolean {
  const lines = head.split('\n').filter((line) => line.trim());
  if (lines.length < 3) return false;
  const hits = lines.filter((line) => /^[ MADRCU?!][ MADRCU?!] \S/.test(line)).length;
  return hits / lines.length >= 0.6;
}

function countMatches(text: string, regex: RegExp): number {
  const global = new RegExp(regex.source, regex.flags.includes('g') ? regex.flags : regex.flags + 'g');
  return (text.match(global) ?? []).length;
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
