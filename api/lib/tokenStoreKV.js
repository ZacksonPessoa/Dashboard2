const { Redis } = require("@upstash/redis");

const redis = new Redis({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
});

const TOKEN_KEY = "ml:oauth:token";

async function saveTokenKV(tokenData) {
  const now = Date.now();
  const expiresInSec = Number(tokenData.expires_in || 0);

  // margem de segurança (30s)
  const safetyMs = 30 * 1000;

  const payload = {
    ...tokenData,
    expires_at: expiresInSec ? now + expiresInSec * 1000 - safetyMs : null,
    saved_at: now
  };

  await redis.set(TOKEN_KEY, payload);
  return payload;
}

async function loadTokenKV() {
  return await redis.get(TOKEN_KEY);
}

module.exports = {
  saveTokenKV,
  loadTokenKV
};

