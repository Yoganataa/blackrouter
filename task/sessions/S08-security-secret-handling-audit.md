# Session S08 — Security and Secret-Handling Audit

**Status:** Not started  
**Scope source:** `goals.md` on `main`, `BR-SCOPE-1.2`  
**Related requirements:** FR-M1, FR-M5, FR-M7  
**Tracking log:** `task/PR-2-stabilize-validation.md`

## Objective

Review the MUST baseline's security boundaries and secret lifecycle, especially loopback binding, proxy/relay credential redaction, stored-secret preservation, diagnostics, panel state and failure messages.

## Entry gate

- Inspect current source, tests, extension configuration and relevant prior findings.
- Record current PR head and CI.
- Treat all upstream errors, model catalogs and user-configured endpoints as untrusted input.

## In scope

- Verify gateway binds to `127.0.0.1` by default and that non-loopback binding requires explicit configuration.
- Search logs, diagnostics, error bodies and panel state for proxy URL userinfo, API keys, tokens and OAuth credentials.
- Verify metadata-only edits do not erase or overwrite stored secrets.
- Check invalid proxy/relay configuration and error surfaces for credential leakage.
- Add focused redaction/persistence/binding regression tests where coverage is missing.
- Review whether secrets are committed in repository content; do not reproduce any discovered secret in logs or the task report.

## Out of scope

- Adding new authentication providers or redesigning secret storage without a demonstrated issue.
- Printing sensitive values to prove redaction.
- Changing transport behavior outside a verified security defect.

## Acceptance criteria

- [ ] Loopback default and explicit opt-in for wider binding are verified by code/tests.
- [ ] Credential redaction covers relevant diagnostics and user-facing error surfaces.
- [ ] Stored credentials survive metadata-only edits and are not exposed in logs/UI.
- [ ] Findings are classified by evidence and severity; no secret values are copied into documentation.
- [ ] Focused tests, full tests, type-check and build pass, or exact blockers are recorded.
- [ ] Task log records evidence, commit SHA, CI and next task S09.

## Session report

Not started. Do not mark complete until the criteria above have evidence.
