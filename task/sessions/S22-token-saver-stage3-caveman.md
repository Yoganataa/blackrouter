# Session S22 — Linear Token-Saver Stage 3: Caveman

**Status:** Not started  
**Scope source:** `goals.md` on `main`, `BR-SCOPE-1.2`  
**Dependencies:** S11 MUST gate passed; S19 provenance/license audit passed; S20 and S21 implemented and validated.  
**Pipeline order:** 9router-go token-saver behavior → RTK → Caveman → I Have ADHD.  
**Tracking log:** `task/PR-2-stabilize-validation.md`

## Objective

Add Caveman as stage 3 after RTK, based on verified upstream behavior, while retaining the technical information needed for coding, debugging and multi-step work.

## Entry gate

- Confirm current branch/head and evidence for S11, S19, S20 and S21.
- Pin the Caveman upstream revision, relevant paths, license and actual transformation semantics.
- If source provenance, license or stage contract is uncertain, stop and document the blocker.

## In scope

- Adapt only the verified Caveman behavior needed by the linear token-saver pipeline.
- Define deterministic no-op/error handling and preserve pipeline input/output compatibility.
- Add regression fixtures for coding requests, debugging traces, multi-step instructions, code snippets, tool calls, compiler/test diagnostics, paths, line numbers, diffs and structured output.
- Check that compression does not remove required steps, code literals, safety constraints, error causes or information needed to continue a task.
- Include adversarial/ambiguous cases where a short rewrite could change meaning; preserve original content or safely no-op when equivalence is uncertain.

## Out of scope

- I Have ADHD implementation (S23).
- Full combo integration and performance claims (S24).
- Treating stylistic terseness as proof of semantic equivalence or importing unrelated Caveman features.

## Acceptance criteria

- [ ] Upstream revision, license, paths and behavior are recorded.
- [ ] Caveman executes after RTK and has deterministic unit/regression tests.
- [ ] Coding, debugging and multi-step fixtures preserve necessary steps, code and diagnostics.
- [ ] Uncertain or failed transformations safely preserve useful original content.
- [ ] Existing tests pass without weakening assertions; type-check, tests, build and bundle diff are reviewed.
- [ ] Task log records commit, evidence, risks and next task.

## Session report

Not started. S22 is stage 3 only; S23 remains gated on S22 evidence.
