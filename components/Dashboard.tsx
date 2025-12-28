
import React from 'react';
import { Wallet, ArrowRightLeft, CreditCard, ShieldCheck, Plus, CheckCircle } from 'lucide-react';
import { Blockchain, WalletBalance, CommerceItem } from '../types';

interface DashboardProps {
  balances: WalletBalance[];
  items: CommerceItem[];
  onSelectItem: (item: CommerceItem) => void;
  onFund: (blockchain: Blockchain) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ balances, items, onSelectItem, onFund }) => {
  return (
    <div className="p-6 space-y-8 overflow-y-auto h-full">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">OmniCommerce Dashboard</h1>
          <p className="text-slate-500">Managing your cross-chain assets with agentic intelligence.</p>
        </div>
        <div className="flex items-center gap-3">
           <div className="px-3 py-1 bg-slate-100 rounded-lg border border-slate-200 text-xs font-mono">Network: Testnet</div>
        </div>
      </header>

      {/* Wallet Overview */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Wallet className="w-5 h-5 text-indigo-600" />
            Circle Developer Wallets
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {balances.map((bal) => (
            <div key={bal.blockchain} className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all group">
              <div className="flex justify-between items-start mb-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{bal.blockchain}</span>
                <button 
                  onClick={() => onFund(bal.blockchain)}
                  className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-indigo-600 hover:text-white"
                  title="Fund Wallet (Faucet)"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <div className="text-3xl font-bold text-slate-800">{bal.amount} <span className="text-sm font-normal text-slate-500">{bal.symbol}</span></div>
              <div className="text-[10px] font-mono text-slate-400 mt-3 truncate bg-slate-50 p-2 rounded-lg border border-slate-100">{bal.address}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Marketplace */}
      <section>
        <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
          <CreditCard className="w-5 h-5 text-indigo-600" />
          Agentic Marketplace (x402)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden group hover:border-indigo-300 transition-all relative">
              {item.isUnlocked && (
                <div className="absolute top-4 right-4 z-10 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                  <CheckCircle className="w-3 h-3" />
                  Unlocked
                </div>
              )}
              <div className="relative overflow-hidden">
                 <img src={item.image} alt={item.name} className={`w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500 ${item.isUnlocked ? 'brightness-50' : ''}`} />
                 {item.isUnlocked && (
                   <div className="absolute inset-0 flex items-center justify-center">
                     <button className="px-4 py-2 bg-white text-slate-900 rounded-lg font-bold shadow-xl">View Content</button>
                   </div>
                 )}
              </div>
              <div className="p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-600 rounded uppercase">{item.targetChain}</span>
                  {!item.isUnlocked && <span className="text-lg font-bold text-indigo-600">{item.price} {item.currency}</span>}
                </div>
                <h4 className="font-bold text-slate-900 leading-tight">{item.name}</h4>
                <p className="text-sm text-slate-500 line-clamp-2">{item.description}</p>
                {!item.isUnlocked && (
                  <button 
                    onClick={() => onSelectItem(item)}
                    className="w-full py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-lg shadow-slate-200"
                  >
                    Ask Agent to Buy
                    <ArrowRightLeft className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
