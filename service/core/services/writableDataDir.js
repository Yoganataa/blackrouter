// Resolve a writable directory for optional native runtime dependencies.
// Prefer BlackRouter's own config directory so it does not create a 9Router data folder.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

let cached = null;

export function getWritableDataDir() {
  if (cached) return cached;
  const configRoot = path.join(os.homedir(), ".openchamber", "blackrouter");
  const candidates = [
    process.env.BLACKROUTER_DATA_DIR,
    process.env.OPENCHAMBER_DATA_DIR ? path.join(process.env.OPENCHAMBER_DATA_DIR, "blackrouter") : null,
    configRoot,
    path.join(os.tmpdir(), "blackrouter-runtime"),
  ].filter((value) => typeof value === "string" && value.length > 0);
  for (const candidate of candidates) {
    try {
      fs.mkdirSync(candidate, { recursive: true });
      fs.accessSync(candidate, fs.constants.W_OK);
      cached = candidate;
      return candidate;
    } catch {
      // This location is not writable; continue to the next candidate.
    }
  }
  cached = process.cwd();
  return cached;
}
