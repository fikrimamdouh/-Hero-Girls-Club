import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  Wand2,
  Download,
  Send,
  ArrowRight,
  Image as ImageIcon,
  Loader2,
  Sparkles,
  Shield,
  Lightbulb,
  BookOpen,
} from 'lucide-react';
import { toast } from 'sonner';
import { ChildProfile } from '../types';

type Persona = {
  id: 'malik' | 'reena' | 'maria';
  label: string;
  icon: string;
  description: string;
  styleClass: string;
};

type ChatMessage = {
  role: 'user' | 'ai';
  text: string;
  image?: string;
};

const personas: Persona[] = [
  {
    id: 'malik',
    label: '🛡️ البطل مالك',
    icon: '🛡️',
    description: 'شجاع، مشجع، ويشرح الأفكار بوضوح كأنها مهمة بطولية.',
    styleClass: 'from-blue-500 to-cyan-400',
  },
  {
    id: 'RINA',
    label: '💡 رينا الخيالية',
    icon: '💡',
    description: 'مبدعة وخيالية، تقترح ألواناً وشخصيات ولمسات فنية جميلة.',
    styleClass: 'from-fuchsia-500 to-pink-400',
  },
  {
    id: 'maria',
    label: '📘 ماريا الذكية',
    icon: '📘',
    description: 'هادئة ومنظمة، تبسط الفكرة بخطوات تعليمية سهلة.',
    styleClass: 'from-emerald-500 to-teal-400',
  },
];

const quickPrompts = [
  'صممي لي غرفة أحلامي',
  'ساعديني في فكرة مشروع مدرسي',
  'اكتب لي قصة قصيرة',
  'اقترحي ألواناً جميلة',
  'اشرحي لي الفكرة ببساطة',
];

  const personaById = (id: Persona['id']) => personas.find((p) => p.id === id) || personas[0];

export default function AIDesignStudio() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [selectedPersona, setSelectedPersona] = useState<Persona['id']>('malik');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [errorState, setErrorState] = useState<string | null>(null);

  useEffect(() => {
    const activeChildStr = localStorage.getItem('active_child');
    if (!activeChildStr) {
      navigate('/');
      return;
    }

    const child = JSON.parse(activeChildStr) as ChildProfile;
    setProfile(child);

    setMessages([
      {
        role: 'ai',
        text: `مرحباً يا ${child.heroName || child.name}! ✨ أنا ${personaById('malik').label}. اختاري شخصيتي المفضلة لديكِ وابدئي بإرسال فكرة تصميم ممتعة!`,
      },
    ]);
  }, [navigate]);

  const activePersona = personaById(selectedPersona);

  const handleGenerate = async (inputText?: string) => {
    const finalPrompt = (inputText || prompt).trim();
    if (!finalPrompt) {
      toast.error('من فضلكِ اكتبي فكرتكِ أولاً ✍️');
      return;
    }

    setIsGenerating(true);
    setErrorState(null);
    setMessages((prev) => [...prev, { role: 'user', text: finalPrompt }]);

    try {
      const heroName = profile?.heroName || profile?.name || 'بطلتنا';

      const response = await fetch('/api/design', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: finalPrompt,
          childName: heroName,
          persona: activePersona.label,
        }),
      });

      const rawText = await response.text();
      let data: any = null;
      try {
        data = rawText ? JSON.parse(rawText) : null;
      } catch {
        data = null;
      }

      if (!data) {
        throw new Error('Server returned non-JSON response');
      }

      if (!response.ok) throw new Error(data.error || 'فشل توليد التصميم');

      setGeneratedImage(data.imageUrl || null);
      setMessages((prev) => [...prev, { role: 'ai', text: data.text || 'تم تجهيز فكرتك ✨', image: data.imageUrl }]);
      setPrompt('');
      toast.success('تم تجهيز اقتراح تصميم رائع! 🌈');
    } catch (error: any) {
      console.error('AI Design Error:', error);
      const friendlyError = 'تعذر التواصل مع المساعد الآن. حاولي مرة أخرى بعد لحظات.';
      setErrorState(friendlyError);
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: `أعتذر يا ${profile?.heroName || profile?.name || 'بطلتنا'} 💛 ${friendlyError}`,
        },
      ]);
      toast.error('حدث خطأ في الاتصال.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedImage) return;
    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `magic-design-${Date.now()}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('تم تنزيل التصميم بنجاح ✨');
    } catch {
      toast.error('تعذر التحميل، جربي مرة أخرى.');
    }
  };

  return (
    <div className="min-h-screen bg-[#fdf2f8] font-sans flex flex-col" dir="rtl">
      <header className="p-6 bg-white/80 backdrop-blur-md border-b-2 border-pink-100 flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/child')}
            className="p-2 hover:bg-pink-50 rounded-full transition-colors text-pink-500"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-pink-600 flex items-center gap-2">
              <Wand2 className="w-8 h-8 text-amber-400" />
              استوديو التصميم الذكي
            </h1>
            <p className="text-pink-400 text-sm font-bold">اختاري شخصية المساعد، وابدئي رحلتك الإبداعية 🌟</p>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto w-full p-4 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="flex flex-col h-[calc(100vh-180px)] bg-white rounded-[3rem] shadow-2xl border-4 border-pink-50 overflow-hidden">
          <div className="p-4 md:p-6 border-b border-pink-100 bg-white">
            <h2 className="font-black text-slate-800 mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-pink-500" />
              اختاري رفيقك الذكي
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {personas.map((persona) => (
                <button
                  key={persona.id}
                  onClick={() => setSelectedPersona(persona.id)}
                  className={`text-right rounded-2xl border p-3 transition-all ${
                    selectedPersona === persona.id
                      ? 'border-pink-400 bg-pink-50 shadow-md'
                      : 'border-slate-200 hover:border-pink-200 bg-white'
                  }`}
                >
                  <div className="font-black text-slate-800 text-sm">{persona.label}</div>
                  <div className="text-xs text-slate-500 mt-1 leading-relaxed">{persona.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
            {messages.length === 0 && (
              <div className="h-full flex items-center justify-center text-center px-6">
                <div>
                  <div className="text-5xl mb-3">✨</div>
                  <p className="text-slate-600 font-bold">اكتبي فكرتك الأولى لنبدأ التصميم!</p>
                </div>
              </div>
            )}

            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[85%] p-4 rounded-3xl shadow-sm ${
                    msg.role === 'user'
                      ? 'bg-pink-500 text-white rounded-tr-none'
                      : 'bg-white text-slate-800 border border-pink-100 rounded-tl-none'
                  }`}
                >
                  {msg.role === 'ai' && (
                    <p className="text-xs font-black text-pink-500 mb-2 flex items-center gap-1">
                      <span>{activePersona.icon}</span>
                      <span>{activePersona.label}</span>
                    </p>
                  )}
                  <p className="font-bold leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                  {msg.image && <img src={msg.image} alt="Generated" className="mt-3 rounded-2xl w-full shadow-md" />}
                </div>
              </motion.div>
            ))}

            {isGenerating && (
              <div className="flex justify-end">
                <div className="bg-white p-4 rounded-3xl border border-pink-100 flex items-center gap-3">
                  <Loader2 className="w-5 h-5 animate-spin text-pink-500" />
                  <span className="font-bold text-pink-500">جاري تجهيز الرد المناسب للأطفال...</span>
                </div>
              </div>
            )}

            {errorState && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-bold p-3 rounded-2xl">
                {errorState}
              </div>
            )}
          </div>

          <div className="p-4 md:p-6 bg-white border-t-2 border-pink-50 space-y-3">
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((chip) => (
                <button
                  key={chip}
                  onClick={() => {
                    setPrompt(chip);
                    handleGenerate(chip);
                  }}
                  disabled={isGenerating}
                  className="px-3 py-2 rounded-full bg-pink-50 text-pink-600 text-xs font-black hover:bg-pink-100 transition-colors disabled:opacity-50"
                >
                  {chip}
                </button>
              ))}
            </div>

            <div className="relative">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="اكتبي فكرتك: أريد تصميم غرفة فيها نجوم ومكتب..."
                className="w-full bg-slate-50 border-2 border-pink-100 rounded-2xl p-4 pl-12 font-bold text-slate-800 focus:border-pink-300 outline-none resize-none h-24"
              />
              <button
                onClick={() => handleGenerate()}
                disabled={isGenerating}
                className="absolute bottom-4 left-4 p-3 bg-pink-500 text-white rounded-xl shadow-lg hover:bg-pink-600 transition-all disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[3rem] p-8 shadow-2xl border-4 border-pink-50 flex flex-col items-center justify-center min-h-[400px] text-center">
          {generatedImage ? (
            <div className="space-y-5 w-full">
              <h3 className="text-2xl font-black text-pink-600">لوحتك المقترحة جاهزة! 🎨</h3>
              <div className="rounded-[2rem] overflow-hidden shadow-2xl border-8 border-white">
                <img src={generatedImage} alt="Magic Design" className="w-full h-auto" />
              </div>
              <button
                onClick={handleDownload}
                className="w-full py-3 bg-pink-500 text-white rounded-2xl font-black hover:bg-pink-600 transition-all flex items-center justify-center gap-2"
              >
                <Download className="w-5 h-5" />
                تنزيل التصميم
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-28 h-28 bg-pink-50 rounded-full flex items-center justify-center mx-auto">
                <ImageIcon className="w-14 h-14 text-pink-200" />
              </div>
              <h3 className="text-2xl font-black text-pink-600">معرض الاستوديو</h3>
              <p className="text-slate-500 font-bold max-w-sm">
                اطلبي تصميمك، وسيرد عليكِ {activePersona.label} بخطة ممتعة وألوان وعناصر جميلة تناسب الأطفال.
              </p>
              <div className={`mx-auto w-fit px-4 py-2 rounded-full text-white font-black bg-gradient-to-r ${activePersona.styleClass}`}>
                {activePersona.label}
              </div>
              <div className="flex justify-center gap-3 text-pink-500">
                {selectedPersona === 'malik' && <Shield className="w-6 h-6" />}
                {selectedPersona === 'reena' && <Lightbulb className="w-6 h-6" />}
                {selectedPersona === 'maria' && <BookOpen className="w-6 h-6" />}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
