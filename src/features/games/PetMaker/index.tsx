import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, Shuffle, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

const BODIES = [
  { id: 'b1', emoji: '🟣', color: 'bg-purple-200' },
  { id: 'b2', emoji: '🔵', color: 'bg-blue-200' },
  { id: 'b3', emoji: '🟢', color: 'bg-green-200' },
  { id: 'b4', emoji: '🟡', color: 'bg-yellow-200' },
  { id: 'b5', emoji: '🟠', color: 'bg-orange-200' },
  { id: 'b6', emoji: '🔴', color: 'bg-red-200' },
  { id: 'b7', emoji: '☁️', color: 'bg-slate-200' },
  { id: 'b8', emoji: '⭐', color: 'bg-amber-100' },
];

const EYES = ['👀', '👁️👁️', '😎', '😍', '🤩', '🥺', '😠', '😭', '🥸', '👽'];
const MOUTHS = ['👄', '👅', '😁', '😺', '👻', '🤖', '💋', '🦷', '🤐', ' pacman '];
const HATS = ['🎩', '👑', '🧢', '🎓', '🎀', '🌸', '🎧', '🦄', '🍄', '✨'];

export default function PetMaker() {
  const navigate = useNavigate();
  const [bodyIdx, setBodyIdx] = useState(0);
  const [eyeIdx, setEyeIdx] = useState(0);
  const [mouthIdx, setMouthIdx] = useState(0);
  const [hatIdx, setHatIdx] = useState(0);

  const randomize = () => {
    setBodyIdx(Math.floor(Math.random() * BODIES.length));
    setEyeIdx(Math.floor(Math.random() * EYES.length));
    setMouthIdx(Math.floor(Math.random() * MOUTHS.length));
    setHatIdx(Math.floor(Math.random() * HATS.length));
    
    confetti({
      particleCount: 30,
      spread: 50,
      origin: { y: 0.6 },
      colors: ['#a855f7', '#ec4899', '#3b82f6']
    });
  };

  const takePhoto = () => {
    toast.success('تم التقاط صورة لمرافقك السحري بنجاح! 📸');
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const nextItem = (setter: React.Dispatch<React.SetStateAction<number>>, max: number) => {
    setter(prev => (prev + 1) % max);
  };

  const prevItem = (setter: React.Dispatch<React.SetStateAction<number>>, max: number) => {
    setter(prev => (prev - 1 + max) % max);
  };

  const Selector = ({ label, onNext, onPrev }: { label: string, onNext: () => void, onPrev: () => void }) => (
    <div className="flex items-center justify-between bg-white/50 backdrop-blur-sm p-3 rounded-2xl border-2 border-white/60 shadow-sm">
      <button onClick={onPrev} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-pink-500 font-black text-xl shadow-md hover:scale-110 transition-transform">
        {'<'}
      </button>
      <span className="font-black text-slate-700 text-lg">{label}</span>
      <button onClick={onNext} className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-pink-500 font-black text-xl shadow-md hover:scale-110 transition-transform">
        {'>'}
      </button>
    </div>
  );

  return (
    <div className={`min-h-screen ${BODIES[bodyIdx].color} font-sans flex flex-col items-center py-8 px-4 transition-colors duration-500`} dir="rtl">
      {/* Header */}
      <div className="w-full max-w-md flex justify-between items-center mb-8 relative z-10">
        <button 
          onClick={() => navigate('/child')}
          className="w-12 h-12 bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center text-slate-700 shadow-md hover:bg-white transition-all"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
        <div className="flex items-center gap-2 bg-white/50 backdrop-blur-md px-6 py-3 rounded-full shadow-md">
          <Sparkles className="w-5 h-5 text-pink-500" />
          <h1 className="text-2xl font-black text-slate-800">صانع المرافق</h1>
        </div>
        <div className="w-12 h-12" />
      </div>

      {/* Main Character Display */}
      <div className="relative w-64 h-64 sm:w-80 sm:h-80 bg-white/40 backdrop-blur-md rounded-full shadow-2xl border-8 border-white/60 flex items-center justify-center mb-10 mt-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${bodyIdx}-${eyeIdx}-${mouthIdx}-${hatIdx}`}
            initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            exit={{ scale: 0.8, opacity: 0, rotate: 10 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className="relative flex flex-col items-center justify-center"
          >
            {/* Hat */}
            <div className="absolute -top-16 sm:-top-20 text-6xl sm:text-8xl z-20 drop-shadow-lg">
              {HATS[hatIdx]}
            </div>
            
            {/* Body */}
            <div className="text-9xl sm:text-[12rem] leading-none relative z-10 drop-shadow-2xl">
              {BODIES[bodyIdx].emoji}
              
              {/* Eyes */}
              <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl sm:text-6xl z-20 w-full text-center">
                {EYES[eyeIdx]}
              </div>
              
              {/* Mouth */}
              <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 text-4xl sm:text-5xl z-20">
                {MOUTHS[mouthIdx]}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Decorative sparkles */}
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="absolute -top-4 -right-4 text-3xl">✨</motion.div>
        <motion.div animate={{ rotate: -360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} className="absolute -bottom-4 -left-4 text-3xl">🌟</motion.div>
      </div>

      {/* Controls */}
      <div className="w-full max-w-md space-y-4 relative z-10">
        <Selector 
          label="الجسم" 
          onNext={() => nextItem(setBodyIdx, BODIES.length)} 
          onPrev={() => prevItem(setBodyIdx, BODIES.length)} 
        />
        <Selector 
          label="العيون" 
          onNext={() => nextItem(setEyeIdx, EYES.length)} 
          onPrev={() => prevItem(setEyeIdx, EYES.length)} 
        />
        <Selector 
          label="الفم" 
          onNext={() => nextItem(setMouthIdx, MOUTHS.length)} 
          onPrev={() => prevItem(setMouthIdx, MOUTHS.length)} 
        />
        <Selector 
          label="القبعة / الزينة" 
          onNext={() => nextItem(setHatIdx, HATS.length)} 
          onPrev={() => prevItem(setHatIdx, HATS.length)} 
        />
      </div>

      {/* Action Buttons */}
      <div className="w-full max-w-md flex gap-4 mt-8 relative z-10">
        <button 
          onClick={randomize}
          className="flex-1 bg-white text-pink-500 font-black py-4 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 text-lg"
        >
          <Shuffle className="w-6 h-6" /> عشوائي
        </button>
        <button 
          onClick={takePhoto}
          className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-black py-4 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2 text-lg"
        >
          <Camera className="w-6 h-6" /> تصوير
        </button>
      </div>
    </div>
  );
}
