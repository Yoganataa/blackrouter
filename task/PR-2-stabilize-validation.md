# Task: Stabilize PR #2 and Validate BlackRouter

**Repository:** `Yoganataa/blackrouter`  
**Working branch:** `feat/port-9router-rtk-upstream`  
**Pull request:** [#2 — feat: port native core and upstream free-tier fixes](https://github.com/Yoganataa/blackrouter/pull/2)  
**Branch HEAD before S01 session:** `0df85356420a0afd660502ab8a5bdda2c166263e`. See the S01 session record below for repository refs and the documentation commit.  
**Latest relevant code CI:** [run 40443707710](https://github.com/Yoganataa/blackrouter/actions/runs/40443707710), run #170, passed Type check, Unit tests, and Build OpenChamber bundles on `78f3858beab993aa7e46ec2ff18a9cd29e9040cb`. Comparison to the pre-session branch HEAD shows only task-documentation changes since that code commit; no current-head workflow was triggered for the docs-only delta. This is not live OpenChamber/provider acceptance.  
**Latest known bundle-sync commit:** `79d30d8` (service bundle synchronized in earlier CI run; the latest removal was diagnostic-test-only).

## Sessionized execution protocol

The roadmap is decomposed into single-session tasks in [`task/SESSION-PLAN.md`](SESSION-PLAN.md). S01's diagnostic acceptance criteria are now recorded as complete; the next eligible task is [`S02 — CONNECT cleanup and timeout fix`](sessions/S02-connect-cleanup-timeout-fix.md). One task ID equals one work session, so S02 was not implemented in the S01 session. The session plan is an execution index; `goals.md` on `main` remains the scope source of truth.

## Status legend

- [x] Completed and verified from repository/CI evidence.
- [ ] Not completed.
- [/] In progress.
- [!] Blocked or needs a decision.

## Scope and constraints

Use [`goals.md` on `main`](https://github.com/Yoganataa/blackrouter/blob/main/goals.md) as the project source of truth and follow current scope `BR-SCOPE-1.2` (baseline 2026-10-27): MUST before SHOULD. The approved additive targets are CodeBuddy CN, WorkBuddy/Tencent TokenHub, and Freebuff under `BR-CHANGE-2026-10-27-PROVIDERS`; they remain blocked until FR-M1–FR-M8 acceptance gates pass and each provider's own terms/auth/security/runtime gates are met. OmniRoute is a research/comparison reference only, not an implementation dependency. Preserve the core/provider-translator/OpenChamber-adapter/transport/response-stream boundaries. Default to loopback, redact credentials, never silently bypass a selected proxy/relay with direct egress, and do not claim a test/build/provider works without evidence. Historical checkpoints below may refer to BR-SCOPE-1.0 as the scope active at that time; current decisions are governed by BR-SCOPE-1.2.

## Execution priorities and test integrity

Work strictly one task at a time and report the result before moving to the next task. MVP stability takes precedence over new features and UI polish.

- Do not delete, skip, weaken, loosen assertions, or make tests pass by changing expectations to match broken behavior.
- Fix implementation defects when a regression test exposes a real defect. Correct test typing only when the type model is inaccurate; preserve the test's behavioral intent.
- Add/retain regression coverage for the native OpenCode path: required headers/fingerprints, request translation and endpoint selection, session affinity, real inference for Test Model, streaming and non-streaming responses, cancellation/timeouts, and actionable upstream failures.
- The primary acceptance path is OpenChamber/OpenCode -> loopback BlackRouter -> OpenCode Zen Free -> valid response. Verify with evidence; type-check passing alone does not prove OpenCode works.
- Verify direct, HTTP proxy, and relay behavior separately. A selected proxy/relay must never silently fall back to direct egress.
- Keep new feature work out of the MVP until all MUST requirements in `goals.md` / `BR-SCOPE-1.2` pass.

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


## Latest session checkpoint (2026-10-27, aligned with goals.md BR-SCOPE-1.2)

**Phase:** Keep PR #2 stabilization as the active task under the updated project scope.

- [x] Read the current `main/goals.md` snapshot dated 2026-10-27; current scope is `BR-SCOPE-1.2`.
- [x] Record the approved additive provider targets: CodeBuddy CN, WorkBuddy/Tencent TokenHub, and Freebuff under `BR-CHANGE-2026-10-27-PROVIDERS`. These are not yet approved for implementation ahead of the MUST baseline; each requires its own documentation, terms, auth/security, tests, and runtime acceptance.
- [x] Record OmniRoute as a comparative research source only; it does not replace 9router as the primary behavior reference and does not authorize wholesale feature import.
- [x] Removed the temporary CONNECT lifecycle diagnostic test after preserving its observed trace in the checkpoint above. Post-removal CI run [40443707710](https://github.com/Yoganataa/blackrouter/actions/runs/40443707710) completed successfully.
- [x] Checked the current PR head: `78f3858beab993aa7e46ec2ff18a9cd29e9040cb`. The PR remains open and unmerged.
- [!] FR-M6 remains open. Existing diagnostic evidence showed the proxy-side socket still open 250 ms after the outer request and agent were destroyed; internal CONNECT ClientRequest socket/close/error events have not yet been captured. No accepted production fix exists.
- [ ] Next: add targeted instrumentation for the internal CONNECT ClientRequest's socket/close/error events and compare agent-first vs. outer-request-first destruction order. Keep instrumentation temporary and remove it after recording the trace.
- [ ] Only after ownership/event ordering is established, implement a narrow timeout/cancellation cleanup fix and deterministic regression tests. Assert client-side request/socket closure and bounded completion; do not rely on immediate remote server-side TCP `close` after half-close.
- [ ] Re-run type-check, all tests, build and generated-bundle inspection on the resulting current head.
- [ ] Keep live OpenChamber extension loading, real OpenCode Zen Free inference, and direct/HTTP-proxy/relay smoke tests unchecked until performed in a suitable runtime.
- [ ] Re-audit FR-M1–FR-M8. Do not start FR-S4 provider implementation or mark Phase 1 complete until MUST gaps and required acceptance evidence are resolved.

**Validation boundary:** run 40443707710 confirms CI after removal of the temporary diagnostic test. It does not prove CONNECT cancellation/timeout is fixed, nor does it prove live host/provider behavior.

**Next action:** instrument the internal CONNECT request lifecycle as the single next task. Preserve the validated production baseline until a reproducible trace justifies a narrowly scoped change.


## Session-plan structure update (2026-10-27)

- [x] Added [`task/SESSION-PLAN.md`](SESSION-PLAN.md) to map the frozen roadmap into single-session task IDs S01–S30, ordered by MUST/SHOULD gates.
- [x] Added [`S01 — CONNECT ClientRequest lifecycle`](sessions/S01-connect-clientrequest-lifecycle.md) with objective, scope boundaries, acceptance criteria and report template.
- [x] Clarified that this documentation-only update does not change runtime code or validation status. The latest code CI remains run 40443707710; the new documentation commits have not been represented as a code-validation run.
- [ ] Execute S01 as the next focused work session; no task is marked complete in advance.


## Sessionized token-saver scope update (2026-10-27)

- [x] Updated `main/goals.md` to scope `BR-SCOPE-1.2` under change record `BR-CHANGE-2026-10-27-LINEAR-TOKEN-SAVER`.
- [x] Defined the token-saver as one ordered combo: **9router-go token-saver behavior → RTK → Caveman → I Have ADHD**, with one top-level enable/disable control.
- [x] Promoted the four-stage combo into FR-S2 (SHOULD), while keeping standalone Caveman and standalone I Have ADHD profiles out of scope.
- [x] Updated `task/SESSION-PLAN.md` to split source audit, each stage, and end-to-end validation into separate sessions S19–S24; later task IDs shifted to S25–S33.
- [ ] Do not begin implementation until Phase A MUST gates pass. Each stage requires source/provenance review and regression tests; final acceptance requires repeatable output-quality and token-count measurements.
- [ ] The scope/documentation change does not constitute implementation or test evidence for the combo.


## Detailed task-card generation — batch 1 (2026-10-27)

**Purpose:** prepare the next Phase A cards without starting future tasks or changing implementation status.

- [x] Created `task/sessions/S02-connect-cleanup-timeout-fix.md` — commit `ed8d76dc36e4c59192b450edd867bba5baede652`.
- [x] Created `task/sessions/S03-downstream-cancellation.md` — commit `9447029b93a94b4b267dec17b3b5f162391df553`.
- [x] Created `task/sessions/S04-egress-policy-audit.md` — commit `27abb63a974d61fbc92890adf81b3609c1464650`.
- [x] Created `task/sessions/S05-response-stream-contract-audit.md` — commit `759a7e07c855ec83e5e10d008889096a9df08924`.
- [x] Updated `task/SESSION-PLAN.md` to index these cards while preserving S01 as the active task.
- [!] No code changes, tests, or runtime validations were performed in this documentation-only batch. The latest referenced code CI remains [40443707710](https://github.com/Yoganataa/blackrouter/actions/runs/40443707710), which predates these documentation commits and is not validation of the current documentation head.
- [ ] S01 remains the only active task. S02 is dependent on S01 evidence; S03–S05 remain not started. Do not execute them out of order.

**Next task:** continue S01 diagnostic work. Generate the next card batch after this batch is reviewed or as the user requests.


## Detailed task-card generation — batch 2 (2026-10-27)

**Purpose:** prepare S06–S10 with explicit MUST acceptance gates, without starting these tasks or changing the active task.

- [x] Created `task/sessions/S06-opencode-native-behavior-audit.md` — commit `235fdb2d92be3a2ea8d3dfd971e376a4ba0b0f60`.
- [x] Created `task/sessions/S07-test-model-real-inference.md` — commit `4297fdf43d089e87d9abd091159e933567bb3344`.
- [x] Created `task/sessions/S08-security-secret-handling-audit.md` — commit `edef74b20fe3f93877d894888c3a7d37720bb30d`.
- [x] Created `task/sessions/S09-reproducible-ci-bundle-gate.md` — commit `4c1bc7bfec5e302fae0a1cd35dc220015d48b7ba`.
- [x] Created `task/sessions/S10-openchamber-opencode-runtime-acceptance.md` — commit `4b30c449ecaf9a0b965152de8fb4152894ba88d7`.
- [x] Updated `task/SESSION-PLAN.md` to index S06–S10.
- [!] This batch is documentation-only. No application code, tests, generated bundles, or runtime behavior changed. CI was not run for this documentation batch.
- [!] S01 remains the only active task; S02–S10 are prepared/not started according to their dependencies. S10 cannot be marked passed without actual supported-host and real inference evidence.
- [ ] Next implementation work remains S01: capture internal CONNECT ClientRequest socket/connect/timeout/error/close lifecycle and compare destruction order. Do not jump to S06 or S07 before earlier tasks and MUST gates are addressed.

**Latest known code CI:** [run 40443707710](https://github.com/Yoganataa/blackrouter/actions/runs/40443707710), successful on its recorded code commit before these documentation-only changes. It is not a current-head validation and does not prove live runtime acceptance.


## Detailed task-card generation — batch 3 (2026-10-27)

**Purpose:** prepare S11–S15 with explicit dependency and MUST-first gates. This batch does not start any task or authorize provider implementation.

- [x] Created `task/sessions/S11-must-gate-pr-readiness.md` — commit `f2f37caf5cb121bf97fe3152182bfe577b122a2d`.
- [x] Created `task/sessions/S12-provider-adapter-registry-contract.md` — commit `f6a0490787d4dd880b4b1dde197242f416413403`.
- [x] Created `task/sessions/S13-codebuddy-cn-access-research.md` — commit `da66cf20ea975b1aa8e879e6c6b4f488264a7a4f`.
- [x] Created `task/sessions/S14-codebuddy-cn-adapter.md` — commit `034e01a1e0ac71182939a6c7b140eb256eb71ec1`.
- [x] Created `task/sessions/S15-workbuddy-tokenhub-access.md` — commit `e1f418e2ced11be37e91741aee9692806d2aee7e`.
- [x] Updated `task/SESSION-PLAN.md` to index S11–S15 and retain S01 as the active task.
- [!] Documentation-only batch: no application code, tests, generated bundles, or runtime behavior changed; CI was not run for this batch.
- [!] S11 is a gate, not a shortcut: it cannot pass while any required MUST acceptance evidence is missing. S12–S15 remain not started and must not run before their listed dependencies pass.
- [!] S13 is research/specification only; S14 can implement only a supported CodeBuddy CN path that S13 explicitly approves. S15 treats WorkBuddy international account/OAuth and Tencent TokenHub API-key access as separate lanes and requires separate decisions.

**Active implementation task remains S01:** capture the internal CONNECT ClientRequest socket/connect/timeout/error/close lifecycle and compare agent-first versus outer-request-first destruction. Preserve the validated production baseline until evidence supports a narrow fix.

**Validation boundary:** latest previously known code CI is run 40443707710 on an earlier code commit. It is not current-head validation and does not prove live OpenChamber/OpenCode acceptance.


## Detailed task-card generation — batch 4 (2026-10-27)

**Purpose:** prepare S16–S20 while preserving all MUST-first and stage-order dependencies. No implementation task was started.

- [x] Created `task/sessions/S16-freebuff-feasibility-review.md` — commit `9e5ca04ff1468c29c24a3fa04fd3332c20240f8d`.
- [x] Created `task/sessions/S17-freebuff-adapter.md` — commit `728c8dcbe57d686cbdabd564a5e8458b94666c1b`.
- [x] Created `task/sessions/S18-cross-provider-compatibility-audit.md` — commit `1c55e9d318adeb53fc5d731f08ea0dacfb0b7eac`.
- [x] Created `task/sessions/S19-token-saver-source-audit.md` — commit `a1fe8ae9e6e2705f3e8f854b22b9c2d26d58e239`.
- [x] Created `task/sessions/S20-token-saver-stage1.md` — commit `7076fa4969ab041e3123680a7e62a82783175c8e`.
- [x] Updated `task/SESSION-PLAN.md` to index S16–S20.
- [!] Documentation-only batch: no application code, tests, generated bundles, or runtime behavior changed; CI was not run.
- [!] S16 is feasibility research only; S17 requires a documented GO decision. S18 audits only providers actually implemented. S19 must establish provenance/licensing before S20 can implement stage 1.
- [!] Token-saver sequence remains fixed: 9router-go behavior → RTK → Caveman → I Have ADHD. S20 is stage 1 only, not the full combo, and no savings claims are authorized without repeatable measurements.

**Active implementation task remains S01:** capture the internal CONNECT ClientRequest socket/connect/timeout/error/close lifecycle and compare agent-first vs. outer-request-first destruction. Do not start later SHOULD implementation while MUST gates remain unresolved.

**Validation boundary:** latest previously known code CI is run 40443707710 on an earlier code commit. This documentation batch has no CI run and does not prove runtime acceptance.


## Detailed task-card generation — batch 5 (2026-10-27)

**Purpose:** prepare S21–S25 in the task index while preserving stage order and the Phase A MUST gate. This is documentation-only and does not start implementation.

- [x] Created `task/sessions/S21-token-saver-stage2-rtk.md` — commit `225c83f60a99a090e7f7453b97cc709973375870`.
- [x] Created `task/sessions/S22-token-saver-stage3-caveman.md` — commit `e1032955eeeef3d3bddc8ca3104ca14a617e44e4`.
- [x] Created `task/sessions/S23-token-saver-stage4-i-have-adhd.md` — commit `3ac52672deeefd79719d2c8ff3d87ba4580eba60`.
- [x] Created `task/sessions/S24-token-saver-combo-e2e-validation.md` — commit `b2424a1132379b45f8bc108ded591a57d9fe66b9`.
- [x] Created `task/sessions/S25-proxy-pool-selection-health-cooldown-audit.md` — commit `2a71c1673796173dc610c5f13a6897413f2509e3`.
- [x] Updated `task/SESSION-PLAN.md` to index S21–S25.
- [!] No application code, tests, bundles, or runtime behavior changed. CI was not run for this documentation-only batch.
- [!] S21–S24 remain gated by S11 and source/stage acceptance dependencies. The fixed sequence remains 9router-go behavior → RTK → Caveman → I Have ADHD, with one top-level combo toggle. No savings claim is supported until repeatable measurement and quality review are complete.
- [!] S25 is an audit card, not authorization for SHOULD work before S11. Any MUST defect found must be routed into a separately scoped Phase A task.

**Active implementation task remains S01:** capture the internal CONNECT ClientRequest socket/connect/timeout/error/close lifecycle and compare agent-first versus outer-request-first destruction. Do not switch to token-saver or proxy-pool implementation while MUST gates remain unresolved.

**Validation boundary:** the latest previously recorded code CI remains run 40443707710 on an earlier code commit. This batch is docs-only and has not been validated by a new CI run; live OpenChamber/OpenCode acceptance remains unproven.


## Detailed task-card generation — batch 6 (2026-10-27)

**Purpose:** prepare S26–S30 and index them without starting future implementation tasks.

- [x] Created `task/sessions/S26-proxy-pool-regression-coverage.md` — commit `07ea37d3f56421e6b28e5af1bcce4b59d1f76b2f`.
- [x] Created `task/sessions/S27-proxy-pool-panel-runtime-state.md` — commit `816f2ad6446f5e0bfa7357590af442590879acc3`.
- [x] Created `task/sessions/S28-panel-responsive-accessibility-validation.md` — commit `ec6566d46c7b8377969fe5ee8d07c98c2d7b4f32`.
- [x] Created `task/sessions/S29-panel-workflow-state-audit.md` — commit `8a5b71b55ac8565e9ab1db695d2f986bbb400e76`.
- [x] Created `task/sessions/S30-panel-persistence-secret-bundle-audit.md` — commit `b9d761f51abe99906cd77deaf418410945714df1`.
- [x] Updated `task/SESSION-PLAN.md` to index S26–S30.
- [!] Documentation-only batch: no application code, tests, generated bundles or runtime behavior changed; CI was not run.
- [!] S26–S30 remain not started and gated by S11/dependencies. S26 must follow S25 findings; panel host acceptance must be based on a supported runtime, not inferred from source or unit tests.
- [!] Preserve generated JavaScript bundles required by the manifest/build process; S30 audits reproducibility and secret handling rather than authorizing speculative file deletion.

**Active implementation task remains S01:** instrument the internal CONNECT ClientRequest lifecycle and compare destruction ordering. Phase A MUST gates remain unresolved; do not execute later SHOULD tasks out of sequence.

**Validation boundary:** latest previously recorded code CI is run 40443707710 on an earlier code commit. This documentation batch has not been validated by a new CI run and does not prove live OpenChamber/OpenCode acceptance.


## Latest session checkpoint — S31–S33 task-card generation (2026-10-27)

- [x] Created `task/sessions/S31-final-security-config-docs-provenance-review.md` — commit `6140972297816e8b73b6ced32f8d5c8a6c7413df`.
- [x] Created `task/sessions/S32-release-acceptance-endpoint-egress-matrix.md` — commit `76d696a69d3856e18572428b4ee0d73d10508a86`.
- [x] Created `task/sessions/S33-release-merge-readiness-decision.md` — commit `41e15dc2fac0a5f18b0b11a97a14ed9ac8515243`.
- [x] Updated `task/SESSION-PLAN.md` to link the S31–S33 detailed cards.
- [!] This was a documentation-only task-generation batch. No application code, tests, generated bundles, or runtime behavior changed; CI was not run.
- [!] S31–S33 are prepared, not started or completed. Their acceptance depends on the evidence gathered by the implementation and MUST-gate tasks; release readiness cannot be inferred from these cards.
- [!] All 33 task IDs now have detailed task cards. The active implementation task remains S01, focused on the pending CONNECT `ClientRequest` lifecycle. S11 MUST gate remains unresolved, so do not begin SHOULD work or claim release readiness.

**Branch-head checkpoint before this log update:** `6c731a9089444292466ea779828e9201d3ec4cc2`. The three card commits and session-plan update are documentation-only; verify the final branch head and all paths before closing this batch.


## S01 session record — 2026-10-27

- **Task/scope:** S01 — CONNECT ClientRequest lifecycle; `BR-SCOPE-1.2`; related requirement FR-M6.
- **Repository state before work:** branch `feat/port-9router-rtk-upstream` HEAD `0df85356420a0afd660502ab8a5bdda2c166263e`; PR #2 open/unmerged.
- **S01 evidence/card/plan commit (post-session result checkpoint):** `ba3e1dcde49ddf2bd2ffad0d67545501e6a72c42`; this commit contains the diagnostic result and status updates and changes only `task/` documents. The latest repository HEAD after this log metadata update is reported in the session summary. Current `main` HEAD is `bdf29864015d97e2e4e9c91c60cc2d3aa1b2ca0f`, while PR metadata reports base SHA `b2959304552ecd02bebd94be2f15b0dca4e9b3b2`. The base discrepancy is recorded; S01 did not rebase or retarget the PR.
- **Files updated:** `task/sessions/S01-connect-clientrequest-lifecycle.md`, `task/SESSION-PLAN.md`, and this task log. No production source, test source, or generated bundle was edited.
- **Source/test inspection:** `service/upstream.ts` blob `04e354181accf6b7aef7cddbca5e4f5a7ce0fc08`; `service/upstream.test.ts` blob `e77ece939f53c25f60b4783786d012bd900aa375`. The CONNECT request is a local variable in `TunnelAgent.createConnection()`; it is not stored on the agent, the outer request, or a cancellation registry. The outer response-close path destroys only the outer request. Existing tests do not assert the pending CONNECT lifecycle.
- **Reproduction commands/environment:** `node /tmp/s01-connect-lifecycle-repro.mjs` (Node v22.16.0, local HTTP CONNECT fixture); the focused reproduction was repeated 3× per destruction order. It used a temporary instrumented copy of the current method because Bun is unavailable and cloning the repo failed with `Could not resolve host: github.com`. The harness file is outside the repository and is not retained as product instrumentation.
- **Trace/result:** see S01 card for the timestamped representative traces. In outer-first and agent-first sequences, after ~251–252 ms the outer request was destroyed but the pending CONNECT request remained `destroyed=false/closed=false`; its client TCP socket and the separately observed proxy-side socket remained open/readable/writable. The HTTP CONNECT `connect` event did not occur because the fixture deliberately withheld HTTP 200; no timeout/error/close/end occurred before fixture cleanup. Only explicit fixture `connectReq.destroy()` closed it.
- **Validation/CI:** CI run #170 / [40443707710](https://github.com/Yoganataa/blackrouter/actions/runs/40443707710) passed Type check, Unit tests, and Build bundles for source commit `78f3858beab993aa7e46ec2ff18a9cd29e9040cb`. Compare `78f3858...0df8535` shows 53 commits, and every changed path is under `task/`; source/test/build inputs are unchanged. Local `bun run type-check`, `bun test`, and `bun run build`: **NOT RUN** (Bun unavailable). No new CI run was triggered by the documentation-only session update.
- **Result:** **COMPLETE — S01 diagnosis only.** The lifecycle gap is isolated for the current pending-CONNECT path: the internal request/socket is not owned by the agent/outer request and neither destruction order closes it. This is not a production fix and does not make FR-M6 PASS.
- **Risks:** no committed permanent regression test yet; no local Bun validation; no live OpenChamber/OpenCode provider acceptance. FR-M6 cancellation, CONNECT timeout, and socket cleanup remain open. PR base metadata differs from current `main`.
- **Next permitted task:** **S02 — CONNECT cleanup and timeout fix**, limited to implementing a fix justified by this evidence and adding a deterministic regression test. S02 was not executed in this session; do not start S03 or SHOULD work.


## S02 session checkpoint — 2026-10-27

- Task/scope: S02 — CONNECT cleanup and timeout fix; FR-M6; BR-SCOPE-1.2.
- Repository state before changes: branch feat/port-9router-rtk-upstream, HEAD a176db0ceed68ebb067348622b5152ab985161ef; PR #2 open/unmerged.
- S01 evidence used: pending internal CONNECT request was not retained by the agent and remained open after either outer-request-first or agent-first destruction; see S01 record and card.
- Changes in this commit: service/upstream.ts tracks pending CONNECT ClientRequests and raw/TLS sockets, enforces a bounded 12-second default setup timeout (factory timeout parameter is exposed for deterministic tests), settles callbacks once, and cleans up on timeout, request error, TLS setup error, or agent destruction. service/upstream.test.ts adds stalled local-proxy tests for timeout and agent cancellation. service/main.js is synchronized manually; it is not yet proven to be a reproducible Bun-generated bundle.
- Validation status: focused tests, type-check, and build have not yet been run in this editing environment. A CI run on this commit is required before S02 can be marked complete. Generated-bundle equivalence remains unverified until bun run build and bundle diff review.
- Status: ACTIVE — implementation prepared; acceptance is pending current-head CI and any required corrections. Do not start S03 until S02 exit criteria are evidenced.

- CI run 40513987493 on commit cff71bb68a1af11e6648ab2e3ab3b8b26a8a74d9 failed at Type check only: the Node HTTP CONNECT fixture types its socket as Duplex, while the test fixture Set was typed as net.Socket. Corrected the fixture Set to Duplex; tests/build were skipped by the workflow after type-check failed. A fresh CI run is required.

- CI run 40514106851 passed on d3df3845038c6d7dab6c242ead777e8990c9b5ad: type-check, all 157 unit tests (including CONNECT timeout and agent-destroy cases), and bundle build. The build workflow generated service/main.js in follow-up commit ad30aa976de1b8085a6692a061da23d9e0cb1c3f; compare against d3df384 shows only service/main.js changed. Added one more regression for explicit proxy CONNECT rejection (HTTP 407) before finalizing S02; a fresh CI run is pending.


## S02 final result — 2026-10-27

- **Final task status:** COMPLETE — CONNECT cleanup/timeout implementation and automated validation; FR-M6 is improved but not fully closed because independent downstream cancellation remains S03 and runtime acceptance remains S10.
- **Final code/test head:** 863357dc28eda0941b50e9f5b0be12e607b11503 on feat/port-9router-rtk-upstream; PR #2 remains open/unmerged. The workflow's generated service bundle sync commit is ad30aa976de1b8085a6692a061da23d9e0cb1c3f.
- **Files changed for implementation:** service/upstream.ts; service/upstream.test.ts; service/main.js (regenerated by CI); task/sessions/S02-connect-cleanup-timeout-fix.md; task/SESSION-PLAN.md; task/PR-2-stabilize-validation.md.
- **Final validation:** [CI run 40514257385](https://github.com/Yoganataa/blackrouter/actions/runs/40514257385) on code/test commit 863357dc28eda0941b50e9f5b0be12e607b11503 passed `bun run type-check`, `bun test` (**158 pass, 0 fail**), and `bun run build`. Focused CONNECT tests passed for bounded timeout, HTTP 407 rejection, and agent destruction. Build completed successfully; service/main.js had already been generated by the prior successful workflow and no additional bundle change was needed on the final test commit.
- **Implementation behavior:** 12-second default bound for CONNECT/TLS tunnel setup; pending internal ClientRequest tracked; once-only settlement; timer cleared and pending entry removed on handoff or failure; request/raw socket/TLS socket cleaned up on timeout/error/agent destruction. No proxy-to-direct fallback behavior changed.
- **First CI attempt:** run 40513987493 failed only type-check due a fixture typing mismatch (HTTP CONNECT event socket is Duplex); corrected by d3df3845038c6d7dab6c242ead777e8990c9b5ad. Run 40514106851 then passed with 157 tests; added HTTP 407 coverage afterward and final run 40514257385 passed 158 tests.
- **Residual risk:** no dedicated successful TLS-through-proxy end-to-end integration test; successful handoff is covered by the shared once-only settlement/cleanup implementation but only code-reviewed. No live OpenChamber host loading or real OpenCode Zen inference is claimed. S02 completion does not mean FR-M6 or PR #2's full MUST gate is complete.
- **Next permitted task:** S03 — downstream cancellation lifecycle, as a separate session. Do not start SHOULD work before S11.


## S03 session checkpoint — 2026-10-28

- Task/scope: S03 — Downstream cancellation lifecycle; FR-M6; BR-SCOPE-1.2. S02 was complete before this session.
- Starting branch HEAD: bb223b85bdf4ad9ed7cc45dcae641a884172b2f1 (PR #2 open/unmerged).
- Source finding: proxyChatCompletion already destroyed the outer upstream request and aborted native direct fetch when the downstream response closed prematurely, but it did not destroy the per-attempt `target.agent`. Because buildTarget creates a new HTTP CONNECT TunnelAgent for each HTTP proxy attempt, a pending CONNECT ClientRequest could outlive downstream cancellation. The transport error handler could also enter fallback handling after the response was already destroyed.
- Changes: `service/upstream.ts` now destroys the per-attempt agent on response close and guards transport error handling against a destroyed/ended downstream response. `service/upstream.test.ts` adds local upstream/router integration tests for cancellation while waiting for upstream response, cancellation during active response streaming, and normal completion.
- Validation: pending current-head CI; no local Bun test/type-check/build claim.
- Status: ACTIVE until CI verifies type-check, focused tests, full suite and build. Next task remains S03 until exit criteria are evidenced.

- S03 CI run 40597358407 failed after type-check passed and 160 tests passed: the active-stream fixture waited for the request `end` event before writing the first response chunk and timed out. Changed the fixture to begin streaming as soon as the upstream request arrives; the test still requires observed upstream response-socket closure after client cancellation. Retest pending.


## S03 final result — 2026-10-28

- **Final task status:** COMPLETE — downstream cancellation lifecycle and automated validation. FR-M6 still has broader remaining work and PR #2 MUST gates remain open.
- **Implementation commit:** 7081572a831814eb97e52bb4917b8594b4044cfb. Follow-up test commits: ca9a7d6abc8fdfc88649480df8494ecfcec2fff9 (assert actual upstream socket close), 40ead3b880db1635aa98d5bf36be243d7ca61afb (deterministic active-stream fixture), and 9b053609d979782e07dddc33d7e9cddf24322abd (correct SSE frame delimiters). Current branch HEAD: 26b2b38c2d69f27ceff8d416d8ed75b7863b573f; PR #2 remains open/unmerged.
- **Validation:** [CI run 40597547670](https://github.com/Yoganataa/blackrouter/actions/runs/40597547670) passed `bun run type-check`, `bun test` (**161 pass, 0 fail**), and `bun run build`. The workflow generated bundle-sync commit 26b2b38c2d69f27ceff8d416d8ed75b7863b573f; comparison of the generated commit against verified source/test commit 9b053609d979782e07dddc33d7e9cddf24322abd shows only `service/main.js` changed.
- **Behavior change:** `proxyChatCompletion` now destroys the per-attempt `target.agent` when the downstream response closes. The transport-error handler exits immediately if the downstream response is already destroyed/ended, preventing fallback attempts and error writes after cancellation.
- **Regression evidence:** local HTTP integration tests prove upstream request socket closure when the downstream client disconnects while awaiting a response, upstream response stream closure when the client disconnects during streaming, and successful normal completion without cancellation. Both cancellation assertions use a 500 ms bound.
- **Fixture correction history:** run 40597358407 failed the active-stream test because its fixture never emitted a valid SSE frame; run 40597396640 still failed because the fixture delayed writing until request end; run 40597471516 revealed double-escaped frame delimiters. The fixture was corrected and final run 40597547670 passed. These failures were test-fixture issues, not changes to production behavior; no assertion was relaxed.
- **Next permitted task:** S04 — egress policy audit. Do not start SHOULD work before S11.


## Session S04 — Egress policy audit (active, 2026-10-28)

- **Scope:** FR-M5 under `BR-SCOPE-1.2`; no provider/SHOULD work started.
- **Starting verified code baseline:** S03 final CI run 40597547670 passed type-check, 161 tests, and build; S03 final docs commit was bcbeb4a38a1521e21d54cc29db70ec1296104a68. PR #2 remains open/unmerged.
- **Audit evidence:** `proxyChatCompletion` constructs attempts from eligible configured pools when any active pool exists; it does not append a `null`/direct attempt in that branch. Existing integration tests cover a failed HTTP CONNECT proxy, retry to another configured relay after a relay transport failure, and exhaustion after OpenCode `403 FreeTierError` from all relay pools.
- **Change:** added a fully local integration case to `service/model-fallback.integration.test.ts` for both configured relay transports failing. Expected result is `502 upstream_unreachable`, final route metadata identifying `Dead Relay B`, exactly two relay attempts, and no request to the local direct-upstream endpoint. Test commit: f861262d3e76ada2f978c9198ab2f9b1e98b8ccf (follow-up fixture safety commit after 53a2ac61c9b7827a6e2e26d9a4ddc800bb419a59).
- **CI status:** not yet available from the commit-workflow lookup; do not claim this new test passes until the PR workflow result is observed.
- **Remaining:** verify active-pool cooldown exhaustion, explicit direct mode and full suite/type-check/build; then record final CI/bundle result before closing S04.


- **S04 follow-up (2026-10-28):** Added a second fully local integration regression in commit `4a739aa24fd21f83183aa18b3fba790f731ccd59`: when all active configured pools have future `rateLimitedUntil`, the request must return `429 rate_limit_exhausted` with a positive `Retry-After`, without attempting a relay or direct upstream request. Existing direct-mode integration path remains present.
- **Final S04 validation (2026-10-28):** Added two response-redaction assertions to the all-relays-transport-failure regression (`body` must not contain a proxy URL marker or `sk-test`), committed as `2e807e7fc0f0b75a37546cc43f66e9cb60056a6b`. GitHub Actions run `40628998383` completed successfully: `bun run type-check` passed, `bun test` passed **163 tests / 0 failures / 570 assertions across 15 files**, and `bun run build` passed. The build reported guest bundles already up to date, so no generated-bundle commit was needed. The current PR head was verified as this commit after the run. S04 is complete; next task is S05. Do not start SHOULD work before S11.
