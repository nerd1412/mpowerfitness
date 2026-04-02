/**
 * Redis Cache Utility (ioredis)
 * 
 * Gracefully degrades: if Redis is unavailable (e.g. on Render free tier
 * without Redis add-on), all cache calls are no-ops and the app uses DB directly.
 */
const Redis = require('ioredis');

let client = null;
let connected = false;

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

try {
  client = new Redis(REDIS_URL, {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    connectTimeout: 3000,
  });

  client.on('connect', () => { connected = true; console.log('✅ Redis connected'); });
  client.on('error',   () => { connected = false; }); // silent — degrades gracefully
  client.connect().catch(() => { connected = false; });
} catch {
  connected = false;
}

/* ─── Helpers ──────────────────────────────────────────────────── */

/**
 * Get a cached value by key.
 * Returns parsed JSON or null if miss/unavailable.
 */
const get = async (key) => {
  if (!connected || !client) return null;
  try {
    const val = await client.get(key);
    return val ? JSON.parse(val) : null;
  } catch { return null; }
};

/**
 * Set a value with optional TTL (seconds, default 5 min).
 */
const set = async (key, value, ttl = 300) => {
  if (!connected || !client) return;
  try { await client.set(key, JSON.stringify(value), 'EX', ttl); }
  catch { /* ignore */ }
};

/**
 * Delete one or more keys (supports glob patterns via SCAN+DEL).
 */
const del = async (...keys) => {
  if (!connected || !client) return;
  try { await client.del(...keys); } catch { /* ignore */ }
};

/**
 * Delete all keys matching a pattern (e.g. 'workouts:*').
 */
const delPattern = async (pattern) => {
  if (!connected || !client) return;
  try {
    const keys = await client.keys(pattern);
    if (keys.length) await client.del(...keys);
  } catch { /* ignore */ }
};

module.exports = { get, set, del, delPattern };
