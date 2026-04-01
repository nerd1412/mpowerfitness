// Redis is optional — if not available, all cache operations become no-ops.
let redisClient = null;

const connectRedis = async () => {
  const url = process.env.REDIS_URL;
  if (!url) { console.log('ℹ️  No REDIS_URL — running without cache'); return; }
  try {
    const { createClient } = require('redis');
    redisClient = createClient({ url });
    redisClient.on('error', () => { redisClient = null; });
    await redisClient.connect();
    console.log('✅ Redis connected');
  } catch { console.warn('⚠️  Redis unavailable — continuing without cache'); redisClient = null; }
};

const cacheGet = async (key) => {
  if (!redisClient) return null;
  try { const v = await redisClient.get(key); return v ? JSON.parse(v) : null; } catch { return null; }
};
const cacheSet = async (key, value, ttl = 300) => {
  if (!redisClient) return;
  try { await redisClient.setEx(key, ttl, JSON.stringify(value)); } catch {}
};
const cacheDel = async (key) => {
  if (!redisClient) return;
  try { await redisClient.del(key); } catch {}
};

module.exports = { connectRedis, cacheGet, cacheSet, cacheDel };
