# Session S04 — Direct, HTTP Proxy and Relay Egress Policy Audit

**Status:** Not started  
**Scope source:** `goals.md` on `main`, `BR-SCOPE-1.2`  
**Related requirement:** FR-M5  
**Tracking log:** `task/PR-2-stabilize-validation.md`

## Objective

Audit and prove the egress selection contract for direct, HTTP forward-proxy, and configured relay routes. A selected proxy/relay failure must not silently become direct egress when that violates configured policy.

## Entry gate

- Re-read FR-M5 and the current egress/proxy/relay implementation and tests.
- Record current branch head and CI before changing files.
- Map each route and fallback decision before adding or modifying tests.

## In scope

- Build a route matrix for direct, HTTP proxy, and relay modes, including configuration errors, connection failures, HTTP CONNECT failures, and exhausted route/pool cases.
- Confirm which route was selected and whether fallback is permitted for each configuration.
- Assert actionable upstream status/body propagation where safe, and generic redacted diagnostics where raw details could expose secrets.
- Add only missing regression tests and make a minimal production fix if a proven violation exists.

## Out of scope

- Proxy-pool scheduling/cooldown improvements assigned to S25–S27, except when required to close a MUST violation.
- New provider integrations or broad networking redesign.
- Logging credentials, proxy URL userinfo, or sensitive upstream response content.

## Acceptance criteria

- [ ] Every route-matrix case has an explicit expected egress decision.
- [ ] Tests prove configured proxy/relay failure cannot silently switch to direct egress in covered cases.
- [ ] No-safe-route behavior returns a bounded, actionable failure without leaking credentials.
- [ ] Existing direct mode remains functional when explicitly selected.
- [ ] Focused tests, full tests, type-check and build pass, or exact gaps are recorded.
- [ ] Task log records changed files, evidence, commit SHA, CI and next task S05.

## Session report

Not started. Do not mark complete until the criteria above have evidence.
