export type MariaGameCategory = 'all' | 'girls' | 'puzzles' | 'cars' | 'educational' | 'adventures' | 'intelligence' | 'action' | 'sports' | 'multiplayer' | 'arcade' | 'drawing';
export type GameSection = 'maria' | 'arcade' | 'drawing';

export interface MariaGame {
  id: string;
  title: string;
  category: MariaGameCategory;
  thumb: string;
  route: string;
  featured?: boolean;
  section: GameSection;
  /** If set, route is treated as an external URL opened in a new tab */
  external?: boolean;
}

export const MARIA_CATEGORIES: { id: MariaGameCategory; label: string; icon: string }[] = [
  { id: 'all',          label: 'الرئيسية',   icon: '🏠' },
  { id: 'drawing',      label: 'رسم وتلوين',  icon: '🎨' },
  { id: 'action',       label: 'أكشن',       icon: '⚡' },
  { id: 'adventures',   label: 'مغامرات',    icon: '🗺️' },
  { id: 'cars',         label: 'سيارات',     icon: '🏎️' },
  { id: 'sports',       label: 'رياضة',      icon: '⚽' },
  { id: 'girls',        label: 'بنات',       icon: '🎀' },
  { id: 'puzzles',      label: 'ألغاز',      icon: '🧩' },
  { id: 'intelligence', label: 'ذكاء',       icon: '🧠' },
  { id: 'multiplayer',  label: 'لعب جماعي',  icon: '👥' },
  { id: 'arcade',       label: 'أركيد',      icon: '🕹️' },
  { id: 'educational',  label: 'تعليمية',    icon: '📚' },
];

export const MARIA_GAMES_WITH_SOURCE: MariaGame[] = [
  // ─── ألعاب ماريا الشقية (بنات + إبداع + ذكاء ناعم) ───
  { id: 'dress-up',     title: 'لبيس البنات',          category: 'girls',        thumb: '/games/thumbs/dress-up.jpg',     route: '/games/dress-up',     section: 'maria', featured: true  },
  { id: 'coloring',     title: 'استوديو التلوين',       category: 'drawing',      thumb: '/games/thumbs/coloring.png',     route: '/coloring',           section: 'drawing', featured: true  },
  { id: 'memory',       title: 'لعبة الذاكرة',         category: 'intelligence', thumb: '/games/thumbs/memory.png',       route: '/games/memory',       section: 'maria' },
  { id: 'words',        title: 'الكلمات المبعثرة',     category: 'educational',  thumb: '/games/thumbs/words.png',        route: '/games/words',        section: 'maria' },
  { id: 'math-hero',    title: 'بطلة الحساب',          category: 'educational',  thumb: '/games/thumbs/factors.jpg',      route: '/games/math-hero',    section: 'maria', featured: true },
  { id: 'piano',        title: 'بيانو البطلات',         category: 'educational',  thumb: '/games/thumbs/piano.jpg',        route: '/games/piano',        section: 'maria', featured: true },
  { id: 'color-mix',    title: 'معمل الألوان',          category: 'drawing',      thumb: '/games/thumbs/coloring.png',     route: '/games/color-mix',    section: 'maria', featured: true },
  { id: 'animal-quiz',  title: 'عالم الحيوانات',        category: 'educational',  thumb: '/games/thumbs/animals.jpg',      route: '/games/animal-quiz',  section: 'maria', featured: true },
  { id: 'simon',        title: 'سيمون يقول',           category: 'intelligence', thumb: '/games/thumbs/simon.png',        route: '/games/simon',        section: 'maria' },
  { id: 'tictactoe',    title: 'إكس أو',              category: 'intelligence', thumb: '/games/thumbs/tictactoe.png',    route: '/games/tictactoe',    section: 'maria' },
  { id: 'fruit-catcher',title: 'صائدة الفواكه',        category: 'arcade',       thumb: '/games/thumbs/fruit-catcher.png',route: '/games/fruit-catcher',section: 'maria' },
  { id: 'catch',        title: 'صيد النجوم',           category: 'arcade',       thumb: '/games/thumbs/catch.png',        route: '/games/catch',        section: 'maria' },
  { id: '2048',         title: 'لعبة 2048',            category: 'intelligence', thumb: '/games/thumbs/2048.jpg',         route: '/games/2048',         section: 'maria', featured: true  },
  { id: 'flappy',       title: 'الطائر الرشيق',       category: 'arcade',       thumb: '/games/thumbs/flappy.jpg',       route: '/games/flappy',       section: 'maria' },
  { id: 'petmaker',     title: 'صانع الحيوانات',       category: 'girls',        thumb: '/games/thumbs/dress-up.jpg',     route: '/games/petmaker',     section: 'maria' },
  { id: 'hextris',      title: 'هيكستريس',              category: 'puzzles',      thumb: '/games/thumbs/hextris.jpg',      route: '/games/hextris',      section: 'maria' },
  { id: 'sudoku',       title: 'سودوكو',                category: 'intelligence', thumb: '/games/thumbs/sudoku.jpg',       route: '/games/sudoku',       section: 'maria' },
  { id: 'factors',      title: 'لعبة الأرقام',          category: 'educational',  thumb: '/games/thumbs/factors.jpg',      route: '/games/factors',      section: 'maria', featured: true },
  { id: 'pacman',       title: 'باك مان',               category: 'arcade',       thumb: '/games/thumbs/pacman.jpg',       route: '/games/pacman',       section: 'maria', featured: true },
  { id: 'match3',       title: 'ماتش 3',                 category: 'puzzles',      thumb: '/games/thumbs/match3.jpg',       route: '/games/match3',       section: 'maria', featured: true },
  { id: 'bubble',       title: 'قاذفة الفقاعات',         category: 'arcade',       thumb: '/games/thumbs/bubble.jpg',       route: '/games/bubble',       section: 'maria' },
  { id: 'hangman',      title: 'خمّني الكلمة',            category: 'educational',  thumb: '/games/thumbs/hangman.jpg',      route: '/games/hangman',      section: 'maria' },
  { id: 'tower',        title: 'بناء البرج',             category: 'intelligence', thumb: '/games/thumbs/tower.jpg',        route: '/games/tower',        section: 'maria', featured: true },
  { id: 'connect4',     title: 'وصل أربعة',              category: 'intelligence', thumb: '/games/thumbs/connect4.jpg',     route: '/games/connect4',     section: 'maria' },
  { id: 'catcat',       title: 'امسكي القطة',            category: 'puzzles',      thumb: '/games/thumbs/catcat.jpg',       route: '/games/catcat',       section: 'maria', featured: true },
  { id: 'chess',        title: 'الشطرنج',                category: 'intelligence', thumb: '/games/thumbs/chess.jpg',        route: '/games/chess',        section: 'maria' },
  { id: 'darkroom',     title: 'غرفة المغامرة',          category: 'educational',  thumb: '/games/thumbs/darkroom.jpg',     route: '/games/darkroom',     section: 'maria' },
  { id: 'linkup',       title: 'وصلة الصور',             category: 'puzzles',      thumb: '/games/thumbs/linkup.jpg',       route: '/games/linkup',       section: 'maria', featured: true },
  { id: 'guessword',    title: 'خمّني كلمتي',             category: 'educational',  thumb: '/games/thumbs/guessword.jpg',    route: '/games/guessword',    section: 'maria' },
  { id: 'wordsearch',   title: 'ابحثي عن الكلمات',       category: 'educational',  thumb: '/games/thumbs/wordsearch.jpg',   route: '/games/wordsearch',   section: 'maria' },
  { id: 'wordpluck',    title: 'اكتبي بسرعة',            category: 'educational',  thumb: '/games/thumbs/wordpluck.jpg',    route: '/games/wordpluck',    section: 'maria' },
  { id: 'memory2',      title: 'ذاكرة ماريو',            category: 'puzzles',      thumb: '/games/thumbs/memory2.jpg',      route: '/games/memory2',      section: 'maria', featured: true },
  { id: 'memcards',     title: 'بطاقات الفواكه',         category: 'puzzles',      thumb: '/games/thumbs/memcards.jpg',     route: '/games/memcards',     section: 'maria' },
  { id: 'piano',        title: 'بيانو الكتابة',          category: 'educational',  thumb: '/games/thumbs/piano.jpg',        route: '/games/piano',        section: 'maria', featured: true },
  { id: 'island',       title: 'الجزيرة المفقودة',       category: 'adventures',   thumb: '/games/thumbs/island.jpg',       route: '/games/island',       section: 'maria' },
  { id: 'shenzhen',     title: 'سوليتير الأرقام',        category: 'intelligence', thumb: '/games/thumbs/shenzhen.jpg',     route: '/games/shenzhen',     section: 'maria' },
  { id: 'kaboom',       title: 'كنس الألغام',            category: 'intelligence', thumb: '/games/thumbs/kaboom.jpg',       route: '/games/kaboom',       section: 'maria' },
  { id: 'emojimine',    title: 'ألغام الإيموجي',          category: 'intelligence', thumb: '/games/thumbs/emojimine.jpg',    route: '/games/emojimine',    section: 'maria' },
  { id: 'tictactoe2',   title: 'إكس أو الذكي',           category: 'intelligence', thumb: '/games/thumbs/tictactoe.jpg',    route: '/games/tictactoe2',   section: 'maria', featured: true },

  // ─── مركز الألعاب (أكشن + مهارة + كلاسيكية) ───
  { id: 'snake',        title: 'الثعبان الجائع',      category: 'arcade',       thumb: '/games/thumbs/snake.jpg',        route: '/games/snake',        section: 'arcade', featured: true  },
  { id: 'tetris',       title: 'تتريس',                category: 'puzzles',      thumb: '/games/thumbs/tetris.jpg',       route: '/games/tetris',       section: 'arcade', featured: true  },
  { id: 'breakout',     title: 'تكسير الطوب',          category: 'arcade',       thumb: '/games/thumbs/breakout.jpg',     route: '/games/breakout',     section: 'arcade' },
  { id: 'whack',        title: 'اضرب الخلد!',          category: 'arcade',       thumb: '/games/thumbs/whack.jpg',        route: '/games/whack',        section: 'arcade' },
  { id: 'shooter',      title: 'الطائرة المقاتلة',     category: 'action',       thumb: '/games/thumbs/shooter.jpg',      route: '/games/shooter',      section: 'arcade', featured: true  },
  { id: 'minesweeper',  title: 'كاشفة الألغام',         category: 'puzzles',      thumb: '/games/thumbs/minesweeper.jpg',  route: '/games/minesweeper',  section: 'arcade' },
  { id: 'platformer',   title: 'مغامرة البطلة',        category: 'adventures',   thumb: '/games/thumbs/platformer.jpg',   route: '/games/platformer',   section: 'arcade', featured: true  },
  { id: 'racer',        title: 'سباق السيارات',         category: 'cars',         thumb: '/games/thumbs/racer.jpg',        route: '/games/racer',        section: 'arcade', featured: true  },
  { id: 'pong',         title: 'بينج بونج',            category: 'multiplayer',  thumb: '/games/thumbs/pong.jpg',         route: '/games/pong',         section: 'arcade' },
  { id: 'trex',         title: 'ركض الديناصور',        category: 'arcade',       thumb: '/games/thumbs/trex.jpg',         route: '/games/trex',         section: 'arcade', featured: true },
  { id: 'alien',        title: 'غزو الفضائيين',        category: 'action',       thumb: '/games/thumbs/alien.jpg',        route: '/games/alien',        section: 'arcade', featured: true },
  { id: 'nshaft',       title: 'السقوط الحر',          category: 'arcade',       thumb: '/games/thumbs/nshaft.jpg',       route: '/games/nshaft',       section: 'arcade' },
  { id: 'asteroids',    title: 'حرب النيازك',          category: 'action',       thumb: '/games/thumbs/asteroids.jpg',    route: '/games/asteroids',    section: 'arcade' },
  { id: 'blockit',      title: 'اصطد الكرة',            category: 'puzzles',      thumb: '/games/thumbs/blockit.jpg',      route: '/games/blockit',      section: 'arcade' },
  { id: 'runner',       title: 'عداءة كاندي',          category: 'action',       thumb: '/games/thumbs/runner.jpg',       route: '/games/runner',       section: 'arcade', featured: true },
  { id: 'invaders',     title: 'غزاة الفضاء',          category: 'action',       thumb: '/games/thumbs/invaders.jpg',     route: '/games/invaders',     section: 'arcade' },
  { id: 'coil',         title: 'احصري الكرات',         category: 'puzzles',      thumb: '/games/thumbs/coil.jpg',         route: '/games/coil',         section: 'arcade' },
  { id: 'kurve',        title: 'خط البقاء',            category: 'multiplayer',  thumb: '/games/thumbs/kurve.jpg',        route: '/games/kurve',        section: 'arcade' },
  { id: 'blockrain',    title: 'مطر القوالب',          category: 'arcade',       thumb: '/games/thumbs/blockrain.jpg',    route: '/games/blockrain',    section: 'arcade' },
  { id: 'tinyplat',     title: 'منصات صغيرة',          category: 'adventures',   thumb: '/games/thumbs/tinyplat.jpg',     route: '/games/tinyplat',     section: 'arcade', featured: true },
  { id: 'clumsy',       title: 'النحلة الأخرق',         category: 'arcade',       thumb: '/games/thumbs/clumsy.jpg',       route: '/games/clumsy',       section: 'arcade', featured: true },
  { id: 'blackhole',    title: 'الثقب الأسود',           category: 'puzzles',      thumb: '/games/thumbs/blackhole.jpg',    route: '/games/blackhole',    section: 'arcade' },
  { id: 'bullethell',   title: 'مطر الرصاص',            category: 'action',       thumb: '/games/thumbs/bullethell.jpg',   route: '/games/bullethell',   section: 'arcade', featured: true },
  { id: 'pacman2',      title: 'باك مان كلاسيك',         category: 'arcade',       thumb: '/games/thumbs/pacman2.jpg',      route: '/games/pacman2',      section: 'arcade' },
  { id: 'blastar',      title: 'بلاستار',                category: 'action',       thumb: '/games/thumbs/blastar.jpg',      route: '/games/blastar',      section: 'arcade' },
  { id: 'radius',       title: 'غارة الدائرة',           category: 'action',       thumb: '/games/thumbs/radius.jpg',       route: '/games/radius',       section: 'arcade', featured: true },
  { id: 'citius',       title: 'غزاة الجينات',           category: 'arcade',       thumb: '/games/thumbs/citius.jpg',       route: '/games/citius',       section: 'arcade' },
  { id: 'elematter',    title: 'دفاع البرج',             category: 'intelligence', thumb: '/games/thumbs/elematter.jpg',    route: '/games/elematter',    section: 'arcade', featured: true },
  { id: 'spacepi',      title: 'فطيرة الفضاء',           category: 'action',       thumb: '/games/thumbs/spacepi.jpg',      route: '/games/spacepi',      section: 'arcade' },
  { id: 'diablo',       title: 'قلعة المغامرة',          category: 'adventures',   thumb: '/games/thumbs/diablo.jpg',       route: '/games/diablo',       section: 'arcade', featured: true },
  { id: 'duckhunt',     title: 'صيد البط',               category: 'arcade',       thumb: '/games/thumbs/duckhunt.jpg',     route: '/games/duckhunt',     section: 'arcade' },
  { id: 'towerbuild',   title: 'ابني البرج',              category: 'arcade',       thumb: '/games/thumbs/towerbuild.jpg',   route: '/games/towerbuild',   section: 'arcade', featured: true },
  { id: 'spaceinv',     title: 'غزاة الفضاء',            category: 'arcade',       thumb: '/games/thumbs/spaceinv.jpg',     route: '/games/spaceinv',     section: 'arcade' },
  { id: 'g2048',        title: '٢٠٤٨ الأرقام',           category: 'intelligence', thumb: '/games/thumbs/g2048.jpg',        route: '/games/g2048',        section: 'maria', featured: true },
  { id: 'doodle',       title: 'كريكيت الرسومات',        category: 'sports',       thumb: '/games/thumbs/doodle.jpg',       route: '/games/doodle',       section: 'maria' },
  { id: 'atree',        title: 'شجرة الفنون',            category: 'drawing',      thumb: '/games/thumbs/atree.jpg',        route: '/games/atree',        section: 'drawing' },
  { id: 'racer2',       title: 'سباق السرعة',            category: 'cars',         thumb: '/games/thumbs/racer2.jpg',       route: '/games/racer2',       section: 'arcade', featured: true },
  { id: 'jpong',        title: 'بونغ الكلاسيكي',         category: 'arcade',       thumb: '/games/thumbs/jpong.jpg',        route: '/games/jpong',        section: 'arcade' },
  { id: 'origsnake',    title: 'الثعبان الأصلي',         category: 'arcade',       thumb: '/games/thumbs/origsnake.jpg',    route: '/games/origsnake',    section: 'arcade' },
  { id: 'alien2',       title: 'غزو الفضائيين',          category: 'action',       thumb: '/games/thumbs/alien2.jpg',       route: '/games/alien2',       section: 'arcade' },
  { id: 'tetris3',      title: 'تتريس الكلاسيكي',        category: 'puzzles',      thumb: '/games/thumbs/tetris3.jpg',      route: '/games/tetris3',      section: 'maria' },
  { id: 'snake3',       title: 'الثعبان البسيط',         category: 'arcade',       thumb: '/games/thumbs/snake3.jpg',       route: '/games/snake3',       section: 'maria' },
  { id: 'jkp',          title: 'حجرة ورقة مقص',          category: 'intelligence', thumb: '/games/thumbs/jkp.jpg',          route: '/games/jkp',          section: 'maria' },
  { id: 'canvgame',     title: 'صائدة الغوبلين',         category: 'adventures',   thumb: '/games/thumbs/canvgame.jpg',     route: '/games/canvgame',     section: 'maria', featured: true },
  { id: 'aimshoot',     title: 'صوّبي ودمّري',           category: 'action',       thumb: '/games/thumbs/aimshoot.jpg',     route: '/games/aimshoot',     section: 'arcade' },
  { id: 'spinv2',       title: 'غزاة الفضاء الكلاسيكي',  category: 'arcade',       thumb: '/games/thumbs/spinv2.jpg',       route: '/games/spinv2',       section: 'arcade' },
  { id: 'ainv',         title: 'هجوم الفضائيين',           category: 'action',       thumb: '/games/thumbs/ainv.jpg',         route: '/games/ainv',         section: 'arcade' },
  { id: 'itower',       title: 'برج الذكاء',              category: 'intelligence', thumb: '/games/thumbs/itower.jpg',       route: '/games/itower',       section: 'arcade' },
  { id: 'ctet',         title: 'تتريس الكلاسيكي 2',       category: 'puzzles',      thumb: '/games/thumbs/ctet.jpg',         route: '/games/ctet',         section: 'maria' },
  { id: 'slots',        title: 'سلوتس الحظ',              category: 'arcade',       thumb: '/games/thumbs/slots.jpg',        route: '/games/slots',        section: 'arcade' },
  { id: 'fbjs',         title: 'الطائر السريع',           category: 'arcade',       thumb: '/games/thumbs/fbjs.jpg',         route: '/games/fbjs',         section: 'arcade' },
  { id: 'hearts',       title: 'لعبة القلوب',             category: 'multiplayer',  thumb: '/games/thumbs/hearts.jpg',       route: '/games/hearts',       section: 'maria' },
  { id: 'boulder',      title: 'مغامرة الكهف',            category: 'adventures',   thumb: '/games/thumbs/boulder.jpg',      route: '/games/boulder',      section: 'arcade', featured: true },
  { id: 'towerplat',    title: 'برج المنصات',             category: 'adventures',   thumb: '/games/thumbs/towerplat.jpg',    route: '/games/towerplat',    section: 'arcade' },
  { id: 'fifteen',      title: 'لغز الـ 15',               category: 'puzzles',      thumb: '/games/thumbs/fifteen.jpg',      route: '/games/fifteen',      section: 'maria' },
  { id: 'mssudoku',     title: 'سودوكو HTML5',            category: 'intelligence', thumb: '/games/thumbs/mssudoku.jpg',     route: '/games/mssudoku',     section: 'maria' },
  { id: 'lwsearch',     title: 'بحث الكلمات',             category: 'educational',  thumb: '/games/thumbs/lwsearch.jpg',     route: '/games/lwsearch',     section: 'maria' },
  { id: 'pmem',         title: 'ذاكرة البطاقات',          category: 'puzzles',      thumb: '/games/thumbs/pmem.jpg',         route: '/games/pmem',         section: 'maria' },
  { id: 'hwordle',      title: 'وردل بسيط',                category: 'educational',  thumb: '/games/thumbs/hwordle.jpg',      route: '/games/hwordle',      section: 'maria' },
  { id: 'smem',         title: 'ذاكرة النجوم',            category: 'puzzles',      thumb: '/games/thumbs/smem.jpg',         route: '/games/smem',         section: 'maria' },
  { id: 'k2048',        title: '2048 الكلاسيكي',          category: 'intelligence', thumb: '/games/thumbs/k2048.jpg',        route: '/games/k2048',        section: 'maria', featured: true },
  { id: 'kc4',          title: 'وصل 4 سريع',              category: 'multiplayer',  thumb: '/games/thumbs/kc4.jpg',          route: '/games/kc4',          section: 'maria' },
  { id: 'kfrog',        title: 'مختبر السرعة',            category: 'arcade',       thumb: '/games/thumbs/kfrog.jpg',        route: '/games/kfrog',        section: 'arcade' },
  { id: 'kwhack',       title: 'اضربي الفأر',             category: 'arcade',       thumb: '/games/thumbs/kwhack.jpg',       route: '/games/kwhack',       section: 'arcade' },
  { id: 'ksinv',        title: 'دفاع الفضاء',             category: 'action',       thumb: '/games/thumbs/ksinv.jpg',        route: '/games/ksinv',        section: 'arcade' },
  { id: 'harmony',      title: 'هارموني للرسم',           category: 'drawing',      thumb: '/games/thumbs/harmony.jpg',      route: '/games/harmony',      section: 'drawing', featured: true },
  { id: 'mdraw',        title: 'استوديو الفن SVG',         category: 'drawing',      thumb: '/games/thumbs/mdraw.jpg',        route: '/games/mdraw',        section: 'drawing', featured: true },
  { id: 'sigpad',       title: 'لوحة التوقيع',             category: 'drawing',      thumb: '/games/thumbs/sigpad.jpg',       route: '/games/sigpad',       section: 'drawing' },
  { id: 'mpaint',       title: 'استوديو miniPaint الاحترافي', category: 'drawing',   thumb: '/games/thumbs/mpaint.jpg',       route: '/games/mpaint',       section: 'drawing', featured: true },
  { id: 'jspaint',      title: 'الرسام الكلاسيكي',           category: 'drawing',    thumb: '/games/thumbs/jspaint.jpg',      route: '/games/jspaint',      section: 'drawing', featured: true },
];

// ─── ألعاب بنات إضافية (روابط خارجية مأمونة من famobi/y8/poki) ───
const ext = (url: string): { route: string; external: boolean } => ({ route: url, external: true });

const EXTERNAL_GIRLS_GAMES: MariaGame[] = [
  { id: 'anime-dress-up',           title: 'تلبيس الأنمي',                category: 'girls',   thumb: '/games/anime-dress-up.png',           ...ext('https://www.crazygames.com/embed/anime-dress-up'),                section: 'maria', featured: true },
  { id: 'beauty-salon',              title: 'صالون التجميل',                category: 'girls',   thumb: '/games/beauty-salon.png',              ...ext('https://www.crazygames.com/embed/beauty-salon'),                  section: 'maria' },
  { id: 'diva-makeup-studio',        title: 'استوديو ميكب ديفا',            category: 'girls',   thumb: '/games/diva-makeup-studio.png',        ...ext('https://www.crazygames.com/embed/diva-makeup-studio'),            section: 'maria', featured: true },
  { id: 'diva-hair-salon',           title: 'صالون شعر ديفا',                category: 'girls',   thumb: '/games/diva-hair-salon.png',           ...ext('https://www.crazygames.com/embed/diva-hair-salon'),                section: 'maria' },
  { id: 'diamond-makeup',            title: 'ميكب الألماس',                  category: 'girls',   thumb: '/games/diamond-makeup.png',            ...ext('https://www.crazygames.com/embed/diamond-makeup'),                 section: 'maria' },
  { id: 'wedding-dress-up',          title: 'تلبيس فستان العرس',             category: 'girls',   thumb: '/games/wedding-dress-up.png',          ...ext('https://www.crazygames.com/embed/wedding-dress-up'),               section: 'maria', featured: true },
  { id: 'princess-lovely-fashion',   title: 'موضة الأميرة',                  category: 'girls',   thumb: '/games/princess-lovely-fashion.png',   ...ext('https://www.crazygames.com/embed/princess-lovely-fashion'),        section: 'maria' },
  { id: 'glam-girl-dress-up',        title: 'تلبيس البنت الجلام',             category: 'girls',   thumb: '/games/glam-girl-dress-up-and-makeover.png', ...ext('https://www.crazygames.com/embed/glam-girl-dress-up-and-makeover'), section: 'maria' },
  { id: 'wonder-high-dressup',       title: 'تلبيس مدرسة العجائب',           category: 'girls',   thumb: '/games/wonder-high-dressup.png',       ...ext('https://www.crazygames.com/embed/wonder-high-dressup'),            section: 'maria' },
  { id: 'kpop-concert-dress-up',     title: 'تلبيس حفلة الكيبوب',             category: 'girls',   thumb: '/games/kpop-concert-dress-up.png',     ...ext('https://www.crazygames.com/embed/kpop-concert-dress-up'),          section: 'maria' },
  { id: 'tictoc-catwalk-fashion',    title: 'موضة تيك توك',                   category: 'girls',   thumb: '/games/tictoc-catwalk-fashion.png',    ...ext('https://www.crazygames.com/embed/tictoc-catwalk-fashion'),         section: 'maria' },
  { id: 'tictoc-kpop-fashion',       title: 'موضة كيبوب تيك توك',             category: 'girls',   thumb: '/games/tictoc-kpop-fashion.png',       ...ext('https://www.crazygames.com/embed/tictoc-kpop-fashion'),            section: 'maria' },
  { id: 'janes-fashion-studio',      title: 'استوديو جين للأزياء',            category: 'girls',   thumb: '/games/janes-fashion-studio.png',      ...ext('https://www.crazygames.com/embed/janes-fashion-studio'),           section: 'maria' },
  { id: 'fashion-tour-simulator',    title: 'محاكي جولة الموضة',              category: 'girls',   thumb: '/games/fashion-tour-simulator.png',    ...ext('https://www.crazygames.com/embed/fashion-tour-simulator'),         section: 'maria' },
  { id: 'summer-fashion-makeover',   title: 'موضة الصيف',                     category: 'girls',   thumb: '/games/summer-fashion-makeover.png',   ...ext('https://www.crazygames.com/embed/summer-fashion-makeover'),        section: 'maria' },
  { id: 'festival-vibes-makeup',     title: 'ميكب أجواء المهرجان',             category: 'girls',   thumb: '/games/festival-vibes-makeup.png',     ...ext('https://www.crazygames.com/embed/festival-vibes-makeup'),          section: 'maria' },
  { id: 'sweet-and-fruity-makeup',   title: 'ميكب الفواكه الحلوة',             category: 'girls',   thumb: '/games/sweet-and-fruity-makeup.png',   ...ext('https://www.crazygames.com/embed/sweet-and-fruity-makeup'),        section: 'maria' },
  { id: 'star-blogger-left-or-right',title: 'مدوّنة النجوم',                   category: 'girls',   thumb: '/games/star-blogger-left-or-right.png',...ext('https://www.crazygames.com/embed/star-blogger-left-or-right'),      section: 'maria' },
  { id: 'nails-diy-manicure-master', title: 'مانيكير الأظافر',                 category: 'girls',   thumb: '/games/nails-diy-manicure-master.png', ...ext('https://www.crazygames.com/embed/nails-diy-manicure-master'),      section: 'maria' },
  { id: 'funny-haircut',             title: 'قصة شعر مضحكة',                  category: 'girls',   thumb: '/games/funny-haircut.png',             ...ext('https://www.crazygames.com/embed/funny-haircut'),                  section: 'maria' },
  { id: 'hipster-vs-rockers',        title: 'هيبستر ضد روكرز',                 category: 'girls',   thumb: '/games/hipster-vs-rockers.png',        ...ext('https://www.crazygames.com/embed/hipster-vs-rockers'),             section: 'maria' },
  { id: 'vortellas-dress-up',        title: 'تلبيس فورتيلا',                   category: 'girls',   thumb: '/games/vortellas-dress-up.png',        ...ext('https://www.crazygames.com/embed/vortellas-dress-up'),             section: 'maria' },

  // ─── ديكور / محاكاة حياة (بنات + إبداع) ───
  { id: 'cozy-room-design',          title: 'تصميم غرفة دافئة',               category: 'girls',   thumb: '/games/cozy-room-design.png',          ...ext('https://www.crazygames.com/embed/cozy-room-design'),               section: 'maria', featured: true },
  { id: 'my-cozy-home',               title: 'بيتي الدافئ',                     category: 'girls',   thumb: '/games/my-cozy-home.png',              ...ext('https://www.crazygames.com/embed/my-cozy-home'),                   section: 'maria' },
  { id: 'decor-life',                 title: 'حياة الديكور',                    category: 'girls',   thumb: '/games/decor-life.png',                ...ext('https://www.crazygames.com/embed/decor-life'),                     section: 'maria' },
  { id: 'vero-life-dress-up-decor',   title: 'فيرو لايف ديكور وتلبيس',          category: 'girls',   thumb: '/games/vero-life-dress-up-decor.png',  ...ext('https://www.crazygames.com/embed/vero-life-dress-up-decor'),       section: 'maria' },
  { id: 'my-city-horse-stable',       title: 'إسطبل خيول مدينتي',              category: 'girls',   thumb: '/games/my-city-horse-stable.png',      ...ext('https://www.crazygames.com/embed/my-city-horse-stable'),           section: 'maria' },
  { id: 'cat-simulator',              title: 'محاكي القطة',                     category: 'girls',   thumb: '/games/cat-simulator.png',             ...ext('https://www.crazygames.com/embed/cat-simulator'),                  section: 'maria' },
  { id: 'my-perfect-hotel',           title: 'فندقي المثالي',                   category: 'adventures', thumb: '/games/my-perfect-hotel.png',       ...ext('https://www.crazygames.com/embed/my-perfect-hotel'),               section: 'arcade', featured: true },
  { id: 'monkey-mart',                title: 'سوبرماركت القرد',                 category: 'adventures', thumb: '/games/monkey-mart.png',            ...ext('https://www.crazygames.com/embed/monkey-mart'),                    section: 'arcade', featured: true },
  { id: 'party-time',                 title: 'وقت الحفلة',                      category: 'girls',   thumb: '/games/party-time.png',                ...ext('https://www.crazygames.com/embed/party-time'),                     section: 'maria' },

  // ─── إبداع / تلوين ───
  { id: 'magic-coloring-book',        title: 'كتاب التلوين السحري',             category: 'drawing', thumb: '/games/magic-coloring-book.png',       ...ext('https://www.crazygames.com/embed/magic-coloring-book'),            section: 'drawing', featured: true },
  { id: 'color-artist',               title: 'فنّانة الألوان',                  category: 'drawing', thumb: '/games/color-artist.png',              ...ext('https://www.crazygames.com/embed/color-artist'),                   section: 'drawing' },
  { id: 'anycolor',                   title: 'أي لون - ابدعي',                  category: 'drawing', thumb: '/games/anycolor.png',                  ...ext('https://www.crazygames.com/embed/anycolor'),                       section: 'drawing' },
  { id: 'drawing-contest',            title: 'مسابقة الرسم',                    category: 'drawing', thumb: '/games/drawing-contest.png',           ...ext('https://www.crazygames.com/embed/drawing-contest'),                section: 'drawing' },
  { id: 'draw-my-path-obby',          title: 'ارسمي طريقك',                     category: 'puzzles', thumb: '/games/draw-my-path-obby.png',         ...ext('https://www.crazygames.com/embed/draw-my-path-obby'),              section: 'maria' },

  // ─── ألغاز / ذكاء ───
  { id: 'brain-test-tricky-puzzles',  title: 'اختبار الذكاء',                   category: 'puzzles', thumb: '/games/brain-test-tricky-puzzles.png', ...ext('https://www.crazygames.com/embed/brain-test-tricky-puzzles'),      section: 'maria', featured: true },
  { id: 'blocky-blast-puzzle',        title: 'لغز القوالب المنفجرة',             category: 'puzzles', thumb: '/games/blocky-blast-puzzle.png',       ...ext('https://www.crazygames.com/embed/blocky-blast-puzzle'),            section: 'maria' },
  { id: 'minefun-io',                 title: 'حقول الألغام أونلاين',             category: 'puzzles', thumb: '/games/minefun-io.png',                ...ext('https://www.crazygames.com/embed/minefun-io'),                     section: 'maria' },
  { id: 'slice-master',               title: 'سيد التقطيع',                     category: 'puzzles', thumb: '/games/slice-master.png',              ...ext('https://www.crazygames.com/embed/slice-master'),                   section: 'arcade' },
  { id: 'sweet-ball-sprint',          title: 'سباق الكرة الحلوة',                category: 'arcade',  thumb: '/games/sweet-ball-sprint.png',         ...ext('https://www.crazygames.com/embed/sweet-ball-sprint'),              section: 'arcade' },

  // ─── رياضة / سباقات ───
  { id: 'football-legends',           title: 'أساطير كرة القدم',                 category: 'sports',  thumb: '/games/football-legends.png',          ...ext('https://www.crazygames.com/embed/football-legends'),               section: 'arcade', featured: true },
  { id: 'retro-bowl',                 title: 'ريترو بول',                       category: 'sports',  thumb: '/games/retro-bowl.png',                ...ext('https://www.crazygames.com/embed/retro-bowl'),                     section: 'arcade' },
  { id: 'drift-boss',                 title: 'سيد الانجراف',                    category: 'cars',    thumb: '/games/drift-boss.png',                ...ext('https://www.crazygames.com/embed/drift-boss'),                     section: 'arcade', featured: true },
  { id: 'capitalist-bus-driver',      title: 'سائقة الحافلة الذكية',             category: 'cars',    thumb: '/games/capitalist-bus-driver.png',     ...ext('https://www.crazygames.com/embed/capitalist-bus-driver'),          section: 'arcade' },

  // ─── مغامرات / أكشن خفيف ───
  { id: 'subway-surfers',             title: 'صب واي سيرفرز',                   category: 'adventures', thumb: '/games/subway-surfers.png',         ...ext('https://www.crazygames.com/embed/subway-surfers'),                 section: 'arcade', featured: true },
  { id: 'stickman-hook',              title: 'ستيك مان الخطّاف',                category: 'adventures', thumb: '/games/stickman-hook.png',          ...ext('https://www.crazygames.com/embed/stickman-hook'),                  section: 'arcade' },
  { id: 'stickman-crazy-box',         title: 'ستيك مان الصندوق المجنون',         category: 'adventures', thumb: '/games/stickman-crazy-box.png',     ...ext('https://www.crazygames.com/embed/stickman-crazy-box'),             section: 'arcade' },
  { id: 'steal-and-run',              title: 'اخطفي واهربي',                     category: 'adventures', thumb: '/games/steal-and-run.png',          ...ext('https://www.crazygames.com/embed/steal-and-run'),                  section: 'arcade' },
  { id: 'scary-teacher-3d',           title: 'الأستاذة المخيفة 3D',              category: 'adventures', thumb: '/games/scary-teacher-3d.png',       ...ext('https://www.crazygames.com/embed/scary-teacher-3d'),               section: 'arcade' },
  { id: 'sushi-party-io',             title: 'حفلة السوشي',                      category: 'arcade',  thumb: '/games/sushi-party-io.png',            ...ext('https://www.crazygames.com/embed/sushi-party-io'),                 section: 'arcade' },
  { id: 'vortellis-pizza',            title: 'بيتزا فورتيلي',                    category: 'adventures', thumb: '/games/vortellis-pizza.png',        ...ext('https://www.crazygames.com/embed/vortellis-pizza'),                section: 'arcade' },
  { id: 'vortellis-pizza-delivery',   title: 'توصيل بيتزا فورتيلي',              category: 'adventures', thumb: '/games/vortellis-pizza-delivery.png',...ext('https://www.crazygames.com/embed/vortellis-pizza-delivery'),       section: 'arcade' },
  { id: 'vectaria-io',                title: 'فيكتاريا أونلاين',                 category: 'adventures', thumb: '/games/vectaria-io.png',            ...ext('https://www.crazygames.com/embed/vectaria-io'),                    section: 'arcade' },
];

MARIA_GAMES_WITH_SOURCE.push(...EXTERNAL_GIRLS_GAMES);

export const MARIA_GAMES = MARIA_GAMES_WITH_SOURCE.filter(g => g.section === 'maria');
export const ARCADE_GAMES = MARIA_GAMES_WITH_SOURCE.filter(g => g.section === 'arcade');
export const DRAWING_GAMES = MARIA_GAMES_WITH_SOURCE.filter(g => g.section === 'drawing');
