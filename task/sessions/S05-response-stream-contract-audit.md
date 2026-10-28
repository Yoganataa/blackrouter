# Session S05 — Response and Streaming Contract Audit

**Status:** Complete  
**Scope source:** `goals.md` on `main`, `BR-SCOPE-1.2`  
**Related requirements:** FR-M2 and FR-M6  
**Tracking log:** `task/PR-2-stabilize-validation.md`

## Objective

Audit the existing streaming and non-streaming response contract, including upstream status/body propagation, SSE adaptation, first-byte keepalive, error paths, and cancellation interactions. Document gaps rather than inferring behavior from adjacent tests.

## Entry gate

- Re-read the current response/SSE adapters and related tests.
- Capture the current branch head and CI status.
- Map response modes and error paths to concrete test cases before editing.

## In scope

- Cover supported chat/Responses/Messages response paths and relevant SSE conversions already present in the repository.
- Verify status codes and safe response bodies propagate correctly for upstream failures.
- Verify stream first-byte keepalive behavior without changing the actual upstream result.
- Cover malformed/early-closed streams, upstream errors before and after stream start, and non-streaming failures where applicable.
- Identify duplicate-write, premature-end, and resource-cleanup risks; change code only when a reproducible gap is established.

## Out of scope

- Adding unsupported protocol endpoints or claiming complete provider parity.
- Broad protocol redesign and unrelated UI/provider work.
- Weakening assertions or fabricating live-provider evidence.

## Acceptance criteria

- [x] A requirement-to-test matrix maps supported response modes and failure points to tests.
- [x] Streaming and non-streaming status/body semantics are explicit and covered.
- [x] First-byte keepalive is tested separately from successful upstream inference.
- [x] Error/cancellation behavior does not cause duplicate writes or leave resources open in tested paths.
- [x] Type-check, focused tests, full tests and build pass.
- [x] Task log records changed files, evidence, commit SHA, CI and next task S06.

## Requirement-to-test matrix

| Response mode / condition | Expected contract | Existing or new evidence |
|---|---|---|
| Streaming, successful SSE | Preserve HTTP success and SSE content type; emit adapted chunks and terminate normally. | Existing downstream-cancellation normal-completion integration test; protocol adapter unit tests. Route-level test coverage includes a successful upstream SSE fixture; CI run 40630988626 passed. |
| Streaming, upstream non-2xx before body starts | Preserve upstream status, safe headers and body; do not fold into a success response. | Covered by the route-level streaming 503 and non-streaming 429 integration tests; CI run 40630988626 passed. |
| Streaming, upstream error after headers/body begins | Do not attempt a second status/body write; terminate the stream and clean up the pipeline. | Existing S03 downstream-cancellation tests cover client-driven cancellation. A deterministic local fixture now flushes a partial SSE frame, then destroys the upstream socket; the downstream response terminates as incomplete and does not receive a second `upstream_unreachable` error. CI run 40630988626 passed. |
| Non-streaming, upstream non-2xx | Preserve upstream status, content type, and body bytes. | New local integration regression in `service/upstream.test.ts`; CI run 40630988626 passed. |
| Non-streaming, successful SSE | Aggregate SSE chunks into one OpenAI-style JSON completion, joining content and preserving finish reason/model/id. | New local integration regression in `service/upstream.test.ts`. |
| SSE first-byte idle period | Emit comment keepalives only before the first upstream chunk; stop after data or stream close; disabled for non-positive interval. | Existing three `SSE first-byte keepalive` tests; CI run 40630988626 passed. |
| Downstream cancellation before response | Abort pending upstream request and avoid fallback/error writes after client disconnect. | Existing S03 local integration tests; CI run 40630988626 passed. |
| Native Responses/Messages SSE | Apply lane-specific response transforms and tool-name restoration. | Existing `opencode-protocol.test.ts` adapter tests; no protocol-adapter changes were needed for this session. |

## Session report

**Status: Complete.** Audited the route-level response contract and existing protocol adapters. Added local integration coverage for streaming upstream `503` status/body preservation before stream start, non-streaming upstream `429` status/body/content-type preservation, successful SSE aggregation into one JSON completion, and an upstream socket closing after a partial SSE frame. The abrupt-close regression asserts that the client receives the original `200` streaming response, sees the partial frame, observes an incomplete response, and does not receive a second synthesized `upstream_unreachable` body. Existing S03 tests cover downstream cancellation and normal completion; existing keepalive tests cover idle pings, stopping after first byte, and disabled mode. CI run `40630988626` passed type-check, **167 tests / 0 failures / 588 assertions across 15 files**, and build; guest bundles were already up to date. No production code changes were justified by the audited paths. Final test commit: `a5a4c8d5921dc9f6af16a226251ebd4cb29cafc8`. Next permitted task: S06; do not start SHOULD work before S11.
