# Session S01 — Instrument CONNECT ClientRequest Lifecycle

**Status:** Complete — S01 diagnostic only; the production lifecycle fix remains S02.  
**Scope source:** `goals.md` on `main`, `BR-SCOPE-1.2`  
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

- [x] The current branch head and relevant CI state are recorded.
- [x] The trace identifies which lifecycle events occur and which do not for both destruction orders.
- [x] Evidence distinguishes outer request destruction from internal CONNECT request/socket destruction.
- [x] Diagnostic instrumentation is removed or explicitly justified as a permanent, redacted test seam.
- [x] Type-check/tests/build evidence and the exact local-environment limitation are recorded. CI run #170 passed on source-identical code commit `78f3858beab993aa7e46ec2ff18a9cd29e9040cb`; commits up to the pre-session HEAD after that validation changed task documentation only. Local Bun commands were NOT RUN because Bun is unavailable.
- [x] `task/PR-2-stabilize-validation.md` records files, commit SHA, CI run, findings, and next task S02.

## Session report — 2026-10-27

**Result: COMPLETE for S01 diagnostics. This does not close FR-M6; S02 owns the implementation fix.**

### Repository state
- Branch before session: `0df85356420a0afd660502ab8a5bdda2c166263e`; PR #2 is open and unmerged.
- Scope source: `main/goals.md`, scope `BR-SCOPE-1.2`, main HEAD `bdf29864015d97e2e4e9c91c60cc2d3aa1b2ca0f`.
- PR metadata reports base SHA `b2959304552ecd02bebd94be2f15b0dca4e9b3b2`, which differs from current `main`; no rebase/base change was performed in S01.
- Source inspected: `service/upstream.ts` blob `04e354181accf6b7aef7cddbca5e4f5a7ce0fc08`; baseline test `service/upstream.test.ts` blob `e77ece939f53c25f60b4783786d012bd900aa375`.

### Ownership findings
- `TunnelAgent.createConnection()` (source lines 45–105) creates `connectReq` as a local variable, attaches `connect` and `error` listeners, calls `end()`, and returns `null as unknown as Socket` while waiting for the tunnel callback. It does not retain the pending CONNECT request or its assigned TCP socket on the agent.
- `createTunnelAgent()` returns the `TunnelAgent`; `buildTarget()` supplies it for an HTTP forward-proxy target, and the upstream `ClientRequest` receives that agent. The downstream response-close handler destroys the outer upstream request, but does not reach the local `connectReq`.
- Existing `service/upstream.test.ts` asserts that the returned target has an agent, but has no CONNECT request/socket teardown lifecycle assertion.

### Reproduction and trace
Environment: Node.js v22.16.0 available; Bun is not installed, and `git clone` could not resolve `github.com` (DNS failure). The minimal harness therefore used a locally instrumented copy of the current `TunnelAgent.createConnection()` logic against a local HTTP CONNECT fixture that accepts TCP CONNECT but deliberately withholds HTTP 200. It was repeated three times for each destruction order. This is an isolated Node reproduction, not a committed repository test or a direct import of the TypeScript module.

Representative trace (milliseconds since each fixture started; abbreviated to lifecycle-significant events):

- **Outer request first:** client CONNECT TCP socket `connect` at 42.55 ms; proxy `connect` accepted at 44.72 ms; pre-destroy snapshot at 86.07 ms. `outerReq.destroy()` at 86.10 ms; at 186.98 ms outer request was destroyed but `connectReq.destroyed=false`, `connectReq.closed=false`, client CONNECT socket `destroyed=false/readable=true/writable=true`, and proxy-side socket `destroyed=false/readable=true/writable=true). `agent.destroy()` at 186.99 ms; state remained unchanged at 287.73 ms and final observation 338.24 ms (~252 ms after first destroy).
- **Agent first:** `agent.destroy()` at 45.71 ms; all inner-request/client-socket/proxy-socket live-state observations remained unchanged at 146.19 ms. `outerReq.destroy()` at 146.20 ms; same state at 246.76 ms and final observation 297.16 ms (~251 ms after first destroy).
- Across all six runs, the internal CONNECT socket assignment and TCP `connect` were observed, and CONNECT request `finish` was observed. The HTTP CONNECT `connect` event did not occur because the fixture withheld its 200 response. No timeout, request error/close, or socket end/close occurred before fixture cleanup. The outer request never emitted `socket` because the tunnel callback had not returned a TLS socket. Agent request/socket/free-socket collections were empty at the snapshots.
- Only fixture cleanup explicitly called `connectReq.destroy()`; then the client socket's wrapped `destroy()` was observed, followed by proxy-side `close`, CONNECT request error `socket hang up`/close and client-side socket close. The server/proxy observation and client-side socket state were logged separately.

### Interpretation and validation
The controlled reproduction isolates the pending-request ownership gap: neither outer request destruction nor `TunnelAgent.destroy()` reaches the internal CONNECT request/socket in this code path. The CONNECT request also has no configured timeout (`setTimeout` is not called on it). This is a lifecycle diagnosis, not a production fix; do not infer that all timeout/cancellation paths are solved.

CI run [40443707710](https://github.com/Yoganataa/blackrouter/actions/runs/40443707710), run #170, passed Type check, Unit tests, and Build OpenChamber bundles on code commit `78f3858beab993aa7e46ec2ff18a9cd29e9040cb`. Compare from that commit to pre-session HEAD `0df85356420a0afd660502ab8a5bdda2c166263e` lists only task documentation files, with no source/test/bundle changes. Local `bun run type-check`, `bun test`, and `bun run build` were NOT RUN because Bun is unavailable. No production code, test, or generated bundle was changed in this session.

### Remaining risk and next task
FR-M6 remains open: add the smallest cleanup/timeout ownership fix and a deterministic permanent regression test in **S02 only**. Preserve the baseline until that task; do not proceed to S03 or any SHOULD work from this result alone.
