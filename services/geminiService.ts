
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { Blockchain } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Tool 1: Circle Wallets Balance Check
const checkBalancesTool: FunctionDeclaration = {
  name: 'checkBalances',
  description: 'Retrieves real-time USDC balances across Ethereum Sepolia, Solana Devnet, and Polygon Amoy using Circle Developer Wallets API.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      walletSetId: { type: Type.STRING, description: 'Optional: Specific wallet set to check.' }
    }
  }
};

// Tool 2: Circle Bridge Kit Orchestration
const initiateBridgeTool: FunctionDeclaration = {
  name: 'initiateBridge',
  description: 'Uses Circle Bridge Kit to transfer USDC between blockchains. Essential when funds are on the wrong chain for a purchase.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      fromChain: { type: Type.STRING, enum: Object.values(Blockchain) },
      toChain: { type: Type.STRING, enum: Object.values(Blockchain) },
      amount: { type: Type.STRING, description: 'Amount of USDC (e.g., "10.00")' }
    },
    required: ['fromChain', 'toChain', 'amount']
  }
};

// Tool 3: Thirdweb x402 Payment Facilitator
const executePaymentTool: FunctionDeclaration = {
  name: 'executePayment',
  description: 'Triggers a gasless x402 payment settlement via the Thirdweb Facilitator. Uses EIP-7702 for gasless execution on EVM.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      itemId: { type: Type.STRING },
      price: { type: Type.STRING },
      network: { type: Type.STRING, description: 'The network where the payment is settled.' }
    },
    required: ['itemId', 'price', 'network']
  }
};

export const systemInstruction = `
You are the OmniCommerce AI Agent. You manage a real commerce stack:
1. Circle Developer Wallets (Asset Storage)
2. Circle Bridge Kit (Cross-chain Liquidity)
3. Thirdweb x402 (Gasless Settlement)

PROTOCOL:
- When a user wants to buy something, FIRST check balances on all chains.
- If the target chain has insufficient funds, find a source chain with funds and use 'initiateBridge'.
- Once funds are ready, use 'executePayment'.
- NEVER make up transaction hashes. Use the data provided by the tools.
- Explain the benefits of x402 (gasless) and Bridge Kit (interoperability) to the user.
`;

export const getAgentResponse = async (history: any[], currentMessage: string) => {
  return await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [...history, { role: 'user', parts: [{ text: currentMessage }] }],
    config: {
      systemInstruction: systemInstruction,
      tools: [{ functionDeclarations: [checkBalancesTool, initiateBridgeTool, executePaymentTool] }]
    }
  });
};
