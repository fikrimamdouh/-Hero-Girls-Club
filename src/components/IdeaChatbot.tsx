import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Sparkles, Shield } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ChildProfile } from '../types';

export default function IdeaChatbot() {
  const assistants = [
    { id: 'malek', name: 'البطل مالك', emoji: '🛡️', vibe: 'الشجاعة، الحماس، والمغامرات الذكية', color: 'from-blue-500 to-indigo-600' },
    { id: 'RINA', name: 'رينا الخيالية', emoji: '💡', vibe: 'الإبداع، الرسم، والقصص السحرية', color: 'from-pink-500 to-fuchsia-600' },
    { id: 'maria', name: 'ماريا الذكية', emoji: '📘', vibe: 'التنظيم، الترتيب، والخطوات العملية', color: 'from-emerald-500 to-teal-600' }
  ] as const;

  const [isOpen, setIsOpen] = useState(false);
  const [activeAssistantId, setActiveAssistantId] = useState<typeof assistants[number]['id']>('malek');
  const activeChildStr = localStorage.getItem('active_child');
  const activeChild = activeChildStr ? JSON.parse(activeChildStr) as ChildProfile : null;
  const activeAssistant = assistants.find(a => a.id === activeAssistantId) || assistants[0];

  const [messages, setMessages] = useState<{role: 'user'|'model', text: string}[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeChild && messages.length === 0) {
      const heroName = activeChild.heroName || activeChild.name || 'بطلتنا';
      setMessages([
        { 
          role: 'model', 
          text: `أهلاً بكِ يا بطلة ${heroName}! 🌟 أنا "${activeAssistant.name}" ${activeAssistant.emoji}، جاهزة أسمع أفكارك السحرية للموقع!` 
        }
      ]);
    }
  }, [activeChild, activeAssistant.name, activeAssistant.emoji, messages.length]);

  useEffect(() => {
    if (!activeChild) return;
    const heroName = activeChild.heroName || activeChild.name || 'بطلتنا';
    setMessages([
      {
        role: 'model',
        text: `أنا ${activeAssistant.name} ${activeAssistant.emoji}، وطريقتي هي ${activeAssistant.vibe}. شاركيني فكرتك يا ${heroName}!`
      }
    ]);
  }, [activeAssistantId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, isTyping]);

  if (!activeChild) return null;

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    const heroName = activeChild.heroName || activeChild.name || 'بطلتنا';

    try {
      // 1. Call our custom Backend API (ChatGPT Proxy)
      const chatHistory = messages.slice(1).map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.text
      }));
      chatHistory.push({ role: 'user', content: userMsg });

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: chatHistory,
          assistantData: {
            name: activeAssistant.name,
            vibe: activeAssistant.vibe
          },
          childName: heroName
        }),
      });

      let data;
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const textError = await response.text();
        throw new Error(`Server returned non-JSON response: ${textError.substring(0, 100)}`);
      }

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get AI response');
      }

      const botReply = data.text;

      if (!botReply) {
        throw new Error('Empty AI response');
      }

      // 2. Update UI
      setMessages(prev => [...prev, { role: 'model', text: botReply }]);
      
      // 3. Save to Firestore for Admin monitoring
      try {
        await Promise.all([
          addDoc(collection(db, 'idea_chats'), {
            childId: activeChild.uid,
            childName: heroName,
            role: 'user',
            text: userMsg,
            createdAt: Date.now(),
            status: 'new'
          }),
          addDoc(collection(db, 'idea_chats'), {
            childId: activeChild.uid,
            childName: heroName,
            role: 'model',
            text: botReply,
            createdAt: Date.now(),
            status: 'read'
          })
        ]);
      } catch (dbError) {
        console.error('Firestore save failed:', dbError);
      }

    } catch (error: any) {
      console.error('Chat error:', error);
      let errorMessage = `عذراً يا ${heroName}، يبدو أن قواي السحرية تحتاج لبعض الراحة. هل يمكنكِ المحاولة مرة أخرى؟ 🪄`;
      
      const errorStr = String(error?.message || error).toLowerCase();
      
      if (errorStr.includes('configured') || errorStr.includes('missing')) {
        errorMessage = `عذراً يا ${heroName}، يبدو أن "مفتاح السحر" (API Key) لم يتم تفعيله بشكل صحيح حتى الآن. يرجى من ولي الأمر التأكد من وضعه في الإعدادات والضغط على "Apply". 🔑`;
      } else if (errorStr.includes('quota') || errorStr.includes('insufficient') || errorStr.includes('429')) {
        errorMessage = `عذراً يا ${heroName}، المساعد مشغول جداً حالياً أو أن "رصيد السحر" قد انتهى! 😅 يرجى المحاولة لاحقاً.`;
      } else {
        errorMessage = `عذراً يا ${heroName}، حدث خطأ: ${error.message}. سنحاول إصلاحه قريباً! 🛠️`;
      }
      
      setMessages(prev => [...prev, { role: 'model', text: errorMessage }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-24 left-6 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border-2 border-purple-200 overflow-hidden z-50 flex flex-col"
            dir="rtl"
          >
            {/* Header */}
            <div className={`bg-gradient-to-r ${activeAssistant.color} p-4 flex justify-between items-center text-white`}>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-yellow-300" />
                <h3 className="font-bold text-lg">{activeAssistant.name} {activeAssistant.emoji}</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-white border-b border-purple-100 p-2 flex gap-2 overflow-x-auto">
              {assistants.map((assistant) => (
                <button
                  key={assistant.id}
                  onClick={() => setActiveAssistantId(assistant.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                    activeAssistantId === assistant.id
                      ? 'bg-purple-100 text-purple-700 border border-purple-300'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {assistant.emoji} {assistant.name}
                </button>
              ))}
            </div>

            {/* Messages */}
            <div className="h-80 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl ${
                    msg.role === 'user' 
                      ? 'bg-purple-500 text-white rounded-tl-none' 
                      : 'bg-white border border-purple-100 text-slate-700 rounded-tr-none shadow-sm'
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-purple-100 p-3 rounded-2xl rounded-tr-none shadow-sm flex gap-1 items-center h-10">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-white border-t border-purple-100 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="اكتب فكرتك هنا..."
                className="flex-1 bg-slate-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="bg-purple-500 text-white p-2 rounded-xl hover:bg-purple-600 disabled:opacity-50 transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 left-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-lg shadow-blue-500/30 flex items-center justify-center text-white hover:scale-110 transition-transform z-50"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
      </button>
    </>
  );
}
