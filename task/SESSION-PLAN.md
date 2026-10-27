# BlackRouter — Session-Based Task Plan

**Source of truth:** `goals.md` on `main` (scope `BR-SCOPE-1.1`, 2026-10-27).  
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

## Phase A — PR #2 / MUST baseline

These tasks block provider implementation and SHOULD work. Complete in order unless a task is explicitly marked as dependent on external runtime access.

| ID | Status | Single-session outcome | Exit evidence |
|---|---|---|---|
| S01 | [/] | Instrument the internal CONNECT `ClientRequest` lifecycle and determine cleanup ownership/order. | Trace distinguishes agent-first and outer-request-first destruction; diagnostic-only instrumentation is identified for removal. |
| S02 | [ ] | Implement the smallest CONNECT cleanup/timeout fix supported by S01 evidence. | Deterministic regression tests prove bounded timeout and client-side request/socket cleanup; no unrelated transport changes. |
| S03 | [ ] | Validate downstream cancellation and request lifecycle independently from CONNECT timeout. | Deterministic local-upstream test proves cancellation reaches the owned upstream resources and completes within a bound. |
| S04 | [ ] | Audit direct, HTTP forward-proxy, and relay egress behavior. | Separate tests prove selected proxy/relay failures never silently switch to direct egress and preserve actionable status/body when no safe route remains. |
| S05 | [ ] | Audit streaming and non-streaming response contract, errors, first-byte keepalive, and status/body propagation. | Targeted tests cover normal and failure paths; gaps are documented rather than inferred. |
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

## Phase C — RTK token saver (SHOULD; gated by Phase A)

| ID | Status | Single-session outcome | Exit evidence |
|---|---|---|---|
| S19 | [ ] | Audit RTK port against pinned official source and compatibility exports. | Provenance, public API/call signatures, and behavior gaps documented. |
| S20 | [ ] | Add/repair RTK filter regressions for git/search/files/build/repeated and large output. | Tests preserve exit status, paths, line numbers, meaningful diffs and downstream-useful context. |
| S21 | [ ] | Measure RTK impact and finalize independent configuration/debuggability. | Repeatable benchmark methodology and results; no unsupported universal savings claim. |

Caveman and I Have ADHD remain wishlist items under the frozen scope. They are not scheduled sessions unless a separate scope change promotes them.

## Phase D — Proxy pool operations (SHOULD; overlap with Phase A only for MUST defects)

| ID | Status | Single-session outcome | Exit evidence |
|---|---|---|---|
| S22 | [ ] | Audit pool-selection strategy, health state, cooldown and recovery behavior. | State transitions and retry eligibility mapped to tests. |
| S23 | [ ] | Add regression coverage for unavailable relays, invalid proxy config, all pools unhealthy and cooldown expiry. | Failures are bounded/actionable; no egress-policy bypass or infinite retry. |
| S24 | [ ] | Validate proxy-pool panel controls/status against actual runtime state. | UI states and persistence match service behavior; secrets remain masked. |

## Phase E — Native OpenChamber panel (SHOULD; gated by Phase A)

| ID | Status | Single-session outcome | Exit evidence |
|---|---|---|---|
| S25 | [ ] | Validate panel redesign in the supported OpenChamber host and audit responsive/accessibility behavior. | Actual host result plus keyboard/focus, theme, reduced-motion and narrow-panel findings. |
| S26 | [ ] | Audit loading/empty/success/warning/error states and model/router workflows. | State-by-state checklist and tests; no false success or duplicate host settings. |
| S27 | [ ] | Verify panel persistence, secret masking and source-to-bundle reproducibility. | Reload/persistence evidence and generated bundle diff review. |

## Phase F — Release hardening

| ID | Status | Single-session outcome | Exit evidence |
|---|---|---|---|
| S28 | [ ] | Run final security, configuration, documentation and provenance review. | README/changelog only describe verified behavior; known limits and recovery steps are documented. |
| S29 | [ ] | Run release acceptance matrix across endpoint formats and direct/proxy/relay paths. | Current-head CI and runtime matrix are complete or explicit blockers remain. |
| S30 | [ ] | Produce release/merge decision with evidence and unresolved-risk list. | Definition of Done checked; no unexplained CI failures, stale bundles, or unsupported provider claims. |

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
