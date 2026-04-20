import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Book, ArrowRight, Sparkles, Star, Trophy, Heart, Shield, Palette, Wand2, Loader2 } from 'lucide-react';
import { db } from '../firebase';
import { collection, onSnapshot, doc, setDoc, updateDoc } from 'firebase/firestore';
import { Story, ChildProfile } from '../types';
import { toast } from 'sonner';
import { generateMagicStory } from '../services/aiService';

import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';

export default function StoryWorld() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [activeStory, setActiveStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [aiStory, setAiStory] = useState<{ title: string, content: string } | null>(null);

  useEffect(() => {
    const activeChildStr = localStorage.getItem('active_child');
    if (activeChildStr) {
      setProfile(JSON.parse(activeChildStr));
    } else {
      navigate('/');
    }

    const unsubscribe = onSnapshot(collection(db, 'stories'), (snapshot) => {
      const storiesData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
      setStories(storiesData);
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.GET, 'stories'));

    return () => unsubscribe();
  }, [navigate]);

  const handleCreateAiStory = async () => {
    if (!profile) return;
    setGenerating(true);
    try {
      const themes = ['مغامرة في الغابة السحرية', 'إنقاذ مدينة الألوان', 'البحث عن الكنز المفقود', 'صداقة مع تنين لطيف'];
      const randomTheme = themes[Math.floor(Math.random() * themes.length)];
      const storyText = await generateMagicStory(profile.heroName || profile.name, profile.heroPower || 'الذكاء', randomTheme);
      
      setAiStory({
        title: `مغامرة ${profile.heroName || profile.name}: ${randomTheme}`,
        content: storyText
      });
    } catch (error) {
      toast.error('حدث خطأ في السحر، حاولي مرة أخرى!');
    } finally {
      setGenerating(false);
    }
  };

  const handleReadStory = async (story: Story) => {
    setActiveStory(story);
  };

  const handleCompleteStory = async () => {
    if (!profile || (!activeStory && !aiStory)) return;
    
    try {
      const pointsToAdd = activeStory?.points || 50;
      const newPoints = (profile.points || 0) + pointsToAdd;
      const newLevel = Math.floor(newPoints / 100) + 1;
      
      await updateDoc(doc(db, 'children_profiles', profile.uid), {
        points: newPoints,
        level: newLevel
      });
      
      // Update local storage
      const updatedProfile = { ...profile, points: newPoints, level: newLevel };
      localStorage.setItem('active_child', JSON.stringify(updatedProfile));
      setProfile(updatedProfile);

      toast.success(`أحسنتِ يا بطلة! حصلتِ على ${pointsToAdd} نقطة سحرية لقراءة القصة!`);
      setActiveStory(null);
      setAiStory(null);
    } catch (error) {
      toast.error('حدث خطأ أثناء حفظ التقدم');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-purple-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-purple-500"></div>
      </div>
    );
  }

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

      <header className="max-w-6xl mx-auto flex items-center justify-between mb-8 relative z-10">
        <button 
          onClick={() => navigate('/child')}
          className="bg-white/80 backdrop-blur-md p-3 rounded-2xl shadow-md text-princess-pink hover:bg-white transition-all border-2 border-pink-100"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
        <div className="princess-card px-8 py-4">
          <h1 className="text-2xl md:text-3xl font-bold text-princess-purple flex items-center gap-2">
            <Book className="w-8 h-8 text-princess-pink" />
            عالم القصص السحرية
          </h1>
        </div>
        <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl shadow-md flex items-center gap-2 border-2 border-pink-100">
          <Star className="w-5 h-5 text-princess-gold fill-current" />
          <span className="font-bold text-princess-purple">{profile?.points}</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto relative z-10">
        <AnimatePresence mode="wait">
          {!activeStory && !aiStory ? (
            <motion.div
              key="story-list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              {/* AI Story Generator Card */}
              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-gradient-to-r from-princess-purple to-princess-pink rounded-[3rem] p-8 text-white shadow-2xl relative overflow-hidden group border-4 border-white/20"
              >
                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="text-right">
                    <h2 className="text-3xl font-bold mb-2 flex items-center gap-2 justify-end">
                      اصنعي قصتكِ الخاصة بالذكاء الاصطناعي
                      <Wand2 className="w-8 h-8 text-princess-gold" />
                    </h2>
                    <p className="text-pink-50 text-lg">سأقوم بكتابة مغامرة سحرية تكونين أنتِ بطلتها!</p>
                  </div>
                  <button
                    onClick={handleCreateAiStory}
                    disabled={generating}
                    className="bg-white text-princess-purple font-bold py-4 px-10 rounded-2xl shadow-lg hover:bg-pink-50 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {generating ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6 text-princess-gold" />}
                    {generating ? 'جاري تحضير السحر...' : 'ابدئي المغامرة الآن'}
                  </button>
                </div>
                <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                  <Sparkles className="w-full h-full" />
                </div>
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {stories.length === 0 ? (
                  <div className="col-span-full text-center py-20 bg-white/50 backdrop-blur-md rounded-[3rem] border-4 border-dashed border-pink-200">
                    <Sparkles className="w-16 h-16 text-pink-300 mx-auto mb-4" />
                    <p className="text-pink-400 text-xl">لا يوجد قصص حالياً. انتظروا المزيد قريباً!</p>
                  </div>
                ) : (
                  stories.map(story => (
                    <motion.div
                      key={story.id}
                      whileHover={{ scale: 1.05 }}
                      className="princess-card overflow-hidden group cursor-pointer"
                      onClick={() => handleReadStory(story)}
                    >
                      <div className="h-48 bg-pink-50 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform">
                        📚
                      </div>
                      <div className="p-6 text-right">
                        <h3 className="text-xl font-bold text-princess-purple mb-2">{story.title}</h3>
                        <p className="text-pink-400 text-sm mb-4 line-clamp-2 leading-relaxed">{story.content}</p>
                        <div className="flex items-center justify-between">
                          <span className="bg-pink-100 text-princess-pink px-3 py-1 rounded-full text-xs font-bold">
                            {story.points} نقطة ✨
                          </span>
                          <button className="text-princess-purple font-bold flex items-center gap-1 hover:gap-2 transition-all">
                            اقرئي الآن
                            <ArrowRight className="w-4 h-4 rotate-180" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="story-content"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border-8 border-pink-100 max-w-4xl mx-auto relative z-10"
            >
              <div className="bg-gradient-to-r from-princess-purple to-princess-pink p-8 text-white text-center relative">
                <button 
                  onClick={() => { setActiveStory(null); setAiStory(null); }}
                  className="absolute top-6 left-6 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-all"
                >
                  <ArrowRight className="w-6 h-6" />
                </button>
                <h2 className="text-3xl font-bold mb-2">{activeStory?.title || aiStory?.title}</h2>
                <div className="flex justify-center gap-4 mt-4">
                  <Heart className="w-6 h-6 text-pink-200" />
                  <Shield className="w-6 h-6 text-pink-200" />
                  <Palette className="w-6 h-6 text-pink-200" />
                </div>
              </div>
              <div className="p-12 text-right leading-loose text-xl text-princess-purple font-arabic whitespace-pre-wrap">
                {activeStory?.content || aiStory?.content}
              </div>
              <div className="p-8 bg-pink-50 flex justify-center">
                <button
                  onClick={handleCompleteStory}
                  className="princess-button py-4 px-12 text-xl flex items-center gap-2"
                >
                  <Trophy className="w-6 h-6 text-princess-gold" />
                  لقد قرأت القصة!
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
