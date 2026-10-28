# Session S10 — OpenChamber Host and OpenCode Zen Free Runtime Acceptance

**Status:** Not started  
**Scope source:** `goals.md` on `main`, `BR-SCOPE-1.2`  
**Related requirements:** FR-M1, FR-M3, FR-M4, FR-M8  
**Dependency:** S09 must identify a current candidate head and its CI result.  
**Tracking log:** `task/PR-2-stabilize-validation.md`

## Objective

Verify the extension in a supported OpenChamber runtime and complete a real short OpenCode Zen Free inference through BlackRouter, while recording the environment and actual observed results.

## Entry gate

- Read the S09 result and verify the exact candidate commit.
- Confirm a suitable OpenChamber/OpenCode runtime and authorized network/provider access are available.
- Never claim a live smoke test from source inspection, unit tests, or a green CI run.

## In scope

- Install/load the extension using the supported host mechanism and verify service startup.
- Confirm the local gateway uses the expected loopback endpoint and does not alter unrelated OpenCode configuration.
- Submit a real short OpenCode Zen Free inference through BlackRouter.
- Where environment permits, smoke-test configured direct, HTTP forward-proxy and relay paths separately, including a safe failure case proving no silent direct-egress bypass.
- Record host/runtime versions, operating environment, exact steps, request/result class and relevant redacted logs.

## Out of scope

- Provider expansion or new account/OAuth flows.
- Exposing API keys, tokens, proxy credentials, private prompts or sensitive response content in task documentation.
- Treating a mocked response or connectivity-only check as inference success.

## Acceptance criteria

- [ ] Extension loads in a supported OpenChamber host and service startup is observed.
- [ ] A real OpenCode Zen Free inference returns a valid response through BlackRouter.
- [ ] Direct/proxy/relay smoke results are separately recorded where those modes are configured and available.
- [ ] Failures, unavailable credentials, host/runtime constraints or inaccessible networks are stated precisely; unavailable tests remain blocked, not passed.
- [ ] Evidence is redacted and reproducible enough for review.
- [ ] Task log records evidence, commit SHA, CI and next task S11.

## Session report

Not started. Do not mark complete while required runtime acceptance is unverified.
