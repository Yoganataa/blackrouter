# Session S25 — Proxy Pool Selection, Health, Cooldown and Recovery Audit

**Status:** Not started  
**Scope source:** `goals.md` on `main`, `BR-SCOPE-1.2`  
**Dependency:** S11 MUST gate must pass before SHOULD work. MUST defects discovered here should be reported to Phase A and may be fixed only through a separately scoped task; otherwise execute after S11.  
**Tracking log:** `task/PR-2-stabilize-validation.md`

## Objective

Audit the proxy/relay pool selection and health lifecycle, including cooldown, retry eligibility and recovery, without conflating provider/account health with egress-route health.

## Entry gate

- Refresh current branch/head, S11 status and the current goals/session plan.
- Map the actual implementation before proposing changes. Identify the state owner, persisted fields, selection order, cooldown clock, retry bound and recovery triggers.
- Treat direct, HTTP forward-proxy and relay routes as separate configured egress modes. A failed selected proxy/relay must not silently bypass to direct egress.

## In scope

- Trace selection from request entry through candidate choice, failure classification, health/cooldown update, retry and recovery.
- Build a state-transition table for healthy, transient failure, unhealthy/cooldown, cooldown expiry, recovery probe and permanent/configuration failure where these states exist.
- Distinguish route transport failures from provider/account rate limits, quota exhaustion, invalid credentials, bad requests and unsupported models.
- Review maximum attempts, cycle prevention, session affinity, concurrent requests and stale state.
- Map each state transition and retry eligibility decision to existing tests; identify missing tests without presuming the current behavior.
- Audit actionable errors when all eligible routes are unavailable and verify no hidden direct fallback.

## Out of scope

- Provider adapter implementation or unrelated UI redesign.
- Adding routing strategies without evidence of a gap and a separate scope decision.
- Marking runtime behavior accepted from source inspection alone.

## Acceptance criteria

- [ ] Current implementation and relevant source paths are cited in the task report.
- [ ] State-transition and retry-eligibility matrix is documented.
- [ ] Health classifications do not poison unrelated provider/account or proxy/relay state.
- [ ] Tests cover or explicitly identify gaps for cooldown expiry, recovery, bounded attempts, all routes unhealthy and invalid proxy configuration.
- [ ] No selected proxy/relay route silently falls back to direct egress.
- [ ] Type-check/tests/build are run if changes are made; tests are not weakened.
- [ ] Task log records findings, evidence, blockers and next task.

## Session report

Not started. This is an audit task, not authorization to change runtime code before Phase A passes.
