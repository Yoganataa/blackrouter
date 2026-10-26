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

**Phase:** TypeScript remediation + automated quality gate — validated by GitHub Actions. Full MVP acceptance is still pending host/transport smoke tests.

- [x] Fixed the Node Web ReadableStream type incompatibility and upstream JavaScript import typing.
- [x] Preserved the shell fingerprint assertion and added explicit structural fixture types.
- [x] CI type-check passes on commit `fcd631ed9d3d789809ff4333e85c43533e28dfc1`.
- [x] Fixed a real runtime defect in `service/core/utils/opencodeFingerprint.js`: the normalization path called undefined `canNormalizeInPlace` and `withFingerprintDefinition` helpers. Added helpers that normalize only accepted OpenCode fingerprint descriptions with a compatible subset schema; custom schemas remain aliased.
- [x] Corrected the Messages regression test to inspect Anthropic `system` content blocks instead of incorrectly treating the field as a string. Its type model now reflects the actual string-or-content-block shape and fails explicitly if content blocks are absent.
- [x] CI unit tests pass: **146 passed, 0 failed across 15 files** (run `40349762310`).
- [x] CI build passes; workflow regenerated and committed `service/main.js` in `93398269be734273ceec1f21ed9c510251606906`; verified the generated bundle contains `canNormalizeInPlace`.
- [x] Confirm the successful source CI run generated the bundle and inspect its committed output; `service/main.js` contains the fingerprint normalization helper.
- [ ] Inspect the generated bundle diff and ensure source/runtime behavior remains synchronized.
- [ ] Verify OpenChamber host load and the primary OpenCode Zen Free inference path with an actual valid response.
- [ ] Verify direct, HTTP proxy, and relay paths separately, including no silent direct-egress fallback.
- [ ] Verify streaming/non-streaming, cancellation/timeouts, Test Model, loopback default, and credential redaction.
- [ ] Check all MUST requirements in `goals.md` / `BR-SCOPE-1.0` against implementation and evidence.

**CI evidence:** [Run 40349762310](https://github.com/Yoganataa/blackrouter/actions/runs/40349762310) completed successfully through type-check, unit tests, and build. Test output: 146 pass / 0 fail. The workflow committed regenerated `service/main.js` as `9339826f`. Earlier runs failed because of (1) missing fingerprint normalization helpers and (2) the test assuming Messages `system` was a string; those were fixed in source and tests without weakening behavioral assertions. Do not claim the OpenCode end-to-end path or transport/security requirements are complete until smoke-tested.

**Latest source fixes:** `ed019186c7b81ce8e79fa676a681b1c5f07213f7` adds the missing fingerprint helpers; `b9d57e57e16e92ee43fce9b610a96058ceda4cdb` corrects Messages system assertions; `fcd631ed9d3d789809ff4333e85c43533e28dfc1` corrects the test fixture type. Bundle generation commit: `93398269be734273ceec1f21ed9c510251606906`.

## Session handoff

**Current state:** The TypeScript gate, all 146 unit tests, and bundle build have passed in GitHub Actions. The build regenerated `service/main.js` and pushed commit `9339826f`. The current phase is not fully complete: generated-bundle CI confirmation and live OpenChamber/OpenCode plus direct/proxy/relay smoke tests remain.

**Next action:** Confirm the latest branch head and CI status after the generated-bundle push; inspect the generated service bundle diff. Then perform or obtain evidence for the primary OpenCode Zen Free inference flow and transport/security acceptance checks. Do not mark an unchecked item complete without evidence.

**Update protocol:** After each work session, update this file with actual status, changed files/commit SHA, commands or CI evidence, remaining blockers, and the next concrete action. Only check an item after verifying it.
