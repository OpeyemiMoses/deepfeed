export const PAIRS = [
  {
    id: 'SUI_DBUSDC',
    base: 'SUI',
    quote: 'DBUSDC',
    price: 3.2841,
    change: +2.14,
    volume: '14.2M',
    iconUrl: 'https://cdn.jsdelivr.net/gh/trustwallet/assets@master/blockchains/sui/info/logo.png',
  },
  {
    id: 'DEEP_DBUSDC',
    base: 'DEEP',
    quote: 'DBUSDC',
    price: 0.0352,
    change: -1.87,
    volume: '2.8M',
    iconUrl: 'https://coin-images.coingecko.com/coins/images/50648/standard/DEEP_Logo_256x256_px_%282%29.png?1728612340',
  },
]

export function generateOrderBook(midPrice) {
  const asks = []
  const bids = []
  for (let i = 0; i < 12; i++) {
    const spread = midPrice * 0.0005
    asks.push({
      price: +(midPrice + spread * (i + 1)).toFixed(4),
      size: +(Math.random() * 8000 + 500).toFixed(2),
      total: 0,
    })
    bids.push({
      price: +(midPrice - spread * (i + 1)).toFixed(4),
      size: +(Math.random() * 8000 + 500).toFixed(2),
      total: 0,
    })
  }
  let cumAsk = 0
  asks.forEach(a => { cumAsk += a.size; a.total = +cumAsk.toFixed(2) })
  let cumBid = 0
  bids.forEach(b => { cumBid += b.size; b.total = +cumBid.toFixed(2) })
  return { asks, bids }
}

export const MOCK_ORDERS = [
  { id: 1, side: 'buy', type: 'limit', pair: 'SUI/DBUSDC', price: 3.20, size: 100, status: 'open', time: '14:32:01' },
  { id: 2, side: 'sell', type: 'market', pair: 'SUI/DBUSDC', price: 3.29, size: 50, status: 'filled', time: '14:28:47' },
  { id: 3, side: 'buy', type: 'limit', pair: 'DEEP/DBUSDC', price: 0.033, size: 2000, status: 'cancelled', time: '13:55:12' },
]

// Generate realistic OHLCV candle data for a given base price
export function generateCandles(basePrice, count = 120) {
  const candles = []
  const now = Math.floor(Date.now() / 1000)
  let price = basePrice * 0.92

  for (let i = count; i >= 0; i--) {
    const volatility = basePrice * 0.008
    const open = price
    const close = open + (Math.random() - 0.48) * volatility
    const high = Math.max(open, close) + Math.random() * volatility * 0.5
    const low = Math.min(open, close) - Math.random() * volatility * 0.5
    const volume = +(Math.random() * 50000 + 5000).toFixed(0)
    price = close
    candles.push({ time: now - i * 60, open: +open.toFixed(5), high: +high.toFixed(5), low: +low.toFixed(5), close: +close.toFixed(5), volume })
  }
  return candles
}