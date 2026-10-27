# Session S27 — Proxy Pool Panel Controls and Runtime State

**Status:** Not started  
**Scope:** `goals.md` on `main`, `BR-SCOPE-1.2`  
**Dependencies:** S11 MUST gate passed; S25 findings and S26 regression results reviewed.  
**Log:** `task/PR-2-stabilize-validation.md`

## Objective
Validate that panel controls, status indicators and persisted settings reflect the service's actual proxy-pool runtime state.

## Entry gate
- Refresh branch/head, S11 status, S25–S26 evidence and CI.
- Identify source and generated bundles from the manifest/build workflow; do not assume generated files are redundant.
- Confirm a supported OpenChamber host is available. If not, separate source/test results from blocked runtime acceptance.

## In scope
- Trace panel controls to service/API state and persistence.
- Verify enabled/disabled, health, cooldown, unavailable and configuration-error states where implemented.
- Test reload/restart persistence and preservation of stored credentials when masked placeholders are submitted unchanged.
- Ensure status updates reflect route health/recovery and do not show false success.
- Record host version, environment, reproduction steps and evidence for runtime claims.

## Out of scope
- Broad panel redesign, duplicate host settings or provider UI unrelated to proxy pools.
- Passing host acceptance from unit tests alone.

## Acceptance criteria
- [ ] Each visible control maps to a real service state and documented action.
- [ ] Displayed health/cooldown state matches service responses and persistence.
- [ ] Secrets remain masked and stored credentials are preserved.
- [ ] Loading, unavailable and error states do not appear healthy/successful.
- [ ] Host evidence is recorded, or the exact runtime blocker remains open.
- [ ] Relevant tests/build/bundle diff and task log are reviewed.

## Session report
Not started. Host-specific acceptance requires actual host evidence.
