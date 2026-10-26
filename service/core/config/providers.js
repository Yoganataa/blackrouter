import entry from "../providers/registry/opencode.js";

// The core is intentionally scoped to the upstream OpenCode Free provider for now.
// Keep its registry entry native; this wrapper limits the loaded registry to that entry.
export const PROVIDERS = {
  [entry.id]: {
    ...entry.transport,
    id: entry.id,
    alias: entry.alias,
    models: entry.models,
    noAuth: entry.noAuth,
  },
};
