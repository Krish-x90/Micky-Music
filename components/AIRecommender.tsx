import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Bot, AlertCircle } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { Message } from '../types';

export const AIRecommender: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Hi! I\'m your AI DJ. Tell me what mood you\'re in or what artists you like, and I\'ll suggest some tracks.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const apiKey = process.env.API_KEY;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      if (!apiKey) {
        throw new Error("API Key is missing. I cannot generate recommendations without it.");
      }

      const ai = new GoogleGenAI({ apiKey });
      const model = "gemini-2.5-flash-latest"; 
      
      const prompt = `
        You are a knowledgeable music expert and DJ. 
        The user asks: "${userMessage.text}"
        Provide a concise, friendly recommendation of 3 songs or artists that fit this request. 
        Format as a simple list. Keep it short.
      `;

      const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
      });

      const text = response.text || "I couldn't think of anything right now. Try another mood!";
      
      setMessages(prev => [...prev, { role: 'model', text }]);

    } catch (error: any) {
      console.error(error);
      let errorMsg = "Sorry, I'm having trouble connecting to the musical cosmos right now.";
      if (error.message.includes("API Key")) {
         errorMsg = "Development Mode: Gemini API Key not configured in environment.";
      }
      setMessages(prev => [...prev, { role: 'model', text: errorMsg }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-180px)]">
      <div className="mb-6 flex items-center gap-3">
        <div className="p-3 bg-primary/20 rounded-full">
            <Sparkles className="text-primary" size={24} />
        </div>
        <div>
            <h2 className="text-2xl font-bold text-white">AI Assistant</h2>
            <p className="text-gray-400 text-sm">Powered by Gemini</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pr-4 mb-4 custom-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-gray-700' : 'bg-primary/20'}`}>
              {msg.role === 'user' ? <User size={14} /> : <Bot size={14} className="text-primary" />}
            </div>
            <div className={`rounded-2xl p-4 max-w-[80%] text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-primary text-white rounded-tr-sm' 
                : 'bg-[#27272a] text-gray-200 rounded-tl-sm border border-white/5'
            }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
               <Bot size={14} className="text-primary" />
            </div>
            <div className="bg-[#27272a] rounded-2xl p-4 rounded-tl-sm flex gap-1 items-center">
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-75"></span>
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Ask for recommendations..."
          disabled={isLoading}
          className="w-full bg-[#18181b] border border-white/10 rounded-xl py-4 pl-4 pr-12 text-white placeholder-gray-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-lg"
        />
        <button 
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Send size={18} />
        </button>
      </div>
      {!apiKey && (
         <div className="mt-2 flex items-center gap-2 text-yellow-500 text-xs bg-yellow-500/10 p-2 rounded border border-yellow-500/20">
            <AlertCircle size={12} />
            <span>Note: API Key not detected. Assistant will respond with mock errors.</span>
         </div>
      )}
    </div>
  );
};