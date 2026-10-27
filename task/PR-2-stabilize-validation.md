# Task: Stabilize PR #2 and Validate BlackRouter

**Repository:** `Yoganataa/blackrouter`  
**Working branch:** `feat/port-9router-rtk-upstream`  
**Pull request:** [#2 — feat: port native core and upstream free-tier fixes](https://github.com/Yoganataa/blackrouter/pull/2)  
**Latest source commit verified by CI:** `ecfe57b16aa5534a57a74823f0a5319ebeb0f466`  
**Latest CI-generated bundle commit:** `e2152ed` (service bundle synchronized)

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

**Phase:** Deployment/relay diagnostic credential leakage — fixed and CI-verified. Transport lifecycle validation remains open.

- [x] Proxy and relay connectivity-test errors are passed through `redactDiagnosticText()`.
- [x] Cloudflare, Deno, and Netlify generated relay handlers return generic `Relay fetch failed` errors instead of raw exception messages that could leak credential-bearing URLs.
- [x] Added tests proving relay connectivity errors redact URL username/password/query secrets and generated relay code does not expose `error.message`.
- [x] CI run [40426966515](https://github.com/Yoganataa/blackrouter/actions/runs/40426966515) passed on source commit `ecfe57b16aa5534a57a74823f0a5319ebeb0f466`: type-check passed, **153 tests passed / 0 failed across 15 files**, and build passed.
- [x] CI confirmed generated bundles are already synchronized; the workflow recorded bundle commit `e2152ed`.
- [ ] Review unusual credential formats and remaining non-user-facing logs for secrets not covered by common redaction.
- [ ] Audit direct/proxy/relay request transport, especially cancellation/timeouts and whether route failures can trigger direct egress.
- [ ] Validate live OpenChamber host loading and a real OpenCode Zen Free inference response.
- [ ] Check every MUST in `goals.md` / `BR-SCOPE-1.0` against evidence.

**Changed files:** `service/deployers.ts`, `service/deployers.test.ts`, generated bundle verification, and this task log.

**Next action:** continue transport lifecycle audit in `service/upstream.ts`; verify that cancellation, timeout, and failed relay paths never bypass configured egress. Keep host-level/live provider acceptance unchecked until an actual successful runtime response is observed.
## Session handoff

**Current state:** Latest CI run `40426966515` passed type-check, 153 tests, and build. Panel state, gateway/local errors, runtime diagnostics, request-history labels, and relay/proxy connectivity diagnostics redact common credential-bearing fragments; generated relay handlers avoid returning raw exception messages. Egress regression coverage confirms configured relay pools are not bypassed after OpenCode rejects them. MVP host-level/live provider acceptance remains incomplete.

**Next action:** Audit `service/upstream.ts` transport cancellation/timeouts and prove failed relay/proxy routes cannot silently switch to direct egress; then run OpenChamber host-level and live OpenCode Zen Free smoke tests where an executable environment is available. The repository CI does not by itself prove the upstream provider currently responds or that the extension loads in the host application.

**Update protocol:** After each work session, update this file with actual status, changed files/commit SHA, commands or CI evidence, remaining blockers, and the next concrete action. Only check an item after verifying it.
