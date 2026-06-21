import React, { useEffect, useState } from 'react'
import { useCurrentAccount } from '@mysten/dapp-kit'
import { Info, ArrowUpRight, ArrowDownLeft, Shield, Loader, CheckCircle, AlertTriangle } from 'lucide-react'
import BalanceManagerSetup from './BalanceManagerSetup'
import { createConditionalOrder } from '../lib/conditionalOrders'
import BalanceManagerDeposit from './BalanceManagerDeposit'
import ManagerBalance from './ManagerBalance'
import BalanceManagerWithdraw from './BalanceManagerWithdraw'

const LIVE_PAIR_IDS = ['SUI_DBUSDC', 'DEEP_DBUSDC']

export default function OrderPlacement({ pair, automationSetup, onSetupComplete, onOrderCreated }) {
  const account = useCurrentAccount()
  const [side, setSide] = useState('buy')
  const [triggerType, setTriggerType] = useState('price_below')
  const [triggerPrice, setTriggerPrice] = useState(pair.price.toFixed(4))
  const [quantity, setQuantity] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    setTriggerPrice(pair.price.toFixed(4))
    setSuccess(null)
    setError(null)
  }, [pair.id])

  
  const total = triggerPrice && quantity ? (parseFloat(triggerPrice) * parseFloat(quantity)).toFixed(2) : '—'
  const isLivePair = LIVE_PAIR_IDS.includes(pair.id)
  const canSubmit = account && automationSetup && isLivePair && triggerPrice && quantity && Number(triggerPrice) > 0 && Number(quantity) > 0 && !submitting

  const explanation = () => {
    if (!account) return 'Connect your Sui wallet to create automated DeepBook orders.'
    if (!automationSetup) return 'Set up automated trading once. DeepFeed receives TradeCap only, never owner or withdrawal rights.'
    if (!isLivePair) return `${pair.base}/${pair.quote} is simulated in this demo, so conditional execution is disabled for this pair.`
    if (!quantity) return 'Enter a quantity to arm a conditional order.'
    const direction = triggerType === 'price_below' ? 'drops to or below' : 'rises to or above'
    return `When ${pair.base}/${pair.quote} ${direction} $${triggerPrice}, DeepFeed will ${side} ${quantity} ${pair.base} on DeepBook testnet using your delegated TradeCap.`
  }

  async function handleSubmit() {
    if (!canSubmit) return
    setSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const order = await createConditionalOrder({
        userAddress: account.address,
        balanceManagerAddress: automationSetup.balanceManagerAddress,
        tradeCapId: automationSetup.tradeCapId,
        pairId: pair.id,
        side,
        triggerType,
        triggerPrice: Number(triggerPrice),
        quantity: Number(quantity),
      })
      setSuccess(order)
      setQuantity('')
      onOrderCreated?.(order)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (!account) {
    return (
      <div className="dissolve-in" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 18, overflowY: 'auto', paddingRight: 2 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
          <span className="mono" style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>AUTOMATED ORDERS</span>
          <Shield size={14} color="var(--blue-bright)" />
        </div>
        <div style={{ textAlign: 'center', padding: '36px 12px', color: 'var(--text-muted)', fontSize: 13, lineHeight: 1.6 }}>
          Connect your Sui wallet from the top bar to set up conditional order execution.
        </div>
      </div>
    )
  }

  if (!automationSetup) {
    return (
      <div className="dissolve-in" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 18, overflowY: 'auto', paddingRight: 2 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
          <span className="mono" style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>AUTOMATED ORDERS</span>
          <Shield size={14} color="var(--blue-bright)" />
        </div>
        <BalanceManagerSetup onComplete={onSetupComplete} />
      </div>
    )
  }

  return (
    <div className="dissolve-in" style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 18, overflowY: 'auto', paddingRight: 2 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 10, borderBottom: '1px solid var(--border)' }}>
        <span className="mono" style={{ fontSize: 12, color: 'var(--text-muted)', letterSpacing: '0.08em' }}>CONDITIONAL ORDER</span>
        <span className="mono" style={{ fontSize: 11, color: isLivePair ? 'var(--blue-bright)' : 'var(--text-muted)' }}>{pair.base}/{pair.quote}</span>
      </div>

      <div style={{ background: '#10B98112', border: '1px solid #10B98144', borderRadius: 8, padding: '9px 12px', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
        <CheckCircle size={14} color="var(--green)" style={{ marginTop: 2, flexShrink: 0 }} />
        <div style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.5 }}>
          Automation ready. Manager <span className="mono">{automationSetup.balanceManagerAddress.slice(0, 8)}...</span>
        </div>
      </div>
      <ManagerBalance
  balanceManagerAddress={automationSetup.balanceManagerAddress}
  tradeCapId={automationSetup.tradeCapId}
  refreshKey={success ? success.id : 0}
/>
        <details style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px' }}>
  <summary style={{ cursor: 'pointer', fontSize: 12, color: 'var(--blue-bright)', fontFamily: 'JetBrains Mono, monospace' }}>
    Deposit funds into your trading account
  </summary>
  <div style={{ marginTop: 12 }}>
    <BalanceManagerDeposit balanceManagerAddress={automationSetup.balanceManagerAddress} />
  </div>
</details>

<details style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', borderRadius: 8, padding: '12px 14px' }}>
  <summary style={{ cursor: 'pointer', fontSize: 12, color: 'var(--red)', fontFamily: 'JetBrains Mono, monospace' }}>
    Withdraw funds from your trading account
  </summary>
  <div style={{ marginTop: 12 }}>
    <BalanceManagerWithdraw
      balanceManagerAddress={automationSetup.balanceManagerAddress}
      onWithdraw={() => setSuccess(null)}
    />
  </div>
</details>
      {!isLivePair && (
        <div style={{ background: '#EF444412', border: '1px solid #EF444444', borderRadius: 8, padding: '9px 12px', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <AlertTriangle size={14} color="var(--red)" style={{ marginTop: 2, flexShrink: 0 }} />
          <div style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.5 }}>
           Conditional execution is only enabled for live SUI/DBUSDC and DEEP/DBUSDC testnet pools.
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
        <button onClick={() => setSide('buy')} style={{ padding: '10px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, background: side === 'buy' ? 'var(--green)' : 'var(--bg-3)', color: side === 'buy' ? '#fff' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <ArrowUpRight size={15} /> Buy
        </button>
        <button onClick={() => setSide('sell')} style={{ padding: '10px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14, background: side === 'sell' ? 'var(--red)' : 'var(--bg-3)', color: side === 'sell' ? '#fff' : 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
          <ArrowDownLeft size={15} /> Sell
        </button>
      </div>

      <div style={{ display: 'flex', gap: 6 }}>
        {[
          ['price_below', 'Below'],
          ['price_above', 'Above'],
        ].map(([value, label]) => (
          <button key={value} className={`tab ${triggerType === value ? 'active' : ''}`} onClick={() => setTriggerType(value)} style={{ flex: 1 }}>
            Price {label}
          </button>
        ))}
      </div>

      <div>
       <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Trigger Price ({pair.base})</label>
        <input className="input" type="number" min="0" step="any" value={triggerPrice} onChange={e => setTriggerPrice(e.target.value)} placeholder="0.0000" />
      </div>

      <div>
        <label style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 6 }}>Quantity ({pair.base})</label>
        <input className="input" type="number" min="0" step="any" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="0.00" />
      </div>

      <div style={{ background: 'var(--bg-3)', borderRadius: 8, padding: '12px 14px', display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Estimated Notional</span>
        <span className="mono" style={{ fontSize: 13, color: 'var(--text)' }}>{total !== '—' ? `$${total}` : '—'}</span>
      </div>

      <div style={{ background: '#2563EB0D', border: '1px solid #2563EB33', borderRadius: 8, padding: '12px 14px', display: 'flex', gap: 10 }}>
        <Info size={14} color="var(--blue-bright)" style={{ flexShrink: 0, marginTop: 2 }} />
        <p style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.6 }}>{explanation()}</p>
      </div>

      {error && (
        <div style={{ background: '#EF44441A', border: '1px solid #EF444444', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: 'var(--red)', lineHeight: 1.5 }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ background: '#10B9811A', border: '1px solid #10B98144', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: 'var(--green)', lineHeight: 1.5 }}>
          ✓ Conditional order armed. Watcher will execute it when the trigger is met.
        </div>
      )}

      <button onClick={handleSubmit} disabled={!canSubmit} style={{ width: '100%', padding: '13px', borderRadius: 8, border: 'none', cursor: canSubmit ? 'pointer' : 'not-allowed', fontWeight: 700, fontSize: 14, fontFamily: 'JetBrains Mono, monospace', background: !canSubmit ? 'var(--bg-3)' : side === 'buy' ? 'var(--green)' : 'var(--red)', color: !canSubmit ? 'var(--text-muted)' : '#fff', transition: 'all 0.3s', opacity: submitting ? 0.8 : 1 }}>
        {submitting ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite', verticalAlign: 'middle', marginRight: 6 }} /> Arming...</> : `Arm ${side === 'buy' ? 'Buy' : 'Sell'} Trigger`}
      </button>
    </div>
  )
}
