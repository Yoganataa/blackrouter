# Session S03 — Downstream Cancellation Lifecycle

**Status:** Not started  
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

- [ ] Tests observe cancellation at the owned upstream resource, not only at the downstream client.
- [ ] Cancellation completes within a documented bound.
- [ ] No duplicate response writes, unhandled rejection, or unexpected retry occurs.
- [ ] Normal completion and upstream error behavior remain covered.
- [ ] Type-check, focused tests, full tests and build pass, or blockers are recorded.
- [ ] Task log records evidence, commit SHA, CI and next task S04.

## Session report

Not started. Do not mark complete until the criteria above have evidence.
