# Session S03 — Downstream Cancellation Lifecycle

**Status:** Complete  
**Scope source:** `goals.md` on `main`, `BR-SCOPE-1.2`  
**Related requirement:** FR-M6  
**Dependency:** S02 must be completed or its remaining limitation explicitly documented.  
**Tracking log:** `task/PR-2-stabilize-validation.md`

## Objective

Verify that cancellation or disconnect of the downstream client reaches the upstream request, response stream, and other resources owned by that request, independently of CONNECT handshake timeout behavior.

## Entry gate

- Read S02 findings and current CI state.
- Identify the actual downstream-abort path and resource ownership in current source before adding tests.
- Keep the fixture deterministic and local; do not require live provider access for lifecycle assertions.

## In scope

- Trace the downstream request/response lifecycle from client disconnect through upstream request/stream cleanup.
- Add focused local-upstream tests for abort during request setup, response wait, and active streaming where supported by the current architecture.
- Verify listeners, timers, sockets and request objects are cleaned up without unhandled errors or duplicate response writes.
- Keep cancellation semantics distinct from upstream timeout, upstream error, and CONNECT handshake failure.

## Out of scope

- Reworking CONNECT timeout logic already handled by S02.
- Provider-specific retries or broad stream refactors.
- Treating a test that merely destroys the client as proof that all upstream resources closed.

## Acceptance criteria

- [x] Local integration tests observe the upstream request socket close during response wait and the upstream response close during active streaming.
- [x] Both cancellation paths must complete within 500 ms in the deterministic local fixture.
- [x] Transport error handling returns immediately once downstream response is destroyed/ended, preventing fallback/error writes after cancellation.
- [x] Normal upstream completion remains covered by the local integration regression; existing transport/error tests remain intact.
- [x] CI run 40597547670 passed type-check, all 161 unit tests, and bundle build.
- [x] Task log records source/test commits, CI run, generated bundle sync commit, evidence and next task S04.

## Session report

**Result: COMPLETE — S03 downstream cancellation lifecycle.** Implementation commit: 7081572a831814eb97e52bb4917b8594b4044cfb. Regression-fixture corrections: ca9a7d6abc8fdfc88649480df8494ecfcec2fff9, 40ead3b880db1635aa98d5bf36be243d7ca61afb, and 9b053609d979782e07dddc33d7e9cddf24322abd. CI run 40597547670 passed type-check, 161 tests (0 failures), and build. Workflow generated bundle-sync commit 26b2b38c2d69f27ceff8d416d8ed75b7863b573f; comparison against the verified test commit shows only service/main.js changed.

**Coverage:** while awaiting the upstream response, downstream cancellation closes the actual upstream request socket; while streaming, downstream cancellation closes the upstream response stream. Both are bounded by 500 ms in local fixtures. A normal completion regression remains green. Residual risk: live OpenChamber/OpenCode acceptance is separate (S10), and this does not close all PR MUST gates. Next task is S04.
