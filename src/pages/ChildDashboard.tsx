import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home, Gamepad2, Palette, GraduationCap, BookOpen, Users,
  Star, Trophy, Bell, Settings, LogOut, X, Loader2, Sparkles,
  PlayCircle, CheckCircle2, ChevronLeft, Search, Crown, Heart,
  Brush, Film, Tv, Music2, Map as MapIcon, MessageCircle,
  Wand2, Compass, Sun, Moon, Lock, Shield,
} from 'lucide-react';
import { auth, db } from '../firebase';
import {
  doc, onSnapshot, setDoc, updateDoc, collection, query, where,
  getDocs, limit,
} from 'firebase/firestore';
import { ChildProfile, VisitRequest } from '../types';
import { toast } from 'sonner';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from '../components/NotificationBell';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';

// ─────────────────────────────────────────────────────────────────────────────
// Section catalog — reorganized into 5 worlds
// ─────────────────────────────────────────────────────────────────────────────
type WorldId = 'all' | 'play' | 'create' | 'learn' | 'faith' | 'connect';

type SectionItem = {
  id: string;
  title: string;
  subtitle: string;
  Icon: any;
  route: string;
  world: Exclude<WorldId, 'all'>;
  accent: string; // tailwind base color e.g. 'orange'
  featured?: boolean;
};

const SECTIONS: SectionItem[] = [
  // PLAY
  { id: 'kids-games', title: 'بستان الألعاب', subtitle: 'أكثر من 40 لعبة ممتعة', Icon: Gamepad2, route: '/games', world: 'play', accent: 'orange', featured: true },
  { id: 'maria-games', title: 'ألعاب ماريا', subtitle: 'مغامرات البطلات', Icon: Crown, route: '/maria-games', world: 'play', accent: 'rose' },
  { id: 'drawing-games', title: 'ألعاب الرسم', subtitle: 'فن وإبداع تفاعلي', Icon: Brush, route: '/drawing-games', world: 'play', accent: 'fuchsia' },
  { id: 'pet', title: 'حيواني الأليف', subtitle: 'اعتني برفيقك السحري', Icon: Heart, route: '/pet', world: 'play', accent: 'pink' },

  // CREATE
  { id: 'ai-design', title: 'استوديو التصميم', subtitle: 'صممي بالذكاء الاصطناعي', Icon: Wand2, route: '/ai-design', world: 'create', accent: 'violet', featured: true },
  { id: 'coloring', title: 'استوديو التلوين', subtitle: 'لوحاتك بألوانك', Icon: Palette, route: '/coloring', world: 'create', accent: 'purple' },
  { id: 'studio', title: 'ملفي وأفاتاري', subtitle: 'صممي شخصيتك', Icon: Sparkles, route: '/studio', world: 'create', accent: 'pink' },
  { id: 'journal', title: 'دفتر العجائب', subtitle: 'سجلي يومياتك', Icon: BookOpen, route: '/journal', world: 'create', accent: 'amber' },

  // LEARN
  { id: 'learning', title: 'مغامرات التعلم', subtitle: 'لغة وحساب وعلوم', Icon: GraduationCap, route: '/learning', world: 'learn', accent: 'sky', featured: true },
  { id: 'research', title: 'مركز الاكتشاف', subtitle: 'حقائق ومعلومات', Icon: Compass, route: '/research-center', world: 'learn', accent: 'cyan' },
  { id: 'academy', title: 'أكاديمية البطلات', subtitle: 'دروس مرحة', Icon: GraduationCap, route: '/academy', world: 'learn', accent: 'indigo' },
  { id: 'stories', title: 'مجرة القصص', subtitle: 'قصص قبل النوم', Icon: BookOpen, route: '/stories', world: 'learn', accent: 'violet' },

  // FAITH
  { id: 'quran', title: 'القرآن الكريم', subtitle: 'المصحف المعلم', Icon: BookOpen, route: '/cinema?cat=quran_full', world: 'faith', accent: 'emerald', featured: true },
  { id: 'prophets', title: 'قصص الأنبياء', subtitle: 'مغامرات إيمانية', Icon: Star, route: '/cinema?cat=prophets_stories', world: 'faith', accent: 'teal' },
  { id: 'values', title: 'واحة القيم', subtitle: 'أخلاق وآداب', Icon: Heart, route: '/values', world: 'faith', accent: 'green' },
  { id: 'sunnah', title: 'السنة النبوية', subtitle: 'سلوك وأخلاق', Icon: Sparkles, route: '/cinema?cat=sunnah', world: 'faith', accent: 'lime' },

  // CONNECT
  { id: 'village', title: 'مدينة البطلات', subtitle: 'زوري صديقاتك', Icon: MapIcon, route: '/village', world: 'connect', accent: 'sky', featured: true },
  { id: 'house', title: 'بيتي السحري', subtitle: 'زيني غرفتك', Icon: Home, route: '/house/self', world: 'connect', accent: 'amber' },
  { id: 'friends', title: 'الدردشة الآمنة', subtitle: 'تكلمي مع صديقاتك', Icon: MessageCircle, route: '/friends', world: 'connect', accent: 'rose' },
  { id: 'arena', title: 'ساحة التحدّيات', subtitle: 'تحدّي صديقاتك في XO', Icon: Trophy, route: '/arena', world: 'connect', accent: 'violet' },
  { id: 'home-activities', title: 'أنشطة العائلة', subtitle: 'فعاليات منزلية', Icon: Users, route: '/home-activities', world: 'connect', accent: 'pink' },
];

const QUICK_WATCH = [
  { title: 'سينما البطلات', subtitle: 'أفلام وحكايات', Icon: Film, route: '/cinema', accent: 'rose' },
  { title: 'فيديوهات اليوتيوب', subtitle: 'مختارة بعناية', Icon: Tv, route: '/videos', accent: 'red' },
  { title: 'قصة قبل النوم', subtitle: 'قصص هادئة', Icon: Music2, route: '/stories', accent: 'indigo' },
];

const WORLDS: { id: WorldId; label: string; Icon: any; accent: string }[] = [
  { id: 'all', label: 'الرئيسية', Icon: Home, accent: 'rose' },
  { id: 'play', label: 'ألعابي', Icon: Gamepad2, accent: 'orange' },
  { id: 'create', label: 'فنوني', Icon: Palette, accent: 'violet' },
  { id: 'learn', label: 'علومي', Icon: GraduationCap, accent: 'sky' },
  { id: 'faith', label: 'إيماني', Icon: BookOpen, accent: 'emerald' },
  { id: 'connect', label: 'صديقاتي', Icon: Users, accent: 'pink' },
];

// Map accent name → solid tailwind classes (avoid dynamic class pitfalls)
const ACCENT: Record<string, { bg: string; text: string; ring: string; soft: string; from: string; to: string }> = {
  rose:     { bg: 'bg-rose-500',     text: 'text-rose-600',     ring: 'ring-rose-200',     soft: 'bg-rose-50',     from: 'from-rose-400',     to: 'to-pink-500' },
  pink:     { bg: 'bg-pink-500',     text: 'text-pink-600',     ring: 'ring-pink-200',     soft: 'bg-pink-50',     from: 'from-pink-400',     to: 'to-rose-500' },
  orange:   { bg: 'bg-orange-500',   text: 'text-orange-600',   ring: 'ring-orange-200',   soft: 'bg-orange-50',   from: 'from-orange-400',   to: 'to-amber-500' },
  amber:    { bg: 'bg-amber-500',    text: 'text-amber-600',    ring: 'ring-amber-200',    soft: 'bg-amber-50',    from: 'from-amber-400',    to: 'to-orange-500' },
  violet:   { bg: 'bg-violet-500',   text: 'text-violet-600',   ring: 'ring-violet-200',   soft: 'bg-violet-50',   from: 'from-violet-400',   to: 'to-purple-500' },
  purple:   { bg: 'bg-purple-500',   text: 'text-purple-600',   ring: 'ring-purple-200',   soft: 'bg-purple-50',   from: 'from-purple-400',   to: 'to-fuchsia-500' },
  fuchsia:  { bg: 'bg-fuchsia-500',  text: 'text-fuchsia-600',  ring: 'ring-fuchsia-200',  soft: 'bg-fuchsia-50',  from: 'from-fuchsia-400',  to: 'to-pink-500' },
  indigo:   { bg: 'bg-indigo-500',   text: 'text-indigo-600',   ring: 'ring-indigo-200',   soft: 'bg-indigo-50',   from: 'from-indigo-400',   to: 'to-violet-500' },
  sky:      { bg: 'bg-sky-500',      text: 'text-sky-600',      ring: 'ring-sky-200',      soft: 'bg-sky-50',      from: 'from-sky-400',      to: 'to-cyan-500' },
  cyan:     { bg: 'bg-cyan-500',     text: 'text-cyan-600',     ring: 'ring-cyan-200',     soft: 'bg-cyan-50',     from: 'from-cyan-400',     to: 'to-sky-500' },
  emerald:  { bg: 'bg-emerald-500',  text: 'text-emerald-600',  ring: 'ring-emerald-200',  soft: 'bg-emerald-50',  from: 'from-emerald-400',  to: 'to-teal-500' },
  teal:     { bg: 'bg-teal-500',     text: 'text-teal-600',     ring: 'ring-teal-200',     soft: 'bg-teal-50',     from: 'from-teal-400',     to: 'to-emerald-500' },
  green:    { bg: 'bg-green-500',    text: 'text-green-600',    ring: 'ring-green-200',    soft: 'bg-green-50',    from: 'from-green-400',    to: 'to-emerald-500' },
  lime:     { bg: 'bg-lime-500',     text: 'text-lime-600',     ring: 'ring-lime-200',     soft: 'bg-lime-50',     from: 'from-lime-400',     to: 'to-green-500' },
  red:      { bg: 'bg-red-500',      text: 'text-red-600',      ring: 'ring-red-200',      soft: 'bg-red-50',      from: 'from-red-400',      to: 'to-rose-500' },
};

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
export default function ChildDashboard() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeWorld, setActiveWorld] = useState<WorldId>('all');
  const [showSettings, setShowSettings] = useState(false);
  const [editData, setEditData] = useState<Partial<ChildProfile>>({});
  const [savingSettings, setSavingSettings] = useState(false);
  const [incomingRequest, setIncomingRequest] = useState<VisitRequest | null>(null);
  const handledDecisions = useRef<Set<string>>(new Set());

  // ── Firestore wiring (unchanged behaviour, simplified) ────────────────────
  useEffect(() => {
    let unsubProfile: (() => void) | null = null;
    let unsubReq: (() => void) | null = null;
    let unsubDecisions: (() => void) | null = null;
    let mounted = true;
    let presenceTimer: any = null;

    const setup = async () => {
      const stored = localStorage.getItem('active_child');
      let active: ChildProfile | null = null;
      if (stored) {
        try { active = JSON.parse(stored); } catch {}
      }
      if (!active?.uid && auth.currentUser) {
        try {
          const q = query(collection(db, 'children_profiles'), where('parentId', '==', auth.currentUser.uid), limit(1));
          const snap = await getDocs(q);
          if (!snap.empty && mounted) {
            active = { uid: snap.docs[0].id, ...snap.docs[0].data() } as ChildProfile;
            localStorage.setItem('active_child', JSON.stringify(active));
          }
        } catch (e) { console.error('recover active child', e); }
      }

      if (!active?.uid) { if (mounted) setLoading(false); return; }

      // Daily streak update (consecutive days)
      try {
        const today = new Date().toISOString().slice(0, 10);
        const last = (active as any).streakLastDate as string | undefined;
        const prevStreak = (active as any).streak as number | undefined ?? 0;
        if (last !== today) {
          const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
          const nextStreak = last === yesterday ? prevStreak + 1 : 1;
          updateDoc(doc(db, 'children_profiles', active.uid), {
            streak: nextStreak,
            streakLastDate: today,
          }).catch(() => {});
        }
      } catch {}

      const tick = () => {
        if (!active?.uid) return;
        updateDoc(doc(db, 'children_profiles', active.uid), { lastActive: Date.now() }).catch(() => {});
      };
      tick();
      presenceTimer = setInterval(tick, 60000);

      const t = setTimeout(() => { if (mounted && loading) setLoading(false); }, 5000);
      unsubProfile = onSnapshot(doc(db, 'children_profiles', active.uid), (snap) => {
        clearTimeout(t);
        if (!mounted) return;
        if (snap.exists()) {
          const data = { ...snap.data(), uid: snap.id } as ChildProfile;
          setProfile(data);
          setEditData(data);
          localStorage.setItem('active_child', JSON.stringify(data));
        }
        setLoading(false);
      }, (err) => { clearTimeout(t); console.error(err); if (mounted) setLoading(false); });

      unsubReq = onSnapshot(
        query(collection(db, 'visit_requests'), where('toId', '==', active.uid), where('status', '==', 'pending')),
        (snap) => {
          if (!mounted) return;
          if (!snap.empty) {
            const sorted = [...snap.docs].sort((a, b) => b.data().timestamp - a.data().timestamp);
            const r = sorted.map((d) => ({ id: d.id, ...d.data() } as VisitRequest)).find((x) => !!x.id && !!x.fromId && !!x.fromAvatar);
            if (r) setIncomingRequest(r);
          } else setIncomingRequest(null);
        },
      );

      // Outgoing decision listener: notify when remote child responds to my sent request
      unsubDecisions = onSnapshot(
        query(
          collection(db, 'visit_requests'),
          where('fromId', '==', active.uid),
          where('status', 'in', ['accepted', 'rejected', 'declined']),
        ),
        (snap) => {
          if (!mounted) return;
          snap.docs.forEach((d) => {
            const r = { id: d.id, ...d.data() } as VisitRequest;
            const key = `${r.id}_${r.status}`;
            if (handledDecisions.current.has(key)) return;
            handledDecisions.current.add(key);
            if (r.status === 'accepted') {
              toast.success(`وافقت ${r.toName} على زيارتكِ 🎉`, {
                action: { label: 'الدخول الآن', onClick: () => navigate(`/house/${r.id}`) },
              });
            }
          });
        },
      );
    };
    setup();
    return () => {
      mounted = false;
      if (presenceTimer) clearInterval(presenceTimer);
      unsubProfile?.(); unsubReq?.(); unsubDecisions?.();
    };
  }, [navigate]);

  const handleAcceptVisit = async (r: VisitRequest) => {
    try {
      await setDoc(doc(db, 'visit_requests', r.id), { status: 'accepted', acceptedAt: Date.now(), roomMood: 'cozy' }, { merge: true });
      setIncomingRequest(null);
      setTimeout(() => navigate(`/house/${r.id}`), 100);
    } catch (e) { console.error(e); setIncomingRequest(null); }
  };
  const handleRejectVisit = async (r: VisitRequest) => {
    try { await setDoc(doc(db, 'visit_requests', r.id), { status: 'rejected', resolvedAt: Date.now() }, { merge: true }); setIncomingRequest(null); }
    catch (e) { console.error(e); toast.error('تعذّر رفض الطلب'); }
  };

  const handleLogout = () => { localStorage.removeItem('active_child'); window.location.href = '/'; };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSavingSettings(true);
    try {
      await updateDoc(doc(db, 'children_profiles', profile.uid), { ...editData, updatedAt: Date.now() });
      toast.success('تم الحفظ ✨');
      setShowSettings(false);
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `children_profiles/${profile.uid}`);
    } finally { setSavingSettings(false); }
  };

  const visibleSections = activeWorld === 'all'
    ? SECTIONS.filter((s) => s.featured)
    : SECTIONS.filter((s) => s.world === activeWorld);

  // ── Loading / not-found states ────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fdfaf6] text-stone-700" dir="rtl">
        <Loader2 className="h-10 w-10 animate-spin text-rose-500 mb-3" />
        <p className="font-arabic font-bold">جارٍ تحضير عالمكِ...</p>
      </div>
    );
  }
  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fdfaf6] text-center p-6" dir="rtl">
        <div className="h-16 w-16 rounded-2xl bg-rose-100 text-rose-500 flex items-center justify-center mb-4"><Sparkles className="h-8 w-8" /></div>
        <h2 className="font-arabic text-xl font-extrabold text-stone-900 mb-2">لم نجد ملفكِ السحري</h2>
        <p className="font-arabic text-stone-500 mb-6 max-w-sm">يبدو أنّ الجلسة انتهت — ادخلي مرة أخرى من الصفحة الرئيسية.</p>
        <button onClick={() => { localStorage.removeItem('active_child'); navigate('/'); }} className="rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-arabic font-bold px-6 py-3 shadow-lg shadow-rose-200">
          العودة للرئيسية
        </button>
      </div>
    );
  }

  const stars = profile.stars || 0;
  const points = profile.points || 0;
  const level = Math.floor(points / 100) + 1;
  const heroName = profile.heroName || profile.name;

  return (
    <div className="min-h-screen bg-[#fdfaf6] text-stone-900 font-arabic" dir="rtl" style={{ backgroundImage: 'radial-gradient(circle at 0% 0%, rgba(251,207,232,0.4), transparent 50%), radial-gradient(circle at 100% 0%, rgba(254,215,170,0.35), transparent 45%)' }}>
      {/* ─── Top bar ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-stone-200/60">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 h-16 flex items-center gap-3">
          <div className="flex items-center gap-2 ml-auto">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-md shadow-rose-200">
              <Crown className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-[11px] leading-none text-stone-400 font-bold">نادي البطلات</p>
              <p className="text-sm font-extrabold leading-tight text-stone-800">عالمي السحري</p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 mx-auto bg-stone-100/80 rounded-full px-4 py-2 text-stone-400 max-w-sm w-full">
            <Search className="h-4 w-4" />
            <span className="text-xs font-bold">ابحثي عن لعبة، قصة، فيديو...</span>
          </div>

          <div className="flex items-center gap-1.5 mr-auto">
            <button onClick={toggleTheme} aria-label="theme" className="h-10 w-10 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors">
              {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </button>
            <NotificationBell recipientId={profile.uid} />
            <button onClick={() => setShowSettings(true)} aria-label="إعدادات" className="h-10 w-10 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors">
              <Settings className="h-4 w-4" />
            </button>
            <button onClick={handleLogout} aria-label="خروج" className="h-10 w-10 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-500 flex items-center justify-center transition-colors">
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 pt-6 pb-20 space-y-6">
        {/* ─── Incoming visit request ────────────────────────────────── */}
        <AnimatePresence>
          {incomingRequest && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="rounded-2xl bg-white ring-2 ring-rose-300/70 shadow-md shadow-rose-100 p-4 flex flex-wrap items-center gap-4"
            >
              <div className={`h-12 w-12 rounded-xl ${incomingRequest.fromAvatar.color} flex items-center justify-center text-2xl shrink-0`}>
                {incomingRequest.fromAvatar.hairStyle}
              </div>
              <div className="flex-1 min-w-[180px]">
                <p className="text-xs text-rose-500 font-extrabold mb-0.5">طرق على بابكِ 🚪</p>
                <p className="text-sm font-extrabold text-stone-800">البطلة {incomingRequest.fromHeroName} تريد زيارتكِ</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleAcceptVisit(incomingRequest)} className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-extrabold px-4 py-2 shadow-sm">تفضّلي</button>
                <button onClick={() => handleRejectVisit(incomingRequest)} className="rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 text-sm font-bold px-4 py-2">ليس الآن</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Personal welcome strip ────────────────────────────────── */}
        <WelcomeStrip
          heroName={heroName}
          stars={stars}
          level={level}
          streak={profile.streak || 0}
          lastSection={profile.lastSection}
          onContinue={(route) => navigate(route)}
        />

        {/* ─── World tabs (HUGE pills, Nick Jr style) ───────────────── */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 -mx-1 px-1 scroll-smooth" style={{ scrollbarWidth: 'none' }}>
          {WORLDS.map((w) => {
            const a = ACCENT[w.accent];
            const active = activeWorld === w.id;
            return (
              <button
                key={w.id}
                onClick={() => setActiveWorld(w.id)}
                className={`shrink-0 inline-flex items-center gap-3 rounded-full px-6 py-4 text-base sm:text-lg font-black ring-2 transition-all active:scale-95 ${
                  active
                    ? `${a.bg} text-white ring-transparent shadow-lg shadow-stone-300`
                    : 'bg-white text-stone-700 ring-stone-200 hover:bg-stone-50 hover:ring-stone-300'
                }`}
              >
                <w.Icon className="h-6 w-6 sm:h-7 sm:w-7" strokeWidth={2.5} />
                {w.label}
              </button>
            );
          })}
        </div>

        {/* ─── BIG section grid (Nick Jr huge buttons) ───────────────── */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-800 mb-4">
            {activeWorld === 'all' ? 'اختاري وابدئي 🎉' : `عالم ${WORLDS.find((w) => w.id === activeWorld)?.label}`}
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {visibleSections.map((s) => (
              <SectionCard key={s.id} item={s} onClick={() => {
                if (profile?.uid) {
                  updateDoc(doc(db, 'children_profiles', profile.uid), {
                    lastSection: { id: s.id, title: s.title, route: s.route, accent: s.accent, at: Date.now() },
                  }).catch(() => {});
                }
                navigate(s.route);
              }} />
            ))}
          </div>
        </section>

        {/* ─── Quick watch row (BIG video tiles) ─────────────────────── */}
        <section>
          <div className="flex items-end justify-between mb-4">
            <h2 className="text-2xl sm:text-3xl font-black text-stone-800">شاهدي الآن 📺</h2>
            <button onClick={() => navigate('/cinema')} className="text-sm font-black text-rose-500 hover:text-rose-600 inline-flex items-center gap-1">
              الكل <ChevronLeft className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {QUICK_WATCH.map((w) => {
              const a = ACCENT[w.accent];
              return (
                <button
                  key={w.title}
                  onClick={() => navigate(w.route)}
                  className={`group relative overflow-hidden rounded-3xl text-right ${a.soft} ring-2 ring-stone-200 p-5 hover:shadow-xl active:scale-[0.98] transition-all`}
                >
                  <div className={`absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-gradient-to-br ${a.from} ${a.to} opacity-25 blur-2xl pointer-events-none`} />
                  <div className="relative flex items-center gap-4">
                    <div className={`h-16 w-16 rounded-2xl ${a.bg} text-white flex items-center justify-center shadow-lg`}>
                      <w.Icon className="h-8 w-8" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1">
                      <p className="text-lg font-black text-stone-800 leading-tight">{w.title}</p>
                      <p className="text-sm text-stone-500 font-bold">{w.subtitle}</p>
                    </div>
                    <PlayCircle className={`h-10 w-10 ${a.text} opacity-80 group-hover:opacity-100`} strokeWidth={2.5} />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* ─── BIG stars CTA ─────────────────────────────────────────── */}
        <button
          onClick={() => navigate('/stars')}
          className="w-full text-right rounded-3xl bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 text-white p-6 sm:p-8 shadow-xl shadow-amber-200/70 hover:shadow-2xl active:scale-[0.99] transition-all relative overflow-hidden"
        >
          <div className="absolute -bottom-10 -right-10 h-44 w-44 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute -top-10 -left-10 h-36 w-36 rounded-full bg-white/15 blur-3xl" />
          <div className="relative flex items-center gap-5">
            <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-3xl bg-white/25 backdrop-blur-sm flex items-center justify-center shrink-0">
              <Trophy className="h-12 w-12 sm:h-14 sm:w-14" strokeWidth={2.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm sm:text-base font-black opacity-90 mb-1">قصر جوائزكِ</p>
              <p className="text-4xl sm:text-5xl font-black leading-none mb-1">{stars} ⭐</p>
              <p className="text-sm sm:text-base font-bold opacity-90">نجمة — شوفي شاراتكِ</p>
            </div>
            <ChevronLeft className="h-10 w-10 opacity-80 shrink-0" strokeWidth={3} />
          </div>
        </button>
      </main>

      {/* ─── Settings slide-over ───────────────────────────────────── */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-stone-900/40 backdrop-blur-sm flex items-stretch justify-end"
            onClick={() => setShowSettings(false)}
          >
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 240 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full sm:max-w-md bg-white h-full overflow-y-auto"
            >
              <div className="sticky top-0 bg-white border-b border-stone-100 px-5 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-9 w-9 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center"><Settings className="h-4 w-4" /></div>
                  <h2 className="font-black text-stone-800">إعداداتي</h2>
                </div>
                <button onClick={() => setShowSettings(false)} className="h-9 w-9 rounded-xl hover:bg-stone-100 flex items-center justify-center text-stone-500">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSaveSettings} className="p-5 space-y-5">
                <Field label="اسمكِ الحقيقي">
                  <input className="kf-input" value={editData.name || ''} onChange={(e) => setEditData((p) => ({ ...p, name: e.target.value }))} />
                </Field>
                <Field label="لقبكِ البطولي">
                  <input className="kf-input" value={editData.heroName || ''} onChange={(e) => setEditData((p) => ({ ...p, heroName: e.target.value }))} />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="مدينتكِ">
                    <input className="kf-input" value={editData.city || ''} onChange={(e) => setEditData((p) => ({ ...p, city: e.target.value }))} placeholder="القاهرة" />
                  </Field>
                  <Field label="مدرستكِ">
                    <input className="kf-input" value={editData.school || ''} onChange={(e) => setEditData((p) => ({ ...p, school: e.target.value }))} placeholder="—" />
                  </Field>
                </div>

                <div className="rounded-2xl bg-stone-50 ring-1 ring-stone-200 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-8 w-8 rounded-lg bg-white text-rose-500 flex items-center justify-center"><Lock className="h-4 w-4" /></div>
                    <p className="font-extrabold text-stone-800 text-sm">حماية الدخول</p>
                  </div>
                  <Field label="الرمز السري (4-8 أرقام)">
                    <input
                      type="password"
                      maxLength={8}
                      value={editData.pin || ''}
                      onChange={(e) => setEditData((p) => ({ ...p, pin: e.target.value.replace(/\D/g, '') }))}
                      className="kf-input text-center tracking-[0.5em] text-lg"
                      placeholder="••••"
                    />
                  </Field>
                  <p className="text-[11px] text-stone-500 font-bold mt-2 flex items-center gap-1">
                    <Shield className="h-3 w-3" /> يمكنكِ تغييره أو استعادته من الصفحة الرئيسية.
                  </p>
                </div>

                <div className="flex gap-2 sticky bottom-0 -mx-5 px-5 py-3 bg-white/95 backdrop-blur border-t border-stone-100">
                  <button type="button" onClick={() => setShowSettings(false)} className="flex-1 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-extrabold py-3">إلغاء</button>
                  <button type="submit" disabled={savingSettings} className="flex-1 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold py-3 disabled:opacity-60 inline-flex items-center justify-center gap-2">
                    {savingSettings ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    حفظ
                  </button>
                </div>
              </form>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .kf-input { width: 100%; border-radius: 0.75rem; border: 1px solid #e7e5e4; background: white; padding: 0.65rem 0.85rem; font-weight: 700; color: #1c1917; outline: none; transition: all .15s ease; }
        .kf-input:focus { border-color: #fb7185; box-shadow: 0 0 0 4px rgba(251,113,133,0.15); }
        .kf-input::placeholder { color: #a8a29e; font-weight: 600; }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub components
// ─────────────────────────────────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[11px] font-extrabold text-stone-500 mb-1.5 px-1">{label}</span>
      {children}
    </label>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Personal welcome strip — rotating daily affirmation, named, no clutter
// ─────────────────────────────────────────────────────────────────────────────
const AFFIRMATIONS = [
  { emoji: '🌸', text: 'أنتِ قويّة، ذكيّة، ومميّزة جداً' },
  { emoji: '⭐', text: 'كل يوم تتعلّمين شيئاً جديداً يصنع منكِ بطلة' },
  { emoji: '💖', text: 'قلبكِ الطيّب أجمل ما فيكِ' },
  { emoji: '🌟', text: 'الشجاعة أن تحاولي، حتى لو كان الأمر صعباً' },
  { emoji: '🦋', text: 'كوني نفسكِ — العالم يحتاج بطلة مثلكِ' },
  { emoji: '🌈', text: 'الأحلام الكبيرة تبدأ بخطوة صغيرة' },
  { emoji: '✨', text: 'عقلكِ كنز، اقرئي وتعلّمي وامرحي' },
];

const WEEKDAYS_AR = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
const MONTHS_AR = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5) return 'مساء الخير';
  if (h < 12) return 'صباح الخير';
  if (h < 17) return 'نهاركِ سعيد';
  if (h < 21) return 'مساء النور';
  return 'مساء الخير';
}

function WelcomeStrip({
  heroName, stars, level, streak, lastSection, onContinue,
}: {
  heroName: string; stars: number; level: number; streak: number;
  lastSection?: ChildProfile['lastSection']; onContinue: (route: string) => void;
}) {
  const today = new Date();
  const idx = today.getDate() % AFFIRMATIONS.length;
  const aff = AFFIRMATIONS[idx];
  const dateLabel = `${WEEKDAYS_AR[today.getDay()]} ${today.getDate()} ${MONTHS_AR[today.getMonth()]}`;

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-3xl bg-white ring-2 ring-stone-100 px-5 sm:px-7 py-5"
    >
      {/* soft accents */}
      <span className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-rose-400 via-pink-400 via-amber-400 to-orange-400" />
      <span className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-gradient-to-br from-rose-200 to-pink-200 opacity-40 blur-3xl pointer-events-none" />
      <span className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-gradient-to-br from-amber-200 to-orange-200 opacity-40 blur-3xl pointer-events-none" />

      <div className="relative flex items-center gap-4 sm:gap-6">
        {/* Animated hero badge */}
        <motion.div
          animate={{ rotate: [0, 6, -6, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="shrink-0 h-16 w-16 sm:h-20 sm:w-20 rounded-3xl bg-gradient-to-br from-rose-400 via-pink-500 to-fuchsia-500 flex items-center justify-center text-3xl sm:text-4xl shadow-xl shadow-pink-200"
        >
          {aff.emoji}
        </motion.div>

        {/* Personal text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <p className="text-[11px] sm:text-xs font-extrabold text-rose-500">{getGreeting()} · {dateLabel}</p>
            {streak >= 2 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 text-orange-600 px-2 py-0.5 text-[11px] font-black ring-1 ring-orange-200">
                🔥 {streak} يوم متتالي
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 mb-1 leading-tight truncate">
            أهلاً يا <span className="bg-gradient-to-r from-rose-500 to-pink-500 bg-clip-text text-transparent">{heroName}</span>
          </h2>
          <p className="text-sm sm:text-base text-stone-600 font-bold leading-snug line-clamp-2">{aff.text}</p>
        </div>

        {/* Compact stats badge (desktop only) */}
        <div className="hidden md:flex flex-col gap-2 shrink-0">
          <div className="flex items-center gap-2 rounded-2xl bg-amber-50 ring-1 ring-amber-200 px-3 py-2">
            <Star className="h-5 w-5 text-amber-500 fill-current" />
            <div>
              <p className="text-[10px] font-extrabold text-amber-600 leading-none">نجوم</p>
              <p className="text-base font-black text-amber-700 leading-tight">{stars}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-2xl bg-violet-50 ring-1 ring-violet-200 px-3 py-2">
            <Crown className="h-5 w-5 text-violet-500" />
            <div>
              <p className="text-[10px] font-extrabold text-violet-600 leading-none">المستوى</p>
              <p className="text-base font-black text-violet-700 leading-tight">{level}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Continue last activity */}
      {lastSection && (
        <button
          onClick={() => onContinue(lastSection.route)}
          className="relative mt-4 w-full sm:w-auto inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-rose-50 to-pink-50 hover:from-rose-100 hover:to-pink-100 ring-1 ring-rose-200 px-4 py-3 text-right transition-all active:scale-[0.98]"
        >
          <div className={`h-10 w-10 rounded-xl ${ACCENT[lastSection.accent as keyof typeof ACCENT]?.bg || 'bg-rose-500'} text-white flex items-center justify-center shadow-md shrink-0`}>
            <PlayCircle className="h-5 w-5" strokeWidth={2.5} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-extrabold text-rose-500 leading-none mb-1">أكملي مغامرتكِ</p>
            <p className="text-sm font-black text-stone-800 truncate">{lastSection.title}</p>
          </div>
          <ChevronLeft className="h-5 w-5 text-rose-500 shrink-0" strokeWidth={3} />
        </button>
      )}
    </motion.section>
  );
}

function SectionCard({ item, onClick }: { item: SectionItem; onClick: () => void }) {
  const a = ACCENT[item.accent];
  return (
    <motion.button
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={`group relative overflow-hidden rounded-3xl bg-white ring-2 ring-stone-200 hover:ring-stone-300 hover:shadow-2xl text-center p-5 sm:p-7 transition-all min-h-[180px] sm:min-h-[220px] flex flex-col items-center justify-center`}
    >
      <span className={`absolute -top-16 -right-16 h-40 w-40 rounded-full bg-gradient-to-br ${a.from} ${a.to} opacity-20 blur-2xl group-hover:opacity-40 transition-opacity`} />
      <span className={`absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-gradient-to-br ${a.from} ${a.to} opacity-15 blur-2xl`} />

      <div className="relative flex flex-col items-center">
        <div className={`h-20 w-20 sm:h-24 sm:w-24 rounded-3xl ${a.bg} text-white flex items-center justify-center mb-3 shadow-xl shadow-stone-300/60 group-hover:scale-110 group-active:scale-95 transition-transform`}>
          <item.Icon className="h-10 w-10 sm:h-12 sm:w-12" strokeWidth={2.5} />
        </div>
        <h3 className="text-lg sm:text-xl font-black text-stone-800 leading-tight mb-1">{item.title}</h3>
        <p className="text-xs sm:text-sm text-stone-500 font-bold leading-snug line-clamp-2">{item.subtitle}</p>
      </div>
    </motion.button>
  );
}
