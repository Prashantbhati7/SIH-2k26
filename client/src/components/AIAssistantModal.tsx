import React, { useState } from 'react';
import { Sparkles, X, Send, Bot, User, ExternalLink, ShieldCheck } from 'lucide-react';
import { api } from '../services/api';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProject: (pCode: number) => void;
}

interface Message {
  sender: 'user' | 'bot';
  text: string;
  projects?: any[];
  sources?: string[];
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({
  isOpen,
  onClose,
  onSelectProject
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: 'Hello! I am the VikasDrishti Project Intelligence Assistant. Ask me questions about project risks, predictions, SHAP feature drivers, or urgent interventions.',
      sources: ['Project Intelligence DB', 'XGBoost Risk Engine']
    }
  ]);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim()) return;

    const userMsg: Message = { sender: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputQuery('');
    setLoading(true);

    try {
      const res = await api.post('/assistant/query', { query: textToSend });
      const botMsg: Message = {
        sender: 'bot',
        text: res.data.answer,
        projects: res.data.projects,
        sources: res.data.sources
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: 'Sorry, I encountered an error querying project intelligence.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Assistant Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white">
              <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '4s' }} />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-100">AI Project Intelligence Assistant</h3>
              <p className="text-[10px] text-indigo-300 font-mono">Retrieval-First Grounded RAG</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conversation Area */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4 text-xs">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex space-x-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.sender === 'bot' && (
                <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`p-3.5 rounded-2xl max-w-[85%] space-y-2 ${
                m.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-tr-none'
                  : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none'
              }`}>
                <div className="whitespace-pre-line leading-relaxed">{m.text}</div>

                {m.projects && m.projects.length > 0 && (
                  <div className="pt-2 space-y-1.5 border-t border-slate-800">
                    <span className="text-[10px] text-slate-400 font-semibold block">Linked Project Profiles:</span>
                    {m.projects.map((p) => (
                      <button
                        key={p.projectCode}
                        onClick={() => {
                          onSelectProject(p.projectCode);
                          onClose();
                        }}
                        className="w-full text-left p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 flex items-center justify-between text-[11px] text-indigo-300 transition-colors"
                      >
                        <span>{p.projectName} ({p.projectCode})</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    ))}
                  </div>
                )}

                {m.sources && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {m.sources.map((s, sIdx) => (
                      <span key={sIdx} className="text-[9px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                        Source: {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {m.sender === 'user' && (
                <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-slate-400 text-xs pl-10">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
              <span>Querying database & XGBoost models...</span>
            </div>
          )}
        </div>

        {/* Suggested Quick Questions */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40 flex gap-2 overflow-x-auto text-[11px]">
          <button
            onClick={() => handleSend('Which projects have the highest predicted cost-overrun risk?')}
            className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap"
          >
            Highest Cost Overrun Projects?
          </button>
          <button
            onClick={() => handleSend('Why is Project 40001 high risk?')}
            className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap"
          >
            Why Project 40001 high risk?
          </button>
          <button
            onClick={() => handleSend('Which interventions require immediate action?')}
            className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 whitespace-nowrap"
          >
            Urgent Interventions?
          </button>
        </div>

        {/* Query Input Box */}
        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center space-x-2">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask assistant about project risks, SHAP drivers, or actions..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
