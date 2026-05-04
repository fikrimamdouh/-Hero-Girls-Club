import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Star, Heart, RotateCcw, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { recordGamePlay } from '../../../lib/gameStats';

interface Animal { emoji: string; ar: string; habitat: 'farm' | 'jungle' | 'sea' | 'sky'; }

const ANIMALS: Animal[] = [
  { emoji: '🦁', ar: 'الأسد',     habitat: 'jungle' },
  { emoji: '🐘', ar: 'الفيل',     habitat: 'jungle' },
  { emoji: '🦒', ar: 'الزرافة',   habitat: 'jungle' },
  { emoji: '🐯', ar: 'النمر',     habitat: 'jungle' },
  { emoji: '🦓', ar: 'الحمار الوحشي', habitat: 'jungle' },
  { emoji: '🐵', ar: 'القرد',     habitat: 'jungle' },
  { emoji: '🐮', ar: 'البقرة',    habitat: 'farm' },
  { emoji: '🐷', ar: 'الخنزير',   habitat: 'farm' },
  { emoji: '🐔', ar: 'الدجاجة',   habitat: 'farm' },
  { emoji: '🐑', ar: 'النعجة',    habitat: 'farm' },
  { emoji: '🐴', ar: 'الحصان',    habitat: 'farm' },
  { emoji: '🦆', ar: 'البطة',     habitat: 'farm' },
  { emoji: '🐬', ar: 'الدلفين',   habitat: 'sea' },
  { emoji: '🐠', ar: 'السمكة',    habitat: 'sea' },
  { emoji: '🐙', ar: 'الأخطبوط',  habitat: 'sea' },
  { emoji: '🦈', ar: 'القرش',     habitat: 'sea' },
  { emoji: '🐢', ar: 'السلحفاة',  habitat: 'sea' },
  { emoji: '🦀', ar: 'السلطعون',  habitat: 'sea' },
  { emoji: '🦅', ar: 'النسر',     habitat: 'sky' },
  { emoji: '🦉', ar: 'البومة',    habitat: 'sky' },
  { emoji: '🦜', ar: 'الببغاء',   habitat: 'sky' },
  { emoji: '🦋', ar: 'الفراشة',   habitat: 'sky' },
];

const HABITATS = [
  { id: 'farm',   ar: 'المزرعة',  emoji: '🚜' },
  { id: 'jungle', ar: 'الغابة',   emoji: '🌴' },
  { id: 'sea',    ar: 'البحر',    emoji: '🌊' },
  { id: 'sky',    ar: 'السماء',   emoji: '☁️' },
] as const;

const TOTAL = 10;
const STARTING_LIVES = 3;

function shuffle<T>(arr: T[]): T[] { return [...arr].sort(() => Math.random() - 0.5); }

export default function AnimalQuiz() {
  const navigate = useNavigate();
  const [pool, setPool] = useState<Animal[]>([]);
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(STARTING_LIVES);
  const [picked, setPicked] = useState<string | null>(null);
  const [phase, setPhase] = useState<'menu' | 'quiz' | 'end'>('menu');

  const current = pool[idx];
  const choices = useMemo(() => current ? shuffle(HABITATS.map(h => h.id)) : [], [current]);

  const start = () => {
    setPool(shuffle(ANIMALS).slice(0, TOTAL));
    setIdx(0); setScore(0); setLives(STARTING_LIVES); setPicked(null);
    setPhase('quiz');
  };

  const handlePick = (h: string) => {
    if (picked || !current) return;
    setPicked(h);
    if (h === current.habitat) {
      setScore(s => s + 10);
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
    } else {
      const nl = lives - 1;
      setLives(nl);
      if (nl <= 0) { setTimeout(() => setPhase('end'), 900); return; }
    }
    setTimeout(() => {
      if (idx + 1 >= pool.length) { setPhase('end'); confetti({ particleCount: 150, spread: 80 }); }
      else { setIdx(idx + 1); setPicked(null); }
    }, 900);
  };

  useEffect(() => {
    try {
      if (phase === 'end') {
        const best = parseInt(localStorage.getItem('animal_quiz_best') || '0', 10);
        if (score > best) localStorage.setItem('animal_quiz_best', String(score));
        recordGamePlay('animal-quiz', score);
      }
    } catch { /* ignore */ }
  }, [phase, score]);

  const best = (() => { try { return parseInt(localStorage.getItem('animal_quiz_best') || '0', 10); } catch { return 0; } })();

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 font-arabic">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-stone-200/60">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-16 flex items-center gap-3">
          <button onClick={() => navigate('/games')} className="h-10 w-10 rounded-xl bg-stone-100 hover:bg-stone-200 flex items-center justify-center" aria-label="رجوع">
            <ArrowRight className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-md">
              <span className="text-white text-lg">🦁</span>
            </div>
            <div>
              <p className="text-[11px] leading-none text-stone-400 font-bold">جديدة</p>
              <p className="text-sm font-extrabold leading-tight text-stone-800">عالم الحيوانات</p>
            </div>
          </div>
          <div className="flex-1" />
          {phase === 'quiz' && (
            <>
              <div className="flex items-center gap-1 bg-rose-50 ring-1 ring-rose-200 px-3 py-1.5 rounded-full">
                {Array.from({ length: STARTING_LIVES }).map((_, i) => (
                  <Heart key={i} className={`h-4 w-4 ${i < lives ? 'text-rose-500 fill-current' : 'text-stone-300'}`} />
                ))}
              </div>
              <div className="flex items-center gap-1.5 bg-amber-50 ring-1 ring-amber-200 px-3 py-1.5 rounded-full">
                <Star className="h-4 w-4 text-amber-500 fill-current" />
                <span className="font-extrabold text-amber-700 text-sm">{score}</span>
              </div>
            </>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 sm:px-6 py-8">
        <AnimatePresence mode="wait">
          {phase === 'menu' && (
            <motion.div key="m" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
              <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }} className="text-7xl mb-4">🦒🐘🦁</motion.div>
              <h1 className="text-4xl sm:text-5xl font-black text-emerald-900 mb-3">عالم الحيوانات</h1>
              <p className="text-stone-600 font-bold mb-8 max-w-md mx-auto">خمّني أين يعيش كل حيوان: المزرعة، الغابة، البحر أم السماء؟</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto mb-8">
                {HABITATS.map((h) => (
                  <div key={h.id} className="bg-white rounded-2xl p-4 ring-1 ring-stone-200">
                    <div className="text-3xl mb-1">{h.emoji}</div>
                    <div className="font-extrabold text-stone-700 text-sm">{h.ar}</div>
                  </div>
                ))}
              </div>
              <button onClick={start} className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-extrabold py-4 px-10 rounded-2xl shadow-xl text-lg hover:brightness-110 transition">
                ابدئي اللعبة 🎮
              </button>
              {best > 0 && (
                <div className="mt-6 inline-flex items-center gap-2 text-amber-600 font-extrabold text-sm">
                  <Trophy className="h-4 w-4" /> أفضل نتيجة: {best}
                </div>
              )}
            </motion.div>
          )}

          {phase === 'quiz' && current && (
            <motion.div key={`q-${idx}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
              <div className="mb-6">
                <div className="flex justify-between text-xs font-extrabold text-stone-500 mb-2">
                  <span>السؤال {idx + 1} من {pool.length}</span>
                </div>
                <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                  <motion.div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500" initial={{ width: 0 }} animate={{ width: `${((idx + 1) / pool.length) * 100}%` }} />
                </div>
              </div>

              <div className="bg-white rounded-[2rem] p-8 sm:p-12 shadow-xl ring-1 ring-stone-200 text-center mb-6">
                <motion.div key={current.emoji} initial={{ scale: 0 }} animate={{ scale: 1 }} className="text-8xl sm:text-9xl mb-4">{current.emoji}</motion.div>
                <h2 className="text-2xl font-black text-emerald-900">أين يعيش {current.ar}؟</h2>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {choices.map((id) => {
                  const h = HABITATS.find(x => x.id === id)!;
                  const isCorrect = picked && id === current.habitat;
                  const isWrongPick = picked === id && id !== current.habitat;
                  return (
                    <motion.button
                      key={id}
                      whileHover={picked === null ? { scale: 1.04 } : undefined}
                      whileTap={picked === null ? { scale: 0.96 } : undefined}
                      onClick={() => handlePick(id)}
                      disabled={picked !== null}
                      className={`rounded-2xl p-5 sm:p-6 font-black shadow-md ring-2 transition-all ${
                        isCorrect ? 'bg-emerald-500 text-white ring-emerald-600 scale-105'
                        : isWrongPick ? 'bg-rose-500 text-white ring-rose-600'
                        : picked && id === current.habitat ? 'bg-emerald-500 text-white ring-emerald-600'
                        : 'bg-white text-emerald-900 ring-stone-200 hover:ring-emerald-400 hover:bg-emerald-50'
                      }`}
                    >
                      <div className="text-3xl mb-1">{h.emoji}</div>
                      <div>{h.ar}</div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {phase === 'end' && (
            <motion.div key="e" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="bg-white rounded-[2rem] p-10 shadow-2xl text-center mt-8">
              <div className="text-7xl mb-3">{lives > 0 ? '🏆' : '🌟'}</div>
              <h2 className="text-3xl font-black text-emerald-900 mb-2">{lives > 0 ? 'أحسنتِ!' : 'محاولة جميلة'}</h2>
              <p className="text-stone-600 font-bold mb-6">جمعتِ {score} نقطة</p>
              <div className="flex gap-3 justify-center">
                <button onClick={start} className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 px-6 rounded-2xl shadow-lg">
                  <RotateCcw className="h-4 w-4" /> العبي مرة أخرى
                </button>
                <button onClick={() => setPhase('menu')} className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-extrabold py-3 px-6 rounded-2xl">
                  القائمة
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
