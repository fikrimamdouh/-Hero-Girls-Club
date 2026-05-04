import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

const heroImageMap: Record<string, string> = {
  '📚': '/illustrations/brand/fusion-spot1.png',
  '🏆': '/illustrations/brand/fusion-spot3.png',
  '🛍️': '/illustrations/brand/fusion-spot2.png',
  '👧': '/illustrations/brand/fusion-mascot.png',
  '🎀': '/illustrations/brand/fusion-action.png',
  '🌙': '/illustrations/brand/fusion-editorial.png',
  '🧩': '/illustrations/brand/fusion-spot1.png',
  '🚀': '/illustrations/brand/fusion-action.png',
  '🪄': '/illustrations/brand/fusion-mascot.png',
  '🏠': '/illustrations/brand/fusion-spot2.png',
};

const fallbackHero = '/illustrations/brand/fusion-mascot.png';

export default function KidsPageLayout({
  title,
  subtitle,
  emoji,
  children,
  tone = 'from-pink-50 to-sky-50'
}: {
  title: string;
  subtitle: string;
  emoji: string;
  children: ReactNode;
  tone?: string;
}) {
  const heroImage = heroImageMap[emoji] || fallbackHero;

  return (
    <div className={`min-h-screen bg-gradient-to-b ${tone} p-4 md:p-8`} dir="rtl">
      <div className="max-w-6xl mx-auto">
        <Link to="/kids" className="inline-flex mb-6 items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-200 shadow-sm hover:bg-white hover:shadow-md transition-all">
          <ArrowRight className="w-4 h-4" />
          العودة لعالم الأطفال
        </Link>

        {/* Magical hero header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative overflow-hidden rounded-[2.5rem] border border-white/70 bg-gradient-to-br from-white via-fuchsia-50/60 to-violet-50/60 shadow-[0_24px_60px_rgba(217,70,239,0.18)] mb-8"
        >
          {/* gradient mesh */}
          <div className="absolute -top-24 -right-20 w-72 h-72 rounded-full bg-fuchsia-300/30 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-20 w-72 h-72 rounded-full bg-violet-300/30 blur-3xl pointer-events-none" />
          {/* sparkle dust */}
          {[...Array(6)].map((_, i) => (
            <motion.span
              key={i}
              animate={{ y: [0, -8, 0], opacity: [0.3, 0.8, 0.3] }}
              transition={{ duration: 3 + (i % 3), repeat: Infinity, delay: i * 0.4 }}
              className="absolute text-fuchsia-400/60 text-xs pointer-events-none select-none"
              style={{ left: `${10 + i * 15}%`, top: `${20 + (i * 13) % 60}%` }}
            >✦</motion.span>
          ))}

          <div className="relative flex flex-col md:flex-row items-center gap-6 p-6 md:p-10">
            <div className="flex-1 text-center md:text-right">
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="inline-flex items-center gap-2 bg-fuchsia-500/10 border border-fuchsia-300/40 px-3.5 py-1.5 rounded-full mb-4"
              >
                <Sparkles className="w-3.5 h-3.5 text-fuchsia-600" />
                <span className="font-arabic text-[11px] font-bold text-fuchsia-700 tracking-wide">
                  نادي البطلات الصغيرات
                </span>
              </motion.div>
              <h1 className="font-arabic text-3xl md:text-5xl font-black bg-gradient-to-l from-fuchsia-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent leading-[1.15] mb-3">
                {emoji} {title}
              </h1>
              <p className="font-arabic text-base md:text-lg font-bold text-slate-600 max-w-xl">
                {subtitle}
              </p>
            </div>

            {/* hero illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="relative w-36 h-36 md:w-48 md:h-48 shrink-0"
            >
              <motion.img
                src={heroImage}
                alt=""
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="w-full h-full object-contain drop-shadow-[0_12px_24px_rgba(168,85,247,0.35)]"
              />
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
                className="absolute -top-2 -right-2 text-2xl drop-shadow-md"
              >✨</motion.span>
            </motion.div>
          </div>
        </motion.div>

        {children}
      </div>
    </div>
  );
}
