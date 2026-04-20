import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Lightbulb, Star, Trophy, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

const LEVELS = [
  { word: 'نجمة', hint: 'تلمع في السماء ليلاً 🌟' },
  { word: 'بطلة', hint: 'فتاة شجاعة وقوية 💪' },
  { word: 'فراشة', hint: 'حشرة جميلة تطير بين الأزهار 🦋' },
  { word: 'كتاب', hint: 'نقرأ فيه القصص والمعلومات 📖' },
  { word: 'قلعة', hint: 'حصن كبير يعيش فيه الملوك 🏰' },
  { word: 'سحر', hint: 'قوة خفية تصنع العجائب 🪄' },
  { word: 'قمر', hint: 'يضيء لنا في الليل 🌙' },
  { word: 'شمس', hint: 'تعطينا الدفء والضوء نهاراً ☀️' },
  { word: 'وردة', hint: 'نبات جميل ذو رائحة عطرة 🌹' },
  { word: 'تاج', hint: 'يوضع على رأس الملكة 👑' },
];

export default function WordScramble() {
  const navigate = useNavigate();
  const [levelIdx, setLevelIdx] = useState(0);
  const [scrambled, setScrambled] = useState<{ id: number; char: string }[]>([]);
  const [selected, setSelected] = useState<{ id: number; char: string }[]>([]);
  const [isWon, setIsWon] = useState(false);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);

  const currentLevel = LEVELS[levelIdx];

  useEffect(() => {
    initLevel();
  }, [levelIdx]);

  const initLevel = () => {
    const chars = currentLevel.word.split('');
    // Shuffle array
    for (let i = chars.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    
    setScrambled(chars.map((char, index) => ({ id: index, char })));
    setSelected([]);
    setIsWon(false);
    setShowHint(false);
  };

  const handleSelect = (item: { id: number; char: string }) => {
    if (isWon) return;
    
    setScrambled(prev => prev.filter(i => i.id !== item.id));
    const newSelected = [...selected, item];
    setSelected(newSelected);

    // Check win condition
    if (newSelected.length === currentLevel.word.length) {
      const formedWord = newSelected.map(i => i.char).join('');
      if (formedWord === currentLevel.word) {
        handleWin();
      } else {
        // Wrong word, shake effect could be added here, but let's just auto-reset for kids
        setTimeout(() => {
          setScrambled(currentLevel.word.split('').map((char, index) => ({ id: index, char })).sort(() => Math.random() - 0.5));
          setSelected([]);
        }, 800);
      }
    }
  };

  const handleDeselect = (item: { id: number; char: string }) => {
    if (isWon) return;
    setSelected(prev => prev.filter(i => i.id !== item.id));
    setScrambled(prev => [...prev, item]);
  };

  const handleWin = () => {
    setIsWon(true);
    setScore(s => s + 10);
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#38bdf8', '#818cf8', '#c084fc']
    });
  };

  const nextLevel = () => {
    if (levelIdx < LEVELS.length - 1) {
      setLevelIdx(prev => prev + 1);
    } else {
      // Game complete
      setLevelIdx(0);
      setScore(0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 to-indigo-500 font-sans flex flex-col items-center py-8 px-4" dir="rtl">
      {/* Header */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-8">
        <button 
          onClick={() => navigate('/child')}
          className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-md hover:bg-white/30 transition-all"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
        
        <div className="flex items-center gap-4">
          <div className="bg-white/20 backdrop-blur-md px-6 py-2 rounded-full flex items-center gap-2 text-white font-black border border-white/30 shadow-lg">
            <Star className="w-5 h-5 text-yellow-300 fill-current" />
            <span>{score}</span>
          </div>
          <div className="bg-white/20 backdrop-blur-md px-6 py-2 rounded-full text-white font-black border border-white/30 shadow-lg">
            مرحلة {levelIdx + 1}/{LEVELS.length}
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="w-full max-w-2xl bg-white/10 backdrop-blur-lg rounded-[3rem] p-6 md:p-10 shadow-2xl border border-white/20 flex flex-col items-center">
        
        {/* Hint Section */}
        <div className="w-full mb-10">
          {!showHint ? (
            <button 
              onClick={() => setShowHint(true)}
              className="mx-auto flex items-center gap-2 bg-yellow-400 text-yellow-900 px-6 py-3 rounded-full font-bold shadow-lg hover:bg-yellow-300 transition-colors"
            >
              <Lightbulb className="w-5 h-5" /> إظهار تلميح
            </button>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/90 text-indigo-900 p-4 rounded-2xl text-center font-bold text-lg shadow-inner border-2 border-indigo-100"
            >
              {currentLevel.hint}
            </motion.div>
          )}
        </div>

        {/* Selected Letters (Drop Zone) */}
        <div className="flex flex-wrap justify-center gap-3 mb-12 min-h-[80px] w-full p-4 bg-black/10 rounded-3xl border-2 border-dashed border-white/30">
          <AnimatePresence>
            {selected.map((item) => (
              <motion.button
                key={`sel-${item.id}`}
                layoutId={`char-${item.id}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                onClick={() => handleDeselect(item)}
                className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-3xl md:text-4xl font-black shadow-lg transition-transform hover:scale-105
                  ${isWon ? 'bg-green-400 text-white border-b-4 border-green-600' : 'bg-white text-indigo-600 border-b-4 border-indigo-200'}`}
              >
                {item.char}
              </motion.button>
            ))}
          </AnimatePresence>
          {selected.length === 0 && (
            <div className="w-full h-full flex items-center justify-center text-white/50 font-bold text-lg">
              اضغطي على الحروف لترتيبها هنا
            </div>
          )}
        </div>

        {/* Scrambled Letters (Pick Zone) */}
        <div className="flex flex-wrap justify-center gap-3">
          <AnimatePresence>
            {scrambled.map((item) => (
              <motion.button
                key={`scr-${item.id}`}
                layoutId={`char-${item.id}`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleSelect(item)}
                className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-b from-indigo-100 to-white text-indigo-800 rounded-2xl flex items-center justify-center text-3xl md:text-4xl font-black shadow-xl border-b-4 border-indigo-300"
              >
                {item.char}
              </motion.button>
            ))}
          </AnimatePresence>
        </div>

      </div>

      {/* Win Overlay */}
      <AnimatePresence>
        {isWon && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="fixed bottom-10 left-0 right-0 mx-auto w-full max-w-md bg-white rounded-[2rem] p-6 shadow-2xl border-4 border-green-400 text-center z-50 flex flex-col items-center"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Trophy className="w-10 h-10 text-green-500" />
            </div>
            <h2 className="text-3xl font-black text-green-600 mb-2">أحسنتِ!</h2>
            <p className="text-slate-600 font-bold text-lg mb-6">لقد اكتشفتِ الكلمة السحرية بنجاح.</p>
            
            <button 
              onClick={nextLevel}
              className="w-full bg-gradient-to-r from-green-400 to-emerald-500 text-white font-black py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all text-xl"
            >
              {levelIdx < LEVELS.length - 1 ? 'المرحلة التالية ➡️' : 'العب من جديد 🔄'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
