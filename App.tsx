
import React, { useState, useEffect } from 'react';
import { Bot } from 'lucide-react';
import { Blockchain, WalletBalance, CommerceItem, Message, AgentAction } from './types';
import Dashboard from './components/Dashboard';
import AgentInterface from './components/AgentInterface';
import { checkBalances, initiateBridge, executePayment } from './services/circleService';
import { getAgentResponse } from './services/geminiService';

const INITIAL_ITEMS: CommerceItem[] = [
  {
    id: 'premium-guide-1',
    name: 'Cross-Chain Trading Masterclass',
    description: 'Learn to master decentralized finance across 5 different networks with this comprehensive digital course.',
    price: '10.00',
    currency: 'USDC',
    targetChain: Blockchain.ETHEREUM_SEPOLIA,
    image: 'https://picsum.photos/seed/course/800/400'
  },
  {
    id: 'nft-exclusive-1',
    name: 'Genesis Node Access NFT',
    description: 'Gain priority access to future liquidity pools and bridge incentives. Minting on Solana Devnet.',
    price: '25.00',
    currency: 'USDC',
    targetChain: Blockchain.SOLANA_DEVNET,
    image: 'https://picsum.photos/seed/nft/800/400'
  },
  {
    id: 'ai-utility-1',
    name: 'Pro Agent Subscription (1mo)',
    description: 'Unlocks advanced automated bridging strategies and gasless trade execution for professional arbitrage.',
    price: '49.00',
    currency: 'USDC',
    targetChain: Blockchain.POLYGON_AMOY,
    image: 'https://picsum.photos/seed/sub/800/400'
  }
];

const App: React.FC = () => {
  const [balances, setBalances] = useState<WalletBalance[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    refreshBalances();
  }, []);

  const refreshBalances = async () => {
    const data = await checkBalances();
    setBalances(data);
  };

  const handleSendMessage = async (text: string) => {
    setMessages(prev => [...prev, { role: 'user', text }]);
    setIsTyping(true);

    try {
      const history = messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
      let response = await getAgentResponse(history, text);
      
      // Process potential tool calls in a loop
      let currentActions: AgentAction[] = [];
      let currentResponseText = response.text || "";

      if (response.functionCalls && response.functionCalls.length > 0) {
        for (const call of response.functionCalls) {
          if (call.name === 'checkBalances') {
            currentActions.push({ type: 'BALANCE_CHECK', status: 'IN_PROGRESS', description: 'Querying Circle Wallets...' });
            setMessages(prev => [...prev.slice(0, -1), { role: 'user', text }, { role: 'model', text: "Checking your cross-chain assets...", actions: [...currentActions] }]);
            const result = await checkBalances();
            setBalances(result);
            currentActions[currentActions.length - 1].status = 'COMPLETED';
          } 
          
          if (call.name === 'initiateBridge') {
            const { fromChain, toChain, amount } = call.args as any;
            currentActions.push({ type: 'BRIDGE', status: 'IN_PROGRESS', description: `Bridge Kit: ${fromChain} -> ${toChain}` });
            setMessages(prev => {
              const last = prev[prev.length - 1];
              last.actions = [...currentActions];
              return [...prev.slice(0, -1), last];
            });
            const bridge = await initiateBridge(fromChain, toChain, amount);
            currentActions[currentActions.length - 1].status = 'COMPLETED';
            currentActions[currentActions.length - 1].txHash = bridge.txHash;
            currentActions[currentActions.length - 1].explorerUrl = bridge.explorerUrl;
          }

          if (call.name === 'executePayment') {
            const { itemId, price, network } = call.args as any;
            currentActions.push({ type: 'PAYMENT', status: 'IN_PROGRESS', description: `Settling x402 gasless payment on ${network}` });
            setMessages(prev => {
              const last = prev[prev.length - 1];
              last.actions = [...currentActions];
              return [...prev.slice(0, -1), last];
            });
            const payment = await executePayment(itemId, price, network);
            currentActions[currentActions.length - 1].status = 'COMPLETED';
            currentActions[currentActions.length - 1].txHash = payment.txHash;
            currentActions[currentActions.length - 1].explorerUrl = payment.explorerUrl;
          }
        }

        // Final summary response after tools
        const finalResponse = await getAgentResponse([...history, { role: 'user', parts: [{ text }] }], "I have completed the operations. Please summarize the status.");
        currentResponseText = finalResponse.text || "Operations complete.";
      }

      setMessages(prev => {
        const last = prev[prev.length - 1];
        return [...prev.slice(0, -1), { ...last, role: 'model', text: currentResponseText, actions: currentActions }];
      });

    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', text: "The network facilitator is currently unavailable." }]);
    } finally {
      setIsTyping(false);
      refreshBalances();
    }
  };

  const handleSelectItem = (item: CommerceItem) => {
    handleSendMessage(`I want to buy '${item.name}' for ${item.price} USDC. It is on ${item.targetChain}. Use my Amoy funds if needed.`);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <main className="flex-1 overflow-hidden relative">
        <Dashboard balances={balances} items={INITIAL_ITEMS} onSelectItem={handleSelectItem} />
      </main>
      <aside className="hidden lg:block w-[400px] h-full shrink-0 shadow-2xl">
        <AgentInterface messages={messages} onSendMessage={handleSendMessage} isTyping={isTyping} />
      </aside>
      <div className="lg:hidden fixed bottom-6 right-6">
        <button className="w-14 h-14 bg-indigo-600 rounded-full shadow-xl flex items-center justify-center text-white">
          <Bot className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};

export default App;
