# Session S20 — Linear Token-Saver Stage 1: Relevant 9router-go Behavior

**Status:** Not started  
**Scope source:** `goals.md` on `main`, `BR-SCOPE-1.2`  
**Dependency:** S11 MUST gate and S19 source/provenance audit must pass.  
**Pipeline order:** stage 1 → RTK → Caveman → I Have ADHD.  
**Tracking log:** `task/PR-2-stabilize-validation.md`

## Objective

Specify and implement only the verified, relevant 9router-go token-saving behavior as stage 1 of the approved linear combo, with a clear contract and focused regression tests.

## Entry gate

- Review S19's source evidence, license, exact revision and approved behavior.
- Confirm S11 passed and the current branch/head is known.
- If provenance, license or intended behavior is unclear, stop before implementation.

## In scope

- Define stage input/output types, invocation boundary, no-op behavior, error handling and ordering.
- Implement only the small relevant behavior; do not port the full 9router-go service or dashboard.
- Preserve code, tool-call structure, safety-critical instructions, paths, line numbers, diffs and diagnostics as required by the verified stage semantics.
- Add focused unit tests for representative eligible and ineligible content, empty input, malformed input and stage failure/no-op behavior.
- Add repeatable fixtures/measurement hooks without asserting unsupported token savings.
- Keep the single top-level combo toggle and fixed order as integration constraints; full combo integration belongs to S24.

## Out of scope

- RTK, Caveman or I Have ADHD implementation (S21–S23).
- Reordering or independently promoting stages.
- Broad prompt rewriting, silent content deletion or unmeasured performance claims.

## Acceptance criteria

- [ ] Implementation follows the verified S19 behavior and licensing/provenance record.
- [ ] Stage contract and deterministic focused tests are added.
- [ ] No-op/error paths preserve safe, useful output and do not corrupt request/tool semantics.
- [ ] Existing tests pass; no tests are weakened to achieve green CI.
- [ ] Type-check/tests/build and any generated bundle diff are reviewed and recorded.
- [ ] No savings claim is made without repeatable before/after token and quality measurements.
- [ ] Task log records commit SHA, evidence, unresolved risks and next task.

## Session report

Not started. Stage 1 alone is not the completed combo; S21–S24 remain separate and gated sessions.
