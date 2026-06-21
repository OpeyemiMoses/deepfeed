const DEFAULT_BACKEND_URL = 'https://deepfeed.onrender.com'

export function getBackendUrl() {
  return (import.meta.env.VITE_DEEPFEED_BACKEND_URL || DEFAULT_BACKEND_URL).replace(/\/$/, '')
}

async function readJson(res) {
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || `Request failed with ${res.status}`)
  }
  return data
}

export async function createConditionalOrder(payload) {
  const res = await fetch(`${getBackendUrl()}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return readJson(res)
}

export async function listConditionalOrders(userAddress) {
  if (!userAddress) return []
  const res = await fetch(`${getBackendUrl()}/orders/${userAddress}`)
  return readJson(res)
}
export async function getManagerBalance(balanceManagerAddress, tradeCapId, coinKey) {
  const res = await fetch(`${getBackendUrl()}/balance/${balanceManagerAddress}/${tradeCapId}/${coinKey}`)
  return readJson(res)
}

export async function cancelConditionalOrder(id, userAddress) {
  const res = await fetch(`${getBackendUrl()}/orders/${id}/cancel`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userAddress }),
  })
  return readJson(res)
}
