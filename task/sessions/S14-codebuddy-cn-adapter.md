# Session S14 — CodeBuddy CN Adapter Implementation

**Status:** Not started  
**Scope source:** `goals.md` on `main`, `BR-SCOPE-1.2`  
**Dependency:** S13 must produce a supported-path GO decision and S11/S12 must remain valid.  
**Tracking log:** `task/PR-2-stabilize-validation.md`

## Objective

Implement only the CodeBuddy CN adapter path explicitly approved by S13, conforming to the reviewed S12 contract and preserving existing gateway behavior.

## Entry gate

- Review S13's sources, date, go/no-go decision and implementation specification.
- If the documented supported path, terms, authentication lifecycle, or pricing/access class is unclear, stop and mark blocked.
- Confirm the current branch/head and run the relevant baseline tests before editing.

## In scope

- Add the smallest adapter/configuration/model-catalog changes required by the approved spec.
- Normalize upstream errors and preserve bounded retry/fallback ownership in core.
- Keep credentials redacted and separate provider credentials from proxy/relay credentials.
- Add focused tests for supported auth handling, catalog, streaming/non-streaming, errors, expiry/invalid credentials, rate/quota limits, timeout/cancellation, and capability claims.
- Run type-check, relevant/full tests and build; record generated bundle changes only if the project build requires them.
- Perform a real short inference only in an authorized environment with valid access; record unavailable runtime checks as blocked.

## Out of scope

- WorkBuddy international OAuth, Tencent TokenHub API-key integration, or Freebuff.
- Private endpoint or desktop-cookie extraction.
- Changes to global egress policy, broad fallback behavior, or unrelated provider adapters.

## Acceptance criteria

- [ ] Implementation matches the S13 approved spec and S12 contract.
- [ ] Focused regression tests pass without weakening existing tests.
- [ ] Access class and quota claims are evidence-based; secrets do not appear in logs, UI, tests, or commits.
- [ ] Current-head CI/type-check/tests/build evidence is recorded.
- [ ] Real inference is passed only with an actual valid response; otherwise it is explicitly blocked.
- [ ] Task log records files, commit SHA, validation, limitations and next task.

## Session report

Not started. If the implementation cannot be completed and tested within this scope, split the remaining work into a new card instead of bundling unrelated changes.
