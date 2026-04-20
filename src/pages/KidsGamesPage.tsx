import { useMemo, useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Brain, CheckCircle2, RotateCcw, Sparkles, Gamepad2, Puzzle, Palette, Trophy, Star, ArrowRight } from 'lucide-react';
import { quickChallenges } from '../data/kidsContent';
import { GAMES_LIBRARY } from '../data/gamesData';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';

const memoryBase = ['🐰', '🦊', '🐼', '🐸', '🦄', '🐻', '🦁', '🐯'];

function shuffle<T>(arr: T[]) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function KidsGamesPage() {
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [memoryCards, setMemoryCards] = useState<string[]>(() => shuffle([...memoryBase, ...memoryBase]));
  const [opened, setOpened] = useState<number[]>([]);
  const [matched, setMatched] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState<'memory' | 'quiz' | 'puzzle'>('memory');
  const [puzzlePieces, setPuzzlePieces] = useState<number[]>(() => shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8]));

  const score = useMemo(() => {
    return quickChallenges.reduce((total, challenge) => {
      return answers[challenge.id] === challenge.answerIndex ? total + 1 : total;
    }, 0);
  }, [answers]);

  const resetGame = () => {
    setAnswers({});
    setSubmitted(false);
    setMemoryCards(shuffle([...memoryBase, ...memoryBase]));
    setOpened([]);
    setMatched([]);
    setPuzzlePieces(shuffle([0, 1, 2, 3, 4, 5, 6, 7, 8]));
  };

  const movePiece = (index: number) => {
    const emptyIndex = puzzlePieces.indexOf(8);
    const row = Math.floor(index / 3);
    const col = index % 3;
    const emptyRow = Math.floor(emptyIndex / 3);
    const emptyCol = emptyIndex % 3;

    const isAdjacent = Math.abs(row - emptyRow) + Math.abs(col - emptyCol) === 1;

    if (isAdjacent) {
      const newPieces = [...puzzlePieces];
      [newPieces[index], newPieces[emptyIndex]] = [newPieces[emptyIndex], newPieces[index]];
      setPuzzlePieces(newPieces);
      
      if (newPieces.every((p, i) => p === i)) {
        toast.success('رائع! لقد حللتِ اللغز! 🎉');
      }
    }
  };

  const flipCard = (index: number) => {
    if (opened.includes(index) || matched.includes(index) || opened.length === 2) return;
    const nextOpened = [...opened, index];
    setOpened(nextOpened);

    if (nextOpened.length === 2) {
      const [a, b] = nextOpened;
      if (memoryCards[a] === memoryCards[b]) {
        setMatched((prev) => [...prev, a, b]);
        setTimeout(() => setOpened([]), 300);
      } else {
        setTimeout(() => setOpened([]), 700);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-emerald-50 font-sans" dir="rtl">
      {/* Header */}
      <header className="p-6 bg-white/80 backdrop-blur-md shadow-sm flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/child')}
            className="p-2 hover:bg-sky-50 rounded-full transition-colors text-sky-600"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-sky-900 flex items-center gap-2">
              <Gamepad2 className="w-8 h-8 text-sky-500" />
              عالم الألعاب السحرية
            </h1>
            <p className="text-sky-600 text-sm font-bold">العب، تعلم، وكن بطلاً! ✨</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-amber-100 px-4 py-2 rounded-2xl border-2 border-amber-200">
          <Trophy className="w-5 h-5 text-amber-600" />
          <span className="font-black text-amber-700">{matched.length * 5 + score * 10} نقطة</span>
        </div>
      </header>

      <main className="p-6 max-w-5xl mx-auto">
        {/* Game Selection Tabs */}
        <div className="flex justify-center gap-4 mb-10">
          <button 
            onClick={() => setActiveTab('memory')}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black transition-all ${activeTab === 'memory' ? 'bg-emerald-500 text-white shadow-lg scale-105' : 'bg-white text-emerald-600 border-2 border-emerald-100 hover:bg-emerald-50'}`}
          >
            <Brain className="w-5 h-5" />
            لعبة الذاكرة
          </button>
          <button 
            onClick={() => setActiveTab('quiz')}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black transition-all ${activeTab === 'quiz' ? 'bg-sky-500 text-white shadow-lg scale-105' : 'bg-white text-sky-600 border-2 border-sky-100 hover:bg-sky-50'}`}
          >
            <Sparkles className="w-5 h-5" />
            تحدي الذكاء
          </button>
          <button 
            onClick={() => setActiveTab('puzzle')}
            className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black transition-all ${activeTab === 'puzzle' ? 'bg-amber-500 text-white shadow-lg scale-105' : 'bg-white text-amber-600 border-2 border-amber-100 hover:bg-amber-50'}`}
          >
            <Puzzle className="w-5 h-5" />
            لغز الصور
          </button>
          <button 
            onClick={() => navigate('/coloring')}
            className="flex items-center gap-2 px-6 py-3 rounded-2xl font-black bg-white text-pink-600 border-2 border-pink-100 hover:bg-pink-50 transition-all"
          >
            <Palette className="w-5 h-5" />
            استوديو التلوين
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'memory' && (
            <motion.section 
              key="memory"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-[2.5rem] p-8 shadow-2xl border-4 border-emerald-100 relative overflow-hidden"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl font-black text-emerald-900 mb-2">لعبة الذاكرة السحرية</h2>
                  <p className="text-emerald-600 font-bold">ابحثي عن الأزواج المتشابهة من الحيوانات اللطيفة!</p>
                </div>
                <button onClick={resetGame} className="p-3 bg-emerald-100 text-emerald-600 rounded-2xl hover:bg-emerald-200 transition-colors">
                  <RotateCcw className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-4 md:grid-cols-4 lg:grid-cols-4 gap-4 max-w-2xl mx-auto">
                {memoryCards.map((emoji, idx) => {
                  const isOpen = opened.includes(idx) || matched.includes(idx);
                  return (
                    <motion.button
                      key={`${emoji}-${idx}`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => flipCard(idx)}
                      className={`h-24 md:h-32 rounded-3xl text-4xl md:text-5xl flex items-center justify-center transition-all duration-500 transform ${
                        isOpen 
                          ? 'bg-gradient-to-br from-emerald-100 to-teal-100 border-4 border-emerald-300 rotate-0' 
                          : 'bg-gradient-to-br from-emerald-500 to-teal-600 border-4 border-emerald-400 shadow-lg hover:shadow-emerald-200'
                      }`}
                    >
                      {isOpen ? (
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }}>{emoji}</motion.span>
                      ) : (
                        <Sparkles className="w-10 h-10 text-white/50" />
                      )}
                    </motion.button>
                  );
                })}
              </div>

              <div className="mt-10 flex justify-center items-center gap-6">
                <div className="bg-emerald-50 px-6 py-3 rounded-2xl border-2 border-emerald-100 flex items-center gap-3">
                  <Star className="w-6 h-6 text-amber-500 fill-current" />
                  <span className="text-xl font-black text-emerald-900">الأزواج: {matched.length / 2} / {memoryBase.length}</span>
                </div>
                {matched.length === memoryCards.length && (
                  <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }}
                    className="text-2xl font-black text-emerald-600 animate-bounce"
                  >
                    رائع! لقد فزتِ يا بطلة! 🎉
                  </motion.div>
                )}
              </div>
            </motion.section>
          )}

          {activeTab === 'quiz' && (
            <motion.section 
              key="quiz"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-[2.5rem] p-8 shadow-2xl border-4 border-sky-100"
            >
              <div className="mb-8">
                <h2 className="text-3xl font-black text-sky-900 mb-2">تحدي الذكاء الخارق</h2>
                <p className="text-sky-600 font-bold">أجيبي على الأسئلة واجمعي النقاط السحرية!</p>
              </div>

              <div className="space-y-6">
                {quickChallenges.map((challenge, index) => (
                  <div key={challenge.id} className="p-6 rounded-[2rem] border-2 border-sky-50 bg-sky-50/30">
                    <h3 className="text-xl font-black text-sky-900 mb-4 flex items-center gap-3">
                      <span className="w-10 h-10 bg-sky-500 text-white rounded-full flex items-center justify-center text-lg">{index + 1}</span>
                      {challenge.question}
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {challenge.choices.map((choice, choiceIndex) => {
                        const isPicked = answers[challenge.id] === choiceIndex;
                        const isCorrect = challenge.answerIndex === choiceIndex;
                        const showResult = submitted;

                        return (
                          <button
                            key={`${challenge.id}-${choice}`}
                            disabled={submitted}
                            onClick={() => setAnswers((prev) => ({ ...prev, [challenge.id]: choiceIndex }))}
                            className={`text-right p-4 rounded-2xl border-2 font-bold transition-all ${
                              isPicked 
                                ? 'border-sky-500 bg-sky-500 text-white shadow-lg' 
                                : 'border-sky-100 bg-white text-sky-700 hover:border-sky-300 hover:bg-sky-50'
                            } ${showResult && isCorrect ? 'ring-4 ring-emerald-400' : ''} ${showResult && isPicked && !isCorrect ? 'ring-4 ring-red-400' : ''}`}
                          >
                            {choice}
                          </button>
                        );
                      })}
                    </div>

                    {submitted && (
                      <motion.p 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-4 p-4 bg-white rounded-xl text-sky-800 font-bold border border-sky-100 text-sm"
                      >
                        💡 {challenge.explanation}
                      </motion.p>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-10 flex flex-col items-center gap-4">
                {!submitted ? (
                  <button
                    onClick={() => setSubmitted(true)}
                    className="bg-gradient-to-r from-sky-500 to-indigo-600 text-white px-12 py-4 rounded-2xl font-black text-xl shadow-xl shadow-sky-200 hover:scale-105 transition-transform"
                  >
                    إنهاء التحدي والحصول على النقاط
                  </button>
                ) : (
                  <div className="flex flex-col items-center gap-4">
                    <div className="p-6 rounded-[2rem] bg-emerald-50 border-4 border-emerald-200 text-emerald-700 font-black text-2xl flex items-center gap-4 shadow-lg">
                      <CheckCircle2 className="w-10 h-10" />
                      نتيجتك: {score} من {quickChallenges.length}
                    </div>
                    <button onClick={resetGame} className="text-sky-600 font-bold hover:underline flex items-center gap-2">
                      <RotateCcw className="w-5 h-5" />
                      محاولة مرة أخرى
                    </button>
                  </div>
                )}
              </div>
            </motion.section>
          )}

          {activeTab === 'puzzle' && (
            <motion.section 
              key="puzzle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-[2.5rem] p-8 shadow-2xl border-4 border-amber-100"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl font-black text-amber-900 mb-2">لغز الصور المبعثرة</h2>
                  <p className="text-amber-600 font-bold">رتب القطع لتكتمل الصورة السحرية!</p>
                </div>
                <button onClick={resetGame} className="p-3 bg-amber-100 text-amber-600 rounded-2xl hover:bg-amber-200 transition-colors">
                  <RotateCcw className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 w-full max-w-md mx-auto aspect-square bg-amber-50 p-2 rounded-3xl border-4 border-amber-200">
                {puzzlePieces.map((piece, idx) => (
                  <motion.button
                    key={idx}
                    layout
                    onClick={() => movePiece(idx)}
                    className={`rounded-2xl flex items-center justify-center text-4xl shadow-sm transition-all ${
                      piece === 8 
                        ? 'bg-transparent border-2 border-dashed border-amber-200' 
                        : 'bg-white border-2 border-amber-100 hover:border-amber-400 hover:shadow-md'
                    }`}
                  >
                    {piece !== 8 && (
                      <span className="select-none">
                        {['🍎', '🍌', '🍇', '🍓', '🍒', '🍍', '🥝', '🍉'][piece]}
                      </span>
                    )}
                  </motion.button>
                ))}
              </div>

              <div className="mt-8 text-center">
                {puzzlePieces.every((p, i) => p === i) ? (
                  <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }}
                    className="text-2xl font-black text-amber-600"
                  >
                    أحسنتِ! لقد اكتملت الفواكه! 🍎✨
                  </motion.div>
                ) : (
                  <p className="text-amber-500 font-bold">اضغطي على القطعة المجاورة للمربع الفارغ لتحريكها.</p>
                )}
              </div>
            </motion.section>
          )}

          {!['memory', 'quiz', 'puzzle'].includes(activeTab) && (
            <motion.section 
              key="coming-soon"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white rounded-[2.5rem] p-12 shadow-2xl border-4 border-indigo-100 text-center"
            >
              <div className="text-8xl mb-6 animate-bounce">🚧</div>
              <h2 className="text-3xl font-black text-indigo-900 mb-4">جاري تجهيز هذه اللعبة السحرية! ✨</h2>
              <p className="text-indigo-600 font-bold text-lg mb-8 max-w-lg mx-auto">
                نحن نعمل بجد في مصنع الألعاب لصنع هذه اللعبة خصيصاً لكِ. ستكون جاهزة قريباً جداً! جربي ألعاب الذاكرة والذكاء والألغاز والتلوين المتاحة الآن.
              </p>
              <button 
                onClick={() => setActiveTab('memory')}
                className="bg-indigo-500 text-white px-8 py-3 rounded-2xl font-black hover:bg-indigo-600 transition-colors shadow-lg"
              >
                العب لعبة الذاكرة
              </button>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Games Library */}
        <section className="mt-16">
          <h2 className="text-3xl font-black text-slate-900 mb-3 text-center">مكتبة الألعاب الشاملة</h2>
          <p className="text-center text-slate-500 font-bold mb-8">مئات الألعاب الممتعة والتعليمية في انتظارك!</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {GAMES_LIBRARY.map((game) => (
              <button
                key={game.id}
                onClick={() => {
                  if (game.mode === 'coloring') {
                    navigate('/coloring');
                    return;
                  }
                  setActiveTab(game.mode);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  toast.success(`تم فتح: ${game.title}`);
                }}
                className="bg-white p-6 rounded-[2.5rem] border-2 border-slate-100 shadow-xl flex flex-col items-center text-center group hover:border-sky-200 transition-all"
              >
                <div className="w-20 h-20 bg-slate-100 text-slate-700 rounded-3xl flex items-center justify-center mb-4 text-4xl group-hover:rotate-12 transition-transform">
                  {game.emoji}
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-2">{game.title}</h3>
                <p className="text-slate-500 font-bold text-xs mb-3">الفئة: {game.category}</p>
                <div className="mt-auto px-4 py-2 bg-slate-50 text-slate-500 rounded-xl text-xs font-black">
                  {game.difficulty === 'easy' ? 'سهل' : 'متوسط'} • {game.minutes} دقائق
                </div>
              </button>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
