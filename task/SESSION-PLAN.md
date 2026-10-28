# BlackRouter — Session-Based Task Plan

**Source of truth:** `goals.md` on `main` (scope `BR-SCOPE-1.2`, 2026-10-27).  
**Rule:** one task ID equals one ChatGPT work session. Do not start the next task until the current task has a result, evidence, and a task-log update. This plan organizes work; it does not promote COULD/WON'T items or override MUST-first gates.

## How each session runs

1. Read this plan, `goals.md`, the active task card, and the latest repository/CI state.
2. Work only on the active task's scope. Do not bundle unrelated cleanup or feature work.
3. Add/update regression tests for behavior changes; never weaken tests to make CI green.
4. Record files, commit SHA, commands/CI evidence, results, blockers, and the next task in `task/PR-2-stabilize-validation.md`.
5. Mark a task complete only when its exit criteria are evidenced. A green CI run does not prove live OpenChamber/provider acceptance.
6. If new evidence changes the plan, update this index and task card before implementation. Do not claim unverified behavior.

## Task status

- `[x]` Complete with evidence
- `[/]` Active
- `[ ]` Not started
- `[!]` Blocked / decision required

## Detailed task cards

- [S01 — CONNECT ClientRequest lifecycle](sessions/S01-connect-clientrequest-lifecycle.md) — complete (diagnostic; production fix remains in S02).
- [S02 — CONNECT cleanup and timeout fix](sessions/S02-connect-cleanup-timeout-fix.md) — complete; timeout, HTTP 407, and agent-destroy regressions pass in CI.
- [S03 — Downstream cancellation lifecycle](sessions/S03-downstream-cancellation.md) — complete; upstream socket/stream cancellation and normal completion pass CI.
- [S04 — Egress policy audit](sessions/S04-egress-policy-audit.md) — complete; transport failure, all-pools-cooling-down, and diagnostic redaction regressions pass CI run 40628998383.
- [S05 — Response and streaming contract audit](sessions/S05-response-stream-contract-audit.md) — active/incomplete; CI run 40630642428 passed type-check, 166 tests, and build; deterministic upstream-abrupt-close coverage remains open.
- [S06 — Native OpenCode behavior and model routing audit](sessions/S06-opencode-native-behavior-audit.md) — prepared; not started.
- [S07 — Test Model real inference](sessions/S07-test-model-real-inference.md) — prepared; not started.
- [S08 — Security and secret-handling audit](sessions/S08-security-secret-handling-audit.md) — prepared; not started.
- [S09 — Current-head CI and generated-bundle gate](sessions/S09-reproducible-ci-bundle-gate.md) — prepared; not started.
- [S10 — OpenChamber/OpenCode runtime acceptance](sessions/S10-openchamber-opencode-runtime-acceptance.md) — prepared; not started.
- [S11 — MUST gate and PR #2 readiness](sessions/S11-must-gate-pr-readiness.md) — prepared; blocked until S01–S10 have recorded results.
- [S12 — Provider adapter/registry contract](sessions/S12-provider-adapter-registry-contract.md) — prepared; gated by S11.
- [S13 — CodeBuddy CN access research](sessions/S13-codebuddy-cn-access-research.md) — prepared; gated by S11 and S12.
- [S14 — CodeBuddy CN adapter](sessions/S14-codebuddy-cn-adapter.md) — prepared; gated by S13 GO decision.
- [S15 — WorkBuddy/TokenHub access review](sessions/S15-workbuddy-tokenhub-access.md) — prepared; gated by S11 and S12.
- [S16 — Freebuff feasibility/security/terms review](sessions/S16-freebuff-feasibility-review.md) — prepared; research only, gated by S11.
- [S17 — Freebuff adapter](sessions/S17-freebuff-adapter.md) — prepared; gated by a documented S16 GO decision.
- [S18 — Cross-provider compatibility and fallback audit](sessions/S18-cross-provider-compatibility-audit.md) — prepared; gated by S11 and the actual status of implemented providers.
- [S19 — Token-saver source/provenance audit](sessions/S19-token-saver-source-audit.md) — prepared; gated by S11.
- [S20 — Token-saver stage 1 (9router-go behavior)](sessions/S20-token-saver-stage1.md) — prepared; gated by S19 evidence and S11.
- [S21 — Token-saver stage 2: RTK](sessions/S21-token-saver-stage2-rtk.md) — prepared; gated by S11, S19 and S20.
- [S22 — Token-saver stage 3: Caveman](sessions/S22-token-saver-stage3-caveman.md) — prepared; gated by S11 and accepted S19–S21 evidence.
- [S23 — Token-saver stage 4: I Have ADHD](sessions/S23-token-saver-stage4-i-have-adhd.md) — prepared; gated by S11 and accepted S19–S22 evidence.
- [S24 — Token-saver combo integration and end-to-end validation](sessions/S24-token-saver-combo-e2e-validation.md) — prepared; gated by S11 and accepted S19–S23 evidence.
- [S25 — Proxy pool selection, health, cooldown and recovery audit](sessions/S25-proxy-pool-selection-health-cooldown-audit.md) — prepared; Phase D SHOULD work gated by S11, except separately scoped MUST defects.
- [S26 — Proxy pool failure/cooldown/recovery regression coverage](sessions/S26-proxy-pool-regression-coverage.md) — prepared; gated by S11 and S25 findings.
- [S27 — Proxy pool panel runtime state](sessions/S27-proxy-pool-panel-runtime-state.md) — prepared; gated by S11 and S25–S26 evidence.
- [S28 — Panel responsive/accessibility validation](sessions/S28-panel-responsive-accessibility-validation.md) — prepared; gated by S11 and supported-host availability.
- [S29 — Panel workflow state audit](sessions/S29-panel-workflow-state-audit.md) — prepared; gated by S11.
- [S30 — Panel persistence, secret masking and bundle reproducibility](sessions/S30-panel-persistence-secret-bundle-audit.md) — prepared; gated by S11 and relevant S28–S29 findings.

Cards beyond S30 will be generated in later batches. Preparing a card does not start or complete that task; only the active task may be executed, and task status changes require evidence.

## Phase A — PR #2 / MUST baseline

These tasks block provider implementation and SHOULD work. Complete in order unless a task is explicitly marked as dependent on external runtime access.

| ID | Status | Single-session outcome | Exit evidence |
|---|---|---|---|
| S01 | [x] | Instrument the internal CONNECT `ClientRequest` lifecycle and determine cleanup ownership/order. | Trace distinguishes agent-first and outer-request-first destruction; diagnostic-only instrumentation is identified for removal. |
| S02 | [x] | Implement the smallest CONNECT cleanup/timeout fix supported by S01 evidence. | Deterministic regression tests prove bounded timeout and client-side request/socket cleanup; no unrelated transport changes. |
| S03 | [x] | Validate downstream cancellation and request lifecycle independently from CONNECT timeout. | Deterministic local-upstream test proves cancellation reaches the owned upstream resources and completes within a bound. |
| S04 | [x] | Audit direct, HTTP forward-proxy, and relay egress behavior. | Route matrix and regression tests prove no silent direct fallback and bounded/redacted no-route errors; CI 40628998383 passed type-check, 163 tests, and build. |
| S05 | [/] | Audit streaming and non-streaming response contract, errors, first-byte keepalive, and status/body propagation. | CI 40630642428 passed type-check, 166 tests, and build; upstream-abrupt-close after headers remains an explicit unresolved test gap. |
| S06 | [ ] | Audit model catalog, endpoint selection, native OpenCode headers/fingerprints, and session affinity. | Requirement-to-test matrix maps FR-M2/FR-M4 to concrete evidence; missing coverage is isolated. |
| S07 | [ ] | Verify Test Model sends a real short inference and reports the real result. | Test path is proven by code/tests and live evidence where runtime credentials/access are available; connectivity-only success is rejected. |
| S08 | [ ] | Complete security/secret-handling audit. | Loopback default, credential redaction, stored-secret preservation, logs/diagnostics and relay error surfaces reviewed with regression evidence. |
| S09 | [ ] | Run full reproducible CI gate on the current PR head and inspect generated bundles. | Current-head type-check, full tests, build, bundle diff review, and diagnostic-only code removal recorded. |
| S10 | [ ] | Verify OpenChamber host loading and a real OpenCode Zen Free inference. | Host version/environment, steps, result, and valid response evidence recorded; if unavailable, exact blocker remains open. |
| S11 | [ ] | Re-audit FR-M1–FR-M8 and decide PR #2 readiness. | Each MUST marked pass/fail/blocked with evidence; no MUST closed by assumption; merge only if all required gates pass. |

**Gate:** S11 must pass before Phase B begins. S10 may be blocked by unavailable runtime access, but the baseline must not be called complete while required runtime acceptance remains unverified.

## Phase B — Provider architecture and approved providers (SHOULD; gated by Phase A)

| ID | Status | Single-session outcome | Exit evidence |
|---|---|---|---|
| S12 | [ ] | Design and review the provider adapter/registry contract (FR-S3). | Contract defines identity, auth class, model catalog, capabilities, request/response translation, limits, errors, cancellation, and test seams without mixing provider identity with egress. |
| S13 | [ ] | Research CodeBuddy CN's current official access path and prepare an implementation spec. | Official source/date, license/provenance, auth/token lifecycle, catalog/quota semantics, terms and test plan recorded; no implementation until accepted. |
| S14 | [ ] | Implement CodeBuddy CN adapter only if S13 passes its gate. | Targeted adapter tests and real short inference evidence; auth/plan classification is truthful. |
| S15 | [ ] | Research and implement documented WorkBuddy/Tencent TokenHub access, with research and coding separated if scope requires more than one session. | Official endpoint/auth docs, region/model configuration, billing/limits, and adapter tests; no desktop cookie/session extraction. |
| S16 | [ ] | Run Freebuff feasibility/security/terms review; do not implement in the same session as the research decision. | Official supported access path, current terms, auth/privacy, region/usage limits, and go/no-go decision recorded. |
| S17 | [ ] | Implement Freebuff only if S16 proves a supported and permitted integration path. | Adapter acceptance tests and runtime evidence; otherwise document the blocker and leave unsupported. |
| S18 | [ ] | Run cross-provider compatibility and fallback regression audit. | Existing OpenCode Zen Free and custom OpenAI-compatible paths remain intact; catalog, streaming, tools where supported, expired auth, limits, cancellation and bounded fallback covered. |

## Phase C — Linear Token-Saver Combo (FR-S2; SHOULD; gated by Phase A)

The required sequence is fixed: **9router-go token-saver behavior → RTK → Caveman → I Have ADHD**. It is one combo with a single top-level enable/disable control, not four unrelated primary toggles. Each task below is a separate session; preserve stage boundaries for testing and debugging without changing the sequence.

| ID | Status | Single-session outcome | Exit evidence |
|---|---|---|---|
| S19 | [ ] | Audit the 9router-go token-saving behavior, RTK, Caveman and I Have ADHD sources and record provenance. | Exact upstream revisions/paths/licenses and intended behavior are documented; no wholesale 9router-go service port; I Have ADHD is not conflated with Ponytail. |
| S20 | [ ] | Specify the linear pipeline contract and implement stage 1: relevant 9router-go token-saver behavior. | Input/output contract, no-op/error semantics, source provenance and focused tests are recorded. |
| S21 | [ ] | Implement stage 2: RTK in the prescribed position after stage 1. | Filter regressions cover git/search/files/build/repeated/large output and preserve exit status, paths, line numbers, diffs and useful context. |
| S22 | [ ] | Implement stage 3: Caveman after RTK. | Behavior matches verified upstream intent; coding/debugging/multi-step tests preserve necessary steps, code and diagnostics. |
| S23 | [ ] | Implement stage 4: I Have ADHD after Caveman. | Scannable response behavior follows verified upstream intent without losing technical completeness or context. |
| S24 | [ ] | Integrate the four stages behind one combo toggle and validate end-to-end quality/token impact. | Fixed order is tested; safety/tool/code literals are preserved; before/after measurements are repeatable and no unsupported savings claims are made. |

## Phase D — Proxy pool operations (SHOULD; overlap with Phase A only for MUST defects)

| ID | Status | Single-session outcome | Exit evidence |
|---|---|---|---|
| S25 | [ ] | Audit pool-selection strategy, health state, cooldown and recovery behavior. | State transitions and retry eligibility mapped to tests. |
| S26 | [ ] | Add regression coverage for unavailable relays, invalid proxy config, all pools unhealthy and cooldown expiry. | Failures are bounded/actionable; no egress-policy bypass or infinite retry. |
| S27 | [ ] | Validate proxy-pool panel controls/status against actual runtime state. | UI states and persistence match service behavior; secrets remain masked. |

## Phase E — Native OpenChamber panel (SHOULD; gated by Phase A)

| ID | Status | Single-session outcome | Exit evidence |
|---|---|---|---|
| S28 | [ ] | Validate panel redesign in the supported OpenChamber host and audit responsive/accessibility behavior. | Actual host result plus keyboard/focus, theme, reduced-motion and narrow-panel findings. |
| S29 | [ ] | Audit loading/empty/success/warning/error states and model/router workflows. | State-by-state checklist and tests; no false success or duplicate host settings. |
| S30 | [ ] | Verify panel persistence, secret masking and source-to-bundle reproducibility. | Reload/persistence evidence and generated bundle diff review. |

## Phase F — Release hardening

| ID | Status | Single-session outcome | Exit evidence |
|---|---|---|---|
| [S31](sessions/S31-final-security-config-docs-provenance-review.md) | [ ] | Run final security, configuration, documentation and provenance review. | README/changelog only describe verified behavior; known limits and recovery steps are documented. |
| [S32](sessions/S32-release-acceptance-endpoint-egress-matrix.md) | [ ] | Run release acceptance matrix across endpoint formats and direct/proxy/relay paths. | Current-head CI and runtime matrix are complete or explicit blockers remain. |
| [S33](sessions/S33-release-merge-readiness-decision.md) | [ ] | Produce release/merge decision with evidence and unresolved-risk list. | Definition of Done checked; no unexplained CI failures, stale bundles, or unsupported provider claims. |

## Session completion record template

Append one record to `task/PR-2-stabilize-validation.md` per session:

- **Session/task ID:**
- **Goal and scope:**
- **Changes/files:**
- **Validation/evidence:**
- **Result:** complete / blocked / incomplete
- **Open risks or decisions:**
- **Next task ID:**

Never mark future sessions complete in advance. Split any task that cannot meet its exit criteria in one focused session rather than combining unrelated work.
