import { DeepBookClient } from '@mysten/deepbook-v3'
import { SuiClient, getFullnodeUrl } from '@mysten/sui/client'
import { getExecutionWallet } from './executionWallet.js'

const executionWallet = getExecutionWallet()

export const suiClient = new SuiClient({
  url: getFullnodeUrl('testnet'),
})

/**
 * Builds a DeepBookClient configured with a specific user's BalanceManager
 * registered under the key 'USER_MANAGER'. Each conditional order references
 * a specific user's BalanceManager address, so we construct a fresh client
 * per-request rather than a single shared instance.
 *
 * The execution wallet is passed as `address` purely as the default
 * transaction sender — it is NOT the BalanceManager owner. It only holds
 * a TradeCap on the manager, granted by the user beforehand.
 */
export function buildDeepBookClientForManager(balanceManagerAddress, tradeCapId) {
  return new DeepBookClient({
    address: executionWallet.toSuiAddress(),
    network: 'testnet',
    client: suiClient,
    balanceManagers: {
      USER_MANAGER: {
        address: balanceManagerAddress,
        tradeCap: tradeCapId,
      },
    },
  })
}

export { executionWallet }