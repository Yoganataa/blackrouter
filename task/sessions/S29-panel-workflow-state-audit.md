# Session S29 — Panel Loading, Empty, Success, Warning and Error-State Audit

**Status:** Not started  
**Scope:** `goals.md` on `main`, `BR-SCOPE-1.2`  
**Dependencies:** S11 MUST gate passed; relevant S28 findings reviewed.  
**Log:** `task/PR-2-stabilize-validation.md`

## Objective
Audit panel workflows so loading, empty, success, warning and error states are accurate and actionable, without false success or duplicate host settings.

## Entry gate
- Refresh branch/head, goals, panel source and test coverage.
- Enumerate actual workflows and state models before proposing changes.
- Separate automated source/test evidence from host runtime evidence.

## In scope
- Build a state matrix for existing model catalog, router/provider status, proxy pool and settings workflows.
- Verify loading, empty/no-data, success, partial/warning and error states.
- Check async failures, timeouts and stale responses cannot overwrite newer state or show false success.
- Review remediation text and secret redaction.
- Check duplicate submissions, repeated clicks, reset/retry behavior; add targeted tests for concrete gaps.

## Out of scope
- Broad visual redesign, unrelated features or new providers.
- Inferring host behavior from component tests alone.

## Acceptance criteria
- [ ] State matrix cites components, service APIs and tests.
- [ ] Transitions are covered or gaps explicitly recorded.
- [ ] Async race/error cases do not cause false success or stale-state overwrite.
- [ ] Diagnostics are actionable and secret-safe.
- [ ] Relevant tests/build/bundle diff and task log are reviewed.

## Session report
Not started. No unrelated UI scope is authorized.
