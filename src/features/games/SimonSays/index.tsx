import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Play, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const COLORS = [
  { id: 0, color: 'bg-red-500', active: 'bg-red-300 shadow-[0_0_30px_rgba(248,113,113,1)]', sound: 329.63 }, // E4
  { id: 1, color: 'bg-blue-500', active: 'bg-blue-300 shadow-[0_0_30px_rgba(96,165,250,1)]', sound: 261.63 }, // C4
  { id: 2, color: 'bg-yellow-400', active: 'bg-yellow-200 shadow-[0_0_30px_rgba(253,224,71,1)]', sound: 293.66 }, // D4
  { id: 3, color: 'bg-green-500', active: 'bg-green-300 shadow-[0_0_30px_rgba(134,239,172,1)]', sound: 392.00 }, // G4
];

export default function SimonSays() {
  const navigate = useNavigate();
  const [sequence, setSequence] = useState<number[]>([]);
  const [playerSequence, setPlayerSequence] = useState<number[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeColor, setActiveColor] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [isShowingSequence, setIsShowingSequence] = useState(false);

  useEffect(() => {
    const savedBest = localStorage.getItem('simon_best');
    if (savedBest) setBestScore(parseInt(savedBest, 10));
  }, []);

  const playTone = (frequency: number) => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);
      
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.log('Audio not supported');
    }
  };

  const playErrorTone = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.5);
      
      gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
      console.log('Audio not supported');
    }
  };

  const activateColor = useCallback((colorId: number, duration: number = 400) => {
    setActiveColor(colorId);
    playTone(COLORS[colorId].sound);
    setTimeout(() => setActiveColor(null), duration);
  }, []);

  const nextRound = useCallback((currentSeq: number[]) => {
    setIsShowingSequence(true);
    const newColor = Math.floor(Math.random() * 4);
    const newSeq = [...currentSeq, newColor];
    setSequence(newSeq);
    setPlayerSequence([]);

    let i = 0;
    const interval = setInterval(() => {
      activateColor(newSeq[i]);
      i++;
      if (i >= newSeq.length) {
        clearInterval(interval);
        setTimeout(() => setIsShowingSequence(false), 500);
      }
    }, 800);
  }, [activateColor]);

  const startGame = () => {
    setSequence([]);
    setPlayerSequence([]);
    setScore(0);
    setGameOver(false);
    setIsPlaying(true);
    nextRound([]);
  };

  const handleColorClick = (colorId: number) => {
    if (!isPlaying || isShowingSequence || gameOver) return;

    activateColor(colorId, 200);
    
    const newPlayerSeq = [...playerSequence, colorId];
    setPlayerSequence(newPlayerSeq);

    const currentIndex = newPlayerSeq.length - 1;

    if (newPlayerSeq[currentIndex] !== sequence[currentIndex]) {
      // Wrong move
      playErrorTone();
      setGameOver(true);
      setIsPlaying(false);
      if (score > bestScore) {
        setBestScore(score);
        localStorage.setItem('simon_best', score.toString());
      }
      return;
    }

    if (newPlayerSeq.length === sequence.length) {
      // Round complete
      setScore(s => s + 1);
      setTimeout(() => nextRound(sequence), 1000);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 font-sans flex flex-col items-center py-8 px-4" dir="rtl">
      <div className="w-full max-w-md flex justify-between items-center mb-12">
        <button 
          onClick={() => navigate('/child')}
          className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
        <h1 className="text-3xl font-black text-white tracking-widest">سيمون يقول</h1>
        <div className="w-12 h-12" />
      </div>

      <div className="flex gap-8 mb-12">
        <div className="text-center">
          <div className="text-slate-400 text-sm font-bold mb-1">النقاط</div>
          <div className="text-3xl font-black text-white">{score}</div>
        </div>
        <div className="w-px bg-slate-700" />
        <div className="text-center">
          <div className="text-slate-400 text-sm font-bold mb-1">أفضل نتيجة</div>
          <div className="text-3xl font-black text-yellow-400 flex items-center justify-center gap-1">
            <Trophy className="w-5 h-5" /> {bestScore}
          </div>
        </div>
      </div>

      <div className="relative w-72 h-72 sm:w-80 sm:h-80 bg-slate-800 rounded-full p-4 shadow-2xl border-8 border-slate-700">
        <div className="grid grid-cols-2 grid-rows-2 gap-4 w-full h-full rounded-full overflow-hidden">
          {COLORS.map((c, i) => {
            const isTopLeft = i === 0;
            const isTopRight = i === 1;
            const isBottomLeft = i === 2;
            const isBottomRight = i === 3;
            
            return (
              <motion.button
                key={c.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleColorClick(c.id)}
                disabled={isShowingSequence || !isPlaying}
                className={`
                  ${activeColor === c.id ? c.active : c.color}
                  transition-all duration-200
                  ${isTopLeft ? 'rounded-tl-full' : ''}
                  ${isTopRight ? 'rounded-tr-full' : ''}
                  ${isBottomLeft ? 'rounded-bl-full' : ''}
                  ${isBottomRight ? 'rounded-br-full' : ''}
                  ${!isPlaying || isShowingSequence ? 'cursor-not-allowed opacity-80' : 'cursor-pointer hover:brightness-110'}
                `}
              />
            );
          })}
        </div>

        {/* Center Button */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-slate-900 rounded-full border-8 border-slate-800 flex items-center justify-center z-10 shadow-inner">
          {!isPlaying ? (
            <button 
              onClick={startGame}
              className="w-full h-full rounded-full flex items-center justify-center text-white hover:text-green-400 transition-colors"
            >
              <Play className="w-8 h-8 ml-1" />
            </button>
          ) : (
            <div className="text-white font-black text-2xl">
              {isShowingSequence ? '...' : score}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {gameOver && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mt-12 text-center"
          >
            <h2 className="text-2xl font-black text-red-400 mb-4">انتهت اللعبة!</h2>
            <button 
              onClick={startGame}
              className="bg-white text-slate-900 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-slate-200 transition-all"
            >
              العب مرة أخرى
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
