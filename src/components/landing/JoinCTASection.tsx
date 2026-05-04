import { motion } from 'motion/react';
import { Play, Star } from 'lucide-react';

type Props = { onStart: () => void };

export default function JoinCTASection({ onStart }: Props) {
  return (
    <section className="relative z-10 mt-12 w-full overflow-hidden rounded-[3rem] sm:rounded-[4rem] bg-gradient-to-br from-rose-500 via-rose-500 to-fuchsia-600 py-20 sm:py-24">
      {/* pixel-style dotted texture */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPjxyZWN0IHdpZHRoPSI0IiBoZWlnaHQ9IjQiIGZpbGw9IiNmZmYiLz48L3N2Zz4=\")",
          backgroundRepeat: 'repeat',
        }}
      />
      {/* glow */}
      <div className="pointer-events-none absolute -top-32 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-pink-400/40 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-32 right-10 h-80 w-80 rounded-full bg-amber-300/30 blur-[120px]" />

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="relative mx-auto mb-8 h-32 w-32 sm:h-36 sm:w-36"
        >
          <img
            src="/illustrations/brand/fusion-mascot.png"
            alt="ماسكوت النادي"
            className="h-full w-full object-contain drop-shadow-[0_10px_24px_rgba(0,0,0,0.35)]"
            style={{ animation: 'floating 4s ease-in-out infinite' }}
          />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="absolute -right-3 -top-3 flex h-12 w-12 items-center justify-center rounded-full border-4 border-rose-700 bg-amber-300 shadow-lg"
          >
            <Star className="h-6 w-6 fill-amber-900 text-amber-900" />
          </motion.div>
        </motion.div>

        <h2 className="font-arabic text-4xl font-black uppercase tracking-tight text-white drop-shadow-[0_4px_0_rgba(0,0,0,0.18)] sm:text-5xl lg:text-6xl">
          جاهزة للمغامرة؟
        </h2>
        <p className="mx-auto mt-5 max-w-2xl font-arabic text-base font-bold leading-8 text-rose-100 sm:text-lg">
          انضمي إلى آلاف البطلات الصغيرات في عالم مليء بالمرح والاستكشاف!
        </p>

        <button
          onClick={onStart}
          className="group relative mx-auto mt-10 inline-flex items-center justify-center"
        >
          <span className="absolute inset-0 translate-y-2 rounded-3xl bg-amber-700 transition-transform group-active:translate-y-0" />
          <span className="relative flex items-center gap-3 rounded-3xl border-4 border-amber-200 bg-amber-300 px-8 py-4 text-xl font-black text-amber-950 shadow-[0_0_44px_rgba(252,211,77,0.55)] transition-transform group-active:translate-y-2 sm:gap-4 sm:px-10 sm:py-5 sm:text-2xl">
            <Play className="h-7 w-7 fill-amber-950 sm:h-8 sm:w-8" />
            <span className="font-arabic">ابدئي مغامرتكِ الآن</span>
          </span>
        </button>
      </div>
    </section>
  );
}
