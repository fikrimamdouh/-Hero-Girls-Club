import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, Sparkles, X, Star, Eye, EyeOff, Fingerprint, KeyRound, Hash, Mail, Loader2, CheckCircle2, MessageCircle, AlertCircle } from 'lucide-react';
import { GiUnicorn, GiFairyWand } from 'react-icons/gi';
import { ChildProfile } from '../../types';
import PatternLock from './PatternLock';
import { toast } from 'sonner';

type Props = {
  childName: string;
  setChildName: (v: string) => void;
  pin: string;
  setPin: (v: string) => void;
  loading: boolean;
  onSubmit: () => void;
  onCancel: () => void;
  onRecover?: (name: string) => Promise<void>;
  recentChildren?: ChildProfile[];
};

type Method = 'pattern' | 'password' | 'pin';

export default function ChildLoginPanel({
  childName,
  setChildName,
  pin,
  setPin,
  loading,
  onSubmit,
  onCancel,
  onRecover,
  recentChildren = [],
}: Props) {
  const [method, setMethod] = useState<Method>('pattern');
  const [showPwd, setShowPwd] = useState(false);
  const [pinKeypadOrder] = useState(() => {
    // Shuffled, NO digit labels visible — purely positional symbols
    return ['1','2','3','4','5','6','7','8','9','0'];
  });
  const navigate = useNavigate();
  const [recoveryOpen, setRecoveryOpen] = useState(false);
  const [recovering, setRecovering] = useState(false);
  const [recoverySent, setRecoverySent] = useState(false);
  const [needsContact, setNeedsContact] = useState<string | null>(null);

  const switchMethod = (m: Method) => {
    setMethod(m);
    setPin('');
  };

  const pressKey = (k: string) => {
    if (k === 'back') setPin(pin.slice(0, -1));
    else if (pin.length < 4) setPin(pin + k);
  };

  const handleRecover = async () => {
    if (!childName.trim()) {
      toast.error('من فضلك اكتبي اسمكِ أولاً');
      return;
    }
    if (!onRecover) {
      toast.error('خاصية الاستعادة غير متاحة');
      return;
    }
    setRecovering(true);
    setNeedsContact(null);
    try {
      await onRecover(childName.trim());
      setRecoverySent(true);
    } catch (e: any) {
      const msg: string = e?.message || 'حدث خطأ، حاولي لاحقاً';
      // No email / no parent / permission issues → direct to Contact page
      const contactTriggers = [
        'لا يوجد إيميل',
        'لا يوجد ولي أمر',
        'لم نجد ولي الأمر',
        'insufficient permissions',
        'permission-denied',
        'Missing or insufficient',
      ];
      if (contactTriggers.some((t) => msg.includes(t))) {
        setNeedsContact(msg.includes('insufficient') || msg.includes('permission')
          ? 'لا نستطيع التحقق من بياناتكِ تلقائياً. تواصلي مع الإدارة وسنساعدكِ فوراً.'
          : 'لا يوجد بريد إلكتروني مسجل لولي أمركِ. تواصلي مع الإدارة وسنساعدكِ في استعادة الرمز.');
      } else {
        toast.error(msg);
      }
    } finally {
      setRecovering(false);
    }
  };

  const goToContact = () => {
    setRecoveryOpen(false);
    setNeedsContact(null);
    navigate('/contact');
  };

  return (
    <motion.div
      key="pin-login"
      initial={{ opacity: 0, scale: 0.96, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: -8 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-rose-950 via-rose-900 to-pink-900 ring-1 ring-rose-200/20 p-5 sm:p-7 shadow-[0_24px_70px_rgba(124,58,237,0.35)]"
    >
      {/* sparkle bg */}
      <div className="pointer-events-none absolute inset-0 opacity-30">
        {[...Array(8)].map((_, i) => (
          <motion.span
            key={i}
            animate={{ y: [0, -10, 0], opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 3 + (i % 3), repeat: Infinity, delay: i * 0.4 }}
            className="absolute text-xs text-pink-100/60"
            style={{ left: `${8 + (i * 13) % 88}%`, top: `${10 + (i * 23) % 78}%` }}
          >✦</motion.span>
        ))}
      </div>

      {/* close */}
      <button
        onClick={onCancel}
        aria-label="إغلاق"
        className="absolute left-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white/70 backdrop-blur-md transition-all hover:bg-white/20 hover:text-white"
      >
        <X className="h-4 w-4" />
      </button>

      {/* header */}
      <div className="relative z-[1] mb-5 text-center">
        <motion.div
          animate={{ rotate: [0, 6, -6, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-400 via-fuchsia-500 to-pink-500 shadow-[0_10px_28px_rgba(217,70,239,0.45)]"
        >
          <GiUnicorn className="h-8 w-8 text-white" />
        </motion.div>
        <h2 className="font-arabic text-2xl font-extrabold text-white sm:text-3xl">
          أهلاً يا بطلة!
        </h2>
        <p className="mt-1 font-arabic text-xs text-white/60 sm:text-sm">
          ادخلي اسمكِ واختاري طريقة الدخول
        </p>
      </div>

      {/* name input */}
      <div className="relative z-[1] mb-4">
        <label className="mb-1.5 block px-1 font-arabic text-[11px] font-bold text-white/70">
          اسم البطلة
        </label>
        <div className="relative">
          <GiFairyWand className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-pink-300/80" />
          <input
            type="text"
            placeholder="اكتبي اسمكِ أو لقبكِ"
            value={childName}
            onChange={(e) => setChildName(e.target.value)}
            className="w-full rounded-2xl border border-white/30 bg-white px-12 py-3.5 text-right font-arabic text-base font-bold text-rose-950 shadow-inner outline-none transition-all placeholder:text-rose-400 focus:border-pink-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(244,114,182,0.35)] sm:text-lg"
          />
        </div>
      </div>

      {/* method tabs */}
      <div className="relative z-[1] mb-4 grid grid-cols-3 gap-1.5 rounded-2xl bg-white/5 p-1 ring-1 ring-white/10">
        {[
          { k: 'pattern' as const, label: 'نقش', icon: <Fingerprint className="h-4 w-4" /> },
          { k: 'password' as const, label: 'كلمة سر', icon: <KeyRound className="h-4 w-4" /> },
          { k: 'pin' as const, label: 'رقم سري', icon: <Hash className="h-4 w-4" /> },
        ].map((t) => (
          <button
            key={t.k}
            type="button"
            onClick={() => switchMethod(t.k)}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2 font-arabic text-xs font-bold transition-all ${
              method === t.k
                ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md'
                : 'text-white/60 hover:text-white/90'
            }`}
          >
            {t.icon}
            {t.label}
          </button>
        ))}
      </div>

      {/* auth area */}
      <div className="relative z-[1] mb-5 min-h-[18rem]">
        <AnimatePresence mode="wait">
          {method === 'pattern' && (
            <motion.div
              key="pattern"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex flex-col items-center"
            >
              <PatternLock value={pin} onChange={setPin} size={240} />
              {pin && (
                <button
                  type="button"
                  onClick={() => setPin('')}
                  className="mt-2 font-arabic text-[11px] font-bold text-rose-200/80 underline-offset-2 hover:underline"
                >
                  إعادة الرسم
                </button>
              )}
            </motion.div>
          )}

          {method === 'password' && (
            <motion.div
              key="password"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex flex-col items-center justify-center px-2 pt-6"
            >
              <div className="relative w-full">
                <KeyRound className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-pink-300" />
                <input
                  type={showPwd ? 'text' : 'password'}
                  inputMode="text"
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.slice(0, 12))}
                  className="w-full rounded-2xl border border-white/30 bg-white px-12 py-4 text-center font-arabic text-2xl font-extrabold tracking-[0.5rem] text-rose-950 shadow-inner outline-none transition-all placeholder:text-rose-300 focus:border-pink-400 focus:shadow-[0_0_0_4px_rgba(244,114,182,0.35)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  aria-label="إظهار/إخفاء"
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-rose-500 hover:bg-rose-100"
                >
                  {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="mt-3 text-center font-arabic text-[11px] text-white/55">
                اكتبي كلمة السر السحرية اللي اخترتيها
              </p>
            </motion.div>
          )}

          {method === 'pin' && (
            <motion.div
              key="pin"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              {/* dots */}
              <div className="mb-3 flex justify-center gap-2.5">
                {[0, 1, 2, 3].map((i) => {
                  const filled = i < pin.length;
                  return (
                    <motion.div
                      key={i}
                      animate={filled ? { scale: [1, 1.2, 1] } : { scale: 1 }}
                      transition={{ duration: 0.25 }}
                      className={`h-3.5 w-3.5 rounded-full transition-all ${
                        filled
                          ? 'bg-gradient-to-br from-fuchsia-400 to-rose-400 shadow-[0_0_12px_rgba(217,70,239,0.7)]'
                          : 'bg-white/15 ring-1 ring-white/25'
                      }`}
                    />
                  );
                })}
              </div>
              {/* keypad — digits visually replaced with dots/symbols, but functionally still type digits */}
              <div className="mx-auto grid max-w-[14rem] grid-cols-3 gap-2">
                {pinKeypadOrder.slice(0, 9).map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => pressKey(d)}
                    disabled={pin.length >= 4}
                    aria-label={`رقم ${d}`}
                    className="group relative h-14 rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md transition-all hover:bg-white/20 active:translate-y-0.5 disabled:opacity-40"
                  >
                    <span className="block h-2.5 w-2.5 rounded-full bg-gradient-to-br from-rose-300 to-pink-400 mx-auto group-hover:scale-125 transition-transform" />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPin('')}
                  className="h-14 rounded-2xl border border-white/15 bg-white/5 font-arabic text-[10px] font-bold text-white/70 transition-all hover:bg-white/10"
                >
                  مسح
                </button>
                <button
                  type="button"
                  onClick={() => pressKey('0')}
                  disabled={pin.length >= 4}
                  aria-label="رقم 0"
                  className="group relative h-14 rounded-2xl border border-white/15 bg-white/10 backdrop-blur-md transition-all hover:bg-white/20 active:translate-y-0.5 disabled:opacity-40"
                >
                  <span className="block h-2.5 w-2.5 rounded-full bg-gradient-to-br from-rose-300 to-pink-400 mx-auto group-hover:scale-125 transition-transform" />
                </button>
                <button
                  type="button"
                  onClick={() => pressKey('back')}
                  className="flex h-14 items-center justify-center rounded-2xl border border-white/15 bg-white/5 font-arabic text-[10px] font-bold text-white/70 transition-all hover:bg-white/10"
                >
                  مسح آخر
                </button>
              </div>
              <p className="mt-3 text-center font-arabic text-[11px] text-white/45">
                النقاط تمثل الأرقام بالترتيب 1-9 ثم 0
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* CTA */}
      <button
        onClick={onSubmit}
        disabled={loading || !pin || !childName.trim() || (method === 'pattern' && pin.length < 4) || (method === 'pin' && pin.length !== 4)}
        className="relative z-[1] flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-400 via-fuchsia-500 to-pink-500 py-4 font-arabic text-base font-extrabold text-white shadow-[0_14px_34px_rgba(217,70,239,0.45)] transition-all hover:shadow-[0_18px_44px_rgba(217,70,239,0.55)] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none sm:text-lg"
      >
        {loading ? (
          <>
            <Sparkles className="h-5 w-5 animate-pulse" />
            جاري فتح بوّابة العالم السحري...
          </>
        ) : (
          <>
            انطلاق إلى عالمي!
            <ArrowRight className="h-5 w-5" />
          </>
        )}
      </button>

      {/* Recovery link */}
      <button
        type="button"
        onClick={() => { setRecoverySent(false); setRecoveryOpen(true); }}
        className="relative z-[1] mt-3 block w-full text-center font-arabic text-[11px] font-bold text-pink-200/85 underline-offset-2 hover:text-white hover:underline"
      >
        نسيتِ رمزكِ؟ إرسال للإيميل المسجل
      </button>

      {/* recent heroines */}
      <AnimatePresence>
        {recentChildren.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="relative z-[1] mt-4 border-t border-white/15 pt-4"
          >
            <p className="mb-3 flex items-center justify-center gap-1.5 font-arabic text-[11px] font-bold text-white/55">
              <Star className="h-3 w-3 fill-current text-amber-300" />
              أو اختاري بطلتكِ المسجّلة
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {recentChildren.map((c) => (
                <button
                  key={c.uid}
                  onClick={() => setChildName(c.heroName || c.name)}
                  className="rounded-full border border-pink-400/30 bg-pink-500/20 px-3.5 py-1.5 font-arabic text-xs font-bold text-pink-100 backdrop-blur-md transition-all hover:scale-105 hover:border-pink-300/60 hover:bg-pink-500/30"
                >
                  {c.heroName || c.name}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Recovery modal */}
      <AnimatePresence>
        {recoveryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-rose-950/85 backdrop-blur-sm p-5"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-sm rounded-2xl bg-white p-6 text-right shadow-2xl"
            >
              {needsContact ? (
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                    <AlertCircle className="h-8 w-8 text-amber-600" />
                  </div>
                  <h3 className="mb-2 font-arabic text-xl font-extrabold text-rose-950">نحتاج مساعدة الإدارة</h3>
                  <p className="mb-5 font-arabic text-sm leading-7 text-rose-700/85">
                    {needsContact}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setNeedsContact(null); setRecoveryOpen(false); }}
                      className="flex-1 rounded-2xl bg-rose-100 py-3 font-arabic text-sm font-bold text-rose-700 hover:bg-rose-200"
                    >
                      إغلاق
                    </button>
                    <button
                      onClick={goToContact}
                      className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 py-3 font-arabic text-sm font-bold text-white shadow-md hover:shadow-lg"
                    >
                      <MessageCircle className="h-4 w-4" />
                      تواصلي معنا
                    </button>
                  </div>
                </div>
              ) : recoverySent ? (
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                    <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h3 className="mb-2 font-arabic text-xl font-extrabold text-rose-950">تم الإرسال ✉️</h3>
                  <p className="mb-5 font-arabic text-sm leading-7 text-rose-700/80">
                    أرسلنا الرمز السري إلى البريد المسجل لولي أمركِ. تحققي معه.
                  </p>
                  <button
                    onClick={() => setRecoveryOpen(false)}
                    className="w-full rounded-2xl bg-rose-500 py-3 font-arabic text-sm font-bold text-white hover:bg-rose-600"
                  >
                    تمام
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100">
                      <Mail className="h-6 w-6 text-rose-600" />
                    </div>
                    <div>
                      <h3 className="font-arabic text-lg font-extrabold text-rose-950">استعادة الرمز</h3>
                      <p className="font-arabic text-[11px] text-rose-500">سيُرسل الرمز لإيميل ولي الأمر</p>
                    </div>
                  </div>
                  <p className="mb-4 font-arabic text-sm leading-7 text-rose-700/85">
                    اكتبي اسم البطلة في الخانة فوق ثم اضغطي إرسال.
                    <br />
                    <span className="text-rose-500">الاسم الحالي: <strong>{childName || '—'}</strong></span>
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setRecoveryOpen(false)}
                      className="flex-1 rounded-2xl bg-rose-100 py-3 font-arabic text-sm font-bold text-rose-700 hover:bg-rose-200"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={handleRecover}
                      disabled={recovering || !childName.trim()}
                      className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-500 to-pink-500 py-3 font-arabic text-sm font-bold text-white shadow-md hover:shadow-lg disabled:opacity-50"
                    >
                      {recovering ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
                      إرسال
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
