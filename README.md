# DeepFeed

**A plain-English trading terminal and AI execution layer for DeepBook on Sui.**

Built for Sui Overflow 2026 — DeepBook track.

---

## The Problem

DeepBook is Sui's native, institutional-grade central limit order book — fast, composable, and genuinely powerful. But it has no end-user interface. It's infrastructure meant for other apps, bots, and wallets to build on top of, not something a regular person can open and use.

If you wanted to trade on DeepBook directly today, you'd be looking at raw contract calls, a developer SDK, or a bare order book with no context. That gap is real: most retail users default to simpler (and often worse-priced) swap interfaces simply because DeepBook never got a front door.

## What DeepFeed Does

DeepFeed is that front door — plus something DeepBook doesn't have at all: **AI-driven conditional execution.**

- **Live order book & chart** — real DeepBook testnet data (SUI/DBUSDC and DEEP/DBUSDC), visualized clearly instead of raw numbers
- **Plain-English order placement** — every order explains what it will actually do before you submit it
- **AI assistant that can act, not just talk** — ask it to "buy 2 SUI when it drops below $3.10," and it places a real conditional order via tool-calling (powered by Groq / Llama 3.3 70B)
- **Real automated execution** — a backend watcher service monitors live prices and submits genuine signed transactions to DeepBook when your conditions are met, even while you're offline
- **Non-custodial by design** — your funds live in your own DeepBook BalanceManager. DeepFeed's execution wallet only ever holds a TradeCap (trading rights), never ownership — it can place orders on your behalf, but it can never withdraw your funds. Only your own wallet can do that.

## How It Works

1. Connect your Sui wallet
2. One-time setup: create a BalanceManager and grant DeepFeed a TradeCap (you keep full ownership)
3. Deposit SUI/DBUSDC into your BalanceManager
4. Place a conditional order — manually, or just ask the AI assistant
5. A backend service watches DeepBook prices every few seconds and executes your order the moment your condition is met
6. Withdraw anytime, independently, with your own wallet — DeepFeed is never in the loop for that

## Tech Stack

**Frontend**
- React + Vite
- `@mysten/dapp-kit` for wallet connection
- DeepBook v3 public REST indexer for live order book/price data
- `lightweight-charts` for the live candlestick chart
- Groq API (Llama 3.3 70B) for the AI assistant, with tool-calling for order creation

**Backend**
- Node.js + Express
- A dedicated execution wallet (Ed25519 keypair) that holds TradeCap-only permissions
- `node-cron` watcher loop polling DeepBook's indexer and submitting real `placeLimitOrder` transactions via `@mysten/deepbook-v3` and `@mysten/sui`

## Live Pools

| Pair | Status |
|---|---|
| SUI/DBUSDC | Live — real DeepBook testnet pool |
| DEEP/DBUSDC | Live — real DeepBook testnet pool |

DBUSDC is DeepBook's own testnet stablecoin (there is no real USDC pool on DeepBook testnet).

## Running Locally

**Frontend**
```bash
cd deepfeed
npm install
npm run dev
```

Create `deepfeed/.env`:
```
VITE_GROQ_API_KEY=your_groq_api_key
VITE_EXECUTION_WALLET_ADDRESS=0x... # printed by the backend on first run
```

**Backend**
```bash
cd deepfeed-backend
npm install
npm start
```

On first run, it generates an execution wallet and prints its address — fund it with testnet SUI via [faucet.sui.io](https://faucet.sui.io/) so it can pay gas for executing your conditional orders.

## Security Model

DeepFeed's execution wallet is granted a **TradeCap** on your BalanceManager — never owner rights. On-chain, this means:

- ✅ It can place and cancel orders on your behalf
- ❌ It can never withdraw or move your funds
- ✅ You can revoke access or withdraw at any time, independently, using your own wallet

This is the same trader/owner separation DeepBook's BalanceManager natively supports — DeepFeed doesn't bypass any security guarantees, it just uses the permission model DeepBook already provides.

## Roadmap

- Mainnet deployment
- Support for more conditional order types (trailing stop, DCA schedules)
- Post-trade AI insights — explaining fills and building a lightweight trading journal over time
- Embeddable widget so other Sui builders can drop DeepFeed's trading UI into their own apps

---

Built on [DeepBook v3](https://docs.sui.io/standards/deepbookv3) · [Sui Network](https://sui.io) · Sui Overflow 2026