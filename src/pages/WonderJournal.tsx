import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Book, Sparkles, ArrowRight, Save, Wand2, Loader2, History } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, query, where, serverTimestamp } from 'firebase/firestore';
import { ChildProfile } from '../types';
import { toast } from 'sonner';
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';

export default function WonderJournal() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [entry, setEntry] = useState('');
  const [saving, setSaving] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const activeChildStr = localStorage.getItem('active_child');
    if (!activeChildStr) {
      navigate('/');
      return;
    }
    const activeChild = JSON.parse(activeChildStr) as ChildProfile;
    setProfile(activeChild);

    const q = query(
      collection(db, 'journal_entries'),
      where('childId', '==', activeChild.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setHistory(entries.sort((a: any, b: any) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0)));
    }, (err) => handleFirestoreError(err, OperationType.GET, 'journal_entries'));

    return () => unsubscribe();
  }, [navigate]);

  const handleSave = async () => {
    if (!profile || !entry.trim()) return;
    setSaving(true);
    try {
      // Generate AI feedback
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `أنتِ مرشدة سحرية حكيمة. طفلة اسمها ${profile.heroName || profile.name} كتبت في مفكرتها: "${entry}". 
        ردي عليها برد سحري مشجع وملهم (بحد أقصى 3 جمل) باللغة العربية الفصحى البسيطة.`,
      });

      const aiFeedback = response.text;

      await addDoc(collection(db, 'journal_entries'), {
        childId: profile.uid,
        content: entry,
        aiFeedback: aiFeedback,
        createdAt: serverTimestamp()
      });

      setEntry('');
      toast.success('تم حفظ مغامرتكِ في مفكرة العجائب!');
    } catch (error: any) {
      const errorStr = String(error?.message || error).toLowerCase();
      if (error?.status === 429 || errorStr.includes('429') || errorStr.includes('quota') || errorStr.includes('resource_exhausted')) {
        toast.error('عذراً، المفكرة السحرية متعبة قليلاً الآن. حاولي بعد دقيقة! ✨');
      } else {
        toast.error('حدث خطأ أثناء الحفظ');
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fff5f7] p-4 md:p-8 relative overflow-hidden">
      {/* Magical Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <motion.div 
          animate={{ y: [0, -30, 0], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-20 left-20 w-96 h-96 bg-pink-200/20 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ y: [0, 30, 0], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-20 right-20 w-[30rem] h-[30rem] bg-purple-200/20 rounded-full blur-3xl"
        />
      </div>

      <header className="max-w-4xl mx-auto flex items-center justify-between mb-8 relative z-10">
        <button onClick={() => navigate('/child')} className="bg-white/80 backdrop-blur-md p-3 rounded-2xl shadow-md text-princess-pink hover:bg-white transition-all border-2 border-pink-100">
          <ArrowRight className="w-6 h-6" />
        </button>
        <div className="princess-card px-8 py-4">
          <h1 className="text-2xl md:text-3xl font-bold text-princess-purple flex items-center gap-2">
            <Book className="w-8 h-8 text-princess-pink" />
            مفكرة العجائب
          </h1>
        </div>
        <button 
          onClick={() => setShowHistory(!showHistory)}
          className="bg-white/80 backdrop-blur-md p-3 rounded-2xl shadow-md text-princess-pink hover:bg-white transition-all border-2 border-pink-100"
        >
          <History className="w-6 h-6" />
        </button>
      </header>

      <main className="max-w-4xl mx-auto relative z-10">
        <AnimatePresence mode="wait">
          {!showHistory ? (
            <motion.div
              key="editor"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/80 backdrop-blur-md rounded-[3rem] p-8 md:p-12 shadow-2xl border-4 border-pink-100"
            >
              <h2 className="text-2xl font-bold text-princess-purple mb-6 text-right">ما هي مغامرتكِ اليوم؟</h2>
              <textarea
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
                placeholder="اكتبي هنا عن يومكِ، أحلامكِ، أو أي شيء سحري حدث معكِ..."
                className="w-full h-64 p-6 rounded-3xl border-2 border-pink-100 focus:border-princess-pink outline-none text-right text-lg leading-relaxed font-arabic bg-white/50"
              />
              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleSave}
                  disabled={saving || !entry.trim()}
                  className="princess-button py-4 px-12 text-xl flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                  <span>حفظ في المفكرة</span>
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {history.length === 0 ? (
                <div className="text-center py-20 bg-white/80 backdrop-blur-md rounded-[3rem] border-4 border-dashed border-pink-200">
                  <p className="text-pink-400 text-xl italic">لا توجد ذكريات بعد. ابدئي بالكتابة الآن!</p>
                </div>
              ) : (
                history.map((item) => (
                  <div key={item.id} className="bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] shadow-xl border-2 border-pink-100 text-right">
                    <div className="text-princess-pink text-sm mb-2 font-bold">
                      {item.createdAt?.toDate().toLocaleDateString('ar-EG')}
                    </div>
                    <p className="text-princess-purple text-lg mb-4 leading-relaxed">{item.content}</p>
                    {item.aiFeedback && (
                      <div className="bg-pink-50 p-4 rounded-2xl border-r-4 border-princess-pink flex items-start gap-3">
                        <Wand2 className="w-5 h-5 text-princess-gold mt-1 flex-shrink-0" />
                        <p className="text-princess-purple italic leading-relaxed">"{item.aiFeedback}"</p>
                      </div>
                    )}
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
