import React from 'react'
import { Radio, FlaskConical } from 'lucide-react'
import { useDeepBookOrderBook } from '../hooks/useDeepBookOrderBook'

export default function OrderBook({ pair }) {
  const { asks, bids, midPrice, isLive, loading, error } = useDeepBookOrderBook(pair)
  const maxTotal = (asks.length || bids.length)
    ? Math.max(...asks.map(a => a.total), ...bids.map(b => b.total), 1)
    : 1

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
        <span className="mono" style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>ORDER BOOK</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {isLive ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Radio size={10} color="var(--green)" />
              <span className="mono" style={{ fontSize: 10, color: 'var(--green)' }}>LIVE · DeepBook Testnet</span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <FlaskConical size={10} color="var(--text-muted)" />
              <span className="mono" style={{ fontSize: 10, color: 'var(--text-muted)' }}>SIMULATED</span>
            </div>
          )}
          <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>{pair.base}/{pair.quote}</span>
        </div>
      </div>

      {error && (
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 8, padding: '6px 10px', background: 'var(--bg-3)', borderRadius: 6 }}>
          {error}
        </div>
      )}

      {/* Column labels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 4, marginBottom: 6, padding: '0 4px' }}>
        {['Price', 'Size', 'Total'].map(l => (
          <span key={l} style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', textAlign: l === 'Price' ? 'left' : 'right', letterSpacing: '0.06em' }}>{l}</span>
        ))}
      </div>

      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ display: 'flex', gap: 6 }}>
            <div className="thinking-dot" />
            <div className="thinking-dot" />
            <div className="thinking-dot" />
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 0 }}>
          {/* Asks (sells) - reversed so lowest ask is closest to spread */}
          <div style={{ marginBottom: 4 }}>
            {[...asks].reverse().map((row, i) => (
              <div
                key={i}
                className="ob-row stack-in"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: 4,
                  padding: '3px 4px',
                  position: 'relative',
                  animationDelay: `${i * 0.03}s`,
                  cursor: 'default',
                }}
              >
                <div style={{
                  position: 'absolute', right: 0, top: 0, bottom: 0,
                  width: `${(row.total / maxTotal) * 100}%`,
                  background: '#EF444415',
                  borderRadius: 2,
                }} />
                <span className="mono" style={{ fontSize: 11, color: 'var(--red)', position: 'relative', zIndex: 1 }}>
                  {row.price.toFixed(4)}
                </span>
                <span className="mono" style={{ fontSize: 11, color: 'var(--text-dim)', textAlign: 'right', position: 'relative', zIndex: 1 }}>
                  {row.size.toLocaleString()}
                </span>
                <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right', position: 'relative', zIndex: 1 }}>
                  {row.total.toLocaleString()}
                </span>
              </div>
            ))}
          </div>

          {/* Spread / mid price */}
          <div style={{ textAlign: 'center', padding: '6px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', margin: '4px 0' }}>
            <span className="mono" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>
              ${midPrice.toFixed(4)}
            </span>
            <span style={{ fontSize: 10, color: pair.change >= 0 ? 'var(--green)' : 'var(--red)', marginLeft: 8 }}>
              {pair.change >= 0 ? '▲' : '▼'} {Math.abs(pair.change)}%
            </span>
          </div>

          {/* Bids (buys) */}
          <div style={{ marginTop: 4 }}>
            {bids.map((row, i) => (
              <div
                key={i}
                className="ob-row stack-in"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: 4,
                  padding: '3px 4px',
                  position: 'relative',
                  animationDelay: `${i * 0.03}s`,
                  cursor: 'default',
                }}
              >
                <div style={{
                  position: 'absolute', right: 0, top: 0, bottom: 0,
                  width: `${(row.total / maxTotal) * 100}%`,
                  background: '#10B98115',
                  borderRadius: 2,
                }} />
                <span className="mono" style={{ fontSize: 11, color: 'var(--green)', position: 'relative', zIndex: 1 }}>
                  {row.price.toFixed(4)}
                </span>
                <span className="mono" style={{ fontSize: 11, color: 'var(--text-dim)', textAlign: 'right', position: 'relative', zIndex: 1 }}>
                  {row.size.toLocaleString()}
                </span>
                <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right', position: 'relative', zIndex: 1 }}>
                  {row.total.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
