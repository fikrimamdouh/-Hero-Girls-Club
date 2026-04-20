import { useMemo, useState } from 'react';
import { Gift, Trophy, Star, Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import KidsPageLayout from '../components/kids/KidsPageLayout';
import { badgeCards } from '../data/kidsUniverse';
import { loadKidsProgress } from '../lib/kidsProgress';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

export default function KidsRewardsPage() {
  const progressState = loadKidsProgress();
  const [claimed, setClaimed] = useState<string[]>(['b1']); // Start with one unlocked for demo
  const progressPercentage = useMemo(() => Math.round((claimed.length / badgeCards.length) * 100), [claimed]);

  const handleUnlock = (badgeId: string) => {
    if (claimed.includes(badgeId)) return;
    setClaimed(prev => [...prev, badgeId]);
    toast.success('تم فتح شارة جديدة! 🏆✨');
    
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3');
    audio.play().catch(() => {});
  };

  return (
    <KidsPageLayout title="قصر الجوائز" subtitle="اجمعي الشارات وكوني بطلة متميزة" emoji="🏆" tone="from-yellow-50 to-amber-50">
      <div className="max-w-6xl mx-auto">
        {/* Progress Overview */}
        <section className="bg-white rounded-[3rem] p-8 md:p-12 border-4 border-yellow-100 shadow-2xl mb-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 text-yellow-50 opacity-50">
            <Trophy className="w-48 h-48" />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-right">
              <h2 className="text-3xl font-black text-amber-900 mb-4">تقدمكِ في قصر الجوائز</h2>
              <div className="flex items-center justify-center md:justify-start gap-4 mb-6">
                <div className="bg-amber-100 px-4 py-2 rounded-2xl flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-600 fill-current" />
                  <span className="font-black text-amber-700">{progressState.stars} نجمة</span>
                </div>
                <div className="bg-yellow-100 px-4 py-2 rounded-2xl flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                  <span className="font-black text-yellow-700">{claimed.length} شارات</span>
                </div>
              </div>
              <div className="w-full md:w-96">
                <div className="flex justify-between text-sm font-bold text-amber-800 mb-2">
                  <span>اكتمال المجموعة</span>
                  <span>{progressPercentage}%</span>
                </div>
                <div className="h-6 bg-amber-50 rounded-full overflow-hidden border-2 border-amber-100 p-1">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercentage}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    className="h-full bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full relative"
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:20px_20px] animate-[shimmer_2s_linear_infinite]" />
                  </motion.div>
                </div>
              </div>
            </div>
            
            <div className="w-32 h-32 bg-amber-500 rounded-full flex items-center justify-center text-white shadow-2xl shadow-amber-200 border-8 border-white">
              <span className="text-4xl font-black">{progressPercentage}%</span>
            </div>
          </div>
        </section>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {badgeCards.map((badge, idx) => {
            const isUnlocked = claimed.includes(badge.id);
            return (
              <motion.div 
                key={badge.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.1 }}
                className={`group relative bg-white rounded-[2.5rem] p-8 border-4 text-center transition-all ${
                  isUnlocked 
                    ? 'border-yellow-200 shadow-xl shadow-yellow-50' 
                    : 'border-slate-50 opacity-75 grayscale'
                }`}
              >
                {!isUnlocked && (
                  <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] rounded-[2.5rem] z-10 flex items-center justify-center">
                    <div className="bg-white p-4 rounded-full shadow-lg border-2 border-slate-100">
                      <Lock className="w-8 h-8 text-slate-400" />
                    </div>
                  </div>
                )}

                <div className={`w-24 h-24 mx-auto mb-6 rounded-3xl flex items-center justify-center text-5xl transition-transform group-hover:scale-110 ${
                  isUnlocked ? 'bg-amber-100' : 'bg-slate-100'
                }`}>
                  {badge.emoji}
                </div>

                <h3 className={`text-xl font-black mb-2 ${isUnlocked ? 'text-amber-900' : 'text-slate-400'}`}>
                  {badge.name}
                </h3>
                
                <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest mb-4 ${
                  badge.rarity === 'ذهبي' ? 'bg-yellow-100 text-yellow-600' :
                  badge.rarity === 'فضي' ? 'bg-slate-100 text-slate-600' :
                  'bg-orange-100 text-orange-600'
                }`}>
                  {badge.rarity}
                </div>

                <p className="text-xs font-bold text-slate-500 mb-6 leading-relaxed">
                  {badge.requirement}
                </p>

                {isUnlocked ? (
                  <div className="flex items-center justify-center gap-2 text-emerald-600 font-black">
                    <CheckCircle2 className="w-5 h-5" />
                    تم الفوز!
                  </div>
                ) : (
                  <button 
                    onClick={() => handleUnlock(badge.id)}
                    className="w-full py-3 bg-slate-100 text-slate-400 rounded-xl font-black text-sm hover:bg-amber-500 hover:text-white transition-all"
                  >
                    افتحي الشارة
                  </button>
                )}

                {isUnlocked && (
                  <div className="absolute -top-2 -right-2">
                    <Sparkles className="w-8 h-8 text-yellow-400 animate-pulse" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Inspiration Quote */}
        <div className="mt-16 text-center p-10 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-[3rem] text-white shadow-xl">
          <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-2xl font-black mb-2">كل شارة هي قصة نجاح!</h3>
          <p className="font-bold opacity-90">استمري في التعلم واللعب لتملئي قصركِ بأجمل الجوائز.</p>
        </div>
      </div>
    </KidsPageLayout>
  );
}
