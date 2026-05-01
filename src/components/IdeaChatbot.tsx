import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'motion/react';
import { X, Send, Shield, EyeOff, Eye, Trash2, Mic, MicOff, Lightbulb, CheckCircle2, Volume2, VolumeX } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { ChildProfile } from '../types';

function getSavedPos() {
  try { return JSON.parse(localStorage.getItem('chatbot_pos') || 'null') || { x: 0, y: 0 }; }
  catch { return { x: 0, y: 0 }; }
}

type Message = { role: 'user' | 'model'; text: string; imageUrl?: string };

const MAX_SAVED = 40;

function historyKey(childId: string, assistantId: string) {
  return `chat_history_${childId}_${assistantId}`;
}

function loadHistory(childId: string, assistantId: string): Message[] {
  try {
    const raw = localStorage.getItem(historyKey(childId, assistantId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Message[];
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
}

function saveHistory(childId: string, assistantId: string, messages: Message[]) {
  try {
    const trimmed = messages.slice(-MAX_SAVED);
    localStorage.setItem(historyKey(childId, assistantId), JSON.stringify(trimmed));
  } catch { /* non-critical */ }
}

function clearHistory(childId: string, assistantId: string) {
  localStorage.removeItem(historyKey(childId, assistantId));
}

export default function IdeaChatbot() {
  const assistants = [
    { id: 'malek', name: 'البطل مالك', emoji: '🛡️', vibe: 'الشجاعة، الحماس، والمغامرات الذكية', color: 'from-blue-500 to-indigo-600' },
    { id: 'RINA',  name: 'رينا الحكيمة', emoji: '🌙', vibe: 'الهدوء، الحكمة، والتفكير العميق',     color: 'from-pink-500 to-fuchsia-600' },
    { id: 'maria', name: 'ماريا المرحة', emoji: '😄', vibe: 'الضحك والفرفشة وخفة الدم',          color: 'from-emerald-500 to-teal-600' }
  ] as const;

  const [isOpen, setIsOpen]       = useState(false);
  const [isHidden, setIsHidden]   = useState(() => localStorage.getItem('chatbot_hidden') === 'true');
  const [activeAssistantId, setActiveAssistantId] = useState<typeof assistants[number]['id']>('malek');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting]   = useState(false);
  const [messages, setMessages]       = useState<Message[]>([]);
  const [input, setInput]             = useState('');
  const [isTyping, setIsTyping]       = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showIdeaModal, setShowIdeaModal] = useState(false);
  const [ideaText, setIdeaText]           = useState('');
  const [ideaSending, setIdeaSending]     = useState(false);
  const [ideaSent, setIdeaSent]           = useState(false);
  const [speakingIdx, setSpeakingIdx]     = useState<number | null>(null);
  const [riddleScore, setRiddleScore]     = useState(0);

  const riddleAnswerRef = useRef<string | null>(null);
  const messagesEndRef  = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recogRef        = useRef<any>(null);

  const activeChildStr = localStorage.getItem('active_child');
  const activeChild    = activeChildStr ? JSON.parse(activeChildStr) as ChildProfile : null;
  const activeAssistant = assistants.find(a => a.id === activeAssistantId) || assistants[0];

  const saved = getSavedPos();
  const dragX = useMotionValue(saved.x);
  const dragY = useMotionValue(saved.y);

  const handleDragEnd = () => {
    localStorage.setItem('chatbot_pos', JSON.stringify({ x: dragX.get(), y: dragY.get() }));
  };

  const handleHide = () => {
    setIsHidden(true);
    setIsOpen(false);
    localStorage.setItem('chatbot_hidden', 'true');
  };

  const handleShow = () => {
    setIsHidden(false);
    localStorage.setItem('chatbot_hidden', 'false');
  };

  const makeWelcome = useCallback((assistant: typeof assistants[number]): Message => {
    const heroName = activeChild?.heroName || activeChild?.name || 'بطلتنا';
    return {
      role: 'model',
      text: `أهلاً يا ${heroName}! أنا ${assistant.name} ${assistant.emoji}\n${assistant.vibe}.\nأنا هنا معكِ — ابدأي متى تريدين! 🌟`
    };
  }, [activeChild]);

  useEffect(() => {
    if (!activeChild) return;
    const history = loadHistory(activeChild.uid, activeAssistantId);
    if (history.length > 0) {
      setMessages(history);
    } else {
      setMessages([makeWelcome(activeAssistant)]);
    }
    setShowDeleteConfirm(false);
    setRiddleScore(0);
    riddleAnswerRef.current = null;
  }, [activeAssistantId, activeChild?.uid]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen, isTyping]);

  if (!activeChild) return null;

  const heroName = activeChild.heroName || activeChild.name || 'بطلتنا';

  // ── ميكروفون ──
  const handleMic = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    if (isListening && recogRef.current) {
      recogRef.current.stop();
      setIsListening(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition: any = new SR();
    recognition.lang = 'ar-SA';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend   = () => setIsListening(false);

    recogRef.current = recognition;
    setIsListening(true);
    recognition.start();
  };

  // ── إرسال الرسالة ──
  const handleSend = async (overrideText?: string) => {
    const userMsg = (overrideText ?? input).trim();
    if (!userMsg || isTyping) return;

    setInput('');
    const newMessages: Message[] = [...messages, { role: 'user', text: userMsg }];
    setMessages(newMessages);
    setIsTyping(true);

    const currentRiddleAnswer = riddleAnswerRef.current;
    riddleAnswerRef.current = null;

    try {
      const chatHistory = newMessages.slice(1).map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: chatHistory,
          assistantData: { name: activeAssistant.name, vibe: activeAssistant.vibe },
          childName: heroName,
          riddleContext: currentRiddleAnswer ? { answer: currentRiddleAnswer } : undefined,
        }),
      });

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const textError = await response.text();
        throw new Error(`Server returned non-JSON response: ${textError.substring(0, 100)}`);
      }

      if (!response.ok) throw new Error(data.error || 'Failed to get AI response');
      const botReply = data.text;
      if (!botReply) throw new Error('Empty AI response');

      if (data.riddleAnswer) {
        riddleAnswerRef.current = data.riddleAnswer;
      }

      // عداد الألغاز: لو كان فيه لغز نشط والرد يحتوي احتفال → نقطة!
      if (
        currentRiddleAnswer &&
        !data.riddleAnswer &&
        /واوووو صح|صح تماماً|أجبتِ بشكل صحيح|أصبتِ|أجبت/i.test(botReply)
      ) {
        setRiddleScore(s => s + 1);
      }

      const botMsg: Message = { role: 'model', text: botReply, imageUrl: data.imageUrl || undefined };
      const updated: Message[] = [...newMessages, botMsg];
      setMessages(updated);
      saveHistory(activeChild.uid, activeAssistantId, updated);

      try {
        await Promise.all([
          addDoc(collection(db, 'idea_chats'), {
            childId: activeChild.uid, childName: heroName,
            role: 'user', text: userMsg, createdAt: Date.now(), status: 'new'
          }),
          addDoc(collection(db, 'idea_chats'), {
            childId: activeChild.uid, childName: heroName,
            role: 'model', text: botReply, createdAt: Date.now(), status: 'read'
          })
        ]);
      } catch { /* non-critical */ }

    } catch (error: unknown) {
      const errorStr = String((error as Error)?.message || error).toLowerCase();
      let errorMessage = `عذراً يا ${heroName}، هل يمكنكِ المحاولة مرة أخرى؟ 🪄`;
      if (errorStr.includes('quota') || errorStr.includes('429')) {
        errorMessage = `عذراً يا ${heroName}، المساعد مشغول قليلاً! 😅 جربي بعد ثانية.`;
      }
      const errMsg: Message = { role: 'model', text: errorMessage };
      const updated: Message[] = [...newMessages, errMsg];
      setMessages(updated);
      saveHistory(activeChild.uid, activeAssistantId, updated);
    } finally {
      setIsTyping(false);
    }
  };

  // ── حذف المحادثة ──
  const handleDeleteChat = async () => {
    setIsDeleting(true);
    try {
      clearHistory(activeChild.uid, activeAssistantId);
      riddleAnswerRef.current = null;
      const q = query(
        collection(db, 'idea_chats'),
        where('childId', '==', activeChild.uid)
      );
      const snap = await getDocs(q);
      await Promise.all(snap.docs.map(d => deleteDoc(doc(db, 'idea_chats', d.id))));
    } catch { /* non-critical */ }

    setMessages([makeWelcome(activeAssistant)]);
    setRiddleScore(0);
    setShowDeleteConfirm(false);
    setIsDeleting(false);
  };

  // ── قراءة الرد بصوت ──
  const speak = useCallback((text: string, idx: number) => {
    if (!window.speechSynthesis) return;
    if (speakingIdx === idx) {
      window.speechSynthesis.cancel();
      setSpeakingIdx(null);
      return;
    }
    window.speechSynthesis.cancel();
    const clean = text.replace(/[*_#`💎🌙⚡🦸‍♂️🎉😄😂]/g, '').replace(/\*\*/g, '').trim();
    const utt   = new SpeechSynthesisUtterance(clean);
    utt.lang    = 'ar-SA';
    utt.rate    = 0.88;
    utt.pitch   = 1.05;
    utt.onend   = () => setSpeakingIdx(null);
    utt.onerror = () => setSpeakingIdx(null);
    setSpeakingIdx(idx);
    window.speechSynthesis.speak(utt);
  }, [speakingIdx]);

  // أوقف الصوت لما تُغلق النافذة
  useEffect(() => {
    if (!isOpen) { window.speechSynthesis?.cancel(); setSpeakingIdx(null); }
  }, [isOpen]);

  // ── إرسال فكرة للإدارة ──
  const submitIdea = async () => {
    if (!activeChild || !ideaText.trim()) return;
    setIdeaSending(true);
    try {
      await addDoc(collection(db, 'feature_ideas'), {
        childId:   activeChild.uid,
        childName: activeChild.heroName || activeChild.name || 'بطلة',
        idea:      ideaText.trim(),
        createdAt: Date.now(),
        status:    'new',
        source:    'child',
      });
      setIdeaSent(true);
      setIdeaText('');
      setTimeout(() => { setIdeaSent(false); setShowIdeaModal(false); }, 2500);
    } catch { /* non-critical */ }
    setIdeaSending(false);
  };

  if (isHidden) {
    return (
      <motion.button
        drag dragMomentum={false}
        style={{ x: dragX, y: dragY }}
        onDragEnd={handleDragEnd}
        onClick={handleShow}
        className="fixed bottom-6 left-6 z-50 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-black px-3 py-2 rounded-full shadow-lg flex items-center gap-1.5 cursor-pointer select-none"
        title="إظهار المساعد"
      >
        <Eye className="w-3.5 h-3.5" />
        مالك
      </motion.button>
    );
  }

  const hasMicSupport = typeof window !== 'undefined' && (
    !!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition
  );

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            style={{ x: dragX, y: dragY }}
            className="fixed bottom-24 left-6 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border-2 border-purple-200 overflow-hidden z-50 flex flex-col"
            dir="rtl"
          >
            {/* Header */}
            <div className={`bg-gradient-to-r ${activeAssistant.color} p-4 flex justify-between items-center text-white`}>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-yellow-300" />
                <h3 className="font-bold text-lg">{activeAssistant.name} {activeAssistant.emoji}</h3>
              </div>
              <div className="flex items-center gap-1">
                {riddleScore > 0 && (
                  <span className="bg-yellow-400 text-yellow-900 text-xs font-black px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    ⭐{riddleScore}
                  </span>
                )}
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  title="حذف المحادثة"
                  className="hover:bg-white/20 p-1.5 rounded-full transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={handleHide} title="إخفاء المساعد" className="hover:bg-white/20 p-1 rounded-full transition-colors">
                  <EyeOff className="w-4 h-4" />
                </button>
                <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Delete confirmation overlay */}
            <AnimatePresence>
              {showDeleteConfirm && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-16 right-3 left-3 bg-white rounded-2xl shadow-xl border-2 border-red-200 p-4 z-10 text-center"
                  dir="rtl"
                >
                  <p className="text-sm font-bold text-slate-700 mb-1">🗑️ تأكيد الحذف</p>
                  <p className="text-xs text-slate-500 mb-3">هل تريدين حذف كل المحادثة؟ لن تتمكني من استعادتها.</p>
                  <div className="flex gap-2 justify-center">
                    <button
                      onClick={handleDeleteChat}
                      disabled={isDeleting}
                      className="bg-red-500 hover:bg-red-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors disabled:opacity-60"
                    >
                      {isDeleting ? '⏳ جارٍ الحذف...' : '🗑️ احذف'}
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-4 py-2 rounded-xl transition-colors"
                    >
                      إلغاء
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Assistant tabs */}
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

            {/* Quick Actions */}
            <div className="bg-white border-b border-purple-50 px-3 py-2 flex gap-2 overflow-x-auto">
              {[
                { emoji: '🎨', label: 'ارسم لي', prompt: 'ارسم لي صورة جميلة ومبهجة' },
                { emoji: '🧩', label: 'لغز',     prompt: 'هاتي لي لغزاً ممتعاً' },
                { emoji: '😂', label: 'نكتة',    prompt: 'احكيلي نكتة مضحكة' },
                { emoji: '✨', label: 'شجعيني',  prompt: 'قولي حاجة حلوة وشجعيني' },
                { emoji: '📖', label: 'قصة',        prompt: 'احكي لي قصة مسلية قصيرة' },
                { emoji: '🎵', label: 'أغنية',      prompt: 'غنيلي أغنية حلوة' },
                { emoji: '📅', label: 'كلمة اليوم', prompt: 'كلمة اليوم' },
                { emoji: '🎯', label: 'تحدي اليوم', prompt: 'تحدي اليوم' },
                { emoji: '🦁', label: 'حيوان',      prompt: 'ارسم لي حيوان كرتون لطيف' },
                { emoji: '🚀', label: 'فضاء',       prompt: 'ارسم لي صورة فضاء وكواكب ملونة' },
              ].map(q => (
                <button
                  key={q.label}
                  onClick={() => handleSend(q.prompt)}
                  className="flex items-center gap-1 px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-full text-xs font-bold whitespace-nowrap transition-colors border border-purple-100"
                >
                  <span>{q.emoji}</span><span>{q.label}</span>
                </button>
              ))}
              {/* زر إرسال فكرة للإدارة — منفصل عن الشات */}
              <button
                onClick={() => { setShowIdeaModal(true); setIdeaSent(false); }}
                className="flex items-center gap-1 px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-full text-xs font-bold whitespace-nowrap transition-colors border border-amber-200"
              >
                <Lightbulb className="w-3 h-3" /><span>فكرة 💡</span>
              </button>
            </div>

            {/* Messages */}
            <div className="h-72 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {messages.length > 1 && (
                <div className="text-center">
                  <span className="text-[10px] text-slate-400 bg-white border border-slate-100 px-2 py-0.5 rounded-full">
                    💾 محادثتك محفوظة
                  </span>
                </div>
              )}

              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className="flex flex-col gap-1 max-w-[82%]">
                    <div className={`rounded-2xl overflow-hidden ${
                      msg.role === 'user'
                        ? 'bg-purple-500 text-white rounded-tl-none'
                        : 'bg-white border border-purple-100 text-slate-700 rounded-tr-none shadow-sm'
                    }`}>
                      {msg.imageUrl && (
                        <div className="p-2">
                          <img
                            src={msg.imageUrl}
                            alt="صورة مولّدة"
                            className="rounded-xl w-full max-w-[220px] object-cover border border-purple-100"
                            loading="lazy"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        </div>
                      )}
                      <p className="text-sm leading-relaxed p-3 pt-1 whitespace-pre-line">{msg.text}</p>
                    </div>
                    {/* زر الصوت — فقط لرسائل المساعد */}
                    {msg.role === 'model' && window.speechSynthesis && (
                      <button
                        onClick={() => speak(msg.text, idx)}
                        title={speakingIdx === idx ? 'أوقفي الصوت' : 'اسمعي الرد'}
                        className={`self-start flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full transition-colors ${
                          speakingIdx === idx
                            ? 'bg-purple-200 text-purple-700 animate-pulse'
                            : 'bg-slate-100 text-slate-400 hover:bg-purple-50 hover:text-purple-500'
                        }`}
                      >
                        {speakingIdx === idx
                          ? <><VolumeX className="w-3 h-3" /> إيقاف</>
                          : <><Volume2 className="w-3 h-3" /> استمعي</>
                        }
                      </button>
                    )}
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

            {/* Listening indicator */}
            <AnimatePresence>
              {isListening && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 border-t border-red-100 px-4 py-2 flex items-center gap-2"
                >
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-xs text-red-600 font-bold">جارٍ الاستماع... تكلمي الآن</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input */}
            <div className="p-3 bg-white border-t border-purple-100 flex gap-2 items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="اكتبي أو اختاري نشاطاً..."
                className="flex-1 bg-slate-100 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              {hasMicSupport && (
                <button
                  onClick={handleMic}
                  title={isListening ? 'أوقفي الاستماع' : 'تحدثي الآن'}
                  className={`p-2 rounded-xl transition-all ${
                    isListening
                      ? 'bg-red-500 text-white shadow-lg shadow-red-200 animate-pulse'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                  }`}
                >
                  {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
              )}
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className="bg-purple-500 text-white p-2 rounded-xl hover:bg-purple-600 disabled:opacity-50 transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── نافذة إرسال فكرة للإدارة ── */}
      <AnimatePresence>
        {showIdeaModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setShowIdeaModal(false); }}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1,    opacity: 1 }}
              exit={{ scale: 0.85,    opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6 text-right"
            >
              {ideaSent ? (
                <div className="text-center py-4">
                  <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-3" />
                  <p className="text-xl font-black text-green-700">وصلت فكرتك للمديرة! 🌟</p>
                  <p className="text-slate-500 text-sm mt-1">شكراً يا بطلة!</p>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center mb-4">
                    <button onClick={() => setShowIdeaModal(false)} className="p-1 text-slate-400 hover:text-slate-600">
                      <X className="w-5 h-5" />
                    </button>
                    <div className="text-right">
                      <h3 className="text-lg font-black text-amber-700">💡 أرسلي فكرتك للمديرة</h3>
                      <p className="text-xs text-slate-400">فكرة أو طلب أو اقتراح — كل شيء يوصل!</p>
                    </div>
                  </div>
                  <textarea
                    value={ideaText}
                    onChange={e => setIdeaText(e.target.value)}
                    placeholder="مثلاً: أريد لعبة جديدة، أو أريد قصة عن الفضاء..."
                    rows={4}
                    className="w-full bg-amber-50 border-2 border-amber-200 rounded-2xl p-3 text-sm resize-none focus:outline-none focus:border-amber-400 text-right"
                    dir="rtl"
                  />
                  <button
                    onClick={submitIdea}
                    disabled={!ideaText.trim() || ideaSending}
                    className="mt-3 w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-black py-3 rounded-2xl transition-colors flex items-center justify-center gap-2"
                  >
                    {ideaSending ? '⏳ جارٍ الإرسال...' : <><Send className="w-4 h-4" /> إرسال الفكرة</>}
                  </button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Draggable toggle button */}
      <motion.div
        drag dragMomentum={false}
        style={{ x: dragX, y: dragY }}
        onDragEnd={handleDragEnd}
        className="fixed bottom-6 left-6 z-50 cursor-grab active:cursor-grabbing select-none"
      >
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full shadow-lg shadow-blue-500/30 flex items-center justify-center text-white hover:scale-110 transition-transform"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Shield className="w-6 h-6" />}
          </button>
          {!isOpen && (
            <button
              onClick={(e) => { e.stopPropagation(); handleHide(); }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-slate-600 hover:bg-slate-700 rounded-full flex items-center justify-center text-white shadow-md transition-colors"
              title="إخفاء المساعد"
            >
              <EyeOff className="w-3 h-3" />
            </button>
          )}
        </div>
      </motion.div>
    </>
  );
}
