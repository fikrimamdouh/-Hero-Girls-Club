import { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { MARIA_GAMES_WITH_SOURCE, MARIA_CATEGORIES, MariaGameCategory, MariaGame } from '../data/mariaGamesData';
import { Search, ArrowRight, X, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';

export default function MariaGamesView() {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<MariaGameCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGame, setSelectedGame] = useState<MariaGame | null>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  const filteredGames = useMemo(() => {
    return MARIA_GAMES_WITH_SOURCE.filter((game) => {
      const matchesCategory = activeCategory === 'all' || game.category === activeCategory;
      const matchesSearch = game.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const getGamePlayUrl = (game: MariaGame) =>
    game.externalUrl || game.route || `https://poki.com/ar/search?query=${encodeURIComponent(game.title)}`;

  const isEmbeddable = (url: string) => !!url && !/poki\.com/i.test(url);

  const scrollTabs = (dir: 'left' | 'right') => {
    if (tabsRef.current) {
      tabsRef.current.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f0f5] font-sans" dir="rtl">

      {/* ── Navbar ── */}
      <nav className="h-16 bg-white shadow-sm sticky top-0 z-40 flex items-center px-4 gap-3">
        {/* Back */}
        <button
          onClick={() => navigate('/child')}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors shrink-0"
        >
          <ArrowRight className="w-5 h-5" />
        </button>

        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer shrink-0"
          onClick={() => { setActiveCategory('all'); setSearchQuery(''); }}
        >
          <span className="text-2xl">🎮</span>
          <span className="text-xl font-black text-slate-800 hidden sm:block">ألعاب ماريا</span>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-xl mx-auto">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="ابحثي عن ألعاب..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 pr-9 pl-4 py-2.5 rounded-full text-slate-800 text-sm font-bold placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-400 transition-all"
            />
          </div>
        </div>

        {/* Avatar */}
        <div className="w-9 h-9 bg-gradient-to-br from-pink-400 to-fuchsia-500 rounded-full flex items-center justify-center shrink-0 shadow">
          <span className="text-lg">👧</span>
        </div>
      </nav>

      {/* ── Category Tabs (Poki style) ── */}
      <div className="bg-white border-b border-slate-100 sticky top-16 z-30">
        <div className="relative flex items-center">
          {/* Scroll left */}
          <button
            onClick={() => scrollTabs('right')}
            className="absolute right-0 z-10 h-full px-1 bg-gradient-to-l from-white via-white to-transparent flex items-center"
          >
            <ChevronRight className="w-5 h-5 text-slate-400" />
          </button>

          <div
            ref={tabsRef}
            className="flex gap-2 overflow-x-auto no-scrollbar px-4 py-3 scroll-smooth"
          >
            {MARIA_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`
                  flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-black whitespace-nowrap transition-all shrink-0
                  ${activeCategory === cat.id
                    ? 'bg-pink-500 text-white shadow-md shadow-pink-200'
                    : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-pink-300 hover:text-pink-500'}
                `}
              >
                <span className="text-base">{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Scroll right */}
          <button
            onClick={() => scrollTabs('left')}
            className="absolute left-0 z-10 h-full px-1 bg-gradient-to-r from-white via-white to-transparent flex items-center"
          >
            <ChevronLeft className="w-5 h-5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* ── Game Grid ── */}
      <main className="p-3 md:p-5">
        {filteredGames.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2 md:gap-3 auto-rows-[130px] md:auto-rows-[150px] grid-flow-row-dense">
            <AnimatePresence>
              {filteredGames.map((game) => {
                const isFeatured = game.size === 'medium';
                const isWide = game.size === 'wide';
                const isTall = game.size === 'tall';

                return (
                  <motion.div
                    key={game.id}
                    layout
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    transition={{ duration: 0.15 }}
                    whileHover={{ scale: 1.05, zIndex: 20 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setSelectedGame(game)}
                    className={`
                      relative rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-shadow duration-200
                      bg-gradient-to-br ${game.color}
                      ${isFeatured ? 'col-span-2 row-span-2' : ''}
                      ${isWide ? 'col-span-2' : ''}
                      ${isTall ? 'row-span-2' : ''}
                    `}
                  >
                    {/* Thumbnail */}
                    {game.image ? (
                      <img
                        src={game.image}
                        alt={game.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className={`drop-shadow-lg ${isFeatured ? 'text-6xl' : isWide || isTall ? 'text-4xl' : 'text-3xl'}`}>
                          {game.emoji}
                        </span>
                      </div>
                    )}

                    {/* Hover title */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-200 flex items-end p-2">
                      <p className="text-white text-xs font-black leading-tight text-center w-full drop-shadow-md line-clamp-2">
                        {game.title}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-32 text-center">
            <div className="text-7xl mb-4">🔍</div>
            <h3 className="text-xl font-black text-slate-700 mb-2">لم نجد ألعاباً!</h3>
            <p className="text-slate-400 font-bold mb-6">جربي كلمات بحث أخرى</p>
            <button
              onClick={() => { setSearchQuery(''); setActiveCategory('all'); }}
              className="bg-pink-500 text-white px-8 py-3 rounded-full font-black hover:bg-pink-600 transition-colors"
            >
              عرض كل الألعاب
            </button>
          </div>
        )}
      </main>

      {/* ── Game Modal ── */}
      <AnimatePresence>
        {selectedGame && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3"
            onClick={() => setSelectedGame(null)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 16 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 16 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 rounded-3xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-5 py-3 bg-slate-800">
                <div className="flex items-center gap-3">
                  {selectedGame.image ? (
                    <img src={selectedGame.image} alt={selectedGame.title} className="w-8 h-8 object-cover rounded-lg" />
                  ) : (
                    <span className="text-2xl">{selectedGame.emoji}</span>
                  )}
                  <h2 className="text-white font-black text-lg">{selectedGame.title}</h2>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={getGamePlayUrl(selectedGame)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 bg-pink-500 hover:bg-pink-600 text-white font-black text-sm px-4 py-2 rounded-xl transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    فتح اللعبة
                  </a>
                  <button
                    onClick={() => setSelectedGame(null)}
                    className="w-9 h-9 rounded-xl bg-white/10 hover:bg-red-500/30 text-white flex items-center justify-center transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Game area */}
              <div className="h-[70vh] bg-slate-950 relative">
                {isEmbeddable(getGamePlayUrl(selectedGame)) ? (
                  <iframe
                    title={selectedGame.title}
                    src={getGamePlayUrl(selectedGame)}
                    className="w-full h-full border-0"
                    allow="fullscreen; autoplay; gamepad"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock allow-popups"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-6 text-center p-8">
                    {selectedGame.image && (
                      <img
                        src={selectedGame.image}
                        alt={selectedGame.title}
                        className="w-40 h-40 object-cover rounded-3xl shadow-2xl"
                      />
                    )}
                    {!selectedGame.image && (
                      <div className="text-8xl">{selectedGame.emoji}</div>
                    )}
                    <div className="max-w-sm">
                      <h3 className="text-white font-black text-2xl mb-2">{selectedGame.title}</h3>
                      <p className="text-slate-400 font-bold text-sm mb-6">
                        هذه اللعبة تُفتح في موقعها الرسمي مباشرةً
                      </p>
                      <a
                        href={getGamePlayUrl(selectedGame)}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-black text-lg px-8 py-4 rounded-2xl transition-colors shadow-xl shadow-pink-900/40"
                      >
                        <span>العب الآن</span>
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
