# Session S17 — Freebuff Adapter Implementation (Conditional)

**Status:** Not started  
**Scope source:** `goals.md` on `main`, `BR-SCOPE-1.2`  
**Dependency:** S16 must document a supported/permitted GO decision; S11 and S12 must remain valid.  
**Tracking log:** `task/PR-2-stabilize-validation.md`

## Objective

Implement Freebuff only along the specific official path approved by S16, using the reviewed provider contract and preserving existing provider behavior.

## Entry gate

- Read S16's evidence and verify that all critical access, terms, auth and security questions have acceptable answers.
- If S16 is NO-GO/BLOCKED or the official route has changed, do not code; record the blocker and leave the provider unsupported.
- Confirm current branch/head and baseline test state.

## In scope

- Implement only the approved provider adapter, configuration, model catalog and required translation.
- Keep provider credentials separate from proxy/relay credentials and redact secrets in all output.
- Add focused tests for auth lifecycle, catalog, request/response formats, streaming, errors, limits, cancellation and timeouts.
- Run type-check, relevant/full tests and build; inspect generated bundle diffs where applicable.
- Run a real short inference only with authorized valid access and record the actual response/result.

## Out of scope

- Undocumented endpoints, desktop cookies, private session extraction or unsupported auth flows.
- Changes to unrelated providers, global egress policy or token-saver stages.
- Treating S16's research decision as implementation or runtime evidence.

## Acceptance criteria

- [ ] Code matches S16's approved spec and S12 contract.
- [ ] Regression tests cover supported behaviors and failure modes without weakening existing tests.
- [ ] Credential handling is safe and access/cost claims are truthful.
- [ ] Current-head CI/type-check/tests/build results and commit SHA are recorded.
- [ ] Real inference is marked passed only when an actual valid response was observed; otherwise it remains blocked.
- [ ] If S16 did not pass, no adapter code is added and the no-go decision is documented.

## Session report

Not started. Split any incomplete implementation into a focused follow-up task instead of widening scope.
