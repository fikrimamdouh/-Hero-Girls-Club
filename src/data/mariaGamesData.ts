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

// A massive list of 100+ games inspired by popular web games (Poki style)
export const MARIA_GAMES: MariaGame[] = [
  // Block 1: Popular / Hero Games
  { id: 'p1', title: 'صائدة الفواكه', category: 'arcade', emoji: '🍉', color: 'from-green-400 to-emerald-600', size: 'medium', route: '/games/fruit-catcher' },
  { id: 'p2', title: 'Subway Surfers', category: 'adventures', emoji: '🏃', color: 'from-blue-500 to-cyan-500', size: 'wide', image: '/games/subway-surfers.png' },
  { id: 'p3', title: 'Drift Boss', category: 'cars', emoji: '🏎️', color: 'from-orange-500 to-red-600', size: 'tall', image: '/games/drift-boss.png' },
  { id: 'p4', title: 'Stickman Hook', category: 'arcade', emoji: '🕸️', color: 'from-indigo-500 to-purple-600', size: 'small', image: '/games/stickman-hook.png' },
  { id: 'p4_2', title: 'Level Devil', category: 'arcade', emoji: '😈', color: 'from-indigo-500 to-purple-600', size: 'small' },
  { id: 'p5', title: 'Football Legends', category: 'sports', emoji: '⚽', color: 'from-green-600 to-emerald-800', size: 'medium', image: '/games/football-legends.png' },
  { id: 'p6', title: 'Monkey Mart', category: 'adventures', emoji: '🐒', color: 'from-amber-600 to-yellow-700', size: 'tall', image: '/games/monkey-mart.png' },
  { id: 'p7', title: 'Retro Bowl', category: 'sports', emoji: '🏈', color: 'from-green-400 to-emerald-500', size: 'wide', image: '/games/retro-bowl.png' },
  
  // Block 2: Girls & Dress up
  { id: 'g1', title: 'Beauty Salon', category: 'girls', emoji: '💅', color: 'from-pink-400 to-rose-500', size: 'medium', image: '/games/beauty-salon.png' },
  { id: 'g2', title: 'Vortelli\'s Pizza', category: 'girls', emoji: '🍕', color: 'from-orange-400 to-red-400', size: 'small', image: '/games/vortellis-pizza.png' },
  { id: 'g3', title: 'Anime Dress Up', category: 'girls', emoji: '👗', color: 'from-fuchsia-400 to-purple-500', size: 'tall', image: '/games/anime-dress-up.png' },
  { id: 'g4', title: 'Diva Hair Salon', category: 'girls', emoji: '💇‍♀️', color: 'from-sky-300 to-blue-400', size: 'small', image: '/games/diva-hair-salon.png' },
  { id: 'g5', title: 'Princess Lovely Fashion', category: 'girls', emoji: '👑', color: 'from-pink-200 to-rose-300', size: 'small', image: '/games/princess-lovely-fashion.png' },
  { id: 'g6', title: 'Diva Makeup Studio', category: 'girls', emoji: '💄', color: 'from-rose-400 to-pink-600', size: 'medium', image: '/games/diva-makeup-studio.png' },
  { id: 'g7', title: 'Jane\'s Fashion Studio', category: 'girls', emoji: '✂️', color: 'from-purple-400 to-fuchsia-500', size: 'wide', image: '/games/janes-fashion-studio.png' },
  { id: 'g8', title: 'Nails DIY', category: 'girls', emoji: '💅', color: 'from-teal-300 to-emerald-400', size: 'small', image: '/games/nails-diy-manicure-master.png' },

  // Block 3: Action & Arcade
  { id: 'a1', title: 'Sushi Party', category: 'arcade', emoji: '🍣', color: 'from-green-400 to-lime-500', size: 'medium', image: '/games/sushi-party-io.png' },
  { id: 'a2', title: 'Vectaria.io', category: 'action', emoji: '🚀', color: 'from-slate-700 to-slate-900', size: 'wide', image: '/games/vectaria-io.png' },
  { id: 'a3', title: 'Stickman Crazy Box', category: 'action', emoji: '🥷', color: 'from-gray-800 to-black', size: 'small', image: '/games/stickman-crazy-box.png' },
  { id: 'a4', title: 'Scary Teacher 3D', category: 'action', emoji: '🧟', color: 'from-emerald-700 to-green-900', size: 'tall', image: '/games/scary-teacher-3d.png' },
  { id: 'a5', title: 'Sweet Ball Sprint', category: 'arcade', emoji: '🦘', color: 'from-lime-400 to-green-500', size: 'small', image: '/games/sweet-ball-sprint.png' },
  { id: 'a6', title: 'Blocky Blast Puzzle', category: 'arcade', emoji: '🧱', color: 'from-red-500 to-orange-600', size: 'small', image: '/games/blocky-blast-puzzle.png' },
  { id: 'a7', title: 'Slice Master', category: 'arcade', emoji: '🔪', color: 'from-red-400 to-rose-600', size: 'medium', image: '/games/slice-master.png' },
  { id: 'a8', title: 'Capitalist Bus Driver', category: 'cars', emoji: '🚌', color: 'from-sky-500 to-blue-700', size: 'wide', image: '/games/capitalist-bus-driver.png' },
  { id: 'a9', title: 'Steal and Run', category: 'action', emoji: '🏃', color: 'from-orange-500 to-red-600', size: 'small', image: '/games/steal-and-run.png' },
  { id: 'a10', title: 'Cat Simulator', category: 'arcade', emoji: '🐱', color: 'from-cyan-400 to-blue-500', size: 'small', image: '/games/cat-simulator.png' },
  { id: 'f7', title: 'Brain Test', category: 'intelligence', emoji: '🧠', color: 'from-red-500 to-red-700', size: 'wide', image: '/games/brain-test-tricky-puzzles.png' },
  { id: 'f8', title: 'Draw My Path', category: 'adventures', emoji: '✏️', color: 'from-slate-600 to-gray-800', size: 'medium', image: '/games/draw-my-path-obby.png' },
  { id: 'f9', title: 'Minefun.io', category: 'arcade', emoji: '⛏️', color: 'from-amber-600 to-yellow-700', size: 'small', image: '/games/minefun-io.png' },
  { id: 'f10', title: 'Color Artist', category: 'arcade', emoji: '🎨', color: 'from-sky-300 to-blue-400', size: 'small', image: '/games/color-artist.png' },
  { id: 'f11', title: 'Drawing Contest', category: 'multiplayer', emoji: '✏️', color: 'from-purple-400 to-fuchsia-500', size: 'wide', image: '/games/drawing-contest.png' },
  { id: 'f12', title: 'Magic Coloring Book', category: 'girls', emoji: '🖍️', color: 'from-cyan-200 to-sky-300', size: 'small', image: '/games/magic-coloring-book.png' },
  { id: 'f13', title: 'My Perfect Hotel', category: 'arcade', emoji: '🏨', color: 'from-slate-400 to-gray-500', size: 'small', image: '/games/my-perfect-hotel.png' },
  { id: 'f14', title: 'My Cozy Home', category: 'girls', emoji: '🏠', color: 'from-green-500 to-emerald-600', size: 'medium', image: '/games/my-cozy-home.png' },
  { id: 'f15', title: 'Fashion Tour Simulator', category: 'girls', emoji: '👗', color: 'from-indigo-600 to-purple-800', size: 'tall', image: '/games/fashion-tour-simulator.png' },
  { id: 'f16', title: 'Funny Haircut', category: 'girls', emoji: '✂️', color: 'from-orange-500 to-red-600', size: 'small', image: '/games/funny-haircut.png' },
  { id: 'f17', title: 'Glam Girl Dress Up', category: 'girls', emoji: '👗', color: 'from-pink-300 to-rose-400', size: 'small', image: '/games/glam-girl-dress-up-and-makeover.png' },
  { id: 'f18', title: 'Kpop Concert Dress Up', category: 'girls', emoji: '🎤', color: 'from-amber-700 to-orange-900', size: 'wide', image: '/games/kpop-concert-dress-up.png' },
  { id: 'f19', title: 'Party Time', category: 'girls', emoji: '🎉', color: 'from-sky-200 to-blue-300', size: 'medium', image: '/games/party-time.png' },
  { id: 'f20', title: 'Summer Fashion Makeover', category: 'girls', emoji: '☀️', color: 'from-yellow-400 to-orange-500', size: 'small', image: '/games/summer-fashion-makeover.png' },
  { id: 'f21', title: 'Sweet & Fruity Makeup', category: 'girls', emoji: '🍓', color: 'from-lime-400 to-green-500', size: 'small', image: '/games/sweet-and-fruity-makeup.png' },
  { id: 'f22', title: 'TicToc Catwalk Fashion', category: 'girls', emoji: '👠', color: 'from-red-500 to-rose-700', size: 'tall', image: '/games/tictoc-catwalk-fashion.png' },
  { id: 'f23', title: 'TicToc Kpop Fashion', category: 'girls', emoji: '👗', color: 'from-slate-500 to-gray-700', size: 'wide', image: '/games/tictoc-kpop-fashion.png' },
  { id: 'f24', title: 'Vero Life Dress Up', category: 'girls', emoji: '🎀', color: 'from-blue-500 to-indigo-600', size: 'medium', image: '/games/vero-life-dress-up-decor.png' },
  { id: 'f25', title: 'Vortellas Dress Up', category: 'girls', emoji: '👗', color: 'from-cyan-400 to-teal-500', size: 'small', image: '/games/vortellas-dress-up.png' },
  { id: 'f26', title: 'Wedding Dress Up', category: 'girls', emoji: '👰', color: 'from-purple-500 to-fuchsia-600', size: 'small', image: '/games/wedding-dress-up.png' },
  { id: 'f27', title: 'Wonder High Dressup', category: 'girls', emoji: '🏫', color: 'from-red-600 to-orange-700', size: 'medium', image: '/games/wonder-high-dressup.png' },
  { id: 'f28', title: 'My City Horse Stable', category: 'girls', emoji: '🐎', color: 'from-blue-600 to-cyan-700', size: 'wide', image: '/games/my-city-horse-stable.png' },
  { id: 'f29', title: 'Decor Life', category: 'girls', emoji: '🛋️', color: 'from-pink-500 to-rose-600', size: 'small', image: '/games/decor-life.png' },
  { id: 'f30', title: 'Cozy Room Design', category: 'girls', emoji: '🛏️', color: 'from-yellow-400 to-amber-500', size: 'small', image: '/games/cozy-room-design.png' },
  { id: 'f31', title: 'Anycolor', category: 'girls', emoji: '🎨', color: 'from-purple-400 to-fuchsia-500', size: 'small', image: '/games/anycolor.png' },
  { id: 'f32', title: 'Diamond Makeup', category: 'girls', emoji: '💎', color: 'from-cyan-300 to-blue-500', size: 'medium', image: '/games/diamond-makeup.png' },
  { id: 'f33', title: 'Festival Vibes Makeup', category: 'girls', emoji: '✨', color: 'from-rose-400 to-pink-600', size: 'wide', image: '/games/festival-vibes-makeup.png' },
  { id: 'f34', title: 'Hipster vs Rockers', category: 'girls', emoji: '🎸', color: 'from-slate-700 to-gray-900', size: 'tall', image: '/games/hipster-vs-rockers.png' },
  { id: 'f35', title: 'Star Blogger', category: 'girls', emoji: '⭐', color: 'from-amber-400 to-orange-500', size: 'small', image: '/games/star-blogger-left-or-right.png' },
  { id: 'f36', title: 'Pizza Delivery', category: 'girls', emoji: '🛵', color: 'from-red-500 to-orange-600', size: 'medium', image: '/games/vortellis-pizza-delivery.png' },
];

const POKI_EXTERNAL_URLS: Partial<Record<MariaGame['id'], string>> = {
  p2: 'https://poki.com/en/g/fireboy-and-watergirl-1-forest-temple',
  p4: 'https://poki.com/ar/g/level-devil',
  p6: 'https://poki.com/en/g/temple-run-2',
  p7: 'https://poki.com/en/g/head-soccer-2023',
  a1: 'https://poki.com/en/g/slither-io',
  a6: 'https://poki.com/en/g/idle-breakout',
  c1: 'https://poki.com/en/g/madalin-stunt-cars-2',
  s3: 'https://poki.com/en/g/8-ball-billiards-classic',
  i1: 'https://poki.com/en/g/2048',
  i2: 'https://poki.com/en/g/master-chess',
  m1: 'https://poki.com/en/g/slither-io',
  m5: 'https://poki.com/en/g/squid-game-online',
  f25: '/vortellas-dress-up/index-1.html',
  f26: 'https://poki.com/en/g/classic-bowling',
  f31: 'https://poki.com/en/g/anycolor',
  f32: 'https://poki.com/en/g/diamond-makeup',
  f33: 'https://poki.com/en/g/festival-vibes-makeup',
  f34: 'https://poki.com/en/g/hipster-vs-rockers',
  f35: 'https://poki.com/en/g/star-blogger-left-or-right',
  f36: 'https://poki.com/en/g/vortellis-pizza-delivery',
};

export const MARIA_GAMES_WITH_SOURCE: MariaGame[] = MARIA_GAMES.map((game) => ({
  ...game,
  externalUrl: POKI_EXTERNAL_URLS[game.id],
}));