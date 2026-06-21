import express from 'express'
import cors from 'cors'
import cron from 'node-cron'
import {
  createConditionalOrder,
  getOrdersForUser,
  cancelOrder,
} from './orderStore.js'
import { checkConditionalOrders } from './watcher.js'
import { executionWallet } from './deepbookClient.js'
import { buildDeepBookClientForManager } from './deepbookClient.js'

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 4000

const POOL_CONFIG = {
  SUI_DBUSDC: { poolKey: 'SUI_DBUSDC', poolName: 'SUI_DBUSDC' },
  DEEP_DBUSDC: { poolKey: 'DEEP_DBUSDC', poolName: 'DEEP_DBUSDC' },
}
app.get('/health', (req, res) => {
  res.json({ status: 'ok', executionWallet: executionWallet.toSuiAddress() })
})

app.get('/balance/:balanceManagerAddress/:tradeCapId/:coinKey', async (req, res) => {
  const { balanceManagerAddress, tradeCapId, coinKey } = req.params
  try {
    const dbClient = buildDeepBookClientForManager(balanceManagerAddress, tradeCapId)
    const result = await dbClient.checkManagerBalance('USER_MANAGER', coinKey)
    res.json(result)
  } catch (err) {
    console.error('[Balance] Failed:', err.message)
    res.status(500).json({ error: err.message })
  }
})
app.post('/orders', (req, res) => {
  const {
    userAddress,
    balanceManagerAddress,
    tradeCapId,
    pairId,
    side,
    triggerType,
    triggerPrice,
    quantity,
  } = req.body

  if (!userAddress || !balanceManagerAddress || !tradeCapId || !pairId) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const poolConfig = POOL_CONFIG[pairId]
  if (!poolConfig) {
    return res.status(400).json({ error: `No live pool available for ${pairId}` })
  }

  if (!['buy', 'sell'].includes(side)) {
    return res.status(400).json({ error: 'side must be buy or sell' })
  }
  if (!['price_below', 'price_above'].includes(triggerType)) {
    return res.status(400).json({ error: 'triggerType must be price_below or price_above' })
  }
  if (!triggerPrice || triggerPrice <= 0) {
    return res.status(400).json({ error: 'triggerPrice must be positive' })
  }
  if (!quantity || quantity <= 0) {
    return res.status(400).json({ error: 'quantity must be positive' })
  }

  const order = createConditionalOrder({
    userAddress,
    balanceManagerAddress,
    tradeCapId,
    poolKey: poolConfig.poolKey,
    poolName: poolConfig.poolName,
    pairId,
    side,
    triggerType,
    triggerPrice: Number(triggerPrice),
    quantity: Number(quantity),
  })

  res.status(201).json(order)
})

app.get('/orders/:userAddress', (req, res) => {
  const orders = getOrdersForUser(req.params.userAddress)
  res.json(orders)
})

app.post('/orders/:id/cancel', (req, res) => {
  const { userAddress } = req.body
  if (!userAddress) {
    return res.status(400).json({ error: 'userAddress is required' })
  }
  const order = cancelOrder(req.params.id, userAddress)
  if (!order) {
    return res.status(404).json({ error: 'Order not found or not owned by this user' })
  }
  res.json(order)
})

cron.schedule('*/10 * * * * *', () => {
  checkConditionalOrders().catch(err => {
    console.error('[Watcher] Unexpected error in check loop:', err)
  })
})

app.listen(PORT, () => {
  console.log(`[DeepFeed Backend] Listening on port ${PORT}`)
  console.log(`[DeepFeed Backend] Execution wallet: ${executionWallet.toSuiAddress()}`)
  console.log(`[DeepFeed Backend] Fund this address with testnet SUI: https://faucet.sui.io/`)
})