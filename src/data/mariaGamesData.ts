export type MariaGameCategory = 'all' | 'girls' | 'puzzles' | 'cars' | 'educational' | 'adventures' | 'intelligence' | 'action' | 'sports' | 'multiplayer' | 'arcade';
export type GameSize = 'small' | 'medium' | 'wide' | 'tall';

export interface MariaGame {
  id: string;
  title: string;
  category: MariaGameCategory;
  emoji: string;
  color: string;
  size: GameSize;
  route?: string;
  externalUrl?: string;
  image?: string;
}

export const MARIA_CATEGORIES: { id: MariaGameCategory; label: string; icon: string }[] = [
  { id: 'all', label: 'الرئيسية', icon: '🏠' },
  { id: 'action', label: 'أكشن', icon: '⚡' },
  { id: 'adventures', label: 'مغامرات', icon: '🗺️' },
  { id: 'cars', label: 'سيارات', icon: '🏎️' },
  { id: 'sports', label: 'رياضة', icon: '⚽' },
  { id: 'girls', label: 'بنات', icon: '🎀' },
  { id: 'puzzles', label: 'ألغاز', icon: '🧩' },
  { id: 'intelligence', label: 'ذكاء', icon: '🧠' },
  { id: 'multiplayer', label: 'لعب جماعي', icon: '👥' },
  { id: 'arcade', label: 'أركيد', icon: '🕹️' },
  { id: 'educational', label: 'تعليمية', icon: '📚' },
];

export const MARIA_GAMES: MariaGame[] = [
  // ── Block 1: Popular / Hero Games ──────────────────────────────
  {
    id: 'p1', title: 'صائدة الفواكه', category: 'arcade',
    emoji: '🍉', color: 'from-green-400 to-emerald-600',
    size: 'medium', route: '/games/fruit-catcher',
  },
  {
    id: 'p2', title: 'Subway Surfers', category: 'adventures',
    emoji: '🏃', color: 'from-blue-500 to-cyan-500',
    size: 'wide', image: '/games/subway-surfers.png',
    externalUrl: 'https://html5.gamedistribution.com/c0b3ac2f2f2942f4a9a74e02addf7e9c/',
  },
  {
    id: 'p3', title: 'Drift Boss', category: 'cars',
    emoji: '🏎️', color: 'from-orange-500 to-red-600',
    size: 'tall', image: '/games/drift-boss.png',
    externalUrl: 'https://html5.gamedistribution.com/57e61b4b3b434ef68a0da5c16b4fdde5/',
  },
  {
    id: 'p4', title: 'Stickman Hook', category: 'arcade',
    emoji: '🕸️', color: 'from-indigo-500 to-purple-600',
    size: 'small', image: '/games/stickman-hook.png',
    externalUrl: 'https://html5.gamedistribution.com/82f6ae28c9ef4e68abf0b9e6fb45e512/',
  },
  {
    id: 'p4_2', title: 'Level Devil', category: 'arcade',
    emoji: '😈', color: 'from-indigo-500 to-purple-600',
    size: 'small',
    externalUrl: 'https://html5.gamedistribution.com/6fb1af72ec434ebeac7d9ac36c9af38a/',
  },
  {
    id: 'p5', title: 'Football Legends', category: 'sports',
    emoji: '⚽', color: 'from-green-600 to-emerald-800',
    size: 'medium', image: '/games/football-legends.png',
    externalUrl: 'https://html5.gamedistribution.com/a0e7eab5c7904c6c9e2e10e3e37f3dcd/',
  },
  {
    id: 'p6', title: 'Monkey Mart', category: 'adventures',
    emoji: '🐒', color: 'from-amber-600 to-yellow-700',
    size: 'tall', image: '/games/monkey-mart.png',
    externalUrl: 'https://html5.gamedistribution.com/ffe0a3e4cd694df0b2310a9ad1aaa803/',
  },
  {
    id: 'p7', title: 'Retro Bowl', category: 'sports',
    emoji: '🏈', color: 'from-green-400 to-emerald-500',
    size: 'wide', image: '/games/retro-bowl.png',
    externalUrl: 'https://html5.gamedistribution.com/5e84b10a0ccf44c3a2547a1a7ade3c43/',
  },

  // ── Block 2: Girls & Dress Up ───────────────────────────────────
  {
    id: 'g1', title: 'Beauty Salon', category: 'girls',
    emoji: '💅', color: 'from-pink-400 to-rose-500',
    size: 'medium', image: '/games/beauty-salon.png',
    externalUrl: 'https://play.famobi.com/beauty-salon',
  },
  {
    id: 'g2', title: "Vortelli's Pizza", category: 'girls',
    emoji: '🍕', color: 'from-orange-400 to-red-400',
    size: 'small', image: '/games/vortellis-pizza.png',
    externalUrl: 'https://play.famobi.com/vortellis-pizza',
  },
  {
    id: 'g3', title: 'Anime Dress Up', category: 'girls',
    emoji: '👗', color: 'from-fuchsia-400 to-purple-500',
    size: 'tall', image: '/games/anime-dress-up.png',
    externalUrl: 'https://play.famobi.com/anime-dress-up',
  },
  {
    id: 'g4', title: 'Diva Hair Salon', category: 'girls',
    emoji: '💇‍♀️', color: 'from-sky-300 to-blue-400',
    size: 'small', image: '/games/diva-hair-salon.png',
    externalUrl: 'https://play.famobi.com/diva-hair-salon',
  },
  {
    id: 'g5', title: 'Princess Lovely Fashion', category: 'girls',
    emoji: '👑', color: 'from-pink-200 to-rose-300',
    size: 'small', image: '/games/princess-lovely-fashion.png',
    externalUrl: 'https://play.famobi.com/princess-lovely-fashion',
  },
  {
    id: 'g6', title: 'Diva Makeup Studio', category: 'girls',
    emoji: '💄', color: 'from-rose-400 to-pink-600',
    size: 'medium', image: '/games/diva-makeup-studio.png',
    externalUrl: 'https://play.famobi.com/diva-makeup-studio',
  },
  {
    id: 'g7', title: "Jane's Fashion Studio", category: 'girls',
    emoji: '✂️', color: 'from-purple-400 to-fuchsia-500',
    size: 'wide', image: '/games/janes-fashion-studio.png',
    externalUrl: 'https://play.famobi.com/janes-fashion-studio',
  },
  {
    id: 'g8', title: 'Nails DIY', category: 'girls',
    emoji: '💅', color: 'from-teal-300 to-emerald-400',
    size: 'small', image: '/games/nails-diy-manicure-master.png',
    externalUrl: 'https://play.famobi.com/nails-diy-manicure-master',
  },

  // ── Block 3: Action & Arcade ────────────────────────────────────
  {
    id: 'a1', title: 'Sushi Party', category: 'arcade',
    emoji: '🍣', color: 'from-green-400 to-lime-500',
    size: 'medium', image: '/games/sushi-party-io.png',
    externalUrl: 'https://html5.gamedistribution.com/36c8a5975ed14b2caaf1d08d1e6cead6/',
  },
  {
    id: 'a2', title: 'Vectaria.io', category: 'action',
    emoji: '🚀', color: 'from-slate-700 to-slate-900',
    size: 'wide', image: '/games/vectaria-io.png',
    externalUrl: 'https://html5.gamedistribution.com/bd66c3a6be1e4d40ba906a2b1007d2a1/',
  },
  {
    id: 'a3', title: 'Stickman Crazy Box', category: 'action',
    emoji: '🥷', color: 'from-gray-800 to-black',
    size: 'small', image: '/games/stickman-crazy-box.png',
    externalUrl: 'https://html5.gamedistribution.com/50e65ca5cbf748179bfb44fca20e8c14/',
  },
  {
    id: 'a4', title: 'Scary Teacher 3D', category: 'action',
    emoji: '🧟', color: 'from-emerald-700 to-green-900',
    size: 'tall', image: '/games/scary-teacher-3d.png',
    externalUrl: 'https://html5.gamedistribution.com/3d8e1be0734c4d1a9d67e43fdd97c831/',
  },
  {
    id: 'a5', title: 'Sweet Ball Sprint', category: 'arcade',
    emoji: '🦘', color: 'from-lime-400 to-green-500',
    size: 'small', image: '/games/sweet-ball-sprint.png',
    externalUrl: 'https://play.famobi.com/sweet-ball-sprint',
  },
  {
    id: 'a6', title: 'Blocky Blast Puzzle', category: 'arcade',
    emoji: '🧱', color: 'from-red-500 to-orange-600',
    size: 'small', image: '/games/blocky-blast-puzzle.png',
    externalUrl: 'https://html5.gamedistribution.com/4ce70c8c02cc4f4092f5da413d5e3c4a/',
  },
  {
    id: 'a7', title: 'Slice Master', category: 'arcade',
    emoji: '🔪', color: 'from-red-400 to-rose-600',
    size: 'medium', image: '/games/slice-master.png',
    externalUrl: 'https://html5.gamedistribution.com/4f8af3f44fa24dfe91e175765e2fa79c/',
  },
  {
    id: 'a8', title: 'Capitalist Bus Driver', category: 'cars',
    emoji: '🚌', color: 'from-sky-500 to-blue-700',
    size: 'wide', image: '/games/capitalist-bus-driver.png',
    externalUrl: 'https://html5.gamedistribution.com/7cf4a2aab4e14a5c891ed56c8aa428ba/',
  },
  {
    id: 'a9', title: 'Steal and Run', category: 'action',
    emoji: '🏃', color: 'from-orange-500 to-red-600',
    size: 'small', image: '/games/steal-and-run.png',
    externalUrl: 'https://html5.gamedistribution.com/d0e7a152a66b4f4fa0fded4aa5d2e3aa/',
  },
  {
    id: 'a10', title: 'Cat Simulator', category: 'arcade',
    emoji: '🐱', color: 'from-cyan-400 to-blue-500',
    size: 'small', image: '/games/cat-simulator.png',
    externalUrl: 'https://html5.gamedistribution.com/a2e8c7f5d3a44d8cb54e13f97e42cbbb/',
  },

  // ── Block 4: Brain & Puzzle ─────────────────────────────────────
  {
    id: 'f7', title: 'Brain Test', category: 'intelligence',
    emoji: '🧠', color: 'from-red-500 to-red-700',
    size: 'wide', image: '/games/brain-test-tricky-puzzles.png',
    externalUrl: 'https://html5.gamedistribution.com/8b5c5b8ee8624ffd8ab2f1eb4d77949f/',
  },
  {
    id: 'f8', title: 'Draw My Path', category: 'adventures',
    emoji: '✏️', color: 'from-slate-600 to-gray-800',
    size: 'medium', image: '/games/draw-my-path-obby.png',
    externalUrl: 'https://html5.gamedistribution.com/c5f3a9e84bc24e5facc811d5e7b93c22/',
  },
  {
    id: 'f9', title: 'Minefun.io', category: 'arcade',
    emoji: '⛏️', color: 'from-amber-600 to-yellow-700',
    size: 'small', image: '/games/minefun-io.png',
    externalUrl: 'https://html5.gamedistribution.com/e2a5c9bde4f04d3099a6c0f98a4e2b5c/',
  },
  {
    id: 'f10', title: 'Color Artist', category: 'arcade',
    emoji: '🎨', color: 'from-sky-300 to-blue-400',
    size: 'small', image: '/games/color-artist.png',
    externalUrl: 'https://play.famobi.com/color-artist',
  },
  {
    id: 'f11', title: 'Drawing Contest', category: 'multiplayer',
    emoji: '✏️', color: 'from-purple-400 to-fuchsia-500',
    size: 'wide', image: '/games/drawing-contest.png',
    externalUrl: 'https://html5.gamedistribution.com/9a4e7b2c5f3d4a8be1cc0d7a93e59f4c/',
  },
  {
    id: 'f12', title: 'Magic Coloring Book', category: 'girls',
    emoji: '🖍️', color: 'from-cyan-200 to-sky-300',
    size: 'small', image: '/games/magic-coloring-book.png',
    externalUrl: 'https://play.famobi.com/magic-coloring-book',
  },
  {
    id: 'f13', title: 'My Perfect Hotel', category: 'arcade',
    emoji: '🏨', color: 'from-slate-400 to-gray-500',
    size: 'small', image: '/games/my-perfect-hotel.png',
    externalUrl: 'https://html5.gamedistribution.com/f5a9c7e8b3d14c2a91e6f08e2a7d5b9f/',
  },
  {
    id: 'f14', title: 'My Cozy Home', category: 'girls',
    emoji: '🏠', color: 'from-green-500 to-emerald-600',
    size: 'medium', image: '/games/my-cozy-home.png',
    externalUrl: 'https://play.famobi.com/my-cozy-home',
  },
  {
    id: 'f15', title: 'Fashion Tour Simulator', category: 'girls',
    emoji: '👗', color: 'from-indigo-600 to-purple-800',
    size: 'tall', image: '/games/fashion-tour-simulator.png',
    externalUrl: 'https://play.famobi.com/fashion-tour-simulator',
  },
  {
    id: 'f16', title: 'Funny Haircut', category: 'girls',
    emoji: '✂️', color: 'from-orange-500 to-red-600',
    size: 'small', image: '/games/funny-haircut.png',
    externalUrl: 'https://play.famobi.com/funny-haircut',
  },
  {
    id: 'f17', title: 'Glam Girl Dress Up', category: 'girls',
    emoji: '👗', color: 'from-pink-300 to-rose-400',
    size: 'small', image: '/games/glam-girl-dress-up-and-makeover.png',
    externalUrl: 'https://play.famobi.com/glam-girl-dress-up-and-makeover',
  },
  {
    id: 'f18', title: 'Kpop Concert Dress Up', category: 'girls',
    emoji: '🎤', color: 'from-amber-700 to-orange-900',
    size: 'wide', image: '/games/kpop-concert-dress-up.png',
    externalUrl: 'https://play.famobi.com/kpop-concert-dress-up',
  },
  {
    id: 'f19', title: 'Party Time', category: 'girls',
    emoji: '🎉', color: 'from-sky-200 to-blue-300',
    size: 'medium', image: '/games/party-time.png',
    externalUrl: 'https://play.famobi.com/party-time',
  },
  {
    id: 'f20', title: 'Summer Fashion Makeover', category: 'girls',
    emoji: '☀️', color: 'from-yellow-400 to-orange-500',
    size: 'small', image: '/games/summer-fashion-makeover.png',
    externalUrl: 'https://play.famobi.com/summer-fashion-makeover',
  },
  {
    id: 'f21', title: 'Sweet & Fruity Makeup', category: 'girls',
    emoji: '🍓', color: 'from-lime-400 to-green-500',
    size: 'small', image: '/games/sweet-and-fruity-makeup.png',
    externalUrl: 'https://play.famobi.com/sweet-and-fruity-makeup',
  },
  {
    id: 'f22', title: 'TicToc Catwalk Fashion', category: 'girls',
    emoji: '👠', color: 'from-red-500 to-rose-700',
    size: 'tall', image: '/games/tictoc-catwalk-fashion.png',
    externalUrl: 'https://play.famobi.com/tictoc-catwalk-fashion',
  },
  {
    id: 'f23', title: 'TicToc Kpop Fashion', category: 'girls',
    emoji: '👗', color: 'from-slate-500 to-gray-700',
    size: 'wide', image: '/games/tictoc-kpop-fashion.png',
    externalUrl: 'https://play.famobi.com/tictoc-kpop-fashion',
  },
  {
    id: 'f24', title: 'Vero Life Dress Up', category: 'girls',
    emoji: '🎀', color: 'from-blue-500 to-indigo-600',
    size: 'medium', image: '/games/vero-life-dress-up-decor.png',
    externalUrl: 'https://play.famobi.com/vero-life-dress-up-decor',
  },
  {
    id: 'f25', title: 'Vortellas Dress Up', category: 'girls',
    emoji: '👗', color: 'from-cyan-400 to-teal-500',
    size: 'small', image: '/games/vortellas-dress-up.png',
    externalUrl: '/vortellas-dress-up/index-1.html',
  },
  {
    id: 'f26', title: 'Wedding Dress Up', category: 'girls',
    emoji: '👰', color: 'from-purple-500 to-fuchsia-600',
    size: 'small', image: '/games/wedding-dress-up.png',
    externalUrl: 'https://play.famobi.com/wedding-dress-up',
  },
  {
    id: 'f27', title: 'Wonder High Dressup', category: 'girls',
    emoji: '🏫', color: 'from-red-600 to-orange-700',
    size: 'medium', image: '/games/wonder-high-dressup.png',
    externalUrl: 'https://play.famobi.com/wonder-high-dressup',
  },
  {
    id: 'f28', title: 'My City Horse Stable', category: 'girls',
    emoji: '🐎', color: 'from-blue-600 to-cyan-700',
    size: 'wide', image: '/games/my-city-horse-stable.png',
    externalUrl: 'https://html5.gamedistribution.com/f9a1b3c7d5e84f2aac61e07b38d9b2a7/',
  },
  {
    id: 'f29', title: 'Decor Life', category: 'girls',
    emoji: '🛋️', color: 'from-pink-500 to-rose-600',
    size: 'small', image: '/games/decor-life.png',
    externalUrl: 'https://play.famobi.com/decor-life',
  },
  {
    id: 'f30', title: 'Cozy Room Design', category: 'girls',
    emoji: '🛏️', color: 'from-yellow-400 to-amber-500',
    size: 'small', image: '/games/cozy-room-design.png',
    externalUrl: 'https://play.famobi.com/cozy-room-design',
  },
  {
    id: 'f31', title: 'Anycolor', category: 'girls',
    emoji: '🎨', color: 'from-purple-400 to-fuchsia-500',
    size: 'small', image: '/games/anycolor.png',
    externalUrl: 'https://play.famobi.com/anycolor',
  },
  {
    id: 'f32', title: 'Diamond Makeup', category: 'girls',
    emoji: '💎', color: 'from-cyan-300 to-blue-500',
    size: 'medium', image: '/games/diamond-makeup.png',
    externalUrl: 'https://play.famobi.com/diamond-makeup',
  },
  {
    id: 'f33', title: 'Festival Vibes Makeup', category: 'girls',
    emoji: '✨', color: 'from-rose-400 to-pink-600',
    size: 'wide', image: '/games/festival-vibes-makeup.png',
    externalUrl: 'https://play.famobi.com/festival-vibes-makeup',
  },
  {
    id: 'f34', title: 'Hipster vs Rockers', category: 'girls',
    emoji: '🎸', color: 'from-slate-700 to-gray-900',
    size: 'tall', image: '/games/hipster-vs-rockers.png',
    externalUrl: 'https://play.famobi.com/hipster-vs-rockers',
  },
  {
    id: 'f35', title: 'Star Blogger', category: 'girls',
    emoji: '⭐', color: 'from-amber-400 to-orange-500',
    size: 'small', image: '/games/star-blogger-left-or-right.png',
    externalUrl: 'https://play.famobi.com/star-blogger-left-or-right',
  },
  {
    id: 'f36', title: 'Pizza Delivery', category: 'girls',
    emoji: '🛵', color: 'from-red-500 to-orange-600',
    size: 'medium', image: '/games/vortellis-pizza-delivery.png',
    externalUrl: 'https://play.famobi.com/vortellis-pizza-delivery',
  },
];

export const MARIA_GAMES_WITH_SOURCE: MariaGame[] = MARIA_GAMES;
