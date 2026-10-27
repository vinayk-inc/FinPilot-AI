import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Trash2,
  Sparkles,
  Bot,
  User,
  AlertTriangle,
  HelpCircle,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { sendChatMessage } from '../services/api';
import { ChatMessage } from '../types';

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    role: 'assistant',
    content:
      "Hello! I'm FinPilot AI. Ask me about financial concepts, portfolio risk, VaR, CVaR, diversification, or investing. How can I assist your financial research today?",
  },
];

const SUGGESTED_QUESTIONS = [
  'Explain the difference between VaR and CVaR.',
  'What does annualised volatility tell an investor?',
  'How does portfolio diversification work?',
  'Explain the difference between SIP and lump-sum investing.',
  'How do I interpret a daily return distribution histogram?',
];

export const AiAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const prompt = (textToSend || inputPrompt).trim();
    if (!prompt || loading) return;

    setError(null);
    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: prompt }];
    setMessages(newMessages);
    setInputPrompt('');
    setLoading(true);

    try {
      const response = await sendChatMessage(newMessages);
      setMessages([...newMessages, response]);
    } catch (err: any) {
      const errMsg =
        err.response?.data?.detail ||
        err.message ||
        'The AI request failed. Please check internet connectivity and ensure GEMINI_API_KEY is configured on the backend.';
      setError(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages(INITIAL_MESSAGES);
    setError(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto flex flex-col h-[calc(100vh-8.5rem)]">
      {/* Header Bar */}
      <div className="bg-[#10182A] border border-[#26344E] rounded-2xl p-5 shadow-md flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 text-[#60A5FA] flex items-center justify-center">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#F8FAFC]">FinPilot AI Research Assistant</h2>
            <p className="text-xs text-[#94A3B8]">
              Powered by Google Gemini • Educational Analytics & Risk Explanations
            </p>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#121D32] hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400 border border-[#26344E] text-xs font-semibold text-[#9FB1CA] transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" /> Clear Chat
        </button>
      </div>

      {/* Suggested Questions Pills */}
      <div className="shrink-0 flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-[#64748B] flex items-center gap-1 shrink-0">
          <Sparkles className="w-3.5 h-3.5 text-[#60A5FA]" /> Prompt ideas:
        </span>
        {SUGGESTED_QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => handleSendMessage(q)}
            disabled={loading}
            className="px-3 py-1.5 rounded-xl bg-[#121D32] border border-[#26344E] text-[#9FB1CA] hover:text-[#60A5FA] hover:border-[#3B82F6]/50 transition-all shrink-0 text-left disabled:opacity-50"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Chat Messages Stream */}
      <div className="flex-1 bg-[#10182A] border border-[#26344E] rounded-2xl p-6 overflow-y-auto space-y-4 shadow-inner">
        {messages.map((msg, index) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={index}
              className={`flex items-start gap-3.5 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  isUser
                    ? 'bg-[#1E3A8A] text-white'
                    : 'bg-[#121D32] border border-[#26344E] text-[#60A5FA]'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
                  isUser
                    ? 'bg-[#1E3A8A] text-white rounded-tr-none'
                    : 'bg-[#121D32] border border-[#26344E] text-[#E2E8F0] rounded-tl-none whitespace-pre-wrap'
                }`}
              >
                {msg.content}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-[#121D32] border border-[#26344E] text-[#60A5FA] flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-[#121D32] border border-[#26344E] rounded-2xl rounded-tl-none p-4 text-sm text-[#94A3B8] flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-[#60A5FA]" />
              FinPilot AI is analyzing and drafting response...
            </div>
          </div>
        )}

        {error && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box & Legal Notice */}
      <div className="shrink-0 space-y-2">
        <div className="relative">
          <textarea
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a financial question, risk interpretation, or portfolio concept... (Press Enter to send)"
            rows={2}
            disabled={loading}
            className="w-full bg-[#121D32] border border-[#26344E] rounded-2xl pl-4 pr-14 py-3 text-sm text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none focus:border-[#3B82F6] resize-none disabled:opacity-50"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={loading || !inputPrompt.trim()}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-[#3B82F6] hover:bg-[#2563EB] text-white disabled:opacity-40 transition-colors shadow-md shadow-blue-500/20"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        <div className="text-[11px] text-[#64748B] text-center px-4">
          FinPilot AI is an educational analytics tool and does not provide guaranteed returns or personalized investment advice.
        </div>
      </div>
    </div>
  );
};
