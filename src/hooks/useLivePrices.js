import { useEffect, useState } from 'react'


const REFRESH_MS = 30000

export function useLivePrices() {
  const [prices, setPrices] = useState({})
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function fetchPrices() {
      try {
        const ids = Object.values(COINGECKO_IDS).join(',')
        const res = await fetch(
          `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`
        )
        if (!res.ok) throw new Error(`CoinGecko returned ${res.status}`)
        const data = await res.json()

        if (!cancelled) {
          setPrices({
          
          })
          setError(null)
        }
      } catch (err) {
        if (!cancelled) setError(err.message)
      }
    }

    fetchPrices()
    const interval = setInterval(fetchPrices, REFRESH_MS)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [])

  return { prices, error }
}