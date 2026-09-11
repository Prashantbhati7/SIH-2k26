import React, { useState } from 'react';
import { Sparkles, X, Send, Bot, User, ExternalLink } from 'lucide-react';
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
      text: 'Hello! I am your portfolio intelligence assistant. I can help answer questions about project risks, cost/delay predictions, SHAP feature drivers, or urgent action items.',
      sources: ['National Project Database', 'XGBoost Risk Engine']
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
        { sender: 'bot', text: 'Sorry, I encountered an issue retrieving project intelligence.' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-lg bg-white border-l border-slate-200 h-full flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-lime-400 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900">Portfolio Insights Assistant</h3>
              <p className="text-[10px] text-slate-500 font-medium">Grounded Retrieval & Risk Summaries</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Conversation Area */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4 text-xs">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex space-x-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.sender === 'bot' && (
                <div className="w-7 h-7 rounded-full bg-slate-900 text-lime-400 flex items-center justify-center font-bold shrink-0 mt-0.5 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div className={`p-3.5 rounded-2xl max-w-[85%] space-y-2 ${
                m.sender === 'user'
                  ? 'bg-slate-900 text-white rounded-tr-none'
                  : 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-none'
              }`}>
                <div className="whitespace-pre-line leading-relaxed">{m.text}</div>

                {m.projects && m.projects.length > 0 && (
                  <div className="pt-2 space-y-1.5 border-t border-slate-200">
                    <span className="text-[10px] text-slate-500 font-bold block">Linked Projects:</span>
                    {m.projects.map((p) => (
                      <button
                        key={p.projectCode}
                        onClick={() => {
                          onSelectProject(p.projectCode);
                          onClose();
                        }}
                        className="w-full text-left p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 flex items-center justify-between text-[11px] font-bold text-slate-900 transition-colors"
                      >
                        <span>{p.projectName} ({p.projectCode})</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      </button>
                    ))}
                  </div>
                )}

                {m.sources && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {m.sources.map((s, sIdx) => (
                      <span key={sIdx} className="text-[9px] px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700 font-medium">
                        Source: {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {m.sender === 'user' && (
                <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-slate-500 text-xs pl-10">
              <div className="w-2 h-2 rounded-full bg-lime-500 animate-ping" />
              <span>Gathering project insights...</span>
            </div>
          )}
        </div>

        {/* Suggested Quick Questions */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex gap-2 overflow-x-auto text-[11px]">
          <button
            onClick={() => handleSend('Which projects have the highest predicted cost-overrun risk?')}
            className="px-3 py-1 rounded-full bg-white hover:bg-slate-100 text-slate-700 font-semibold border border-slate-200 whitespace-nowrap shadow-xs"
          >
            Highest Cost Overrun Projects?
          </button>
          <button
            onClick={() => handleSend('Why is Project 40001 high risk?')}
            className="px-3 py-1 rounded-full bg-white hover:bg-slate-100 text-slate-700 font-semibold border border-slate-200 whitespace-nowrap shadow-xs"
          >
            Why Project 40001 high risk?
          </button>
          <button
            onClick={() => handleSend('Which interventions require immediate action?')}
            className="px-3 py-1 rounded-full bg-white hover:bg-slate-100 text-slate-700 font-semibold border border-slate-200 whitespace-nowrap shadow-xs"
          >
            Urgent Interventions?
          </button>
        </div>

        {/* Query Input Box */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center space-x-2">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask for project risk insights or SHAP drivers..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-lime-400 focus:bg-white"
            />
            <button
              type="submit"
              disabled={loading}
              className="p-2 rounded-xl bg-lime-400 hover:bg-lime-500 text-slate-950 font-bold shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
