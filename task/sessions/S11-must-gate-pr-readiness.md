# Session S11 — FR-M1–FR-M8 MUST Gate and PR #2 Readiness

**Status:** Not started  
**Scope source:** `goals.md` on `main`, `BR-SCOPE-1.2`  
**Dependency:** S01–S10 results must be reviewed; any blocked task remains blocked.  
**Tracking log:** `task/PR-2-stabilize-validation.md`

## Objective

Perform an evidence-based final audit of all MUST requirements FR-M1–FR-M8 and decide whether PR #2 is ready to merge. This is a decision gate, not permission to waive missing acceptance evidence.

## Entry gate

- Read the current `main/goals.md`, session plan, task log, S01–S10 cards and reports, current PR head, and CI runs.
- Confirm the exact commit SHA for every cited CI or runtime result.
- Check whether the latest required runtime evidence exists; do not infer it from unit tests or a green build.

## In scope

- Build a requirement-by-requirement matrix for FR-M1 through FR-M8.
- Mark each requirement **PASS**, **FAIL**, or **BLOCKED**, with direct evidence and any unresolved gap.
- Recheck host integration, loopback binding, no-key OpenCode Zen Free path, native OpenCode behavior, egress policy, cancellation/timeouts, response/stream contracts, secret handling, reproducible CI/bundles, and runtime acceptance.
- Decide PR readiness and list narrowly scoped follow-up work for every failed or blocked gate.

## Out of scope

- Implementing provider adapters or starting any SHOULD work.
- Relaxing tests, changing the frozen scope, or treating missing evidence as a pass.
- Claiming live host/provider acceptance without actual runtime execution.

## Acceptance criteria

- [ ] Every FR-M1–FR-M8 row has PASS/FAIL/BLOCKED, evidence, commit/run identity, and rationale.
- [ ] Any required runtime check not performed remains BLOCKED.
- [ ] PR merge readiness is explicit and follows the scope's MUST gate; no merge recommendation if required gates are unresolved.
- [ ] The session plan and task log are updated with the decision and next permitted task.
- [ ] If the audit finds a new gap, create a focused task card before implementation rather than broadening this session.

## Session report

Not started. Do not mark Phase A complete or authorize Phase B unless all required MUST gates pass with evidence.
