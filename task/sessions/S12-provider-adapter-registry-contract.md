# Session S12 — Provider Adapter and Registry Contract

**Status:** Not started  
**Scope source:** `goals.md` on `main`, `BR-SCOPE-1.2`  
**Related requirement:** FR-S3  
**Dependency:** S11 must pass the MUST gate before this SHOULD task starts.  
**Tracking log:** `task/PR-2-stabilize-validation.md`

## Objective

Design and review the provider adapter/registry contract before adding an approved provider. Keep provider-specific authentication and protocol behavior separate from core routing and egress policy.

## Entry gate

- Verify S11's evidence-based decision and the current branch/head.
- Re-read the provider-scope and architecture decisions in `goals.md`.
- If any MUST gate is failed or blocked, stop and record this task as blocked; do not begin provider implementation.

## In scope

- Specify provider identity and version/provenance metadata, auth/access class, model catalog, capability flags, request/response translation, streaming, errors, rate/quota limits, cancellation, timeout, and test seams.
- Define normalized semantic outcomes and clarify ownership of retry/fallback, cooldown/account state, and response writing.
- Keep provider/account selection separate from direct, HTTP forward-proxy, and relay egress selection.
- Define secret redaction and storage boundaries, plus a conformance test matrix for existing OpenCode Zen Free and custom OpenAI-compatible paths.
- Compare the contract against the frozen architecture decisions and only the necessary upstream reference behavior.

## Out of scope

- Implementing CodeBuddy, WorkBuddy, TokenHub, or Freebuff.
- Importing a full provider runtime, dashboard, or unrelated routing strategy.
- Treating account pools and proxy/relay pools as the same abstraction.

## Acceptance criteria

- [ ] A reviewed contract names required and optional adapter operations and their error/cancellation semantics.
- [ ] A capability and auth-class schema distinguishes free/no-key, account/OAuth, API-key, trial/credits, and paid/metered access.
- [ ] Core-versus-adapter ownership and egress-policy boundaries are explicit.
- [ ] Test seams cover catalog, non-streaming, streaming, timeout/cancellation, auth expiry, quota/rate limits, and normalized errors.
- [ ] Contract decisions and unresolved questions are recorded in the task log before any provider coding begins.

## Session report

Not started. Do not proceed to S13 until the contract is reviewed and its assumptions are documented.
