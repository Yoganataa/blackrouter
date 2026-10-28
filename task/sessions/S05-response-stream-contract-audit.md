# Session S05 — Response and Streaming Contract Audit

**Status:** Active  
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

- [ ] A requirement-to-test matrix maps supported response modes and failure points to tests.
- [ ] Streaming and non-streaming status/body semantics are explicit and covered.
- [ ] First-byte keepalive is tested separately from successful upstream inference.
- [ ] Error/cancellation behavior does not cause duplicate writes or leave resources open in tested paths.
- [ ] Type-check, focused tests, full tests and build pass, or gaps are recorded.
- [ ] Task log records changed files, evidence, commit SHA, CI and next task S06.

## Requirement-to-test matrix

| Response mode / condition | Expected contract | Existing or new evidence |
|---|---|---|
| Streaming, successful SSE | Preserve HTTP success and SSE content type; emit adapted chunks and terminate normally. | Existing downstream-cancellation normal-completion integration test; protocol adapter unit tests. Additional route-level test coverage may be needed. |
| Streaming, upstream non-2xx before body starts | Preserve upstream status, safe headers and body; do not fold into a success response. | To verify in S05. |
| Streaming, upstream error after headers/body begins | Do not attempt a second status/body write; terminate the stream and clean up the pipeline. | Existing pipeline/cancellation behavior; explicit early-close/error evidence to verify. |
| Non-streaming, upstream non-2xx | Preserve upstream status, content type, and body bytes. | New local integration regression in `service/upstream.test.ts`. |
| Non-streaming, successful SSE | Aggregate SSE chunks into one OpenAI-style JSON completion, joining content and preserving finish reason/model/id. | New local integration regression in `service/upstream.test.ts`. |
| SSE first-byte idle period | Emit comment keepalives only before the first upstream chunk; stop after data or stream close; disabled for non-positive interval. | Existing three `SSE first-byte keepalive` tests. |
| Downstream cancellation before response | Abort pending upstream request and avoid fallback/error writes after client disconnect. | Existing S03 local integration tests. |
| Native Responses/Messages SSE | Apply lane-specific response transforms and tool-name restoration. | Existing `opencode-protocol.test.ts` adapter tests; route-level status/body behavior to review. |

## Session report

Active. S05 baseline is PR head `5b794b05c15854740aea23bf0ddbfe6bcc4609d6`. Added two local route-level regressions for non-streaming upstream `429` status/body/header preservation and successful SSE aggregation into JSON. Validation for these changes is running in GitHub Actions; do not close S05 until test/type-check/build results are confirmed and the remaining matrix gaps are either covered or explicitly recorded.
