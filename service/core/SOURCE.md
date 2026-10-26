# Core source provenance

BlackRouter's backend core is assembled from selected native modules in
[decolua/9router](https://github.com/decolua/9router), pinned to:

`f39d8f07481ae8518e93175f0ecaaafa61573c6c`

This is intentionally a **scoped provider-core port**, not a copy of the upstream
application or dashboard. The original MIT license is retained in [LICENSE](./LICENSE). OpenChamber continues to own the UI and panel. BlackRouter
owns the OpenAI-compatible listener, relay/direct transport, local configuration,
and response-stream adapter.

## Native source files

The table records the source blobs at the pinned baseline. Two OpenCode files
now also contain selective compatibility fixes adapted from official follow-up
PRs; their current local blobs therefore differ from that baseline. Other listed
native files remain baseline copies unless called out in their own notes.

| Local path | Upstream path | Baseline blob | Follow-up patch |
|---|---|---|
| `executors/opencode.js` | `open-sse/executors/opencode.js` | `76b3145aa463d837dcd3d217a1ceeca58bb9430e` | [#5222](https://github.com/decolua/9router/pull/5222) |
| `utils/opencodeFingerprint.js` | `open-sse/utils/opencodeFingerprint.js` | `184bbe0542cb4698a34e67eec1f6e256a5aa0812` | [#5222](https://github.com/decolua/9router/pull/5222) |
| `utils/reasoningContentInjector.js` | `open-sse/utils/reasoningContentInjector.js` | `14fd27b74d26bae7471c611076a302fbf1fdd4e5` |
| `utils/sessionManager.js` | `open-sse/utils/sessionManager.js` | `4f701b88dbb16c264e64c3bdd9b3de0ba91b911c` | — |
| `providers/models/helpers.js` | `open-sse/providers/models/helpers.js` | `22891a0fb464845433c35ddc6c79b274b859cb17` | — |
| `providers/registry/opencode.js` | `open-sse/providers/registry/opencode.js` | `38cdacad04d29039a39a23c7489ef4508c1326f8` | — |
| `translator/formats.js` | `open-sse/translator/formats.js` | `89367d0071ab7574e93307dfabb272fec226ab6a` | — |
| `translator/formats/responsesApi.js` | `open-sse/translator/formats/responsesApi.js` | `5454f9f3f44f1d7fa428d2feae8e90f73f2a3e66` | — |
| `translator/schema/index.js` | `open-sse/translator/schema/index.js` | `be51a9be6498e8e640154fe283760e32da55be06` | — |
| `translator/schema/roles.js` | `open-sse/translator/schema/roles.js` | `1fe91a6d8a702cf159faa05fe858579fab7e457e` | — |
| `translator/schema/blocks.js` | `open-sse/translator/schema/blocks.js` | `45e9f1a676353cb262e2a00f30521b5b1fb6193f` | — |
| `translator/schema/finishReasons.js` | `open-sse/translator/schema/finishReasons.js` | `d0cc62447e64d461a0f6644cca6045a3f62acf44` | — |
| `translator/schema/streamEvents.js` | `open-sse/translator/schema/streamEvents.js` | `d7e3204fb0c175379fee8a5868f747b77bfe9229` | — |
| `translator/schema/defaults.js` | `open-sse/translator/schema/defaults.js` | `9601a473eb367dd5f68f2681ddd5e484f0b289ec` | — |
| `translator/request/openai-responses.js` | `open-sse/translator/request/openai-responses.js` | `5c719fd2658b36c5541c466b94c872329b52429e` | — |
| `translator/request/openai-to-claude.js` | `open-sse/translator/request/openai-to-claude.js` | `580debfecfa7a5cf852e18b0e13395817a66f497` | — |
| `translator/formats/maxTokens.js` | `open-sse/translator/formats/maxTokens.js` | `4d2cd2095770454f41d2ab88595fbf3ac3a5c454` | — |
| `translator/concerns/json.js` | `open-sse/translator/concerns/json.js` | `36c1b71b28e28ecac66797d7229902db9fbc2ad8` | — |


## Selected upstream follow-up fixes

The following official PR work was reviewed and selectively adapted for
BlackRouter's free OpenCode lane and Node-stream transport. Source heads and
original PR URLs are kept for auditability; upstream PR state may change after
this snapshot.

- [decolua/9router#5222](https://github.com/decolua/9router/pull/5222),
  source head `25878ce373e7e4f2b2143aaa72af7e4f20cd6c7a` (includes session follow-up `e1add8a0a350e25b58380e8486e5acc491bb61f1`):
  - align the synthetic OpenCode CLI User-Agent to `opencode/latest/2.1.4/cli`;
  - translate foreign conversation IDs to a valid current-time OpenCode session
    prefix and reuse that session for the same conversation/tool during its TTL;
  - preserve caller system instructions while adding the CLI `<env>` fingerprint
    for Chat, Responses, and Messages requests;
  - match platform-specific shell fingerprint wording and put the Messages API
    system instruction in top-level `system`, not a synthetic system role inside
    `messages`.
- [decolua/9router#5167](https://github.com/decolua/9router/pull/5167),
  source head `bf56c4b010d35277b76729dde2fb2eb05a0eb1d0`:
  adapt the first-byte SSE keepalive concept to the existing Node pipeline. It
  emits `: ping` comments only on successful SSE streaming responses while no
  upstream bytes have arrived, stops at the first byte, cleans up on stream
  close, and is configurable with `SSE_KEEPALIVE_MS` (default 15000; zero
  disables it). It is not applied to JSON or NDJSON responses.
- The free lane's endpoint routing, native response/tool-name restoration, and
  adaptive-thinking normalization remain in the selected executor/adapter path.
  Unrelated 9Router dashboard, auth, paid-provider, database, and provider-account
  features are intentionally not copied into this OpenChamber extension.


- [decolua/9router#5193](https://github.com/decolua/9router/pull/5193) (follow-up to #5149) was reviewed. BlackRouter's **Test Model** is deliberately a real, short inference request through the native executor—not the old synthetic `/zen/v1/models` connection probe. It keeps meaningful upstream error reporting; the catalog refresh remains separate and is tested with the current CLI-form User-Agent. This avoids copying the upstream dashboard's UI-specific “return green without a network call” trade-off into a model-test feature.

## Narrow integration adapters

These files are specific to the OpenChamber extension and deliberately form the
boundary around native provider behavior:

- `executors/base.js` delegates native URL selection, request transforms, and
  provider headers to the OpenChamber transport dispatch instead of importing
  9Router's unrelated generic credential/proxy stack.
- `provider-adapter.js` reads explicit target-format declarations from the native
  OpenCode provider registry, invokes the upstream translators and executor, and
  returns a request envelope for BlackRouter's direct, HTTP-proxy, or relay transport.
  Unlisted models use the same native Muse Spark predicate as the executor and
  otherwise retain its Chat default; the adapter does not add an independent
  family-routing table.
- `config/providers.js` narrows the native provider registry to OpenCode Free.
- `providers/capabilities.js`, `providers/thinkingLevels.js`,
  `providers/shared.js`, `config/appConstants.js`, and
  `config/runtimeConfig.js` expose the subset of native constants/capabilities
  required by this scoped provider.
- `translator/index.js` registers only the two upstream request translators used
  by the selected provider formats.
- `translator/concerns/image.js` and `translator/formats/gemini.js` expose the
  exact helper behavior required by the copied request translator.
- `../opencode-protocol.ts` is a response-only adapter: it converts native
  Responses/Messages SSE into the OpenAI Chat Completions stream expected by the
  OpenChamber client. It no longer builds request bodies or selects model endpoints.
- `provider-adapter.js` includes one Messages-format compatibility patch: the
  upstream executor adds fingerprint tool placeholders in Chat-shaped form on its
  non-Responses path. The adapter converts only those injected `read`/`shell`
  placeholders into Anthropic Messages tool definitions and carries their instruction
  into `system`; caller tools remain as produced by the native translator.

The actual request path is:

1. The OpenChamber-compatible listener validates the client request and optionally
   applies BlackRouter's token-saving profile.
2. The native provider adapter resolves a model's target format from the upstream
   registry/family helper.
3. The native translator and `OpenCodeExecutor` prepare the upstream body, identity,
   endpoint, and headers.
4. BlackRouter's transport layer sends that prepared request directly, through an
   HTTP CONNECT proxy, or via a configured relay.
5. The response adapter converts Responses/Messages streaming to the client format.

## Updating

1. Choose a new upstream commit and inspect changes to every native file listed above.
2. Copy the upstream file contents without local edits; update the blob table.
3. Change adapters only if an upstream API or the OpenChamber transport boundary
   requires it; document any behavior difference.
4. Run `bun test`, `bun run type-check`, and `bun run build`. The checked-in
   `service/main.js` must be regenerated from `service/main.ts` before merging.
5. Inspect the request path to make sure no duplicate local provider transform has
   become active again.

The RTK source and its separate provenance table are recorded in
[`rtk/SOURCE.md`](./rtk/SOURCE.md).


## Validation additions from #5222

- Added focused Bun tests in `service/zen.test.ts` for the native environment marker, non-duplication, canonical tool fingerprint, and current-time stable session translation.
- The native executor and fingerprint helper were copied from official PR head `25878ce373e7e4f2b2143aaa72af7e4f20cd6c7a`, which includes the session-freshness follow-up commit `e1add8a0a350e25b58380e8486e5acc491bb61f1`.
- The upstream fingerprint helper remains byte-for-byte identical to that selected source snapshot. The OpenChamber adapter remains local and is intentionally not replaced by the upstream dashboard/server stack.
- The checked-in bundle still needs to be regenerated from the source build; this environment does not have Bun available, so bundle parity and live OpenChamber UI/runtime checks are not claimed.
