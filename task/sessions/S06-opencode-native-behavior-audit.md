# Session S06 — Native OpenCode Behavior and Model Routing Audit

**Status:** Complete  
**Scope source:** `goals.md` on `main`, `BR-SCOPE-1.2`  
**Related requirements:** FR-M2, FR-M4  
**Baseline PR head:** `7fb44705a880fa0ee40747d6989a093c49a7f576`  
**Tracking log:** `task/PR-2-stabilize-validation.md`

## Requirement-to-test matrix

| Requirement / behavior | Evidence in code/tests | Result / gap |
|---|---|---|
| OpenCode Zen model catalog endpoint | `service/upstream.test.ts`: `native provider executor resolves OpenCode v2 endpoints` asserts `https://opencode.ai/zen/v1/models`; `loads a complete catalog from a custom OpenAI-compatible upstream` covers generic `/models` fetch behavior | Covered at target construction / mocked fetch; live catalog refresh is not proven in this session. |
| Model-specific endpoint selection | `native provider executor resolves OpenCode v2 endpoints` covers Big Pickle → `/inference/v1/chat/completions`, Muse Spark → `/inference/v1/responses`, Union Alpha → `/inference/v1/messages`, and custom upstream → `/chat/completions` | Covered for these representative families; catalog-wide compatibility is not claimed. |
| Native request headers / CLI fingerprint | `uses the current OpenCode CLI fingerprint when refreshing the free catalog`; executor sets UA `opencode/latest/2.1.4/cli`, public bearer, client and project headers | New regression added in this session; CI run 40632366289 passed. |
| Session affinity | Executor emits `x-opencode-session`, `x-opencode-session-id`, `x-session-affinity`, `x-session-id`; new regression checks values match and repeated requests using the same valid session keep the same ID | New regression added in this session; cross-process persistence and live upstream acceptance are not tested. |
| Required OpenCode fingerprint tools / environment marker | `service/core/utils/opencodeFingerprint.js` documents canonical `read`/`shell` definitions and `<env>` marker; new regression asserts both tool names and marker are present in prepared body | New regression added in this session; exact upstream acceptance remains a runtime limitation. |
| Caller tool-name collision restoration | `service/opencode-protocol.test.ts` covers compatible `shell_client` collision normalization and unique aliasing when caller already defines the alias; `service/core/provider-adapter.js` infers/restores renamed names | Existing tests cover the demonstrated collision cases. |
| Responses/Messages stream translation | `service/opencode-protocol.test.ts` covers Responses SSE → Chat chunks and Messages conversion/restoration cases | Existing unit-level coverage; no live inference asserted. |
| Egress preservation for native endpoints | `service/upstream.test.ts`: `a proxy pool preserves the native provider endpoint in relay headers`, `a standard forward proxy (http) connects to native endpoint with tunnel agent`, and `respects explicit poolOverride while preserving the native endpoint`; S04 separately audits no silent direct fallback | Covered by local target/route tests; no live relay acceptance claimed. |

## Provenance and local delta

- `service/core/LICENSE` identifies the copied core's license as MIT, copyright decolua and contributors, 2024–2026.
- `service/core/executors/opencode.js` documents the OpenCode v2 CLI user-agent as `opencode/latest/2.1.4/cli` and notes the version date 2026-10-23. The same file documents session-affinity headers and model endpoint families.
- Local adapter: `service/core/provider-adapter.js` dispatches the native executor's prepared URL/headers/body into BlackRouter's own transport selection. It chooses registered `targetFormat`, with a Muse Spark predicate fallback, and restores caller tool names. `service/upstream.ts` owns direct/proxy/relay egress.
- Exact upstream Git commit/revision for the copied `service/core` snapshot is not established by the current source files or this audit. Do not claim a specific upstream revision; record as a provenance gap for release hardening.

## Scope and risks

- No production code changes are proposed by this audit; the current change is test-only.
- Unit tests and mocked fetches do not prove a live OpenCode Free inference, real current catalog, or actual upstream gate acceptance. S07 is the designated real-inference task where access is available.
- Preserve the S04 egress invariant: never copy native upstream retry logic that bypasses an explicitly configured proxy/relay.
- Do not begin SHOULD work before S11.

## Session report

**Status: Complete.** Mapped model routing, catalog request headers, native fingerprints, session affinity, tool-name collision behavior, protocol conversion and egress integration to concrete tests. Added a regression to `service/upstream.test.ts` for native OpenCode v2 headers, matching session-affinity headers, same-session continuity, fingerprint tools, and the `<env>` marker. GitHub Actions run `40632366289` passed type-check, **168 tests / 0 failures / 598 assertions across 15 files**, and build; guest bundles were already up to date. No production code changes were required. Exact upstream Git revision for the copied `service/core` snapshot remains unverified and is explicitly recorded as a provenance gap, not treated as completed provenance. Final test commit: `dbf88090d74f2a33d7158778029fb03cdc548706`. Next permitted task: S07 — Test Model real inference; live inference evidence is only claimed if runtime access is available. Do not start SHOULD work before S11.
