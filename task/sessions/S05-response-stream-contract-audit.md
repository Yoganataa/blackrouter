# Session S05 — Response and Streaming Contract Audit

**Status:** Not started  
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

## Session report

Not started. Do not mark complete until the criteria above have evidence.
