import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Star, Clock, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

type HoleState = 'empty' | 'star' | 'bomb';

export default function WhackAStar() {
  const navigate = useNavigate();
  const [holes, setHoles] = useState<HoleState[]>(Array(9).fill('empty'));
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [highScore, setHighScore] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem('whack_star_best');
    if (saved) setHighScore(parseInt(saved, 10));
  }, []);

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setIsPlaying(true);
    setGameOver(false);
    setHoles(Array(9).fill('empty'));
  };

  const endGame = useCallback(() => {
    setIsPlaying(false);
    setGameOver(true);
    setHoles(Array(9).fill('empty'));
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('whack_star_best', score.toString());
    }
  }, [score, highScore]);

  // Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isPlaying) {
      endGame();
    }
    return () => clearInterval(timer);
  }, [isPlaying, timeLeft, endGame]);

  // Game Loop (Spawning)
  useEffect(() => {
    let spawner: NodeJS.Timeout;
    if (isPlaying) {
      spawner = setInterval(() => {
        setHoles(prev => {
          const newHoles = [...prev];
          
          // Clear some existing items randomly
          newHoles.forEach((h, i) => {
            if (h !== 'empty' && Math.random() > 0.5) {
              newHoles[i] = 'empty';
            }
          });

          // Spawn new items
          const emptyIndices = newHoles.map((h, i) => h === 'empty' ? i : -1).filter(i => i !== -1);
          if (emptyIndices.length > 0) {
            const numToSpawn = Math.floor(Math.random() * 3) + 1; // Spawn 1 to 3 items
            for (let i = 0; i < numToSpawn; i++) {
              if (emptyIndices.length === 0) break;
              const randIdx = Math.floor(Math.random() * emptyIndices.length);
              const targetHole = emptyIndices.splice(randIdx, 1)[0];
              // 80% chance for star, 20% for bomb
              newHoles[targetHole] = Math.random() > 0.2 ? 'star' : 'bomb';
            }
          }
          return newHoles;
        });
      }, 800); // Speed of spawning
    }
    return () => clearInterval(spawner);
  }, [isPlaying]);

  const handleHit = (index: number) => {
    if (!isPlaying) return;

    const type = holes[index];
    if (type === 'empty') return;

    if (type === 'star') {
      setScore(s => s + 10);
      playTone(600, 'sine');
    } else if (type === 'bomb') {
      setScore(s => Math.max(0, s - 20));
      playTone(200, 'sawtooth');
      // Shake screen effect could go here
    }

    // Clear the hole
    setHoles(prev => {
      const newHoles = [...prev];
      newHoles[index] = 'empty';
      return newHoles;
    });
  };

  const playTone = (freq: number, type: OscillatorType) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch(e) {}
  };

  return (
    <div className="min-h-screen bg-slate-900 font-sans flex flex-col items-center py-8 px-4 relative overflow-hidden" dir="rtl">
      {/* Background Stars */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div 
            key={i} 
            className="absolute bg-white rounded-full animate-pulse"
            style={{
              width: Math.random() * 4 + 2 + 'px',
              height: Math.random() * 4 + 2 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              animationDuration: Math.random() * 3 + 1 + 's'
            }}
          />
        ))}
      </div>

      {/* Header */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-8 relative z-10">
        <button 
          onClick={() => navigate('/child')}
          className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-md hover:bg-white/20 transition-all"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500 drop-shadow-lg">
          صيد النجوم
        </h1>
        <div className="w-12 h-12" />
      </div>

      {/* Stats Board */}
      <div className="w-full max-w-md flex justify-between gap-4 mb-10 relative z-10">
        <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center border border-white/20">
          <div className="text-slate-400 font-bold text-sm mb-1 flex items-center justify-center gap-1">
            <Clock className="w-4 h-4" /> الوقت
          </div>
          <div className={`text-3xl font-black ${timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
            {timeLeft}ث
          </div>
        </div>
        <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center border border-white/20">
          <div className="text-slate-400 font-bold text-sm mb-1 flex items-center justify-center gap-1">
            <Star className="w-4 h-4" /> النقاط
          </div>
          <div className="text-3xl font-black text-yellow-400">{score}</div>
        </div>
      </div>

      {/* Game Grid */}
      <div className="relative z-10 bg-white/5 p-6 rounded-[3rem] backdrop-blur-sm border border-white/10 shadow-2xl">
        <div className="grid grid-cols-3 gap-4 sm:gap-6">
          {holes.map((state, index) => (
            <div 
              key={index}
              className="w-24 h-24 sm:w-28 sm:h-28 bg-slate-800/80 rounded-full shadow-inner border-4 border-slate-700 relative overflow-hidden flex items-end justify-center cursor-pointer"
              onClick={() => handleHit(index)}
            >
              {/* Cloud base */}
              <div className="absolute bottom-0 w-full h-1/3 bg-slate-600/50 rounded-b-full z-20" />
              
              <AnimatePresence>
                {state !== 'empty' && (
                  <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: -10, opacity: 1 }}
                    exit={{ y: 50, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="relative z-10 mb-4"
                  >
                    {state === 'star' ? (
                      <div className="text-5xl sm:text-6xl drop-shadow-[0_0_15px_rgba(253,224,71,0.8)] filter">
                        ⭐
                      </div>
                    ) : (
                      <div className="text-5xl sm:text-6xl drop-shadow-[0_0_15px_rgba(248,113,113,0.8)] filter">
                        💣
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      {/* Start / Game Over Overlay */}
      <AnimatePresence>
        {(!isPlaying || gameOver) && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-slate-800 p-8 rounded-[3rem] border-4 border-slate-600 max-w-sm w-full text-center shadow-2xl"
            >
              <div className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-yellow-400" />
              </div>
              
              {gameOver ? (
                <>
                  <h2 className="text-3xl font-black text-white mb-2">انتهى الوقت!</h2>
                  <p className="text-slate-400 mb-6">لقد جمعت <span className="text-yellow-400 font-black text-xl">{score}</span> نقطة</p>
                  {score >= highScore && score > 0 && (
                    <div className="bg-yellow-500/20 text-yellow-300 p-3 rounded-xl font-bold mb-6 border border-yellow-500/30">
                      رقم قياسي جديد! 🏆
                    </div>
                  )}
                </>
              ) : (
                <>
                  <h2 className="text-3xl font-black text-white mb-2">مستعدة؟</h2>
                  <p className="text-slate-400 mb-6">اصطادي النجوم ⭐ وتجنبي القنابل 💣</p>
                </>
              )}

              <button 
                onClick={startGame}
                className="w-full bg-gradient-to-r from-yellow-400 to-amber-500 text-amber-950 font-black py-4 rounded-2xl text-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                {gameOver ? 'العب مرة أخرى' : 'ابدأ اللعب الآن'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
