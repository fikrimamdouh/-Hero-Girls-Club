import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
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
  CheckCircle2,
  Trophy,
  Sun,
  Cloud
} from 'lucide-react';
import { ChildProfile } from '../types';

interface ValueItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  category: 'quran' | 'manners' | 'prophets' | 'songs' | 'discovery';
}

const VALUES: ValueItem[] = [
  { id: '1', title: 'تحفيظ سورة الفاتحة', description: 'تعلمي قراءة أم الكتاب بصوت جميل', icon: <Book className="w-8 h-8" />, color: 'bg-emerald-100 text-emerald-600', category: 'quran' },
  { id: '2', title: 'قصة النبي يوسف عليه السلام', description: 'دروس في الصبر والجمال والأمانة', icon: <Star className="w-8 h-8" />, color: 'bg-amber-100 text-amber-600', category: 'prophets' },
  { id: '3', title: 'آداب الطعام والشراب', description: 'كيف نأكل ونشرب مثل الأميرات المهذبات', icon: <Heart className="w-8 h-8" />, color: 'bg-pink-100 text-pink-600', category: 'manners' },
  { id: '4', title: 'أنشودة "يا طيبة"', description: 'أنشودة جميلة في حب المدينة المنورة', icon: <Music className="w-8 h-8" />, color: 'bg-indigo-100 text-indigo-600', category: 'songs' },
  { id: '5', title: 'الصدق منجاة', description: 'لماذا يحب الله الصادقين؟', icon: <Sparkles className="w-8 h-8" />, color: 'bg-sky-100 text-sky-600', category: 'manners' },
  { id: '6', title: 'قصة نوح عليه السلام والسفينة', description: 'مغامرة إيمانية عظيمة', icon: <Cloud className="w-8 h-8" />, color: 'bg-blue-100 text-blue-600', category: 'prophets' },
  { id: '7', title: 'سورة الإخلاص والمعوذات', description: 'حصن المسلم الصغير', icon: <Book className="w-8 h-8" />, color: 'bg-emerald-100 text-emerald-600', category: 'quran' },
  { id: '8', title: 'آداب السلام والتحية', description: 'إفشاء السلام بين الناس', icon: <Heart className="w-8 h-8" />, color: 'bg-pink-100 text-pink-600', category: 'manners' },
  { id: '9', title: 'قصة النبي يونس والحوت', description: 'دروس في الدعاء والاستغفار', icon: <Star className="w-8 h-8" />, color: 'bg-amber-100 text-amber-600', category: 'prophets' },
  { id: '10', title: 'أنشودة "طلع البدر علينا"', description: 'استقبال النبي في المدينة', icon: <Music className="w-8 h-8" />, color: 'bg-indigo-100 text-indigo-600', category: 'songs' },
  { id: '11', title: 'النظافة من الإيمان', description: 'كيف نحافظ على نظافتنا وجمالنا', icon: <Sparkles className="w-8 h-8" />, color: 'bg-sky-100 text-sky-600', category: 'manners' },
  { id: '12', title: 'قصة النبي إبراهيم عليه السلام', description: 'البحث عن الحقيقة وبناء الكعبة', icon: <Star className="w-8 h-8" />, color: 'bg-amber-100 text-amber-600', category: 'prophets' },
  { id: '13', title: 'عالم الفضاء الواسع', description: 'رحلة بين النجوم والكواكب البعيدة', icon: <Cloud className="w-8 h-8" />, color: 'bg-indigo-100 text-indigo-600', category: 'discovery' },
  { id: '14', title: 'أسرار المحيطات', description: 'ماذا يوجد في أعماق البحار الزرقاء؟', icon: <Sparkles className="w-8 h-8" />, color: 'bg-blue-100 text-blue-600', category: 'discovery' },
  { id: '15', title: 'مملكة الحيوان', description: 'تعرفي على أصدقائنا من الحيوانات اللطيفة', icon: <Heart className="w-8 h-8" />, color: 'bg-orange-100 text-orange-600', category: 'discovery' },
  { id: '16', title: 'جسم الإنسان المذهل', description: 'كيف تعمل حواسنا الخمس؟', icon: <Sparkles className="w-8 h-8" />, color: 'bg-red-100 text-red-600', category: 'discovery' },
  { id: '17', title: 'عجائب الدنيا السبع', description: 'رحلة حول العالم لاكتشاف أجمل المباني', icon: <Star className="w-8 h-8" />, color: 'bg-yellow-100 text-yellow-600', category: 'discovery' },
  { id: '18', title: 'كيف نحمي كوكبنا؟', description: 'دروس في الحفاظ على البيئة وإعادة التدوير', icon: <Cloud className="w-8 h-8" />, color: 'bg-emerald-100 text-emerald-600', category: 'discovery' },
];

export default function ValuesView() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | ValueItem['category']>('all');

  useEffect(() => {
    const activeChildStr = localStorage.getItem('active_child');
    if (!activeChildStr) {
      navigate('/');
      return;
    }
    setProfile(JSON.parse(activeChildStr));
  }, [navigate]);

  const filteredValues = VALUES.filter(v => activeCategory === 'all' || v.category === activeCategory);

  const getCategoryLink = (category: string) => {
    switch(category) {
      case 'quran': return '/cinema?cat=quran_full';
      case 'prophets': return '/cinema?cat=prophets_stories';
      case 'manners': return '/cinema?cat=sunnah';
      case 'songs': return '/cinema?cat=nasheeds';
      case 'discovery': return '/cinema?cat=educational';
      default: return '/cinema';
    }
  };

  return (
    <div className="min-h-screen bg-emerald-50 font-sans" dir="rtl">
      {/* Header */}
      <header className="p-6 bg-white shadow-sm flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/child')}
            className="p-2 hover:bg-emerald-50 rounded-full transition-colors text-emerald-600"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-emerald-900 flex items-center gap-2">
              <Moon className="w-8 h-8 text-emerald-500" />
              واحة القيم والإيمان
            </h1>
            <p className="text-emerald-600 text-sm font-bold">نكبر بالقيم، ونرتقي بالأخلاق ✨</p>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        {/* Categories */}
        <div className="flex gap-3 mb-8 overflow-x-auto pb-2 no-scrollbar">
          <CategoryTab active={activeCategory === 'all'} onClick={() => setActiveCategory('all')} label="الكل" />
          <CategoryTab active={activeCategory === 'quran'} onClick={() => setActiveCategory('quran')} label="القرآن الكريم" />
          <CategoryTab active={activeCategory === 'prophets'} onClick={() => setActiveCategory('prophets')} label="قصص الأنبياء" />
          <CategoryTab active={activeCategory === 'manners'} onClick={() => setActiveCategory('manners')} label="أخلاق وآداب" />
          <CategoryTab active={activeCategory === 'songs'} onClick={() => setActiveCategory('songs')} label="أناشيد إيمانية" />
          <CategoryTab active={activeCategory === 'discovery'} onClick={() => setActiveCategory('discovery')} label="عالم الاستكشاف" />
        </div>

        {/* Values Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredValues.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.03, y: -5 }}
              className="bg-white rounded-[2.5rem] p-8 shadow-xl border-2 border-emerald-100 flex flex-col gap-6 relative overflow-hidden group transition-all"
            >
              <div className={`w-20 h-20 ${item.color} rounded-3xl flex items-center justify-center mb-2 shadow-inner group-hover:rotate-6 transition-transform`}>
                {item.icon}
              </div>
              <div>
                <h3 className="text-2xl font-black text-emerald-900 mb-3">{item.title}</h3>
                <p className="text-emerald-700 font-bold text-base leading-relaxed">{item.description}</p>
              </div>
              
              <div className="mt-auto pt-6 flex justify-between items-center">
                <button 
                  onClick={() => navigate(getCategoryLink(item.category))}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black py-3 px-8 rounded-2xl transition-all flex items-center gap-2 shadow-lg shadow-emerald-200"
                >
                  <Play className="w-5 h-5 fill-current" />
                  ابدأ الرحلة
                </button>
                <div className="flex flex-col items-center">
                  <div className="flex items-center gap-1 text-amber-500 font-black text-lg">
                    <Star className="w-5 h-5 fill-current" />
                    +25
                  </div>
                  <span className="text-[10px] text-emerald-400 font-bold uppercase">نقطة سحرية</span>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-emerald-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700" />
              <div className="absolute top-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Daily Hadith/Value Widget */}
        <div className="mt-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-10 left-10 text-6xl">✨</div>
            <div className="absolute bottom-10 right-10 text-6xl">🌙</div>
          </div>
          <div className="relative z-10 text-center">
            <h3 className="text-2xl font-black mb-4 flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-yellow-300" />
              خلق اليوم
            </h3>
            <p className="text-3xl font-black mb-6 leading-tight">"تبسمك في وجه أخيك صدقة"</p>
            <p className="text-emerald-100 font-bold mb-8">انشري الابتسامة اليوم يا بطلة واحصلي على مكافأة سحرية!</p>
            <button 
              onClick={() => toast.success('أحسنتِ! لقد حصلتِ على 50 نقطة سحرية لابتسامتك الجميلة! 😊', {
                icon: '🌟',
                style: { background: '#10b981', color: 'white', border: 'none' }
              })}
              className="bg-white text-emerald-600 font-black py-3 px-10 rounded-2xl shadow-lg hover:scale-105 transition-all"
            >
              تم تنفيذ الخلق! ✅
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function CategoryTab({ active, onClick, label }: { active: boolean, onClick: () => void, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 rounded-2xl font-black transition-all whitespace-nowrap ${
        active 
          ? 'bg-emerald-500 text-white shadow-lg' 
          : 'bg-white text-emerald-600 hover:bg-emerald-100 border-2 border-emerald-100'
      }`}
    >
      {label}
    </button>
  );
}
