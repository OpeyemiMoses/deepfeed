const INDEXER_BASE = 'https://deepbook-indexer.testnet.mystenlabs.com'

export async function getCurrentPrice(poolName) {
  const res = await fetch(`${INDEXER_BASE}/orderbook/${poolName}?level=1`)
  if (!res.ok) {
    throw new Error(`Indexer returned ${res.status} for ${poolName}`)
  }
  const data = await res.json()
  const bestBid = data.bids?.[0]?.[0]
  const bestAsk = data.asks?.[0]?.[0]

  if (!bestBid && !bestAsk) {
    throw new Error(`No price data available for ${poolName}`)
  }
  if (!bestBid) return Number(bestAsk)
  if (!bestAsk) return Number(bestBid)
  return (Number(bestBid) + Number(bestAsk)) / 2
}