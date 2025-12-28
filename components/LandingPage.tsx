
import React from 'react';
import { Bot, Zap, Globe, Shield, ArrowRight } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-slate-900 text-white overflow-x-hidden">
      {/* Hero Section */}
      <nav className="p-6 flex justify-between items-center border-b border-white/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight">OmniCommerce</span>
        </div>
        <button onClick={onStart} className="px-5 py-2 bg-white text-slate-900 rounded-full font-semibold hover:bg-indigo-50 transition-colors">
          Launch App
        </button>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-indigo-400 text-sm font-medium">
              <Zap className="w-4 h-4" />
              Powered by Circle & Gemini 3 Pro
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight">
              The Future of <span className="text-indigo-500">Agentic</span> Commerce.
            </h1>
            <p className="text-xl text-slate-400 max-w-lg leading-relaxed">
              Bridge liquidity, manage multi-chain wallets, and settle payments gaslessly—all through a single conversational interface.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={onStart}
                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-bold text-lg flex items-center justify-center gap-2 group transition-all"
              >
                Start Trading Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-bold text-lg">
                View Docs
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-10 bg-indigo-600/20 blur-[100px] rounded-full"></div>
            <div className="relative bg-slate-800/50 border border-white/10 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-500 rounded-xl animate-pulse"></div>
                    <div className="h-4 w-32 bg-slate-700 rounded"></div>
                  </div>
                  <div className="h-4 w-12 bg-slate-700 rounded"></div>
                </div>
                <div className="space-y-3">
                  <div className="h-24 w-full bg-slate-700/50 rounded-2xl flex items-center justify-center">
                    <span className="text-slate-500 font-mono text-xs">Awaiting Agent Instruction...</span>
                  </div>
                  <div className="h-10 w-3/4 bg-indigo-500/20 rounded-lg"></div>
                  <div className="h-10 w-1/2 bg-slate-700 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tech Stack */}
        <div className="mt-32 grid md:grid-cols-3 gap-8">
          {[
            { icon: Globe, title: "Circle Bridge Kit", desc: "Native cross-chain liquidity between EVM and Solana without manual bridging hassles." },
            { icon: Shield, title: "x402 Gasless", desc: "Execute payments using EIP-7702. Users pay in USDC, we handle the gas." },
            { icon: Bot, title: "Gemini 3 Pro", desc: "Intelligent orchestration of complex financial workflows through tool-calling." }
          ].map((item, i) => (
            <div key={i} className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-500/50 transition-colors">
              <item.icon className="w-10 h-10 text-indigo-500 mb-6" />
              <h3 className="text-xl font-bold mb-3">{item.title}</h3>
              <p className="text-slate-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default LandingPage;
