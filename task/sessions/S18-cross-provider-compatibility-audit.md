# Session S18 — Cross-Provider Compatibility and Fallback Regression Audit

**Status:** Not started  
**Scope source:** `goals.md` on `main`, `BR-SCOPE-1.2`  
**Dependency:** S11 must pass; review results from provider adapters that were actually implemented.  
**Tracking log:** `task/PR-2-stabilize-validation.md`

## Objective

Validate that approved provider additions do not regress the default OpenCode Zen Free path or custom OpenAI-compatible upstream path, and that fallback remains bounded and consistent with configured egress policy.

## Entry gate

- Verify S11's MUST gate result.
- Inventory only providers that are actually implemented and supported on the current branch; do not assume S14/S17/S15 work passed.
- Identify baseline tests and current CI state before making changes.

## In scope

- Build a compatibility matrix across existing Zen Free/custom OpenAI-compatible paths and each implemented provider.
- Test catalog/model selection, supported tool calls, JSON/non-streaming, SSE, upstream errors/status/body, auth expiry, quota/rate limits, timeout and downstream cancellation.
- Test fallback/retry bounds, account/provider state, and preservation of explicit direct/HTTP-proxy/relay policy.
- Identify regressions and fix only small, directly evidenced issues; create separate cards for broader defects.
- Record live inference evidence only for routes actually exercised in an authorized environment.

## Out of scope

- Adding new providers or assuming unsupported capabilities.
- Falling back silently to direct egress when a selected proxy/relay fails.
- Claiming every provider supports tools/streaming without provider-specific evidence.

## Acceptance criteria

- [ ] Compatibility matrix marks PASS/FAIL/BLOCKED per implemented provider and capability.
- [ ] Default Zen Free and custom OpenAI-compatible regression tests pass.
- [ ] Fallback is bounded and does not violate explicit egress selection.
- [ ] Failures preserve actionable errors without leaking credentials.
- [ ] Current-head validation and any runtime limitations are recorded.
- [ ] Unresolved issues are split into focused follow-up tasks; no missing capability is reported as passed.

## Session report

Not started. This task validates existing integrations; it does not certify a provider whose own acceptance gate is incomplete.
