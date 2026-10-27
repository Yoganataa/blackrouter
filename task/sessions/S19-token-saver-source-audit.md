# Session S19 — Linear Token-Saver Source and Provenance Audit

**Status:** Not started  
**Scope source:** `goals.md` on `main`, `BR-SCOPE-1.2`  
**Dependency:** S11 MUST gate must pass before Phase C implementation work.  
**Required order:** 9router-go token-saver behavior → RTK → Caveman → I Have ADHD.  
**Tracking log:** `task/PR-2-stabilize-validation.md`

## Objective

Audit the four intended stages and their upstream provenance before implementing any token-saver behavior. Establish what each stage is meant to do and which source revision/license governs it.

## Entry gate

- Verify S11 passed and read the frozen FR-S2 requirements.
- Inspect current official/reference repositories and exact revisions; do not rely on README marketing claims alone.
- Check licenses, provenance, dependency/security risks and whether code adaptation is permitted.

## In scope

- Identify exact source repositories, revisions, paths and licenses for 9router-go token-saving behavior, RTK, Caveman and I Have ADHD.
- Distinguish I Have ADHD from Ponytail and record the intended role of each stage.
- Define candidate inputs/outputs, no-op behavior, errors, streaming implications and preservation constraints for each stage.
- Inspect existing BlackRouter token-saver code and wiring to determine safe integration points; do not remove code without evidence it is unused.
- Establish a repeatable baseline corpus and measurement method for output quality, token counts and latency where feasible.
- Record which behaviors are verified, uncertain or out of scope.

## Out of scope

- Implementing any stage or claiming token savings in this session.
- Wholesale porting of 9router-go service/dashboard.
- Reordering stages or creating four unrelated top-level toggles.

## Acceptance criteria

- [ ] Each stage has source URL/revision/path/license and provenance notes.
- [ ] Intended behavior and known limitations are described using source evidence.
- [ ] Safety, code, tool-call, file path, diff and diagnostic preservation risks are identified.
- [ ] Integration points and baseline test corpus are documented.
- [ ] No unsupported percentage/savings claim is introduced.
- [ ] Task log contains findings and explicitly permits or blocks S20.

## Session report

Not started. S20 may implement only the relevant, verified 9router-go token-saver behavior and must preserve the fixed four-stage order.
