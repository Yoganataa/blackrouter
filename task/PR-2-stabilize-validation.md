# Task: Stabilize PR #2 and Validate BlackRouter

**Repository:** `Yoganataa/blackrouter`  
**Working branch:** `feat/port-9router-rtk-upstream`  
**Pull request:** [#2 — feat: port native core and upstream free-tier fixes](https://github.com/Yoganataa/blackrouter/pull/2)  
**Last known CI commit:** `a53ccfb04bf578ec7884769c5bf2f563d2425151`

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
- [ ] Verify loopback-by-default behavior and credential redaction.
- [ ] Verify that selecting a proxy/relay never silently falls back to a direct upstream connection.
- [ ] Check every MUST requirement in `goals.md` / `BR-SCOPE-1.0` against code or test evidence.
- [ ] Recheck the latest PR CI run after fixes and record its run/commit.

## Known CI failures (last observed run)

GitHub Actions run: `40325271651`; failing job: `121580233509`; workflow: `verify-and-bundle`.

- [ ] `service/upstream.ts(791,56)`: `ReadableStream<Uint8Array<ArrayBufferLike>>` is not assignable to the stream type expected by `Readable.fromWeb`.
- [ ] `service/zen.test.ts(6,8)`: no declaration for `./core/utils/opencodeFingerprint.js`.
- [ ] `service/zen.test.ts(7,36)`: no declaration for `./core/executors/opencode.js`.
- [ ] `service/zen.test.ts(31,50)`: property `function` does not exist on inferred type `never`.
- [ ] `service/zen.test.ts(33,12)` and `(34,12)`: `shell` possibly undefined.
- [ ] `service/zen.test.ts(41,17)` and `(42,17)`: property `system` does not exist on the inferred fixture type.
- [ ] `service/zen.test.ts(274,58)` and `(291,58)`: no declaration for `opencodeFingerprint.js`.

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

## Session handoff

**Current state:** Type-check, 147 unit/integration tests, and build passed in CI. The bundle is synchronized. Egress policy now has an integration regression test for the case where OpenCode rejects all configured relay pools; the original failure response is preserved and no direct route is attempted.

**Next action:** Continue MUST acceptance validation: inspect/validate the full request lifecycle and configuration/security boundaries, then run OpenChamber host-level and live OpenCode Zen Free smoke tests where an executable environment is available. The repository CI does not by itself prove the upstream provider currently responds or that the extension loads in the host application.

**Update protocol:** After each work session, update this file with actual status, changed files/commit SHA, commands or CI evidence, remaining blockers, and the next concrete action. Only check an item after verifying it.
