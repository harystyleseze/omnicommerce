
import React, { useState, useEffect } from 'react';
import { Bot } from 'lucide-react';
import { Blockchain, WalletBalance, CommerceItem, Message, AgentAction, AppView } from './types';
import Dashboard from './components/Dashboard';
import AgentInterface from './components/AgentInterface';
import LandingPage from './components/LandingPage';
import { checkBalances, initiateBridge, executePayment, fundWallet } from './services/circleService';
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
  const [view, setView] = useState<AppView>('LANDING');
  const [balances, setBalances] = useState<WalletBalance[]>([]);
  const [items, setItems] = useState<CommerceItem[]>(INITIAL_ITEMS);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (view === 'DASHBOARD') refreshBalances();
  }, [view]);

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
      
      let currentActions: AgentAction[] = [];
      
      // Process tools iteratively to allow for multi-step reasoning in a single "turn"
      const executeTools = async (res: any) => {
        if (res.functionCalls && res.functionCalls.length > 0) {
          for (const call of res.functionCalls) {
            let action: AgentAction;
            
            switch (call.name) {
              case 'checkBalances':
                action = { type: 'BALANCE_CHECK', status: 'IN_PROGRESS', description: 'Querying Circle W3S API...' };
                currentActions.push(action);
                updateUIWithActions(currentActions);
                await refreshBalances();
                action.status = 'COMPLETED';
                break;

              case 'fundWallet':
                const { blockchain, amount } = call.args as any;
                action = { type: 'FUND', status: 'IN_PROGRESS', description: `Requesting faucet: ${amount} USDC on ${blockchain}` };
                currentActions.push(action);
                updateUIWithActions(currentActions);
                const fundRes = await fundWallet(blockchain, amount);
                await refreshBalances();
                action.status = 'COMPLETED';
                action.txHash = fundRes.txHash;
                break;

              case 'initiateBridge':
                const { fromChain, toChain, amount: bAmount } = call.args as any;
                action = { type: 'BRIDGE', status: 'IN_PROGRESS', description: `Bridge Kit: Moving ${bAmount} to ${toChain}` };
                currentActions.push(action);
                updateUIWithActions(currentActions);
                const bridgeRes = await initiateBridge(fromChain, toChain, bAmount);
                await refreshBalances();
                action.status = 'COMPLETED';
                action.txHash = bridgeRes.txHash;
                action.explorerUrl = bridgeRes.explorerUrl;
                break;

              case 'executePayment':
                const { itemId, price, network } = call.args as any;
                action = { type: 'PAYMENT', status: 'IN_PROGRESS', description: `x402 Gasless Settle: ${price} USDC` };
                currentActions.push(action);
                updateUIWithActions(currentActions);
                const payRes = await executePayment(itemId, price, network);
                setItems(prev => prev.map(item => item.id === itemId ? { ...item, isUnlocked: true } : item));
                await refreshBalances();
                action.status = 'COMPLETED';
                action.txHash = payRes.txHash;
                action.explorerUrl = payRes.explorerUrl;
                break;
            }
          }
          
          // Re-query agent with new context after tool execution
          const nextResponse = await getAgentResponse([...history, { role: 'user', parts: [{ text }] }], "The tools have executed. Provide a final update to the user.");
          return nextResponse.text || "Transaction chain completed.";
        }
        return res.text || "I'm not sure how to help with that.";
      };

      const finalContent = await executeTools(response);

      setMessages(prev => {
        const last = prev[prev.length - 1];
        return [...prev.slice(0, -1), { ...last, role: 'model', text: finalContent, actions: currentActions }];
      });

    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', text: "Critical system error: Unable to reach Circle or Thirdweb network facilitators." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const updateUIWithActions = (actions: AgentAction[]) => {
    setMessages(prev => {
      const last = prev[prev.length - 1];
      if (last.role === 'model') return [...prev.slice(0, -1), { ...last, actions: [...actions] }];
      return [...prev, { role: 'model', text: "Executing secure transaction sequence...", actions: [...actions] }];
    });
  };

  const handleFund = (blockchain: Blockchain) => {
    handleSendMessage(`I need some funds on ${blockchain}. Use the faucet for 50 USDC.`);
  };

  const handleSelectItem = (item: CommerceItem) => {
    handleSendMessage(`Buy '${item.name}' for ${item.price} USDC on ${item.targetChain}. Check my balances first and bridge if I have funds on other chains.`);
  };

  if (view === 'LANDING') {
    return <LandingPage onStart={() => setView('DASHBOARD')} />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <main className="flex-1 overflow-hidden relative">
        <Dashboard 
          balances={balances} 
          items={items} 
          onSelectItem={handleSelectItem} 
          onFund={handleFund}
        />
      </main>
      <aside className="hidden lg:block w-[400px] h-full shrink-0 shadow-2xl">
        <AgentInterface messages={messages} onSendMessage={handleSendMessage} isTyping={isTyping} />
      </aside>
    </div>
  );
};

export default App;
