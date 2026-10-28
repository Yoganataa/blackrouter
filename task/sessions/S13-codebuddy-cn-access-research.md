# Session S13 — CodeBuddy CN Official Access Research and Implementation Specification

**Status:** Not started  
**Scope source:** `goals.md` on `main`, `BR-SCOPE-1.2`  
**Dependency:** S11 MUST gate and S12 provider contract must pass.  
**Tracking log:** `task/PR-2-stabilize-validation.md`

## Objective

Establish a current, supported CodeBuddy CN integration path and produce an implementation specification. Research is a go/no-go gate; approval of the target does not prove that a particular endpoint, entitlement, or authentication path is currently supported.

## Entry gate

- Verify S11 passed and S12 contract is reviewed.
- Re-pin current official documentation/source revisions and review dates.
- Stop if the only viable path depends on private endpoint discovery, desktop cookie extraction, or undocumented session reuse.

## In scope

- Identify official endpoints/API documentation, supported auth modes, token lifecycle and refresh, account/plan classification, model catalog and quota semantics.
- Compare relevant behavior in current official 9Router source and the approved supplier references; record exact paths/revisions/licenses before adapting code.
- Check region/eligibility, published terms, rate limits, model capabilities, streaming, tool support where documented, and permitted automation/reuse.
- Specify adapter shape, configuration, errors, security/redaction, tests, and a real short inference acceptance plan.
- Make a documented go/no-go recommendation based on current evidence.

## Out of scope

- Coding the adapter in this session.
- Assuming free/no-key access, unlimited quota, or OAuth availability from branding or third-party examples.
- Copying a supplier implementation without provenance/license and security review.

## Acceptance criteria

- [ ] Official sources, URLs, access dates, relevant source revisions/paths, and licenses are recorded.
- [ ] Authentication, refresh/expiry, plan/cost class, quota, region, model catalog and capabilities are described with evidence or explicitly marked unknown.
- [ ] No unsupported/private access path or credential-extraction shortcut is proposed.
- [ ] Implementation spec includes focused unit/integration tests and real short inference criteria.
- [ ] Explicit go/no-go decision is logged; if any critical support/terms point is unverified, S14 remains blocked.

## Session report

Not started. S14 may implement only the specific documented path that passes this gate.
