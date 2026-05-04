import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Star, Trophy, RotateCcw, Heart, Zap, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { recordGamePlay } from '../../../lib/gameStats';

type Difficulty = 'easy' | 'medium' | 'hard';
type Op = '+' | '-' | '×';

interface Question {
  a: number;
  b: number;
  op: Op;
  answer: number;
  choices: number[];
}

const DIFFICULTY_META: Record<Difficulty, { label: string; ops: Op[]; max: number; color: string }> = {
  easy:   { label: 'سهل',     ops: ['+', '-'],         max: 10,  color: 'from-emerald-400 to-teal-500' },
  medium: { label: 'متوسط',   ops: ['+', '-', '×'],    max: 20,  color: 'from-amber-400 to-orange-500' },
  hard:   { label: 'صعب',     ops: ['+', '-', '×'],    max: 50,  color: 'from-rose-500 to-fuchsia-600' },
};

const QUESTIONS_PER_LEVEL = 10;
const STARTING_LIVES = 3;

function buildQuestion(diff: Difficulty): Question {
  const meta = DIFFICULTY_META[diff];
  const op = meta.ops[Math.floor(Math.random() * meta.ops.length)];
  let a = Math.floor(Math.random() * meta.max) + 1;
  let b = Math.floor(Math.random() * meta.max) + 1;
  if (op === '-' && b > a) [a, b] = [b, a];
  if (op === '×') {
    a = Math.floor(Math.random() * (diff === 'hard' ? 12 : 9)) + 1;
    b = Math.floor(Math.random() * (diff === 'hard' ? 12 : 9)) + 1;
  }
  const answer = op === '+' ? a + b : op === '-' ? a - b : a * b;
  const wrongs = new Set<number>();
  while (wrongs.size < 3) {
    const delta = Math.floor(Math.random() * 8) - 4 || 1;
    const candidate = answer + delta;
    if (candidate >= 0 && candidate !== answer) wrongs.add(candidate);
  }
  const choices = [...wrongs, answer].sort(() => Math.random() - 0.5);
  return { a, b, op, answer, choices };
}

export default function MathHero() {
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [question, setQuestion] = useState<Question | null>(null);
  const [questionIdx, setQuestionIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [lives, setLives] = useState(STARTING_LIVES);
  const [picked, setPicked] = useState<number | null>(null);
  const [phase, setPhase] = useState<'menu' | 'play' | 'gameover' | 'win'>('menu');
  const meta = useMemo(() => (difficulty ? DIFFICULTY_META[difficulty] : null), [difficulty]);

  const startGame = (diff: Difficulty) => {
    setDifficulty(diff);
    setQuestion(buildQuestion(diff));
    setQuestionIdx(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setLives(STARTING_LIVES);
    setPicked(null);
    setPhase('play');
  };

  const next = useCallback(() => {
    if (!difficulty) return;
    if (questionIdx + 1 >= QUESTIONS_PER_LEVEL) {
      setPhase('win');
      confetti({ particleCount: 180, spread: 90, origin: { y: 0.6 } });
      try {
        const stored = JSON.parse(localStorage.getItem('math_hero_best') || '{}');
        if (!stored[difficulty] || score > stored[difficulty]) {
          stored[difficulty] = score;
          localStorage.setItem('math_hero_best', JSON.stringify(stored));
        }
      } catch { /* ignore */ }
      recordGamePlay('math-hero', score);
      return;
    }
    setQuestionIdx((i) => i + 1);
    setQuestion(buildQuestion(difficulty));
    setPicked(null);
  }, [difficulty, questionIdx, score]);

  const handlePick = (n: number) => {
    if (picked !== null || !question) return;
    setPicked(n);
    const correct = n === question.answer;
    if (correct) {
      const points = 10 + streak * 2;
      setScore((s) => s + points);
      setStreak((s) => {
        const ns = s + 1;
        setBestStreak((b) => Math.max(b, ns));
        return ns;
      });
      if (streak + 1 === 5) confetti({ particleCount: 60, spread: 60, origin: { y: 0.7 } });
    } else {
      setStreak(0);
      const newLives = lives - 1;
      setLives(newLives);
      if (newLives <= 0) {
        recordGamePlay('math-hero', score);
        setTimeout(() => setPhase('gameover'), 800);
        return;
      }
    }
    setTimeout(next, 700);
  };

  // Keyboard support
  useEffect(() => {
    if (phase !== 'play' || !question) return;
    const handler = (e: KeyboardEvent) => {
      const idx = parseInt(e.key, 10);
      if (idx >= 1 && idx <= 4) handlePick(question.choices[idx - 1]);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, question, picked, lives, streak]);

  const best = useMemo(() => {
    try { return JSON.parse(localStorage.getItem('math_hero_best') || '{}'); } catch { return {}; }
  }, [phase]);

  // ───────────────────────── UI ─────────────────────────
  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 font-arabic">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-stone-200/60">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-16 flex items-center gap-3">
          <button
            onClick={() => navigate('/games')}
            className="h-10 w-10 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition"
            aria-label="العودة"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
              <span className="text-white text-lg">🦸‍♀️</span>
            </div>
            <div>
              <p className="text-[11px] leading-none text-stone-400 font-bold">لعبة جديدة</p>
              <p className="text-sm font-extrabold leading-tight text-stone-800">بطلة الحساب</p>
            </div>
          </div>
          <div className="flex-1" />
          {phase === 'play' && (
            <>
              <div className="flex items-center gap-1.5 bg-rose-50 ring-1 ring-rose-200 px-3 py-1.5 rounded-full">
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
            <motion.div key="menu" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <div className="text-center mb-10">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-7xl mb-4"
                >
                  🦸‍♀️
                </motion.div>
                <h1 className="text-4xl sm:text-5xl font-black text-indigo-900 mb-3">بطلة الحساب</h1>
                <p className="text-stone-600 text-base sm:text-lg font-bold max-w-md mx-auto leading-relaxed">
                  حلّي 10 مسائل بسرعة، اجمعي النقاط وحطّمي أرقامكِ القياسية!
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(Object.keys(DIFFICULTY_META) as Difficulty[]).map((d) => {
                  const m = DIFFICULTY_META[d];
                  const bestScore = best[d] || 0;
                  return (
                    <motion.button
                      key={d}
                      whileHover={{ y: -6, scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => startGame(d)}
                      className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${m.color} p-6 text-white shadow-xl text-right`}
                    >
                      <div className="absolute -top-6 -left-6 w-28 h-28 bg-white/10 rounded-full blur-2xl" />
                      <div className="relative">
                        <div className="text-4xl mb-3">
                          {d === 'easy' ? '🌱' : d === 'medium' ? '🔥' : '⚡'}
                        </div>
                        <h3 className="text-2xl font-black mb-1">{m.label}</h3>
                        <p className="text-white/80 text-xs font-bold mb-4">
                          {m.ops.join(' • ')} · حتى الرقم {m.max}
                        </p>
                        {bestScore > 0 && (
                          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-extrabold">
                            <Trophy className="h-3.5 w-3.5" />
                            أفضل: {bestScore}
                          </div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              <div className="mt-10 text-center text-stone-500 text-xs font-bold">
                💡 نصيحة: اضغطي على أرقام 1-4 من لوحة المفاتيح للإجابة السريعة
              </div>
            </motion.div>
          )}

          {phase === 'play' && question && meta && (
            <motion.div key={`q-${questionIdx}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              {/* progress */}
              <div className="mb-6">
                <div className="flex justify-between text-xs font-extrabold text-stone-500 mb-2">
                  <span>السؤال {questionIdx + 1} من {QUESTIONS_PER_LEVEL}</span>
                  <span className="flex items-center gap-1">
                    <Zap className="h-3.5 w-3.5 text-amber-500" />
                    سلسلة: {streak}
                  </span>
                </div>
                <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full bg-gradient-to-r ${meta.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${((questionIdx + 1) / QUESTIONS_PER_LEVEL) * 100}%` }}
                  />
                </div>
              </div>

              {/* question card */}
              <div className="bg-white rounded-[2rem] p-8 sm:p-12 shadow-xl ring-1 ring-stone-200 text-center mb-6">
                <div className="text-5xl sm:text-7xl font-black text-indigo-900 tabular-nums tracking-tight" dir="ltr">
                  {question.a} {question.op} {question.b} = ?
                </div>
              </div>

              {/* choices */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                {question.choices.map((c, i) => {
                  const isCorrect = picked !== null && c === question.answer;
                  const isWrongPick = picked === c && c !== question.answer;
                  const isPicked = picked === c;
                  return (
                    <motion.button
                      key={`${questionIdx}-${i}`}
                      whileHover={picked === null ? { scale: 1.04 } : undefined}
                      whileTap={picked === null ? { scale: 0.96 } : undefined}
                      onClick={() => handlePick(c)}
                      disabled={picked !== null}
                      className={`relative rounded-2xl p-6 sm:p-8 text-3xl sm:text-4xl font-black tabular-nums shadow-md ring-2 transition-all ${
                        isCorrect
                          ? 'bg-emerald-500 text-white ring-emerald-600 scale-105'
                          : isWrongPick
                          ? 'bg-rose-500 text-white ring-rose-600'
                          : picked !== null && c === question.answer
                          ? 'bg-emerald-500 text-white ring-emerald-600'
                          : 'bg-white text-indigo-900 ring-stone-200 hover:ring-indigo-400 hover:bg-indigo-50'
                      }`}
                    >
                      <span className="absolute top-2 right-3 text-xs font-bold opacity-50">{i + 1}</span>
                      {c}
                      {isPicked && isCorrect && (
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-2 -left-2 text-2xl">✨</motion.span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          )}

          {(phase === 'gameover' || phase === 'win') && (
            <motion.div
              key="end"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-[2rem] p-8 sm:p-12 shadow-2xl text-center mt-8"
            >
              <div className="text-7xl mb-4">{phase === 'win' ? '🏆' : '💪'}</div>
              <h2 className="text-3xl sm:text-4xl font-black text-indigo-900 mb-3">
                {phase === 'win' ? 'أحسنتِ يا بطلة!' : 'لا بأس، حاولي مرة أخرى!'}
              </h2>
              <p className="text-stone-600 font-bold mb-8">
                {phase === 'win'
                  ? 'أكملتِ كل الأسئلة بنجاح. أنتِ بطلة الحساب الحقيقية!'
                  : 'العقول العظيمة تتعلم من كل محاولة.'}
              </p>

              <div className="grid grid-cols-3 gap-3 max-w-md mx-auto mb-8">
                <div className="bg-amber-50 ring-1 ring-amber-200 rounded-2xl p-4">
                  <Star className="h-5 w-5 text-amber-500 fill-current mx-auto mb-1" />
                  <div className="text-2xl font-black text-amber-700">{score}</div>
                  <div className="text-[10px] font-extrabold text-amber-600 uppercase">النقاط</div>
                </div>
                <div className="bg-emerald-50 ring-1 ring-emerald-200 rounded-2xl p-4">
                  <Zap className="h-5 w-5 text-emerald-500 mx-auto mb-1" />
                  <div className="text-2xl font-black text-emerald-700">{bestStreak}</div>
                  <div className="text-[10px] font-extrabold text-emerald-600 uppercase">أفضل سلسلة</div>
                </div>
                <div className="bg-indigo-50 ring-1 ring-indigo-200 rounded-2xl p-4">
                  <Award className="h-5 w-5 text-indigo-500 mx-auto mb-1" />
                  <div className="text-2xl font-black text-indigo-700">{difficulty ? best[difficulty] || 0 : 0}</div>
                  <div className="text-[10px] font-extrabold text-indigo-600 uppercase">الرقم القياسي</div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => difficulty && startGame(difficulty)}
                  className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold py-3 px-6 rounded-2xl shadow-lg transition"
                >
                  <RotateCcw className="h-4 w-4" />
                  العبي مرة أخرى
                </button>
                <button
                  onClick={() => setPhase('menu')}
                  className="inline-flex items-center justify-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-extrabold py-3 px-6 rounded-2xl transition"
                >
                  تغيير المستوى
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
