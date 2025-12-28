
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, CheckCircle2, ExternalLink } from 'lucide-react';
import { Message, AgentAction, CommerceItem } from '../types';

interface AgentInterfaceProps {
  onSendMessage: (text: string) => void;
  messages: Message[];
  isTyping: boolean;
}

const AgentInterface: React.FC<AgentInterfaceProps> = ({ onSendMessage, messages, isTyping }) => {
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;
    onSendMessage(input);
    setInput('');
  };

  return (
    <div className="flex flex-col h-full bg-white border-l border-slate-200 w-full max-w-md">
      <div className="p-4 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-slate-900">Omni-Agent</h3>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Ready to Trade</span>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 && (
          <div className="text-center space-y-4 pt-10">
            <Bot className="w-12 h-12 text-slate-200 mx-auto" />
            <p className="text-slate-400 text-sm max-w-[200px] mx-auto">
              I can help you bridge USDC and buy assets gaslessly. Try "Buy the course using my USDC on Amoy"
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center ${msg.role === 'user' ? 'bg-slate-200' : 'bg-indigo-100'}`}>
                {msg.role === 'user' ? <User className="w-5 h-5 text-slate-600" /> : <Bot className="w-5 h-5 text-indigo-600" />}
              </div>
              <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-700'}`}>
                {msg.text}
              </div>
            </div>

            {msg.actions && msg.actions.length > 0 && (
              <div className="mt-3 ml-11 space-y-2 w-full max-w-[80%]">
                {msg.actions.map((action, ai) => (
                  <div key={ai} className="bg-white border border-slate-100 rounded-xl p-3 text-xs shadow-sm flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {action.status === 'COMPLETED' ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
                      )}
                      <span className="font-medium text-slate-600">{action.description}</span>
                    </div>
                    {action.explorerUrl && (
                      <a href={action.explorerUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:text-indigo-700">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
              <Bot className="w-5 h-5 text-indigo-600" />
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-4 bg-slate-50 border-t border-slate-200">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tell the agent what to do..."
            className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-inner"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 top-1.5 p-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:bg-slate-300 shadow-lg shadow-indigo-100"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};

export default AgentInterface;
