import { motion } from 'motion/react';
import { Palette, Gamepad2, BookOpen, GraduationCap, Crown, Sparkles } from 'lucide-react';

const FEATURES = [
  {
    img: '/illustrations/brand/fusion-spot1.png',
    icon: Palette,
    title: 'مرسم الإبداع',
    desc: 'أدوات رسم وتلوين تفاعلية تطلق العنان لخيالها وتنمّي حسّها الفني بألوان مبهجة.',
    accent: 'rose',
  },
  {
    img: '/illustrations/brand/fusion-spot2.png',
    icon: Gamepad2,
    title: 'ألعاب الذكاء',
    desc: 'مجموعة مختارة من الألعاب التي تنمّي التفكير المنطقي وحلّ المشكلات بطريقة ممتعة.',
    accent: 'purple',
  },
  {
    img: '/illustrations/brand/fusion-spot3.png',
    icon: BookOpen,
    title: 'مكتبة الحكايات',
    desc: 'قصص تفاعلية ملهمة تزرع القيم النبيلة وتعزّز مهارات القراءة والاستماع.',
    accent: 'amber',
  },
  {
    img: '/illustrations/brand/fusion-editorial.png',
    icon: GraduationCap,
    title: 'رحلة التعلّم',
    desc: 'محتوى تعليمي مدروس يتوافق مع قيمنا ويشجّع على الاستكشاف والتعلّم المستمرّ.',
    accent: 'editorial',
  },
];

const ACCENT: Record<string, { bg: string; ring: string; iconWrap: string; iconClr: string; titleClr: string; descClr: string; shadow: string; }> = {
  rose: {
    bg: 'bg-white border-rose-100',
    ring: 'bg-rose-50',
    iconWrap: 'bg-rose-100',
    iconClr: 'text-rose-600',
    titleClr: 'text-rose-950',
    descClr: 'text-rose-900/70',
    shadow: 'shadow-[0_20px_40px_-15px_rgba(251,113,133,0.15)] hover:shadow-[0_20px_40px_-15px_rgba(251,113,133,0.3)]',
  },
  purple: {
    bg: 'bg-white border-purple-100',
    ring: 'bg-purple-50',
    iconWrap: 'bg-purple-100',
    iconClr: 'text-purple-600',
    titleClr: 'text-purple-950',
    descClr: 'text-purple-900/70',
    shadow: 'shadow-[0_20px_40px_-15px_rgba(168,85,247,0.15)] hover:shadow-[0_20px_40px_-15px_rgba(168,85,247,0.3)]',
  },
  amber: {
    bg: 'bg-white border-amber-100',
    ring: 'bg-amber-50',
    iconWrap: 'bg-amber-100',
    iconClr: 'text-amber-600',
    titleClr: 'text-amber-950',
    descClr: 'text-amber-900/70',
    shadow: 'shadow-[0_20px_40px_-15px_rgba(234,179,8,0.15)] hover:shadow-[0_20px_40px_-15px_rgba(234,179,8,0.3)]',
  },
  editorial: {
    bg: 'bg-gradient-to-br from-rose-100 to-orange-100 border-rose-200',
    ring: '',
    iconWrap: 'bg-white/70',
    iconClr: 'text-rose-700',
    titleClr: 'text-rose-950',
    descClr: 'text-rose-900/80',
    shadow: 'shadow-xl',
  },
};

export default function WhatsInsideSection() {
  return (
    <section className="relative z-10 mt-16 w-full bg-orange-50 text-slate-900 rounded-[3rem] sm:rounded-[4rem] overflow-hidden py-16 sm:py-24 lg:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="mx-auto mb-14 max-w-3xl text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-rose-100 px-4 py-1.5 text-xs font-extrabold text-rose-700">
            <Sparkles className="h-3.5 w-3.5" />
            <span className="font-arabic">تجربة مصمَّمة بعناية</span>
          </div>
          <h2 className="font-arabic text-3xl font-black tracking-tight text-rose-950 sm:text-5xl lg:text-6xl">
            ماذا يوجد بالداخل؟
          </h2>
          <p className="mt-5 font-arabic text-base leading-8 text-rose-900/70 sm:text-lg">
            عالم متكامل يجمع بين المتعة والفائدة، مصمم بعناية لتنمية مهارات بطلتكِ الصغيرة في بيئة آمنة ومحفّزة.
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
          {FEATURES.map((f, i) => {
            const a = ACCENT[f.accent];
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.55, delay: i * 0.08 }}
                className={`group flex flex-col items-center gap-6 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 sm:flex-row text-right border ${a.bg} ${a.shadow} transition-shadow`}
              >
                <div className={`relative w-40 h-40 sm:w-48 sm:h-48 shrink-0 rounded-3xl overflow-hidden ${a.ring}`}>
                  <img
                    src={f.img}
                    alt={f.title}
                    className={`h-full w-full ${f.accent === 'editorial' ? 'object-cover' : 'object-contain p-3 mix-blend-multiply'} transition-transform duration-500 group-hover:scale-110`}
                    loading="lazy"
                  />
                </div>
                <div className="flex-1">
                  {f.accent === 'editorial' && (
                    <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/60 px-3 py-1.5 text-[11px] font-extrabold text-rose-800 sm:text-xs">
                      <Crown className="h-3.5 w-3.5" />
                      <span className="font-arabic">محتوى حصري</span>
                    </div>
                  )}
                  <div className={`mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full ${a.iconWrap}`}>
                    <f.icon className={`h-6 w-6 ${a.iconClr}`} />
                  </div>
                  <h3 className={`font-arabic text-xl font-black sm:text-2xl ${a.titleClr}`}>{f.title}</h3>
                  <p className={`mt-2 font-arabic text-sm leading-7 sm:text-base font-medium ${a.descClr}`}>{f.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
