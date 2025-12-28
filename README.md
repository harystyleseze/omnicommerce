# OmniCommerce AI Agent 🤖💳

A production-ready **Agentic Commerce** prototype that abstracts the complexities of Web3 cross-chain operations into a natural language interface. Built with **Gemini 3 Pro**, **Circle Developer Wallets**, **Circle Bridge Kit**, and **Thirdweb x402**.

## 🚀 Overview

OmniCommerce allows users to purchase digital and physical goods across multiple blockchains (Ethereum Sepolia, Polygon Amoy, Solana Devnet) without ever worrying about gas fees or manual bridging. The AI Agent acts as a financial orchestrator, automatically moving liquidity where it's needed to settle transactions gaslessly.

## 🛠 Tech Stack

- **AI Orchestration**: [Gemini 3 Pro](https://ai.google.dev/) via Function Calling.
- **Wallet Infrastructure**: [Circle Programmable Wallets (W3S)](https://www.circle.com/en/developer-controlled-wallets).
- **Cross-Chain Liquidity**: [Circle Bridge Kit](https://www.circle.com/en/bridge-kit).
- **Gasless Payments**: [Thirdweb x402 Facilitator](https://portal.thirdweb.com/connect/pay/x402) (leveraging EIP-7702).
- **Frontend**: React 19, Tailwind CSS, Lucide Icons.

## 🔑 Environment Variables

The application requires the following keys to be functional in a production/testnet environment:

| Variable | Description |
|----------|-------------|
| `process.env.API_KEY` | Google Gemini API Key (Gemini 3 Pro access). |
| `CIRCLE_API_KEY` | Circle Developer Console API Key. |
| `CIRCLE_ENTITY_SECRET` | 32-byte hex string for encrypting wallet operations. |
| `THIRDWEB_SECRET_KEY` | For x402 settlement facilitation (server-side). |

## 🧠 Agentic Reasoning Flow

1. **Intent**: User asks "Buy the NFT with my USDC on Amoy."
2. **Analysis**: Agent calls `checkBalances()` across all configured networks.
3. **Logic**:
    - If funds are on the wrong chain: Agent calls `initiateBridge()`.
    - Once liquidity arrives: Agent calls `executePayment()` via x402.
4. **Settlement**: Transaction is submitted gaslessly via EIP-7702; items are "Unlocked" in the UI.

## 📖 Features

- **Multi-Chain Dashboard**: Real-time balance tracking for USDC on testnets.
- **Smart Bridging**: Automatic detection of cross-chain liquidity needs.
- **Gasless Checkout**: Pay with USDC, avoid the "gas token" hurdle.
- **Interactive Logs**: See exactly what the AI is thinking and doing on-chain.

## 🚧 Setup

1. Clone the repository.
2. Ensure `process.env.API_KEY` is available in your environment.
3. Open `index.html` in a local server environment (ESM modules required).
