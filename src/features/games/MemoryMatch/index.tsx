import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Trophy, RotateCcw, Star } from 'lucide-react';
import confetti from 'canvas-confetti';

const EMOJIS = ['🦄', '🧚‍♀️', '🪄', '🌟', '👑', '🦋', '🌸', '🏰'];

interface CardData {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export default function MemoryMatch() {
  const navigate = useNavigate();
  const [cards, setCards] = useState<CardData[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  // Initialize game
  const initializeGame = () => {
    const shuffledCards = [...EMOJIS, ...EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffledCards);
    setFlippedIndices([]);
    setMoves(0);
    setMatches(0);
    setIsWon(false);
    setIsLocked(false);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  const handleCardClick = (index: number) => {
    if (isLocked || cards[index].isFlipped || cards[index].isMatched) return;

    // Play flip sound (synthesized)
    playTone(400, 'sine', 0.1);

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlippedIndices = [...flippedIndices, index];
    setFlippedIndices(newFlippedIndices);

    if (newFlippedIndices.length === 2) {
      setIsLocked(true);
      setMoves((m) => m + 1);

      const [firstIndex, secondIndex] = newFlippedIndices;
      if (newCards[firstIndex].emoji === newCards[secondIndex].emoji) {
        // Match found
        setTimeout(() => {
          playTone(600, 'triangle', 0.15);
          playTone(800, 'triangle', 0.15, 0.1);
          
          const matchedCards = [...newCards];
          matchedCards[firstIndex].isMatched = true;
          matchedCards[secondIndex].isMatched = true;
          setCards(matchedCards);
          setFlippedIndices([]);
          setMatches((m) => {
            const newMatches = m + 1;
            if (newMatches === EMOJIS.length) {
              handleWin();
            }
            return newMatches;
          });
          setIsLocked(false);
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          playTone(200, 'sawtooth', 0.2);
          const resetCards = [...newCards];
          resetCards[firstIndex].isFlipped = false;
          resetCards[secondIndex].isFlipped = false;
          setCards(resetCards);
          setFlippedIndices([]);
          setIsLocked(false);
        }, 1000);
      }
    }
  };

  const handleWin = () => {
    setIsWon(true);
    playTone(400, 'sine', 0.1);
    playTone(500, 'sine', 0.1, 0.1);
    playTone(600, 'sine', 0.2, 0.2);
    playTone(800, 'sine', 0.4, 0.4);
    
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#ffb7b2', '#e2f0cb', '#b5ead7', '#c7ceea']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#ffb7b2', '#e2f0cb', '#b5ead7', '#c7ceea']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  // Simple Web Audio API synthesizer for sound effects
  const playTone = (frequency: number, type: OscillatorType, duration: number, delay = 0) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime + delay);
      
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime + delay);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + delay + duration);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start(audioCtx.currentTime + delay);
      oscillator.stop(audioCtx.currentTime + delay + duration);
    } catch (e) {
      console.log('Audio not supported or blocked');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-fuchsia-900 font-sans overflow-hidden flex flex-col items-center py-8 px-4" dir="rtl">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20" />
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_50%)]"
        />
      </div>

      {/* Header */}
      <div className="relative z-10 w-full max-w-4xl flex justify-between items-center mb-8">
        <button 
          onClick={() => navigate('/child')}
          className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
        
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 shadow-xl">
          <Sparkles className="w-6 h-6 text-yellow-300" />
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-wider">الذاكرة السحرية</h1>
          <Sparkles className="w-6 h-6 text-yellow-300" />
        </div>

        <div className="w-12 h-12" /> {/* Spacer for centering */}
      </div>

      {/* Stats */}
      <div className="relative z-10 flex gap-6 mb-8 text-white font-bold text-lg bg-black/20 px-8 py-3 rounded-2xl backdrop-blur-sm border border-white/10">
        <div className="flex items-center gap-2">
          <RotateCcw className="w-5 h-5 text-sky-400" />
          <span>الحركات: {moves}</span>
        </div>
        <div className="w-px h-6 bg-white/20" />
        <div className="flex items-center gap-2">
          <Star className="w-5 h-5 text-yellow-400" />
          <span>التطابق: {matches} / {EMOJIS.length}</span>
        </div>
      </div>

      {/* Game Grid */}
      <div className="relative z-10 grid grid-cols-4 gap-3 md:gap-4 lg:gap-6 max-w-2xl w-full perspective-1000">
        <AnimatePresence>
          {cards.map((card, index) => (
            <motion.div
              key={card.id}
              initial={{ opacity: 0, scale: 0.5, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="aspect-square relative cursor-pointer group"
              onClick={() => handleCardClick(index)}
              style={{ perspective: 1000 }}
            >
              <motion.div
                className="w-full h-full relative preserve-3d duration-500"
                animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Card Back */}
                <div 
                  className="absolute inset-0 backface-hidden bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl md:rounded-3xl shadow-xl border-2 border-white/20 flex items-center justify-center group-hover:shadow-purple-500/50 transition-shadow"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <Sparkles className="w-8 h-8 md:w-12 md:h-12 text-white/50" />
                </div>

                {/* Card Front */}
                <div 
                  className={`absolute inset-0 backface-hidden bg-white rounded-2xl md:rounded-3xl shadow-xl border-4 flex items-center justify-center text-4xl md:text-6xl ${card.isMatched ? 'border-green-400 shadow-green-400/50' : 'border-purple-300'}`}
                  style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <motion.span
                    animate={card.isMatched ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    {card.emoji}
                  </motion.span>
                  
                  {card.isMatched && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute -top-2 -right-2 bg-green-400 rounded-full p-1 shadow-lg"
                    >
                      <Star className="w-4 h-4 text-white fill-current" />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Win Modal */}
      <AnimatePresence>
        {isWon && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: 100 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.5, y: 100 }}
              className="bg-white rounded-[3rem] p-8 md:p-12 max-w-md w-full text-center shadow-2xl border-8 border-yellow-300 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 pointer-events-none" />
              
              <motion.div
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-32 h-32 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner border-4 border-yellow-200"
              >
                <Trophy className="w-16 h-16 text-yellow-500" />
              </motion.div>

              <h2 className="text-4xl font-black text-purple-600 mb-4 drop-shadow-sm">أنتِ بطلة!</h2>
              <p className="text-xl text-slate-600 font-bold mb-8">
                لقد طابقتِ جميع البطاقات السحرية في <span className="text-sky-500">{moves}</span> حركة فقط!
              </p>

              <div className="flex flex-col gap-3 relative z-10">
                <button
                  onClick={initializeGame}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-black py-4 rounded-2xl text-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                >
                  العب مرة أخرى 🪄
                </button>
                <button
                  onClick={() => navigate('/child')}
                  className="w-full bg-slate-100 text-slate-600 font-bold py-4 rounded-2xl text-lg hover:bg-slate-200 transition-all"
                >
                  العودة للوحة القيادة
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
