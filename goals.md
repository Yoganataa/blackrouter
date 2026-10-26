# BlackRouter — Project Goals

## 1. Vision

BlackRouter is a lightweight, OpenChamber-integrated AI gateway that brings useful capabilities from official 9router into the OpenChamber workflow. It prioritizes free AI models and providers that do not require a user-supplied API key, while providing reliable routing, token-saving options, and proxy pools.

Prioritize compatibility, reliability, maintainability, and a usable OpenChamber panel over feature-count parity at any cost.

## 2. Reference Repositories

- **Main product and implementation target:** [Yoganataa/blackrouter](https://github.com/Yoganataa/blackrouter)
- **Primary behavioral and feature reference:** [decolua/9router](https://github.com/decolua/9router)
- **Lightweight implementation reference:** [luqman-v1/9router-go](https://github.com/luqman-v1/9router-go)

Official 9router is the source of truth for intended feature behavior and useful product capabilities. Check its current code, issues, and relevant PRs before implementing or changing behavior. Use 9router-go as a reference for small, efficient gateway patterns—not as an application to port wholesale.

Verify compatibility, licenses, and attribution requirements before adapting code. Prefer focused adaptations and documented interfaces over wholesale copying.

## 3. Non-Negotiable Architecture Principles

1. BlackRouter remains an OpenChamber extension/panel with a local gateway, not a separate full-sized 9router clone.
2. Follow official 9router's useful backend behavior, implementing applicable capabilities in BlackRouter's existing stack and architecture.
3. Use 9router-go only for small, suitable implementation patterns that improve simplicity or performance. Do not port the entire Go project.
4. Do not port every 9router feature. Select features based on user value, technical fit, maintainability, and OpenChamber constraints.
5. Keep the gateway independent from panel rendering and expose a stable OpenAI-compatible API.
6. Preserve working behavior. Map callers, settings, tests, and compatibility requirements before replacing code.
7. Require a clear user benefit and appropriate tests for each feature. Do not pursue feature parity as a checklist alone.

## 4. Product Goals

### 4.1 Free and No-User-API-Key Providers

- Make free providers and providers that do not require users to supply an API key the primary experience.
- Use verifiable, current upstream availability for provider/model catalogs wherever possible; avoid stale hard-coded assumptions.
- Clearly distinguish providers requiring no user-supplied key, providers requiring credentials or OAuth, and optional custom OpenAI-compatible upstreams.
- Represent availability, pricing/usage limitations, model capabilities, and authentication requirements accurately. Free does not mean unlimited or permanently available.
- Handle provider outages, quota limits, rate limits, and upstream format differences without misrepresenting results.
- Keep credential-based custom providers optional rather than making them a prerequisite for the main workflow.

### 4.2 OpenChamber UI/UX

- Make the panel's visual hierarchy, terminology, workflows, and information architecture as close to 9router as practical.
- Adapt the design to OpenChamber's extension API, panel dimensions, navigation, styling system, and lifecycle constraints. Do not force a standalone web app into the extension.
- Prioritize common tasks: browse providers/models, configure routing, test models, manage proxy pools, configure token saving, and diagnose errors.
- Prefer OpenChamber-native components and patterns. Avoid duplicating global settings or creating conflicting navigation.
- Provide loading, empty, success, warning, error, and disabled states. Make destructive and credential-related actions explicit.
- Keep the panel responsive and accessible; visual polish must not compromise gateway functionality.

### 4.3 Reliability and Compatibility

- Preserve and test BlackRouter's OpenAI-compatible endpoints, including model discovery, chat completions, streaming SSE, and non-streaming responses.
- Correctly map requests and responses for upstreams with different APIs or formats.
- Implement predictable timeouts, cancellation, bounded retries, and fallback rules. Do not retry non-retryable failures indiscriminately.
- Respect upstream retry timing such as Retry-After when available. Avoid retry storms and duplicate requests.
- Expose actionable errors without leaking credentials, private prompts, or sensitive upstream data.
- Protect local settings and secrets; redact credentials from logs and panel state.

## 5. Phased Roadmap

Work in phases, in order. Implement, test, and review each phase before expanding into the next. Keep pull requests small enough to review and roll back independently.

### Phase 0 — Audit and Baseline

- [ ] Map the current codebase, extension lifecycle, gateway entry points, settings, provider catalog, routing logic, token-saving code, and proxy pools.
- [ ] Record the current API contract and supported OpenChamber capabilities.
- [ ] Compare relevant official 9router features and current PRs/issues against BlackRouter.
- [ ] Inspect 9router-go for focused patterns that could simplify or improve the gateway.
- [ ] Create a feature-gap matrix covering feature, upstream reference, user value, compatibility, risk, priority, and acceptance test.
- [ ] Establish baseline tests before refactoring.
- [ ] Verify license and attribution requirements before reusing code.

**Exit criteria:** architecture and gaps are documented, and the next implementation task is clear without requiring a broad rewrite.

### Phase 1 — Core Gateway

This is the foundation. Do not start optional token-saving profiles or advanced pool strategies until the core is dependable.

- [ ] Stabilize gateway startup, shutdown, configuration, and health checks.
- [ ] Maintain the OpenAI-compatible API contract used by OpenChamber and compatible clients.
- [ ] Implement and verify provider adapters and normalized model metadata.
- [ ] Support streaming and non-streaming responses, cancellation, timeouts, and upstream errors.
- [ ] Add provider/model selection and deterministic routing.
- [ ] Add bounded retries and fallback for eligible failures, including rate limits and temporary upstream failures.
- [ ] Prevent retry loops and avoid switching providers when doing so could duplicate unsafe or non-idempotent operations.
- [ ] Make settings validation and migration safe for existing installations.
- [ ] Add tests for routing, streaming, errors, fallback, configuration, and secret redaction.
- [ ] Document the local endpoint, authentication, configuration, and troubleshooting.

**Exit criteria:** OpenChamber can use the gateway reliably with supported providers, and the core API contract is covered by automated tests.

### Phase 2 — Free Provider Catalog and Connections

- [ ] Make free and no-user-API-key providers easy to discover and test.
- [ ] Separate provider definitions, authentication requirements, model capabilities, and request adaptation.
- [ ] Refresh dynamic catalogs safely and handle unavailable or malformed catalog responses.
- [ ] Represent context/output limits, vision, tool calling, and reasoning capabilities only when supported by trustworthy metadata.
- [ ] Add provider/model health and useful failure messages where feasible.
- [ ] Keep custom upstream configuration optional and preserve a simple default path.

**Exit criteria:** users can identify and select eligible providers/models without confusing credential requirements or stale capability claims.

### Phase 3 — Token Saver Framework

Build token saving as a modular, configurable layer with independently testable transformations. A profile must not silently alter code semantics, tool arguments, safety-relevant instructions, or required context.

#### 3.1 RTK (Repetitive Tool Knowledge)

- [ ] Review current official 9router RTK behavior and relevant 9router-go implementation.
- [ ] Identify repetitive, high-volume tool outputs that can be compacted safely, such as git status, git diff, search results, and large command output.
- [ ] Preserve meaningful changes, errors, exit status, paths, line references, and details required for the next action.
- [ ] Make transformations bounded and deterministic where possible.
- [ ] Provide an off switch and a way to inspect/debug transformed output.
- [ ] Test representative outputs, including cases where aggressive compaction could remove important information.

#### 3.2 Caveman

- [ ] Implement a concise-response profile inspired by the corresponding official 9router feature.
- [ ] Reduce verbosity and unnecessary explanation without removing required steps, constraints, code, diagnostics, or safety-critical information.
- [ ] Keep it configurable and disabled by default until behavior is validated.
- [ ] Test technical tasks, code generation, debugging, and multi-step instructions for completeness.

#### 3.3 I Have ADHD

- [ ] Research and verify the exact behavior and intent of the corresponding official 9router feature before implementation.
- [ ] Treat it as a separate response/prompt profile; do not assume it is identical to Caveman or RTK.
- [ ] Aim for scannable, actionable output with clear priorities and limited cognitive overhead while preserving technical correctness and context.
- [ ] Allow independent enable/disable controls and document the effect.
- [ ] Add examples and tests demonstrating that important details are not omitted.

#### Shared token-saver requirements

- [ ] Provide independent toggles and clear status for each feature.
- [ ] Define a stable processing order and avoid conflicting transformations.
- [ ] Never rewrite secrets, credentials, tool identifiers, file paths, code literals, or structured tool arguments in ways that break behavior.
- [ ] Do not claim a fixed percentage of savings unless measured on representative workloads.
- [ ] Add before/after tests and, where feasible, report estimated token savings without exposing sensitive content.

**Exit criteria:** each profile can be tested and disabled independently, and default behavior remains compatible with existing client workflows.

### Phase 4 — Proxy Pools

- [ ] Review official 9router's current proxy-pool implementation and behavior before adapting it.
- [ ] Keep pool logic modular and separate from provider adapters and UI components.
- [ ] Support proxy types justified by BlackRouter's implementation and deployment constraints; do not add types solely for parity.
- [ ] Provide configurable pool membership, health/status, selection strategy, and safe fallback.
- [ ] Support strategies such as single, round-robin, and random only where they fit the configured pool.
- [ ] Use bounded cooldowns for rate-limited or unhealthy routes; honor upstream retry timing when available.
- [ ] Make sticky routing/session affinity explicit and ensure it does not defeat cooldown or health protections.
- [ ] Prevent concurrent requests from creating retry storms or repeatedly selecting known-unhealthy routes.
- [ ] Validate deployment configuration and credentials; redact tokens from logs and UI.
- [ ] Show useful pool status and failure reasons in the OpenChamber panel.
- [ ] Test unavailable pools, all-pools-unhealthy states, cooldown expiry, cancellation, and recovery.

**Exit criteria:** configured pools route requests predictably, unhealthy routes are handled safely, and failures are visible and diagnosable.

### Phase 5 — OpenChamber Panel Parity and Polish

- [ ] Compare panel workflows with the current official 9router UI.
- [ ] Prioritize provider/model browsing, routing controls, token-saver settings, proxy-pool management, testing, and diagnostics.
- [ ] Recreate useful 9router interaction patterns within OpenChamber's extension constraints.
- [ ] Add clear state indicators and accessible controls.
- [ ] Verify persistence, reload behavior, and compatibility with OpenChamber updates.
- [ ] Remove duplicated, confusing, or unsupported controls.

**Exit criteria:** the panel feels coherent and familiar to 9router users while remaining native to OpenChamber.

### Phase 6 — Hardening and Release

- [ ] Run unit tests, integration tests, type checks, and build checks.
- [ ] Test the main supported OpenChamber workflow end to end.
- [ ] Test provider outages, rate limits, malformed responses, slow streams, cancellation, and proxy-pool failures.
- [ ] Audit secret handling, local binding, authentication, logging, and configuration permissions.
- [ ] Document limitations, provider authentication requirements, known issues, and recovery steps.
- [ ] Update the README and changelog to describe only implemented and verified behavior.
- [ ] Release only when core regressions are resolved and acceptance criteria are met.

## 6. Feature Selection and Priorities

For each candidate feature from 9router or 9router-go, ask:

1. Does it materially help BlackRouter users?
2. Does it fit the OpenChamber extension and local-gateway model?
3. Can it be implemented without unnecessary architectural complexity?
4. Can it be tested and maintained in BlackRouter?
5. Does it depend on provider policies, credentials, or infrastructure that must be disclosed?
6. Are license and attribution requirements satisfied?

Priority order:

1. Core correctness and compatibility.
2. Free/no-user-API-key provider experience.
3. Reliability, routing, fallback, and diagnostics.
4. RTK and the two response profiles.
5. Proxy pools and their management UI.
6. Further UI parity and lower-priority features.

## 7. Engineering and Security Requirements

- Keep changes incremental and avoid unrelated refactors.
- Follow the repository's existing language, conventions, dependencies, and test tooling unless a documented reason justifies a change.
- Add regression tests with each behavior change.
- Never store credentials in source code, commit secrets, or expose credentials through logs, errors, panel state, or diagnostics.
- Bind the local gateway to loopback by default. Broader network exposure must be explicit and protected.
- Treat provider responses and model catalogs as untrusted input.
- Avoid infinite retry/fallback loops, unbounded buffering, and unbounded concurrency.
- Do not bypass provider authentication, access controls, or usage restrictions.
- Keep user prompts and model outputs out of telemetry by default.
- Document meaningful deviations from official 9router behavior.

## 8. Definition of Done

A feature is done only when all applicable conditions are met:

- [ ] Behavior and scope are documented.
- [ ] Implementation fits BlackRouter's architecture and OpenChamber constraints.
- [ ] Automated tests cover normal behavior and important failure cases.
- [ ] Existing core behavior and API compatibility have not regressed.
- [ ] Errors are actionable and secrets are redacted.
- [ ] The UI exposes accurate settings and states, where applicable.
- [ ] Documentation reflects actual implementation, not planned capabilities.
- [ ] Relevant upstream references and license obligations have been reviewed.

## 9. Working Rules for AI Agents and Contributors

Before making a change:

1. Read this file and the relevant repository instructions.
2. Inspect the current implementation and tests; do not assume the README describes every code path accurately.
3. Check relevant current files, issues, and PRs in official 9router. Use 9router-go as a focused implementation reference where appropriate.
4. State the smallest concrete change that advances the active phase.
5. Implement one coherent change at a time.
6. Run relevant tests and report what passed, failed, and remains unverified.
7. Update this roadmap only when progress is implemented and validated. Do not mark planned work complete based on untested code.

## 10. Out of Scope Unless Explicitly Approved

- Replacing BlackRouter with a full port of 9router.
- Porting the entire 9router-go application into BlackRouter.
- Building a standalone dashboard that duplicates OpenChamber.
- Adding provider integrations that do not fit the free/no-user-API-key priority without a clear use case.
- Adding complex infrastructure or dependencies without demonstrated benefit.
- Claiming provider availability, unlimited usage, token savings, or feature parity without verification.
