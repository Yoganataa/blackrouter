# Session S33 — Release and Merge-Readiness Decision

**Status:** Not started  
**Scope source:** `goals.md` on `main`, `BR-SCOPE-1.2`  
**Dependencies:** S11 MUST-gate decision, S31 security/configuration review, S32 release acceptance matrix, and all applicable task reports.  
**Tracking log:** `task/PR-2-stabilize-validation.md`

## Objective

Produce a final evidence-based release/merge decision for PR #2, including a requirement-level status matrix, unresolved risks, and an explicit READY / NOT READY / BLOCKED recommendation.

## Entry gate

- Refresh `goals.md`, session plan, task log, all relevant task reports, current PR head, CI runs, bundle state and runtime acceptance evidence.
- Verify that each cited CI/runtime result corresponds to the code commit being assessed or clearly label it historical.
- Do not assume documentation/task-card completion means implementation or acceptance tasks are complete.

## In scope

- Check the Definition of Done and every MUST requirement FR-M1–FR-M8 against direct evidence.
- Review S11's PASS/FAIL/BLOCKED decisions, S31 security/provenance findings and S32 endpoint/egress/runtime matrix.
- Verify current-head CI status, type-check, tests, build, generated bundle consistency and any required live OpenChamber/OpenCode/provider checks.
- List each unresolved defect, missing evidence, environmental blocker and accepted risk with owner/next action where supported.
- Make one explicit decision: READY only when all required gates pass; NOT READY when a required check fails; BLOCKED when required evidence cannot be obtained.
- Update session plan/task log with decision, evidence references and next permitted action.

## Out of scope

- Merging the PR or changing branch protection as part of this audit.
- Waiving requirements, rewriting failing tests to pass, or treating a blocked test as passed.
- Beginning new SHOULD work while the MUST gate remains unresolved.

## Acceptance criteria

- [ ] FR-M1–FR-M8 each have PASS / FAIL / BLOCKED, rationale, and evidence tied to a commit/run or actual runtime observation.
- [ ] Current-head CI and bundle status are verified; stale CI evidence is labeled historical.
- [ ] Required live runtime/provider checks are either demonstrated or explicitly BLOCKED.
- [ ] S31/S32 findings and remaining risks have a disposition and actionable follow-up.
- [ ] Release/merge recommendation is explicit and consistent with the MUST-first gate.
- [ ] Session plan and task log are updated; no source changes or merge are implied by this decision record.

## Session report

Not started. Do not recommend merge while any required MUST gate is failed or lacks required evidence.
