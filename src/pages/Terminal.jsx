import React, { useState, useEffect } from 'react'
import { Zap, BarChart2, BookOpen, Clock, Bot, TrendingUp, TrendingDown, RefreshCw, CandlestickChart } from 'lucide-react'
import PairSelector from '../components/PairSelector'
import OrderBook from '../components/OrderBook'
import OrderPlacement from '../components/OrderPlacement'
import AIAssistant from '../components/AIAssistant'
import OrderHistory from '../components/OrderHistory'
import DepthChart from '../components/DepthChart'
import TradingChart from '../components/TradingChart'
import WalletStatus from '../components/WalletStatus'
import BalanceManagerSetup from '../components/BalanceManagerSetup'
import { PAIRS } from '../data/mockData'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { useDeepBookOrderBook } from '../hooks/useDeepBookOrderBook'

const TABS = [
  { id: 'chart', label: 'Chart', icon: <CandlestickChart size={13} /> },
  { id: 'orderbook', label: 'Order Book', icon: <BookOpen size={13} /> },
  { id: 'depth', label: 'Depth', icon: <BarChart2 size={13} /> },
  { id: 'history', label: 'My Orders', icon: <Clock size={13} /> },
]

export default function Terminal({ onHome }) {
  const account = useCurrentAccount()
  const [pair, setPair] = useState(PAIRS[0])
  const [tab, setTab] = useState('chart')
  const [mobilePanel, setMobilePanel] = useState('chart')
  const { midPrice, isLive, loading: priceLoading } = useDeepBookOrderBook(pair)
 console.log('[Terminal] pair.id:', pair.id, 'midPrice:', midPrice, 'priceLoading:', priceLoading)
  const [aiOpen, setAiOpen] = useState(true)
const [automationSetup, setAutomationSetup] = useState(() => {
  const raw = localStorage.getItem('deepfeedAutomationSetup')
  console.log('[Terminal] Reading localStorage on mount. Raw value:', raw)
  try {
    const parsed = JSON.parse(raw || 'null')
    console.log('[Terminal] Parsed automationSetup:', parsed)
    return parsed
  } catch (err) {
    console.log('[Terminal] Failed to parse:', err.message)
    return null
  }
})
  const [ordersRefreshKey, setOrdersRefreshKey] = useState(0)


  // Simulate live price tick
const price = midPrice

const handlePairChange = (p) => {
  setPair(p)
  setTab('chart')
}
  const priceUp = pair.change >= 0

  useEffect(() => {
    if (automationSetup) {
      localStorage.setItem('deepfeedAutomationSetup', JSON.stringify(automationSetup))
    }
  }, [automationSetup])

  const handleSetupComplete = (result) => {
    setAutomationSetup(result)
  }

  const handleOrderCreated = () => {
    setOrdersRefreshKey(k => k + 1)
    setTab('history')
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflow: 'hidden' }}>
      {/* TOP BAR */}
      <div style={{
  height: 52, background: 'var(--bg-2)', borderBottom: '1px solid var(--border)',
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '0 12px', flexShrink: 0, gap: 8, overflow: 'hidden',
}}>
        {/* Left: Logo + pair selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1, overflow: 'hidden' }}>
  <button className="mobile-hide" onClick={onHome} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
            <div style={{ width: 26, height: 26, borderRadius: 6, background: 'linear-gradient(135deg, #2563EB, #1D4ED8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <img src="images/deepfeed.png" alt="logo" style={{ width: "24px", height: "24px", objectFit: "contain" }} />
            </div>
            <span className="mono" style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>DeepFeed</span>
          </button>

          <div style={{ width: 1, height: 24, background: 'var(--border)' }} />
          <PairSelector selected={pair} onSelect={handlePairChange} />

          {/* Live price with token icon */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {pair.iconUrl ? (
              <img
                src={pair.iconUrl}
                alt={pair.base}
                style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover' }}
                onError={e => { e.target.style.display = 'none' }}
                referrerPolicy="no-referrer"
                loading="lazy"
              />
            ) : (
              <div style={{
                width: 20, height: 20, borderRadius: '50%',
                background: '#6366F1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 9, fontWeight: 700, color: '#fff', fontFamily: 'JetBrains Mono, monospace',
              }}>{pair.base[0]}</div>
            )}
            <span className="mono" style={{ fontSize: 16, fontWeight: 700, color: priceUp ? 'var(--green)' : 'var(--red)', transition: 'color 0.3s', whiteSpace: 'nowrap' }}>
  ${price.toLocaleString(undefined, { minimumFractionDigits: 4 })}
</span>
            <span className="mobile-hide" style={{ fontSize: 12, color: pair.change >= 0 ? 'var(--green)' : 'var(--red)', display: 'flex', alignItems: 'center', gap: 3 }}>
  {pair.change >= 0 ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
  {pair.change >= 0 ? '+' : ''}{pair.change}%
</span>
          </div>

          {/* Mini stats */}
          <div className="mobile-hide" style={{ display: 'flex', gap: 20 }}>
            {[
              { label: '24h Vol', val: pair.volume },
              { label: 'Spread', val: '0.02%' },
              { label: 'Settle', val: '390ms' },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{s.label}</div>
                <div className="mono" style={{ fontSize: 12, color: 'var(--text-dim)' }}>{s.val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Wallet + AI toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
         <button
  onClick={() => setAiOpen(!aiOpen)}
  style={{
    display: 'flex', alignItems: 'center', gap: 6,
    background: aiOpen ? '#2563EB22' : 'var(--bg-3)',
    border: `1px solid ${aiOpen ? 'var(--blue)' : 'var(--border)'}`,
    borderRadius: 8, padding: '6px 10px', cursor: 'pointer',
    color: aiOpen ? 'var(--blue-bright)' : 'var(--text-muted)',
    fontSize: 12, fontFamily: 'Inter, sans-serif',
    transition: 'all 0.2s', flexShrink: 0,
  }}
>
  <Bot size={13} />
  <span className="mobile-hide">AI Assistant</span>
</button>

<div style={{ flexShrink: 0 }}>
  <WalletStatus />
</div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div
  className="terminal-desktop-grid"
  style={{ flex: 1, display: 'grid', gridTemplateColumns: aiOpen ? '1fr 320px 360px' : '1fr 380px', gap: 0, overflow: 'hidden' }}
>
  {/* Mobile panel switcher */}
  <div className="terminal-mobile-tabs" style={{
    display: 'none', padding: '8px 16px', gap: 6,
    borderBottom: '1px solid var(--border)', background: 'var(--bg-2)', flexShrink: 0,
  }}>
    {[
      { id: 'chart', label: 'Chart' },
      { id: 'ai', label: 'AI' },
      { id: 'order', label: 'Order' },
    ].map(p => (
      <button
        key={p.id}
        className={`tab ${mobilePanel === p.id ? 'active' : ''}`}
        onClick={() => setMobilePanel(p.id)}
        style={{ flex: 1 }}
      >
        {p.label}
      </button>
    ))}
  </div>

        {/* CENTER: Tabs + content */}
        <div className={`terminal-panel ${mobilePanel === 'chart' ? 'active-mobile' : ''}`} style={{ display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--border)', overflow: 'hidden' }}>
          {/* Tab bar */}
          <div style={{ height: 44, display: 'flex', alignItems: 'center', gap: 4, padding: '0 16px', borderBottom: '1px solid var(--border)', flexShrink: 0, background: 'var(--bg-2)' }}>
            {TABS.map(t => (
              <button key={t.id} className={`tab ${tab === t.id ? 'active' : ''}`}
                onClick={() => setTab(t.id)}
                style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', fontSize: 12 }}>
                {t.icon} {t.label}
              </button>
            ))}
            <div style={{ flex: 1 }} />
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>
              <RefreshCw size={13} />
            </button>
          </div>

          {/* Tab content */}
          <div style={{ flex: 1, overflow: 'hidden', padding: 16 }}>
{tab === 'chart' && !priceLoading && <TradingChart key={pair.id} pair={{ ...pair, price }} />}
{tab === 'chart' && priceLoading && (
  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ display: 'flex', gap: 6 }}>
      <div className="thinking-dot" /><div className="thinking-dot" /><div className="thinking-dot" />
    </div>
  </div>
)}
            {tab === 'orderbook' && <OrderBook pair={{ ...pair, price }} />}
            {tab === 'depth' && (
              <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <div className="section-label">Depth Chart — {pair.base}/{pair.quote}</div>
                  <DepthChart pair={{ ...pair, price }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                    <span style={{ fontSize: 11, color: 'var(--green)' }}>▬ Bids</span>
                    <span className="mono" style={{ fontSize: 11, color: 'var(--text-muted)' }}>Mid: ${price.toFixed(4)}</span>
                    <span style={{ fontSize: 11, color: 'var(--red)' }}>Asks ▬</span>
                  </div>
                </div>
                <div className="divider" />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div className="section-label">Market Summary</div>
                  {[
                    { label: 'Best Bid', val: `$${(price * 0.9995).toFixed(4)}`, color: 'var(--green)' },
                    { label: 'Best Ask', val: `$${(price * 1.0005).toFixed(4)}`, color: 'var(--red)' },
                    { label: 'Spread', val: `$${(price * 0.001).toFixed(4)} (0.10%)`, color: 'var(--text-dim)' },
                    { label: '24h High', val: `$${(price * 1.032).toFixed(4)}`, color: 'var(--text-dim)' },
                    { label: '24h Low', val: `$${(price * 0.971).toFixed(4)}`, color: 'var(--text-dim)' },
                    { label: '24h Volume', val: pair.volume, color: 'var(--text-dim)' },
                  ].map(r => (
                    <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{r.label}</span>
                      <span className="mono" style={{ fontSize: 13, color: r.color }}>{r.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {tab === 'history' && <OrderHistory refreshKey={ordersRefreshKey} />}
          </div>
        </div>

        {/* RIGHT: AI Assistant (if open) */}
        {aiOpen && (
  <div className={`terminal-panel ${mobilePanel === 'ai' ? 'active-mobile' : ''}`} style={{ borderRight: '1px solid var(--border)', padding: '20px 18px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
           <AIAssistant
  pair={{ ...pair, price }}
  account={account}
  automationSetup={automationSetup}
  onOrderCreated={handleOrderCreated}
/>
          </div>
        )}

        {/* FAR RIGHT: Order Placement */}
       <div className={`terminal-panel ${mobilePanel === 'order' ? 'active-mobile' : ''}`} style={{ padding: '20px 18px', overflow: 'hidden auto' }}>
        {!priceLoading && (
  <OrderPlacement
    pair={{ ...pair, price }}
    automationSetup={automationSetup}
    onSetupComplete={handleSetupComplete}
    onOrderCreated={handleOrderCreated}
  />
)}
        </div>
      </div>

      {/* BOTTOM STATUS BAR */}
      <div style={{
        height: 28, background: 'var(--bg-2)', borderTop: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 30px', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
            DeepBook v3 · Sui Testnet
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 5px var(--green)' }} />
            <span style={{ fontSize: 10, color: 'var(--green)', fontFamily: 'JetBrains Mono, monospace' }}>connected</span>
          </div>
        </div>
        <span style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
          Sui Overflow 2026 · Built by DeepFeed
        </span>
      </div>
    </div>
  )
}
