import React, { useEffect } from 'react'
import { Zap, BookOpen, Bot, BarChart2, Shield, ArrowRight, TrendingUp, Activity, Layers } from 'lucide-react'
import { useScrollReveal } from '../hooks/useScrollReveal'
import { PAIRS } from '../data/mockData'
import LiveMarketCard from '../components/LiveMarketCard'

const FEATURES = [
  {
    icon: <BookOpen size={22} color="var(--blue-bright)" />,
    title: 'Live Order Book',
    desc: 'Real-time DeepBook order flow visualized as an animated depth chart — not a wall of raw numbers.',
  },
  {
    icon: <Bot size={22} color="var(--blue-bright)" />,
    title: 'AI Trading Assistant',
    desc: 'Ask in plain English. Get market context, order explanations, and smart suggestions in seconds.',
  },
  {
    icon: <TrendingUp size={22} color="var(--blue-bright)" />,
    title: 'Guided Order Placement',
    desc: 'Place limit and market orders with real descriptions of what will happen before you confirm.',
  },
  {
    icon: <Activity size={22} color="var(--blue-bright)" />,
    title: 'Order Tracking',
    desc: 'Monitor every open, filled, and cancelled order in one clean timeline view.',
  },
  {
    icon: <Layers size={22} color="var(--blue-bright)" />,
    title: 'Multi-Pair Markets',
    desc: 'SUI, DEEP - switch pairs instantly with full order book context.',
  },
  {
    icon: <Shield size={22} color="var(--blue-bright)" />,
    title: 'Non-Custodial',
    desc: 'Connect your Sui wallet. DeepFeed never holds your keys or your funds.',
  },
]

const STEPS = [
  { num: '01', title: 'Connect your Sui wallet', desc: 'One click. Non-custodial. Your keys, your funds.' },
  { num: '02', title: 'Pick a trading pair', desc: 'SUI, DEEP — with live order book loaded instantly.' },
  { num: '03', title: 'Ask the AI or place an order', desc: 'Chat to understand the market. Then trade with confidence.' },
]

export default function Landing({ onLaunchApp }) {
  useScrollReveal()

  return (
    <div style={{ paddingTop: 60 }}>
      {/* HERO */}
      <section style={{ minHeight: '92vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
        className="edge-container page-rise">
        <div style={{ maxWidth: 760, paddingTop: 80, paddingBottom: 80 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 999, padding: '5px 14px', marginBottom: 32 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', boxShadow: '0 0 6px var(--green)' }} />
            <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)', letterSpacing: '0.06em' }}>
              LIVE ON SUI TESTNET
            </span>
          </div>

          <h1 style={{ fontSize: 'clamp(40px, 7vw, 76px)', fontWeight: 700, lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: 24, color: 'var(--text)' }}>
            Trade DeepBook<br />
            <span style={{ color: 'var(--blue-bright)' }}>like you know</span><br />
            what you're doing.
          </h1>

          <p style={{ fontSize: 18, color: 'var(--text-dim)', lineHeight: 1.7, marginBottom: 40, maxWidth: 540, fontWeight: 300 }}>
            DeepFeed is a plain-English trading terminal for Sui's DeepBook DEX.
            Visualize order flow, get AI market context, and place trades without needing a finance degree.
          </p>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button className="btn-primary" style={{ fontSize: 15, padding: '14px 32px' }} onClick={onLaunchApp}>
              Open Terminal →
            </button>
            <a href="#features">
              <button className="btn-ghost" style={{ fontSize: 15, padding: '14px 24px' }}>
                See how it works
              </button>
            </a>
          </div>

          {/* Stat strip */}
          <div style={{ display: 'flex', gap: 40, marginTop: 64, flexWrap: 'wrap' }}>
            {[
              { label: 'Avg settlement', val: '390ms' },
              { label: 'DeepBook volume', val: '$15M+/day' },
              { label: 'Active pairs', val: '2 pairs' },
            ].map(s => (
              <div key={s.label}>
                <div className="mono" style={{ fontSize: 22, fontWeight: 700, color: 'var(--blue-bright)' }}>{s.val}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, letterSpacing: '0.04em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ paddingTop: 80, paddingBottom: 80 }} className="edge-container">
        <div className="scroll-reveal" style={{ marginBottom: 48 }}>
          <div className="section-label">What's inside</div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700, letterSpacing: '-0.02em' }}>
            Everything you need.<br />Nothing you don't.
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          {FEATURES.map((f, i) => (
            <div key={f.title} className="card scroll-reveal" style={{ padding: 28, animationDelay: `${i * 0.07}s` }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: '#2563EB18', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                {f.icon}
              </div>
              <div className="mono" style={{ fontSize: 15, fontWeight: 600, marginBottom: 10, color: 'var(--text)' }}>{f.title}</div>
              <p style={{ fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.65 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" style={{ paddingTop: 80, paddingBottom: 80, background: 'var(--bg-2)' }}>
        <div className="edge-container">
          <div className="scroll-reveal" style={{ marginBottom: 48 }}>
            <div className="section-label">How it works</div>
            <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700, letterSpacing: '-0.02em' }}>
              Three steps to your first trade.
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 24 }}>
            {STEPS.map((s, i) => (
              <div key={s.num} className="card scroll-reveal" style={{ padding: 32, position: 'relative', overflow: 'hidden', animationDelay: `${i * 0.1}s` }}>
                <div className="mono" style={{ fontSize: 48, fontWeight: 700, color: 'var(--border)', position: 'absolute', top: 16, right: 20, lineHeight: 1 }}>{s.num}</div>
                <div className="mono" style={{ fontSize: 14, color: 'var(--blue-bright)', marginBottom: 12 }}>{s.num}</div>
                <div className="mono" style={{ fontSize: 17, fontWeight: 600, marginBottom: 10 }}>{s.title}</div>
                <p style={{ fontSize: 14, color: 'var(--text-dim)', lineHeight: 1.65 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* MARKETS */}
      <section id="pairs" style={{ paddingTop: 80, paddingBottom: 80 }} className="edge-container">
        <div className="scroll-reveal" style={{ marginBottom: 40 }}>
          <div className="section-label">Live markets</div>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', fontWeight: 700, letterSpacing: '-0.02em' }}>Available pairs.</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
         {PAIRS.map((p, i) => (
  <LiveMarketCard
    key={p.id}
    pair={p}
    onClick={onLaunchApp}
    animationDelay={`${i * 0.08}s`}
  />
))}
        </div>
      </section>

      {/* CTA BANNER */}
      <section style={{ paddingTop: 80, paddingBottom: 100, background: 'var(--bg-2)' }} className="edge-container">
        <div className="scroll-reveal card glow-border" style={{ padding: 'clamp(40px, 6vw, 72px)', textAlign: 'center', maxWidth: 720, margin: '0 auto', background: 'linear-gradient(135deg, #0D1420, #0F1929)' }}>
          <div className="mono" style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 16 }}>
            Ready to trade on DeepBook?
          </div>
          <p style={{ fontSize: 16, color: 'var(--text-dim)', marginBottom: 36, lineHeight: 1.6 }}>
            Connect your Sui wallet and start in under 30 seconds.
          </p>
          <button className="btn-primary" style={{ fontSize: 16, padding: '16px 40px' }} onClick={onLaunchApp}>
            Open DeepFeed Terminal →
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '24px 30px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <span className="mono" style={{ fontSize: 13, color: 'var(--text-muted)' }}>DeepFeed — Sui Overflow 2026</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Built on DeepBook · Powered by Sui</span>
        </div>
      </footer>
    </div>
  )
}
