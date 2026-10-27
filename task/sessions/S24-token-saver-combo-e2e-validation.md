# Session S24 — Linear Token-Saver Combo Integration and End-to-End Validation

**Status:** Not started  
**Scope source:** `goals.md` on `main`, `BR-SCOPE-1.2`, change `BR-CHANGE-2026-10-27-LINEAR-TOKEN-SAVER`  
**Dependencies:** S11 MUST gate passed; S19 provenance audit passed; S20–S23 stage implementations and tests accepted.  
**Tracking log:** `task/PR-2-stabilize-validation.md`

## Objective

Integrate the four verified stages behind one top-level enable/disable control and validate fixed ordering, semantic quality, failure behavior and repeatable token/output impact.

## Entry gate

- Verify current branch/head and the acceptance evidence for S11 and S19–S23.
- If any stage is incomplete or provenance/license evidence is unresolved, do not integrate around the gap; record the blocker.
- Confirm the existing default behavior remains unchanged when the combo is disabled.

## In scope

- Wire stages in exactly this order: 9router-go token-saver behavior → RTK → Caveman → I Have ADHD.
- Expose one combo-level toggle; do not expose four unrelated primary toggles.
- Add end-to-end tests proving order, disabled-path identity, deterministic output and safe handling of stage no-op/error cases.
- Test preservation of safety instructions, tool-call structure, code literals, paths, line numbers, diffs, errors, diagnostics and multi-step task requirements.
- Build a representative, versioned benchmark corpus with baseline and transformed outputs; measure input/output token counts using the same tokenizer or explicitly documented counting method.
- Add quality review criteria and report regressions alongside size changes. Separate measured observations from any generalization or marketing claim.

## Out of scope

- New providers or unrelated routing/UI features.
- Reordering stages, silent deletion of safety/tool/code content, or claiming universal savings from a small fixture set.
- Declaring live runtime acceptance unless the relevant runtime is actually exercised.

## Acceptance criteria

- [ ] One top-level toggle controls the complete pipeline; disabled mode preserves prior behavior.
- [ ] End-to-end tests prove the exact four-stage order and safe failure/no-op semantics.
- [ ] Regression corpus covers representative coding, debugging, search, git, files, build/test and long-context cases.
- [ ] Before/after token/output measurements are repeatable and methodology is documented.
- [ ] Quality checks detect semantic/context loss; savings claims are limited to evidence actually measured.
- [ ] Existing tests pass without weakened assertions; type-check, full tests, build and generated bundle diff are reviewed.
- [ ] Task log records commit, evidence, measured results, limitations and next task.

## Session report

Not started. This session completes only the token-saver integration work if every criterion is evidenced; it does not override the Phase A MUST gate.
