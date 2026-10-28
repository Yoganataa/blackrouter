# Session S04 — Direct, HTTP Proxy and Relay Egress Policy Audit

**Status:** Active  
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

- [x] Every route-matrix case has an explicit expected egress decision.
- [x] Tests prove configured proxy/relay failure cannot silently switch to direct egress in covered cases.
- [x] No-safe-route behavior returns a bounded, actionable failure without leaking credentials.
- [x] Existing direct mode remains functional when explicitly selected.
- [x] Focused tests, full tests, type-check and build pass.
- [x] Task log records changed files, evidence, commit SHA, CI and next task S05.

## Initial route matrix

| Mode / condition | Expected egress and response | Existing evidence / gap |
|---|---|---|
| Direct mode, no active pools | Direct upstream request is allowed; normal response/error contract applies. | Existing direct/custom-upstream coverage; verify the final suite. |
| One selected HTTP forward proxy; CONNECT fails | No direct attempt; return bounded `502 upstream_unreachable` with selected-pool routing metadata. | Existing `does not bypass a failed HTTP forward proxy with direct egress` integration test. |
| Selected relay fails at transport; another configured eligible relay exists | Try only that configured alternative, once per pool; never direct. | Existing network-failure/fallback test covers one relay failure then another relay. |
| Every configured relay fails at transport | Return `502 upstream_unreachable`; no direct request. | New local integration test asserts bounded error, final relay metadata, no direct-upstream request, and redaction of URL/API-key markers; CI run 40628998383 passed. |
| Relay returns OpenCode `403 FreeTierError`; another configured relay exists | Try only configured relay alternatives. | Existing two-pool gate test. |
| All configured relays return `403 FreeTierError` | Preserve final `403` and upstream body; no direct attempt. | Existing two-pool gate test. |
| Active pools exist but all are cooling down | Return `429 rate_limit_exhausted` with `Retry-After`; do not silently choose direct. | New local integration test asserts 429, actionable error, positive `Retry-After`, and zero relay/direct-upstream attempts; CI run 40628998383 passed. |
| Pool list has no active entries | Treat as direct mode because no active route is configured. | Existing inactive-pool `buildTarget` unit test; explicit runtime behavior should remain documented. |

## Session report

**Status: Complete.** Initial audit found existing integration coverage for a failed HTTP CONNECT proxy, retry to an alternate configured relay, and exhausted relay `403 FreeTierError` responses. Added fully local regressions for (1) every configured relay failing at transport level and (2) every active relay being in cooldown. The transport-exhaustion test asserts `502 upstream_unreachable`, final selected-pool metadata, no request reaching the local direct-upstream endpoint, and redaction of route URL/API-key markers. The cooldown test asserts `429 rate_limit_exhausted`, positive `Retry-After`, and zero relay/direct-upstream attempts. Existing direct-mode integration path remains present. CI run `40628998383` passed type-check, all 163 tests (0 failures; 570 assertions), and build; generated guest bundles were already up to date. Final code/test commit: `2e807e7fc0f0b75a37546cc43f66e9cb60056a6b`. No production code changes were required. Next permitted task: S05, after this completion record is committed; do not start SHOULD work before S11.
