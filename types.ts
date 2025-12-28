
export enum Blockchain {
  ETHEREUM_SEPOLIA = 'ETH-SEPOLIA',
  SOLANA_DEVNET = 'SOL-DEVNET',
  POLYGON_AMOY = 'MATIC-AMOY'
}

export interface WalletBalance {
  blockchain: Blockchain;
  address: string;
  amount: string;
  symbol: string;
}

export interface CommerceItem {
  id: string;
  name: string;
  description: string;
  price: string;
  currency: string;
  targetChain: Blockchain;
  image: string;
}

export interface AgentAction {
  type: 'BALANCE_CHECK' | 'BRIDGE' | 'PAYMENT' | 'WALLET_CREATE';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  description: string;
  txHash?: string;
  explorerUrl?: string;
}

export interface Message {
  role: 'user' | 'model';
  text: string;
  actions?: AgentAction[];
}
