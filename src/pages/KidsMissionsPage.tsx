import { useMemo, useState, useEffect } from 'react';
import { CheckCircle2, Target, Star, Sparkles, Trophy, Calendar, Clock, ArrowRight } from 'lucide-react';
import KidsPageLayout from '../components/kids/KidsPageLayout';
import { dailyMissions } from '../data/kidsUniverse';
import { completeMission, loadKidsProgress, saveKidsProgress } from '../lib/kidsProgress';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function KidsMissionsPage() {
  const navigate = useNavigate();
  const [done, setDone] = useState<string[]>([]);
  const [progress, setProgress] = useState(loadKidsProgress());
  const points = useMemo(() => progress.stars, [progress.stars]);

  const handleComplete = (mission: typeof dailyMissions[0]) => {
    if (done.includes(mission.id)) return;
    
    setDone((prev) => [...prev, mission.id]);
    const next = completeMission(progress, mission.id, mission.reward, Math.floor(mission.reward / 2));
    setProgress(next);
    saveKidsProgress(next);
    
    toast.success(`أحسنتِ! حصلتِ على ${mission.reward} نجمة! ⭐`);
    
    // Play success sound
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3');
    audio.play().catch(() => {});
  };

  return (
    <KidsPageLayout title="جزيرة المهمات" subtitle="أكملي المهام واجمعي النجوم السحرية" emoji="🗺️" tone="from-amber-50 to-orange-50">
      <div className="max-w-5xl mx-auto">
        {/* Stats Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="bg-white rounded-[2rem] p-6 border-2 border-amber-100 shadow-xl flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
              <Star className="w-6 h-6 text-amber-600 fill-current" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">النجوم</p>
              <p className="text-2xl font-black text-amber-700">{progress.stars}</p>
            </div>
          </div>
          <div className="bg-white rounded-[2rem] p-6 border-2 border-orange-100 shadow-xl flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
              <Trophy className="w-6 h-6 text-orange-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">المستوى</p>
              <p className="text-2xl font-black text-orange-700">{progress.level}</p>
            </div>
          </div>
          <div className="bg-white rounded-[2rem] p-6 border-2 border-emerald-100 shadow-xl flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">سلسلة الأيام</p>
              <p className="text-2xl font-black text-emerald-700">{progress.streakDays} يوم</p>
            </div>
          </div>
        </div>

        <div className="space-y-12">
          {/* Daily Missions */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-amber-500" />
                مهام اليوم السحرية
              </h2>
              <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                <Clock className="w-4 h-4" />
                تتجدد كل 24 ساعة
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {dailyMissions.map((mission, idx) => {
                const isCompleted = done.includes(mission.id);
                return (
                  <motion.div 
                    key={mission.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className={`group relative bg-white rounded-[2.5rem] p-8 border-4 transition-all ${isCompleted ? 'border-emerald-100 bg-emerald-50/30' : 'border-orange-50 hover:border-orange-200 shadow-xl hover:shadow-orange-100/50'}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={`px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest ${
                        mission.difficulty === 'سهل' ? 'bg-green-100 text-green-600' :
                        mission.difficulty === 'متوسط' ? 'bg-blue-100 text-blue-600' :
                        'bg-purple-100 text-purple-600'
                      }`}>
                        {mission.difficulty}
                      </div>
                      <div className="flex items-center gap-1 text-amber-600 font-black">
                        <Star className="w-4 h-4 fill-current" />
                        +{mission.reward}
                      </div>
                    </div>

                    <h3 className="text-xl font-black text-slate-900 mb-3">{mission.title}</h3>
                    <p className="text-slate-500 font-bold mb-8 leading-relaxed">{mission.description}</p>

                    <button
                      onClick={() => handleComplete(mission)}
                      disabled={isCompleted}
                      className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all ${
                        isCompleted 
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-100' 
                          : 'bg-slate-900 text-white hover:bg-orange-600 hover:scale-[1.02] active:scale-95'
                      }`}
                    >
                      {isCompleted ? (
                        <>
                          <CheckCircle2 className="w-6 h-6" />
                          تم الإنجاز بنجاح!
                        </>
                      ) : (
                        <>
                          <Target className="w-6 h-6" />
                          أنجزت المهمة
                        </>
                      )}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </section>

          {/* Weekly Challenge */}
          <section className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-right">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-black mb-4 border border-white/30">
                  <Trophy className="w-4 h-4 text-amber-300" />
                  التحدي الأسبوعي الكبير
                </div>
                <h2 className="text-3xl md:text-4xl font-black mb-4">بطلة القراءة المثالية</h2>
                <p className="text-indigo-100 text-lg font-bold mb-8 max-w-xl">
                  اقرئي 5 قصص مختلفة من مجرة القصص وشاركي العبرة مع عائلتكِ لتحصلي على شارة نادرة!
                </p>
                <div className="flex items-center justify-center md:justify-start gap-6">
                  <div className="text-center">
                    <p className="text-4xl font-black mb-1">2/5</p>
                    <p className="text-xs font-bold opacity-70 uppercase">التقدم</p>
                  </div>
                  <div className="h-12 w-px bg-white/20" />
                  <div className="text-center">
                    <p className="text-4xl font-black mb-1">250</p>
                    <p className="text-xs font-bold opacity-70 uppercase">الجائزة</p>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => navigate('/kids/stories')}
                className="bg-white text-indigo-700 px-10 py-5 rounded-[2rem] font-black text-xl shadow-xl hover:scale-105 transition-all flex items-center gap-3"
              >
                اذهبي للقصص
                <ArrowRight className="w-6 h-6" />
              </button>
            </div>
          </section>
        </div>
      </div>
    </KidsPageLayout>
  );
}
