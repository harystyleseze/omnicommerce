
import React, { useState, useEffect } from 'react';
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
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'nft-exclusive-1',
    name: 'Genesis Node Access NFT',
    description: 'Gain priority access to future liquidity pools and bridge incentives. Minting on Solana Devnet.',
    price: '25.00',
    currency: 'USDC',
    targetChain: Blockchain.SOLANA_DEVNET,
    image: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=800'
  },
  {
    id: 'ai-utility-1',
    name: 'Pro Agent Subscription (1mo)',
    description: 'Unlocks advanced automated bridging strategies and gasless trade execution for professional arbitrage.',
    price: '49.00',
    currency: 'USDC',
    targetChain: Blockchain.POLYGON_AMOY,
    image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800'
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
    try {
      const data = await checkBalances();
      setBalances(data);
    } catch (e) {
      console.error("Failed to refresh balances", e);
    }
  };

  const handleSendMessage = async (text: string) => {
    const userMsg: Message = { role: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);

    try {
      const chatHistory = messages.map(m => ({ role: m.role, parts: [{ text: m.text }] }));
      let agentResponse = await getAgentResponse(chatHistory, text);
      let actions: AgentAction[] = [];
      
      const processResponse = async (res: any): Promise<string> => {
        if (res.functionCalls && res.functionCalls.length > 0) {
          for (const call of res.functionCalls) {
            let resultData: any;
            let action: AgentAction = { 
              type: 'BALANCE_CHECK', 
              status: 'IN_PROGRESS', 
              description: `Executing ${call.name}...` 
            };

            switch (call.name) {
              case 'checkBalances':
                action = { type: 'BALANCE_CHECK', status: 'IN_PROGRESS', description: 'Checking all Circle Wallets...' };
                updateActions(actions, action);
                resultData = await checkBalances();
                setBalances(resultData);
                action.status = 'COMPLETED';
                break;

              case 'fundWallet':
                const { blockchain, amount } = call.args;
                action = { type: 'FUND', status: 'IN_PROGRESS', description: `Requesting ${amount} USDC on ${blockchain}` };
                updateActions(actions, action);
                resultData = await fundWallet(blockchain as Blockchain, amount);
                await refreshBalances();
                action.status = 'COMPLETED';
                action.txHash = resultData.txHash;
                break;

              case 'initiateBridge':
                const { fromChain, toChain, amount: bAmount } = call.args;
                action = { type: 'BRIDGE', status: 'IN_PROGRESS', description: `Bridging ${bAmount} USDC: ${fromChain} -> ${toChain}` };
                updateActions(actions, action);
                resultData = await initiateBridge(fromChain as Blockchain, toChain as Blockchain, bAmount);
                await refreshBalances();
                action.status = 'COMPLETED';
                action.txHash = resultData.txHash;
                action.explorerUrl = resultData.explorerUrl;
                break;

              case 'executePayment':
                const { itemId, price, network } = call.args;
                action = { type: 'PAYMENT', status: 'IN_PROGRESS', description: `Settling ${price} USDC on ${network} (Gasless)` };
                updateActions(actions, action);
                resultData = await executePayment(itemId, price, network as Blockchain);
                setItems(prev => prev.map(i => i.id === itemId ? { ...i, isUnlocked: true } : i));
                await refreshBalances();
                action.status = 'COMPLETED';
                action.txHash = resultData.txHash;
                action.explorerUrl = resultData.explorerUrl;
                break;
            }
            
            // Re-query agent with tool result to get next step or final text
            const followUp = await getAgentResponse(
              [...chatHistory, { role: 'user', parts: [{ text }] }, { role: 'model', parts: [{ text: "Thinking..." }] }],
              `Tool ${call.name} executed with result: ${JSON.stringify(resultData)}. Please provide the next step or final confirmation.`
            );
            return processResponse(followUp);
          }
        }
        return res.text || "I have completed the requested operations.";
      };

      const finalContent = await processResponse(agentResponse);
      setMessages(prev => [...prev, { role: 'model', text: finalContent, actions }]);

    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'model', text: "I encountered a technical error connecting to the blockchain services. Please check your API keys." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const updateActions = (existing: AgentAction[], next: AgentAction) => {
    existing.push(next);
    // Trigger a re-render of the message currently being built
    setMessages(prev => {
      const last = prev[prev.length - 1];
      if (last && last.role === 'model') {
        return [...prev.slice(0, -1), { ...last, actions: [...existing] }];
      }
      return [...prev, { role: 'model', text: "Processing secure transactions...", actions: [...existing] }];
    });
  };

  const handleFund = (blockchain: Blockchain) => {
    handleSendMessage(`Please fund my ${blockchain} wallet with 50 USDC from the faucet.`);
  };

  const handleSelectItem = (item: CommerceItem) => {
    handleSendMessage(`I want to buy '${item.name}' for ${item.price} USDC on ${item.targetChain}. Check my balances and bridge if necessary.`);
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
      <aside className="hidden lg:block w-[400px] h-full shrink-0 shadow-2xl z-10">
        <AgentInterface messages={messages} onSendMessage={handleSendMessage} isTyping={isTyping} />
      </aside>
    </div>
  );
};

export default App;
