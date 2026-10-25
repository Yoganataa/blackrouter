/**
 * Parse the standard HTTP Retry-After header.
 *
 * Upstreams may send either delta-seconds ("120") or an HTTP date.
 * Invalid/missing values fall back to a conservative cooldown. Even "0" gets
 * a short floor so a noisy provider cannot cause a tight retry loop.
 */
export const parseRetryAfterMs = (
  value?: string | null,
  now = Date.now(),
  fallbackMs = 5 * 60_000,
): number => {
  const fallback = Math.max(1_000, Math.min(fallbackMs, 60 * 60_000));
  if (typeof value !== 'string' || value.trim() === '') return fallback;

  const trimmed = value.trim();
  let requestedMs: number;

  if (/^\d+(?:\.\d+)?$/.test(trimmed)) {
    const seconds = Number(trimmed);
    if (!Number.isFinite(seconds) || seconds < 0) return fallback;
    requestedMs = seconds * 1_000;
  } else {
    const date = Date.parse(trimmed);
    if (!Number.isFinite(date)) return fallback;
    requestedMs = date - now;
  }

  // Avoid hot loops on Retry-After: 0 / a timestamp just in the past.
  return Math.max(1_000, Math.min(requestedMs, 60 * 60_000));
};
