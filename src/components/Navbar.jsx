import React, { useState } from 'react'
import { Menu, X, Zap } from 'lucide-react'

export default function Navbar({ onLaunchApp, onHome }) {
  const [open, setOpen] = useState(false)

  return (
    <nav className="nav">
      <div className="edge-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        {/* Logo */}
        <button
          onClick={onHome}
          style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '10px' }}
        >
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 12px #2563EB55'
          }}>
            <img src="public/deepfeed.png" alt="logo" style={{ width: "24px", height: "24px", objectFit: "contain" }} />
          </div>
          <span className="mono" style={{ fontSize: 18, fontWeight: 700, color: '#F1F5F9', letterSpacing: '-0.02em' }}>
            DeepFeed
          </span>
        </button>

        {/* Desktop links */}
        <div className="mobile-hide" style={{ display: 'flex', alignItems: 'center', gap: 32 }}>
          <a href="#features" style={{ color: 'var(--text-muted)', fontSize: 14, textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = 'var(--text)'}
            onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>
            Features
          </a>
          <a href="#how" style={{ color: 'var(--text-muted)', fontSize: 14, textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = 'var(--text)'}
            onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>
            How it works
          </a>
          <a href="#pairs" style={{ color: 'var(--text-muted)', fontSize: 14, textDecoration: 'none', transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = 'var(--text)'}
            onMouseLeave={e => e.target.style.color = 'var(--text-muted)'}>
            Markets
          </a>
        </div>

        {/* Desktop CTA */}
        <div className="mobile-hide" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace' }}>
            Powered by DeepBook
          </span>
          <button className="btn-primary" style={{ padding: '8px 20px', fontSize: 13 }} onClick={onLaunchApp}>
            Launch App →
          </button>
        </div>

        {/* Mobile hamburger */}
        <button
          className="mobile-show"
          onClick={() => setOpen(!open)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', padding: 4 }}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div style={{
          position: 'absolute', top: 60, left: 0, right: 0,
          background: 'var(--bg-2)', borderBottom: '1px solid var(--border)',
          padding: '20px 30px', display: 'flex', flexDirection: 'column', gap: 20
        }}>
          <a href="#features" onClick={() => setOpen(false)} style={{ color: 'var(--text-dim)', fontSize: 15, textDecoration: 'none' }}>Features</a>
          <a href="#how" onClick={() => setOpen(false)} style={{ color: 'var(--text-dim)', fontSize: 15, textDecoration: 'none' }}>How it works</a>
          <a href="#pairs" onClick={() => setOpen(false)} style={{ color: 'var(--text-dim)', fontSize: 15, textDecoration: 'none' }}>Markets</a>
          <button className="btn-primary" onClick={() => { setOpen(false); onLaunchApp() }}>Launch App →</button>
        </div>
      )}
    </nav>
  )
}
