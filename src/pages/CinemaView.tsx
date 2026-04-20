import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Film, 
  Tv, 
  Music, 
  BookOpen, 
  ArrowRight, 
  Search, 
  X,
  Heart,
  Star,
  Sparkles,
  Clock
} from 'lucide-react';
import { ChildProfile } from '../types';
import { VIDEOS, Video } from '../data/videoData';

const YOUTUBE_ID_PATTERN = /^[a-zA-Z0-9_-]{11}$/;

export default function CinemaView() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [activeCategory, setActiveCategory] = useState<'all' | Video['category'] | 'recent' | 'favorites'>('all');
  const [activeSubcategory, setActiveSubcategory] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    const activeChildStr = localStorage.getItem('active_child');
    if (!activeChildStr) {
      navigate('/');
      return;
    }
    const child = JSON.parse(activeChildStr);
    setProfile(child);

    // Load favorites and recent
    const favs = localStorage.getItem(`fav_videos_${child.uid}`);
    if (favs) setFavorites(JSON.parse(favs));
    
    const recents = localStorage.getItem(`recent_videos_${child.uid}`);
    if (recents) setRecent(JSON.parse(recents));

    // Handle category from URL
    const cat = searchParams.get('cat');
    if (cat && ['all', 'quran_full', 'interpretation', 'sunnah', 'prophets_stories', 'nasheeds', 'stories', 'educational', 'recent', 'favorites'].includes(cat)) {
      setActiveCategory(cat as any);
    }

    const sub = searchParams.get('sub');
    if (sub) {
      setActiveSubcategory(sub);
    } else {
      setActiveSubcategory(null);
    }
  }, [navigate, searchParams]);

  const toggleFavorite = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const newFavs = favorites.includes(id) 
      ? favorites.filter(fid => fid !== id)
      : [id, ...favorites];
    setFavorites(newFavs);
    if (profile) localStorage.setItem(`fav_videos_${profile.uid}`, JSON.stringify(newFavs));
  };

  const addToRecent = (id: string) => {
    const newRecent = [id, ...recent.filter(rid => rid !== id)].slice(0, 10);
    setRecent(newRecent);
    if (profile) localStorage.setItem(`recent_videos_${profile.uid}`, JSON.stringify(newRecent));
  };

  const filteredVideos = VIDEOS.filter(v => {
    if (activeCategory === 'favorites') return favorites.includes(v.id);
    if (activeCategory === 'recent') return recent.includes(v.id);
    
    const matchesCategory = activeCategory === 'all' || v.category === activeCategory;
    const matchesSubcategory = !activeSubcategory || v.subcategory === activeSubcategory;
    const matchesSearch = v.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         v.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSubcategory && matchesSearch;
  });

  // Sort recent videos by their order in the recent array
  const displayVideos = activeCategory === 'recent' 
    ? [...filteredVideos].sort((a, b) => recent.indexOf(a.id) - recent.indexOf(b.id))
    : filteredVideos;

  const fallbackThumb =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#1e293b"/><stop offset="1" stop-color="#0f172a"/></linearGradient></defs><rect width="1280" height="720" fill="url(#g)"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#f8fafc" font-size="42" font-family="Arial">Hero Girls Club • Video</text></svg>`);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = fallbackThumb;
  };

  const getVideoEmbedSrc = (video: Video) => {
    const videoId = video.youtubeId?.trim();
    if (!videoId || !YOUTUBE_ID_PATTERN.test(videoId)) {
      return null;
    }
    return `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;
  };

  const religiousSeriesCount = VIDEOS.filter(v =>
    ['quran_full', 'interpretation', 'sunnah', 'prophets_stories'].includes(v.category)
  ).length;
  const educationalCount = VIDEOS.filter(v => v.category === 'educational').length;

  const headerPreviewVideos = (() => {
    if (activeCategory === 'favorites') {
      return VIDEOS.filter(v => favorites.includes(v.id)).slice(0, 4);
    }
    if (activeCategory === 'recent') {
      return [...VIDEOS]
        .filter(v => recent.includes(v.id))
        .sort((a, b) => recent.indexOf(a.id) - recent.indexOf(b.id))
        .slice(0, 4);
    }
    if (activeCategory === 'all') {
      return VIDEOS.slice(0, 4);
    }
    return VIDEOS.filter(v => v.category === activeCategory).slice(0, 4);
  })();

  const featuredVideo = (() => {
    if (activeCategory === 'favorites') {
      return VIDEOS.find(v => favorites.includes(v.id)) || VIDEOS[0];
    }
    if (activeCategory === 'recent') {
      return [...VIDEOS].find(v => recent.includes(v.id)) || VIDEOS[0];
    }
    if (activeCategory === 'all') {
      return VIDEOS.find(v => v.id === 'ps1') || VIDEOS[0];
    }
    return VIDEOS.find(v => v.category === activeCategory) || VIDEOS[0];
  })();

  const featuredMeta = (() => {
    if (activeCategory === 'quran_full') {
      return {
        badge: 'رحلة قرآنية 📖',
        title: 'القرآن الكريم للأطفال',
        description: 'تلاوات مرتلة وتعليمية تساعد طفلتك على تحسين القراءة وتثبيت الحفظ.',
        overlay: 'from-emerald-950 via-emerald-900/45 to-transparent',
        button: 'hover:bg-emerald-500 hover:text-white'
      };
    }
    if (activeCategory === 'interpretation') {
      return {
        badge: 'معاني جميلة 🔎',
        title: 'تفسير مبسط للأطفال',
        description: 'شرح معاني الآيات بلغة قريبة للطفل مع أمثلة من الحياة اليومية.',
        overlay: 'from-purple-950 via-purple-900/45 to-transparent',
        button: 'hover:bg-purple-500 hover:text-white'
      };
    }
    if (activeCategory === 'sunnah') {
      return {
        badge: 'سنة نبوية ❤️',
        title: 'تعلم السنة النبوية',
        description: 'دروس عملية في الآداب والأذكار والعبادات بطريقة سهلة ومحببة.',
        overlay: 'from-pink-950 via-pink-900/45 to-transparent',
        button: 'hover:bg-pink-500 hover:text-white'
      };
    }
    if (activeCategory === 'nasheeds') {
      return {
        badge: 'أناشيد لطيفة 🎵',
        title: 'أناشيد تربوية ممتعة',
        description: 'أناشيد هادفة تعزز القيم والسلوك الإيجابي بأسلوب مرح.',
        overlay: 'from-sky-950 via-sky-900/45 to-transparent',
        button: 'hover:bg-sky-500 hover:text-white'
      };
    }
    if (activeCategory === 'stories') {
      return {
        badge: 'حكايات ممتعة 📚',
        title: 'قصص أطفال تربوية',
        description: 'قصص قصيرة تحمل معاني جميلة مثل الصدق والأمانة والتعاون.',
        overlay: 'from-orange-950 via-orange-900/45 to-transparent',
        button: 'hover:bg-orange-500 hover:text-white'
      };
    }
    if (activeCategory === 'educational') {
      return {
        badge: 'تعلم واكتشاف 🎓',
        title: 'فيديوهات تعليمية',
        description: 'محتوى تعليمي بصري يساعد على الفهم ويحفّز حب التعلم.',
        overlay: 'from-rose-950 via-rose-900/45 to-transparent',
        button: 'hover:bg-rose-500 hover:text-white'
      };
    }
    if (activeCategory === 'favorites') {
      return {
        badge: 'المفضلة لديكِ 💖',
        title: 'فيديوهاتك المفضلة',
        description: 'هنا كل الفيديوهات التي أعجبتك لسهولة الرجوع إليها سريعًا.',
        overlay: 'from-pink-950 via-pink-900/45 to-transparent',
        button: 'hover:bg-pink-500 hover:text-white'
      };
    }
    if (activeCategory === 'recent') {
      return {
        badge: 'مشاهدة حديثة 🕒',
        title: 'شوهد مؤخرًا',
        description: 'تابعي من حيث توقفتِ مع آخر الفيديوهات التي تم فتحها.',
        overlay: 'from-indigo-950 via-indigo-900/45 to-transparent',
        button: 'hover:bg-indigo-500 hover:text-white'
      };
    }
    return {
      badge: 'عرض مميز ✨',
      title: 'قصص الأنبياء للأطفال',
      description: 'تعرفي على قصص الأنبياء عليهم السلام بأسلوب ممتع وشيق يعلمنا القيم والأخلاق الجميلة.',
      overlay: 'from-slate-900 via-slate-900/40 to-transparent',
      button: 'hover:bg-pink-500 hover:text-white'
    };
  })();

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans" dir="rtl">
      {/* Header */}
      <header className="p-6 flex justify-between items-center border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/child')}
            className="p-2 hover:bg-slate-800 rounded-full transition-colors"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-black flex items-center gap-2">
              <Film className="w-8 h-8 text-pink-500" />
              قاعة السينما السحرية
            </h1>
            <p className="text-slate-400 text-sm font-bold">شاهدي وتعلمي في عالمكِ الآمن ✨</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2">
            <div className="flex -space-x-4 rtl:space-x-reverse">
              {headerPreviewVideos.map((video) => (
                <img
                  key={`header-preview-${video.id}`}
                  src={video.thumbnail}
                  alt={video.title}
                  className="w-11 h-11 rounded-full border-2 border-slate-700 object-cover shadow-lg"
                  referrerPolicy="no-referrer"
                  onError={handleImageError}
                />
              ))}
            </div>
            <span className="text-xs font-black text-slate-300 bg-slate-800/80 border border-slate-700 px-3 py-1.5 rounded-full">
              صور الأقسام المفتوحة
            </span>
          </div>
          <div className="hidden md:flex items-center gap-3 bg-slate-800 p-2 px-4 rounded-full border border-slate-700">
            <Search className="w-5 h-5 text-slate-500" />
            <input 
              type="text" 
              placeholder="ابحثي عن فيديو..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none outline-none text-sm font-bold w-48"
            />
          </div>
        </div>
      </header>

      <main className="p-6 max-w-7xl mx-auto">
        {/* Featured Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 relative h-64 md:h-96 rounded-[3rem] overflow-hidden group cursor-pointer shadow-2xl"
          onClick={() => {
            setSelectedVideo(featuredVideo);
            addToRecent(featuredVideo.id);
          }}
        >
          <img 
            src={featuredVideo.thumbnail}
            alt={featuredVideo.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
            referrerPolicy="no-referrer"
            onError={handleImageError}
          />
          <div className={`absolute inset-0 bg-gradient-to-t ${featuredMeta.overlay} flex flex-col justify-end p-8 md:p-12`}>
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-pink-500 text-white px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest animate-pulse">
                {featuredMeta.badge}
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black mb-4 drop-shadow-lg">{featuredMeta.title}</h2>
            <p className="text-slate-200 font-bold max-w-2xl mb-6 hidden md:block">
              {featuredMeta.description}
            </p>
            <div className="flex items-center gap-4">
              <button className={`bg-white text-slate-900 px-8 py-4 rounded-2xl font-black flex items-center gap-2 transition-all ${featuredMeta.button}`}>
                <Play className="w-6 h-6 fill-current" />
                شاهدي الآن
              </button>
            </div>
          </div>
        </motion.div>

        {/* Categories */}
        <div className="mb-6 bg-gradient-to-r from-emerald-900/60 to-indigo-900/60 border border-emerald-700/40 rounded-3xl p-5">
          <p className="text-sm font-black text-emerald-200 mb-1">🎯 مكتبة مميزة ومتوازنة</p>
          <p className="text-xs font-bold text-slate-200">
            السلسلة الدينية المتكاملة تضم {religiousSeriesCount} فيديو، وقسم الفيديوهات التعليمية يضم {educationalCount} فيديو.
          </p>
        </div>

        <div className="flex gap-3 mb-8 overflow-x-auto pb-4 no-scrollbar">
          <CategoryButton 
            active={activeCategory === 'all'} 
            onClick={() => { setActiveCategory('all'); setActiveSubcategory(null); }}
            icon={<Tv className="w-5 h-5" />}
            label="الكل"
            color="bg-slate-800"
          />
          <CategoryButton 
            active={activeCategory === 'favorites'} 
            onClick={() => { setActiveCategory('favorites'); setActiveSubcategory(null); }}
            icon={<Heart className="w-5 h-5 fill-current" />}
            label="المفضلة"
            color="bg-pink-600"
          />
          <CategoryButton 
            active={activeCategory === 'recent'} 
            onClick={() => { setActiveCategory('recent'); setActiveSubcategory(null); }}
            icon={<Clock className="w-5 h-5" />}
            label="شوهد مؤخراً"
            color="bg-indigo-600"
          />
          <div className="w-px h-10 bg-slate-800 mx-2 self-center" />
          <CategoryButton 
            active={activeCategory === 'quran_full'} 
            onClick={() => { setActiveCategory('quran_full'); setActiveSubcategory(null); }}
            icon={<BookOpen className="w-5 h-5" />}
            label="القرآن الكريم"
            color="bg-emerald-700"
          />
          <CategoryButton 
            active={activeCategory === 'interpretation'} 
            onClick={() => { setActiveCategory('interpretation'); setActiveSubcategory(null); }}
            icon={<Search className="w-5 h-5" />}
            label="تفسير"
            color="bg-purple-600"
          />
          <CategoryButton 
            active={activeCategory === 'sunnah'} 
            onClick={() => { setActiveCategory('sunnah'); setActiveSubcategory(null); }}
            icon={<Heart className="w-5 h-5" />}
            label="السنة النبوية"
            color="bg-pink-600"
          />
          <CategoryButton 
            active={activeCategory === 'prophets_stories'} 
            onClick={() => { setActiveCategory('prophets_stories'); setActiveSubcategory(null); }}
            icon={<Star className="w-5 h-5" />}
            label="قصص الأنبياء"
            color="bg-amber-600"
          />
          <CategoryButton 
            active={activeCategory === 'educational'} 
            onClick={() => { setActiveCategory('educational'); setActiveSubcategory(null); }}
            icon={<Sparkles className="w-5 h-5" />}
            label="فيديوهات تعليمية"
            color="bg-red-600"
          />
          <CategoryButton 
            active={activeCategory === 'nasheeds'} 
            onClick={() => { setActiveCategory('nasheeds'); setActiveSubcategory(null); }}
            icon={<Music className="w-5 h-5" />}
            label="أناشيد"
            color="bg-sky-600"
          />
          <CategoryButton 
            active={activeCategory === 'stories'} 
            onClick={() => { setActiveCategory('stories'); setActiveSubcategory(null); }}
            icon={<BookOpen className="w-5 h-5" />}
            label="قصص أطفال"
            color="bg-orange-600"
          />
        </div>

        {/* Video Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {displayVideos.map((video) => (
              <motion.div
                key={video.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                whileHover={{ y: -5 }}
                className="bg-slate-800 rounded-3xl overflow-hidden border border-slate-700 group cursor-pointer relative"
                onClick={() => {
                  setSelectedVideo(video);
                  addToRecent(video.id);
                }}
              >
                <div className="relative aspect-video">
                  <img 
                    src={video.thumbnail} 
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                    onError={handleImageError}
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-slate-900 shadow-xl">
                      <Play className="w-8 h-8 fill-current" />
                    </div>
                  </div>
                  <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-xs font-bold">
                    {video.duration}
                  </div>
                  
                  <button 
                    onClick={(e) => toggleFavorite(video.id, e)}
                    className={`absolute top-3 left-3 p-2 rounded-full backdrop-blur-md transition-all ${
                      favorites.includes(video.id) ? 'bg-pink-500 text-white' : 'bg-black/40 text-white hover:bg-pink-500'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${favorites.includes(video.id) ? 'fill-current' : ''}`} />
                  </button>

                  {video.subcategory && (
                    <div className="absolute top-3 right-3 bg-pink-500/80 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-black">
                      {video.subcategory}
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-black mb-1 group-hover:text-pink-400 transition-colors line-clamp-1">{video.title}</h3>
                  <p className="text-slate-400 text-xs font-bold mb-3 line-clamp-2">{video.description}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider bg-slate-900/50 px-2 py-1 rounded-md">
                      {video.category === 'quran_full' && '📖 القرآن'}
                      {video.category === 'interpretation' && '🔍 تفسير'}
                      {video.category === 'sunnah' && '❤️ سنة'}
                      {video.category === 'prophets_stories' && '🌟 قصص'}
                      {video.category === 'nasheeds' && '🎵 أناشيد'}
                      {video.category === 'stories' && '📚 حكايات'}
                      {video.category === 'educational' && '🎓 تعليمي'}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredVideos.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-xl font-bold text-slate-400">لم نجد أي فيديوهات بهذا الاسم..</h3>
          </div>
        )}
      </main>

      {/* Video Player Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-5xl bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-800"
            >
              <div className="p-6 flex justify-between items-center border-b border-slate-800">
                <h2 className="text-xl font-black">{selectedVideo.title}</h2>
                <button 
                  onClick={() => setSelectedVideo(null)}
                  className="p-2 hover:bg-slate-800 rounded-full transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="aspect-video bg-black">
                {(() => {
                  const embedSrc = getVideoEmbedSrc(selectedVideo);
                  if (!embedSrc) {
                    return (
                      <div className="w-full h-full flex items-center justify-center p-6 text-center">
                        <div>
                          <p className="font-black text-lg text-rose-300 mb-2">تعذر تشغيل هذا الفيديو</p>
                          <p className="text-sm text-slate-300 font-bold">
                            مصدر الفيديو غير صالح حالياً. اختاري فيديو آخر من القائمة.
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return (
                  <iframe
                    width="100%"
                    height="100%"
                    src={embedSrc}
                    title={selectedVideo.title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                  );
                })()}
              </div>
              <div className="p-6 bg-slate-800/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center text-2xl">✨</div>
                  <div>
                    <p className="font-bold text-slate-300">مشاهدة ممتعة يا بطلة!</p>
                    <p className="text-sm text-slate-500">تذكري دائماً أن تأخذي استراحة بعد المشاهدة 💖</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CategoryButton({ active, onClick, icon, label, color }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string, color: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black transition-all whitespace-nowrap ${
        active 
          ? `${color} text-white shadow-lg scale-105` 
          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
