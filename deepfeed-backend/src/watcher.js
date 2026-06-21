import { Transaction } from '@mysten/sui/transactions'
import { buildDeepBookClientForManager, suiClient, executionWallet } from './deepbookClient.js'
import { getCurrentPrice } from './priceService.js'
import { getPendingOrders, updateOrder } from './orderStore.js'

function friendlyAbortMessage(rawError) {
  if (rawError.includes('balance_manager') && rawError.includes('withdraw_with_proof')) {
    return 'Insufficient balance in your trading account for this order. Deposit more funds and try again.'
  }
  if (rawError.includes('order_info') && rawError.includes('validate_inputs')) {
    return 'Order size or price did not meet this pool\'s minimum requirements.'
  }
  return rawError
}

function isTriggered(order, currentPrice) {
  if (order.triggerType === 'price_below') return currentPrice <= order.triggerPrice
  if (order.triggerType === 'price_above') return currentPrice >= order.triggerPrice
  return false
}

async function executeOrder(order) {
  const dbClient = buildDeepBookClientForManager(order.balanceManagerAddress, order.tradeCapId)
  const tx = new Transaction()

  tx.add(
    dbClient.deepBook.placeLimitOrder({
      poolKey: order.poolKey,
      balanceManagerKey: 'USER_MANAGER',
      clientOrderId: Date.now(),
      price: order.triggerPrice,
      quantity: order.quantity,
      isBid: order.side === 'buy',
      payWithDeep: false,
    })
  )

  const result = await suiClient.signAndExecuteTransaction({
    transaction: tx,
    signer: executionWallet,
    options: { showEffects: true },
  })

  // signAndExecuteTransaction does NOT throw on a Move abort — the transaction
  // is genuinely submitted and gets a real digest even when it fails on-chain.
  // We have to explicitly check the execution status ourselves.
const status = result.effects?.status
if (status?.status !== 'success') {
  const rawReason = status?.error || 'Transaction aborted on-chain for an unknown reason.'
  const err = new Error(friendlyAbortMessage(rawReason))
  err.digest = result.digest
  err.rawError = rawReason
  throw err
}

  return result
}

export async function checkConditionalOrders() {
  const pending = getPendingOrders()
  if (pending.length === 0) return

  const poolsToCheck = [...new Set(pending.map(o => o.poolName))]
  const prices = {}

  for (const poolName of poolsToCheck) {
    try {
      prices[poolName] = await getCurrentPrice(poolName)
    } catch (err) {
      console.error(`[Watcher] Failed to fetch price for ${poolName}:`, err.message)
    }
  }

  for (const order of pending) {
    const currentPrice = prices[order.poolName]
    if (currentPrice === undefined) continue

    if (isTriggered(order, currentPrice)) {
      console.log(`[Watcher] Order ${order.id} triggered: ${order.poolName} @ ${currentPrice}`)
      try {
        const result = await executeOrder(order)
        updateOrder(order.id, {
          status: 'triggered',
          triggeredAt: new Date().toISOString(),
          txDigest: result.digest,
        })
        console.log(`[Watcher] Order ${order.id} executed. Digest: ${result.digest}`)
     } catch (err) {
  console.error(`[Watcher] Order ${order.id} execution failed:`, err.message)
  updateOrder(order.id, {
    status: 'failed',
    error: err.message,
    txDigest: err.digest || null,
  })
}
    }
  }
}