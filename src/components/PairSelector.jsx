import React, { useState } from 'react'
import { ChevronDown, TrendingUp, TrendingDown } from 'lucide-react'
import { PAIRS } from '../data/mockData'

const FALLBACK_COLORS = {
  SUI: '#4DA2FF',
  DEEP: '#6366F1',
}

function TokenIcon({ pair, size = 24 }) {
  const [err, setErr] = useState(false)
  if (!err && pair.iconUrl) {
    return (
      <img
        src={pair.iconUrl}
        alt={pair.base}
        onError={() => setErr(true)} referrerPolicy="no-referrer" loading="lazy"
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
      />
    )
  }
  // Fallback circle with first letter — styled per-token, not a generic broken-image look
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: FALLBACK_COLORS[pair.base] || 'var(--blue-dim)',
      display: 'flex', alignItems: 'center',
      justifyContent: 'center', fontSize: size * 0.42, fontWeight: 700,
      color: '#fff', fontFamily: 'JetBrains Mono, monospace',
    }}>
      {pair.base[0]}
    </div>
  )
}

export default function PairSelector({ selected, onSelect }) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 10, padding: '7px 13px', cursor: 'pointer',
          transition: 'border-color 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--blue)'}
        onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
      >
        <TokenIcon pair={selected} size={26} />
        <div style={{ textAlign: 'left' }}>
          <div className="mono" style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
            {selected.base}<span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>/{selected.quote}</span>
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 1 }}>Vol {selected.volume}</div>
        </div>
        <ChevronDown size={13} color="var(--text-muted)" style={{ marginLeft: 2, transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

     {open && (
  <div style={{
    position: 'fixed', top: 60, left: '50%', transform: 'translateX(-50%)',
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: 10, overflow: 'hidden', zIndex: 200,
    width: 'min(280px, calc(100vw - 24px))', boxShadow: '0 16px 48px #00000088',
    animation: 'stackIn 0.2s ease forwards',
  }}>
          {PAIRS.map(p => (
            <button
              key={p.id}
              onClick={() => { onSelect(p); setOpen(false) }}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px', background: p.id === selected.id ? 'var(--bg-3)' : 'none',
                border: 'none', borderBottom: '1px solid var(--border)',
                cursor: 'pointer', transition: 'background 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-3)'}
              onMouseLeave={e => e.currentTarget.style.background = p.id === selected.id ? 'var(--bg-3)' : 'none'}
            >
              <TokenIcon pair={p} size={28} />
              <div style={{ flex: 1, textAlign: 'left' }}>
                <div className="mono" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>
                  {p.base}<span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>/{p.quote}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 1 }}>${p.price.toLocaleString()}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  {p.change >= 0
                    ? <TrendingUp size={11} color="var(--green)" />
                    : <TrendingDown size={11} color="var(--red)" />}
                  <span className="mono" style={{ fontSize: 11, color: p.change >= 0 ? 'var(--green)' : 'var(--red)' }}>
                    {p.change >= 0 ? '+' : ''}{p.change}%
                  </span>
                </div>
                <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Vol {p.volume}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
