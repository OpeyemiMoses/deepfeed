import React, { useEffect, useState } from 'react'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { Clock, CheckCircle, XCircle, Circle, AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react'
import { listConditionalOrders, cancelConditionalOrder } from '../lib/conditionalOrders'

const STATUS_ICON = {
  pending: <Circle size={12} color="var(--blue-bright)" />,
  triggered: <CheckCircle size={12} color="var(--green)" />,
  failed: <AlertTriangle size={12} color="var(--red)" />,
  cancelled: <XCircle size={12} color="var(--red)" />,
}

const STATUS_COLOR = {
  pending: 'var(--blue-bright)',
  triggered: 'var(--green)',
  failed: 'var(--red)',
  cancelled: 'var(--red)',
}

function formatTime(value) {
  if (!value) return '—'
  return new Date(value).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

function pairLabel(order) {
  return order.pairId?.replace('_', '/') || order.poolName || '—'
}

export default function OrderHistory({ refreshKey = 0 }) {
  const account = useCurrentAccount()
  const [filter, setFilter] = useState('all')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function loadOrders() {
    if (!account?.address) return
    setLoading(true)
    setError(null)
    try {
      setOrders(await listConditionalOrders(account.address))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
    if (!account?.address) return undefined
    const interval = setInterval(loadOrders, 5000)
    return () => clearInterval(interval)
  }, [account?.address, refreshKey])

  async function handleCancel(order) {
    if (!account?.address) return
    try {
      const updated = await cancelConditionalOrder(order.id, account.address)
      setOrders(current => current.map(o => (o.id === updated.id ? updated : o)))
    } catch (err) {
      setError(err.message)
    }
  }

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  if (!account) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
        Connect your wallet to view conditional orders.
      </div>
    )
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, borderBottom: '1px solid var(--border)', marginBottom: 12 }}>
        <span className="mono" style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>CONDITIONAL ORDERS</span>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {['all', 'pending', 'triggered', 'failed', 'cancelled'].map(f => (
            <button key={f} className={`tab ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)} style={{ padding: '4px 8px', fontSize: 11, textTransform: 'capitalize' }}>
              {f}
            </button>
          ))}
          <button onClick={loadOrders} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', padding: 5 }}>
            <RefreshCw size={12} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: '#EF44441A', border: '1px solid #EF444444', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: 'var(--red)', marginBottom: 12 }}>
          {error}
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {!loading && filtered.length === 0 ? (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            No conditional orders found
          </div>
        ) : (
          filtered.map((o, i) => (
            <div key={o.id} className="stack-in" style={{ background: 'var(--bg-3)', borderRadius: 8, padding: '10px 14px', border: '1px solid var(--border)', animationDelay: `${i * 0.06}s`, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: o.side === 'buy' ? '#10B98122' : '#EF444422', color: o.side === 'buy' ? 'var(--green)' : 'var(--red)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase' }}>{o.side}</span>
                  <span className="mono" style={{ fontSize: 12, color: 'var(--text-dim)' }}>{pairLabel(o)}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--bg-card)', padding: '1px 6px', borderRadius: 4, fontFamily: 'JetBrains Mono, monospace' }}>
                    {o.triggerType === 'price_below' ? 'below' : 'above'} ${Number(o.triggerPrice).toFixed(4)}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {STATUS_ICON[o.status] || STATUS_ICON.pending}
                  <span style={{ fontSize: 11, color: STATUS_COLOR[o.status] || 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', textTransform: 'capitalize' }}>
                    {o.status}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', gap: 16 }}>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>Quantity</div>
                    <div className="mono" style={{ fontSize: 12, color: 'var(--text)' }}>{o.quantity}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>Created</div>
                    <div className="mono" style={{ fontSize: 12, color: 'var(--text)' }}>{formatTime(o.createdAt)}</div>
                  </div>
                  {o.triggeredAt && (
                    <div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 2 }}>Triggered</div>
                      <div className="mono" style={{ fontSize: 12, color: 'var(--text)' }}>{formatTime(o.triggeredAt)}</div>
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {o.status === 'pending' && (
                    <button onClick={() => handleCancel(o)} className="btn-ghost" style={{ fontSize: 11, padding: '5px 9px' }}>Cancel</button>
                  )}
                  {o.txDigest && (
                    <a href={`https://suiexplorer.com/txblock/${o.txDigest}?network=testnet`} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--blue-bright)', textDecoration: 'none', fontSize: 11 }}>
                      Tx <ExternalLink size={10} />
                    </a>
                  )}
                  <Clock size={10} color="var(--text-muted)" />
                </div>
              </div>

              {o.error && <div style={{ color: 'var(--red)', fontSize: 11, lineHeight: 1.4 }}>{o.error}</div>}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
