import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { KIDS_VIDEOS, VIDEO_CATEGORIES, VideoCategory, KidsVideo } from '../data/kidsVideosData';
import { Search, ArrowRight, Play, X, Tv2, Sparkles } from 'lucide-react';

const CATEGORY_ACCENT: Record<VideoCategory, string> = {
  all:     'bg-rose-500',
  songs:   'bg-pink-500',
  letters: 'bg-sky-500',
  stories: 'bg-amber-500',
  fun:     'bg-orange-500',
  islamic: 'bg-emerald-500',
};

export default function KidsVideosPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<VideoCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [playing, setPlaying] = useState<KidsVideo | null>(null);

  const filtered = useMemo(() => KIDS_VIDEOS.filter(v => {
    const m1 = activeCategory === 'all' || v.category === activeCategory;
    const m2 = v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
              v.channel.toLowerCase().includes(searchQuery.toLowerCase());
    return m1 && m2;
  }), [activeCategory, searchQuery]);

  const counts = useMemo(() => {
    const c: Partial<Record<VideoCategory, number>> = { all: KIDS_VIDEOS.length };
    KIDS_VIDEOS.forEach(v => { c[v.category] = (c[v.category] || 0) + 1; });
    return c;
  }, []);

  const featured = useMemo(() => KIDS_VIDEOS.filter(v => v.featured).slice(0, 3), []);

  return (
    <div className="min-h-screen bg-[#fdfaf6] font-arabic" dir="rtl"
      style={{ backgroundImage: 'radial-gradient(circle at 0% 0%, rgba(251,207,232,0.4), transparent 50%), radial-gradient(circle at 100% 0%, rgba(254,205,211,0.30), transparent 45%)' }}>

      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-stone-200/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center gap-3">
          <button
            onClick={() => navigate('/child')}
            className="h-10 w-10 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center shrink-0"
            aria-label="العودة"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2 shrink-0">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-md shadow-rose-200">
              <Tv2 className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-[11px] leading-none text-stone-400 font-bold">سينما البطلات</p>
              <p className="text-sm font-extrabold leading-tight text-stone-800">قنوات الأطفال العربية</p>
            </div>
          </div>
          <div className="flex-1 max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 h-4 w-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحثي عن فيديو أو قناة..."
                className="w-full bg-stone-100/80 focus:bg-white pr-9 pl-9 py-2.5 rounded-full text-sm font-bold text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-300 transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute left-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full hover:bg-stone-200 text-stone-400 flex items-center justify-center" aria-label="مسح">
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-rose-50 text-rose-700 ring-1 ring-rose-200 px-3 py-1.5">
            <Play className="h-3.5 w-3.5 fill-current" />
            <span className="text-xs font-extrabold">{KIDS_VIDEOS.length}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 pb-20 space-y-6">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-white shadow-[0_4px_30px_rgba(244,114,182,0.10)] ring-1 ring-stone-100">
          <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-gradient-to-br from-pink-200/60 to-rose-300/40 blur-3xl pointer-events-none" />
          <div className="relative grid grid-cols-1 lg:grid-cols-[1fr,auto] gap-6 p-6 sm:p-8">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 text-rose-600 px-3 py-1 text-[11px] font-extrabold mb-3">
                <Sparkles className="h-3 w-3" /> {KIDS_VIDEOS.length} فيديو من قنوات رسمية
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-stone-900 mb-2 tracking-tight">
                سينما <span className="bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">البطلات</span>
              </h1>
              <p className="text-sm sm:text-base text-stone-500 font-bold max-w-md">
                فيديوهات تعليمية وممتعة بالعربية من طيور الجنة وكراميش وقنوات الأطفال المختارة بعناية ✨
              </p>
            </div>
            <aside className="lg:w-72 grid grid-cols-3 gap-2 self-center">
              {featured.map(v => (
                <button
                  key={v.id}
                  onClick={() => setPlaying(v)}
                  className="group relative aspect-video rounded-2xl overflow-hidden ring-1 ring-stone-200 hover:ring-rose-300 hover:shadow-md transition-all bg-stone-50"
                >
                  <img src={v.thumb} alt={v.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition flex items-center justify-center">
                    <div className="w-7 h-7 bg-rose-600 rounded-full flex items-center justify-center shadow-lg">
                      <Play className="w-3.5 h-3.5 text-white fill-white" />
                    </div>
                  </div>
                </button>
              ))}
            </aside>
          </div>
        </section>

        {/* Category chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto -mx-1 px-1 pb-1" style={{ scrollbarWidth: 'none' }}>
          {VIDEO_CATEGORIES.map(cat => {
            const active = activeCategory === cat.id;
            const count = counts[cat.id] || 0;
            if (cat.id !== 'all' && count === 0) return null;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`shrink-0 inline-flex items-center gap-1.5 rounded-2xl px-3.5 py-2 text-sm font-extrabold ring-1 transition-all ${
                  active
                    ? `${CATEGORY_ACCENT[cat.id]} text-white ring-transparent shadow-md shadow-stone-200`
                    : 'bg-white text-stone-600 ring-stone-200 hover:bg-stone-50'
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
                <span className={`text-[10px] font-extrabold rounded-full px-1.5 ${active ? 'bg-white/25' : 'bg-stone-100 text-stone-500'}`}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Grid */}
        <section>
          <div className="flex items-end justify-between mb-3">
            <h2 className="text-lg font-black text-stone-800">
              {activeCategory === 'all' ? 'كل الفيديوهات' : VIDEO_CATEGORIES.find(c => c.id === activeCategory)?.label}
            </h2>
            <span className="text-xs text-stone-400 font-bold">{filtered.length} نتيجة</span>
          </div>

          <AnimatePresence mode="popLayout">
            {filtered.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {filtered.map((video, idx) => (
                  <motion.button
                    key={video.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: Math.min(idx * 0.02, 0.25), duration: 0.18 }}
                    whileHover={{ y: -4 }}
                    onClick={() => setPlaying(video)}
                    className="group relative bg-white rounded-2xl overflow-hidden ring-1 ring-stone-100 hover:ring-stone-200 hover:shadow-lg hover:shadow-stone-200/60 transition-all text-right"
                  >
                    <span className={`absolute top-0 right-0 left-0 h-1 ${CATEGORY_ACCENT[video.category]} z-10`} />
                    <div className="relative aspect-video bg-stone-50 overflow-hidden">
                      <img
                        src={video.thumb}
                        alt={video.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => { (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`; }}
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/5 transition flex items-center justify-center">
                        <div className="w-12 h-12 bg-rose-600 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-110 transition">
                          <Play className="w-5 h-5 text-white fill-white mr-0.5" />
                        </div>
                      </div>
                      {video.featured && (
                        <span className="absolute top-2 right-2 inline-flex items-center gap-1 rounded-full bg-amber-400 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 shadow-md">
                          <Sparkles className="h-2.5 w-2.5" /> مميز
                        </span>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="font-extrabold text-stone-800 text-sm line-clamp-2 mb-1 group-hover:text-rose-600 transition">
                        {video.title}
                      </h3>
                      <p className="text-xs text-stone-500 font-bold">📺 {video.channel}</p>
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="h-16 w-16 mx-auto rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-4">
                  <Search className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-black text-stone-800 mb-1">لا توجد فيديوهات بهذا البحث</h3>
                <p className="text-sm text-stone-500 font-bold mb-5">جرّبي كلمات بحث مختلفة</p>
                <button
                  onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                  className="rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold px-6 py-2.5 shadow-md shadow-rose-200"
                >عرض كل الفيديوهات</button>
              </div>
            )}
          </AnimatePresence>
        </section>

        <p className="text-center text-[11px] text-stone-400 font-bold pt-4">
          📺 {KIDS_VIDEOS.length} فيديو من قنوات رسمية · مختارة بعناية
        </p>
      </main>

      {/* Player */}
      <AnimatePresence>
        {playing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setPlaying(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-4xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setPlaying(null)}
                className="absolute -top-12 left-0 w-10 h-10 bg-white/15 hover:bg-white/25 rounded-full flex items-center justify-center text-white transition"
                aria-label="إغلاق"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="bg-white rounded-3xl overflow-hidden shadow-2xl">
                <div className="aspect-video bg-black">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${playing.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                    title={playing.title}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
                <div className="p-4">
                  <h2 className="font-black text-stone-800 text-lg">{playing.title}</h2>
                  <p className="text-sm text-stone-500 font-bold mt-1">📺 {playing.channel}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
