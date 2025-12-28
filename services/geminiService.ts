
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";
import { Blockchain } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const checkBalancesTool: FunctionDeclaration = {
  name: 'checkBalances',
  description: 'MANDATORY FIRST STEP: Retrieves real-time USDC balances across Circle Developer Wallets to determine if bridging is required.',
  parameters: { type: Type.OBJECT, properties: {} }
};

const fundWalletTool: FunctionDeclaration = {
  name: 'fundWallet',
  description: 'Adds USDC to a specific blockchain wallet using the Circle Testnet Faucet. Use this if the user is out of funds everywhere.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      blockchain: { type: Type.STRING, enum: Object.values(Blockchain) },
      amount: { type: Type.STRING, description: 'Amount to fund, e.g. "50.00"' }
    },
    required: ['blockchain', 'amount']
  }
};

const initiateBridgeTool: FunctionDeclaration = {
  name: 'initiateBridge',
  description: 'Triggers Circle Bridge Kit. Call this ONLY if checkBalances shows insufficient funds on the target chain but available funds on another chain.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      fromChain: { type: Type.STRING, enum: Object.values(Blockchain) },
      toChain: { type: Type.STRING, enum: Object.values(Blockchain) },
      amount: { type: Type.STRING }
    },
    required: ['fromChain', 'toChain', 'amount']
  }
};

const executePaymentTool: FunctionDeclaration = {
  name: 'executePayment',
  description: 'FINAL STEP: Executes a gasless x402 payment settlement. Only call this after ensuring the target chain has sufficient USDC.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      itemId: { type: Type.STRING },
      price: { type: Type.STRING },
      network: { type: Type.STRING }
    },
    required: ['itemId', 'price', 'network']
  }
};

export const systemInstruction = `
You are the OmniCommerce AI Intelligence. You control a real financial stack on testnet.

OPERATIONAL PROTOCOL:
1. When asked to purchase:
   - Call 'checkBalances'.
   - Analyze the JSON response.
   - If (Target Chain Balance < Price) AND (Other Chain Balance > Price): Call 'initiateBridge'.
   - If (Target Chain Balance >= Price): Call 'executePayment'.
   - If (Total Balance < Price): Call 'fundWallet' or ask the user to fund.

2. COMMUNICATION:
   - Be professional and transparent. 
   - Explain that you are using Circle Bridge Kit for liquidity and x402 for gasless settlement.
   - Mention the blockchain network names clearly.
`;

export const getAgentResponse = async (history: any[], currentMessage: string) => {
  return await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [...history, { role: 'user', parts: [{ text: currentMessage }] }],
    config: {
      systemInstruction: systemInstruction,
      tools: [{ functionDeclarations: [checkBalancesTool, fundWalletTool, initiateBridgeTool, executePaymentTool] }]
    }
  });
};
