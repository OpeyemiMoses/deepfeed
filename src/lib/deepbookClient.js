// DeepBookV3 public REST indexer — simpler and more reliable than driving the
// gRPC SDK client-side, since it just reads pre-indexed data over plain HTTP.
// Docs: https://docs.sui.io/standards/deepbookv3-indexer
const INDEXER_BASE = 'https://deepbook-indexer.testnet.mystenlabs.com'

// Maps our app's display pairs to real DeepBook testnet pool names (as indexed).
// DBUSDC is DeepBook's own testnet stablecoin — there is no real USDC pool on testnet.
export const POOL_MAP = {
  SUI_DBUSDC: { poolName: 'SUI_DBUSDC', live: true },
  DEEP_DBUSDC: { poolName: 'DEEP_DBUSDC', live: true },
}

/**
 * Fetches level-2 order book data for a pool from the public DeepBook indexer.
 * Returns { timestamp, bids: [[price, size], ...], asks: [[price, size], ...] }
 */
export async function fetchOrderBook(poolName, depth = 12) {
  const url = `${INDEXER_BASE}/orderbook/${poolName}?level=2&depth=${depth * 2}`
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`Indexer returned ${res.status} for ${poolName}`)
  }
  return res.json()
}

/**
 * Fetches the latest ticker summary (last price, volume, etc.) for all pools.
 */
export async function fetchTicker() {
  const res = await fetch(`${INDEXER_BASE}/ticker`)
  if (!res.ok) {
    throw new Error(`Indexer returned ${res.status} for /ticker`)
  }
  return res.json()
}