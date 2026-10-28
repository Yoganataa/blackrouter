# Session S26 — Proxy Pool Failure, Cooldown and Recovery Regression Coverage

**Status:** Not started  
**Scope source:** `goals.md` on `main`, `BR-SCOPE-1.2`  
**Dependencies:** S11 MUST gate passed for SHOULD work; S25 audit findings reviewed. If S25 identifies a MUST violation, route it into a separately scoped Phase A task first.  
**Tracking log:** `task/PR-2-stabilize-validation.md`

## Objective

Add focused regression tests for the actual proxy/relay pool state machine and ensure failures are bounded, actionable and compliant with the selected egress policy.

## Entry gate

- Refresh branch/head, goals, S25 findings and current CI state.
- Map existing pool code and tests before changing anything; reuse actual state names and retry semantics rather than inventing a new state machine.
- If required behavior is unclear, document the gap and stop short of changing production logic.

## In scope

- Add deterministic tests for unavailable relay, invalid proxy configuration, all candidates unhealthy, cooldown expiry and recovery where those states are supported by the implementation.
- Assert bounded retry/attempt counts and prevention of candidate cycling or infinite retry.
- Verify actionable failure results when no eligible route remains.
- Assert a selected proxy/relay never silently falls back to direct egress.
- Keep provider/account errors distinct from route-transport health changes.
- Change production code only when a failing regression test demonstrates a scoped defect and the S11 gate permits SHOULD work.

## Out of scope

- New routing strategies or provider adapters.
- UI/panel behavior (S27).
- Treating source inspection alone as runtime acceptance.

## Acceptance criteria

- [ ] Each test maps to a documented S25 finding or explicit requirement.
- [ ] Unavailable routes, invalid configuration, all-unhealthy state, cooldown expiry and recovery are covered where applicable; unsupported states are explicitly documented.
- [ ] Retry count is bounded and errors remain actionable.
- [ ] No selected proxy/relay route silently switches to direct egress.
- [ ] Existing tests pass without weakened assertions; type-check/tests/build and generated bundle diff are reviewed if code changes.
- [ ] Task log records changed files, CI evidence, remaining gaps and next task.

## Session report

Not started. No SHOULD implementation before the Phase A MUST gate passes.
