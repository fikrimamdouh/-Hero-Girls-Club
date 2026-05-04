import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { MARIA_GAMES, MARIA_CATEGORIES, MariaGameCategory, MariaGame } from '../data/mariaGamesData';
import { Search, ArrowRight, Sparkles, X, Gamepad2 } from 'lucide-react';

interface MariaGamesViewProps {
  games?: MariaGame[];
  title?: string;
  emoji?: string;
  searchPlaceholder?: string;
  /** legacy props kept for App.tsx compatibility, ignored by new design */
  navBarFromColor?: string;
  navBarToColor?: string;
  tabsBarColor?: string;
  tabsActiveBg?: string;
  tabsHoverBg?: string;
}

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

export default function MariaGamesView({
  games = MARIA_GAMES,
  title = 'ألعاب ماريا',
  emoji = '🎀',
  searchPlaceholder = 'ابحثي عن لعبة...',
}: MariaGamesViewProps = {}) {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<MariaGameCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredGames = useMemo(() => games.filter((g) => {
    const cat = activeCategory === 'all' || g.category === activeCategory;
    const q = g.title.toLowerCase().includes(searchQuery.toLowerCase());
    return cat && q;
  }), [activeCategory, searchQuery, games]);

  const categoryCounts = useMemo(() => {
    const counts: Partial<Record<MariaGameCategory, number>> = { all: games.length };
    games.forEach((g) => { counts[g.category] = (counts[g.category] || 0) + 1; });
    return counts;
  }, [games]);

  return (
    <div className="min-h-screen bg-[#fdfaf6] font-arabic" dir="rtl"
      style={{ backgroundImage: 'radial-gradient(circle at 0% 0%, rgba(251,207,232,0.35), transparent 50%), radial-gradient(circle at 100% 0%, rgba(254,215,170,0.30), transparent 45%)' }}>

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
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center text-white text-lg shadow-md shadow-rose-200">
              {emoji}
            </div>
            <div className="hidden sm:block">
              <p className="text-[11px] leading-none text-stone-400 font-bold">مكتبة الألعاب</p>
              <p className="text-sm font-extrabold leading-tight text-stone-800">{title}</p>
            </div>
          </div>

          <div className="flex-1 max-w-md mx-auto">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 h-4 w-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full bg-stone-100/80 focus:bg-white pr-9 pl-9 py-2.5 rounded-full text-sm font-bold text-stone-800 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-300 transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} aria-label="مسح" className="absolute left-2 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full hover:bg-stone-200 text-stone-400 flex items-center justify-center">
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-700 ring-1 ring-amber-200 px-3 py-1.5">
            <Gamepad2 className="h-3.5 w-3.5" />
            <span className="text-xs font-extrabold">{filteredGames.length}</span>
          </div>
        </div>

        {/* Category chips */}
        <div className="border-t border-stone-100/80">
          <div className="mx-auto max-w-7xl px-3 py-2 flex items-center gap-1.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {MARIA_CATEGORIES.map((cat) => {
              const active = activeCategory === cat.id;
              const count = categoryCounts[cat.id] || 0;
              if (cat.id !== 'all' && count === 0) return null;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs sm:text-sm font-extrabold ring-1 transition-all ${
                    active
                      ? `${CATEGORY_ACCENT[cat.id]} text-white ring-transparent shadow-sm`
                      : 'bg-white text-stone-600 ring-stone-200 hover:bg-stone-50'
                  }`}
                >
                  <span className="text-sm">{cat.icon}</span>
                  <span>{cat.label}</span>
                  <span className={`text-[10px] font-extrabold rounded-full px-1.5 ${active ? 'bg-white/25' : 'bg-stone-100 text-stone-500'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Grid */}
      <main className="mx-auto max-w-7xl px-3 sm:px-5 py-5 pb-16">
        {filteredGames.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 grid-flow-row-dense">
            <AnimatePresence>
              {filteredGames.map((g, i) => (
                <GameCard
                  key={g.id}
                  game={g}
                  index={i}
                  onClick={() => {
                    if (g.external) {
                      window.open(g.route, '_blank', 'noopener,noreferrer');
                    } else {
                      navigate(g.route);
                    }
                  }}
                />
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <EmptyState onReset={() => { setSearchQuery(''); setActiveCategory('all'); }} />
        )}

        <p className="text-center text-[11px] text-stone-400 font-bold pt-8">
          {filteredGames.length} لعبة · مجانية وآمنة · بدون إعلانات
        </p>
      </main>
    </div>
  );
}

function GameCard({ game, onClick, index }: { game: MariaGame; onClick: () => void; index: number }) {
  const accent = CATEGORY_ACCENT[game.category];
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
        {game.external && (
          <div className="absolute top-2.5 left-2.5 inline-flex items-center justify-center w-6 h-6 rounded-full bg-white/95 text-stone-700 text-[10px] font-extrabold shadow-md" title="يفتح في تبويب جديد">
            ↗
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

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="h-16 w-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mb-4">
        <Search className="h-7 w-7" />
      </div>
      <h3 className="text-lg font-black text-stone-800 mb-1">لم نجد ألعاباً مطابقة</h3>
      <p className="text-sm text-stone-500 font-bold mb-5">جرّبي كلمة بحث مختلفة أو تصنيفاً آخر</p>
      <button
        onClick={onReset}
        className="rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold px-6 py-2.5 shadow-md shadow-rose-200 transition-colors"
      >
        عرض كل الألعاب
      </button>
    </div>
  );
}
