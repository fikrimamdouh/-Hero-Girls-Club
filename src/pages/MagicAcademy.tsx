import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Sparkles, ArrowRight, CheckCircle, Trophy, BookOpen, Brain, Heart } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, doc, setDoc } from 'firebase/firestore';
import { Mission, ChildProfile } from '../types';
import { toast } from 'sonner';

import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';

export default function MagicAcademy() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const activeChildStr = localStorage.getItem('active_child');
    if (activeChildStr) {
      const activeChild = JSON.parse(activeChildStr) as ChildProfile;
      setProfile(activeChild);
      
      const q = query(
        collection(db, 'missions'),
        where('childId', '==', activeChild.uid)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        setMissions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any)));
        setLoading(false);
      }, (err) => handleFirestoreError(err, OperationType.GET, 'missions'));

      return () => unsubscribe();
    } else {
      navigate('/');
    }
  }, [navigate]);

  const handleCompleteMission = async (mission: Mission) => {
    if (mission.isCompleted) return;
    
    try {
      await setDoc(doc(db, 'missions', mission.id), {
        isCompleted: true,
        completedAt: Date.now()
      }, { merge: true });

      // Add points to profile
      if (profile) {
        const newPoints = profile.points + mission.points;
        const newLevel = Math.floor(newPoints / 100) + 1;
        await setDoc(doc(db, 'children_profiles', profile.uid), {
          points: newPoints,
          level: newLevel
        }, { merge: true });
        
        toast.success(`أحسنتِ يا بطلة! حصلتِ على ${mission.points} نقطة سحرية!`);
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء إكمال المهمة');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-yellow-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-yellow-500"></div>
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

      <header className="max-w-4xl mx-auto flex items-center justify-between mb-8 relative z-10">
        <button 
          onClick={() => navigate('/child')}
          className="bg-white/80 backdrop-blur-md p-3 rounded-2xl shadow-md text-princess-pink hover:bg-white transition-all border-2 border-pink-100"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
        <div className="princess-card px-8 py-4">
          <h1 className="text-2xl md:text-3xl font-bold text-princess-purple flex items-center gap-2">
            <Star className="w-8 h-8 text-princess-gold fill-current" />
            أكاديمية المهام السحرية
          </h1>
        </div>
        <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-2xl shadow-md flex items-center gap-2 border-2 border-pink-100">
          <Trophy className="w-5 h-5 text-princess-gold fill-current" />
          <span className="font-bold text-princess-purple">{profile?.points}</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-xl border-4 border-pink-100">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-xl font-bold text-princess-purple flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-princess-gold" />
                مهام اليوم
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              {missions.filter(m => !m.isCompleted).map(mission => (
                <motion.div
                  key={mission.id}
                  whileHover={{ scale: 1.02 }}
                  className="p-4 bg-pink-50 rounded-2xl border-2 border-pink-100 flex items-center justify-between"
                >
                  <div className="text-right">
                    <p className="font-bold text-princess-purple">{mission.title}</p>
                    <p className="text-xs text-princess-pink">{mission.points} نقطة</p>
                  </div>
                  <button
                    onClick={() => handleCompleteMission(mission)}
                    className="bg-princess-pink hover:bg-princess-purple text-white p-2 rounded-xl transition-all shadow-md"
                  >
                    <CheckCircle className="w-6 h-6" />
                  </button>
                </motion.div>
              ))}
              {missions.filter(m => !m.isCompleted).length === 0 && (
                <p className="text-center text-pink-400 py-4 italic">أنهيتِ جميع مهام اليوم! أنتِ بطلة رائعة!</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-xl border-4 border-purple-100">
            <CardHeader className="p-0 mb-4">
              <CardTitle className="text-xl font-bold text-princess-purple mb-4 flex items-center gap-2">
                <Trophy className="w-6 h-6 text-princess-gold" />
                المهام المكتملة
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-4 max-h-[300px] overflow-y-auto pr-2">
              {missions.filter(m => m.isCompleted).map(mission => (
                <div key={mission.id} className="p-4 bg-purple-50 rounded-2xl border-2 border-purple-100 flex items-center justify-between opacity-70">
                  <div className="text-right">
                    <p className="font-bold text-princess-purple line-through">{mission.title}</p>
                    <p className="text-xs text-princess-pink">تم الحصول على النقاط ✨</p>
                  </div>
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-to-r from-princess-purple to-princess-pink p-8 rounded-[2.5rem] shadow-2xl text-white text-center border-4 border-white/20">
          <CardHeader className="p-0 mb-4">
            <CardTitle className="text-2xl font-bold">تحدي الأسبوع العالمي</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <CardDescription className="mb-6 opacity-90 text-white">ساعدي في تنظيف البيئة واحصلي على وسام "حامية الطبيعة" النادر!</CardDescription>
            <div className="flex justify-center gap-8">
              <div className="flex flex-col items-center">
                <div className="bg-white/20 p-4 rounded-2xl mb-2">
                  <BookOpen className="w-8 h-8 text-princess-gold" />
                </div>
                <span className="text-xs">قراءة</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-white/20 p-4 rounded-2xl mb-2">
                  <Brain className="w-8 h-8 text-princess-gold" />
                </div>
                <span className="text-xs">تفكير</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-white/20 p-4 rounded-2xl mb-2">
                  <Heart className="w-8 h-8 text-princess-gold" />
                </div>
                <span className="text-xs">مساعدة</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
