# Task: Stabilize PR #2 and Validate BlackRouter

**Repository:** `Yoganataa/blackrouter`  
**Working branch:** `feat/port-9router-rtk-upstream`  
**Pull request:** [#2 — feat: port native core and upstream free-tier fixes](https://github.com/Yoganataa/blackrouter/pull/2)  
**Latest source commit verified by CI:** `25d86f24ace65d5f74e12d6b028d47867e49eba9`  
**Latest CI-generated bundle commit:** `79d30d8` (service bundle synchronized)

## Status legend

- [x] Completed and verified from repository/CI evidence.
- [ ] Not completed.
- [/] In progress.
- [!] Blocked or needs a decision.

## Scope and constraints

Use `goals.md` as the project source of truth and follow `BR-SCOPE-1.0`: MUST before SHOULD; COULD only with approval. Preserve the core/provider-translator/OpenChamber-adapter/transport/response-stream boundaries. Default to loopback, redact credentials, and never silently bypass a selected proxy or relay with a direct connection. Do not claim a test/build/provider works without evidence.

## Execution priorities and test integrity

Work strictly one task at a time and report the result before moving to the next task. MVP stability takes precedence over new features and UI polish.

- Do not delete, skip, weaken, loosen assertions, or make tests pass by changing expectations to match broken behavior.
- Fix implementation defects when a regression test exposes a real defect. Correct test typing only when the type model is inaccurate; preserve the test's behavioral intent.
- Add/retain regression coverage for the native OpenCode path: required headers/fingerprints, request translation and endpoint selection, session affinity, real inference for Test Model, streaming and non-streaming responses, cancellation/timeouts, and actionable upstream failures.
- The primary acceptance path is OpenChamber/OpenCode -> loopback BlackRouter -> OpenCode Zen Free -> valid response. Verify with evidence; type-check passing alone does not prove OpenCode works.
- Verify direct, HTTP proxy, and relay behavior separately. A selected proxy/relay must never silently fall back to direct egress.
- Keep new feature work out of the MVP until all MUST requirements in `goals.md` / `BR-SCOPE-1.0` pass.

## Progress checklist

### Audit
- [x] Locate PR #2 and its working branch.
- [x] Inspect the failing GitHub Actions run and identify the first failing gate.
- [x] Record the TypeScript errors emitted by `bun run type-check`.
- [x] Confirm unit tests and build were skipped by CI after type-check failed.

### Fix and verify
- [x] Apply the Node Web ReadableStream type assertion in `service/upstream.ts` around line 791; verified by CI type-check.
- [x] Add targeted `@ts-ignore` annotations only to imports of upstream JavaScript modules that intentionally have no declarations; verified by CI type-check.
- [x] Add explicit structural types for the fingerprint fixture and an explicit runtime failure if the required shell fingerprint is absent; verified by CI type-check.
- [x] Run `bun run type-check` and confirm it passes (run `40349762310`).
- [x] Run `bun test` and resolve all failures without weakening assertions: 146 passed, 0 failed (run `40349762310`).
- [x] Run `bun run build`; CI regenerated and committed `service/main.js` (`9339826f` prefix).
- [ ] Review relevant tests for direct transport, HTTP proxy, relay selection, API routing, and streaming behavior.
- [x] Verify both listeners bind to `127.0.0.1` by code inspection (`service/main.ts`, `service/router-server.ts`).
- [x] Redact proxy URL userinfo and sensitive query values in panel state; preserve stored credentials when the panel posts an unchanged redacted pool URL. Unit tests and CI verify this behavior.
- [x] Add common credential redaction to local service errors/log output, gateway error responses, runtime model/router diagnostics, and persisted request-history pool/fallback labels; regression-tested in CI.
- [x] Audit deployment relay templates and connectivity-test errors: generated Cloudflare, Deno, and Netlify relay handlers now return generic transport errors rather than raw exception messages; proxy/relay connectivity-test diagnostics pass through common redaction.
- [ ] Review unusual credential formats and remaining non-user-facing logs for secrets not covered by common redaction.
- [ ] Verify that selecting a proxy/relay never silently falls back to a direct upstream connection.
- [ ] Check every MUST requirement in `goals.md` / `BR-SCOPE-1.0` against code or test evidence.
- [x] Recheck CI after the credential-redaction fix; run `40377741429` passed on source commit `e61f195394ccd34d7783126862309b26af258189`.

## Known CI failures (last observed run)

GitHub Actions run: `40325271651`; failing job: `121580233509`; workflow: `verify-and-bundle`.

- [x] `service/upstream.ts(791,56)`: Node Web ReadableStream type mismatch fixed and verified by CI.
- [x] `service/zen.test.ts(6,8)`: upstream JS module declaration issue fixed with a targeted annotation.
- [x] `service/zen.test.ts(7,36)`: upstream JS module declaration issue fixed with a targeted annotation.
- [x] `service/zen.test.ts(31,50)`: fixture has explicit structural typing.
- [x] `service/zen.test.ts(33,12)` and `(34,12)`: explicit runtime assertion for the required shell fingerprint.
- [x] `service/zen.test.ts(41,17)` and `(42,17)`: Messages system fixture type corrected.
- [x] `service/zen.test.ts(274,58)` and `(291,58)`: upstream JS module declaration issue fixed with targeted annotations.

## Latest session checkpoint (2026-10-26)

**Phase:** CI-backed egress-policy regression coverage — implemented and validated. MVP host-level acceptance remains incomplete.

- [x] Type-check passes on the previous validated source commit.
- [x] Unit tests pass: **147 passed, 0 failed across 15 files** on commit `32379478efc085b3330176494a740e5f2ed85b87`.
- [x] Added an integration regression test for OpenCode's `403 FreeTierError` when both configured relay pools are rejected. The test asserts BlackRouter returns the final upstream 403/body and only attempts the two configured relay pools; it must not escape through direct egress.
- [x] CI build passed and confirmed shipped bundles were already synchronized; no bundle change was required for this test-only commit.
- [x] Inspected generated `service/main.js`; it includes the previously added fingerprint normalization helper.
- [ ] Verify OpenChamber host load and the primary OpenCode Zen Free inference path with an actual valid response.
- [ ] Verify direct, HTTP proxy, and relay paths separately in a running environment.
- [ ] Verify streaming/non-streaming, cancellation/timeouts, Test Model, loopback default, and credential redaction.
- [ ] Check all MUST requirements in `goals.md` / `BR-SCOPE-1.0` against implementation and evidence.

**CI evidence:** [Run 40358099361](https://github.com/Yoganataa/blackrouter/actions/runs/40358099361) completed successfully. Type-check and build passed; unit tests report **147 pass / 0 fail**. The new integration case is in `service/model-fallback.integration.test.ts` and specifically covers a configured OpenCode relay route where both pools return `403 FreeTierError`.

**Previous source/build evidence:** [Run 40349762310](https://github.com/Yoganataa/blackrouter/actions/runs/40349762310) passed type-check, 146 tests, and bundle build. Build-generated `service/main.js` commit is `93398269be734273ceec1f21ed9c510251606906`.

**Latest code change:** `32379478efc085b3330176494a740e5f2ed85b87` adds the egress-policy regression test. It does not weaken existing assertions and does not change runtime source.

## Latest session checkpoint (2026-10-27)

**Phase:** Initial transport lifecycle audit — one pre-transport disconnect race fixed; complete lifecycle validation remains open.

- [x] Audited `proxyChatCompletion()` attempt construction and transport selection: when active proxy pools are configured, attempts are built from those pools; a failed pool can advance to another configured pool but does not append a direct route. Existing regression test asserts rejected relay pools do not bypass to direct egress.
- [x] Fixed a disconnect race in `service/upstream.ts`: after `await modelAwareBody(...)`, `sendAttempt()` now checks `response.destroyed` / `response.writableEnded` before building or starting upstream transport. The error path also avoids writing a preparation error after the client has disconnected.
- [x] CI run [40427793326](https://github.com/Yoganataa/blackrouter/actions/runs/40427793326) passed type-check, 153 tests, and build for the transport guard.
- [x] Latest branch CI run [40427922793](https://github.com/Yoganataa/blackrouter/actions/runs/40427922793) passed type-check, **153 tests / 0 failures across 15 files**, and build. Bundle synchronization produced commit `79d30d8`.
- [!] A proposed cancellation integration test timed out before reaching its assertion; it was removed rather than weakening or retaining a hanging test. Do not claim cancellation propagation is verified based on that experiment.
- [ ] Review/fix timeout and cancellation behavior in `TunnelAgent.createConnection()`; CONNECT request currently lacks an explicit timeout in the inspected implementation.
- [ ] Add a reliable cancellation/timeout integration test that exercises a real local upstream and proves request/response sockets close.
- [ ] Validate HTTP proxy and relay transport failures separately; confirm no direct egress fallback under any selected-pool failure.
- [ ] Validate live OpenChamber host loading and a real OpenCode Zen Free inference response.
- [ ] Check every MUST in `goals.md` / `BR-SCOPE-1.0` against evidence.

**Changed files:** `service/upstream.ts` (disconnect guard); task log. The temporary cancellation test fixture was removed after timing out; no cancellation test result is claimed.

**Next action:** fix explicit CONNECT timeout/cleanup in `TunnelAgent` and add deterministic tests for tunnel timeout and cancellation. Keep live provider acceptance unchecked until a valid runtime inference response is observed.
## Session handoff

**Current state:** Latest CI run `40427922793` passed type-check, 153 tests, and build. Panel state, gateway/local errors, runtime diagnostics, request-history labels, and relay/proxy connectivity diagnostics redact common credential-bearing fragments; generated relay handlers avoid returning raw exception messages. The transport audit found and fixed a disconnect-before-egress race. CONNECT timeout handling and deterministic cancellation acceptance remain open. MVP host-level/live provider acceptance remains incomplete.

**Next action:** Fix explicit CONNECT timeout/cleanup in `TunnelAgent` and add deterministic tests for tunnel timeout and cancellation; then verify failed relay/proxy routes and live OpenCode Zen Free inference. The repository CI does not by itself prove the upstream provider currently responds or that the extension loads in the host application.

**Update protocol:** After each work session, update this file with actual status, changed files/commit SHA, commands or CI evidence, remaining blockers, and the next concrete action. Only check an item after verifying it.


## Latest session checkpoint (2026-10-27, CONNECT timeout investigation)

**Phase:** CONNECT timeout/cancellation investigation — blocked; unverified changes reverted to the last CI-validated transport baseline.

- [x] Confirmed the previously validated baseline at `25d86f24ace65d5f74e12d6b028d47867e49eba9` has CI evidence from run [40427922793](https://github.com/Yoganataa/blackrouter/actions/runs/40427922793): type-check, 153 tests, and build passed.
- [x] Attempted an explicit CONNECT handshake timeout and a local stalled-proxy integration test.
- [!] The new test consistently observed that the proxy-side socket did not close after the timeout; multiple implementation/test variations did not resolve this. Type-check passed on the latest attempt, but the unit-test gate failed, so this is not accepted as complete.
- [x] Reverted the unverified changes in `service/upstream.ts` and `service/upstream.test.ts` to the validated baseline rather than leaving the PR with a failing CI state.
- [ ] Investigate CONNECT lifecycle with a reproducible lower-level socket test and establish why the pending proxy socket remains open before reattempting the timeout fix.
- [ ] Add deterministic cancellation/timeout acceptance only after the socket lifecycle behavior is demonstrated.
- [ ] Continue with HTTP proxy/relay failure separation, live OpenChamber loading and OpenCode Zen Free inference, then audit all MUST requirements.

**Session changes:** experimental commits were created for CONNECT timeout handling and tests, but their final unverified source/test changes were reverted in follow-up commits. Do not claim CONNECT timeout or cancellation is verified.

**Next action:** keep the last passing baseline intact; isolate and reproduce the pending CONNECT socket lifecycle in a minimal test before changing production transport code again.


## Latest session checkpoint (2026-10-27, relay transport failure fallback)

**Phase:** Prevent retries through a relay that already failed at the transport layer.

- [x] Inspected model/pool attempt ordering in `service/upstream.ts`; found `handleTransportError` advanced to the next attempt without adding the current configured pool to `failedPoolIds`. With multiple model candidates, a relay that dropped a connection could therefore be revisited later in the same request.
- [x] Updated `handleTransportError` to mark the current configured pool failed before advancing. The existing bounded attempt list and configured-pool-only egress policy remain unchanged.
- [x] Added an integration regression in `service/model-fallback.integration.test.ts`: relay A drops the transport, relay B returns 503 for the primary model, and the fallback model must succeed through relay B without another relay-A attempt.
- [x] CI passed for source/test commit `a188f59262d9e9c5d1b554cdeec486d32d406613`, run [40430932430](https://github.com/Yoganataa/blackrouter/actions/runs/40430932430): type-check passed, **154 tests passed / 0 failed**, build passed, generated guest bundles synchronized. The workflow subsequently advanced branch head to bundle commit `a8067525904aeb63a0916c70db520480eca10012`.
- [x] Kept the earlier CONNECT timeout experiment reverted. CONNECT timeout and cancellation remain unverified; this phase does not claim to resolve them.
- [x] Added a separate HTTP forward-proxy CONNECT failure regression; CI verifies the selected proxy failure returns 502 and only the configured proxy CONNECT is attempted (no direct retry in the attempt trace).
- [ ] Verify the live OpenChamber extension loads and complete a real OpenCode Zen Free inference request; CI alone is not runtime acceptance.
- [ ] Audit every FR-M1–FR-M8 MUST item against `goals.md` and `BR-SCOPE-1.0`.

**Next action:** add/verify an HTTP forward-proxy failure test that demonstrates a selected proxy failure cannot trigger a direct request, then move to host-level OpenChamber and live inference acceptance.


## Latest session checkpoint (2026-10-27, HTTP forward-proxy failure)

**Phase:** HTTP forward-proxy CONNECT failure / no direct-egress retry regression — implemented and CI-validated.

- [x] Added `/http-proxy-failure-test` to `service/model-fallback.integration.test.ts`, configuring a single selected `type: 'http'` forward proxy against a local test listener and an OpenCode HTTPS upstream.
- [x] The local proxy deliberately answers CONNECT with HTTP 502. The test asserts the router returns 502 with `upstream_unreachable`, reports `HTTP Forward Proxy` as the resolved pool, and records exactly one CONNECT attempt to `opencode.ai:443`. This guards against silently switching to direct egress after the selected proxy fails.
- [x] CI run [40432289509](https://github.com/Yoganataa/blackrouter/actions/runs/40432289509) passed on test commit `4620c54e60970df08e1e85d1e2b6bb2e1ffbf935`: type-check passed, **155 tests passed / 0 failed**, build passed.
- [x] No production transport behavior was changed in this phase; only integration coverage and this task log changed.
- [ ] Investigate CONNECT timeout/cancellation separately; prior experimental changes failed socket-closure assertions and remain reverted.
- [ ] Verify live OpenChamber extension loading and a real OpenCode Zen Free inference response.
- [ ] Audit every FR-M1–FR-M8 MUST item against `goals.md` and `BR-SCOPE-1.0`.

**Next action:** proceed to the next single acceptance task: determine whether the OpenChamber host/runtime is available for a live extension-load and Zen Free inference check. Do not mark it complete based on CI alone.


## Latest session checkpoint (2026-10-27, host-runtime availability check)

**Phase:** Determine whether this execution environment can perform live OpenChamber/OpenCode acceptance.

- [x] Checked the available working directory: only the uploaded `/mnt/data/goals.md` is present; there is no checked-out BlackRouter repository or OpenChamber project/runtime here.
- [x] Checked executable availability: `bun`, `opencode`, and `openchamber` are not installed/available in this environment.
- [!] Live host loading and a real OpenCode Zen Free inference request cannot be honestly verified from this environment. Existing CI evidence covers type-check, automated tests, and bundle build only; it does not prove host loading or a successful live provider response.
- [ ] Keep host-level acceptance unchecked until it can be run in an environment with OpenChamber and OpenCode available.
- [ ] Continue with the next repository-verifiable task: audit each FR-M1–FR-M8 MUST against source/tests and record evidence and gaps, without treating static inspection as runtime proof.

**Session changes:** task log only; no source changes and no new test claims.

**Next action:** audit the MUST checklist against the current PR branch. Separately, live acceptance will require a host environment with OpenChamber/OpenCode and network/provider access; if unavailable to the agent, request only the specific command output needed from the user after repository-verifiable work is exhausted.


## Latest session checkpoint (2026-10-27, FR-M1–FR-M8 evidence audit)

**Phase:** Source/test evidence mapping against the frozen `BR-SCOPE-1.0` MUST requirements. This is a static repository audit, not a runtime acceptance run.

| Requirement | Evidence found on PR branch | Audit status |
|---|---|---|
| FR-M1 — OpenChamber integration and loopback gateway | `package.json` declares OpenChamber API v1 service/panel/status contributions; `service/main.ts` and `service/router-server.ts` bind listeners to `127.0.0.1`; README documents the default router endpoint. | **Partially verified:** code/config supports the requirement; actual extension load and runtime binding are not verified here. |
| FR-M2 — OpenAI-compatible catalog, chat, streaming/non-streaming, native endpoint routing | `service/upstream.test.ts` checks model catalog and Chat/Responses/Messages URL selection; `service/opencode-protocol.test.ts` covers Responses/Messages SSE conversion; `service/sse.test.ts` covers folded stream aggregation; integration tests exercise upstream failure paths. | **Automated coverage present:** full live API contract and non-streaming acceptance still need host/runtime verification. |
| FR-M3 — Default no-user-API-key OpenCode Zen Free lane | `service/config.ts` defaults upstream to OpenCode Zen; `service/upstream.ts` omits provider authorization for OpenCode and supports optional key for custom upstream; unit tests cover custom Bearer auth. | **Code/test evidence present:** successful live no-key inference remains unverified. |
| FR-M4 — Native OpenCode headers, fingerprints, session affinity, translations, real Test Model inference | `service/zen.test.ts` checks CLI headers, fingerprinting and session translation; `service/upstream.test.ts` checks endpoint selection; runtime Test Model path prepares and sends an upstream request. | **Partially verified:** translator/header/fingerprint behavior has unit coverage; Test Model's real provider response and a valid Zen Free answer have not been observed in a live run. |
| FR-M5 — Direct/HTTP proxy/relay policy without silent direct bypass | `service/model-fallback.integration.test.ts` checks configured relay rejection, transport failure fallback and HTTP CONNECT 502; `service/upstream.test.ts` checks target selection for direct, HTTP and relay paths. | **Partial automated evidence:** tested failure cases reject direct bypass in the tested scenarios; not exhaustive for all relay providers/configurations or live networks. |
| FR-M6 — Streaming, keepalive, cancellation, timeouts, error propagation, bounded fallback | `service/upstream.test.ts` covers SSE first-byte keepalive; `service/opencode-protocol.test.ts`/ `service/sse.test.ts` cover stream transforms; integration tests cover status/body propagation and bounded model/pool attempts. | **Open MUST gap:** deterministic socket-close/cancellation and CONNECT timeout behavior are not verified. The prior CONNECT timeout experiment failed socket-closure assertions and was reverted. |
| FR-M7 — Loopback, credential redaction, no committed secrets | Loopback binding is visible in both listener sources; `service/config.test.ts` covers panel URL redaction and diagnostic secret patterns; `service/deployers.test.ts` covers redacted connectivity diagnostics and generic relay failure messages. | **Partial:** implemented paths have regression tests; a comprehensive audit of every log/credential format and all runtime settings is still outstanding. |
| FR-M8 — Type-check, tests, build, generated bundles and host smoke tests | CI run [40432289509](https://github.com/Yoganataa/blackrouter/actions/runs/40432289509) passed type-check, 155 tests, and build. | **Partial:** CI quality gates are green for that run; host-level OpenChamber and direct/proxy/relay smoke tests remain outstanding. |

**Audit conclusion:** the PR has meaningful source-level and CI-backed coverage, but FR-M1, FR-M3, FR-M4, FR-M6, FR-M7 and FR-M8 still have runtime or breadth gaps. FR-M6 is the clearest unresolved implementation/acceptance risk because CONNECT timeout and cancellation/socket cleanup are not demonstrated. Do not mark the MUST baseline complete and do not begin SHOULD work (including RTK token-savings expansion) until these gaps are closed or explicitly dispositioned within the frozen scope.

**Session changes:** task log only; no source changes and no tests rerun in this static-audit phase.

**Next action:** investigate the remaining FR-M6 gap with a minimal lower-level CONNECT socket-lifecycle reproduction, keeping the production transport baseline unchanged until the reproduction reliably demonstrates the failure and a fix can be regression-tested.


## Latest session checkpoint (2026-10-27, stalled CONNECT socket lifecycle reproduction)

**Phase:** Investigate FR-M6 pending CONNECT cancellation without weakening acceptance criteria.

- [x] Added a local HTTP proxy fixture that accepts CONNECT and deliberately never responds; the test waits for the proxy-side socket to close after destroying the tunnel agent and upstream request.
- [x] The reproduction is deterministic in CI: the socket-close assertion timed out after 1 second. Type-check passed; the run reached 155 passing tests and 1 failing lifecycle test. This is evidence of the unresolved socket lifecycle, not a passing acceptance result.
- [x] Tried tracking pending CONNECT requests and sockets, explicitly destroying the CONNECT request/socket, and retaining the request until CONNECT completion. The proxy-side socket assertion still failed.
- [x] Reverted the unverified production transport changes and temporary lifecycle test to the last CI-validated baseline. The failing experimental code is not left on the branch.
- [!] Root cause remains unresolved. The current evidence does not establish whether the problem is request/socket ownership, the proxy fixture's socket observation, or another Node HTTP CONNECT lifecycle behavior. Do not claim timeout/cancellation fixed.
- [ ] Next: create a minimal raw TCP/HTTP CONNECT diagnostic that records client-side socket assignment, server-side socket close/end, and request/agent lifecycle events separately. Establish which exact socket remains open before changing production code again.

**Changes in this phase:** experimental source/test changes were reverted. Task log only is retained as the session checkpoint; the validated transport implementation remains unchanged.

**Evidence:** failed diagnostic run [40436208858](https://github.com/Yoganataa/blackrouter/actions/runs/40436208858). Earlier validated baseline run [40432289509](https://github.com/Yoganataa/blackrouter/actions/runs/40432289509) remains the last known passing CI run for the restored implementation; a fresh CI run is expected after the reverts.

**Next action:** isolate raw TCP socket events and ownership; do not begin SHOULD work or mark FR-M6 complete until a regression test proves socket cleanup.


## Latest session checkpoint (2026-10-27, restored baseline and CONNECT ownership review)

**Phase:** Confirm the reverted baseline and narrow the next CONNECT diagnostic.

- [x] Confirmed the test-file revert CI run [40436277855](https://github.com/Yoganataa/blackrouter/actions/runs/40436277855) completed successfully. The adjacent source-only revert run [40436272762](https://github.com/Yoganataa/blackrouter/actions/runs/40436272762) failed because it ran before the temporary failing test was reverted; do not interpret that intermediate run as validation of the final restored tree.
- [x] Re-inspected the restored `TunnelAgent.createConnection()`: it creates a separate `http.ClientRequest`/ `https.ClientRequest` for CONNECT, but does not retain the request on the agent. It returns `null` as the asynchronous connection placeholder, and the CONNECT request owns the proxy-side connection until the handshake completes.
- [!] This is a concrete lifecycle ownership concern, not yet a proven root cause. Agent destruction alone may not cancel that independently-created pending request; however, prior experiments did not establish that destroying the request reliably closes the observed server socket. Do not change production code based only on this inspection.
- [ ] Next: add a narrowly scoped raw TCP/HTTP CONNECT diagnostic that records (1) proxy server socket `connection`/ `end`/ `close`, (2) CONNECT request `socket`/ `close`/ `error`, and (3) agent/upstream request destruction independently. Use the trace to distinguish request cancellation from agent destruction before proposing a fix.
- [ ] FR-M6 remains open: no passing deterministic CONNECT timeout/cancellation test and no live OpenCode acceptance yet.

**Session changes:** task log only; no runtime code or behavioral tests changed in this phase.

**Evidence:** restored-test CI run [40436277855](https://github.com/Yoganataa/blackrouter/actions/runs/40436277855) succeeded. The previous failing diagnostic remains [40436208858](https://github.com/Yoganataa/blackrouter/actions/runs/40436208858); it is retained as evidence of the failed experiment, not acceptance.

**Next action:** run the isolated socket-event diagnostic. Keep MUST-first scope and do not start RTK/SHOULD expansion.

## Latest session checkpoint (2026-10-27, CONNECT socket ownership reproduced)

**Phase:** Isolated the pending CONNECT socket ownership behavior without modifying production code.

- [x] Ran a raw Node HTTP CONNECT diagnostic: destroying the standalone CONNECT `ClientRequest` closed the client-side socket and emitted `end` at the proxy-side socket; the proxy-side `close` event was not a reliable assertion because TCP can half-close.
- [x] Ran a second reproduction using the same essential shape as `TunnelAgent`: an HTTPS target request uses a custom `https.Agent`, whose `createConnection()` creates a separate CONNECT `ClientRequest` and returns the asynchronous `null` placeholder.
- [x] Confirmed that destroying only the HTTPS target request did **not** close the pending CONNECT socket within the observation window. Destroying the custom tunnel agent did close it and produced CONNECT request `ECONNRESET`/close events. This narrows the issue to ownership/cleanup of the separately-created CONNECT request, rather than proving the prior proxy-side close assertion itself was sound.
- [x] Kept the repository production implementation unchanged in this diagnostic phase; no test criteria were weakened and no experimental changes were committed.
- [ ] Next task: make `TunnelAgent` retain and cancel pending CONNECT requests/sockets when the agent is destroyed, and add an explicit CONNECT handshake timeout. The regression should assert client-side socket/request closure and bounded completion, not require the remote server to emit `close` immediately after a TCP half-close.
- [ ] Verify timeout and downstream cancellation separately in CI before marking FR-M6 complete.

**Diagnostic method:** local Node v22.16.0 scripts using a loopback HTTP proxy that accepts CONNECT but does not answer. The scripts were run in `/tmp` and are not repository files.

**Next action:** implement a narrowly scoped `TunnelAgent` lifecycle fix and deterministic regression tests. If the test fails, retain the failure as evidence and revert unverified production changes rather than relaxing assertions.


## Latest session checkpoint (2026-10-27, raw CONNECT socket trace)

**Phase:** Isolate CONNECT socket ownership before another production change.

- [x] Added a temporary CI-only diagnostic test using the production `createTunnelAgent()`, a local HTTP server that accepts CONNECT but does not respond, and event/state capture around upstream-request destruction and agent destruction.
- [x] CI type-check, all tests, and bundle build passed with the diagnostic test present: run [40443636387](https://github.com/Yoganataa/blackrouter/actions/runs/40443636387).
- [x] Captured trace: `["proxy:connect","before-destroy:proxySocket=true:destroyed=false","upstream-request:destroy-called","agent:destroy-called","after-destroy:proxySocketDestroyed=false:writable=true:readable=true"]`.
- [x] This confirms the proxy accepted CONNECT and the server-side socket remained open and both readable/writable 250 ms after the outer HTTPS request and its agent were destroyed. No outer upstream `request:socket-assigned` event was observed, consistent with the asynchronous tunnel not completing and not being attached as an ordinary upstream socket.
- [!] The trace narrows the failure to the pending CONNECT path but does not yet prove the exact event ordering or which client-side socket object owns the open TCP connection. The diagnostic did not yet log the internal CONNECT ClientRequest's `socket`/ `close` events.
- [ ] Remove the temporary diagnostic file after retaining this evidence in the task log.
- [ ] Next: add targeted instrumentation for the internal CONNECT ClientRequest socket and test destruction ordering (agent first versus outer request first). Only then implement cancellation/timeout cleanup and retain a deterministic regression test.

**Scope and safety:** no production transport changes in this phase; the diagnostic is temporary and must not be left in the branch. FR-M6 remains open; this is not a fix or runtime acceptance.

**Evidence:** [CI run 40443636387](https://github.com/Yoganataa/blackrouter/actions/runs/40443636387), including the `CONNECT_LIFECYCLE_DIAGNOSTIC` trace in the Unit tests step.
