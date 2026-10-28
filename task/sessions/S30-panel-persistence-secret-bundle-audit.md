# Session S30 — Panel Persistence, Secret Masking and Source-to-Bundle Reproducibility

**Status:** Not started  
**Scope:** `goals.md` on `main`, `BR-SCOPE-1.2`  
**Dependencies:** S11 MUST gate passed; relevant S28–S29 findings reviewed.  
**Log:** `task/PR-2-stabilize-validation.md`

## Objective
Verify settings persistence, secret masking and reproducible generated bundles so the distributed extension reflects reviewed source behavior.

## Entry gate
- Refresh branch/head, manifest, build scripts, generated-file policy and S11 status.
- Identify TypeScript sources and their checked-in JavaScript outputs; preserve runtime/manifest-required files.
- Review existing redaction and masked-secret preservation behavior before changes.

## In scope
- Test persistence across panel reload and supported service/host restart scenarios.
- Verify secret fields are masked in UI/API responses and unchanged masked placeholders do not overwrite stored credentials.
- Inspect logs, diagnostics, persisted history and panel state for credential leakage.
- Run documented build and review generated bundle diffs for source/output correspondence.
- Check build repeatability and record runtime blockers separately from source/build results.

## Out of scope
- Deleting generated bundles without proof they are unused.
- Broad configuration redesign or claiming host acceptance from build success alone.

## Acceptance criteria
- [ ] Persistence and masked-secret behavior have regression evidence.
- [ ] Relevant panel/API/log/history surfaces are reviewed for secret leakage.
- [ ] Generated bundles match documented build output and diffs are reviewed.
- [ ] Repeated build creates no unexplained generated diffs.
- [ ] Current-head type-check/tests/build evidence is recorded for code changes.
- [ ] Task log records files, evidence, risks and next task.

## Session report
Not started. Reproducibility verification is not a reason to delete required generated files.
