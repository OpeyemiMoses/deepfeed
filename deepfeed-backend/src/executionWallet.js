import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519'
import { decodeSuiPrivateKey } from '@mysten/sui/cryptography'
import fs from 'fs'
import path from 'path'

const KEY_FILE = path.join(process.cwd(), '.execution-wallet-key')

export function getExecutionWallet() {
  if (process.env.EXECUTION_WALLET_PRIVATE_KEY) {
    const { secretKey } = decodeSuiPrivateKey(process.env.EXECUTION_WALLET_PRIVATE_KEY)
    return Ed25519Keypair.fromSecretKey(secretKey)
  }

  if (fs.existsSync(KEY_FILE)) {
    const stored = fs.readFileSync(KEY_FILE, 'utf-8').trim()
    const { secretKey } = decodeSuiPrivateKey(stored)
    return Ed25519Keypair.fromSecretKey(secretKey)
  }

  const keypair = Ed25519Keypair.generate()
  const exported = keypair.getSecretKey()
  fs.writeFileSync(KEY_FILE, exported, { mode: 0o600 })
  console.log('[ExecutionWallet] Generated new execution wallet:', keypair.toSuiAddress())
  console.log('[ExecutionWallet] Fund this address with testnet SUI for gas: https://faucet.sui.io/')
  return keypair
}