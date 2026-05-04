import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { toast } from 'sonner';
import {
  Heart,
  Moon,
  Star,
  Book,
  Music,
  ArrowRight,
  Sparkles,
  Play,
  Sun,
  Cloud,
} from 'lucide-react';
import { ChildProfile } from '../types';

type ValueCategory = 'all' | 'quran' | 'manners' | 'prophets' | 'songs' | 'discovery';

interface ValueItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: Exclude<ValueCategory, 'all'>;
}

const CATEGORY_ACCENT: Record<ValueCategory, string> = {
  all: 'bg-emerald-500',
  quran: 'bg-emerald-500',
  manners: 'bg-pink-500',
  prophets: 'bg-amber-500',
  songs: 'bg-rose-500',
  discovery: 'bg-sky-500',
};

const CATEGORY_SOFT: Record<Exclude<ValueCategory, 'all'>, string> = {
  quran: 'bg-emerald-50 text-emerald-600 ring-emerald-200',
  manners: 'bg-pink-50 text-pink-600 ring-pink-200',
  prophets: 'bg-amber-50 text-amber-600 ring-amber-200',
  songs: 'bg-rose-50 text-rose-600 ring-rose-200',
  discovery: 'bg-sky-50 text-sky-600 ring-sky-200',
};

const VALUES: ValueItem[] = [
  { id: '1', title: 'تحفيظ سورة الفاتحة', description: 'تعلمي قراءة أم الكتاب بصوت جميل', icon: <Book className="h-6 w-6" />, category: 'quran' },
  { id: '2', title: 'قصة النبي يوسف عليه السلام', description: 'دروس في الصبر والجمال والأمانة', icon: <Star className="h-6 w-6" />, category: 'prophets' },
  { id: '3', title: 'آداب الطعام والشراب', description: 'كيف نأكل ونشرب مثل الأميرات المهذبات', icon: <Heart className="h-6 w-6" />, category: 'manners' },
  { id: '4', title: 'أنشودة "يا طيبة"', description: 'أنشودة جميلة في حب المدينة المنورة', icon: <Music className="h-6 w-6" />, category: 'songs' },
  { id: '5', title: 'الصدق منجاة', description: 'لماذا يحب الله الصادقين؟', icon: <Sparkles className="h-6 w-6" />, category: 'manners' },
  { id: '6', title: 'قصة نوح عليه السلام والسفينة', description: 'مغامرة إيمانية عظيمة', icon: <Cloud className="h-6 w-6" />, category: 'prophets' },
  { id: '7', title: 'سورة الإخلاص والمعوذات', description: 'حصن المسلم الصغير', icon: <Book className="h-6 w-6" />, category: 'quran' },
  { id: '8', title: 'آداب السلام والتحية', description: 'إفشاء السلام بين الناس', icon: <Heart className="h-6 w-6" />, category: 'manners' },
  { id: '9', title: 'قصة النبي يونس والحوت', description: 'دروس في الدعاء والاستغفار', icon: <Star className="h-6 w-6" />, category: 'prophets' },
  { id: '10', title: 'أنشودة "طلع البدر علينا"', description: 'استقبال النبي في المدينة', icon: <Music className="h-6 w-6" />, category: 'songs' },
  { id: '11', title: 'النظافة من الإيمان', description: 'كيف نحافظ على نظافتنا وجمالنا', icon: <Sparkles className="h-6 w-6" />, category: 'manners' },
  { id: '12', title: 'قصة النبي إبراهيم عليه السلام', description: 'البحث عن الحقيقة وبناء الكعبة', icon: <Star className="h-6 w-6" />, category: 'prophets' },
  { id: '13', title: 'عالم الفضاء الواسع', description: 'رحلة بين النجوم والكواكب البعيدة', icon: <Cloud className="h-6 w-6" />, category: 'discovery' },
  { id: '14', title: 'أسرار المحيطات', description: 'ماذا يوجد في أعماق البحار الزرقاء؟', icon: <Sparkles className="h-6 w-6" />, category: 'discovery' },
  { id: '15', title: 'مملكة الحيوان', description: 'تعرفي على أصدقائنا من الحيوانات اللطيفة', icon: <Heart className="h-6 w-6" />, category: 'discovery' },
  { id: '16', title: 'جسم الإنسان المذهل', description: 'كيف تعمل حواسنا الخمس؟', icon: <Sparkles className="h-6 w-6" />, category: 'discovery' },
  { id: '17', title: 'عجائب الدنيا السبع', description: 'رحلة حول العالم لاكتشاف أجمل المباني', icon: <Star className="h-6 w-6" />, category: 'discovery' },
  { id: '18', title: 'كيف نحمي كوكبنا؟', description: 'دروس في الحفاظ على البيئة وإعادة التدوير', icon: <Cloud className="h-6 w-6" />, category: 'discovery' },
];

const CATEGORIES: { id: ValueCategory; label: string }[] = [
  { id: 'all', label: 'الكل' },
  { id: 'quran', label: 'القرآن الكريم' },
  { id: 'prophets', label: 'قصص الأنبياء' },
  { id: 'manners', label: 'أخلاق وآداب' },
  { id: 'songs', label: 'أناشيد إيمانية' },
  { id: 'discovery', label: 'عالم الاستكشاف' },
];

export default function ValuesView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [activeCategory, setActiveCategory] = useState<ValueCategory>(() => {
    const cat = searchParams.get('cat');
    const valid = ['quran', 'manners', 'prophets', 'songs', 'discovery'];
    return (valid.includes(cat || '') ? cat : 'all') as ValueCategory;
  });

  useEffect(() => {
    const activeChildStr = localStorage.getItem('active_child');
    if (!activeChildStr) {
      navigate('/');
      return;
    }
    setProfile(JSON.parse(activeChildStr));
  }, [navigate]);

  const counts = useMemo(() => {
    const c: Partial<Record<ValueCategory, number>> = { all: VALUES.length };
    VALUES.forEach((v) => {
      c[v.category] = (c[v.category] || 0) + 1;
    });
    return c;
  }, []);

  const filteredValues = useMemo(
    () => VALUES.filter((v) => activeCategory === 'all' || v.category === activeCategory),
    [activeCategory]
  );

  const getCategoryLink = (category: string) => {
    switch (category) {
      case 'quran': return '/cinema?cat=quran_full';
      case 'prophets': return '/cinema?cat=prophets_stories';
      case 'manners': return '/cinema?cat=sunnah';
      case 'songs': return '/cinema?cat=nasheeds';
      case 'discovery': return '/cinema?cat=educational';
      default: return '/cinema';
    }
  };

  const isDiscovery = activeCategory === 'discovery';

  return (
    <div
      className="min-h-screen bg-[#fdfaf6] font-arabic"
      dir="rtl"
      style={{
        backgroundImage:
          'radial-gradient(circle at 0% 0%, rgba(167,243,208,0.4), transparent 50%), radial-gradient(circle at 100% 0%, rgba(186,230,253,0.35), transparent 45%)',
      }}
    >
      {/* Top bar */}
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
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-md shadow-emerald-200">
              {isDiscovery ? <Sun className="h-5 w-5 text-white" /> : <Moon className="h-5 w-5 text-white" />}
            </div>
            <div className="hidden sm:block">
              <p className="text-[11px] leading-none text-stone-400 font-bold">
                {isDiscovery ? 'ركن الاكتشاف' : 'واحة القيم'}
              </p>
              <p className="text-sm font-extrabold leading-tight text-stone-800">
                {isDiscovery ? 'استكشفي الكون' : 'القيم والإيمان'}
              </p>
            </div>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2 bg-amber-50 ring-1 ring-amber-200 px-3 py-1.5 rounded-full">
            <Star className="h-4 w-4 text-amber-500 fill-current" />
            <span className="font-extrabold text-amber-700 text-sm">{profile?.points || 0}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        {/* Category chips */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2 no-scrollbar">
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

        {/* Values grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredValues.map((item, i) => {
            const accent = CATEGORY_ACCENT[item.category];
            const soft = CATEGORY_SOFT[item.category];
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                whileHover={{ y: -4 }}
                className="bg-white rounded-2xl ring-1 ring-stone-200 hover:ring-stone-300 hover:shadow-lg shadow-stone-100 transition-all overflow-hidden flex flex-col"
              >
                <div className={`h-1.5 w-full ${accent}`} />
                <div className="p-5 flex flex-col gap-4 flex-1">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center ring-1 ${soft}`}>
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-stone-800 mb-1">{item.title}</h3>
                    <p className="text-stone-500 text-sm leading-relaxed">{item.description}</p>
                  </div>
                  <div className="mt-auto pt-3 flex items-center justify-between">
                    <button
                      onClick={() => navigate(getCategoryLink(item.category))}
                      className={`${accent} hover:brightness-110 text-white font-extrabold text-sm py-2 px-4 rounded-xl shadow-sm transition-all flex items-center gap-1.5`}
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      ابدأي الرحلة
                    </button>
                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 ring-1 ring-amber-200 text-xs font-extrabold px-2.5 py-1 rounded-full">
                      <Star className="h-3 w-3 fill-current" />
                      +25
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Daily virtue widget */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-8 text-white shadow-lg shadow-emerald-200"
        >
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-12 -right-8 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
          <div className="relative z-10 text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur px-3 py-1 rounded-full text-xs font-bold mb-4">
              <Sparkles className="h-3.5 w-3.5" />
              خلق اليوم
            </div>
            <p className="text-2xl sm:text-3xl font-extrabold mb-3 leading-snug">
              "تبسمكِ في وجه أختكِ صدقة"
            </p>
            <p className="text-emerald-50 text-sm sm:text-base font-bold mb-6">
              انشري الابتسامة اليوم يا بطلة واحصلي على مكافأة سحرية!
            </p>
            <button
              onClick={() =>
                toast.success('أحسنتِ! حصلتِ على 50 نقطة سحرية لابتسامتك الجميلة! 😊', {
                  icon: '🌟',
                  style: { background: '#10b981', color: 'white', border: 'none' },
                })
              }
              className="bg-white text-emerald-600 font-extrabold py-3 px-8 rounded-2xl shadow-xl hover:scale-105 transition-transform"
            >
              تم تنفيذ الخلق ✓
            </button>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
