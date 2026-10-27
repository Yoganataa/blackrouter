# Session S23 — Linear Token-Saver Stage 4: I Have ADHD

**Status:** Not started  
**Scope source:** `goals.md` on `main`, `BR-SCOPE-1.2`  
**Dependencies:** S11 MUST gate passed; S19 provenance/license audit passed; S20–S22 implemented and validated.  
**Pipeline order:** 9router-go token-saver behavior → RTK → Caveman → I Have ADHD.  
**Tracking log:** `task/PR-2-stabilize-validation.md`

## Objective

Implement I Have ADHD as stage 4 after Caveman, improving scanability according to verified upstream behavior without sacrificing technical completeness, context or correctness.

## Entry gate

- Confirm current branch/head and acceptance evidence for S11 and S19–S22.
- Pin the actual upstream source revision, relevant paths, license and transformation semantics.
- Do not infer behavior from the project name or conflate this stage with Ponytail or another profile. Stop if provenance or license is unresolved.

## In scope

- Implement only the approved I Have ADHD behavior in the fourth pipeline position.
- Add deterministic tests for long instructions, task lists, nested steps, code blocks, diagnostics, tool-call content, paths, line numbers and context-dependent follow-ups.
- Verify that formatting/scannability changes retain all actionable steps, conditions, caveats, code and error context.
- Ensure empty input, already-scannable input, malformed input and stage failures produce safe no-op/original-content behavior.
- Keep stage-specific tests separable from final combo tests.

## Out of scope

- Reordering the pipeline or adding standalone primary toggles.
- Ponytail behavior or unrelated style profiles.
- Full end-to-end combo and token-impact acceptance (S24).

## Acceptance criteria

- [ ] Source revision, license, paths and verified semantics are documented.
- [ ] Stage runs after Caveman and has focused deterministic regression tests.
- [ ] Output is more scannable where applicable without dropping technical detail or necessary context.
- [ ] Safe no-op/error behavior is covered; no silent destructive rewriting.
- [ ] Existing tests pass without weakened assertions; type-check, tests, build and bundle diff are reviewed.
- [ ] Task log records commit, evidence, risks and next task.

## Session report

Not started. S23 is stage 4 only; S24 owns combo integration and end-to-end validation.
