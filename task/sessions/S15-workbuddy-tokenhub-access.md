# Session S15 — WorkBuddy International and Tencent TokenHub Access Review

**Status:** Not started  
**Scope source:** `goals.md` on `main`, `BR-SCOPE-1.2`  
**Dependency:** S11 MUST gate and S12 provider contract must pass.  
**Tracking log:** `task/PR-2-stabilize-validation.md`

## Objective

Research the documented WorkBuddy international account/OAuth route and Tencent TokenHub API-key route as two distinct lanes, then record a supported-path decision and implementation specifications.

## Entry gate

- Verify S11 passed and S12 contract is reviewed.
- Recheck current official documentation, endpoint/region guidance, terms, account eligibility and billing/access class.
- If either lane requires private endpoint discovery, desktop-cookie extraction or undocumented session reuse, reject that route.

## In scope

- For WorkBuddy international (CodeBuddyEN), verify documented account/OAuth flow, token refresh/expiry, permitted usage, model catalog, session affinity and account/plan constraints.
- For Tencent TokenHub, verify the documented API endpoint, region, model IDs, API-key lifecycle, pricing/credits, quotas and capabilities.
- Assign separate provider IDs/configuration and clearly separate OAuth/account credentials from TokenHub API keys.
- Record official URLs, review date, source provenance, terms/privacy implications, adapter specifications, focused tests and real-inference acceptance plans for each lane.
- Make a separate GO/NO-GO decision for each lane. If implementation scope cannot be completed with its required tests in this session, stop at research/specification and create a follow-up implementation card.

## Out of scope

- Treating WorkBuddy OAuth and TokenHub API-key access as the same provider, credential type, entitlement or pricing class.
- Assuming either lane is free or unlimited without official evidence.
- Extracting desktop cookies, private session state or undocumented tokens.
- Implementing both lanes before their separate evidence and test plans are accepted.

## Acceptance criteria

- [ ] Each lane has independent official-source evidence, access date, auth lifecycle, region/model configuration, billing/limits and terms review.
- [ ] Provider IDs, credential boundaries and capabilities remain distinct.
- [ ] Each lane receives its own GO/NO-GO decision; unknown critical details block implementation.
- [ ] Test plans cover auth expiry/invalid credentials, quota/rate limits, streaming/non-streaming, cancellation, normalized errors and real short inference where authorized.
- [ ] No implementation is started for a lane without a documented GO decision.
- [ ] Findings, blockers and any follow-up implementation task are recorded in the task log.

## Session report

Not started. Research approval does not itself prove a provider is implemented, available, free, or ready for release.
