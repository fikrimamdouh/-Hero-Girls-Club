import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Trophy, Star, ArrowRight, Sparkles, Medal } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { ChildProfile } from '../types';

import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';

export default function StarsPage() {
  const navigate = useNavigate();
  const [topHeroes, setTopHeroes] = useState<ChildProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'children_profiles'),
      orderBy('points', 'desc'),
      limit(10)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTopHeroes(snapshot.docs.map(doc => doc.data() as ChildProfile));
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.GET, 'children_profiles'));

    return () => unsubscribe();
  }, []);

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
            <Trophy className="w-8 h-8 text-princess-gold" />
            قاعة النجوم العالمية
          </h1>
        </div>
        <div className="w-12"></div>
      </header>

      <main className="max-w-4xl mx-auto relative z-10">
        <div className="bg-white/80 backdrop-blur-md rounded-[2.5rem] shadow-2xl overflow-hidden border-4 border-pink-100">
          <div className="bg-gradient-to-r from-princess-purple to-princess-pink p-8 text-white text-center">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-princess-gold opacity-50" />
            <h2 className="text-2xl font-bold mb-2">أفضل 10 بطلات في العالم</h2>
            <p className="text-pink-50">البطلات اللواتي جمعن أكبر عدد من النقاط السحرية</p>
          </div>

          <div className="p-6 space-y-4">
            {loading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-princess-pink"></div>
              </div>
            ) : topHeroes.length === 0 ? (
              <div className="text-center py-12 text-pink-300 italic">
                لا يوجد بطلات في القائمة بعد. كوني الأولى!
              </div>
            ) : (
              topHeroes.map((hero, index) => (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  key={hero.uid}
                  className={`flex items-center gap-4 p-4 rounded-2xl border-2 ${
                    index === 0 ? 'bg-pink-50 border-princess-gold' : 
                    index === 1 ? 'bg-purple-50 border-purple-200' :
                    index === 2 ? 'bg-orange-50 border-orange-200' :
                    'bg-white border-pink-50'
                  }`}
                >
                  <div className="w-12 h-12 flex items-center justify-center font-bold text-2xl text-princess-purple">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                  </div>
                  <div className={`w-14 h-14 ${hero.avatar?.color || 'bg-pink-200'} rounded-full flex items-center justify-center text-3xl border-4 border-white shadow-md`}>
                    {hero.avatar?.hairStyle || '👧'}
                  </div>
                  <div className="flex-1 text-right">
                    <h3 className="font-bold text-princess-purple text-lg">{hero.heroName || hero.name}</h3>
                    <p className="text-sm text-princess-pink">المستوى: {hero.level}</p>
                  </div>
                  <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-pink-100 shadow-sm">
                    <Star className="w-5 h-5 text-princess-gold fill-current" />
                    <span className="font-bold text-princess-purple">{hero.points}</span>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-lg border-2 border-pink-100 text-center">
            <Medal className="w-10 h-10 text-princess-gold mx-auto mb-2" />
            <h4 className="font-bold text-princess-purple">وسام الشجاعة</h4>
            <p className="text-xs text-princess-pink">للبطلات اللواتي أكملن 50 مهمة</p>
          </div>
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-lg border-2 border-pink-100 text-center">
            <Medal className="w-10 h-10 text-princess-purple mx-auto mb-2" />
            <h4 className="font-bold text-princess-purple">وسام الحكمة</h4>
            <p className="text-xs text-princess-pink">للبطلات اللواتي قرأن 20 قصة</p>
          </div>
          <div className="bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-lg border-2 border-pink-100 text-center">
            <Medal className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <h4 className="font-bold text-princess-purple">وسام الصداقة</h4>
            <p className="text-xs text-princess-pink">للبطلات اللواتي ساعدن الآخرين</p>
          </div>
        </div>
      </main>
    </div>
  );
}
