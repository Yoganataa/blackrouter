# Session S01 — Instrument CONNECT ClientRequest Lifecycle

**Status:** Active  
**Scope source:** `goals.md` on `main`, `BR-SCOPE-1.1`  
**Related requirement:** FR-M6 (failure-safe request lifecycle)  
**Related tracking log:** `task/PR-2-stabilize-validation.md`

## Objective

Determine which object owns cleanup of the pending internal HTTP(S) CONNECT request/socket when the outer HTTPS request or `TunnelAgent` is destroyed. Instrument only enough to establish the lifecycle and destruction order. This session is diagnostic; it must not introduce a production cleanup fix based on an unverified assumption.

## In scope

- Refresh current PR head and relevant CI status before editing.
- Inspect `TunnelAgent.createConnection()` and the existing CONNECT integration test.
- Add temporary, narrowly scoped event tracing for the internal CONNECT `ClientRequest` and its socket, including `socket`, `connect`, `timeout` if applicable, `error`, `close`, and destruction state.
- Compare agent-first and outer-request-first destruction order using deterministic local test fixtures.
- Keep trace output free of credentials and unrelated request data.
- Preserve the diagnostic findings in the task log, then remove temporary-only instrumentation/tests before completing the session unless a permanent regression test is explicitly justified.

## Out of scope

- Implementing the cleanup/timeout fix (that is S02).
- Broad transport refactoring or provider work.
- Treating server-side TCP `close` as the only proof of cleanup after a half-close.
- Weakening or deleting a meaningful regression test just to obtain green CI.

## Acceptance criteria

- [ ] The current branch head and relevant CI state are recorded.
- [ ] The trace identifies which lifecycle events occur and which do not for both destruction orders.
- [ ] Evidence distinguishes outer request destruction from internal CONNECT request/socket destruction.
- [ ] Diagnostic instrumentation is removed or explicitly justified as a permanent, redacted test seam.
- [ ] Type-check/tests/build pass on the final session tree, or the exact failure and blocker are recorded.
- [ ] `task/PR-2-stabilize-validation.md` records files, commit SHA, CI run, findings, and next task S02.

## Session report

Not started in this card yet. Update this section only after the work is actually performed.
