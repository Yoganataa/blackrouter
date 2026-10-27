# Session S02 — CONNECT Cleanup and Timeout Fix

**Status:** Not started  
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

- [ ] Fix maps directly to S01 evidence; no speculative ownership assumptions remain.
- [ ] Timeout produces a bounded, normalized failure and cleans up owned resources.
- [ ] Agent/outer-request destruction cancels a pending CONNECT request/socket as designed.
- [ ] Success, timeout, error and destroy paths do not double-call callbacks or leak listeners/resources.
- [ ] Focused tests plus type-check, full tests and build pass, or exact failures are recorded.
- [ ] Generated bundles are reviewed if source changes require regeneration.
- [ ] Task log records changed files, commit SHA, CI run, results and next task S03.

## Session report

Not started. Do not mark complete until the criteria above have evidence.
