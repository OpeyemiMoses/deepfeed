import React, { useState } from 'react'
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit'
import { Transaction } from '@mysten/sui/transactions'
import { ArrowDownToLine, Loader, ExternalLink } from 'lucide-react'

// Testnet DeepBook coin types (from @mysten/deepbook-v3 testnetCoins)
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

export default function BalanceManagerDeposit({ balanceManagerAddress }) {
  const account = useCurrentAccount()
  const client = useSuiClient()
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction()

  const [coinKey, setCoinKey] = useState('SUI')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  async function handleDeposit() {
    if (!account || !balanceManagerAddress || !amount) return
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const coin = COINS[coinKey]
      const depositAmount = Math.round(Number(amount) * coin.scalar)

      const tx = new Transaction()
      tx.setSender(account.address)

      // Split exact amount from the user's coins of this type, then deposit.
      const [depositCoin] = tx.splitCoins(
        coinKey === 'SUI' ? tx.gas : tx.object(await getCoinObjectId(client, account.address, coin.type)),
        [depositAmount]
      )

      tx.moveCall({
        target: `${DEEPBOOK_PACKAGE_ID}::balance_manager::deposit`,
        arguments: [tx.object(balanceManagerAddress), depositCoin],
        typeArguments: [coin.type],
      })

      const result = await signAndExecute({ transaction: tx })

      setSuccess({ digest: result.digest, amount, coinKey })
      setAmount('')
    } catch (err) {
      console.error('[Deposit] Failed:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 32, height: 32, borderRadius: 8, background: '#2563EB18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <ArrowDownToLine size={16} color="var(--blue-bright)" />
        </div>
        <div>
          <div className="mono" style={{ fontSize: 13, fontWeight: 600 }}>Deposit Funds</div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Fund your automated trading account</div>
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
            ✓ Deposited {success.amount} {success.coinKey}
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

      <button
        onClick={handleDeposit}
        disabled={loading || !amount}
        className="btn-primary"
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
      >
        {loading ? (
          <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Depositing...</>
        ) : (
          `Deposit ${coinKey}`
        )}
      </button>
    </div>
  )
}

/**
 * Finds a coin object of the given type owned by the address.
 * Needed for non-SUI coins since tx.gas only works for SUI itself.
 */
async function getCoinObjectId(client, address, coinType) {
  const coins = await client.getCoins({ owner: address, coinType })
  if (!coins.data.length) {
    throw new Error(`No ${coinType.split('::').pop()} coins found in your wallet. You may need to get testnet ${coinType.split('::').pop()} first.`)
  }
  return coins.data[0].coinObjectId
}