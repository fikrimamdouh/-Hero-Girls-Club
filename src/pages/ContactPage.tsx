import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Phone, User as UserIcon, MessageSquare, Send, ArrowLeft, CheckCircle2, Sparkles, Heart, Star, Clock } from 'lucide-react';
import { GiQueenCrown, GiFairyWand } from 'react-icons/gi';

export default function ContactPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('من فضلك املئي الاسم والإيميل والرسالة');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('الإيميل غير صحيح');
      return;
    }
    setSending(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, subject, message }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'فشل الإرسال');
      setSent(true);
      setName(''); setEmail(''); setPhone(''); setSubject(''); setMessage('');
    } catch (err: any) {
      setError(err.message || 'حدث خطأ، حاولي مرة أخرى');
    } finally {
      setSending(false);
    }
  };

  const reasons = ['اقتراح فكرة جديدة', 'سؤال عن المنصة', 'إبلاغ عن مشكلة', 'شراكة وتعاون', 'أخرى'];

  return (
    <div dir="rtl" className="relative min-h-screen overflow-hidden bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50">
      {/* Soft floating shapes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -left-16 top-20 h-64 w-64 rounded-full bg-rose-200/50 blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 25, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -right-20 top-1/2 h-80 w-80 rounded-full bg-pink-200/45 blur-3xl"
        />
        <motion.div
          animate={{ y: [0, -15, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-amber-200/40 blur-3xl"
        />
        {/* Tiny stars */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 3 + (i % 3), repeat: Infinity, delay: i * 0.4 }}
            className="absolute text-rose-300"
            style={{ left: `${(i * 8.3) % 95}%`, top: `${5 + (i * 7.2) % 88}%`, fontSize: '14px' }}
          >✦</motion.div>
        ))}
      </div>

      {/* Top nav */}
      <nav className="relative z-20 mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <button
          onClick={() => navigate('/')}
          className="group flex items-center gap-2 rounded-full bg-white/80 px-4 py-2.5 shadow-sm ring-1 ring-rose-100 backdrop-blur transition hover:bg-white hover:shadow-md"
        >
          <ArrowLeft className="h-4 w-4 text-rose-600 transition group-hover:-translate-x-1" />
          <span className="font-arabic text-xs font-bold text-rose-700">الرئيسية</span>
        </button>
        <div className="flex items-center gap-3">
          <div className="text-left">
            <div className="font-arabic text-base font-extrabold leading-tight text-rose-900">نادي البطلات</div>
            <div className="font-arabic text-[10px] text-rose-500">عالم آمن للفتيات</div>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-pink-500 to-fuchsia-500 shadow-[0_8px_20px_rgba(236,72,153,0.35)]">
            <GiQueenCrown className="h-6 w-6 text-white" />
          </div>
        </div>
      </nav>

      <main className="relative z-10 mx-auto w-full max-w-6xl px-5 pb-16 pt-4 sm:px-8">
        {/* Hero band */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 shadow-sm ring-1 ring-rose-200">
            <Sparkles className="h-3.5 w-3.5 text-pink-500" />
            <span className="font-arabic text-[11px] font-bold text-rose-700">قناة تواصل مباشرة</span>
          </div>
          <h1 className="mb-3 font-arabic text-4xl font-black leading-tight text-rose-950 sm:text-5xl md:text-6xl">
            يلا نتكلم 💌
          </h1>
          <p className="mx-auto max-w-xl font-arabic text-base leading-8 text-rose-700/80 sm:text-lg">
            رأيك يفرق معانا. اكتبيلنا أي حاجة في بالك — هنرد عليكِ بسرعة.
          </p>
        </motion.div>

        {/* Quick stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-10 grid grid-cols-3 gap-3 sm:gap-4"
        >
          <StatPill icon={<Clock className="h-5 w-5" />} value="24س" label="متوسط الرد" tint="from-rose-100 to-pink-100" iconBg="bg-rose-500" />
          <StatPill icon={<Heart className="h-5 w-5" />} value="100%" label="نقرأ كل رسالة" tint="from-pink-100 to-fuchsia-100" iconBg="bg-pink-500" />
          <StatPill icon={<Star className="h-5 w-5" />} value="٤٫٩" label="رضا أولياء الأمور" tint="from-amber-100 to-rose-100" iconBg="bg-amber-500" />
        </motion.div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
          {/* Sidebar info */}
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-4"
          >
            <div className="space-y-4">
              <InfoCard
                icon={<Clock className="h-5 w-5" />}
                title="ساعات الرد"
                value="السبت – الخميس · 10ص → 8م"
                tint="bg-pink-500"
              />
              <InfoCard
                icon={<GiFairyWand className="h-5 w-5" />}
                title="فريق صغير ومتفاني"
                value="بنرد يدوياً على كل رسالة ✨"
                tint="bg-fuchsia-500"
              />

              {/* Decorative quote */}
              <div className="rounded-3xl bg-gradient-to-br from-rose-500 via-pink-500 to-fuchsia-500 p-6 text-white shadow-[0_18px_44px_-10px_rgba(236,72,153,0.45)]">
                <div className="mb-3 text-3xl leading-none">"</div>
                <p className="font-arabic text-sm font-bold leading-7">
                  كل اقتراح منكِ يا بطلة بيخلي المنصة أحلى ✨ شكراً إنك معانا.
                </p>
                <div className="mt-4 flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/25 backdrop-blur">
                    <Heart className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <div className="font-arabic text-xs font-extrabold">فريق نادي البطلات</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>

          {/* Form card */}
          <motion.section
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-8"
          >
            <div className="relative overflow-hidden rounded-[2rem] bg-white p-6 shadow-[0_30px_70px_-20px_rgba(244,63,94,0.25)] ring-1 ring-rose-100 sm:p-10">
              {/* Corner accent */}
              <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-gradient-to-br from-rose-200 to-pink-200 opacity-60 blur-2xl" />

              <AnimatePresence mode="wait">
                {sent ? (
                  <motion.div
                    key="sent"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative flex flex-col items-center py-8 text-center"
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      className="mb-5 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 via-pink-400 to-rose-500 shadow-[0_20px_50px_-10px_rgba(244,114,182,0.6)]"
                    >
                      <CheckCircle2 className="h-12 w-12 text-white" strokeWidth={2.5} />
                    </motion.div>
                    <h2 className="mb-2 font-arabic text-3xl font-black text-rose-900">وصلت رسالتك ✨</h2>
                    <p className="mb-7 max-w-md font-arabic text-base leading-8 text-rose-700/80">
                      شكراً ليكِ! استلمنا رسالتك وهنرد في أقرب وقت ممكن على إيميلك.
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3">
                      <button
                        onClick={() => setSent(false)}
                        className="rounded-2xl bg-rose-100 px-6 py-3 font-arabic text-sm font-bold text-rose-700 transition hover:bg-rose-200"
                      >
                        إرسال رسالة أخرى
                      </button>
                      <button
                        onClick={() => navigate('/')}
                        className="rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 px-6 py-3 font-arabic text-sm font-bold text-white shadow-[0_12px_24px_-6px_rgba(244,63,94,0.5)] transition hover:shadow-[0_16px_30px_-6px_rgba(244,63,94,0.6)]"
                      >
                        الرجوع للرئيسية
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="relative space-y-5"
                  >
                    <div>
                      <h2 className="font-arabic text-2xl font-black text-rose-950 sm:text-3xl">اكتبيلنا رسالتك</h2>
                      <p className="mt-1 font-arabic text-sm text-rose-700/70">كل الحقول بالـ ✱ مطلوبة</p>
                    </div>

                    {/* Reason chips */}
                    <div>
                      <div className="mb-2 font-arabic text-xs font-bold text-rose-800">الموضوع</div>
                      <div className="flex flex-wrap gap-2">
                        {reasons.map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setSubject(r)}
                            className={`rounded-full px-4 py-2 font-arabic text-xs font-bold transition ${
                              subject === r
                                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-[0_8px_20px_-6px_rgba(244,63,94,0.5)]'
                                : 'bg-rose-50 text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100'
                            }`}
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <LightField icon={<UserIcon className="h-4 w-4" />} label="الاسم ✱">
                        <input
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="اسمك الكريم"
                          className="w-full rounded-2xl bg-rose-50 px-4 py-3.5 font-arabic text-sm text-rose-900 placeholder-rose-400 outline-none ring-1 ring-rose-100 transition focus:bg-white focus:ring-2 focus:ring-rose-400"
                        />
                      </LightField>
                      <LightField icon={<Mail className="h-4 w-4" />} label="الإيميل ✱">
                        <input
                          type="email"
                          dir="ltr"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="email@example.com"
                          className="w-full rounded-2xl bg-rose-50 px-4 py-3.5 text-sm text-rose-900 placeholder-rose-400 outline-none ring-1 ring-rose-100 transition focus:bg-white focus:ring-2 focus:ring-rose-400"
                        />
                      </LightField>
                    </div>

                    <LightField icon={<Phone className="h-4 w-4" />} label="رقم التواصل (اختياري)">
                      <input
                        dir="ltr"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+20 100 000 0000"
                        className="w-full rounded-2xl bg-rose-50 px-4 py-3.5 text-sm text-rose-900 placeholder-rose-400 outline-none ring-1 ring-rose-100 transition focus:bg-white focus:ring-2 focus:ring-rose-400"
                      />
                    </LightField>

                    <LightField icon={<MessageSquare className="h-4 w-4" />} label="الرسالة ✱">
                      <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={6}
                        placeholder="اكتبي اللي في بالك بالتفصيل..."
                        className="w-full resize-none rounded-2xl bg-rose-50 px-4 py-3.5 font-arabic text-sm leading-7 text-rose-900 placeholder-rose-400 outline-none ring-1 ring-rose-100 transition focus:bg-white focus:ring-2 focus:ring-rose-400"
                      />
                      <div className="mt-1 text-left font-arabic text-[10px] text-rose-400">{message.length}/5000</div>
                    </LightField>

                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl bg-red-50 px-4 py-3 font-arabic text-sm font-bold text-red-700 ring-1 ring-red-200"
                      >
                        ⚠️ {error}
                      </motion.div>
                    )}

                    <motion.button
                      type="submit"
                      disabled={sending}
                      whileTap={{ scale: 0.98 }}
                      className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 py-4 font-arabic text-base font-extrabold text-white shadow-[0_18px_36px_-10px_rgba(217,70,239,0.55)] transition hover:shadow-[0_22px_44px_-10px_rgba(217,70,239,0.65)] disabled:opacity-60"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                      {sending ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="h-5 w-5 rounded-full border-2 border-white/30 border-t-white"
                          />
                          جارٍ الإرسال...
                        </>
                      ) : (
                        <>
                          <Send className="h-5 w-5" />
                          أرسلي الرسالة
                        </>
                      )}
                    </motion.button>

                    <p className="text-center font-arabic text-[11px] text-rose-500/70">
                      🔒 بياناتك آمنة — بنستخدمها فقط للرد عليكِ.
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  );
}

function StatPill({ icon, value, label, tint, iconBg }: { icon: React.ReactNode; value: string; label: string; tint: string; iconBg: string }) {
  return (
    <div className={`flex items-center gap-3 rounded-2xl bg-gradient-to-br ${tint} p-3 shadow-sm sm:p-4`}>
      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${iconBg} text-white shadow-sm sm:h-11 sm:w-11`}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="font-arabic text-base font-black leading-tight text-rose-900 sm:text-lg">{value}</div>
        <div className="truncate font-arabic text-[10px] font-bold text-rose-700/70 sm:text-xs">{label}</div>
      </div>
    </div>
  );
}

function InfoCard({ icon, title, value, tint, ltr }: { icon: React.ReactNode; title: string; value: string; tint: string; ltr?: boolean }) {
  return (
    <div className="flex items-start gap-4 rounded-3xl bg-white p-5 shadow-sm ring-1 ring-rose-100 transition hover:shadow-md hover:ring-rose-200">
      <div className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl ${tint} text-white shadow-sm`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-arabic text-xs font-bold text-rose-500">{title}</div>
        <div className={`mt-0.5 break-words font-arabic text-sm font-extrabold text-rose-900 ${ltr ? 'font-mono' : ''}`} dir={ltr ? 'ltr' : 'rtl'} style={ltr ? { textAlign: 'right' } : undefined}>
          {value}
        </div>
      </div>
    </div>
  );
}

function LightField({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 flex items-center gap-1.5 font-arabic text-xs font-bold text-rose-800">
        <span className="text-pink-500">{icon}</span>
        {label}
      </label>
      {children}
    </div>
  );
}
