# Session S31 — Final Security, Configuration, Documentation and Provenance Review

**Status:** Not started  
**Scope source:** `goals.md` on `main`, `BR-SCOPE-1.2`  
**Dependencies:** S11 MUST gate and relevant implementation tasks have recorded outcomes; review the current PR head.  
**Tracking log:** `task/PR-2-stabilize-validation.md`

## Objective

Perform a final evidence-based review of security posture, configuration defaults, user-facing documentation, dependency/source provenance and generated-file hygiene before release acceptance.

## Entry gate

- Refresh `goals.md` on `main`, session plan, task log, relevant task cards, PR head and CI state.
- Review actual changed files and current source-to-bundle policy; do not assume a prior CI result applies to the current head.
- Treat any unresolved MUST gate as unresolved; this card cannot waive S11.

## In scope

- Verify the gateway binds to loopback by default (`127.0.0.1:20128/v1`) and document any intentional configurable exposure precisely.
- Audit credential handling across config, logs, errors, diagnostics, panel/API state and persisted data; ensure secrets are not committed or emitted.
- Review direct, HTTP forward-proxy and relay egress configuration and confirm selected proxy/relay routes are not silently bypassed.
- Check provider auth claims and source/license/provenance records against implemented, supported paths; avoid claims of unsupported or unverified provider access.
- Verify README/changelog and setup/recovery instructions describe only behavior demonstrated by source, tests or runtime evidence, and state known limitations.
- Inspect tracked generated bundles, source/output correspondence, stale build artifacts and unexplained diffs. Preserve manifest/build-required bundles and provenance files.
- Record findings with file/test/commit evidence and create a focused follow-up card for any newly discovered gap before implementation.

## Out of scope

- Implementing new providers or unrelated features.
- Removing files based only on naming or apparent duplication.
- Claiming security certification, runtime acceptance or provider availability without evidence.
- Relaxing MUST criteria to achieve release readiness.

## Acceptance criteria

- [ ] Configuration defaults and egress policy are checked against current source and tests.
- [ ] Secret exposure surfaces and redaction tests are enumerated; gaps are explicit.
- [ ] Provider/auth/license claims are traceable to implemented behavior and provenance records.
- [ ] User documentation is accurate, bounded and includes known limitations/recovery guidance.
- [ ] Generated files are reviewed against build policy; unexplained/stale diffs are resolved or recorded.
- [ ] Relevant tests/build and current-head CI evidence are recorded with exact commit/run identity.
- [ ] Task log records result, blockers and next task; no unverified claim is marked passed.

## Session report

Not started. S31 is a review task, not authorization to begin SHOULD work while S11 is unresolved.
