import { motion } from 'motion/react';
import { ReactNode } from 'react';

// Three custom CC0-style illustrations (Storyset-inspired girls + duotone)
const RegisterIllustration = () => (
  <svg viewBox="0 0 200 160" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgReg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fce7f3" />
        <stop offset="100%" stopColor="#fbcfe8" />
      </linearGradient>
    </defs>
    <rect width="200" height="160" fill="url(#bgReg)" rx="20" />
    <circle cx="60" cy="120" r="38" fill="#fda4af" opacity="0.4" />
    <rect x="100" y="40" width="80" height="100" rx="10" fill="#fff" stroke="#f43f5e" strokeWidth="2.5" />
    <line x1="110" y1="60" x2="170" y2="60" stroke="#fda4af" strokeWidth="3" strokeLinecap="round" />
    <line x1="110" y1="75" x2="160" y2="75" stroke="#fbcfe8" strokeWidth="3" strokeLinecap="round" />
    <line x1="110" y1="90" x2="170" y2="90" stroke="#fbcfe8" strokeWidth="3" strokeLinecap="round" />
    <rect x="110" y="105" width="60" height="22" rx="6" fill="#f43f5e" />
    <circle cx="60" cy="80" r="22" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" />
    <circle cx="55" cy="76" r="2" fill="#1e293b" />
    <circle cx="65" cy="76" r="2" fill="#1e293b" />
    <path d="M 53 86 Q 60 92 67 86" stroke="#1e293b" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M 38 65 Q 60 50 82 65 Q 80 75 78 80 L 42 80 Q 40 75 38 65" fill="#7c2d12" />
    <circle cx="160" cy="35" r="5" fill="#fbbf24" />
    <path d="M 160 28 L 160 22 M 165 33 L 170 30 M 167 38 L 173 38 M 165 43 L 170 46 M 160 48 L 160 42" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const ApprovalIllustration = () => (
  <svg viewBox="0 0 200 160" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgAppr" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#dbeafe" />
        <stop offset="100%" stopColor="#fce7f3" />
      </linearGradient>
    </defs>
    <rect width="200" height="160" fill="url(#bgAppr)" rx="20" />
    <circle cx="100" cy="80" r="55" fill="#fff" opacity="0.6" />
    <circle cx="100" cy="80" r="42" fill="#10b981" />
    <path d="M 80 82 L 95 97 L 122 68" stroke="#fff" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="40" cy="40" r="8" fill="#fbbf24" opacity="0.7" />
    <circle cx="170" cy="50" r="6" fill="#f43f5e" opacity="0.7" />
    <circle cx="160" cy="120" r="10" fill="#a78bfa" opacity="0.6" />
    <circle cx="35" cy="125" r="7" fill="#34d399" opacity="0.7" />
    <path d="M 50 25 L 53 32 L 60 32 L 54 37 L 56 44 L 50 40 L 44 44 L 46 37 L 40 32 L 47 32 Z" fill="#fbbf24" />
    <path d="M 160 130 L 162 135 L 167 135 L 163 138 L 165 143 L 160 140 L 155 143 L 157 138 L 153 135 L 158 135 Z" fill="#f43f5e" />
  </svg>
);

const PlayIllustration = () => (
  <svg viewBox="0 0 200 160" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgPlay" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stopColor="#fef3c7" />
        <stop offset="100%" stopColor="#fed7aa" />
      </linearGradient>
    </defs>
    <rect width="200" height="160" fill="url(#bgPlay)" rx="20" />
    {/* girl character */}
    <circle cx="80" cy="90" r="28" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2.5" />
    <circle cx="73" cy="86" r="2.5" fill="#1e293b" />
    <circle cx="87" cy="86" r="2.5" fill="#1e293b" />
    <path d="M 70 98 Q 80 106 90 98" stroke="#1e293b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <path d="M 50 75 Q 80 55 110 75 Q 108 90 105 95 L 55 95 Q 52 90 50 75" fill="#a16207" />
    <circle cx="65" cy="68" r="6" fill="#f43f5e" />
    {/* crown */}
    <path d="M 65 50 L 70 60 L 80 45 L 90 60 L 95 50 L 92 65 L 68 65 Z" fill="#fbbf24" stroke="#a16207" strokeWidth="1.5" />
    <circle cx="80" cy="55" r="2" fill="#f43f5e" />
    {/* Game controller / sparkles right side */}
    <rect x="125" y="70" width="55" height="40" rx="14" fill="#f43f5e" />
    <circle cx="140" cy="90" r="6" fill="#fff" />
    <circle cx="165" cy="85" r="4" fill="#fff" />
    <circle cx="165" cy="95" r="4" fill="#fff" />
    <path d="M 130 60 L 132 65 L 137 65 L 133 68 L 135 73 L 130 70 L 125 73 L 127 68 L 123 65 L 128 65 Z" fill="#fbbf24" />
    <path d="M 175 130 L 177 135 L 182 135 L 178 138 L 180 143 L 175 140 L 170 143 L 172 138 L 168 135 L 173 135 Z" fill="#a78bfa" />
    {/* confetti */}
    <circle cx="30" cy="40" r="4" fill="#34d399" />
    <circle cx="180" cy="40" r="3" fill="#a78bfa" />
    <circle cx="20" cy="120" r="3" fill="#f43f5e" />
  </svg>
);

type Step = {
  num: string;
  title: string;
  desc: string;
  illustration: ReactNode;
  accent: string;
  ring: string;
};

const STEPS: Step[] = [
  {
    num: '1',
    title: 'سجّلي بطلتكِ',
    desc: 'املئي بياناتها واختاري قوّتها الخارقة في 5 خطوات بسيطة.',
    illustration: <RegisterIllustration />,
    accent: 'from-rose-400 to-pink-500',
    ring: 'ring-rose-200',
  },
  {
    num: '2',
    title: 'وافقي وفعّلي',
    desc: 'يصلكِ إيميل بالموافقة، ثم تختاري رمزها السري معاً.',
    illustration: <ApprovalIllustration />,
    accent: 'from-emerald-400 to-teal-500',
    ring: 'ring-emerald-200',
  },
  {
    num: '3',
    title: 'ابدئي المغامرة',
    desc: 'العبي وتعلّمي وأبدعي في عالم آمن مليء بالمكافآت.',
    illustration: <PlayIllustration />,
    accent: 'from-amber-400 to-orange-500',
    ring: 'ring-amber-200',
  },
];

export default function HowItWorksSection() {
  return (
    <section className="relative z-10 mt-16 w-full">
      <div className="mx-auto max-w-6xl px-2 sm:px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10"
        >
          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/80 backdrop-blur-md px-4 py-1.5 ring-1 ring-rose-200 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-arabic text-xs font-extrabold text-rose-700">سهل جداً</span>
          </div>
          <h2 className="font-arabic text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-rose-950">
            كيف نبدأ مغامرتنا؟
          </h2>
          <p className="mt-3 font-arabic text-base sm:text-lg text-rose-700/75 max-w-2xl mx-auto">
            ثلاث خطوات صغيرة وبطلتكِ تدخل عالم النادي
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="relative"
            >
              {/* connector line (desktop) */}
              {i < STEPS.length - 1 && (
                <div className="hidden md:block absolute top-24 -left-4 lg:-left-6 w-8 lg:w-12 h-1 bg-gradient-to-l from-rose-200 to-transparent z-0" />
              )}
              <div className={`relative bg-white rounded-3xl p-5 sm:p-6 ring-1 ${s.ring} shadow-[0_18px_44px_-18px_rgba(244,63,94,0.3)] hover:shadow-[0_22px_50px_-14px_rgba(244,63,94,0.4)] transition-all hover:-translate-y-1 duration-300 h-full flex flex-col`}>
                <div className={`absolute -top-4 -right-4 h-12 w-12 rounded-2xl bg-gradient-to-br ${s.accent} shadow-lg flex items-center justify-center font-arabic text-white text-2xl font-black ring-4 ring-white`}>
                  {s.num}
                </div>
                <div className="rounded-2xl overflow-hidden mb-4 aspect-[5/4] bg-stone-50">
                  {s.illustration}
                </div>
                <h3 className="font-arabic text-xl font-extrabold text-rose-950 text-right mb-2">
                  {s.title}
                </h3>
                <p className="font-arabic text-sm leading-7 text-rose-900/65 text-right">
                  {s.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
