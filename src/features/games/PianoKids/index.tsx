import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Music, Play, Square, Sparkles } from 'lucide-react';
import { recordGamePlay } from '../../../lib/gameStats';

type NoteName = 'C' | 'D' | 'E' | 'F' | 'G' | 'A' | 'B' | 'C2';

const NOTES: { name: NoteName; freq: number; key: string; ar: string; color: string }[] = [
  { name: 'C',  freq: 261.63, key: 'a', ar: 'دو',  color: 'from-rose-400 to-rose-500' },
  { name: 'D',  freq: 293.66, key: 's', ar: 'ري',  color: 'from-orange-400 to-orange-500' },
  { name: 'E',  freq: 329.63, key: 'd', ar: 'مي',  color: 'from-amber-400 to-amber-500' },
  { name: 'F',  freq: 349.23, key: 'f', ar: 'فا',  color: 'from-emerald-400 to-emerald-500' },
  { name: 'G',  freq: 392.00, key: 'g', ar: 'صول', color: 'from-teal-400 to-teal-500' },
  { name: 'A',  freq: 440.00, key: 'h', ar: 'لا',  color: 'from-sky-400 to-sky-500' },
  { name: 'B',  freq: 493.88, key: 'j', ar: 'سي',  color: 'from-indigo-400 to-indigo-500' },
  { name: 'C2', freq: 523.25, key: 'k', ar: 'دو²', color: 'from-fuchsia-400 to-fuchsia-500' },
];

const SONGS: { id: string; title: string; emoji: string; sequence: NoteName[] }[] = [
  { id: 'twinkle',  title: 'النجمة الصغيرة',     emoji: '⭐', sequence: ['C','C','G','G','A','A','G','F','F','E','E','D','D','C'] },
  { id: 'happy',    title: 'سنة حلوة يا جميل',    emoji: '🎂', sequence: ['C','C','D','C','F','E','C','C','D','C','G','F'] },
  { id: 'mary',     title: 'النعجة الصغيرة',      emoji: '🐑', sequence: ['E','D','C','D','E','E','E','D','D','D','E','G','G'] },
  { id: 'ode',      title: 'لحن الفرح',           emoji: '🎵', sequence: ['E','E','F','G','G','F','E','D','C','C','D','E','E','D','D'] },
];

export default function PianoKids() {
  const navigate = useNavigate();
  const audioCtxRef = useRef<AudioContext | null>(null);
  const [active, setActive] = useState<NoteName | null>(null);
  const [mode, setMode] = useState<'free' | 'song'>('free');
  const [playingSong, setPlayingSong] = useState<string | null>(null);
  const [currentNoteIdx, setCurrentNoteIdx] = useState(-1);
  const stopRef = useRef(false);

  const getCtx = () => {
    if (!audioCtxRef.current) {
      const Ctx = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new Ctx();
    }
    return audioCtxRef.current!;
  };

  const playNote = useCallback((note: NoteName) => {
    const ctx = getCtx();
    const n = NOTES.find((x) => x.name === note);
    if (!n) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = n.freq;
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.35, ctx.currentTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
    setActive(note);
    setTimeout(() => setActive(null), 200);
  }, []);

  const playSong = async (songId: string) => {
    const song = SONGS.find((s) => s.id === songId);
    if (!song) return;
    stopRef.current = false;
    setPlayingSong(songId);
    setMode('song');
    for (let i = 0; i < song.sequence.length; i++) {
      if (stopRef.current) break;
      setCurrentNoteIdx(i);
      playNote(song.sequence[i]);
      await new Promise((r) => setTimeout(r, 450));
    }
    setPlayingSong(null);
    setCurrentNoteIdx(-1);
    if (!stopRef.current) recordGamePlay('piano', 50);
  };

  const stopSong = () => {
    stopRef.current = true;
    setPlayingSong(null);
    setCurrentNoteIdx(-1);
  };

  // keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const note = NOTES.find((n) => n.key === e.key.toLowerCase());
      if (note) playNote(note.name);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [playNote]);

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-rose-100 font-arabic">
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-stone-200/60">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 h-16 flex items-center gap-3">
          <button onClick={() => navigate('/games')} className="h-10 w-10 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition" aria-label="رجوع">
            <ArrowRight className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-md">
              <Music className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-[11px] leading-none text-stone-400 font-bold">جديدة</p>
              <p className="text-sm font-extrabold leading-tight text-stone-800">بيانو البطلات</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 sm:px-6 py-8">
        <div className="text-center mb-8">
          <motion.div animate={{ rotate: [0, -6, 6, -6, 0] }} transition={{ duration: 3, repeat: Infinity }} className="text-6xl mb-3">🎹</motion.div>
          <h1 className="text-3xl sm:text-4xl font-black text-purple-900 mb-2">اعزفي ألحانكِ</h1>
          <p className="text-stone-600 font-bold">اضغطي على المفاتيح أو استخدمي لوحة المفاتيح (A S D F G H J K)</p>
        </div>

        {/* Songs library */}
        <div className="bg-white/70 backdrop-blur rounded-3xl p-5 sm:p-6 ring-1 ring-purple-100 mb-6 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <h3 className="font-extrabold text-purple-900">ألحان جاهزة</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {SONGS.map((s) => {
              const isPlaying = playingSong === s.id;
              return (
                <motion.button
                  key={s.id}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => (isPlaying ? stopSong() : playSong(s.id))}
                  className={`rounded-2xl p-4 text-right ring-2 transition-all ${isPlaying ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white ring-purple-600' : 'bg-white text-purple-900 ring-stone-200 hover:ring-purple-400'}`}
                >
                  <div className="text-3xl mb-1">{s.emoji}</div>
                  <div className="font-extrabold text-sm leading-tight">{s.title}</div>
                  <div className={`flex items-center gap-1 mt-2 text-[11px] font-bold ${isPlaying ? 'text-white/90' : 'text-purple-500'}`}>
                    {isPlaying ? <><Square className="h-3 w-3 fill-current" /> إيقاف</> : <><Play className="h-3 w-3 fill-current" /> تشغيل</>}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Piano keys */}
        <div className="bg-gradient-to-b from-stone-800 to-stone-900 rounded-3xl p-4 sm:p-6 shadow-2xl">
          <div className="flex gap-1.5 sm:gap-2">
            {NOTES.map((n) => {
              const isActive = active === n.name;
              return (
                <motion.button
                  key={n.name}
                  whileTap={{ scale: 0.95 }}
                  onPointerDown={() => playNote(n.name)}
                  className={`flex-1 h-44 sm:h-56 rounded-b-2xl bg-gradient-to-b ${n.color} flex flex-col items-center justify-end pb-4 text-white shadow-lg ring-2 ring-white/20 transition-all ${isActive ? 'translate-y-1 brightness-125' : ''}`}
                >
                  <div className="text-xl sm:text-2xl font-black mb-1">{n.ar}</div>
                  <div className="text-[10px] font-bold uppercase opacity-80">{n.key}</div>
                </motion.button>
              );
            })}
          </div>
        </div>

        <p className="text-center text-stone-500 text-xs font-bold mt-6">
          🎵 الموسيقى تطوّر السمع والإيقاع والذاكرة
        </p>
      </main>
    </div>
  );
}
