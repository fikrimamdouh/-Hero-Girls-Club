import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Palette, RotateCcw, Trophy, Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import { recordGamePlay } from '../../../lib/gameStats';

type Primary = 'red' | 'yellow' | 'blue';
const PRIMARIES: { id: Primary; ar: string; hex: string }[] = [
  { id: 'red',    ar: 'أحمر',  hex: '#ef4444' },
  { id: 'yellow', ar: 'أصفر',  hex: '#facc15' },
  { id: 'blue',   ar: 'أزرق',  hex: '#3b82f6' },
];

interface Recipe { target: string; targetAr: string; targetHex: string; mix: Primary[]; emoji: string; }
const RECIPES: Recipe[] = [
  { target: 'orange', targetAr: 'برتقالي', targetHex: '#fb923c', mix: ['red', 'yellow'],   emoji: '🍊' },
  { target: 'green',  targetAr: 'أخضر',    targetHex: '#22c55e', mix: ['yellow', 'blue'],  emoji: '🍏' },
  { target: 'purple', targetAr: 'بنفسجي',  targetHex: '#a855f7', mix: ['red', 'blue'],     emoji: '🍇' },
  { target: 'brown',  targetAr: 'بني',     targetHex: '#92400e', mix: ['red', 'yellow', 'blue'], emoji: '🍫' },
];

function blendColors(colors: string[]): string {
  if (colors.length === 0) return '#f5f5f4';
  const rgb = colors.map((c) => ({
    r: parseInt(c.slice(1, 3), 16),
    g: parseInt(c.slice(3, 5), 16),
    b: parseInt(c.slice(5, 7), 16),
  }));
  const avg = rgb.reduce((acc, x) => ({ r: acc.r + x.r, g: acc.g + x.g, b: acc.b + x.b }), { r: 0, g: 0, b: 0 });
  const n = rgb.length;
  return `rgb(${Math.round(avg.r / n)}, ${Math.round(avg.g / n)}, ${Math.round(avg.b / n)})`;
}

export default function ColorMix() {
  const navigate = useNavigate();
  const [recipeIdx, setRecipeIdx] = useState(0);
  const [drops, setDrops] = useState<Primary[]>([]);
  const [score, setScore] = useState(0);
  const [solved, setSolved] = useState<Set<string>>(new Set());
  const [showResult, setShowResult] = useState<'win' | 'tryagain' | null>(null);

  const currentRecipe = RECIPES[recipeIdx];
  const currentColor = useMemo(
    () => blendColors(drops.map((d) => PRIMARIES.find((p) => p.id === d)!.hex)),
    [drops]
  );

  const addDrop = (p: Primary) => {
    if (showResult) return;
    setDrops([...drops, p]);
  };

  const reset = () => { setDrops([]); setShowResult(null); };

  const check = () => {
    const sortedMix = [...currentRecipe.mix].sort().join(',');
    const sortedDrops = [...new Set(drops)].sort().join(',');
    if (sortedMix === sortedDrops && drops.length >= currentRecipe.mix.length) {
      setShowResult('win');
      const ns = score + 25;
      setScore(ns);
      setSolved((set) => new Set(set).add(currentRecipe.target));
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      recordGamePlay('color-mix', ns);
    } else {
      setShowResult('tryagain');
    }
  };

  const nextRecipe = () => {
    const next = (recipeIdx + 1) % RECIPES.length;
    setRecipeIdx(next);
    reset();
  };

  useEffect(() => {
    if (showResult === 'tryagain') {
      const t = setTimeout(() => { reset(); }, 1200);
      return () => clearTimeout(t);
    }
  }, [showResult]);

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-amber-50 via-rose-50 to-violet-50 font-arabic">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-stone-200/60">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-16 flex items-center gap-3">
          <button onClick={() => navigate('/games')} className="h-10 w-10 rounded-xl bg-stone-100 hover:bg-stone-200 flex items-center justify-center" aria-label="رجوع">
            <ArrowRight className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-amber-500 to-rose-500 flex items-center justify-center shadow-md">
              <Palette className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-[11px] leading-none text-stone-400 font-bold">جديدة</p>
              <p className="text-sm font-extrabold leading-tight text-stone-800">معمل الألوان</p>
            </div>
          </div>
          <div className="flex-1" />
          <div className="flex items-center gap-1.5 bg-amber-50 ring-1 ring-amber-200 px-3 py-1.5 rounded-full">
            <Star className="h-4 w-4 text-amber-500 fill-current" />
            <span className="font-extrabold text-amber-700 text-sm">{score}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
        {/* Goal card */}
        <div className="bg-white rounded-3xl p-6 ring-1 ring-stone-200 shadow-md mb-6 text-center">
          <div className="text-xs font-extrabold text-stone-500 mb-2">حضّري اللون:</div>
          <div className="text-5xl mb-2">{currentRecipe.emoji}</div>
          <h2 className="text-2xl font-black mb-3" style={{ color: currentRecipe.targetHex }}>{currentRecipe.targetAr}</h2>
          <div className="inline-flex flex-wrap gap-2 justify-center text-xs font-bold text-stone-600">
            {RECIPES.map((r) => (
              <span key={r.target} className={`px-2.5 py-1 rounded-full ring-1 ${solved.has(r.target) ? 'bg-emerald-50 text-emerald-700 ring-emerald-200' : r.target === currentRecipe.target ? 'bg-stone-800 text-white ring-stone-800' : 'bg-stone-50 text-stone-400 ring-stone-200'}`}>
                {solved.has(r.target) ? '✓ ' : ''}{r.targetAr}
              </span>
            ))}
          </div>
        </div>

        {/* Mixing area */}
        <div className="bg-white/70 backdrop-blur rounded-3xl p-6 ring-1 ring-stone-200 shadow-md mb-6">
          <div className="flex items-center justify-center mb-4">
            <motion.div
              animate={{ scale: drops.length > 0 ? 1 : 0.95 }}
              className="relative w-44 h-44 rounded-full ring-8 ring-white shadow-2xl flex items-center justify-center overflow-hidden"
              style={{ background: currentColor, transition: 'background 0.5s' }}
            >
              <AnimatePresence>
                {drops.map((d, i) => (
                  <motion.div
                    key={`${d}-${i}`}
                    initial={{ y: -150, opacity: 0 }}
                    animate={{ y: 0, opacity: 0.6 }}
                    transition={{ duration: 0.4 }}
                    className="absolute w-12 h-12 rounded-full"
                    style={{ background: PRIMARIES.find(p => p.id === d)!.hex, top: `${20 + i * 15}%`, left: `${30 + (i % 3) * 15}%` }}
                  />
                ))}
              </AnimatePresence>
              {drops.length === 0 && (
                <span className="text-stone-400 font-extrabold text-sm">أضيفي القطرات</span>
              )}
            </motion.div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {PRIMARIES.map((p) => (
              <motion.button
                key={p.id}
                whileHover={{ y: -3 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => addDrop(p.id)}
                className="rounded-2xl p-4 text-white font-extrabold shadow-lg ring-2 ring-white/40"
                style={{ background: p.hex }}
              >
                <div className="text-2xl mb-1">💧</div>
                {p.ar}
              </motion.button>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={reset} className="flex-1 inline-flex items-center justify-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-extrabold py-3 rounded-2xl transition">
              <RotateCcw className="h-4 w-4" />
              فرّغي
            </button>
            <button onClick={check} disabled={drops.length === 0 || !!showResult} className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-rose-500 hover:brightness-110 disabled:opacity-50 text-white font-extrabold py-3 rounded-2xl shadow-lg transition">
              تحقّقي ✨
            </button>
          </div>
        </div>

        <AnimatePresence>
          {showResult === 'win' && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="bg-emerald-500 text-white rounded-3xl p-6 shadow-xl text-center mb-4">
              <Trophy className="h-10 w-10 mx-auto mb-2" />
              <div className="text-2xl font-black mb-1">رائع! +25 نقطة</div>
              <p className="font-bold text-emerald-50 mb-4">صنعتِ اللون {currentRecipe.targetAr} بنجاح!</p>
              <button onClick={nextRecipe} className="bg-white text-emerald-600 font-extrabold py-2.5 px-6 rounded-2xl">
                لون جديد ←
              </button>
            </motion.div>
          )}
          {showResult === 'tryagain' && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-amber-50 ring-1 ring-amber-200 rounded-2xl p-4 text-center font-extrabold text-amber-700">
              💡 جرّبي مزيج آخر! تلميح: امزجي {currentRecipe.mix.length} ألوان أساسية
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center text-stone-500 text-xs font-bold mt-6">
          🎨 تعلّمي نظرية الألوان من خلال التجربة
        </p>
      </main>
    </div>
  );
}
