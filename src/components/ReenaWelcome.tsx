import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Shield, BookOpen, Stars, Heart, Wand2 } from 'lucide-react';

export default function ReenaWelcome() {
  const [show, setShow] = useState(false);
  const [activeChildName, setActiveChildName] = useState<string | null>(null);
  const [activeChildUid, setActiveChildUid] = useState<string | null>(null);

  useEffect(() => {
    const activeChildStr = localStorage.getItem('active_child');
    if (activeChildStr) {
      try {
        const activeChild = JSON.parse(activeChildStr);
        if (activeChild?.name) {
          setActiveChildName(activeChild.name);
          setActiveChildUid(activeChild.uid || null);

          const hasShown = sessionStorage.getItem(`reena_welcome_${activeChild.uid}`);
          if (!hasShown) {
            setShow(true);
            sessionStorage.setItem(`reena_welcome_${activeChild.uid}`, 'true');
          }
        }
      } catch (e) {
        console.error('Failed to parse active_child for Reena welcome', e);
      }
    }
  }, []);

  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => {
      setShow(false);
    }, 12000);
    return () => clearTimeout(timer);
  }, [show]);

  const handleClose = () => {
    if (activeChildUid) {
      sessionStorage.setItem(`reena_welcome_${activeChildUid}`, 'true');
    }
    setShow(false);
  };

  if (!show || !activeChildName) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md"
      >
        <motion.div
          initial={{ scale: 0.88, y: 24, opacity: 0, rotateX: 8 }}
          animate={{ scale: 1, y: 0, opacity: 1, rotateX: 0 }}
          exit={{ scale: 0.92, y: 18, opacity: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/20 bg-white/10 shadow-[0_40px_120px_rgba(15,23,42,0.55)] backdrop-blur-2xl"
          dir="rtl"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.14),transparent_24%)]" />
          <div className="absolute -top-16 -right-12 h-40 w-40 rounded-full bg-fuchsia-400/25 blur-3xl" />
          <div className="absolute -bottom-20 -left-10 h-44 w-44 rounded-full bg-indigo-400/25 blur-3xl" />

          <motion.div
            animate={{ y: [0, -8, 0], rotate: [0, 4, -4, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-8 right-8 text-white/20"
          >
            <Stars className="h-10 w-10" />
          </motion.div>

          <motion.div
            animate={{ y: [0, 10, 0], x: [0, -6, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute bottom-24 left-10 text-pink-200/25"
          >
            <Heart className="h-9 w-9" />
          </motion.div>

          <motion.div
            animate={{ y: [0, -6, 0], rotate: [0, -6, 6, 0] }}
            transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-24 left-16 text-amber-200/25"
          >
            <Wand2 className="h-8 w-8" />
          </motion.div>

          <div className="relative">
            <div className="relative overflow-hidden bg-gradient-to-l from-violet-800 via-fuchsia-600 to-pink-500 px-6 pt-7 pb-6 text-white">
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.14),transparent_45%,rgba(255,255,255,0.08))]" />
              <div className="absolute -bottom-10 left-8 h-24 w-24 rounded-full bg-white/10 blur-2xl" />
              <div className="absolute -top-10 right-20 h-24 w-24 rounded-full bg-white/10 blur-2xl" />

              <button
                onClick={handleClose}
                className="absolute top-4 left-4 z-10 rounded-full border border-white/20 bg-white/15 p-2 text-white transition-all hover:scale-105 hover:bg-white/25"
                aria-label="إغلاق"
              >
                <X className="h-4 w-4" />
              </button>

              <div className="relative flex items-center gap-4">
                <motion.div
                  initial={{ scale: 0.8, rotate: -8 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.15, duration: 0.4 }}
                  className="flex h-20 w-20 items-center justify-center rounded-[1.75rem] border border-white/35 bg-white/15 text-4xl shadow-[0_15px_40px_rgba(255,255,255,0.12)] backdrop-blur-xl"
                >
                  👧
                </motion.div>

                <div className="flex-1">
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-black text-white/90 shadow-sm"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>رسالة ترحيب سحرية</span>
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.18, duration: 0.4 }}
                    className="text-2xl font-black leading-tight md:text-3xl"
                  >
                    أهلًا {activeChildName} ✨
                  </motion.h2>

                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.26, duration: 0.4 }}
                    className="mt-2 text-sm font-bold leading-7 text-white/95 md:text-base"
                  >
                    أنا رينا، وسأرافقك في عالم البطلات المضيء، حيث المرح، والتعلم، والمغامرات الجميلة تبدأ مع كل خطوة.
                  </motion.p>
                </div>
              </div>
            </div>

            <div className="relative space-y-5 bg-white/95 p-6 text-slate-700 backdrop-blur-xl md:p-7">
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.32, duration: 0.45 }}
                className="rounded-[1.5rem] border border-fuchsia-100 bg-gradient-to-l from-fuchsia-50 via-white to-indigo-50 p-4 shadow-sm"
              >
                <p className="text-sm font-bold leading-8 text-slate-700 md:text-[15px]">
                  هنا ستتعلمين، وتلعبين، وتكتشفين أفكارًا مذهلة، وتخوضين تحديات لطيفة كل يوم في بيئة آمنة، راقية، وذكية صُممت خصيصًا للبطلات الصغيرات.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.45 }}
                className="grid grid-cols-1 gap-3 sm:grid-cols-3"
              >
                <div className="group rounded-[1.5rem] border border-pink-100 bg-gradient-to-br from-pink-50 to-white p-4 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                  <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-pink-100 text-pink-600 shadow-sm">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-black text-pink-700">إبداع</p>
                  <p className="mt-1 text-[12px] font-semibold leading-6 text-slate-500">
                    أفكار مدهشة ومهام ممتعة
                  </p>
                </div>

                <div className="group rounded-[1.5rem] border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-4 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                  <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600 shadow-sm">
                    <Shield className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-black text-indigo-700">أمان</p>
                  <p className="mt-1 text-[12px] font-semibold leading-6 text-slate-500">
                    مساحة آمنة وهادئة لكِ
                  </p>
                </div>

                <div className="group rounded-[1.5rem] border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-4 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                  <div className="mx-auto mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 shadow-sm">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-black text-emerald-700">تعلّم</p>
                  <p className="mt-1 text-[12px] font-semibold leading-6 text-slate-500">
                    معرفة جميلة بأسلوب ممتع
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.48, duration: 0.45 }}
                className="rounded-[1.5rem] border border-violet-100 bg-gradient-to-r from-violet-50 via-white to-fuchsia-50 p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                    <Stars className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800">مفاجآت جميلة تنتظرك</p>
                    <p className="mt-1 text-[13px] font-semibold leading-7 text-slate-600">
                      ستجدين تحديات يومية، قصصًا ممتعة، وأفكارًا جديدة تساعدك على أن تتألقي كل يوم بثقة وفرح.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.56, duration: 0.45 }}
                onClick={handleClose}
                className="w-full rounded-[1.5rem] bg-gradient-to-r from-fuchsia-500 via-pink-500 to-indigo-600 py-4 text-base font-black text-white shadow-[0_18px_40px_rgba(168,85,247,0.35)] transition-all hover:scale-[1.01] hover:shadow-[0_24px_55px_rgba(168,85,247,0.42)] active:scale-[0.985]"
              >
                ابدئي الآن ✨
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
