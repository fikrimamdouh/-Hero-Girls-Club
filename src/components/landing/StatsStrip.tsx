import { motion } from 'motion/react';
import { Users, Sparkles, ShieldCheck, Star } from 'lucide-react';

const STATS = [
  { icon: Users, value: '+1,200', label: 'بطلة منضمّة', color: 'from-rose-400 to-pink-500', text: 'text-rose-600' },
  { icon: Sparkles, value: '+150', label: 'نشاط ولعبة', color: 'from-amber-400 to-orange-500', text: 'text-amber-600' },
  { icon: Star, value: '4.9/5', label: 'تقييم الأمهات', color: 'from-fuchsia-400 to-purple-500', text: 'text-fuchsia-600' },
  { icon: ShieldCheck, value: '100%', label: 'بيئة آمنة', color: 'from-emerald-400 to-teal-500', text: 'text-emerald-600' },
];

export default function StatsStrip() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.6 }}
      className="relative z-10 mt-12 w-full max-w-6xl mx-auto"
    >
      <div className="rounded-[2.5rem] bg-white/85 backdrop-blur-xl ring-1 ring-rose-100 shadow-[0_20px_60px_-20px_rgba(244,63,94,0.25)] p-6 sm:p-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {STATS.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="flex items-center gap-3 sm:gap-4"
              >
                <div className={`shrink-0 h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-md`}>
                  <Icon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                </div>
                <div className="min-w-0">
                  <div className={`font-arabic text-2xl sm:text-3xl font-black leading-none ${s.text}`}>
                    {s.value}
                  </div>
                  <div className="font-arabic text-[11px] sm:text-xs font-bold text-stone-500 mt-1">
                    {s.label}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
