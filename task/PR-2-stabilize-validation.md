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
- [/] Apply the Node Web ReadableStream type assertion in `service/upstream.ts` around line 791; source change is present, compile/CI verification is still pending.
- [/] Add targeted `@ts-ignore` annotations only to imports of upstream JavaScript modules that intentionally have no declarations; TypeScript/CI verification is pending.
- [/] Add explicit structural types for the fingerprint fixture and an explicit runtime failure if the required shell fingerprint is absent; verify with TypeScript/CI.
- [ ] Run `bun run type-check` and confirm it passes.
- [ ] Run `bun test` and review all failures.
- [ ] Run `bun run build` and confirm the generated bundles are valid.
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

**Phase:** TypeScript source-error remediation — edits applied, validation not yet proven.

- [x] Inspected the current branch versions of `service/upstream.ts` and `service/zen.test.ts`.
- [x] Applied the Node Web ReadableStream type assertion in `service/upstream.ts` (commit `b49c87f2ffa9df96ac18cc3377bf008da8c9ce89`).
- [x] Added explicit fixture interfaces to prevent empty-array inference to `never[]` in `service/zen.test.ts`.
- [x] Kept the shell fingerprint assertion meaningful: the test throws if the required shell fingerprint is missing; no assertion was removed or weakened.
- [x] Added targeted TypeScript suppressions for imports of upstream JavaScript modules without declarations; runtime imports and test assertions remain intact.
- [x] Committed the test typing edits through `bc767ad5d0819119f9afc98d584892b1a1000a57`.
- [ ] Run `bun run type-check` and confirm all listed TypeScript diagnostics are gone.
- [ ] Run `bun test` and investigate every failure without weakening tests.
- [ ] Run `bun run build` and inspect generated `service/main.js`.

**Evidence/blocker:** GitHub PR head is `bc767ad5d0819119f9afc98d584892b1a1000a57`. The GitHub commit-status query returned no status checks, and the workflow-run query returned no PR-triggered runs for the preceding commit. No local Bun execution has been performed in this session. Therefore, code edits are confirmed in the branch, but type-check/test/build are **not verified**.

**Next action:** Obtain a real `bun run type-check` result (via a runnable environment or a new CI run); fix any remaining diagnostics based on that output. Do not mark the phase as validated until the command/CI confirms it.

## Session handoff

**Current state:** Audit is complete. The stream type assertion and focused test-typing edits are committed, but no TypeScript/test/build result is available yet. A prior write attempt was blocked and did not change source files. Do not treat any unchecked item as done.

**Next action:** Verify the stream and `service/zen.test.ts` typing edits using `bun run type-check`. Preserve all test assertions; then run tests/build and validate the end-to-end native OpenCode MVP path.

**Update protocol:** After each work session, update this file with the actual status, changed files/commit SHA, commands or CI evidence, remaining blockers, and the next concrete action. Only check an item after verifying it.
