import React, { useEffect, useState } from 'react'
import { Wallet, RefreshCw } from 'lucide-react'
import { getManagerBalance } from '../lib/conditionalOrders'

const COINS = ['SUI', 'DBUSDC']

export default function ManagerBalance({ balanceManagerAddress, tradeCapId, refreshKey = 0 }) {
  const [balances, setBalances] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function loadBalances() {
    if (!balanceManagerAddress || !tradeCapId) return
    setLoading(true)
    setError(null)
    try {
      const results = await Promise.all(
        COINS.map(coinKey =>
          getManagerBalance(balanceManagerAddress, tradeCapId, coinKey)
            .then(r => [coinKey, r.balance])
            .catch(() => [coinKey, null])
        )
      )
      setBalances(Object.fromEntries(results))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBalances()
    const interval = setInterval(loadBalances, 8000)
    return () => clearInterval(interval)
  }, [balanceManagerAddress, tradeCapId, refreshKey])

  return (
    <div style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Wallet size={12} color="var(--blue-bright)" />
          <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
            MANAGER BALANCE
          </span>
        </div>
        <button
          onClick={loadBalances}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: 2 }}
        >
          <RefreshCw size={11} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
        </button>
      </div>

      {error ? (
        <div style={{ fontSize: 11, color: 'var(--red)' }}>{error}</div>
      ) : (
        <div style={{ display: 'flex', gap: 16 }}>
          {COINS.map(coinKey => (
            <div key={coinKey}>
              <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>{coinKey}</div>
              <div className="mono" style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                {balances[coinKey] === null || balances[coinKey] === undefined ? '—' : balances[coinKey]}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}