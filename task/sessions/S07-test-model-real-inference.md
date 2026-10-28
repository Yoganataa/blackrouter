# Session S07 — Test Model Must Perform Real Inference

**Status:** Not started  
**Scope source:** `goals.md` on `main`, `BR-SCOPE-1.2`  
**Related requirement:** FR-M4  
**Tracking log:** `task/PR-2-stabilize-validation.md`

## Objective

Prove that Test Model submits a real, short inference request through the configured executor and reports the actual result. Connectivity, configuration presence, or a successful TCP handshake alone must never count as inference success.

## Entry gate

- Inspect the current Test Model UI/action, gateway/executor path and tests.
- Record current PR head and CI.
- Determine what runtime credentials and provider access are available. Do not invent live evidence if they are not available.

## In scope

- Trace the Test Model action from UI to the same relevant request execution path used for actual inference.
- Ensure the probe is short, bounded by a timeout, and reports upstream status/error accurately without exposing credentials.
- Add deterministic tests that distinguish a real inference response from connectivity-only success, invalid credentials, no-such-model, rate limit and upstream failure as applicable.
- Perform a live short inference only if a suitable runtime and authorized credentials/access are available; record exact environment and observed result.

## Out of scope

- Adding a new provider or changing provider access policy.
- Treating a mock test as proof of live provider acceptance.
- Requiring a user-supplied API key for the default OpenCode Zen Free lane.

## Acceptance criteria

- [ ] Code path proves Test Model sends an inference request and validates a real response payload.
- [ ] Connectivity-only success is rejected by tests.
- [ ] Timeout and upstream/model/auth errors produce accurate, actionable, redacted outcomes.
- [ ] Live inference evidence is recorded if executable; otherwise the precise runtime/access blocker remains open.
- [ ] Type-check, focused tests, full tests and build pass, or exact gaps are recorded.
- [ ] Task log records files, evidence, commit SHA, CI and next task S08.

## Session report

Not started. Do not mark complete solely from unit tests if the live acceptance gate remains unavailable.
