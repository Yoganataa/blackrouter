# Session S06 — Native OpenCode Behavior and Model Routing Audit

**Status:** Not started  
**Scope source:** `goals.md` on `main`, `BR-SCOPE-1.2`  
**Related requirements:** FR-M2, FR-M4  
**Dependencies:** S04 and S05 findings should be available; do not duplicate their audits.  
**Tracking log:** `task/PR-2-stabilize-validation.md`

## Objective

Establish a requirement-to-test matrix for native OpenCode request behavior: model catalog and endpoint selection, required headers and fingerprints, session affinity, and model-specific Chat Completions/Responses/Messages translation.

## Entry gate

- Read the completed/available S04 and S05 reports and current source/tests.
- Inspect current 9router upstream source/revision only where needed; record provenance and local deltas before proposing a port.
- Capture current PR head and CI state.

## In scope

- Map supported model families and request shapes to the selected translator/endpoint.
- Audit provider headers, CLI/session/tool fingerprints, timestamp behavior and affinity continuity.
- Audit `/v1/models` and catalog behavior used by the OpenCode Free lane.
- Identify gaps in existing tests and add targeted regressions only for demonstrated gaps.
- Preserve configured egress policy; do not copy upstream direct-egress retry behavior that bypasses a selected proxy/relay.

## Out of scope

- Provider adapter expansion (S12 onward).
- Rewriting all protocol translators or porting the full 9router application.
- Claiming provider compatibility from source resemblance alone.

## Acceptance criteria

- [ ] FR-M2/FR-M4 requirement-to-test matrix lists concrete test names or explicit gaps.
- [ ] Header/fingerprint and session-affinity expectations are documented and tested where applicable.
- [ ] Model/endpoint selection and catalog behavior have explicit coverage.
- [ ] Upstream source revision/path/license and local behavioral differences are recorded for any adopted behavior.
- [ ] Focused tests, full tests, type-check and build pass, or exact blockers are recorded.
- [ ] Task log records files, evidence, commit SHA, CI and next task S07.

## Session report

Not started. Do not mark complete until the criteria above have evidence.
