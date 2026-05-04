import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ARCADE_GAMES, MARIA_CATEGORIES, MariaGameCategory, MariaGame } from '../data/mariaGamesData';
import { Search, ArrowRight, Gamepad2, Sparkles, X, Trophy, Zap, Flame, Star } from 'lucide-react';
import { getDailyChallengeId, getGameStat } from '../lib/gameStats';

const CATEGORY_ACCENT: Record<MariaGameCategory, string> = {
  all:          'bg-rose-500',
  drawing:      'bg-fuchsia-500',
  action:       'bg-red-500',
  adventures:   'bg-amber-500',
  cars:         'bg-orange-500',
  sports:       'bg-emerald-500',
  girls:        'bg-pink-500',
  puzzles:      'bg-violet-500',
  intelligence: 'bg-indigo-500',
  multiplayer:  'bg-sky-500',
  arcade:       'bg-cyan-500',
  educational:  'bg-teal-500',
};

export default function KidsGamesPage() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<MariaGameCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGames = useMemo(() => ARCADE_GAMES.filter((g) => {
    const cat = activeCategory === 'all' || g.category === activeCategory;
    const q = g.title.toLowerCase().includes(searchQuery.toLowerCase());
    return cat && q;
  }), [activeCategory, searchQuery]);

  const categoryCounts = useMemo(() => {
    const counts: Partial<Record<MariaGameCategory, number>> = { all: ARCADE_GAMES.length };
    ARCADE_GAMES.forEach((g) => { counts[g.category] = (counts[g.category] || 0) + 1; });
    return counts;
  }, []);

  const featured = useMemo(() => ARCADE_GAMES.filter((g) => g.featured).slice(0, 3), []);

  const dailyChallenge = useMemo(() => {
    const dailyId = getDailyChallengeId(ARCADE_GAMES.filter(g => g.featured).map(g => g.id));
    return ARCADE_GAMES.find(g => g.id === dailyId) || null;
  }, []);

  return (
    <div className="min-h-screen bg-[#fdfaf6] font-arabic" dir="rtl"
      style={{ backgroundImage: 'radial-gradient(circle at 0% 0%, rgba(254,215,170,0.4), transparent 50%), radial-gradient(circle at 100% 0%, rgba(251,207,232,0.35), transparent 45%)' }}>

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
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-orange-400 to-rose-500 flex items-center justify-center shadow-md shadow-orange-200">
              <Gamepad2 className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-[11px] leading-none text-stone-400 font-bold">عالم الألعاب</p>
              <p className="text-sm font-extrabold leading-tight text-stone-800">بستان الألعاب</p>
            </div>
          </div>

          <div className="flex-1 max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 h-4 w-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحثي عن لعبة..."
                className="w-full bg-stone-100/80 focus:bg-white pr-9 pl-9 py-2.5 rounded-full text-sm font-bold text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-orange-300 transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} aria-label="مسح" className="absolute left-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full hover:bg-stone-200 text-stone-400 flex items-center justify-center">
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-200 px-3 py-1.5">
            <Trophy className="h-3.5 w-3.5" />
            <span className="text-xs font-extrabold">{ARCADE_GAMES.length} لعبة</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 pb-20 space-y-6">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl bg-white shadow-[0_4px_30px_rgba(251,146,60,0.12)] ring-1 ring-stone-100">
          <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-gradient-to-br from-orange-200/60 to-rose-300/40 blur-3xl pointer-events-none" />
          <div className="absolute top-0 right-0 h-48 w-48 rounded-full bg-gradient-to-bl from-amber-200/60 to-pink-200/30 blur-3xl pointer-events-none" />
          <div className="relative grid grid-cols-1 lg:grid-cols-[1fr,auto] gap-6 p-6 sm:p-8">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 text-orange-600 px-3 py-1 text-[11px] font-extrabold mb-3">
                <Sparkles className="h-3 w-3" /> {ARCADE_GAMES.length} لعبة سحرية بانتظاركِ
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-stone-900 mb-2 tracking-tight">
                عالم <span className="bg-gradient-to-r from-orange-500 to-rose-500 bg-clip-text text-transparent">الألعاب</span>
              </h1>
              <p className="text-sm sm:text-base text-stone-500 font-bold max-w-md mb-4">
                ألعاب مختارة بعناية — كلاسيكية ومغامرات وذكاء وسرعة. اضغطي البطاقة وانطلقي 🎮
              </p>

              <div className="flex flex-wrap gap-2">
                <Stat icon={Gamepad2} label="لعبة" value={ARCADE_GAMES.length} accent="bg-orange-50 text-orange-700 ring-orange-200" />
                <Stat icon={Sparkles} label="مميز" value={featured.length} accent="bg-amber-50 text-amber-700 ring-amber-200" />
                <Stat icon={Zap} label="مجانية" value="100%" accent="bg-emerald-50 text-emerald-700 ring-emerald-200" />
              </div>
            </div>

            {/* Featured cards mini-row */}
            <aside className="lg:w-72 grid grid-cols-3 gap-2 self-center">
              {featured.map((g) => (
                <button
                  key={g.id}
                  onClick={() => navigate(g.route)}
                  className="group relative aspect-square rounded-2xl overflow-hidden ring-1 ring-stone-200 hover:ring-orange-300 hover:shadow-md transition-all bg-stone-50"
                >
                  <img src={g.thumb} alt={g.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent p-1.5">
                    <p className="text-white text-[10px] font-extrabold leading-tight text-center line-clamp-1">{g.title}</p>
                  </div>
                </button>
              ))}
            </aside>
          </div>
        </section>

        {/* Daily Challenge */}
        {dailyChallenge && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => navigate(dailyChallenge.route)}
            className="cursor-pointer relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-500 via-fuchsia-500 to-rose-500 p-5 sm:p-6 shadow-xl shadow-fuchsia-200 hover:shadow-2xl transition-shadow"
          >
            <div className="absolute -top-10 -left-10 h-40 w-40 rounded-full bg-white/15 blur-2xl pointer-events-none" />
            <div className="relative flex items-center gap-4">
              <div className="shrink-0 h-20 w-20 sm:h-24 sm:w-24 rounded-2xl overflow-hidden ring-4 ring-white/30">
                <img src={dailyChallenge.thumb} alt={dailyChallenge.title} className="w-full h-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}/>
              </div>
              <div className="flex-1 text-white">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-white/25 backdrop-blur-sm px-2.5 py-0.5 text-[10px] font-extrabold mb-1.5">
                  <Flame className="h-3 w-3" /> تحدّي اليوم
                </div>
                <h3 className="text-xl sm:text-2xl font-black mb-1 leading-tight">{dailyChallenge.title}</h3>
                <p className="text-white/85 text-xs sm:text-sm font-bold">العبيها اليوم واربحي مكافآت مضاعفة! 🎁</p>
              </div>
              <div className="shrink-0 hidden sm:flex flex-col items-center text-white">
                <Sparkles className="h-6 w-6 mb-1" />
                <span className="text-[10px] font-extrabold uppercase">2X نجوم</span>
              </div>
            </div>
          </motion.section>
        )}

        {/* Category chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto -mx-1 px-1 pb-1" style={{ scrollbarWidth: 'none' }}>
          {MARIA_CATEGORIES.map((cat) => {
            const active = activeCategory === cat.id;
            const count = categoryCounts[cat.id] || 0;
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
                <span className={`text-[10px] font-extrabold rounded-full px-1.5 ${active ? 'bg-white/25' : 'bg-stone-100 text-stone-500'}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Grid */}
        <section>
          <div className="flex items-end justify-between mb-3">
            <h2 className="text-lg font-black text-stone-800">
              {activeCategory === 'all' ? 'كل الألعاب' : MARIA_CATEGORIES.find((c) => c.id === activeCategory)?.label}
            </h2>
            <span className="text-xs text-stone-400 font-bold">{filteredGames.length} نتيجة</span>
          </div>

          {filteredGames.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 grid-flow-row-dense">
              <AnimatePresence>
                {filteredGames.map((g, i) => (
                  <GameCard key={g.id} game={g} index={i} onClick={() => navigate(g.route)} />
                ))}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="h-16 w-16 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mb-4">
                <Search className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-black text-stone-800 mb-1">لم نجد ألعاباً مطابقة</h3>
              <p className="text-sm text-stone-500 font-bold mb-5">جرّبي كلمة بحث مختلفة أو تصنيفاً آخر</p>
              <button
                onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
                className="rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-extrabold px-6 py-2.5 shadow-md shadow-orange-200"
              >
                عرض كل الألعاب
              </button>
            </div>
          )}
        </section>

        <p className="text-center text-[11px] text-stone-400 font-bold pt-4">
          🎮 {ARCADE_GAMES.length} لعبة كلها مجانية وآمنة وبدون إعلانات
        </p>
      </main>
    </div>
  );
}

function Stat({ icon: Icon, label, value, accent }: { icon: any; label: string; value: number | string; accent: string }) {
  return (
    <div className={`flex items-center gap-1.5 rounded-2xl px-3 py-2 ring-1 ${accent}`}>
      <Icon className="h-4 w-4" />
      <span className="text-sm font-extrabold">{value}</span>
      <span className="text-[11px] font-bold opacity-70">{label}</span>
    </div>
  );
}

function GameCard({ game, onClick, index }: { game: MariaGame; onClick: () => void; index: number }) {
  const accent = CATEGORY_ACCENT[game.category];
  const stat = getGameStat(game.id);
  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: Math.min(index * 0.015, 0.25), duration: 0.18 }}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`relative overflow-hidden rounded-2xl bg-white ring-1 ring-stone-100 hover:ring-stone-200 hover:shadow-lg hover:shadow-stone-200/60 cursor-pointer transition-all group ${
        game.featured ? 'col-span-2 row-span-2' : ''
      }`}
    >
      <span className={`absolute top-0 right-0 left-0 h-1 ${accent} z-10`} />
      <div className="relative aspect-square overflow-hidden bg-stone-50">
        <img
          src={game.thumb}
          alt={game.title}
          loading="lazy"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {game.featured && (
          <div className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-full bg-amber-400 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 shadow-md">
            <Sparkles className="h-2.5 w-2.5" /> مميز
          </div>
        )}
        {stat.bestScore > 0 && (
          <div className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded-full bg-black/65 backdrop-blur-sm text-amber-300 text-[10px] font-extrabold px-2 py-0.5 shadow-md">
            <Star className="h-2.5 w-2.5 fill-current" /> {stat.bestScore}
          </div>
        )}
        {stat.totalPlays > 0 && (
          <div className="absolute bottom-12 left-2.5 inline-flex items-center gap-1 rounded-full bg-emerald-500/85 backdrop-blur-sm text-white text-[10px] font-extrabold px-2 py-0.5">
            ✓ {stat.totalPlays}
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-2.5">
          <p className="text-white text-xs sm:text-sm font-extrabold leading-tight text-center drop-shadow-md line-clamp-2">
            {game.title}
          </p>
        </div>
      </div>
    </motion.button>
  );
}
