import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Heart, RotateCcw, Trophy, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const FRUITS = ['🍎', '🍌', '🍇', '🍓', '🍊', '🍉', '🍍', '🥝'];
const HAZARDS = ['💣', '🕷️'];

interface FallingItem {
  id: number;
  emoji: string;
  x: number;
  y: number;
  type: 'fruit' | 'hazard';
  speed: number;
}

export default function FruitCatcher() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [items, setItems] = useState<FallingItem[]>([]);
  const [basketX, setBasketX] = useState(50); // percentage 0-100
  
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);
  const lastItemTime = useRef<number>(0);
  const itemIdCounter = useRef(0);

  // Handle mouse/touch movement for basket
  const handleMove = useCallback((clientX: number) => {
    if (status !== 'playing' || !gameAreaRef.current) return;
    const element = gameAreaRef.current;
    if (typeof element.getBoundingClientRect !== 'function') return;
    const rect = element.getBoundingClientRect();
    const x = clientX - rect.left;
    let percentage = (x / rect.width) * 100;
    // Keep basket within bounds (basket is roughly 15% wide, so clamp 7.5 to 92.5)
    percentage = Math.max(7.5, Math.min(92.5, percentage));
    setBasketX(percentage);
  }, [status]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX);
    const handleTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX);

    if (status === 'playing') {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [status, handleMove]);

  // Game Loop
  const updateGame = useCallback((time: number) => {
    if (status !== 'playing') return;

    // Spawn new items
    if (time - lastItemTime.current > 1000 - Math.min(score * 10, 600)) { // Gets faster as score increases
      const isHazard = Math.random() > 0.8; // 20% chance of hazard
      const emojiList = isHazard ? HAZARDS : FRUITS;
      const emoji = emojiList[Math.floor(Math.random() * emojiList.length)];
      
      setItems(prev => [...prev, {
        id: itemIdCounter.current++,
        emoji,
        x: Math.random() * 90 + 5, // 5% to 95%
        y: -10,
        type: isHazard ? 'hazard' : 'fruit',
        speed: Math.random() * 0.5 + 0.5 + (score * 0.02) // Speed increases with score
      }]);
      lastItemTime.current = time;
    }

    // Update item positions and check collisions
    setItems(prev => {
      const newItems: FallingItem[] = [];
      let currentLives = lives;
      let currentScore = score;

      prev.forEach(item => {
        const newY = item.y + item.speed;
        
        // Check collision with basket (basket is at y: 85-95, x: basketX-7.5 to basketX+7.5)
        const inCatchZoneY = newY > 85 && newY < 95;
        const inCatchZoneX = Math.abs(item.x - basketX) < 10;

        if (inCatchZoneY && inCatchZoneX) {
          // Caught!
          if (item.type === 'fruit') {
            currentScore += 1;
            setScore(currentScore);
          } else {
            currentLives -= 1;
            setLives(currentLives);
          }
        } else if (newY > 100) {
          // Missed
          if (item.type === 'fruit') {
            currentLives -= 1;
            setLives(currentLives);
          }
        } else {
          // Still falling
          newItems.push({ ...item, y: newY });
        }
      });

      if (currentLives <= 0) {
        setStatus('gameover');
      }

      return newItems;
    });

    requestRef.current = requestAnimationFrame(updateGame);
  }, [status, basketX, score, lives]);

  useEffect(() => {
    if (status === 'playing') {
      requestRef.current = requestAnimationFrame(updateGame);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [status, updateGame]);

  const startGame = () => {
    setScore(0);
    setLives(3);
    setItems([]);
    setStatus('playing');
    lastItemTime.current = performance.now();
  };

  return (
    <div className="min-h-screen bg-slate-900 font-sans flex flex-col" dir="rtl">
      {/* Game Header */}
      <header className="bg-slate-800 text-white p-4 flex justify-between items-center z-10 shadow-md">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/maria-games')} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <ArrowRight className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-black flex items-center gap-2">
            <span className="text-2xl">🍉</span> صائدة الفواكه
          </h1>
        </div>
        <div className="flex gap-4 items-center font-black text-lg">
          <div className="flex items-center gap-1 text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-lg">
            <Trophy className="w-5 h-5" />
            {score}
          </div>
          <div className="flex items-center gap-1 text-rose-400 bg-rose-400/10 px-3 py-1 rounded-lg">
            <Heart className="w-5 h-5 fill-current" />
            {lives}
          </div>
        </div>
      </header>

      {/* Game Area */}
      <main 
        ref={gameAreaRef}
        className="flex-1 relative overflow-hidden bg-gradient-to-b from-sky-300 to-sky-100 cursor-none"
      >
        {/* Background Elements */}
        <div className="absolute top-10 left-10 text-6xl opacity-50">☁️</div>
        <div className="absolute top-20 right-20 text-8xl opacity-50">☁️</div>
        <div className="absolute bottom-0 w-full h-32 bg-emerald-400 rounded-t-[50%] scale-150 translate-y-16"></div>

        {/* Falling Items */}
        {items.map(item => (
          <div 
            key={item.id}
            className="absolute text-4xl md:text-5xl drop-shadow-md"
            style={{ 
              left: `${item.x}%`, 
              top: `${item.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
          >
            {item.emoji}
          </div>
        ))}

        {/* Basket */}
        <div 
          className="absolute bottom-10 text-6xl md:text-7xl drop-shadow-xl transition-transform duration-75"
          style={{ 
            left: `${basketX}%`,
            transform: 'translateX(-50%)'
          }}
        >
          🧺
        </div>

        {/* Overlays */}
        <AnimatePresence>
          {status === 'idle' && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-20"
            >
              <div className="bg-white p-8 rounded-[3rem] text-center max-w-md mx-4 shadow-2xl border-4 border-emerald-100">
                <div className="text-8xl mb-4 animate-bounce">🍉</div>
                <h2 className="text-3xl font-black text-slate-800 mb-2">صائدة الفواكه</h2>
                <p className="text-slate-600 font-bold mb-6">
                  حركي السلة لجمع الفواكه اللذيذة وتجنبي القنابل! إذا سقطت 3 فواكه أو جمعتِ قنبلة ستخسرين محاولة.
                </p>
                <button 
                  onClick={startGame}
                  className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black text-xl hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200"
                >
                  ابدئي اللعب الآن!
                </button>
              </div>
            </motion.div>
          )}

          {status === 'gameover' && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-20"
            >
              <div className="bg-white p-8 rounded-[3rem] text-center max-w-md mx-4 shadow-2xl border-4 border-rose-100">
                <div className="text-8xl mb-4">💥</div>
                <h2 className="text-3xl font-black text-slate-800 mb-2">انتهت اللعبة!</h2>
                <div className="bg-slate-50 rounded-2xl p-4 mb-6">
                  <p className="text-slate-500 font-bold mb-1">النقاط التي جمعتها</p>
                  <p className="text-4xl font-black text-emerald-500">{score}</p>
                </div>
                <div className="flex gap-3">
                  <button 
                    onClick={() => navigate('/maria-games')}
                    className="flex-1 bg-slate-100 text-slate-600 py-4 rounded-2xl font-black hover:bg-slate-200 transition-colors"
                  >
                    خروج
                  </button>
                  <button 
                    onClick={startGame}
                    className="flex-[2] bg-rose-500 text-white py-4 rounded-2xl font-black hover:bg-rose-600 transition-colors shadow-lg shadow-rose-200 flex items-center justify-center gap-2"
                  >
                    <RotateCcw className="w-6 h-6" />
                    العب مرة أخرى
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
