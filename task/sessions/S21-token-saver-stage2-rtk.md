# Session S21 — Linear Token-Saver Stage 2: RTK

**Status:** Not started  
**Scope source:** `goals.md` on `main`, `BR-SCOPE-1.2`  
**Dependencies:** S11 MUST gate passed; S19 provenance/license audit passed; S20 stage 1 implemented and validated.  
**Pipeline order:** 9router-go token-saver behavior → RTK → Caveman → I Have ADHD.  
**Tracking log:** `task/PR-2-stabilize-validation.md`

## Objective

Integrate RTK as stage 2, after the existing stage 1, using verified upstream behavior and a narrow adapter that fits BlackRouter's pipeline contract.

## Entry gate

- Recheck current branch/head, S11 status, S19 source/license record and S20 implementation/tests.
- Pin the RTK upstream repository, exact revision, relevant paths, license and behavior before adapting it.
- If the source or license is unclear, or S20 is incomplete, stop and record the blocker; do not implement from assumptions.

## In scope

- Define RTK stage input/output and no-op/error behavior consistent with the existing stage contract.
- Implement only the relevant verified filtering behavior; keep the stage after stage 1.
- Add deterministic fixtures for git status/diff, search results, file listings/content, build/test output, repeated lines and large output.
- Verify preservation of exit status, file paths, line numbers, diff hunks, errors, warnings and sufficient actionable context.
- Cover empty, malformed, unsupported and already-compact input; ensure failures do not silently erase useful output.
- Record repeatable output-size/token-count measurements as diagnostics only unless the measurement methodology and quality checks justify a claim.

## Out of scope

- Caveman or I Have ADHD implementation (S22–S23).
- Full combo toggle/end-to-end integration (S24).
- Unverified RTK features, broad output rewriting, or headline savings claims.

## Acceptance criteria

- [ ] Upstream revision, paths, license and adapted behavior are documented.
- [ ] RTK runs strictly after stage 1 and has deterministic unit/regression coverage.
- [ ] Tests cover git/search/files/build/repeated/large output and preserve status, paths, line numbers, diffs and useful context.
- [ ] Failure/no-op paths do not corrupt content or hide actionable errors.
- [ ] Existing tests pass without weakened assertions; type-check, tests, build and bundle diff are reviewed.
- [ ] No token-savings claim is made without repeatable measurements and output-quality checks.
- [ ] Task log records commit, evidence, unresolved risks and next task.

## Session report

Not started. S21 is stage 2 only; do not begin S22 until its acceptance evidence is recorded.
