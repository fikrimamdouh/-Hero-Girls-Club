import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Play, Film, Tv, Music, BookOpen, ArrowRight,
  Search, X, Heart, Star, Sparkles, Clock, GraduationCap,
} from 'lucide-react';
import { ChildProfile } from '../types';
import { VIDEOS, Video } from '../data/videoData';

const YOUTUBE_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

type CatId = 'all' | Video['category'] | 'recent' | 'favorites';

interface CategoryDef {
  id: CatId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  accent: string; // bg color when active
  text: string;   // text color when active (defaults handled below)
}

const CATEGORIES: CategoryDef[] = [
  { id: 'all',              label: 'الكل',              icon: Tv,            accent: 'bg-stone-800',     text: 'text-white' },
  { id: 'favorites',        label: 'المفضلة',           icon: Heart,         accent: 'bg-pink-500',      text: 'text-white' },
  { id: 'recent',           label: 'شوهد مؤخراً',       icon: Clock,         accent: 'bg-rose-500',      text: 'text-white' },
  { id: 'quran_full',       label: 'القرآن الكريم',     icon: BookOpen,      accent: 'bg-emerald-600',   text: 'text-white' },
  { id: 'interpretation',   label: 'تفسير',             icon: Search,        accent: 'bg-fuchsia-500',   text: 'text-white' },
  { id: 'sunnah',           label: 'السنة النبوية',     icon: Heart,         accent: 'bg-pink-600',      text: 'text-white' },
  { id: 'prophets_stories', label: 'قصص الأنبياء',      icon: Star,          accent: 'bg-amber-500',     text: 'text-white' },
  { id: 'educational',      label: 'فيديوهات تعليمية',  icon: GraduationCap, accent: 'bg-rose-500',      text: 'text-white' },
  { id: 'nasheeds',         label: 'أناشيد',            icon: Music,         accent: 'bg-sky-500',       text: 'text-white' },
  { id: 'stories',          label: 'قصص أطفال',         icon: BookOpen,      accent: 'bg-orange-500',    text: 'text-white' },
];

const CATEGORY_LABELS: Partial<Record<Video['category'], string>> = {
  quran_full:       '📖 القرآن',
  interpretation:   '🔍 تفسير',
  sunnah:           '❤️ سنة',
  prophets_stories: '🌟 قصص الأنبياء',
  nasheeds:         '🎵 أناشيد',
  stories:          '📚 حكايات',
  educational:      '🎓 تعليمي',
};

export default function CinemaView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [activeCategory, setActiveCategory] = useState<CatId>('all');
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    const activeChildStr = localStorage.getItem('active_child');
    if (!activeChildStr) { navigate('/'); return; }
    const child = JSON.parse(activeChildStr);
    setProfile(child);
    const favs = localStorage.getItem(`fav_videos_${child.uid}`);
    if (favs) setFavorites(JSON.parse(favs));
    const recents = localStorage.getItem(`recent_videos_${child.uid}`);
    if (recents) setRecent(JSON.parse(recents));
    const cat = searchParams.get('cat');
    if (cat && CATEGORIES.some(c => c.id === cat)) setActiveCategory(cat as CatId);
    const sub = searchParams.get('sub');
    setActiveSubcategory(sub || null);
  }, [navigate, searchParams]);

  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const newFavs = favorites.includes(id) ? favorites.filter(f => f !== id) : [id, ...favorites];
    setFavorites(newFavs);
    if (profile) localStorage.setItem(`fav_videos_${profile.uid}`, JSON.stringify(newFavs));
  };

  const addToRecent = (id: string) => {
    const newRecent = [id, ...recent.filter(r => r !== id)].slice(0, 10);
    setRecent(newRecent);
    if (profile) localStorage.setItem(`recent_videos_${profile.uid}`, JSON.stringify(newRecent));
  };

  const filteredVideos = VIDEOS.filter(v => {
    if (activeCategory === 'favorites') return favorites.includes(v.id);
    if (activeCategory === 'recent') return recent.includes(v.id);
    const matchesCategory = activeCategory === 'all' || v.category === activeCategory;
    const matchesSubcategory = !activeSubcategory || v.subcategory === activeSubcategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch = v.title.toLowerCase().includes(q) || v.description?.toLowerCase().includes(q);
    return matchesCategory && matchesSubcategory && matchesSearch;
  });

  const displayVideos = activeCategory === 'recent'
    ? [...filteredVideos].sort((a, b) => recent.indexOf(a.id) - recent.indexOf(b.id))
    : filteredVideos;

  const fallbackThumb =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#fde68a"/><stop offset="1" stop-color="#fbcfe8"/></linearGradient></defs><rect width="1280" height="720" fill="url(#g)"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9f1239" font-size="42" font-family="Arial">نادي البطلات الصغيرات • فيديو</text></svg>`);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = fallbackThumb;
  };

  const getVideoEmbedSrc = (video: Video) => {
    const id = video.youtubeId?.trim();
    if (!id || !YOUTUBE_ID_PATTERN.test(id)) return null;
    return `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`;
  };

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: VIDEOS.length, favorites: favorites.length, recent: recent.length };
    VIDEOS.forEach(v => { c[v.category] = (c[v.category] || 0) + 1; });
    return c;
  }, [favorites, recent]);

  const featuredVideo: Video = useMemo(() => {
    if (activeCategory === 'favorites') return VIDEOS.find(v => favorites.includes(v.id)) || VIDEOS[0];
    if (activeCategory === 'recent')    return [...VIDEOS].find(v => recent.includes(v.id)) || VIDEOS[0];
    if (activeCategory === 'all')       return VIDEOS.find(v => v.id === 'ps1') || VIDEOS[0];
    return VIDEOS.find(v => v.category === activeCategory) || VIDEOS[0];
  }, [activeCategory, favorites, recent]);

  const featuredMeta = useMemo(() => {
    const map: Record<string, { badge: string; title: string; description: string; gradient: string }> = {
      quran_full:       { badge: '📖 رحلة قرآنية',      title: 'القرآن الكريم للأطفال',     description: 'تلاوات مرتلة وتعليمية تساعد طفلتك على تحسين القراءة وتثبيت الحفظ.', gradient: 'from-emerald-600 to-teal-600' },
      interpretation:   { badge: '🔎 معاني جميلة',     title: 'تفسير مبسط للأطفال',         description: 'شرح معاني الآيات بلغة قريبة للطفل مع أمثلة من الحياة اليومية.',  gradient: 'from-fuchsia-600 to-pink-600' },
      sunnah:           { badge: '❤️ سنة نبوية',        title: 'تعلم السنة النبوية',         description: 'دروس عملية في الآداب والأذكار والعبادات بطريقة سهلة ومحببة.', gradient: 'from-pink-600 to-rose-600' },
      nasheeds:         { badge: '🎵 أناشيد لطيفة',     title: 'أناشيد تربوية ممتعة',         description: 'أناشيد هادفة تعزز القيم والسلوك الإيجابي بأسلوب مرح.',           gradient: 'from-sky-500 to-indigo-600' },
      stories:          { badge: '📚 حكايات ممتعة',     title: 'قصص أطفال تربوية',           description: 'قصص قصيرة تحمل معاني جميلة مثل الصدق والأمانة والتعاون.',       gradient: 'from-orange-500 to-amber-600' },
      educational:      { badge: '🎓 تعلم واكتشاف',     title: 'فيديوهات تعليمية',           description: 'محتوى تعليمي بصري يساعد على الفهم ويحفّز حب التعلم.',           gradient: 'from-rose-500 to-red-600' },
      favorites:        { badge: '💖 المفضلة لديكِ',    title: 'فيديوهاتك المفضلة',          description: 'هنا كل الفيديوهات التي أعجبتك لسهولة الرجوع إليها سريعاً.',     gradient: 'from-pink-500 to-rose-600' },
      recent:           { badge: '🕒 مشاهدة حديثة',     title: 'شوهد مؤخراً',                description: 'تابعي من حيث توقفتِ مع آخر الفيديوهات التي تم فتحها.',          gradient: 'from-rose-500 to-fuchsia-600' },
    };
    return map[activeCategory] || {
      badge: '✨ مختارة لكِ',
      title: 'قصص الأنبياء للأطفال',
      description: 'تعرفي على قصص الأنبياء عليهم السلام بأسلوب ممتع وشيق يعلمنا القيم والأخلاق الجميلة.',
      gradient: 'from-amber-500 to-rose-600',
    };
  }, [activeCategory]);

  return (
    <div className="min-h-screen bg-[#fdfaf6] font-arabic" dir="rtl"
      style={{ backgroundImage: 'radial-gradient(circle at 0% 0%, rgba(254,215,170,0.35), transparent 50%), radial-gradient(circle at 100% 0%, rgba(251,207,232,0.30), transparent 45%)' }}>

      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-stone-200/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center gap-3">
          <button
            onClick={() => navigate('/child')}
            className="h-10 w-10 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center shrink-0"
            aria-label="العودة"
          ><ArrowRight className="h-4 w-4" /></button>
          <div className="flex items-center gap-2 shrink-0">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-rose-500 to-fuchsia-600 flex items-center justify-center shadow-md shadow-rose-200">
              <Film className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-[11px] leading-none text-stone-400 font-bold">قاعة السينما</p>
              <p className="text-sm font-extrabold leading-tight text-stone-800">المكتبة الدينية والتعليمية</p>
            </div>
          </div>
          <div className="flex-1 max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 h-4 w-4" />
              <input
                type="text"
                placeholder="ابحثي عن فيديو..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
            <Film className="h-3.5 w-3.5" />
            <span className="text-xs font-extrabold">{VIDEOS.length}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 pb-20 space-y-6">
        {/* Featured */}
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => { setSelectedVideo(featuredVideo); addToRecent(featuredVideo.id); }}
          className="group relative w-full overflow-hidden rounded-3xl shadow-[0_4px_30px_rgba(244,63,94,0.15)] ring-1 ring-stone-100 text-right"
        >
          <div className="relative h-56 sm:h-72 md:h-96">
            <img
              src={featuredVideo.thumbnail}
              alt={featuredVideo.title}
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
              referrerPolicy="no-referrer"
              onError={handleImageError}
            />
            <div className={`absolute inset-0 bg-gradient-to-t ${featuredMeta.gradient} opacity-80 mix-blend-multiply`} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="relative h-full flex flex-col justify-end p-6 sm:p-8 md:p-10 text-white">
              <span className="self-start inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-md ring-1 ring-white/30 px-3 py-1 text-[11px] font-extrabold mb-3">
                {featuredMeta.badge}
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-5xl font-black mb-2 drop-shadow-md tracking-tight">{featuredMeta.title}</h2>
              <p className="text-white/90 font-bold text-sm sm:text-base max-w-2xl mb-4 hidden sm:block">{featuredMeta.description}</p>
              <div>
                <span className="inline-flex items-center gap-2 rounded-2xl bg-white text-stone-900 px-6 py-3 font-extrabold shadow-lg group-hover:scale-105 transition-transform">
                  <Play className="w-5 h-5 fill-current" /> شاهدي الآن
                </span>
              </div>
            </div>
          </div>
        </motion.button>

        {/* Library callout */}
        <div className="rounded-2xl bg-white ring-1 ring-stone-100 shadow-sm px-5 py-3 flex flex-wrap items-center gap-3 text-sm">
          <Sparkles className="h-4 w-4 text-amber-500" />
          <span className="font-extrabold text-stone-800">مكتبة متوازنة:</span>
          <span className="font-bold text-stone-500">
            {(counts.quran_full || 0) + (counts.interpretation || 0) + (counts.sunnah || 0) + (counts.prophets_stories || 0)} ديني
            · {counts.educational || 0} تعليمي
            · {counts.nasheeds || 0} أناشيد
            · {counts.stories || 0} حكايات
          </span>
        </div>

        {/* Category chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto -mx-1 px-1 pb-1" style={{ scrollbarWidth: 'none' }}>
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            const active = activeCategory === cat.id;
            const count = counts[cat.id] ?? 0;
            return (
              <button
                key={cat.id}
                onClick={() => { setActiveCategory(cat.id); setActiveSubcategory(null); }}
                className={`shrink-0 inline-flex items-center gap-1.5 rounded-2xl px-3.5 py-2 text-sm font-extrabold ring-1 transition-all ${
                  active ? `${cat.accent} ${cat.text} ring-transparent shadow-md shadow-stone-200`
                         : 'bg-white text-stone-600 ring-stone-200 hover:bg-stone-50'
                }`}
              >
                <Icon className="h-4 w-4" />
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
              {CATEGORIES.find(c => c.id === activeCategory)?.label || 'الفيديوهات'}
            </h2>
            <span className="text-xs text-stone-400 font-bold">{displayVideos.length} نتيجة</span>
          </div>

          {displayVideos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              <AnimatePresence mode="popLayout">
                {displayVideos.map((video) => (
                  <motion.div
                    key={video.id}
                    layout
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ y: -4 }}
                    className="bg-white rounded-2xl overflow-hidden ring-1 ring-stone-100 hover:ring-stone-200 hover:shadow-lg hover:shadow-stone-200/60 transition-all group cursor-pointer"
                    onClick={() => { setSelectedVideo(video); addToRecent(video.id); }}
                  >
                    <div className="relative aspect-video bg-stone-50">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                        onError={handleImageError}
                      />
                      <div className="absolute inset-0 bg-black/15 group-hover:bg-black/0 transition flex items-center justify-center">
                        <div className="w-14 h-14 bg-rose-600 rounded-full flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-transform">
                          <Play className="w-6 h-6 fill-current mr-0.5" />
                        </div>
                      </div>
                      <div className="absolute bottom-2 left-2 bg-black/70 backdrop-blur-md text-white px-2 py-0.5 rounded-md text-[11px] font-extrabold">
                        {video.duration}
                      </div>
                      <button
                        onClick={(e) => toggleFavorite(video.id, e)}
                        className={`absolute top-2 left-2 h-8 w-8 rounded-full backdrop-blur-md flex items-center justify-center transition-all ${
                          favorites.includes(video.id) ? 'bg-pink-500 text-white shadow-md' : 'bg-white/85 text-stone-500 hover:bg-pink-500 hover:text-white'
                        }`}
                        aria-label="مفضلة"
                      >
                        <Heart className={`w-4 h-4 ${favorites.includes(video.id) ? 'fill-current' : ''}`} />
                      </button>
                      {video.subcategory && (
                        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md text-stone-700 px-2 py-0.5 rounded-md text-[10px] font-extrabold ring-1 ring-stone-200">
                          {video.subcategory}
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-sm sm:text-base font-extrabold text-stone-800 mb-1 group-hover:text-rose-600 transition-colors line-clamp-2">{video.title}</h3>
                      {video.description && (
                        <p className="text-stone-500 text-xs font-bold mb-3 line-clamp-2">{video.description}</p>
                      )}
                      <span className="inline-flex items-center text-[11px] font-extrabold text-stone-500 bg-stone-100 px-2 py-1 rounded-md">
                        {CATEGORY_LABELS[video.category]}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="h-16 w-16 mx-auto rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-4">
                <Search className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-black text-stone-800 mb-1">لم نجد أي فيديوهات</h3>
              <p className="text-sm text-stone-500 font-bold mb-5">جرّبي تصنيفاً آخر أو كلمة بحث مختلفة</p>
              <button
                onClick={() => { setSearchQuery(''); setActiveCategory('all'); setActiveSubcategory(null); }}
                className="rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold px-6 py-2.5 shadow-md shadow-rose-200"
              >عرض كل الفيديوهات</button>
            </div>
          )}
        </section>
      </main>

      {/* Player Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md"
            onClick={() => setSelectedVideo(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-5xl bg-white rounded-3xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-5 py-4 flex justify-between items-center border-b border-stone-100">
                <h2 className="text-base sm:text-lg font-black text-stone-800 line-clamp-1">{selectedVideo.title}</h2>
                <button onClick={() => setSelectedVideo(null)} className="p-2 hover:bg-stone-100 rounded-full text-stone-500" aria-label="إغلاق">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="aspect-video bg-black">
                {(() => {
                  const embedSrc = getVideoEmbedSrc(selectedVideo);
                  if (!embedSrc) {
                    return (
                      <div className="w-full h-full flex items-center justify-center p-6 text-center bg-stone-900 text-white">
                        <div>
                          <p className="font-black text-lg text-rose-300 mb-2">تعذر تشغيل هذا الفيديو</p>
                          <p className="text-sm text-stone-300 font-bold">مصدر الفيديو غير صالح حالياً. اختاري فيديو آخر من القائمة.</p>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <iframe
                      width="100%" height="100%" src={embedSrc} title={selectedVideo.title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  );
                })()}
              </div>
              <div className="px-5 py-4 bg-stone-50 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-rose-400 to-pink-500 rounded-xl flex items-center justify-center text-white text-lg shadow-md">✨</div>
                <div>
                  <p className="font-extrabold text-stone-800 text-sm">مشاهدة ممتعة يا بطلة!</p>
                  <p className="text-xs text-stone-500 font-bold">تذكري دائماً أن تأخذي استراحة بعد المشاهدة 💖</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
