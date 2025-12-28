
import React from 'react';
import { Wallet, ArrowRightLeft, CreditCard, ShieldCheck } from 'lucide-react';
import { Blockchain, WalletBalance, CommerceItem } from '../types';

interface DashboardProps {
  balances: WalletBalance[];
  items: CommerceItem[];
  onSelectItem: (item: CommerceItem) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ balances, items, onSelectItem }) => {
  return (
    <div className="p-6 space-y-8 overflow-y-auto h-full">
      <header>
        <h1 className="text-3xl font-bold text-slate-900">OmniCommerce Dashboard</h1>
        <p className="text-slate-500">Managing your cross-chain assets with agentic intelligence.</p>
      </header>

      {/* Wallet Overview */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Wallet className="w-5 h-5 text-indigo-600" />
            Circle Developer Wallets
          </h2>
          <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full">Testnet Active</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {balances.map((bal) => (
            <div key={bal.blockchain} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{bal.blockchain}</span>
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="text-2xl font-bold text-slate-800">{bal.amount} <span className="text-sm font-normal text-slate-500">{bal.symbol}</span></div>
              <div className="text-[10px] font-mono text-slate-400 mt-2 truncate">{bal.address}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Bridge Status / Promo */}
      <section className="bg-indigo-600 rounded-2xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2">
          <h3 className="text-xl font-bold">Bridge Kit Enabled</h3>
          <p className="text-indigo-100 max-w-md">Seamlessly move USDC between Sepolia and Solana with low latency. Our AI agent handles the re-encryption for you.</p>
        </div>
        <div className="flex -space-x-3">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/30">ETH</div>
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/30">SOL</div>
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/30">POL</div>
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
            <div key={item.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden group hover:border-indigo-300 transition-colors">
              <img src={item.image} alt={item.name} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="p-5 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold px-2 py-1 bg-slate-100 text-slate-600 rounded uppercase">{item.targetChain}</span>
                  <span className="text-lg font-bold text-indigo-600">{item.price} {item.currency}</span>
                </div>
                <h4 className="font-bold text-slate-900 leading-tight">{item.name}</h4>
                <p className="text-sm text-slate-500 line-clamp-2">{item.description}</p>
                <button 
                  onClick={() => onSelectItem(item)}
                  className="w-full py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2"
                >
                  Ask Agent to Buy
                  <ArrowRightLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
