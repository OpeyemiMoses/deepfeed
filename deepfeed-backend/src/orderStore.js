import { randomUUID } from 'crypto'

const orders = new Map()

export function createConditionalOrder(params) {
  const id = randomUUID()
  const order = {
    id,
    status: 'pending',
    createdAt: new Date().toISOString(),
    triggeredAt: null,
    txDigest: null,
    error: null,
    ...params,
  }
  orders.set(id, order)
  return order
}

export function getOrder(id) {
  return orders.get(id)
}

export function getOrdersForUser(userAddress) {
  return [...orders.values()]
    .filter(o => o.userAddress === userAddress)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export function getPendingOrders() {
  return [...orders.values()].filter(o => o.status === 'pending')
}

export function updateOrder(id, updates) {
  const order = orders.get(id)
  if (!order) return null
  Object.assign(order, updates)
  return order
}

export function cancelOrder(id, userAddress) {
  const order = orders.get(id)
  if (!order || order.userAddress !== userAddress) return null
  if (order.status !== 'pending') return order
  order.status = 'cancelled'
  return order
}