import { useEffect, useState, useRef } from 'react'
import { fetchOrderBook, POOL_MAP } from '../lib/deepbookClient'
import { generateOrderBook } from '../data/mockData'

const REFRESH_MS = 4000

export function useDeepBookOrderBook(pair) {
  const [state, setState] = useState({
    asks: [],
    bids: [],
    midPrice: pair.price,
    isLive: false,
    loading: true,
    error: null,
  })
  const activePairIdRef = useRef(pair.id)

  useEffect(() => {
    const thisPairId = pair.id
    activePairIdRef.current = thisPairId
    let interval

    function useMock(midPrice, error = null) {
      const mock = generateOrderBook(midPrice)
      if (activePairIdRef.current === thisPairId) {
        setState({
          asks: mock.asks,
          bids: mock.bids,
          midPrice,
          isLive: false,
          loading: false,
          error,
        })
      }
    }

    async function fetchLive() {
      const mapping = POOL_MAP[pair.id]

     if (!mapping || !mapping.live) {
  console.log('[useDeepBookOrderBook] Mock path. pair.id:', pair.id, 'pair.price:', pair.price, 'pair.base:', pair.base)
  useMock(pair.price)
  return
}

      try {
        const data = await fetchOrderBook(mapping.poolName, 12)
        console.log(`[DeepBook] Raw response for ${mapping.poolName}:`, data)

        const bids = (data.bids || []).map(([price, size]) => ({
          price: Number(price),
          size: Number(size),
          total: 0,
        }))
        const asks = (data.asks || []).map(([price, size]) => ({
          price: Number(price),
          size: Number(size),
          total: 0,
        }))

        console.log(`[DeepBook] Parsed for ${mapping.poolName}: ${bids.length} bids, ${asks.length} asks`)

        if (bids.length === 0 && asks.length === 0) {
          console.warn(`[DeepBook] Empty book for ${mapping.poolName}`)
          useMock(pair.price, 'Pool has no active orders right now — showing simulated data.')
          return
        }

        let cumBid = 0
        bids.forEach(b => { cumBid += b.size; b.total = +cumBid.toFixed(4) })
        let cumAsk = 0
        asks.forEach(a => { cumAsk += a.size; a.total = +cumAsk.toFixed(4) })

        const bestBid = bids[0]?.price ?? pair.price
        const bestAsk = asks[0]?.price ?? pair.price
        const midPrice = (bestBid + bestAsk) / 2

       if (activePairIdRef.current === thisPairId) {
          setState({
            asks,
            bids,
            midPrice,
            isLive: true,
            loading: false,
            error: null,
          })
        }
      } catch (err) {
        console.error(`[DeepBook] Indexer fetch failed for ${mapping.poolName}:`, err)
        useMock(pair.price, 'Could not reach DeepBook testnet — showing simulated data.')
      }
    }

    setState(s => ({ ...s, loading: true }))
    fetchLive()
    interval = setInterval(fetchLive, REFRESH_MS)

   return () => {
  clearInterval(interval)
}
  }, [pair.id])

  return state
}