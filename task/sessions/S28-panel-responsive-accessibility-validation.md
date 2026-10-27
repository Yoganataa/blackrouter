# Session S28 — Native OpenChamber Panel Responsive and Accessibility Validation

**Status:** Not started  
**Scope:** `goals.md` on `main`, `BR-SCOPE-1.2`  
**Dependencies:** S11 MUST gate passed; supported OpenChamber host available for runtime acceptance.  
**Log:** `task/PR-2-stabilize-validation.md`

## Objective
Validate the existing panel in its supported host, focusing on responsive layout, keyboard access, visible focus, theme behavior and reduced motion.

## Entry gate
- Refresh branch/head, goals and S11 status.
- Identify supported host/version and panel entry point from manifest/build configuration.
- If host runtime is unavailable, perform source-level review but mark host validation blocked.

## In scope
- Exercise wide and narrow panel widths; check clipping, overflow and unusable controls.
- Navigate by keyboard; verify logical order, visible focus and pointer-free operation.
- Check semantic labels/accessibility names, light/dark theme, text/status/focus contrast, and reduced-motion behavior where animations exist.
- Record issues with reproduction steps and source paths; make only scoped fixes if permitted.

## Out of scope
- Full workflow-state audit (S29), persistence/secret/bundle audit (S30), unrelated redesign.

## Acceptance criteria
- [ ] Host/version and tested panel sizes are recorded.
- [ ] Keyboard, focus, labels, theme and reduced-motion checks have concrete results.
- [ ] Fixes have regression coverage and do not duplicate host settings.
- [ ] Runtime claims have actual host evidence; unavailable environment remains blocked.
- [ ] Relevant type-check/tests/build/bundle diff and task log are reviewed.

## Session report
Not started. Source-only review is not supported-host validation.
