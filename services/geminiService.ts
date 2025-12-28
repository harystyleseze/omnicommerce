
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { Blockchain } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const checkBalancesTool: FunctionDeclaration = {
  name: 'checkBalances',
  description: 'ESSENTIAL FIRST STEP: Retrieves the real-time USDC balance of all developer-controlled wallets across networks. Use this before every financial operation.',
  parameters: { type: Type.OBJECT, properties: {} }
};

const fundWalletTool: FunctionDeclaration = {
  name: 'fundWallet',
  description: 'Requests testnet USDC and Native tokens from the Circle Faucet for a specific blockchain. Use this if the user has insufficient total liquidity.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      blockchain: { type: Type.STRING, enum: Object.values(Blockchain), description: 'The network to fund.' },
      amount: { type: Type.STRING, description: 'Amount to request, e.g., "10.00"' }
    },
    required: ['blockchain', 'amount']
  }
};

const initiateBridgeTool: FunctionDeclaration = {
  name: 'initiateBridge',
  description: 'Triggers the Circle Bridge Kit (CCTP) to move USDC cross-chain. Call this ONLY if checkBalances shows the target chain has insufficient funds but another chain has available USDC.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      fromChain: { type: Type.STRING, enum: Object.values(Blockchain) },
      toChain: { type: Type.STRING, enum: Object.values(Blockchain) },
      amount: { type: Type.STRING, description: 'USDC amount to bridge.' }
    },
    required: ['fromChain', 'toChain', 'amount']
  }
};

const executePaymentTool: FunctionDeclaration = {
  name: 'executePayment',
  description: 'Triggers a gasless transaction (x402 Facilitator / Circle Gas Station). Call this to settle a purchase once USDC is confirmed on the target network.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      itemId: { type: Type.STRING },
      price: { type: Type.STRING },
      network: { type: Type.STRING, enum: Object.values(Blockchain) }
    },
    required: ['itemId', 'price', 'network']
  }
};

export const systemInstruction = `
You are the OmniCommerce Agentic Intelligence, a high-fidelity financial orchestrator.

YOUR CAPABILITIES:
1. Multi-Chain Management: You can view balances on Sepolia, Amoy, and Solana Devnet.
2. Invisible Bridging: You move liquidity using Circle Bridge Kit.
3. Gasless Settlement: You pay using x402 patterns where users don't need native gas.

YOUR OPERATIONAL PROTOCOL (FOLLOW STRICTLY):
- Always 'checkBalances' before proposing a purchase.
- If (Target Chain Balance >= Item Price): Execute Payment immediately.
- If (Target Chain Balance < Item Price) AND (Total Portfolio Balance >= Item Price): 
    1. Identify the chain with the most USDC.
    2. Initiate Bridge from that source to the target chain.
    3. Inform the user that bridging is taking place.
- If (Total Portfolio Balance < Item Price): Suggest 'fundWallet' via faucet.

Be concise, technical, and reassuring about the security of Circle and Thirdweb protocols.
`;

export const getAgentResponse = async (history: any[], currentMessage: string) => {
  return await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [...history, { role: 'user', parts: [{ text: currentMessage }] }],
    config: {
      systemInstruction: systemInstruction,
      tools: [{ functionDeclarations: [checkBalancesTool, fundWalletTool, initiateBridgeTool, executePaymentTool] }],
      thinkingConfig: { thinkingBudget: 4000 }
    }
  });
};
