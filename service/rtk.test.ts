import { describe, expect, it } from 'bun:test';

import {
  autoDetectFilter,
  compactGitDiff,
  compactGitStatus,
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

  it('compacts git status output into branch and counts', () => {
    const raw = `## main\n M src/contract.ts\n M src/zen.ts\n?? new-file.txt\n`;
    const compacted = compactGitStatus(raw);
    expect(compacted).toContain('* main');
    expect(compacted).toContain('~ Modified: 2 files');
    expect(compacted).toContain('? Untracked: 1 files');
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
    expect(compacted).toContain('7 matches across 2 files');
    expect(compacted).toContain('[src/foo.ts] (6)');
    expect(compacted).toContain('+1 more');
    expect(compacted).toContain('[src/bar.ts] (1)');
  });

  it('truncates large generic text cleanly', () => {
    const lines: string[] = [];
    for (let i = 0; i < 100; i++) {
      lines.push(`Line number ${i}`);
    }
    const raw = lines.join('\n');
    const truncated = smartTruncate(raw);
    expect(truncated).toContain('Line number 0');
    expect(truncated).toContain('Line number 99');
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
    const modified = compressMessages(payload, true);
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
