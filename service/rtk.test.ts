import { describe, expect, it } from 'bun:test';

import {
  autoDetectFilter,
  compactBuildOutput,
  compactDedupLog,
  compactFind,
  compactGitDiff,
  compactGitLog,
  compactGitStatus,
  compactLs,
  compactReadNumbered,
  compactSmartTruncate,
  compressText,
  compactSearchList,
  compactTree,
  compactGrep,
  compressMessages,
  smartTruncate,
} from './rtk.ts';

describe('RTK token compression', () => {
  it('compacts git diff output and truncates huge hunks', () => {
    let diff = 'diff --git a/src/index.ts b/src/index.ts\n@@ -1,5 +1,120 @@\n';
    for (let i = 0; i < 150; i++) {
      diff += `+const x${i} = ${i};\n`;
    }
    const compacted = compactGitDiff(diff);
    expect(compacted).toContain('src/index.ts');
    expect(compacted).toContain('lines truncated');
    expect(compacted).toContain('+150 -0');
  });

  it('matches 9Router diff context policy and retains context after edits', () => {
    const diff = [
      'diff --git a/src/router.ts b/src/router.ts',
      'index 1234567..89abcde 100644',
      '--- a/src/router.ts',
      '+++ b/src/router.ts',
      '@@ -1,4 +1,4 @@',
      ' const before = true;',
      '-const oldRoute = 1;',
      '+const newRoute = 1;',
      ' const after = true;',
      '\\ No newline at end of file',
    ].join('\n');

    const compacted = compactGitDiff(diff);
    expect(compacted).not.toContain('const before = true;');
    expect(compacted).toContain('-const oldRoute = 1;');
    expect(compacted).toContain('+const newRoute = 1;');
    expect(compacted).toContain('const after = true;');
    expect(compacted).toContain('+1 -1');
    expect(compacted).not.toContain('No newline at end of file');
  });

  it('uses the upstream ten-match grep cap per file', () => {
    const raw = Array.from({ length: 12 }, (_, index) =>
      `src/app.ts:${index + 1}:value-${index + 1} ${'x'.repeat(25)}`,
    ).join('\n');
    const compacted = compactGrep(raw);

    expect(compacted).toContain('12 matches in 1F:');
    expect(compacted).toContain('[file] src/app.ts (12):');
    expect(compacted).toContain('value-10');
    expect(compacted).not.toContain('value-11');
    expect(compacted).not.toContain('value-12');
    expect(compacted).toContain('+2');
  });

  it('compacts git status output into branch and counts', () => {
    const raw = `## main\n M src/contract.ts\n M src/zen.ts\n?? new-file.txt\n`;
    const compacted = compactGitStatus(raw);
    expect(compacted).toContain('* main');
    expect(compacted).toContain('~ Modified: 2 files');
    expect(compacted).toContain('? Untracked: 1 files');
  });

  it('preserves changed paths while summarizing git status', () => {
    const raw = [
      '## main',
      'M  src/staged.ts',
      ' M src/modified.ts',
      '?? docs/new-notes.md',
      '',
    ].join('\n');
    const compacted = compactGitStatus(raw);
    expect(compacted).toContain('+ Staged: 1 files');
    expect(compacted).toContain('  src/staged.ts');
    expect(compacted).toContain('~ Modified: 1 files');
    expect(compacted).toContain('  src/modified.ts');
    expect(compacted).toContain('? Untracked: 1 files');
    expect(compacted).toContain('  docs/new-notes.md');
  });

  it('caps the number of file paths emitted by git status', () => {
    const raw = [
      '## main',
      ...Array.from({ length: 12 }, (_, index) => ' M src/file-' + index + '.ts'),
    ].join('\n');
    const compacted = compactGitStatus(raw);
    expect(compacted).toContain('~ Modified: 12 files');
    expect(compacted).toContain('src/file-0.ts');
    expect(compacted).toContain('src/file-9.ts');
    expect(compacted).not.toContain('src/file-10.ts');
    expect(compacted).toContain('... +2 more');
  });

  it('compacts clean git status', () => {
    expect(compactGitStatus('')).toBe('Clean working tree');
    expect(compactGitStatus('   ')).toBe('Clean working tree');
  });

  it('compacts grep search results and groups by file', () => {
    const raw = [
      'src/foo.ts:10:console.log("first");',
      'src/foo.ts:20:console.log("second");',
      'src/foo.ts:30:console.log("third");',
      'src/foo.ts:40:console.log("fourth");',
      'src/foo.ts:50:console.log("fifth");',
      'src/foo.ts:60:console.log("sixth");',
      'src/bar.ts:5:return true;',
    ].join('\n');

    const compacted = compactGrep(raw);
    expect(compacted).toContain('7 matches in 2F:');
    expect(compacted).toContain('[file] src/foo.ts (6):');
    expect(compacted).toContain('sixth');
    expect(compacted).not.toContain('+1');
    expect(compacted).toContain('[file] src/bar.ts (1):');
  });

  it('detects and compacts detailed git log output without commit bodies', () => {
    const gitLog = [
      'commit abcdef1234567890',
      'Author: Dev <dev@example.com>',
      'Date:   Sat Oct 25 12:30:00 2026 +0700',
      '',
      '    Fix routing cooldown behavior',
      '',
      '    This repeated body contains implementation detail that is not useful in the compact summary.',
      '    More explanation that should be removed from the prompt.',
      'commit 0123456789abcdef',
      'Author: Dev <dev@example.com>',
      'Date:   Fri Oct 24 12:30:00 2026 +0700',
      '',
      '    Add request history',
    ].join('\n');
    expect(autoDetectFilter(gitLog)).toBe(compactGitLog);
    const compacted = compactGitLog(gitLog);
    expect(compacted).toContain('Fix routing cooldown behavior');
    expect(compacted).toContain('Author: Dev');
    expect(compacted).not.toContain('repeated body contains implementation');
  });

  it('keeps errors and final summaries from build output while dropping progress noise', () => {
    const raw = [
      'Compiling crate_a v1.0.0',
      'Compiling crate_b v2.0.0',
      'error[E0425]: cannot find value in this scope',
      ' --> src/main.rs:3:5',
      '  |',
      '  = note: an explanatory compiler message',
      '',
      'Finished dev profile [unoptimized + debuginfo] target(s) in 0.20s',
    ].join('\n');
    expect(autoDetectFilter(raw)).toBe(compactBuildOutput);
    const compacted = compactBuildOutput(raw);
    expect(compacted).toContain('Compiled 2 packages');
    expect(compacted).toContain('error[E0425]');
    expect(compacted).toContain('src/main.rs:3:5');
    expect(compacted).toContain('Finished dev profile');
    expect(compacted).not.toContain('Compiling crate_a');
  });

  it('groups find results by directory and caps each directory listing', () => {
    const raw = ['./src/a.ts\n./src/b.ts\n./tests/a.test.ts'];
    expect(autoDetectFilter(raw[0] ?? '')).toBe(compactFind);
    const compacted = compactFind(raw[0] ?? '');
    expect(compacted).toContain('3 files in 2 dirs');
    expect(compacted).toContain('src/  (2)');
    expect(compacted).toContain('a.test.ts');
  });

  it('compacts ls -la output with a useful extension summary', () => {
    const raw = [
      'total 24',
      'drwxr-xr-x 3 user group 4096 Oct 25 12:30 src',
      '-rw-r--r-- 1 user group 512 Oct 25 12:30 package.json',
      '-rw-r--r-- 1 user group 1024 Oct 25 12:31 README.md',
    ].join('\n');
    expect(autoDetectFilter(raw)).toBe(compactLs);
    const compacted = compactLs(raw);
    expect(compacted).toContain('src/');
    expect(compacted).toContain('package.json');
    expect(compacted).toContain('Summary: 2 files, 1 dirs');
  });

  it('removes tree summary rows and trailing blanks', () => {
    const raw = 'project\n├── src\n│  └── index.ts\n1 directory, 1 file\n\n';
    expect(autoDetectFilter(raw)).toBe(compactTree);
    const compacted = compactTree(raw);
    expect(compacted).toContain('index.ts');
    expect(compacted).not.toContain('1 directory');
    expect(compacted.endsWith('\n')).toBe(false);
  });

  it('special-cases line-numbered file reads with an explicit truncation marker', () => {
    const lines = Array.from({ length: 400 }, (_, index) => '  ' + (index + 1) + '|const value' + index + ' = true;');
    const raw = lines.join('\n');
    expect(autoDetectFilter(raw)).toBe(compactReadNumbered);
    const compacted = compactReadNumbered(raw);
    expect(compacted).toContain('file continues');
    expect(compacted).toContain('const value0');
    expect(compacted).toContain('const value399');
  });

  it('collapses consecutive duplicate log lines with a count', () => {
    const raw = [
      'build started',
      'warning: transient message',
      'warning: transient message',
      'warning: transient message',
      'tests started',
      'tests finished',
    ].join('\n');
    expect(autoDetectFilter(raw)).toBe(compactDedupLog);
    expect(compactDedupLog(raw)).toContain('(2 duplicate lines)');
  });

  it('groups Cursor search-list output by directory', () => {
    const raw = [
      "Result of search in 'src' (total 3 files):",
      '- src/a.ts',
      '- src/b.ts',
      '- src/utils/format.ts',
    ].join('\n');
    expect(autoDetectFilter(raw)).toBe(compactSearchList);
    const compacted = compactSearchList(raw);
    expect(compacted).toContain('3 files in 2 dirs');
    expect(compacted).toContain('src/utils/ (1):');
  });

  it('truncates large generic text cleanly', () => {
    const lines: string[] = [];
    for (let i = 0; i < 400; i++) {
      lines.push(`Line number ${i}`);
    }
    const raw = lines.join('\n');
    const truncated = smartTruncate(raw);
    expect(truncated).toContain('Line number 0');
    expect(truncated).toContain('Line number 399');
    expect(truncated).toContain('lines truncated');
  });

  it('leaves short generic text untouched in smartTruncate', () => {
    const short = 'Line 1\nLine 2\nLine 3';
    expect(smartTruncate(short)).toBe(short);
  });

  it('detects filters correctly based on content window', () => {
    expect(autoDetectFilter('diff --git a/a.ts b/a.ts\n@@ -1 +1 @@\n+a')).toBe(compactGitDiff);
    expect(autoDetectFilter('On branch main\nChanges to be committed:\n')).toBe(compactGitStatus);
    const grepText = 'src/a.ts:1:one\nsrc/a.ts:2:two\nsrc/b.ts:3:three\n';
    expect(autoDetectFilter(grepText)).toBe(compactGrep);
  });

  it('matches the 9Router 500-character minimum compression threshold', () => {
    const raw = [
      'diff --git a/x.ts b/x.ts',
      '@@ -1,1 +1,8 @@',
      ...Array.from({ length: 8 }, (_, index) => '+' + 'x'.repeat(35) + index),
    ].join('\n');
    expect(raw.length).toBeGreaterThan(256);
    expect(raw.length).toBeLessThan(500);

    const payload = { messages: [{ role: 'tool', tool_call_id: 'call_small', content: raw }] };
    expect(compressMessages(payload, true)).toBe(false);
    expect(payload.messages[0]?.content).toBe(raw);
  });

  it('compresses tool result messages in OpenAI format', () => {
    let diff = 'diff --git a/huge.ts b/huge.ts\n@@ -1,1 +1,200 @@\n';
    for (let i = 0; i < 200; i++) {
      diff += `+line ${i} content in large tool payload\n`;
    }

    const payload = {
      model: 'zen-free',
      messages: [
        { role: 'user', content: 'run git diff' },
        { role: 'assistant', tool_calls: [{ id: 'call_1', type: 'function', function: { name: 'bash' } }] },
        { role: 'tool', tool_call_id: 'call_1', content: diff },
      ],
    };

    const initialLength = (payload.messages[2] as { content: string }).content.length;
    const modified = compressMessages(payload);
    expect(modified).toBe(true);
    const newLength = (payload.messages[2] as { content: string }).content.length;
    expect(newLength).toBeLessThan(initialLength);
  });

  it('compresses tool_result blocks in Anthropic format', () => {
    let diff = 'diff --git a/anthropic.ts b/anthropic.ts\n@@ -1,1 +1,200 @@\n';
    for (let i = 0; i < 200; i++) {
      diff += `+added line ${i} for test payload padding\n`;
    }

    const payload = {
      model: 'zen-free',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'tool_result',
              tool_use_id: 'tool_1',
              content: diff,
            },
          ],
        },
      ],
    };

    const block = (payload.messages[0]?.content as Array<{ content: string }>)[0];
    const initialLength = block?.content.length ?? 0;
    const modified = compressMessages(payload, true);
    expect(modified).toBe(true);
    const newLength = block?.content.length ?? 0;
    expect(newLength).toBeLessThan(initialLength);
  });

  it('preserves legacy RTK compatibility exports', () => {
    expect(compactSmartTruncate).toBe(smartTruncate);
    const stats = { bytesBefore: 0, bytesAfter: 0, hits: [] as unknown[] };
    expect(compressText('short text', stats, 'compat')).toBe('short text');
    expect(stats.bytesBefore).toBe('short text'.length);
  });

  it('does nothing when disabled', () => {
    const rawDiff = 'diff --git a/test.ts b/test.ts\n@@ -1,1 +1,150 @@\n' + '+line\n'.repeat(150);
    const payload = {
      messages: [{ role: 'tool', content: rawDiff }],
    };
    const modified = compressMessages(payload, false);
    expect(modified).toBe(false);
    expect(payload.messages[0]?.content).toBe(rawDiff);
  });
});
