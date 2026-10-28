# Session S02 — CONNECT Cleanup and Timeout Fix

**Status:** Complete  
**Scope source:** `goals.md` on `main`, `BR-SCOPE-1.2`  
**Related requirement:** FR-M6  
**Dependency:** S01 must establish the relevant CONNECT request/socket event ordering first.  
**Tracking log:** `task/PR-2-stabilize-validation.md`

## Objective

Implement the smallest production change justified by S01 evidence so a pending CONNECT handshake has bounded lifetime and its owned client-side request/socket is cleaned up when the tunnel agent or outer request is cancelled.

## Entry gate

- Read the completed S01 report and verify its commit and CI evidence.
- If S01 does not distinguish ownership/event order, stop and update S01 rather than guessing.
- Re-read the current `TunnelAgent.createConnection()`, tests, and current branch/CI before editing.

## In scope

- Retain and explicitly manage pending CONNECT request/socket resources only as supported by the diagnostic.
- Add an explicit bounded CONNECT handshake timeout with cleanup on timeout, error, successful handoff, and agent destruction.
- Preserve the current proxy/relay egress policy and existing HTTPS/TLS behavior.
- Add deterministic local-proxy regression tests for timeout and cleanup.
- Assert client-side request/socket state and bounded completion; do not rely solely on immediate remote server-side TCP `close` after a half-close.

## Out of scope

- Downstream cancellation work that is independent of CONNECT timeout (S03).
- Broad transport refactoring, provider work, and unrelated cleanup.
- Relaxing a meaningful assertion to obtain green CI.

## Acceptance criteria

- [x] Fix maps directly to S01 evidence; no speculative ownership assumptions remain.
- [x] Timeout produces a bounded, normalized failure and cleans up owned resources.
- [x] Agent/outer-request destruction cancels a pending CONNECT request/socket as designed.
- [x] Shared settled guard and cleanup cover success handoff, timeout, error and destroy paths; focused tests exercise timeout, non-200 handshake error, and agent destruction.
- [x] CI run 40514257385 passed type-check, all 158 tests, and build.
- [x] CI regenerated/reviewed the service bundle; workflow produced bundle sync commit ad30aa976de1b8085a6692a061da23d9e0cb1c3f. A later build on the final code/test head passed without further bundle changes.
- [x] Task log records changed files, implementation commits, CI evidence, residual risk, and next task S03.

## Session report

**Result: COMPLETE — S02 implementation and CI gate.** Code commit: cff71bb68a1af11e6648ab2e3ab3b8b26a8a74d9. Test-fixture correction: d3df3845038c6d7dab6c242ead777e8990c9b5ad. Additional HTTP 407 regression: 863357dc28eda0941b50e9f5b0be12e607b11503. CI run 40514257385 passed Type check, 158 unit tests (0 failures), and Build OpenChamber bundles.

**Coverage:** stalled CONNECT timeout, rejected HTTP 407 handshake, and agent destruction each produce one outer-request error and a destroyed outer request. Shared pending-settlement logic removes the pending entry, clears the timer, and destroys owned request/socket resources on failure; successful TLS handoff clears the pending entry and timeout before invoking the callback.

**Residual risk:** there is no dedicated successful end-to-end TLS-through-proxy integration test, and live OpenChamber/OpenCode acceptance remains S10. S02 does not close all FR-M6 or overall PR MUST gates. Do not start S03 until the task log is reviewed; S03 is the next task.
