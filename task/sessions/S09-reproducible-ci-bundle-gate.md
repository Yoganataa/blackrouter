# Session S09 — Current-Head CI and Generated-Bundle Gate

**Status:** Not started  
**Scope source:** `goals.md` on `main`, `BR-SCOPE-1.2`  
**Related requirement:** FR-M8  
**Dependencies:** S01–S08 findings must be integrated or explicitly documented as unresolved.  
**Tracking log:** `task/PR-2-stabilize-validation.md`

## Objective

Run the repository's reproducible validation gate against the actual current PR head, inspect generated runtime bundles against source, and distinguish code CI from live host/provider acceptance.

## Entry gate

- Confirm branch head and working tree/repository state.
- Verify temporary diagnostic-only instrumentation is absent, unless the active diagnostic task explicitly requires it and the removal plan is recorded.
- Review outstanding MUST defects and avoid treating an old CI run as validation of a newer commit.

## In scope

- Run the configured type-check, full automated tests and production build through the project's supported workflow.
- Inspect generated service/panel/status bundle diffs and confirm they are reproducible from source.
- Review workflow output for stale bundles, unexplained generated changes, or tests that were skipped.
- Record exact commit SHA, workflow/run URL, checks and result.
- If the environment cannot run CI, report that limitation and use available repository evidence without claiming the gate passed.

## Out of scope

- Live OpenChamber and real provider inference acceptance, assigned to S10.
- Suppressing tests, weakening assertions, or manually editing generated bundles to fake sync.
- Calling historical CI a current-head pass.

## Acceptance criteria

- [ ] Type-check, full tests and build are evidenced on the current head.
- [ ] Generated bundle changes are reviewed and source-to-bundle consistency is established.
- [ ] Temporary diagnostic code is absent from the release candidate.
- [ ] Exact CI run, head SHA and failures/blockers are recorded.
- [ ] Task log records outcome and next task S10.
- [ ] Any failing check remains open with root-cause evidence; no failure is hidden to achieve green status.

## Session report

Not started. Do not mark complete from an earlier commit's CI.
