# Core source provenance

BlackRouter's backend core is assembled from selected native modules in
[decolua/9router](https://github.com/decolua/9router), pinned to:

\`f39d8f07481ae8518e93175f0ecaaafa61573c6c\`

This is intentionally a **scoped provider-core port**, not a copy of the 9Router
application or dashboard. OpenChamber continues to own the UI and panel. BlackRouter
owns the OpenAI-compatible listener, relay/direct transport, local configuration,
and response-stream adapter.

## Native source files

The following files were copied from the pinned revision without editing their
contents. Blob ids are recorded so future updates can compare the exact source.

| Local path | Upstream path | Blob |
|---|---|---|
| \`executors/opencode.js\` | \`open-sse/executors/opencode.js\` | \`76b3145aa463d837dcd3d217a1ceeca58bb9430e\` |
| \`utils/opencodeFingerprint.js\` | \`open-sse/utils/opencodeFingerprint.js\` | \`184bbe0542cb4698a34e67eec1f6e256a5aa0812\` |
| \`utils/reasoningContentInjector.js\` | \`open-sse/utils/reasoningContentInjector.js\` | \`14fd27b74d26bae7471c611076a302fbf1fdd4e5\` |
| \`utils/sessionManager.js\` | \`open-sse/utils/sessionManager.js\` | \`4f701b88dbb16c264e64c3bdd9b3de0ba91b911c\` |
| \`providers/models/helpers.js\` | \`open-sse/providers/models/helpers.js\` | \`22891a0fb464845433c35ddc6c79b274b859cb17\` |
| \`providers/registry/opencode.js\` | \`open-sse/providers/registry/opencode.js\` | \`38cdacad04d29039a39a23c7489ef4508c1326f8\` |
| \`translator/formats.js\` | \`open-sse/translator/formats.js\` | \`89367d0071ab7574e93307dfabb272fec226ab6a\` |
| \`translator/formats/responsesApi.js\` | \`open-sse/translator/formats/responsesApi.js\` | \`5454f9f3f44f1d7fa428d2feae8e90f73f2a3e66\` |
| \`translator/schema/index.js\` | \`open-sse/translator/schema/index.js\` | \`be51a9be6498e8e640154fe283760e32da55be06\` |
| \`translator/schema/roles.js\` | \`open-sse/translator/schema/roles.js\` | \`1fe91a6d8a702cf159faa05fe858579fab7e457e\` |
| \`translator/schema/blocks.js\` | \`open-sse/translator/schema/blocks.js\` | \`45e9f1a676353cb262e2a00f30521b5b1fb6193f\` |
| \`translator/schema/finishReasons.js\` | \`open-sse/translator/schema/finishReasons.js\` | \`d0cc62447e64d461a0f6644cca6045a3f62acf44\` |
| \`translator/schema/streamEvents.js\` | \`open-sse/translator/schema/streamEvents.js\` | \`d7e3204fb0c175379fee8a5868f747b77bfe9229\` |
| \`translator/schema/defaults.js\` | \`open-sse/translator/schema/defaults.js\` | \`9601a473eb367dd5f68f2681ddd5e484f0b289ec\` |
| \`translator/request/openai-responses.js\` | \`open-sse/translator/request/openai-responses.js\` | \`5c719fd2658b36c5541c466b94c872329b52429e\` |
| \`translator/request/openai-to-claude.js\` | \`open-sse/translator/request/openai-to-claude.js\` | \`580debfecfa7a5cf852e18b0e13395817a66f497\` |
| \`translator/formats/maxTokens.js\` | \`open-sse/translator/formats/maxTokens.js\` | \`4d2cd2095770454f41d2ab88595fbf3ac3a5c454\` |
| \`translator/concerns/json.js\` | \`open-sse/translator/concerns/json.js\` | \`36c1b71b28e28ecac66797d7229902db9fbc2ad8\` |

## Narrow integration adapters

These files are specific to the OpenChamber extension and deliberately form the
boundary around native provider behavior:

- \`executors/base.js\` delegates native URL selection, request transforms, and
  provider headers to the OpenChamber transport dispatch instead of importing
  9Router's unrelated generic credential/proxy stack.
- \`provider-adapter.js\` selects the target format from the native provider
  registry/family resolver, invokes the upstream translators and executor, and
  returns a request envelope for BlackRouter's direct, HTTP-proxy, or relay transport.
- \`config/providers.js\` narrows the native provider registry to OpenCode Free.
- \`providers/capabilities.js\`, \`providers/thinkingLevels.js\`,
  \`providers/shared.js\`, \`config/appConstants.js\`, and
  \`config/runtimeConfig.js\` expose the subset of native constants/capabilities
  required by this scoped provider.
- \`translator/index.js\` registers only the two upstream request translators used
  by the selected provider formats.
- \`translator/concerns/image.js\` and \`translator/formats/gemini.js\` expose the
  exact helper behavior required by the copied request translator.
- \`../opencode-protocol.ts\` is a response-only adapter: it converts native
  Responses/Messages SSE into the OpenAI Chat Completions stream expected by the
  OpenChamber client. It no longer builds request bodies or selects model endpoints.

The actual request path is:

1. The OpenChamber-compatible listener validates the client request and optionally
   applies BlackRouter's token-saving profile.
2. The native provider adapter resolves a model's target format from the upstream
   registry/family helper.
3. The native translator and \`OpenCodeExecutor\` prepare the upstream body, identity,
   endpoint, and headers.
4. BlackRouter's transport layer sends that prepared request directly, through an
   HTTP CONNECT proxy, or via a configured relay.
5. The response adapter converts Responses/Messages streaming to the client format.

## Updating

1. Choose a new upstream commit and inspect changes to every native file listed above.
2. Copy the upstream file contents without local edits; update the blob table.
3. Change adapters only if an upstream API or the OpenChamber transport boundary
   requires it; document any behavior difference.
4. Run \`bun test\`, \`bun run type-check\`, and \`bun run build\`. The checked-in
   \`service/main.js\` must be regenerated from \`service/main.ts\` before merging.
5. Inspect the request path to make sure no duplicate local provider transform has
   become active again.

The RTK source and its separate provenance table are recorded in
[\`rtk/SOURCE.md\`](./rtk/SOURCE.md).
