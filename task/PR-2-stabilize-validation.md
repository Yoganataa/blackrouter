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
