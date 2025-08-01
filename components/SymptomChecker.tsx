
import React, { useState, useRef, useEffect } from 'react';
import { analyzeSymptoms } from '../services/geminiService';
import type { ChatMessage } from '../types';
import { SendIcon, UserIcon, BotIcon } from './IconComponents';
import LoadingSpinner from './LoadingSpinner';

const SymptomChecker: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'ai', text: 'Hello! I am an AI Health Assistant. How are you feeling today? Please describe your symptoms.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const aiResponse = await analyzeSymptoms(newMessages);
      setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'ai', text: 'I seem to be having trouble connecting. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSend();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 flex flex-col h-[calc(100vh-12rem)] max-h-[700px]">
        <h2 className="text-xl font-bold text-slate-800 mb-4 border-b pb-3">AI Symptom Checker</h2>
        <div className="flex-grow overflow-y-auto pr-4 -mr-4 space-y-4">
            {messages.map((msg, index) => (
                <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                    {msg.role === 'ai' && <div className="bg-blue-500 text-white rounded-full p-2"><BotIcon /></div>}
                    <div className={`max-w-md p-3 rounded-lg ${msg.role === 'user' ? 'bg-blue-100 text-slate-800' : 'bg-slate-100 text-slate-700'}`}>
                        <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                    </div>
                    {msg.role === 'user' && <div className="bg-slate-200 text-slate-600 rounded-full p-2"><UserIcon /></div>}
                </div>
            ))}
            {isLoading && (
                <div className="flex items-start gap-3">
                    <div className="bg-blue-500 text-white rounded-full p-2"><BotIcon /></div>
                    <div className="max-w-md p-3 rounded-lg bg-slate-100 text-slate-700">
                        <LoadingSpinner />
                    </div>
                </div>
            )}
            <div ref={messagesEndRef} />
        </div>
        <div className="mt-4 pt-4 border-t">
            <div className="relative">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your symptoms here..."
                    disabled={isLoading}
                    className="w-full pl-4 pr-12 py-3 rounded-full bg-slate-100 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow"
                />
                <button
                    onClick={handleSend}
                    disabled={isLoading || input.trim() === ''}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors"
                >
                    <SendIcon />
                </button>
            </div>
        </div>
    </div>
  );
};

export default SymptomChecker;
