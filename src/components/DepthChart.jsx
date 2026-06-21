import React, { useEffect, useState } from 'react'
import { generateOrderBook } from '../data/mockData'

export default function DepthChart({ pair }) {
  const [book, setBook] = useState(null)

  useEffect(() => {
    setBook(generateOrderBook(pair.price))
    const iv = setInterval(() => setBook(generateOrderBook(pair.price * (1 + (Math.random() - 0.5) * 0.001))), 2500)
    return () => clearInterval(iv)
  }, [pair.id])

  if (!book) return (
    <div style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ display: 'flex', gap: 5 }}>
        <div className="thinking-dot" /><div className="thinking-dot" /><div className="thinking-dot" />
      </div>
    </div>
  )

  const maxBidTotal = Math.max(...book.bids.map(b => b.total))
  const maxAskTotal = Math.max(...book.asks.map(a => a.total))
  const maxTotal = Math.max(maxBidTotal, maxAskTotal)

  return (
    <div style={{ height: 100, display: 'flex', alignItems: 'flex-end', gap: 1, padding: '0 4px' }}>
      {/* Bids side */}
      {[...book.bids].reverse().map((b, i) => (
        <div key={`b${i}`} style={{
          flex: 1,
          height: `${(b.total / maxTotal) * 100}%`,
          background: `rgba(16, 185, 129, ${0.15 + (i / book.bids.length) * 0.35})`,
          borderRadius: '2px 2px 0 0',
          transition: 'height 0.4s ease',
          minHeight: 2,
        }} />
      ))}
      {/* Center line */}
      <div style={{ width: 2, height: '100%', background: 'var(--border)', flexShrink: 0 }} />
      {/* Asks side */}
      {book.asks.map((a, i) => (
        <div key={`a${i}`} style={{
          flex: 1,
          height: `${(a.total / maxTotal) * 100}%`,
          background: `rgba(239, 68, 68, ${0.35 - (i / book.asks.length) * 0.2})`,
          borderRadius: '2px 2px 0 0',
          transition: 'height 0.4s ease',
          minHeight: 2,
        }} />
      ))}
    </div>
  )
}
