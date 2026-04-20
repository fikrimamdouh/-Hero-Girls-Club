import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Trophy, RotateCcw, ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';

const GRID_SIZE = 20;
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 10, y: 11 },
  { x: 10, y: 12 }
];
const INITIAL_DIRECTION = { x: 0, y: -1 }; // Moving up
const INITIAL_SPEED = 150;

type Point = { x: number; y: number };

export default function SnakeGame() {
  const navigate = useNavigate();
  const [snake, setSnake] = useState<Point[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Point>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Point>({ x: 5, y: 5 });
  const [status, setStatus] = useState<'idle' | 'playing' | 'gameover'>('idle');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  
  const directionRef = useRef(direction);
  const lastMoveTimeRef = useRef(0);
  const requestRef = useRef<number>(0);

  // Generate random food
  const generateFood = useCallback((currentSnake: Point[]): Point => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE)
      };
      // Make sure food doesn't spawn on the snake
      const isOnSnake = currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y);
      if (!isOnSnake) break;
    }
    return newFood;
  }, []);

  // Handle Keyboard Controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (status !== 'playing') return;
      
      const { key } = e;
      const currentDir = directionRef.current;
      
      if ((key === 'ArrowUp' || key === 'w') && currentDir.y !== 1) {
        directionRef.current = { x: 0, y: -1 };
      } else if ((key === 'ArrowDown' || key === 's') && currentDir.y !== -1) {
        directionRef.current = { x: 0, y: 1 };
      } else if ((key === 'ArrowLeft' || key === 'a') && currentDir.x !== 1) {
        directionRef.current = { x: -1, y: 0 };
      } else if ((key === 'ArrowRight' || key === 'd') && currentDir.x !== -1) {
        directionRef.current = { x: 1, y: 0 };
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status]);

  // Mobile Controls
  const handleMobileControl = (newDir: Point) => {
    if (status !== 'playing') return;
    const currentDir = directionRef.current;
    
    // Prevent 180-degree turns
    if (newDir.x !== 0 && currentDir.x === -newDir.x) return;
    if (newDir.y !== 0 && currentDir.y === -newDir.y) return;
    
    directionRef.current = newDir;
  };

  // Game Loop
  const updateGame = useCallback((time: number) => {
    if (status !== 'playing') return;

    const speed = Math.max(50, INITIAL_SPEED - (score * 2)); // Gets faster

    if (time - lastMoveTimeRef.current > speed) {
      setSnake(prevSnake => {
        const head = prevSnake[0];
        const newHead = {
          x: head.x + directionRef.current.x,
          y: head.y + directionRef.current.y
        };

        // Check wall collision
        if (
          newHead.x < 0 || 
          newHead.x >= GRID_SIZE || 
          newHead.y < 0 || 
          newHead.y >= GRID_SIZE
        ) {
          setStatus('gameover');
          if (score > highScore) setHighScore(score);
          return prevSnake;
        }

        // Check self collision
        if (prevSnake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
          setStatus('gameover');
          if (score > highScore) setHighScore(score);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Check food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore(s => s + 10);
          setFood(generateFood(newSnake));
          // Don't pop the tail, so snake grows
        } else {
          newSnake.pop(); // Remove tail
        }

        return newSnake;
      });
      
      lastMoveTimeRef.current = time;
    }

    requestRef.current = requestAnimationFrame(updateGame);
  }, [status, food, score, highScore, generateFood]);

  useEffect(() => {
    if (status === 'playing') {
      requestRef.current = requestAnimationFrame(updateGame);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [status, updateGame]);

  const startGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    directionRef.current = INITIAL_DIRECTION;
    setScore(0);
    setFood(generateFood(INITIAL_SNAKE));
    setStatus('playing');
    lastMoveTimeRef.current = performance.now();
  };

  return (
    <div className="min-h-screen bg-slate-900 font-sans flex flex-col" dir="rtl">
      {/* Header */}
      <header className="bg-slate-800 text-white p-4 flex justify-between items-center z-10 shadow-md">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/maria-games')} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <ArrowRight className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-black flex items-center gap-2">
            <span className="text-2xl">🐍</span> الثعبان الجائع
          </h1>
        </div>
        <div className="flex gap-4 items-center font-black text-lg">
          <div className="flex items-center gap-1 text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-lg">
            <Trophy className="w-5 h-5" />
            {score}
          </div>
        </div>
      </header>

      {/* Game Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-4 relative">
        
        {/* Game Board */}
        <div 
          className="bg-slate-800 border-4 border-emerald-500 rounded-lg shadow-2xl shadow-emerald-500/20 relative"
          style={{ 
            width: '100%', 
            maxWidth: '400px', 
            aspectRatio: '1/1',
            display: 'grid',
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`
          }}
        >
          {/* Render Food */}
          <div 
            className="bg-rose-500 rounded-full shadow-[0_0_10px_rgba(244,63,94,0.8)]"
            style={{
              gridColumnStart: food.x + 1,
              gridRowStart: food.y + 1,
              transform: 'scale(0.8)'
            }}
          />

          {/* Render Snake */}
          {snake.map((segment, index) => {
            const isHead = index === 0;
            return (
              <div 
                key={`${segment.x}-${segment.y}-${index}`}
                className={`${isHead ? 'bg-emerald-400 z-10' : 'bg-emerald-600'} rounded-sm`}
                style={{
                  gridColumnStart: segment.x + 1,
                  gridRowStart: segment.y + 1,
                  transform: isHead ? 'scale(1.1)' : 'scale(0.95)'
                }}
              />
            );
          })}
        </div>

        {/* Mobile D-Pad */}
        <div className="mt-8 grid grid-cols-3 gap-2 md:hidden w-48">
          <div />
          <button 
            onClick={() => handleMobileControl({ x: 0, y: -1 })}
            className="bg-slate-700 p-4 rounded-xl flex items-center justify-center active:bg-emerald-500 transition-colors"
          >
            <ChevronUp className="w-8 h-8 text-white" />
          </button>
          <div />
          <button 
            onClick={() => handleMobileControl({ x: -1, y: 0 })}
            className="bg-slate-700 p-4 rounded-xl flex items-center justify-center active:bg-emerald-500 transition-colors"
          >
            <ChevronRight className="w-8 h-8 text-white" />
          </button>
          <button 
            onClick={() => handleMobileControl({ x: 0, y: 1 })}
            className="bg-slate-700 p-4 rounded-xl flex items-center justify-center active:bg-emerald-500 transition-colors"
          >
            <ChevronDown className="w-8 h-8 text-white" />
          </button>
          <button 
            onClick={() => handleMobileControl({ x: 1, y: 0 })}
            className="bg-slate-700 p-4 rounded-xl flex items-center justify-center active:bg-emerald-500 transition-colors"
          >
            <ChevronLeft className="w-8 h-8 text-white" />
          </button>
        </div>

        {/* Overlays */}
        <AnimatePresence>
          {status === 'idle' && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20"
            >
              <div className="bg-white p-8 rounded-[3rem] text-center max-w-md mx-4 shadow-2xl border-4 border-emerald-100">
                <div className="text-8xl mb-4 animate-bounce">🐍</div>
                <h2 className="text-3xl font-black text-slate-800 mb-2">الثعبان الجائع</h2>
                <p className="text-slate-600 font-bold mb-6">
                  استخدمي الأسهم (أو الأزرار) لتحريك الثعبان. كلي التفاح لتكبري، ولكن احذري من الاصطدام بالجدران أو بنفسك!
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
                <div className="flex gap-4 mb-6">
                  <div className="flex-1 bg-slate-50 rounded-2xl p-4">
                    <p className="text-slate-500 font-bold mb-1">النقاط</p>
                    <p className="text-3xl font-black text-emerald-500">{score}</p>
                  </div>
                  <div className="flex-1 bg-slate-50 rounded-2xl p-4">
                    <p className="text-slate-500 font-bold mb-1">أعلى نتيجة</p>
                    <p className="text-3xl font-black text-amber-500">{highScore}</p>
                  </div>
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
