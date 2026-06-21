import React, { useState } from 'react'
import { Transaction } from '@mysten/sui/transactions'
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit'
import { Shield, ChevronRight, CheckCircle, Loader } from 'lucide-react'

const DEEPBOOK_PACKAGE_ID = '0x22be4cade64bf2d02412c7e8d0e8beea2f78828b948118d46735315409371a3c'
const EXECUTION_WALLET = import.meta.env.VITE_EXECUTION_WALLET_ADDRESS

const STEPS = [
  { id: 'create', label: 'Create BalanceManager', desc: 'A shared on-chain account that holds your trading funds.' },
  { id: 'tradecap', label: 'Grant Trading Rights', desc: 'Allows DeepFeed to place orders on your behalf. You keep full ownership.' },
  { id: 'done', label: 'Ready', desc: 'Automated trading is set up. You can withdraw anytime.' },
]

export default function BalanceManagerSetup({ onComplete }) {
  const account = useCurrentAccount()
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(null)
  const client = useSuiClient()

async function handleSetup() {
  if (!account) return
  setLoading(true)
  setError(null)

  try {
    const tx = new Transaction()
    tx.setSender(account.address)

    const manager = tx.moveCall({
      target: `${DEEPBOOK_PACKAGE_ID}::balance_manager::new`,
    })

    const tradeCap = tx.moveCall({
      target: `${DEEPBOOK_PACKAGE_ID}::balance_manager::mint_trade_cap`,
      arguments: [manager],
    })

    tx.transferObjects([tradeCap], EXECUTION_WALLET)

    tx.moveCall({
      target: '0x2::transfer::public_share_object',
      arguments: [manager],
      typeArguments: [`${DEEPBOOK_PACKAGE_ID}::balance_manager::BalanceManager`],
    })

    setStep(1)

    const txResult = await signAndExecute({ transaction: tx })

    setStep(2)

    // Fetch full transaction details with object changes to extract created IDs
    const txDetails = await client.waitForTransaction({
      digest: txResult.digest,
      options: { showObjectChanges: true },
    })

    const created = txDetails.objectChanges?.filter(c => c.type === 'created') || []

    const managerObj = created.find(o =>
      o.objectType?.includes('balance_manager::BalanceManager')
    )
    const tradeCapObj = created.find(o =>
      o.objectType?.includes('balance_manager::TradeCap')
    )

    if (!managerObj || !tradeCapObj) {
      throw new Error(
        'Could not find created objects. Check Sui Explorer: https://suiexplorer.com/txblock/' + txResult.digest + '?network=testnet'
      )
    }

    const setupResult = {
      balanceManagerAddress: managerObj.objectId,
      tradeCapId: tradeCapObj.objectId,
      txDigest: txResult.digest,
    }

    console.log('[Setup] Complete:', setupResult)
    setResult(setupResult)
    onComplete(setupResult)

  } catch (err) {
    console.error('[Setup] Failed:', err)
    setError(err.message)
    setStep(0)
  } finally {
    setLoading(false)
  }
}

  if (!account) {
    return (
      <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)', fontSize: 14 }}>
        Connect your wallet to set up automated trading.
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 36, height: 36, borderRadius: 9, background: '#2563EB18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Shield size={18} color="var(--blue-bright)" />
        </div>
        <div>
          <div className="mono" style={{ fontSize: 14, fontWeight: 600 }}>Set Up Automated Trading</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>One-time on-chain setup — you stay in control</div>
        </div>
      </div>

      {/* Steps */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {STEPS.map((s, i) => (
          <div key={s.id} style={{
            display: 'flex', alignItems: 'flex-start', gap: 12,
            padding: '12px 14px', borderRadius: 8,
            background: i === step ? '#2563EB0D' : 'var(--bg-3)',
            border: `1px solid ${i === step ? 'var(--blue)' : 'var(--border)'}`,
            transition: 'all 0.2s',
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%', flexShrink: 0, marginTop: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: i < step ? 'var(--green)' : i === step ? 'var(--blue)' : 'var(--bg-card)',
              border: `1px solid ${i < step ? 'var(--green)' : i === step ? 'var(--blue)' : 'var(--border)'}`,
            }}>
              {i < step
                ? <CheckCircle size={12} color="#fff" />
                : <span className="mono" style={{ fontSize: 10, color: i === step ? '#fff' : 'var(--text-muted)' }}>{i + 1}</span>
              }
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: i === step ? 'var(--text)' : 'var(--text-muted)' }}>{s.label}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2, lineHeight: 1.5 }}>{s.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Security note */}
      <div style={{ background: '#2563EB0D', border: '1px solid #2563EB33', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.6 }}>
        ℹ DeepFeed can place and cancel orders, but <strong>can never withdraw your funds</strong>. Only your connected wallet can do that.
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: '#EF44441A', border: '1px solid #EF444444', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: 'var(--red)', lineHeight: 1.5 }}>
          {error}
        </div>
      )}

      {/* Result */}
      {result && (
        <div style={{ background: '#10B9811A', border: '1px solid #10B98144', borderRadius: 8, padding: '12px 14px', fontSize: 12, lineHeight: 1.7 }}>
          <div style={{ color: 'var(--green)', fontWeight: 600, marginBottom: 6 }}>✓ Setup complete</div>
          <div style={{ color: 'var(--text-muted)' }}>Manager: <span className="mono" style={{ color: 'var(--text-dim)' }}>{result.balanceManagerAddress.slice(0, 16)}...</span></div>
          <div style={{ color: 'var(--text-muted)' }}>TradeCap: <span className="mono" style={{ color: 'var(--text-dim)' }}>{result.tradeCapId.slice(0, 16)}...</span></div>
        </div>
      )}

      {/* CTA */}
      {step < 2 && (
        <button
          onClick={handleSetup}
          disabled={loading}
          className="btn-primary"
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
        >
          {loading ? (
            <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Processing...</>
          ) : (
            <>Set Up Now <ChevronRight size={14} /></>
          )}
        </button>
      )}
    </div>
  )
}