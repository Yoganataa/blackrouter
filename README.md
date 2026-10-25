# BlackRouter

Local, OpenAI-compatible proxy gateway for OpenCode Free models with proxy pools, dynamic routing, RTK token savings, and automatic OpenCode provider registration.

```
OpenCode / OpenChamber / any OpenAI client
        │  Authorization: Bearer sk-…
        ▼
http://127.0.0.1:20128/v1        ← BlackRouter (loopback on this machine)
        │  direct, HTTP forward proxy, or relay pool (Cloudflare, Vercel, Deno, Netlify)
        ▼
https://opencode.ai/inference/v1/chat/completions (OpenCode Free models)
```

## Features

- **OpenAI Compatible Endpoint**: Binds `http://127.0.0.1:20128/v1` with standard `/v1/models` and `/v1/chat/completions` (streaming SSE & folded JSON).
- **Official OpenCode Free Integration**: Accurately cloaks requests with OpenCode CLI v2 client headers, fingerprint tools (`read` and `shell`), and conversation session affinity.
- **Dynamic v2 Endpoint Routing**:
  - Chat completions route to `/inference/v1/chat/completions`
  - Muse Spark models route to `/inference/v1/responses`
  - Union Alpha models route to `/inference/v1/messages`
  - Models catalog routes to `/zen/v1/models`
- **Proxy Pools & Strategy Selector**:
  - Supports 5 proxy types: Standard HTTP/HTTPS forward proxies (CONNECT tunneling) and serverless relays (Cloudflare Workers, Vercel Edge, Deno Deploy, Netlify Functions).
  - Routing strategies: `single`, `round-robin` (with configurable `stickyLimit`), and `random`.
  - Automatic 429 rate-limit cooldown: rate-limited pools enter a 5-minute cooldown and router automatically shifts traffic to clean pools.
  - One-click deployment from panel via API tokens.
- **RTK (Repetitive Tool Knowledge) Token Saver**:
  - Automatically compacts `git diff`, `git status`, `grep`, and large command outputs before upstream forwarding.
  - Saves 20% to 40% tokens per coding loop without losing vital context.
- **Automatic Provider Registration**:
  - One-click register into `~/.config/opencode/opencode.json` with dynamic context limits, capability flags (vision, tools), and reasoning effort variants (`low`, `medium`, `high`, `xhigh`, `max`).
- **OpenChamber Extension**:
  - Provides a full UI panel and status bar section in OpenChamber.

## Installation & Usage

### As an OpenChamber Extension

1. Clone or copy this folder to your machine.
2. In OpenChamber, navigate to **Settings → Extensions**.
3. Add the absolute path to this folder.
4. Open the **BlackRouter** panel from the sidebar to manage router settings, test models, and deploy relays.

### Standalone Development & Testing

```bash
# Install dependencies
bun install

# Run tests
bun test

# Type check
bun run type-check

# Rebuild bundled guest assets
bun run build
```

## Endpoint Specification

- **Base URL**: `http://127.0.0.1:20128/v1` (configurable in Router settings)
- **Authentication**: `Authorization: Bearer <key>` or `x-api-key: <key>`
- **Catalog**: `GET /v1/models`
- **Completions**: `POST /v1/chat/completions`
- **Healthcheck**: `GET /healthz`

Settings and keys are stored locally at `~/.openchamber/blackrouter/config.json`.

## Supported Free Models

BlackRouter queries the live OpenCode catalog and exposes all verified free models:
- `deepseek-v4.1-flash-free` (1M context, 384k output, vision, reasoning)
- `nemotron-3.5-super-vl-free` (1M context, 128k output, vision, reasoning)
- `nemotron-3.5-lightning-free` (1M context, 16k output, reasoning)
- `glm-5.3-flash-free` (1M context, 128k output, vision, reasoning)
- `mimo-v2.6-flash-free` (1M context, 128k output, reasoning)
- `flint-40b-free` (128k context, 8k output)
- `beam-free` (128k context, 8k output)
- `jev-1.13-free` (128k context, 8k output)

## License

MIT
