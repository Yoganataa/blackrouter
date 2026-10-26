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

## Progress checklist

### Audit
- [x] Locate PR #2 and its working branch.
- [x] Inspect the failing GitHub Actions run and identify the first failing gate.
- [x] Record the TypeScript errors emitted by `bun run type-check`.
- [x] Confirm unit tests and build were skipped by CI after type-check failed.

### Fix and verify
- [/] Apply the Node Web ReadableStream type assertion in `service/upstream.ts` around line 791; compile/CI verification is still pending.
- [ ] Resolve missing TypeScript declarations/import typing for the upstream JavaScript modules imported by `service/zen.test.ts`.
- [ ] Correct the test fixture types and narrowing errors in `service/zen.test.ts` (`function`, optional `shell`, and top-level `system`).
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

## Session handoff

**Current state:** Audit is complete. First source fix committed as `b49c87f2ffa9df96ac18cc3377bf008da8c9ce89`; the Web ReadableStream type assertion has not yet been validated by TypeScript/CI. A prior write attempt was blocked and did not change source files. Do not treat any unchecked item as done.

**Next action:** Verify the stream type fix through the latest CI/type-check result. Then address the `service/zen.test.ts` typing failures as the next discrete task.

**Update protocol:** After each work session, update this file with the actual status, changed files/commit SHA, commands or CI evidence, remaining blockers, and the next concrete action. Only check an item after verifying it.
