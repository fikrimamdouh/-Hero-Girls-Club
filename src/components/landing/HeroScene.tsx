import { motion } from 'motion/react';
import { Sparkles, Heart, Shield } from 'lucide-react';

export default function HeroScene({ className = '' }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      {/* Soft glow halo */}
      <div
        className="pointer-events-none absolute -inset-4 -z-10 rounded-[2.75rem] bg-[radial-gradient(closest-side,rgba(244,114,182,0.55),rgba(251,191,36,0.25)_50%,transparent_75%)] blur-2xl"
        aria-hidden="true"
      />

      {/* Video stage with editorial frame */}
      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.9, ease: 'easeOut' }}
        className="relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2.25rem] bg-gradient-to-br from-rose-100 via-pink-50 to-amber-100 p-1.5 shadow-[0_30px_70px_-15px_rgba(244,63,94,0.45)] ring-1 ring-rose-200/70"
      >
        <div className="relative h-full w-full overflow-hidden rounded-[1.85rem] bg-gradient-to-br from-rose-50 to-pink-100">
          <video
            src="/illustrations/brand/hero-loop.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="absolute inset-0 h-full w-full object-cover"
            poster="/illustrations/brand/fusion-hero.png"
          />

          {/* gradient overlay for legibility */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-rose-900/35 via-transparent to-transparent" />

          {/* corner brand stamp */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1.5 backdrop-blur-md shadow-md">
            <Sparkles className="h-3 w-3 text-pink-500" />
            <span className="font-arabic text-[10px] font-extrabold text-rose-700">عالم البطلات</span>
          </div>
        </div>
      </motion.div>

      {/* Floating glass pills */}
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute -right-3 top-8 z-20 flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11px] font-extrabold text-fuchsia-700 shadow-[0_10px_24px_rgba(236,72,153,0.25)] ring-1 ring-rose-100"
      >
        <Heart className="h-3 w-3 fill-current text-rose-500" />
        <span className="font-arabic">آمن وممتع</span>
      </motion.div>

      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
        className="absolute -left-3 top-1/3 z-20 hidden items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-[11px] font-extrabold text-amber-700 shadow-[0_10px_24px_rgba(251,191,36,0.3)] ring-1 ring-amber-100 sm:flex"
      >
        <Shield className="h-3 w-3 text-emerald-500" />
        <span className="font-arabic">إشراف ولي الأمر</span>
      </motion.div>

      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        className="absolute -right-2 bottom-12 z-20 hidden items-center gap-1.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-3 py-1.5 text-[11px] font-extrabold text-white shadow-[0_10px_24px_rgba(244,63,94,0.4)] sm:flex"
      >
        <Sparkles className="h-3 w-3" />
        <span className="font-arabic">+50 نشاط</span>
      </motion.div>
    </div>
  );
}
