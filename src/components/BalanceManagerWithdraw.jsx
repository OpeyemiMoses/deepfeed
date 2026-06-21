import React, { useState } from 'react'
import { useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit'
import { Transaction } from '@mysten/sui/transactions'
import { ArrowUpFromLine, Loader, ExternalLink } from 'lucide-react'

const COINS = {
  SUI: {
    type: '0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI',
    scalar: 1_000_000_000,
  },
  DBUSDC: {
    type: '0xf7152c05930480cd740d7311b5b8b45c6f488e3a53a11c3f74a6fac36a52e0d7::DBUSDC::DBUSDC',
    scalar: 1_000_000,
  },
}

const DEEPBOOK_PACKAGE_ID = '0x22be4cade64bf2d02412c7e8d0e8beea2f78828b948118d46735315409371a3c'

export default function BalanceManagerWithdraw({ balanceManagerAddress, onWithdraw }) {
  const account = useCurrentAccount()
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction()

  const [coinKey, setCoinKey] = useState('SUI')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  async function handleWithdraw(withdrawAll = false) {
    if (!account || !balanceManagerAddress) return
    if (!withdrawAll && !amount) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const coin = COINS[coinKey]
      const tx = new Transaction()
      tx.setSender(account.address)

      let coinObject
      if (withdrawAll) {
        coinObject = tx.moveCall({
          target: `${DEEPBOOK_PACKAGE_ID}::balance_manager::withdraw_all`,
          arguments: [tx.object(balanceManagerAddress)],
          typeArguments: [coin.type],
        })
      } else {
        const withdrawAmount = Math.round(Number(amount) * coin.scalar)
        coinObject = tx.moveCall({
          target: `${DEEPBOOK_PACKAGE_ID}::balance_manager::withdraw`,
          arguments: [tx.object(balanceManagerAddress), tx.pure.u64(withdrawAmount)],
          typeArguments: [coin.type],
        })
      }

      tx.transferObjects([coinObject], account.address)

      const result = await signAndExecute({ transaction: tx })

      setSuccess({ digest: result.digest, amount: withdrawAll ? 'all' : amount, coinKey })
      setAmount('')
      onWithdraw?.()
    } catch (err) {
      console.error('[Withdraw] Failed:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: '#EF44441A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ArrowUpFromLine size={16} color="var(--red)" />
        </div>
        <div>
          <div className="mono" style={{ fontSize: 13, fontWeight: 600 }}>Withdraw Funds</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Only you can withdraw — DeepFeed cannot</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6 }}>
        {Object.keys(COINS).map((key) => {
          const isActive = coinKey === key
          const tabClass = isActive ? 'tab active' : 'tab'
          return (
            <button key={key} onClick={() => setCoinKey(key)} className={tabClass} style={{ flex: 1 }}>
              {key}
            </button>
          )
        })}
      </div>

      <input
        className="input"
        type="number"
        placeholder="0.00"
        value={amount}
        onChange={e => setAmount(e.target.value)}
      />

      {error && (
        <div style={{ background: '#EF44441A', border: '1px solid #EF444444', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: 'var(--red)' }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ background: '#10B9811A', border: '1px solid #10B98144', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
          <div style={{ color: 'var(--green)', fontWeight: 600, marginBottom: 4 }}>
            ✓ Withdrew {success.amount} {success.coinKey}
          </div>
          
            < a href={`https://suiscan.xyz/testnet/tx/${success.digest}`}
            target="_blank"
            rel="noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--blue-bright)', fontSize: 11 }}
          >
            View transaction <ExternalLink size={10} />
          </a>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          onClick={() => handleWithdraw(false)}
          disabled={loading || !amount}
          className="btn-primary"
          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'var(--red)' }}
        >
          {loading ? <Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> : `Withdraw ${coinKey}`}
        </button>
        <button
          onClick={() => handleWithdraw(true)}
          disabled={loading}
          className="btn-ghost"
          style={{ flex: 1 }}
        >
          Withdraw All
        </button>
      </div>
    </div>
  )
}