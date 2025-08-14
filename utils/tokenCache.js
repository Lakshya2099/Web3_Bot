// utils/tokenCache.js
// In-memory cache for token metadata to avoid spamming RPC
const cache = new Map();
// key: chain:address => { name, symbol, decimals, ts }
const TTL_MS = 60 * 60 * 1000; // 1 hour

function setTokenMeta(chain, address, meta) {
  cache.set(`${chain}:${address.toLowerCase()}`, { ...meta, ts: Date.now() });
}

function getTokenMeta(chain, address) {
  const key = `${chain}:${address.toLowerCase()}`;
  const item = cache.get(key);
  if (!item) return null;
  if (Date.now() - item.ts > TTL_MS) {
    cache.delete(key);
    return null;
  }
  return item;
}

module.exports = { setTokenMeta, getTokenMeta };
