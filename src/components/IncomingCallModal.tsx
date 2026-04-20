import React, { useEffect } from 'react';
import { CallSession } from '../types';
import { Phone, PhoneOff, Video } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface IncomingCallModalProps {
  call: CallSession;
  onAccept: () => void;
  onReject: () => void;
}

export const IncomingCallModal: React.FC<IncomingCallModalProps> = ({ call, onAccept, onReject }) => {
  useEffect(() => {
    // Play ringtone
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.loop = true;
    audio.play().catch(e => console.error('Audio play failed:', e));

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  return (
    <AnimatePresence>
      <motion.div 
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] bg-white rounded-2xl shadow-2xl p-4 flex items-center gap-6 border border-slate-100 min-w-[320px]"
      >
        <div className="relative">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center text-3xl shadow-inner animate-pulse">
            {call.callerAvatar?.hairStyle === 'spiky' ? '👦' : '👧'}
          </div>
          <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
            {call.type === 'video' ? <Video className="w-4 h-4 text-blue-500" /> : <Phone className="w-4 h-4 text-blue-500" />}
          </div>
        </div>
        
        <div className="flex-1">
          <h3 className="font-bold text-lg text-slate-800">{call.callerName}</h3>
          <p className="text-sm text-slate-500">
            {call.type === 'video' ? 'مكالمة فيديو واردة...' : 'مكالمة صوتية واردة...'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={onReject}
            className="w-12 h-12 bg-red-100 text-red-600 hover:bg-red-500 hover:text-white rounded-full flex items-center justify-center transition-colors"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
          <button 
            onClick={onAccept}
            className="w-12 h-12 bg-green-500 text-white hover:bg-green-600 rounded-full flex items-center justify-center transition-colors shadow-lg shadow-green-500/30 animate-bounce"
          >
            <Phone className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
