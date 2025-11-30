// Simple in-memory cache with TTL and request de-duplication
// Intended for GET requests and other idempotent calls

const store = new Map();
const inflight = new Map();

/**
 * Generate a stable cache key from URL and options
 */
function makeKey(url, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body && typeof options.body !== 'string' ? JSON.stringify(options.body) : options.body || '';
  return `${method}:${url}:${body}`;
}

/**
 * Get cached value if not expired
 */
export function cacheGet(key) {
  const entry = store.get(key);
  if (!entry) return null;
  const { value, expiresAt } = entry;
  if (expiresAt && Date.now() > expiresAt) {
    store.delete(key);
    return null;
  }
  return value;
}

/**
 * Set cached value with TTL in ms
 */
export function cacheSet(key, value, ttlMs = 30000) {
  const expiresAt = ttlMs > 0 ? Date.now() + ttlMs : 0;
  store.set(key, { value, expiresAt });
}

/**
 * Wrap a fetch-like function with caching and de-duplication
 */
export async function cachedFetch(url, options = {}, { ttlMs = 30000, dedupe = true } = {}) {
  const key = makeKey(url, options);

  // Return cached response if available
  const cached = cacheGet(key);
  if (cached) {
    try {
      // structuredClone is fast and preserves types where possible
      // Fallback to JSON roundtrip for broad compatibility
      // eslint-disable-next-line no-undef
      const cloned = typeof structuredClone === 'function' ? structuredClone(cached) : JSON.parse(JSON.stringify(cached));
      return { data: cloned, ok: true, status: 200 };
    } catch (_) {
      return { data: cached, ok: true, status: 200 };
    }
  }

  // De-duplicate concurrent identical requests
  if (dedupe && inflight.has(key)) {
    return inflight.get(key);
  }

  const p = (async () => {
    const res = await fetch(url, options);
    // Clone the response body to cache parsed JSON safely
    // Cache only successful JSON responses
    try {
      const data = await res.clone().json();
      if (res.ok) {
        cacheSet(key, data, ttlMs);
      }
      return { data, ok: res.ok, status: res.status };
    } catch (_) {
      // Non-JSON responses won't be cached and will return raw response
      return { data: null, ok: res.ok, status: res.status };
    }
  })().finally(() => inflight.delete(key));

  if (dedupe) inflight.set(key, p);
  return p;
}

/**
 * Invalidate cache entries matching a predicate
 */
export function cacheInvalidate(predicate) {
  for (const key of store.keys()) {
    if (predicate(key)) store.delete(key);
  }
}

/**
 * Clear the entire cache (use sparingly)
 */
export function cacheClear() {
  store.clear();
  inflight.clear();
}

const cacheUtils = { cacheGet, cacheSet, cachedFetch, cacheInvalidate, cacheClear };
export default cacheUtils;
