import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Star, Sparkles, ArrowRight, CheckCircle, Trophy, BookOpen, Brain, Heart, Target, Loader2 } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, doc, setDoc, getDocs } from 'firebase/firestore';
import { Mission, ChildProfile } from '../types';
import { toast } from 'sonner';

import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';
import { awardBadgeIfNotEarned, BADGE_IDS } from '../lib/badgeUtils';

const DEFAULT_MISSIONS = [
  { title: 'اقرئي قصة سحرية', points: 20, category: 'reading' },
  { title: 'تدرّبي على الحروف الأبجدية', points: 15, category: 'language' },
  { title: 'حلّي مسألة رياضية واحدة', points: 25, category: 'math' },
  { title: 'ارسمي لوحة إبداعية', points: 20, category: 'art' },
  { title: 'ساعدي أمكِ في شيء بالبيت', points: 30, category: 'kindness' },
  { title: 'تعلّمي كلمة جديدة باللغة العربية', points: 15, category: 'language' },
  { title: 'شاهدي فيديو تعليمي واحد', points: 10, category: 'learning' },
  { title: 'اكتبي يومياتكِ السحرية اليوم', points: 25, category: 'journal' },
];

const WEEKLY_CHALLENGES = [
  { title: 'تحدي الأسبوع العالمي', description: 'ساعدي في تنظيف البيئة واحصلي على وسام "حامية الطبيعة" النادر!' },
  { title: 'تحدي القراءة الأسبوعي', description: 'اقرئي ثلاث قصص هذا الأسبوع واحصلي على وسام "قارئة النجوم" اللامعة!' },
  { title: 'تحدي الرياضيات الأسبوعي', description: 'حلّي عشر مسائل رياضية هذا الأسبوع واحصلي على وسام "عبقرية الأرقام"!' },
  { title: 'تحدي الإبداع الأسبوعي', description: 'ارسمي لوحة جميلة كل يوم هذا الأسبوع واحصلي على وسام "فنانة الأحلام"!' },
  { title: 'تحدي المساعدة الأسبوعي', description: 'ساعدي أسرتك في المنزل كل يوم هذا الأسبوع واحصلي على وسام "الأميرة المساعِدة"!' },
  { title: 'تحدي التعلّم الأسبوعي', description: 'شاهدي خمسة فيديوهات تعليمية هذا الأسبوع واحصلي على وسام "المتعلّمة الذكية"!' },
  { title: 'تحدي اللغة الأسبوعي', description: 'تعلّمي سبع كلمات جديدة هذا الأسبوع واحصلي على وسام "أميرة اللغة العربية"!' },
];

function getTodayDate(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getWeekNumber(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  return Math.floor((date.getTime() - startOfYear.getTime()) / (7 * 24 * 60 * 60 * 1000));
}

const CATEGORY_ACCENT: Record<string, { stripe: string; soft: string }> = {
  reading: { stripe: 'bg-blue-500', soft: 'bg-blue-50 text-blue-600 ring-blue-200' },
  language: { stripe: 'bg-violet-500', soft: 'bg-violet-50 text-violet-600 ring-violet-200' },
  math: { stripe: 'bg-emerald-500', soft: 'bg-emerald-50 text-emerald-600 ring-emerald-200' },
  art: { stripe: 'bg-pink-500', soft: 'bg-pink-50 text-pink-600 ring-pink-200' },
  kindness: { stripe: 'bg-rose-500', soft: 'bg-rose-50 text-rose-600 ring-rose-200' },
  learning: { stripe: 'bg-amber-500', soft: 'bg-amber-50 text-amber-600 ring-amber-200' },
  journal: { stripe: 'bg-fuchsia-500', soft: 'bg-fuchsia-50 text-fuchsia-600 ring-fuchsia-200' },
};

const getAccent = (category: string) =>
  CATEGORY_ACCENT[category] || { stripe: 'bg-stone-400', soft: 'bg-stone-50 text-stone-600 ring-stone-200' };

export default function MagicAcademy() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loading, setLoading] = useState(true);
  const seedingRef = useRef(false);

  const today = getTodayDate();
  const weeklyChallenge = WEEKLY_CHALLENGES[getWeekNumber(new Date()) % WEEKLY_CHALLENGES.length];

  const seedMissions = async (childId: string) => {
    if (seedingRef.current) return;
    seedingRef.current = true;
    try {
      for (const m of DEFAULT_MISSIONS) {
        await addDoc(collection(db, 'missions'), {
          childId,
          title: m.title,
          points: m.points,
          category: m.category,
          isCompleted: false,
          createdAt: Date.now(),
          createdDate: today,
        });
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'missions');
      seedingRef.current = false;
    }
  };

  useEffect(() => {
    const activeChildStr = localStorage.getItem('active_child');
    if (activeChildStr) {
      const activeChild = JSON.parse(activeChildStr) as ChildProfile;
      setProfile(activeChild);

      const q = query(collection(db, 'missions'), where('childId', '==', activeChild.uid));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as any));
          const todayMissions = data.filter((m: any) => m.createdDate === today);
          setMissions(todayMissions);
          setLoading(false);
          if (todayMissions.length === 0) {
            seedMissions(activeChild.uid);
          }
        },
        (err) => handleFirestoreError(err, OperationType.GET, 'missions')
      );

      return () => unsubscribe();
    } else {
      navigate('/');
    }
  }, [navigate]);

  const handleCompleteMission = async (mission: Mission) => {
    if (mission.isCompleted) return;

    try {
      await setDoc(
        doc(db, 'missions', mission.id),
        { isCompleted: true, completedAt: Date.now() },
        { merge: true }
      );

      if (profile) {
        const newPoints = profile.points + mission.points;
        const newLevel = Math.floor(newPoints / 100) + 1;
        await setDoc(
          doc(db, 'children_profiles', profile.uid),
          { points: newPoints, level: newLevel },
          { merge: true }
        );

        toast.success(`أحسنتِ يا بطلة! حصلتِ على ${mission.points} نقطة سحرية!`);

        const completedSnap = await getDocs(
          query(
            collection(db, 'missions'),
            where('childId', '==', profile.uid),
            where('isCompleted', '==', true)
          )
        );
        if (completedSnap.size >= 10) {
          await awardBadgeIfNotEarned(profile.uid, BADGE_IDS.COURAGE);
        }
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء إكمال المهمة');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdfaf6] flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-amber-500 animate-spin" />
      </div>
    );
  }

  const pendingMissions = missions.filter((m) => !m.isCompleted);
  const completedMissions = missions.filter((m) => m.isCompleted);
  const totalProgress = missions.length > 0 ? (completedMissions.length / missions.length) * 100 : 0;

  return (
    <div
      className="min-h-screen bg-[#fdfaf6] font-arabic"
      dir="rtl"
      style={{
        backgroundImage:
          'radial-gradient(circle at 0% 0%, rgba(254,240,138,0.4), transparent 50%), radial-gradient(circle at 100% 0%, rgba(252,211,77,0.3), transparent 45%)',
      }}
    >
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-stone-200/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 h-16 flex items-center gap-3">
          <button
            onClick={() => navigate('/child')}
            className="h-10 w-10 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors shrink-0"
            aria-label="العودة"
          >
            <ArrowRight className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2 shrink-0">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-amber-200">
              <Target className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-[11px] leading-none text-stone-400 font-bold">أكاديمية المهام</p>
              <p className="text-sm font-extrabold leading-tight text-stone-800">مهام اليوم السحرية</p>
            </div>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 ring-1 ring-emerald-200 px-3 py-1.5 rounded-full">
              <CheckCircle className="h-3.5 w-3.5 text-emerald-600" />
              <span className="font-extrabold text-emerald-700 text-xs">
                {completedMissions.length}/{missions.length}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-amber-50 ring-1 ring-amber-200 px-3 py-1.5 rounded-full">
              <Star className="h-4 w-4 text-amber-500 fill-current" />
              <span className="font-extrabold text-amber-700 text-sm">{profile?.points || 0}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        {/* Progress card */}
        <div className="bg-white rounded-3xl ring-1 ring-stone-200 p-6 mb-8 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-lg font-extrabold text-stone-800 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                تقدمكِ اليوم
              </h2>
              <p className="text-stone-500 text-sm font-bold">
                {completedMissions.length} من {missions.length} مهمة مكتملة
              </p>
            </div>
            <span className="text-2xl font-extrabold text-amber-500">{Math.round(totalProgress)}%</span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${totalProgress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Pending */}
          <section>
            <h3 className="text-base font-extrabold text-stone-800 mb-4 flex items-center gap-2">
              <Target className="h-4 w-4 text-amber-500" />
              مهام في انتظاركِ
              <span className="text-xs font-extrabold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                {pendingMissions.length}
              </span>
            </h3>
            <div className="space-y-3">
              {pendingMissions.map((mission) => {
                const accent = getAccent((mission as any).category);
                return (
                  <motion.div
                    key={mission.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-white rounded-2xl ring-1 ring-stone-200 hover:ring-stone-300 hover:shadow-md transition-all overflow-hidden flex items-stretch"
                  >
                    <div className={`w-1.5 ${accent.stripe}`} />
                    <div className="flex-1 p-4 flex items-center justify-between gap-3">
                      <div className="text-right flex-1 min-w-0">
                        <p className="font-extrabold text-stone-800 text-sm truncate">{mission.title}</p>
                        <span className={`inline-flex items-center gap-1 mt-1 text-xs font-extrabold px-2 py-0.5 rounded-full ring-1 ${accent.soft}`}>
                          <Star className="h-3 w-3 fill-current" />
                          +{mission.points} نقطة
                        </span>
                      </div>
                      <button
                        onClick={() => handleCompleteMission(mission)}
                        className="bg-emerald-500 hover:bg-emerald-600 text-white p-2.5 rounded-xl transition-all shadow-sm shrink-0"
                        aria-label="إكمال المهمة"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                    </div>
                  </motion.div>
                );
              })}
              {pendingMissions.length === 0 && (
                <div className="bg-white rounded-2xl ring-1 ring-stone-200 p-8 text-center">
                  <Trophy className="h-10 w-10 text-amber-400 mx-auto mb-2" />
                  <p className="text-stone-600 font-bold">أنهيتِ جميع مهام اليوم! أنتِ بطلة رائعة!</p>
                </div>
              )}
            </div>
          </section>

          {/* Completed */}
          <section>
            <h3 className="text-base font-extrabold text-stone-800 mb-4 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-emerald-500" />
              مهام مكتملة
              <span className="text-xs font-extrabold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                {completedMissions.length}
              </span>
            </h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
              {completedMissions.map((mission) => (
                <div
                  key={mission.id}
                  className="bg-emerald-50/60 rounded-2xl ring-1 ring-emerald-100 p-4 flex items-center justify-between gap-3"
                >
                  <div className="text-right flex-1 min-w-0">
                    <p className="font-extrabold text-emerald-900 text-sm line-through truncate">{mission.title}</p>
                    <p className="text-xs text-emerald-600 font-bold mt-0.5">تم الحصول على النقاط ✨</p>
                  </div>
                  <CheckCircle className="h-6 w-6 text-emerald-500 fill-emerald-100 shrink-0" />
                </div>
              ))}
              {completedMissions.length === 0 && (
                <div className="bg-white rounded-2xl ring-1 ring-stone-200 p-8 text-center">
                  <p className="text-stone-400 font-bold">لا توجد مهام مكتملة بعد، هيّا ابدئي!</p>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Weekly challenge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 p-8 text-white shadow-lg shadow-purple-200"
        >
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-12 -right-8 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10 text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-bold mb-4">
              <Trophy className="h-3.5 w-3.5" />
              تحدي الأسبوع
            </div>
            <h3 className="text-2xl sm:text-3xl font-extrabold mb-3">{weeklyChallenge.title}</h3>
            <p className="text-purple-50 mb-6 text-sm sm:text-base font-bold leading-relaxed">
              {weeklyChallenge.description}
            </p>
            <div className="flex justify-center gap-6">
              <div className="flex flex-col items-center">
                <div className="bg-white/20 p-3 rounded-2xl mb-1">
                  <BookOpen className="h-6 w-6 text-amber-200" />
                </div>
                <span className="text-xs font-bold">قراءة</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-white/20 p-3 rounded-2xl mb-1">
                  <Brain className="h-6 w-6 text-amber-200" />
                </div>
                <span className="text-xs font-bold">تفكير</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-white/20 p-3 rounded-2xl mb-1">
                  <Heart className="h-6 w-6 text-amber-200" />
                </div>
                <span className="text-xs font-bold">مساعدة</span>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
