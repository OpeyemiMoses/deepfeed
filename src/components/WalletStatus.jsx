import React, { useState, useRef, useEffect } from 'react'
import { ConnectModal, useCurrentAccount, useDisconnectWallet } from '@mysten/dapp-kit'
import { Wallet, ExternalLink, Copy, LogOut, Check } from 'lucide-react'

function truncateAddress(address) {
  if (!address) return ''
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export default function WalletStatus() {
  const account = useCurrentAccount()
  const { mutate: disconnect } = useDisconnectWallet()
  const [modalOpen, setModalOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleCopy = () => {
    if (account?.address) {
      navigator.clipboard.writeText(account.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }

  if (!account) {
    return (
      <>
        <button
          onClick={() => setModalOpen(true)}
          className="wallet-pill"
          style={{ cursor: 'pointer', border: '1px solid var(--blue)', background: '#2563EB18' }}
        >
          <Wallet size={13} color="var(--blue-bright)" />
          <span style={{ color: 'var(--blue-bright)' }}>Connect Wallet</span>
        </button>
        <ConnectModal
          trigger={<div style={{ display: 'none' }} />}
          open={modalOpen}
          onOpenChange={setModalOpen}
        />
      </>
    )
  }

  return (
    <div style={{ position: 'relative' }} ref={menuRef}>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="wallet-pill"
        style={{ cursor: 'pointer' }}
      >
        <div className="wallet-dot" />
        <span>{truncateAddress(account.address)}</span>
        <ExternalLink size={10} color="var(--text-muted)" />
      </button>

      {menuOpen && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 8px)', right: 0,
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: 10, overflow: 'hidden', zIndex: 50,
          minWidth: 200, boxShadow: '0 16px 48px #00000088',
          animation: 'stackIn 0.2s ease forwards',
        }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)' }}>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 4 }}>CONNECTED ADDRESS</div>
            <div className="mono" style={{ fontSize: 12, color: 'var(--text)', wordBreak: 'break-all' }}>
              {truncateAddress(account.address)}
            </div>
          </div>
          <button
            onClick={handleCopy}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px', background: 'none', border: 'none',
              cursor: 'pointer', color: 'var(--text-dim)', fontSize: 13,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-3)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            {copied ? <Check size={14} color="var(--green)" /> : <Copy size={14} />}
            {copied ? 'Copied!' : 'Copy address'}
          </button>
          <button
            onClick={() => { disconnect(); setMenuOpen(false) }}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 10,
              padding: '10px 14px', background: 'none', border: 'none',
              cursor: 'pointer', color: 'var(--red)', fontSize: 13,
              transition: 'background 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-3)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
          >
            <LogOut size={14} />
            Disconnect
          </button>
        </div>
      )}
    </div>
  )
}