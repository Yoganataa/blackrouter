# Session S32 — Release Acceptance Matrix: Endpoints, Streaming and Egress

**Status:** Not started  
**Scope source:** `goals.md` on `main`, `BR-SCOPE-1.2`  
**Dependencies:** S11 MUST gate and relevant S01–S10, S25–S30 results reviewed; S31 security/configuration findings dispositioned.  
**Tracking log:** `task/PR-2-stabilize-validation.md`

## Objective

Evaluate release-critical endpoint, protocol and egress scenarios against the current PR head using a repeatable acceptance matrix. Separate automated test evidence from actual OpenChamber/OpenCode runtime evidence.

## Entry gate

- Refresh scope, task log, active cards, PR head, workflow runs and generated bundle state.
- Confirm supported runtime access and the exact environment/configuration used; if unavailable, mark runtime rows BLOCKED rather than infer success.
- Confirm S11 status before any SHOULD feature acceptance is treated as release-critical completion.

## In scope

- Local gateway endpoint and configured base URL: `http://127.0.0.1:20128/v1` (and documented client-specific URL forms).
- Chat Completions-compatible requests with streaming SSE and non-streaming JSON responses.
- Model-specific OpenCode Zen Free paths/translations through the supported Chat/Responses/Messages request shapes where applicable.
- Default no-user-API-key OpenCode Zen Free path and optional custom OpenAI-compatible upstream with configured credentials.
- Direct, HTTP forward-proxy and relay egress paths; verify that failure does not silently bypass a selected proxy/relay and that retries/fallback remain bounded and eligible.
- First-byte/keepalive behavior, downstream cancellation, CONNECT timeout/socket cleanup, upstream errors/status/body propagation and retry bounds.
- Test Model short real inference when credentials/provider access and supported runtime are available.
- Record per row: preconditions, command/test, commit SHA, result PASS/FAIL/BLOCKED, observed output, and evidence link.

## Out of scope

- Claiming live inference from unit tests or a green CI run.
- Adding new provider adapters or changing scope to make a matrix row pass.
- Marking unsupported host/runtime checks as passed.

## Acceptance criteria

- [ ] Matrix covers endpoint formats, streaming/non-streaming, cancellation/timeouts, upstream failures, default/custom upstream and direct/proxy/relay paths.
- [ ] Each row has reproducible steps, environment assumptions and exact current-head commit/run identity.
- [ ] Runtime-only checks include actual observed results; unavailable runtime/provider access is explicitly BLOCKED with reason.
- [ ] Egress policy and bounded retry behavior are demonstrated for relevant negative cases.
- [ ] Current-head CI, type-check, tests, build and generated bundle synchronization are verified or explicitly blocked.
- [ ] Task log summarizes gaps and next permitted task without upgrading missing evidence to PASS.

## Session report

Not started. This matrix must not treat source inspection or unit tests as a substitute for required live host/provider acceptance.
