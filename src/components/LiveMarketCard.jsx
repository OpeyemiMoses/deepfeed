import React from 'react'
import { useDeepBookOrderBook } from '../hooks/useDeepBookOrderBook'

export default function LiveMarketCard({ pair, onClick, animationDelay }) {
  const { midPrice, isLive } = useDeepBookOrderBook(pair)

  return (
    <div
      className="card scroll-reveal"
      role="button"
      onClick={onClick}
      style={{ padding: 24, animationDelay, cursor: 'pointer' }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        {pair.iconUrl ? (
          <img
            src={pair.iconUrl}
            alt={pair.base}
            style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
            onError={e => { e.target.style.display = 'none' }}
            referrerPolicy="no-referrer"
            loading="lazy"
          />
        ) : (
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 700, color: '#fff', fontFamily: 'JetBrains Mono, monospace',
          }}>{pair.base[0]}</div>
        )}
        <div>
          <div className="mono" style={{ fontSize: 15, fontWeight: 700 }}>
            {pair.base}<span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>/{pair.quote}</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
            Vol {pair.volume}
            {isLive && (
              <span style={{ color: 'var(--green)', fontSize: 10 }}>· LIVE</span>
            )}
          </div>
        </div>
      </div>
      <div className="mono" style={{ fontSize: 22, fontWeight: 700 }}>
        ${midPrice.toLocaleString(undefined, { minimumFractionDigits: 4, maximumFractionDigits: 4 })}
      </div>
      <div style={{ fontSize: 13, color: pair.change >= 0 ? 'var(--green)' : 'var(--red)', marginTop: 6 }}>
        {pair.change >= 0 ? '+' : ''}{pair.change}% today
      </div>
    </div>
  )
}