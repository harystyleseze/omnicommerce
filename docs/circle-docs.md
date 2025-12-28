Circle AI

import { initiateDeveloperControlledWalletsClient } from '@circle-fin/developer-controlled-wallets';
import { BridgeKit } from '@circle-fin/bridge-kit';
import { createCircleWalletsAdapter } from '@circle-fin/adapter-circle-wallets';

// Environment variables - Replace with your actual values
const CIRCLE_API_KEY = process.env.CIRCLE_API_KEY!; // Your Circle API key
const CIRCLE_ENTITY_SECRET = process.env.CIRCLE_ENTITY_SECRET!; // Your Circle entity secret

// Wallet addresses for different chains - Replace with your actual wallet addresses
const ETHEREUM_SEPOLIA_WALLET_ADDRESS = process.env.ETHEREUM_SEPOLIA_WALLET_ADDRESS!;
const POLYGON_AMOY_WALLET_ADDRESS = process.env.POLYGON_AMOY_WALLET_ADDRESS!;
const SOLANA_DEVNET_WALLET_ADDRESS = process.env.SOLANA_DEVNET_WALLET_ADDRESS!;

// Wallet IDs for gas station operations - Replace with your actual wallet IDs
const ETHEREUM_SEPOLIA_WALLET_ID = process.env.ETHEREUM_SEPOLIA_WALLET_ID!;
const POLYGON_AMOY_WALLET_ID = process.env.POLYGON_AMOY_WALLET_ID!;
const SOLANA_DEVNET_WALLET_ID = process.env.SOLANA_DEVNET_WALLET_ID!;

class OmniCommerceAIAgent {
  private dcwClient: any;
  private bridgeKit: BridgeKit;
  private circleWalletsAdapter: any;

  constructor() {
    // Initialize Developer Controlled Wallets client
    this.dcwClient = initiateDeveloperControlledWalletsClient({
      apiKey: CIRCLE_API_KEY,
      entitySecret: CIRCLE_ENTITY_SECRET,
    });

    // Initialize Bridge Kit for cross-chain transfers
    this.bridgeKit = new BridgeKit();

    // Initialize Circle Wallets adapter for gasless transactions
    this.circleWalletsAdapter = createCircleWalletsAdapter({
      apiKey: CIRCLE_API_KEY,
      entitySecret: CIRCLE_ENTITY_SECRET,
    });

    // Set up bridge event listeners
    this.setupBridgeEventListeners();
  }

  private setupBridgeEventListeners(): void {
    // Listen to all bridge events
    this.bridgeKit.on('*', (payload) => {
      console.log(`Bridge event: ${payload.method}`);
    });

    // Listen to specific events
    this.bridgeKit.on('approve', (payload) => {
      console.log('Token approval completed');
    });

    this.bridgeKit.on('burn', (payload) => {
      console.log('Tokens burned on source chain');
    });

    this.bridgeKit.on('fetchAttestation', (payload) => {
      console.log('Attestation fetched');
    });

    this.bridgeKit.on('mint', (payload) => {
      console.log('Tokens minted on destination chain');
    });
  }

  // 1. Invisible Bridging - Cross-chain USDC transfers using CCTP
  async bridgeUSDC(
    fromChain: 'Ethereum_Sepolia' | 'Polygon_Amoy_Testnet' | 'Solana_Devnet',
    toChain: 'Ethereum_Sepolia' | 'Polygon_Amoy_Testnet' | 'Solana_Devnet',
    amount: string,
    recipientAddress?: string
  ) {
    try {
      console.log(`Initiating USDC bridge from ${fromChain} to ${toChain} for amount: ${amount}`);

      // Get wallet addresses for the chains
      const fromAddress = this.getWalletAddressForChain(fromChain);
      const toAddress = recipientAddress || this.getWalletAddressForChain(toChain);

      // Execute the bridge operation
      const result = await this.bridgeKit.bridge({
        from: {
          adapter: this.circleWalletsAdapter,
          chain: fromChain,
          address: fromAddress,
        },
        to: {
          adapter: this.circleWalletsAdapter,
          chain: toChain,
          address: toAddress,
          recipientAddress: recipientAddress,
        },
        amount: amount,
        config: {
          transferSpeed: 'FAST', // Use fast burn mode for quicker transfers
          maxFee: '1.0', // Maximum fee of 1 USDC
        },
        token: 'USDC',
      });

      if (result.state === 'success') {
        console.log('Bridge completed successfully!');
        console.log(`Amount bridged: ${result.amount} USDC`);
        console.log(`From: ${result.source.chain.name} (${result.source.address})`);
        console.log(`To: ${result.destination.chain.name} (${result.destination.address})`);
        
        // Log transaction steps
        result.steps.forEach((step, index) => {
          console.log(`Step ${index + 1}: ${step.name}`);
          if (step.explorerUrl) {
            console.log(`Explorer: ${step.explorerUrl}`);
          }
        });
      } else {
        console.error('Bridge failed:', result.steps);
      }

      return result;
    } catch (error) {
      console.error('Error during bridge operation:', error);
      throw error;
    }
  }

  // 2. Gasless Payments - Using Gas Station for sponsored transactions
  async performGaslessTransaction(
    walletId: string,
    destinationAddress: string,
    amount: string,
    blockchain: 'ETH-SEPOLIA' | 'MATIC-AMOY' | 'SOL-DEVNET'
  ) {
    try {
      console.log(`Performing gasless transaction on ${blockchain}`);

      // Create a gasless transaction using HIGH fee level (sponsored by Gas Station)
      const response = await this.dcwClient.createTransaction({
        walletId: walletId,
        blockchain: blockchain,
        tokenAddress: this.getUSDCAddressForBlockchain(blockchain),
        amount: [amount],
        destinationAddress: destinationAddress,
        fee: {
          type: 'level',
          config: {
            feeLevel: 'HIGH', // Gas Station will sponsor this transaction
          },
        },
      });

      if (response.data) {
        console.log(`Gasless transaction created with ID: ${response.data.id}`);
        console.log(`Transaction state: ${response.data.state}`);
        return response.data;
      }
    } catch (error) {
      console.error('Error creating gasless transaction:', error);
      throw error;
    }
  }

  // 3. Developer-Led Control - Wallet management and operations
  async setupDeveloperControlledWallets() {
    try {
      console.log('Setting up developer-controlled wallets...');

      // Create a wallet set
      const walletSetResponse = await this.dcwClient.createWalletSet({
        name: 'OmniCommerce AI Agent Wallets',
      });

      if (walletSetResponse.data?.walletSet) {
        const walletSetId = walletSetResponse.data.walletSet.id;
        console.log(`Created wallet set: ${walletSetId}`);

        // Create wallets for each target network
        const walletsResponse = await this.dcwClient.createWallets({
          blockchains: ['ETH-SEPOLIA', 'MATIC-AMOY', 'SOL-DEVNET'],
          count: 1,
          walletSetId: walletSetId,
          metadata: [
            { name: 'Ethereum Sepolia Wallet', refId: 'eth-sepolia' },
            { name: 'Polygon Amoy Wallet', refId: 'polygon-amoy' },
            { name: 'Solana Devnet Wallet', refId: 'solana-devnet' },
          ],
        });

        if (walletsResponse.data?.wallets) {
          console.log('Created wallets:');
          walletsResponse.data.wallets.forEach((wallet: any) => {
            console.log(`- ${wallet.blockchain}: ${wallet.address} (ID: ${wallet.id})`);
          });

          // Request testnet tokens for each wallet
          for (const wallet of walletsResponse.data.wallets) {
            await this.requestTestnetTokens(wallet.address, wallet.blockchain as any);
          }

          return walletsResponse.data.wallets;
        }
      }
    } catch (error) {
      console.error('Error setting up wallets:', error);
      throw error;
    }
  }

  // Request testnet tokens for development
  async requestTestnetTokens(
    address: string,
    blockchain: 'ETH-SEPOLIA' | 'MATIC-AMOY' | 'SOL-DEVNET'
  ) {
    try {
      console.log(`Requesting testnet tokens for ${address} on ${blockchain}`);

      await this.dcwClient.requestTestnetTokens({
        address: address,
        blockchain: blockchain,
        usdc: true,
        native: true,
      });

      console.log(`Testnet tokens requested successfully for ${address}`);
    } catch (error) {
      console.error(`Error requesting testnet tokens for ${address}:`, error);
    }
  }

  // Get wallet balances
  async getWalletBalance(walletId: string) {
    try {
      const response = await this.dcwClient.getWalletTokenBalance({
        id: walletId,
        includeAll: true,
      });

      if (response.data?.tokenBalances) {
        console.log(`Wallet ${walletId} balances:`);
        response.data.tokenBalances.forEach((balance: any) => {
          console.log(`- Amount: ${balance.amount}, Updated: ${balance.updateDate}`);
        });
        return response.data.tokenBalances;
      }
    } catch (error) {
      console.error(`Error getting wallet balance for ${walletId}:`, error);
      throw error;
    }
  }

  // List all wallets
  async listWallets() {
    try {
      const response = await this.dcwClient.listWallets();
      
      if (response.data?.wallets) {
        console.log('Available wallets:');
        response.data.wallets.forEach((wallet: any) => {
          console.log(`- ${wallet.blockchain}: ${wallet.address} (ID: ${wallet.id}, State: ${wallet.state})`);
        });
        return response.data.wallets;
      }
    } catch (error) {
      console.error('Error listing wallets:', error);
      throw error;
    }
  }

  // Estimate bridge costs
  async estimateBridgeCost(
    fromChain: 'Ethereum_Sepolia' | 'Polygon_Amoy_Testnet' | 'Solana_Devnet',
    toChain: 'Ethereum_Sepolia' | 'Polygon_Amoy_Testnet' | 'Solana_Devnet',
    amount: string
  ) {
    try {
      console.log(`Estimating bridge cost from ${fromChain} to ${toChain} for ${amount} USDC`);

      const estimate = await this.bridgeKit.estimate({
        from: {
          adapter: this.circleWalletsAdapter,
          chain: fromChain,
          address: this.getWalletAddressForChain(fromChain),
        },
        to: {
          adapter: this.circleWalletsAdapter,
          chain: toChain,
          address: this.getWalletAddressForChain(toChain),
        },
        amount: amount,
        token: 'USDC',
      });

      console.log('Bridge cost estimate:');
      console.log('Protocol fees:');
      estimate.fees.forEach((fee) => {
        console.log(`- ${fee.type}: ${fee.amount || 'N/A'} ${fee.token}`);
      });

      console.log('Gas fees:');
      estimate.gasFees.forEach((gasFee) => {
        console.log(`- ${gasFee.name} on ${gasFee.blockchain}: ${gasFee.fees || 'N/A'} ${gasFee.token}`);
      });

      return estimate;
    } catch (error) {
      console.error('Error estimating bridge cost:', error);
      throw error;
    }
  }

  // Helper methods
  private getWalletAddressForChain(chain: string): string {
    switch (chain) {
      case 'Ethereum_Sepolia':
        return ETHEREUM_SEPOLIA_WALLET_ADDRESS;
      case 'Polygon_Amoy_Testnet':
        return POLYGON_AMOY_WALLET_ADDRESS;
      case 'Solana_Devnet':
        return SOLANA_DEVNET_WALLET_ADDRESS;
      default:
        throw new Error(`Unsupported chain: ${chain}`);
    }
  }

  private getUSDCAddressForBlockchain(blockchain: string): string {
    // These are testnet USDC addresses - replace with actual addresses
    switch (blockchain) {
      case 'ETH-SEPOLIA':
        return '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238'; // Sepolia USDC
      case 'MATIC-AMOY':
        return '0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582'; // Amoy USDC
      case 'SOL-DEVNET':
        return '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'; // Devnet USDC
      default:
        throw new Error(`Unsupported blockchain: ${blockchain}`);
    }
  }

  // Main orchestration method for the AI agent
  async handleUserRequest(request: {
    action: 'bridge' | 'transfer' | 'balance' | 'estimate';
    fromChain?: 'Ethereum_Sepolia' | 'Polygon_Amoy_Testnet' | 'Solana_Devnet';
    toChain?: 'Ethereum_Sepolia' | 'Polygon_Amoy_Testnet' | 'Solana_Devnet';
    amount?: string;
    recipientAddress?: string;
    walletId?: string;
  }) {
    try {
      console.log(`Processing user request: ${request.action}`);

      switch (request.action) {
        case 'bridge':
          if (!request.fromChain || !request.toChain || !request.amount) {
            throw new Error('Bridge operation requires fromChain, toChain, and amount');
          }
          return await this.bridgeUSDC(
            request.fromChain,
            request.toChain,
            request.amount,
            request.recipientAddress
          );

        case 'transfer':
          if (!request.walletId || !request.recipientAddress || !request.amount) {
            throw new Error('Transfer operation requires walletId, recipientAddress, and amount');
          }
          // Determine blockchain from wallet ID or use a mapping
          const blockchain = 'ETH-SEPOLIA'; // This should be determined dynamically
          return await this.performGaslessTransaction(
            request.walletId,
            request.recipientAddress,
            request.amount,
            blockchain
          );

        case 'balance':
          if (!request.walletId) {
            throw new Error('Balance check requires walletId');
          }
          return await this.getWalletBalance(request.walletId);

        case 'estimate':
          if (!request.fromChain || !request.toChain || !request.amount) {
            throw new Error('Estimate requires fromChain, toChain, and amount');
          }
          return await this.estimateBridgeCost(
            request.fromChain,
            request.toChain,
            request.amount
          );

        default:
          throw new Error(`Unsupported action: ${request.action}`);
      }
    } catch (error) {
      console.error('Error handling user request:', error);
      throw error;
    }
  }
}

// Example usage and demonstration
async function demonstrateOmniCommerceAgent() {
  try {
    console.log('🚀 Initializing OmniCommerce AI Agent...');
    
    const agent = new OmniCommerceAIAgent();

    // 1. Setup wallets (one-time setup)
    console.log('📝 Setting up developer-controlled wallets...');
    await agent.setupDeveloperControlledWallets();

    // 2. List available wallets
    console.log('📋 Listing available wallets...');
    await agent.listWallets();

    // 3. Demonstrate cross-chain bridging
    console.log('🌉 Demonstrating cross-chain USDC bridging...');
    await agent.handleUserRequest({
      action: 'bridge',
      fromChain: 'Ethereum_Sepolia',
      toChain: 'Polygon_Amoy_Testnet',
      amount: '10.0',
    });

    // 4. Estimate bridge costs
    console.log('💰 Estimating bridge costs...');
    await agent.handleUserRequest({
      action: 'estimate',
      fromChain: 'Polygon_Amoy_Testnet',
      toChain: 'Solana_Devnet',
      amount: '5.0',
    });

    // 5. Demonstrate gasless transaction
    console.log('⛽ Demonstrating gasless transaction...');
    await agent.handleUserRequest({
      action: 'transfer',
      walletId: ETHEREUM_SEPOLIA_WALLET_ID,
      recipientAddress: '0x742d35Cc6634C0532925a3b8D0C9e3e0C0e8c0e8',
      amount: '1.0',
    });

    // 6. Check wallet balance
    console.log('💳 Checking wallet balance...');
    await agent.handleUserRequest({
      action: 'balance',
      walletId: ETHEREUM_SEPOLIA_WALLET_ID,
    });

    console.log('✅ OmniCommerce AI Agent demonstration completed successfully!');

  } catch (error) {
    console.error('❌ Error in demonstration:', error);
  }
}

// Run the demonstration
demonstrateOmniCommerceAgent().catch(console.error);

Typescript


Instructions on how to use the code:
Install Dependencies: Make sure you have Node.js and npm installed. Then, install the required packages by running:

npm install @circle-fin/developer-controlled-wallets @circle-fin/bridge-kit @circle-fin/adapter-circle-wallets

Bash


Set Environment Variables: You need to set the following environment variables:

CIRCLE_API_KEY: Your Circle API key.
CIRCLE_ENTITY_SECRET: Your Circle entity secret.
ETHEREUM_SEPOLIA_WALLET_ADDRESS: Your Ethereum Sepolia wallet address.
POLYGON_AMOY_WALLET_ADDRESS: Your Polygon Amoy wallet address.
SOLANA_DEVNET_WALLET_ADDRESS: Your Solana Devnet wallet address.
ETHEREUM_SEPOLIA_WALLET_ID: Your Ethereum Sepolia wallet ID.
POLYGON_AMOY_WALLET_ID: Your Polygon Amoy wallet ID.
SOLANA_DEVNET_WALLET_ID: Your Solana Devnet wallet ID.
You can set these variables in your .env file or directly in your terminal.

Run the Code: Save the code as a .ts file (e.g., omniCommerceAgent.ts) and compile it using tsc omniCommerceAgent.ts. Then, run the compiled JavaScript file with Node.js:

node omniCommerceAgent.js

Bash


This will execute the demonstration, setting up wallets, listing them, demonstrating cross-chain bridging, estimating bridge costs, performing a gasless transaction, and checking wallet balances.