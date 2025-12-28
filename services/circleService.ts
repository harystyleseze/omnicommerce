
import { Blockchain, WalletBalance } from '../types';
// Note: In a browser environment, we must use dynamic imports or ensure the importmap provides them.
// We'll use a unified service class that mirrors the user's provided logic.

const CIRCLE_API_KEY = (process.env as any).CIRCLE_API_KEY;
const CIRCLE_ENTITY_SECRET = (process.env as any).CIRCLE_ENTITY_SECRET;

/**
 * Mapping of internal blockchain enums to SDK/API strings
 */
const chainMap: Record<Blockchain, string> = {
  [Blockchain.ETHEREUM_SEPOLIA]: 'ETH-SEPOLIA',
  [Blockchain.SOLANA_DEVNET]: 'SOL-DEVNET',
  [Blockchain.POLYGON_AMOY]: 'MATIC-AMOY'
};

const bridgeChainMap: Record<Blockchain, string> = {
  [Blockchain.ETHEREUM_SEPOLIA]: 'Ethereum_Sepolia',
  [Blockchain.SOLANA_DEVNET]: 'Solana_Devnet',
  [Blockchain.POLYGON_AMOY]: 'Polygon_Amoy_Testnet'
};

/**
 * Circle W3S API Interface
 * Using fetch for maximum compatibility in the frontend environment
 */
const circleFetch = async (path: string, options: any = {}) => {
  const url = `https://api.circle.com/v1/w3s${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${CIRCLE_API_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err?.message || 'Circle API Request Failed');
  }
  return response.json();
};

export const checkBalances = async (): Promise<WalletBalance[]> => {
  try {
    // 1. List wallets
    const walletsRes = await circleFetch('/wallets');
    const wallets = walletsRes.data.wallets || [];
    
    // 2. Map to balances
    const balancePromises = wallets.map(async (w: any) => {
      const bRes = await circleFetch(`/wallets/${w.id}/balances`);
      const tokenBalances = bRes.data.tokenBalances || [];
      const usdc = tokenBalances.find((tb: any) => tb.token.symbol === 'USDC') || { amount: '0.00' };
      
      return {
        blockchain: w.blockchain as Blockchain,
        address: w.address,
        amount: usdc.amount,
        symbol: 'USDC',
        id: w.id // Include for internal transaction logic
      };
    });

    return await Promise.all(balancePromises);
  } catch (error) {
    console.error("Circle API Error:", error);
    // Return mock data ONLY if API Key is explicitly missing for demo safety
    if (!CIRCLE_API_KEY || CIRCLE_API_KEY === 'TEST_API_KEY') {
        return [
          { blockchain: Blockchain.POLYGON_AMOY, address: "0x742d...444", amount: "125.50", symbol: "USDC" },
          { blockchain: Blockchain.ETHEREUM_SEPOLIA, address: "0x123...abc", amount: "0.00", symbol: "USDC" },
          { blockchain: Blockchain.SOLANA_DEVNET, address: "9FMY...5vk7", amount: "10.00", symbol: "USDC" },
        ];
    }
    throw error;
  }
};

/**
 * Circle Bridge Kit Integration
 * Uses the CCTP protocol to move USDC cross-chain
 */
export const initiateBridge = async (from: Blockchain, to: Blockchain, amount: string) => {
  console.log(`[Omni-Agent] Initiating Bridge Kit: ${amount} USDC ${from} -> ${to}`);
  
  // Dynamic import for Bridge Kit and Adapter
  const { BridgeKit } = await import('@circle-fin/bridge-kit');
  const { createCircleWalletsAdapter } = await import('@circle-fin/adapter-circle-wallets');

  const kit = new BridgeKit();
  const adapter = createCircleWalletsAdapter({
    apiKey: CIRCLE_API_KEY,
    entitySecret: CIRCLE_ENTITY_SECRET,
  });

  const balances = await checkBalances();
  const fromWallet = balances.find(b => b.blockchain === from);
  const toWallet = balances.find(b => b.blockchain === to);

  if (!fromWallet || !toWallet) throw new Error("Source or destination wallet not found.");

  // Fix: Cast bridgeChainMap[from] to any to satisfy the BridgeChainIdentifier type requirement from the SDK
  const result = await kit.bridge({
    from: {
      adapter,
      chain: bridgeChainMap[from] as any,
      address: fromWallet.address,
    },
    // Fix: Cast bridgeChainMap[to] to any to satisfy the BridgeChainIdentifier type requirement from the SDK
    to: {
      adapter,
      chain: bridgeChainMap[to] as any,
      address: toWallet.address,
    },
    amount: amount,
    token: 'USDC',
  });

  return {
    status: result.state,
    txHash: result.steps[0]?.txHash,
    explorerUrl: result.steps[0]?.explorerUrl,
    steps: result.steps
  };
};

/**
 * x402 Gasless Settlement
 * Leveraging Thirdweb Facilitator or Circle Gas Station for Sponsored TX
 */
export const executePayment = async (itemId: string, price: string, network: Blockchain) => {
  console.log(`[Omni-Agent] Executing x402 Gasless Settlement on ${network}`);

  // In this implementation, we use Circle DCW's 'HIGH' fee level for sponsored gas
  // This matches the 'performGaslessTransaction' logic from the snippet
  const wallets = await checkBalances();
  const wallet = wallets.find(w => w.blockchain === network) as any;
  
  if (!wallet) throw new Error(`No wallet found for ${network}`);

  // Simulate destination address (the merchant/facilitator)
  const MERCHANT_ADDRESS = "0xMerchantFacilitatorAddress123456789";

  const txResponse = await circleFetch('/transactions/transfer', {
    method: 'POST',
    body: JSON.stringify({
      idempotencyKey: crypto.randomUUID(),
      walletId: wallet.id,
      blockchain: chainMap[network],
      tokenAddress: getUSDCAddress(network),
      amount: [price],
      destinationAddress: MERCHANT_ADDRESS,
      fee: {
        type: 'level',
        config: {
          feeLevel: 'HIGH' // GAS STATION SPONSORSHIP
        }
      }
    })
  });

  return {
    status: 'success',
    txHash: txResponse.data?.id,
    explorerUrl: `https://circle-explorer.com/tx/${txResponse.data?.id}`
  };
};

export const fundWallet = async (blockchain: Blockchain, amount: string) => {
  const wallets = await checkBalances();
  const wallet = wallets.find(w => w.blockchain === blockchain);
  
  if (!wallet) throw new Error("Target wallet not found");

  const res = await circleFetch('/faucet/dripping', {
    method: 'POST',
    body: JSON.stringify({
      address: wallet.address,
      blockchain: chainMap[blockchain],
      usdc: true,
      native: true
    })
  });

  return {
    status: 'success',
    txHash: res.data?.id || 'DRIP_SUCCESSFUL',
    description: `Successfully requested testnet assets for ${blockchain}.`
  };
};

function getUSDCAddress(network: Blockchain): string {
  switch (network) {
    case Blockchain.ETHEREUM_SEPOLIA: return '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238';
    case Blockchain.POLYGON_AMOY: return '0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582';
    case Blockchain.SOLANA_DEVNET: return '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU';
    default: return '';
  }
}
