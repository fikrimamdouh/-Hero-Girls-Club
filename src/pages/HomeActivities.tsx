import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Star, CheckCircle2, Heart, Sparkles, Home, Loader2 } from 'lucide-react';
import { ChildProfile } from '../types';
import { toast } from 'sonner';
import { db } from '../firebase';
import { doc, getDoc, arrayUnion, runTransaction } from 'firebase/firestore';

type Category = 'all' | 'cooking' | 'art' | 'reading' | 'games' | 'garden' | 'kindness';

interface HomeActivity {
  id: string;
  emoji: string;
  title: string;
  description: string;
  with: string;
  points: number;
  category: Exclude<Category, 'all'>;
}

const ACTIVITIES: HomeActivity[] = [
  { id: 'h1', emoji: '🍪', title: 'اطبخي مع أمي', description: 'اعملوا معاً كوكيز أو كيك بسيط واستمتعوا بوقت ممتع في المطبخ', with: 'مع الأم', points: 30, category: 'cooking' },
  { id: 'h2', emoji: '📖', title: 'قصة وقت النوم', description: 'اقرئي قصة مع أبيكِ أو أمكِ قبل النوم واناقشي أخلاقها', with: 'مع العائلة', points: 25, category: 'reading' },
  { id: 'h3', emoji: '🌱', title: 'نزرع معاً', description: 'ازرعي بذرة أو نبتة صغيرة في وعاء واعتني بها كل يوم', with: 'مع الأب', points: 35, category: 'garden' },
  { id: 'h4', emoji: '🎨', title: 'لوحة فنية للمنزل', description: 'ارسمي لوحة جميلة وزيّني غرفتك أو المنزل بإبداعكِ', with: 'وحدك', points: 20, category: 'art' },
  { id: 'h5', emoji: '🧩', title: 'ألغاز العائلة', description: 'أحضري لعبة ألغاز وألعبوا معاً كعائلة كاملة', with: 'مع العائلة', points: 25, category: 'games' },
  { id: 'h6', emoji: '💌', title: 'رسالة شكر', description: 'اكتبي رسالة شكر صغيرة لأمكِ أو أبيكِ وأخبريهم كم تحبيهم', with: 'للعائلة', points: 40, category: 'kindness' },
  { id: 'h7', emoji: '🧹', title: 'بطلة النظافة', description: 'رتّبي غرفتكِ ونظّفيها وساعدي في ترتيب المنزل بفرح', with: 'مع الأم', points: 30, category: 'kindness' },
  { id: 'h8', emoji: '🎵', title: 'حفلة موسيقية منزلية', description: 'غنّي أنشودتكِ المفضلة وعلّمي أفراد عائلتكِ إياها', with: 'مع العائلة', points: 20, category: 'art' },
  { id: 'h9', emoji: '🌟', title: 'مساعدة في العشاء', description: 'ساعدي في تحضير وترتيب مائدة العشاء وضعي الأطباق بشكل جميل', with: 'مع الأم', points: 25, category: 'cooking' },
  { id: 'h10', emoji: '📸', title: 'ألبوم الذكريات', description: 'ارسمي أو اطبعي صوراً عائلية واصنعي ألبوماً يدوياً جميلاً', with: 'مع الأب', points: 35, category: 'art' },
  { id: 'h11', emoji: '🏃', title: 'وقت الرياضة', description: 'العبي في الحديقة أو المنزل رياضة ممتعة مع إخوتكِ', with: 'مع الإخوة', points: 20, category: 'games' },
  { id: 'h12', emoji: '🍵', title: 'وقت الشاي مع جدتي', description: 'اجلسي مع جدتكِ واسمعي منها قصة من طفولتها وحياتها', with: 'مع الجدة', points: 40, category: 'kindness' },
  { id: 'h13', emoji: '🥗', title: 'سلطة فواكه ملوّنة', description: 'حضّري سلطة فواكه بألوان مختلفة وقدّميها للعائلة', with: 'مع الأم', points: 25, category: 'cooking' },
  { id: 'h14', emoji: '✂️', title: 'أوريغامي ورق', description: 'تعلّمي طيّ ورقة على شكل طائر أو زهرة وعلّقيها في غرفتكِ', with: 'وحدك', points: 20, category: 'art' },
  { id: 'h15', emoji: '📚', title: 'ركن قراءة صغير', description: 'رتّبي ركناً جميلاً للقراءة في غرفتكِ بوسائد ومكتبة كتبكِ المفضلة', with: 'وحدك', points: 30, category: 'reading' },
  { id: 'h16', emoji: '💧', title: 'سقي النباتات', description: 'اسقي نباتات المنزل وتأكّدي من أوراقها واعتني بها كأنها صديقاتكِ', with: 'مع الأب', points: 15, category: 'garden' },
  { id: 'h17', emoji: '🎭', title: 'مسرحية عائلية', description: 'مثّلي مع إخوتكِ مسرحية صغيرة عن قصة تحبيها', with: 'مع الإخوة', points: 35, category: 'art' },
  { id: 'h18', emoji: '🧩', title: 'لغز كبير', description: 'حلّي لغز بازل من 100 قطعة أو أكثر مع شخص تحبيه', with: 'مع العائلة', points: 30, category: 'games' },
  { id: 'h19', emoji: '🍞', title: 'فطور مفاجأة', description: 'حضّري فطوراً بسيطاً وقدّميه لأمكِ في السرير كمفاجأة جميلة', with: 'مع الأم', points: 45, category: 'cooking' },
  { id: 'h20', emoji: '🐦', title: 'إطعام العصافير', description: 'ضعي بعض الفتات أو البذور للعصافير في الحديقة أو الشرفة', with: 'وحدك', points: 20, category: 'kindness' },
  { id: 'h21', emoji: '🎁', title: 'هدية يدوية', description: 'اصنعي هدية صغيرة بيديكِ وقدّميها لشخص تحبيه دون مناسبة', with: 'للعائلة', points: 40, category: 'kindness' },
  { id: 'h22', emoji: '🏰', title: 'قلعة من الوسائد', description: 'ابني قلعة كبيرة من الوسائد والأغطية وادخليها مع كتاب قصة', with: 'مع الإخوة', points: 25, category: 'games' },
  { id: 'h23', emoji: '🌙', title: 'مراقبة النجوم', description: 'اخرجي مع أبيكِ ليلاً واكتشفي النجوم والقمر في السماء', with: 'مع الأب', points: 30, category: 'garden' },
  { id: 'h24', emoji: '📔', title: 'مذكّرات يومية', description: 'اكتبي يومياتكِ في دفتر صغير: ماذا تعلّمتِ وماذا أحببتِ اليوم', with: 'وحدك', points: 25, category: 'reading' },
];

const CATEGORIES: { id: Category; label: string }[] = [
  { id: 'all', label: 'الكل' },
  { id: 'cooking', label: 'طبخ' },
  { id: 'art', label: 'فن وإبداع' },
  { id: 'reading', label: 'قراءة' },
  { id: 'games', label: 'ألعاب' },
  { id: 'garden', label: 'طبيعة' },
  { id: 'kindness', label: 'مساعدة' },
];

const CATEGORY_ACCENT: Record<Category, string> = {
  all: 'bg-teal-500',
  cooking: 'bg-orange-500',
  art: 'bg-pink-500',
  reading: 'bg-blue-500',
  games: 'bg-violet-500',
  garden: 'bg-emerald-500',
  kindness: 'bg-rose-500',
};

export default function HomeActivities() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [activeCategory, setActiveCategory] = useState<Category>('all');
  const [done, setDone] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState<Set<string>>(new Set());
  const [totalEarned, setTotalEarned] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const activeChildStr = localStorage.getItem('active_child');
    if (!activeChildStr) {
      navigate('/');
      return;
    }
    const localChild: ChildProfile = JSON.parse(activeChildStr);

    const fetchFromFirestore = async () => {
      try {
        const childSnap = await getDoc(doc(db, 'children_profiles', localChild.uid));
        if (childSnap.exists()) {
          const data = childSnap.data();
          const firestoreCompleted: string[] = data.home_activities_completed || [];
          const completedSet = new Set<string>(firestoreCompleted);
          setDone(completedSet);
          const earned = ACTIVITIES.filter((a) => completedSet.has(a.id)).reduce((s, a) => s + a.points, 0);
          setTotalEarned(earned);
          localStorage.setItem('home_activities_done', JSON.stringify(firestoreCompleted));

          const freshProfile: ChildProfile = {
            ...localChild,
            points: data.points ?? localChild.points,
            level: data.level ?? localChild.level,
          };
          setProfile(freshProfile);
          localStorage.setItem('active_child', JSON.stringify(freshProfile));
        } else {
          setProfile(localChild);
          const savedDone: string[] = JSON.parse(localStorage.getItem('home_activities_done') || '[]');
          const completedSet = new Set<string>(savedDone);
          setDone(completedSet);
          const earned = ACTIVITIES.filter((a) => completedSet.has(a.id)).reduce((s, a) => s + a.points, 0);
          setTotalEarned(earned);
        }
      } catch {
        setProfile(localChild);
        const savedDone: string[] = JSON.parse(localStorage.getItem('home_activities_done') || '[]');
        const completedSet = new Set<string>(savedDone);
        setDone(completedSet);
        const earned = ACTIVITIES.filter((a) => completedSet.has(a.id)).reduce((s, a) => s + a.points, 0);
        setTotalEarned(earned);
      } finally {
        setLoading(false);
      }
    };

    fetchFromFirestore();
  }, [navigate]);

  const markDone = async (activity: HomeActivity) => {
    if (done.has(activity.id) || pending.has(activity.id) || !profile) return;

    setPending((p) => new Set(p).add(activity.id));
    const prevDone = new Set(done);
    const newDone = new Set(done);
    newDone.add(activity.id);
    setDone(newDone);
    setTotalEarned((p) => p + activity.points);

    try {
      const childRef = doc(db, 'children_profiles', profile.uid);

      const newPoints = await runTransaction(db, async (transaction) => {
        const childSnap = await transaction.get(childRef);
        const currentPoints: number = childSnap.exists()
          ? (childSnap.data().points ?? profile.points)
          : profile.points;
        const updated = currentPoints + activity.points;
        const newLevel = Math.floor(updated / 100) + 1;
        transaction.set(
          childRef,
          {
            points: updated,
            level: newLevel,
            home_activities_completed: arrayUnion(activity.id),
          },
          { merge: true }
        );
        return updated;
      });

      const newLevel = Math.floor(newPoints / 100) + 1;
      const updatedProfile = { ...profile, points: newPoints, level: newLevel };
      setProfile(updatedProfile);
      localStorage.setItem('active_child', JSON.stringify(updatedProfile));
      localStorage.setItem('home_activities_done', JSON.stringify([...newDone]));

      toast.success(`رائعة! أنجزتِ "${activity.title}" وحصلتِ على ${activity.points} نقطة! 🌟`, {
        icon: '🏠',
        style: { background: '#14b8a6', color: 'white', border: 'none' },
      });
    } catch {
      setDone(prevDone);
      setTotalEarned((p) => p - activity.points);
      toast.error('حدث خطأ أثناء حفظ النقاط');
    } finally {
      setPending((p) => {
        const next = new Set(p);
        next.delete(activity.id);
        return next;
      });
    }
  };

  const counts = useMemo(() => {
    const c: Partial<Record<Category, number>> = { all: ACTIVITIES.length };
    ACTIVITIES.forEach((a) => {
      c[a.category] = (c[a.category] || 0) + 1;
    });
    return c;
  }, []);

  const filtered = useMemo(
    () => ACTIVITIES.filter((a) => activeCategory === 'all' || a.category === activeCategory),
    [activeCategory]
  );

  const completedCount = [...done].filter((id) => ACTIVITIES.find((a) => a.id === id)).length;
  const progressPct = (completedCount / ACTIVITIES.length) * 100;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fdfaf6] flex items-center justify-center">
        <Loader2 className="h-12 w-12 text-teal-500 animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#fdfaf6] font-arabic"
      dir="rtl"
      style={{
        backgroundImage:
          'radial-gradient(circle at 0% 0%, rgba(153,246,228,0.4), transparent 50%), radial-gradient(circle at 100% 0%, rgba(254,205,211,0.3), transparent 45%)',
      }}
    >
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-stone-200/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center gap-3">
          <button
            onClick={() => navigate('/child')}
            className="h-10 w-10 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors shrink-0"
            aria-label="العودة"
          >
            <ArrowRight className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-2 shrink-0">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center shadow-md shadow-teal-200">
              <Home className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-[11px] leading-none text-stone-400 font-bold">أنشطة المنزل</p>
              <p className="text-sm font-extrabold leading-tight text-stone-800">فعاليات مع العائلة</p>
            </div>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 ring-1 ring-emerald-200 px-3 py-1.5 rounded-full">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              <span className="font-extrabold text-emerald-700 text-xs">
                {completedCount}/{ACTIVITIES.length}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-amber-50 ring-1 ring-amber-200 px-3 py-1.5 rounded-full">
              <Star className="h-4 w-4 text-amber-500 fill-current" />
              <span className="font-extrabold text-amber-700 text-sm">{totalEarned}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        {/* Progress card */}
        <div className="bg-white rounded-3xl ring-1 ring-stone-200 p-6 mb-8 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-extrabold text-stone-800 flex items-center gap-2">
              <Heart className="h-5 w-5 text-rose-400 fill-current" />
              تقدمكِ هذا الأسبوع
            </h2>
            <span className="text-sm font-extrabold text-stone-500">
              {completedCount} من {ACTIVITIES.length} نشاط
            </span>
          </div>
          <div className="w-full bg-stone-100 rounded-full h-3 overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full"
            />
          </div>
          {completedCount === ACTIVITIES.length && (
            <p className="text-center mt-3 text-emerald-600 font-extrabold flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5" />
              واو! أكملتِ جميع الأنشطة! أنتِ بطلة المنزل! 🎉
            </p>
          )}
        </div>

        {/* Category chips */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 no-scrollbar">
          {CATEGORIES.map((cat) => {
            const active = activeCategory === cat.id;
            const accent = CATEGORY_ACCENT[cat.id];
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`shrink-0 px-4 py-2 rounded-full text-sm font-extrabold transition-all flex items-center gap-2 ${
                  active
                    ? `${accent} text-white shadow-md`
                    : 'bg-white text-stone-600 ring-1 ring-stone-200 hover:ring-stone-300'
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    active ? 'bg-white/25' : 'bg-stone-100 text-stone-500'
                  }`}
                >
                  {counts[cat.id] || 0}
                </span>
              </button>
            );
          })}
        </div>

        {/* Activities grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((activity, i) => {
            const isDone = done.has(activity.id);
            const accent = CATEGORY_ACCENT[activity.category];
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                whileHover={!isDone ? { y: -4 } : {}}
                className={`bg-white rounded-2xl ring-1 ring-stone-200 hover:shadow-lg shadow-stone-100 transition-all overflow-hidden flex flex-col relative ${
                  isDone ? 'opacity-70' : ''
                }`}
              >
                <div className={`h-1.5 w-full ${accent}`} />
                {isDone && (
                  <div className="absolute top-3 left-3 bg-emerald-500 text-white rounded-full p-1 shadow-md">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                )}
                <div className="p-5 flex flex-col gap-3 flex-1">
                  <div className="text-5xl">{activity.emoji}</div>
                  <div>
                    <h3
                      className={`text-lg font-extrabold text-stone-800 mb-1 ${
                        isDone ? 'line-through text-stone-500' : ''
                      }`}
                    >
                      {activity.title}
                    </h3>
                    <p className="text-stone-500 text-sm leading-relaxed">{activity.description}</p>
                  </div>
                  <div className="mt-auto pt-3 flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full">
                      {activity.with}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 ring-1 ring-amber-200 text-xs font-extrabold px-2.5 py-1 rounded-full">
                        <Star className="h-3 w-3 fill-current" />
                        +{activity.points}
                      </span>
                      {!isDone && (
                        <button
                          onClick={() => markDone(activity)}
                          disabled={pending.has(activity.id)}
                          className="bg-emerald-500 hover:bg-emerald-600 text-white font-extrabold text-xs px-3 py-1.5 rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {pending.has(activity.id) ? '...' : 'أنجزتُ ✓'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Footer banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-500 to-emerald-500 p-8 text-white shadow-lg shadow-teal-200"
        >
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-12 -right-8 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10 text-center max-w-2xl mx-auto">
            <p className="text-2xl sm:text-3xl font-extrabold mb-2">🏠 المنزل مدرسة الحياة الأولى</p>
            <p className="text-teal-50 font-bold text-sm sm:text-base">
              كل نشاط تقومين به مع عائلتكِ يجعلك أميرة المنزل وبطلة القلوب 💚
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
