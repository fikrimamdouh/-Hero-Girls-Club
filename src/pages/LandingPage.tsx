import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Sparkles, Heart, Shield, Palette, Users, Moon, Lock, ArrowRight, Info, MapPin, Cloud, Settings } from 'lucide-react';
import { GiQueenCrown, GiFairyWand, GiUnicorn } from 'react-icons/gi';
import { HiShieldCheck } from 'react-icons/hi2';
import HeroScene from '../components/landing/HeroScene';
import EntryCard from '../components/landing/EntryCard';
import ChildLoginPanel from '../components/landing/ChildLoginPanel';
import WhatsInsideSection from '../components/landing/WhatsInsideSection';
import JoinCTASection from '../components/landing/JoinCTASection';
import BrandFooter from '../components/landing/BrandFooter';
import StatsStrip from '../components/landing/StatsStrip';
import HowItWorksSection from '../components/landing/HowItWorksSection';
import { auth, db } from '../firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs, setDoc, addDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { UserProfile, ChildProfile, ActivityLog } from '../types';
import { toast } from 'sonner';
import { handleFirestoreError, OperationType } from '../lib/firestore-utils';

export default function LandingPage({ user }: { user: UserProfile | null }) {
  const navigate = useNavigate();
  const [showPinLogin, setShowPinLogin] = useState(false);
  const [childName, setChildName] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleParentLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      let userDoc;
      try {
        userDoc = await getDoc(doc(db, 'users', result.user.uid));
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `users/${result.user.uid}`);
        return;
      }
      
      if (!userDoc.exists()) {
        // New parent user
        const newUser: UserProfile = {
          uid: result.user.uid,
          email: result.user.email || '',
          role: 'parent',
          displayName: result.user.displayName || 'ولي أمر',
          createdAt: Date.now()
        };
        try {
          await setDoc(doc(db, 'users', result.user.uid), newUser);
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${result.user.uid}`);
          return;
        }
      }
      navigate('/parent');
    } catch (error: any) {
      if (error.code === 'auth/cancelled-popup-request' || error.code === 'auth/popup-closed-by-user') {
        // User closed the popup or opened another one, handle gracefully
        toast.info('تم إغلاق نافذة تسجيل الدخول، يرجى المحاولة مرة أخرى إذا كنتِ ترغبين في الدخول.');
      } else {
        console.error("Parent login error:", error);
        toast.error('حدث خطأ أثناء تسجيل الدخول: ' + (error.message || 'يرجى التأكد من اتصالك بالإنترنت'));
      }
    }
  };

  const [showRegister, setShowRegister] = useState(false);
  const [allChildren, setAllChildren] = useState<ChildProfile[]>([]);

  useEffect(() => {
    if (!user) {
      setAllChildren([]);
      return;
    }
    
    const childrenRef = collection(db, 'children_profiles');
    const q = user.email === 'rorofikri@gmail.com' 
      ? query(childrenRef)
      : query(childrenRef, where('parentId', '==', user.uid));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const children = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as ChildProfile));
      setAllChildren(children);
    }, (err) => {
      console.error("Error fetching children for landing page:", err);
    });
    
    return () => unsubscribe();
  }, [user]);

  const [regStep, setRegStep] = useState(1);
  const [regData, setRegData] = useState({ 
    parentName: '', 
    heroName: '', 
    realName: '',
    email: '', 
    phone: '', 
    pin: '', 
    school: '', 
    city: '', 
    hobbies: '',
    heroPower: 'قوة الشجاعة',
    ageGroup: '6-8' as '3-5' | '6-8' | '9-12'
  });

  const HERO_POWERS = [
    { id: 'courage', name: 'قوة الشجاعة', icon: '🛡️', color: 'bg-orange-100 text-orange-600' },
    { id: 'kindness', name: 'قوة اللطف', icon: '💖', color: 'bg-pink-100 text-pink-600' },
    { id: 'wisdom', name: 'قوة الحكمة', icon: '🧠', color: 'bg-blue-100 text-blue-600' },
    { id: 'creativity', name: 'قوة الإبداع', icon: '🎨', color: 'bg-purple-100 text-purple-600' },
    { id: 'nature', name: 'قوة الطبيعة', icon: '🌿', color: 'bg-green-100 text-green-600' },
    { id: 'sparkle', name: 'قوة اللمعان', icon: '✨', color: 'bg-yellow-100 text-yellow-600' },
  ];

  const handleRegisterChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regData.parentName || !regData.realName || !regData.heroName || !regData.email || !regData.pin) {
      toast.error('يرجى إكمال جميع البيانات المطلوبة');
      return;
    }
    if (regData.pin.length !== 4) {
      toast.error('الرمز السري يجب أن يكون 4 أرقام');
      return;
    }
    setLoading(true);
    try {
      // Check for duplicate real name
      const nameQuery = query(collection(db, 'children_profiles'), where('name', '==', regData.realName));
      const nameSnapshot = await getDocs(nameQuery);
      if (!nameSnapshot.empty) {
        toast.error('عذراً، هذا الاسم مسجل مسبقاً في النظام');
        setLoading(false);
        return;
      }

      // Check for duplicate hero name
      const heroQuery = query(collection(db, 'children_profiles'), where('heroName', '==', regData.heroName));
      const heroSnapshot = await getDocs(heroQuery);
      if (!heroSnapshot.empty) {
        toast.error('عذراً، اسم البطلة هذا مأخوذ بالفعل، اختاري اسماً آخراً مميزاً');
        setLoading(false);
        return;
      }

      const childId = Math.random().toString(36).substring(7);
      const newChild: ChildProfile = {
        uid: childId,
        parentId: 'pending_approval', 
        name: regData.realName,
        parentName: regData.parentName,
        email: regData.email,
        phone: regData.phone,
        pin: regData.pin,
        school: regData.school,
        city: regData.city,
        hobbies: regData.hobbies,
        heroName: regData.heroName,
        heroPower: regData.heroPower,
        ageGroup: regData.ageGroup,
        heroBadge: 'courage',
        points: 0,
        level: 1,
        avatar: {
          hairStyle: '💇‍♀️',
          dressStyle: '👗',
          color: 'bg-pink-400',
          accessory: '👑'
        },
        status: 'pending',
        createdAt: Date.now(),
        houseConfig: {
          theme: 'castle',
          furniture: [],
          decorations: [],
          wallpaper: 'bg-gradient-to-b from-pink-100 to-rose-200',
          floor: 'bg-rose-100',
          rooms: {}
        }
      };

      try {
        await setDoc(doc(db, 'children_profiles', childId), newChild);
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `children_profiles/${childId}`);
      }
      
      // Notify admin
      try {
        await fetch('/api/notify-registration', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: regData.parentName,
            email: regData.email,
            heroName: regData.heroName,
            phone: regData.phone
          })
        });
      } catch (err) {
        console.error('Failed to notify admin:', err);
      }

      setRegStep(6); // Success step
      // Reset after success
      setTimeout(() => {
        setShowRegister(false);
        setRegStep(1);
        setRegData({ parentName: '', heroName: '', realName: '', email: '', phone: '', pin: '', school: '', city: '', hobbies: '', heroPower: 'قوة الشجاعة', ageGroup: '6-8' });
      }, 10000); // Give more time to see the success screen
    } catch (error: any) {
      console.error('Registration error:', error);
      toast.error('حدث خطأ أثناء التسجيل: ' + (error.message || 'يرجى المحاولة مرة أخرى'));
    } finally {
      setLoading(false);
    }
  };

  const logLoginActivity = async (childId: string, childName: string, status: 'success' | 'failed', message: string) => {
    try {
      await addDoc(collection(db, 'activity_logs'), {
        childId,
        childName,
        message,
        type: 'login',
        status,
        timestamp: Date.now()
      });
    } catch (err) {
      console.error('Failed to log login activity:', err);
    }
  };

  const normalizeArabic = (text: string) => {
    const NAME_ALIASES: Record<string, string> = {
      'maria': 'ماريا',
      'malik': 'مالك',
      'reena': 'رينا',
      'مارية': 'ماريا',
      'ريما': 'رينا'
    };

    let result = text
      .toLowerCase()
      .trim()
      .replace(/[أإآ]/g, 'ا')
      .replace(/[ةه]/g, 'ه')
      .replace(/[ىيئ]/g, 'ي')
      .replace(/ؤ/g, 'و')
      .replace(/[\u064B-\u0652]/g, '')
      .replace(/\s+/g, ' ');

    // Check aliases
    if (NAME_ALIASES[result]) return NAME_ALIASES[result];
    
    return result;
  };

  const handleRecoverPin = async (rawName: string) => {
    const name = rawName.trim();
    if (!name) throw new Error('من فضلك اكتبي اسمكِ أولاً');

    // 1. Find child profile (same lookup logic as login)
    const qName = query(collection(db, 'children_profiles'), where('name', '==', name));
    const qHero = query(collection(db, 'children_profiles'), where('heroName', '==', name));
    let snap = await getDocs(qName);
    if (snap.empty) snap = await getDocs(qHero);
    let target = !snap.empty ? snap.docs[0] : null;

    if (!target) {
      const all = await getDocs(collection(db, 'children_profiles'));
      const norm = normalizeArabic(name);
      target = all.docs.find((d) => {
        const dat = d.data();
        return normalizeArabic(dat.name || '') === norm || normalizeArabic(dat.heroName || '') === norm;
      }) || null;
      if (!target && norm.length >= 2) {
        target = all.docs.find((d) => {
          const dat = d.data();
          const a = normalizeArabic(dat.name || '');
          const b = normalizeArabic(dat.heroName || '');
          return a.includes(norm) || b.includes(norm) || norm.includes(a) || norm.includes(b);
        }) || null;
      }
    }

    if (!target) throw new Error('لم نجد بطلة بهذا الاسم');

    const childData = target.data() as ChildProfile;
    if (!childData.parentId) throw new Error('لا يوجد ولي أمر مرتبط');
    if (!childData.pin) throw new Error('لا يوجد رمز محفوظ');

    // 2. Lookup parent's email
    const parentSnap = await getDoc(doc(db, 'users', childData.parentId));
    if (!parentSnap.exists()) throw new Error('لم نجد ولي الأمر');
    const parentData = parentSnap.data() as { email?: string; displayName?: string; name?: string };
    const parentEmail = parentData.email;
    if (!parentEmail) throw new Error('لا يوجد إيميل مسجل لولي الأمر');

    // 3. Send recovery email via backend
    const res = await fetch('/api/send-recovery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: parentEmail,
        childName: childData.heroName || childData.name,
        pin: childData.pin,
        parentName: parentData.displayName || parentData.name || 'ولي الأمر',
      }),
    });
    const data = await res.json();
    if (!res.ok || !data.success) throw new Error(data.error || 'تعذر إرسال البريد');
    toast.success('تم إرسال الرمز إلى إيميل ولي الأمر ✉️');
  };

  const handleChildLogin = async () => {
    const rawName = childName.trim();
    if (!rawName || !pin) {
      toast.error('يرجى إدخال الاسم والرمز السري');
      return;
    }
    setLoading(true);
    try {
      console.log('Attempting login for:', rawName);
      
      // 1. Try exact match first
      const qName = query(collection(db, 'children_profiles'), where('name', '==', rawName));
      const qHero = query(collection(db, 'children_profiles'), where('heroName', '==', rawName));

      let querySnapshot = await getDocs(qName);
      if (querySnapshot.empty) {
        querySnapshot = await getDocs(qHero);
      }

      let targetDoc = !querySnapshot.empty ? querySnapshot.docs[0] : null;

      // 2. If not found, try normalized search client-side
      if (!targetDoc) {
        const allProfilesSnapshot = await getDocs(collection(db, 'children_profiles'));
        const normalizedInput = normalizeArabic(rawName);
        console.log('Normalized input:', normalizedInput);
        
        const sortedDocs = [...allProfilesSnapshot.docs].sort((a, b) => {
          const aData = a.data();
          const bData = b.data();
          if (aData.status === 'approved' && bData.status !== 'approved') return -1;
          if (bData.status === 'approved' && aData.status !== 'approved') return 1;
          return 0;
        });

        // Try normalized exact match
        targetDoc = sortedDocs.find(doc => {
          const data = doc.data();
          const normalizedRealName = normalizeArabic(data.name || '');
          const normalizedHeroName = normalizeArabic(data.heroName || '');
          return normalizedRealName === normalizedInput || normalizedHeroName === normalizedInput;
        }) || null;

        // 3. If still not found, try partial match (contains)
        if (!targetDoc && normalizedInput.length >= 2) {
          targetDoc = sortedDocs.find(doc => {
            const data = doc.data();
            const normalizedRealName = normalizeArabic(data.name || '');
            const normalizedHeroName = normalizeArabic(data.heroName || '');
            return normalizedRealName.includes(normalizedInput) || 
                   normalizedHeroName.includes(normalizedInput) ||
                   normalizedInput.includes(normalizedRealName) ||
                   normalizedInput.includes(normalizedHeroName);
          }) || null;
        }
      }
      
      if (targetDoc) {
        const childData = { ...targetDoc.data(), uid: targetDoc.id } as ChildProfile;
        console.log('Found profile:', childData.uid, childData.name);
        
        if (childData.pin !== pin) {
          await logLoginActivity(childData.uid, rawName, 'failed', 'محاولة دخول برمز سري خاطئ');
          toast.error('الرمز السري غير صحيح');
          return;
        }

        if (childData.status === 'pending') {
          await logLoginActivity(childData.uid, rawName, 'failed', 'محاولة دخول لحساب قيد المراجعة');
          toast.info('حسابك قيد المراجعة، يرجى المحاولة لاحقاً بعد الموافقة.');
          return;
        }
        if (childData.status === 'rejected') {
          await logLoginActivity(childData.uid, rawName, 'failed', 'محاولة دخول لحساب مرفوض');
          toast.error('عذراً، تم رفض طلب الانضمام.');
          return;
        }

        await logLoginActivity(childData.uid, rawName, 'success', 'تسجيل دخول ناجح');
        localStorage.setItem('active_child', JSON.stringify(childData));
        setShowPinLogin(false);
        toast.success(`مرحباً يا بطلة ${childData.heroName || childData.name}! ✨`);
        
        // Use window.location.href for a more robust transition that ensures localStorage is picked up
        window.location.href = '/child';
      } else {
        toast.error('الاسم غير موجود، تأكدي من كتابة اسمكِ أو لقبكِ بشكل صحيح');
        console.warn('No profile found for input:', rawName);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('حدث خطأ أثناء تسجيل الدخول، يرجى المحاولة مرة أخرى');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center overflow-hidden bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50 px-4 py-8 sm:px-6 lg:px-8">
      {/* Background mesh + soft aurora */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ x: [0, 40, 0], y: [0, -20, 0], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -left-20 -top-10 h-[32rem] w-[32rem] rounded-full bg-rose-200/55 blur-[120px]"
        />
        <motion.div
          animate={{ x: [0, -30, 0], y: [0, 30, 0], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -right-20 top-1/3 h-[34rem] w-[34rem] rounded-full bg-pink-200/55 blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.4, 0.25] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-0 left-1/2 h-[38rem] w-[38rem] -translate-x-1/2 rounded-full bg-amber-200/50 blur-[140px]"
        />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(190,24,93,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(190,24,93,0.5) 1px, transparent 1px)',
            backgroundSize: '64px 64px',
          }}
        />
        {/* Star particles */}
        {[...Array(16)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -30, 0], opacity: [0, 0.6, 0] }}
            transition={{ duration: 3 + (i % 4), repeat: Infinity, delay: i * 0.3 }}
            className="absolute text-xs text-rose-300"
            style={{ left: `${4 + (i * 6.1) % 92}%`, top: `${6 + (i * 9.3) % 88}%` }}
          >✦</motion.div>
        ))}
      </div>

      {/* Top brand bar */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-20 mb-8 flex w-full max-w-6xl items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-pink-500 to-fuchsia-600 shadow-[0_0_24px_rgba(236,72,153,0.5)] sm:h-12 sm:w-12">
            <GiQueenCrown className="h-6 w-6 text-white sm:h-7 sm:w-7" />
          </div>
          <div className="text-right">
            <div className="font-arabic text-base font-extrabold leading-tight text-rose-950 sm:text-lg">نادي البطلات</div>
            <div className="font-arabic text-[10px] text-rose-700 sm:text-xs">عالم آمن للفتيات</div>
          </div>
        </div>
        <div className="hidden items-center gap-2 rounded-full bg-white px-3 py-1.5 shadow-sm ring-1 ring-rose-100 sm:flex">
          <HiShieldCheck className="h-4 w-4 text-emerald-500" />
          <span className="font-arabic text-xs font-bold text-rose-700">منصة معتمدة بإشراف ولي الأمر</span>
        </div>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 grid w-full max-w-6xl grid-cols-1 items-center gap-8 rounded-[2.5rem] bg-white/80 p-5 shadow-[0_30px_80px_-20px_rgba(244,63,94,0.35)] ring-1 ring-rose-100 backdrop-blur-xl sm:p-8 md:p-10 lg:grid-cols-12 lg:gap-10 lg:p-12"
      >
        {/* Left: Hero illustration (desktop) */}
        <div className="order-2 hidden lg:order-1 lg:col-span-5 lg:block">
          <HeroScene />
        </div>

        {/* Right: Title + content */}
        <div className="order-1 text-center lg:order-2 lg:col-span-7 lg:text-right">
          {/* Mobile mini scene */}
          <div className="mx-auto mb-6 max-w-xs lg:hidden">
            <HeroScene />
          </div>

          <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-100 to-pink-100 px-3 py-1.5 ring-1 ring-rose-200">
            <GiFairyWand className="h-4 w-4 text-pink-600" />
            <span className="font-arabic text-[11px] font-bold text-rose-700 sm:text-xs">نادي خاص للبطلات الصغيرات</span>
          </div>

          <h1 className="mb-3 font-arabic text-4xl font-black leading-[1.1] tracking-tight text-rose-950 sm:text-5xl md:text-6xl">
            نادي <span className="bg-gradient-to-r from-rose-500 via-pink-500 to-fuchsia-500 bg-clip-text text-transparent">البطلات</span> الصغيرات
          </h1>
          <p className="mb-8 font-arabic text-base leading-8 text-rose-700/85 sm:text-lg md:text-xl lg:max-w-xl">
            عالم سحري متكامل: ألعاب، قصص، فنون، أنشطة، ومكافآت
            <br className="hidden sm:block" />
            <span className="text-rose-600/70">مكان آمن للبطلة، ولوحة كاملة لولي الأمر.</span>
          </p>

        <AnimatePresence mode="wait">
          {!showPinLogin && !showRegister ? (
            <motion.div
              key="buttons"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-4"
            >
              <EntryCard
                variant="cartoon"
                badge="ابدئي اللعب"
                icon={<GiUnicorn />}
                title="دخول البطلة الصغيرة"
                subtitle="ادخلي باسمك ورمزك السري وابدئي مغامرتك"
                onClick={() => setShowPinLogin(true)}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <EntryCard
                  variant="elegant"
                  icon={<Shield className="h-7 w-7" />}
                  title={user ? 'لوحة ولي الأمر' : 'دخول ولي الأمر'}
                  subtitle="تابعي تقدم بطلتك"
                  onClick={handleParentLogin}
                />
                <EntryCard
                  variant="modern"
                  icon={<Sparkles className="h-7 w-7" />}
                  title="انضمام بطلة جديدة"
                  subtitle="سجّلي حساب جديد"
                  onClick={() => setShowRegister(true)}
                />
              </div>

              {user?.email === 'rorofikri@gmail.com' && (
                <button
                  onClick={() => navigate('/admin')}
                  className="flex w-full items-center justify-center gap-3 rounded-2xl bg-rose-950 px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-rose-900 sm:text-base"
                >
                  <Shield className="h-5 w-5" />
                  لوحة الإدارة (للمدير)
                </button>
              )}
              {user && (
                <button
                  onClick={() => {
                    auth.signOut();
                    localStorage.removeItem('active_child');
                    window.location.reload();
                  }}
                  className="block w-full text-center text-sm font-bold text-rose-700 transition-colors hover:text-rose-900"
                >
                  تسجيل خروج ({user.email})
                </button>
              )}
            </motion.div>
          ) : showRegister ? (
            <motion.div
              key="register"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="relative space-y-6 overflow-hidden rounded-[2rem] bg-gradient-to-br from-rose-950 via-rose-900 to-pink-900 p-5 text-right shadow-[0_20px_60px_rgba(0,0,0,0.3)] ring-1 ring-rose-200/20 sm:p-7 md:p-8"
            >
              {/* Progress Bar */}
              <div className="relative mb-8 flex justify-between gap-2">
                <div className="absolute left-0 top-1/2 z-0 h-1 w-full -translate-y-1/2 rounded-full bg-white/20"></div>
                <div 
                  className="absolute left-0 top-1/2 z-0 h-1 -translate-y-1/2 rounded-full bg-gradient-to-r from-pink-400 to-fuchsia-400 transition-all duration-500"
                  style={{ width: `${((regStep - 1) / 4) * 100}%` }}
                ></div>
                {[1, 2, 3, 4, 5].map((s) => (
                  <div 
                    key={s}
                    className={`z-10 flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all duration-300 sm:h-10 sm:w-10 ${
                      regStep >= s ? 'scale-110 bg-gradient-to-r from-pink-400 to-fuchsia-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.6)]' : 'bg-white/20 text-white/60'
                    }`}
                  >
                    {s}
                  </div>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {regStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5"
                  >
                    <div className="mb-7 text-center">
                      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/20 border border-rose-400/30">
                        <Shield className="h-8 w-8 text-rose-300" />
                      </div>
                      <h2 className="text-2xl font-extrabold text-white sm:text-3xl">بيانات ولي الأمر</h2>
                      <p className="text-sm leading-7 text-white/60 sm:text-base">نبدأ بتأمين الحساب لولي الأمر</p>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-bold text-white/80">اسم ولي الأمر</label>
                      <input
                        type="text"
                        value={regData.parentName}
                        onChange={(e) => setRegData({...regData, parentName: e.target.value})}
                        className="w-full rounded-2xl border border-white/40 bg-white px-4 py-4 text-rose-950 shadow-sm outline-none transition-all placeholder:text-rose-400 focus:border-pink-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(244,114,182,0.35)]"
                        placeholder="الاسم الكامل"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-bold text-white/80">البريد الإلكتروني</label>
                      <input
                        type="email"
                        value={regData.email}
                        onChange={(e) => setRegData({...regData, email: e.target.value})}
                        className="w-full rounded-2xl border border-white/40 bg-white px-4 py-4 text-rose-950 shadow-sm outline-none transition-all placeholder:text-rose-400 focus:border-pink-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(244,114,182,0.35)]"
                        placeholder="example@mail.com"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-bold text-white/80">رقم الجوال (مع رمز الدولة)</label>
                      <input
                        type="tel"
                        value={regData.phone}
                        onChange={(e) => setRegData({...regData, phone: e.target.value})}
                        className="w-full rounded-2xl border border-white/40 bg-white px-4 py-4 text-left text-rose-950 shadow-sm outline-none transition-all placeholder:text-rose-400 focus:border-pink-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(244,114,182,0.35)]"
                        dir="ltr"
                        placeholder="+20 1xxxxxxxxx"
                      />
                    </div>
                    <button
                      onClick={() => {
                        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                        // Accept any phone number with optional + and 8-20 digits/spaces
                        const phoneRegex = /^\+?[0-9\s\-]{8,20}$/;
                        
                        if (!regData.parentName) {
                          toast.error('يرجى إدخال اسم ولي الأمر');
                          return;
                        }
                        if (!emailRegex.test(regData.email)) {
                          toast.error('يرجى إدخال بريد إلكتروني صحيح');
                          return;
                        }
                        if (!phoneRegex.test(regData.phone)) {
                          toast.error('يرجى إدخال رقم جوال صحيح (مثال: 1xxxxxxxxx 20+)');
                          return;
                        }
                        setRegStep(2);
                      }}
                      className="w-full rounded-2xl bg-gradient-to-r from-rose-400 to-pink-500 py-4 font-bold text-white shadow-[0_14px_30px_rgba(244,114,182,0.25)] transition-all hover:shadow-[0_18px_34px_rgba(244,114,182,0.3)]"
                    >
                      التالي: بيانات البطلة
                    </button>
                  </motion.div>
                )}

                {regStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5"
                  >
                    <div className="mb-7 text-center">
                      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/20 border border-amber-400/30">
                        <Star className="h-8 w-8 text-amber-300" />
                      </div>
                      <h2 className="text-2xl font-extrabold text-white sm:text-3xl">هوية البطلة</h2>
                      <p className="text-sm leading-7 text-white/60 sm:text-base">من هي بطلتنا الصغيرة؟</p>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-bold text-white/80">الاسم الحقيقي للبطلة</label>
                      <input
                        type="text"
                        value={regData.realName}
                        onChange={(e) => setRegData({...regData, realName: e.target.value})}
                        className="w-full rounded-2xl border border-white/40 bg-white px-4 py-4 text-rose-950 shadow-sm outline-none transition-all placeholder:text-rose-400 focus:border-pink-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(244,114,182,0.35)]"
                        placeholder="مثال: سارة"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-bold text-white/80">اسم البطولة (اللقب)</label>
                      <div className="mb-4 flex flex-wrap gap-2">
                        {['صبورة', 'ذكية', 'شجاعة', 'كريمة', 'رسامة', 'مفكرة'].map(title => (
                          <button
                            key={title}
                            onClick={() => setRegData({...regData, heroName: `البطلة ${title}`})}
                            className={`rounded-full border px-3 py-2 text-xs font-bold transition-all ${
                              regData.heroName === `البطلة ${title}`
                                ? 'scale-105 border-rose-400 bg-rose-400 text-white shadow-md'
                                : 'bg-white text-rose-400 border-rose-100 hover:border-rose-200'
                            }`}
                          >
                            {title} ✨
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        value={regData.heroName}
                        onChange={(e) => setRegData({...regData, heroName: e.target.value})}
                        className="w-full rounded-2xl border border-white/40 bg-white px-4 py-4 text-rose-950 shadow-sm outline-none transition-all placeholder:text-rose-400 focus:border-pink-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(244,114,182,0.35)]"
                        placeholder="او اكتبي لقبكِ الخاص.. (مثال: بطلة النجوم)"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-bold text-white/80">الفئة العمرية</label>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        {['3-5', '6-8', '9-12'].map((age) => (
                          <button
                            key={age}
                            onClick={() => setRegData({...regData, ageGroup: age as any})}
                            className={`rounded-2xl py-3.5 font-bold transition-all ${
                              regData.ageGroup === age 
                                ? 'bg-gradient-to-r from-rose-400 to-pink-500 text-white shadow-md' 
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {age} سنوات
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <button
                        onClick={() => setRegStep(1)}
                        className="rounded-2xl border border-white/20 bg-white/10 py-4 font-bold text-white/80 transition-all hover:bg-white/15"
                      >
                        السابق
                      </button>
                      <button
                        onClick={() => regData.realName && regData.heroName ? setRegStep(3) : toast.error('يرجى ملء البيانات')}
                        className="rounded-2xl bg-gradient-to-r from-rose-400 to-pink-500 py-4 font-bold text-white shadow-[0_14px_30px_rgba(244,114,182,0.25)] transition-all hover:shadow-[0_18px_34px_rgba(244,114,182,0.3)]"
                      >
                        التالي
                      </button>
                    </div>
                  </motion.div>
                )}

                {regStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5"
                  >
                    <div className="mb-7 text-center">
                      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-500/20 border border-pink-400/30">
                        <Sparkles className="h-8 w-8 text-pink-300" />
                      </div>
                      <h2 className="text-2xl font-extrabold text-white sm:text-3xl">القوة الخارقة</h2>
                      <p className="text-sm leading-7 text-white/60 sm:text-base">اختاري قوتك المميزة</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {HERO_POWERS.map((power) => (
                        <button
                          key={power.id}
                          onClick={() => setRegData({...regData, heroPower: power.name})}
                          className={`flex flex-col items-center gap-2 rounded-2xl border p-4 transition-all ${
                            regData.heroPower === power.name 
                              ? 'scale-105 border-pink-400/60 bg-pink-500/20 shadow-[0_0_20px_rgba(236,72,153,0.3)]' 
                              : 'border-white/20 bg-white/10 hover:border-white/40 hover:bg-white/15'
                          }`}
                        >
                          <span className="text-2xl">{power.icon}</span>
                          <span className="text-xs font-bold text-white/90">{power.name}</span>
                        </button>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-4">
                      <button
                        onClick={() => setRegStep(2)}
                        className="rounded-2xl border border-white/20 bg-white/10 py-4 font-bold text-white/80 transition-all hover:bg-white/15"
                      >
                        السابق
                      </button>
                      <button
                        onClick={() => setRegStep(4)}
                        className="rounded-2xl bg-gradient-to-r from-rose-400 to-pink-500 py-4 font-bold text-white shadow-[0_14px_30px_rgba(244,114,182,0.25)] transition-all hover:shadow-[0_18px_34px_rgba(244,114,182,0.3)]"
                      >
                        التالي
                      </button>
                    </div>
                  </motion.div>
                )}

                {regStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5"
                  >
                    <div className="mb-7 text-center">
                      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-500/20 border border-sky-400/30">
                        <MapPin className="h-8 w-8 text-sky-300" />
                      </div>
                      <h2 className="text-2xl font-extrabold text-white sm:text-3xl">الموقع والمدرسة</h2>
                      <p className="text-sm leading-7 text-white/60 sm:text-base">أين تقع مدرستك الجميلة؟</p>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-bold text-white/80">المدينة</label>
                      <input
                        type="text"
                        value={regData.city}
                        onChange={(e) => setRegData({...regData, city: e.target.value})}
                        className="w-full rounded-2xl border border-white/40 bg-white px-4 py-4 text-rose-950 shadow-sm outline-none transition-all placeholder:text-rose-400 focus:border-pink-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(244,114,182,0.35)]"
                        placeholder="اسم المدينة"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-bold text-white/80">المدرسة</label>
                      <input
                        type="text"
                        value={regData.school}
                        onChange={(e) => setRegData({...regData, school: e.target.value})}
                        className="w-full rounded-2xl border border-white/40 bg-white px-4 py-4 text-rose-950 shadow-sm outline-none transition-all placeholder:text-rose-400 focus:border-pink-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(244,114,182,0.35)]"
                        placeholder="اسم المدرسة"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4">
                      <button
                        onClick={() => setRegStep(3)}
                        className="rounded-2xl border border-white/20 bg-white/10 py-4 font-bold text-white/80 transition-all hover:bg-white/15"
                      >
                        السابق
                      </button>
                      <button
                        onClick={() => setRegStep(5)}
                        className="rounded-2xl bg-gradient-to-r from-rose-400 to-pink-500 py-4 font-bold text-white shadow-[0_14px_30px_rgba(244,114,182,0.25)] transition-all hover:shadow-[0_18px_34px_rgba(244,114,182,0.3)]"
                      >
                        التالي
                      </button>
                    </div>
                  </motion.div>
                )}

                {regStep === 5 && (
                  <motion.div
                    key="step5"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-5"
                  >
                    <div className="mb-7 text-center">
                      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/20 border border-rose-400/30">
                        <Lock className="h-8 w-8 text-rose-300" />
                      </div>
                      <h2 className="text-2xl font-extrabold text-white sm:text-3xl">المفتاح السحري</h2>
                      <p className="text-sm leading-7 text-white/60 sm:text-base">اختاري 4 أرقام سرية لدخولك</p>
                    </div>
                    <div className="flex justify-center gap-4">
                      <input
                        type="password"
                        maxLength={4}
                        value={regData.pin}
                        onChange={(e) => setRegData({...regData, pin: e.target.value})}
                        className="w-52 rounded-[1.75rem] border border-white/40 bg-white p-6 text-center text-4xl font-bold tracking-[1rem] text-rose-950 outline-none shadow-inner focus:border-pink-400 focus:bg-white focus:shadow-[0_0_0_4px_rgba(244,114,182,0.35)]"
                        placeholder="****"
                      />
                    </div>
                    <p className="text-center text-xs leading-6 text-white/50">هذا الرمز هو مفتاحكِ السري، لا تشاركيه مع أحد!</p>
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-6">
                      <button
                        onClick={() => setRegStep(4)}
                        className="rounded-2xl border border-white/20 bg-white/10 py-4 font-bold text-white/80 transition-all hover:bg-white/15"
                      >
                        السابق
                      </button>
                      <button
                        onClick={handleRegisterChild}
                        disabled={loading}
                        className="rounded-2xl bg-gradient-to-r from-rose-400 via-pink-500 to-fuchsia-500 py-4 font-bold text-white shadow-[0_16px_34px_rgba(217,70,239,0.28)] transition-all hover:shadow-[0_20px_40px_rgba(217,70,239,0.32)] disabled:opacity-50"
                      >
                        {loading ? 'جاري الإرسال...' : 'إرسال طلب الانضمام'}
                      </button>
                    </div>
                  </motion.div>
                )}

                {regStep === 6 && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="py-10 text-center"
                  >
                    <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/20 border border-emerald-400/40 shadow-[0_0_40px_rgba(16,185,129,0.4)]">
                      <Sparkles className="w-12 h-12 text-emerald-300" />
                    </div>
                    <h2 className="mb-4 text-3xl font-extrabold text-white">تم إرسال طلبكِ بنجاح!</h2>
                    <p className="mb-8 text-base leading-8 text-white/70">
                      يا بطلة <span className="font-bold text-pink-300">{regData.heroName}</span>، طلبكِ الآن في طريقه لمدير النادي للمراجعة.
                      <br />
                      سنقوم بإرسال إيميل لولي أمركِ فور الموافقة.
                    </p>
                    <div className="animate-pulse rounded-2xl bg-emerald-500/20 border border-emerald-400/30 px-4 py-4 text-sm font-bold text-emerald-300">
                      ترقبي رسالة سحرية قريباً! ✨
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {regStep < 6 && (
                <button
                  onClick={() => setShowRegister(false)}
                  className="mt-6 w-full text-center text-sm font-bold text-white/40 transition-colors hover:text-white/70"
                >
                  إلغاء التسجيل والعودة
                </button>
              )}
            </motion.div>
          ) : (
            <ChildLoginPanel
              childName={childName}
              setChildName={setChildName}
              pin={pin}
              setPin={setPin}
              loading={loading}
              onSubmit={handleChildLogin}
              onCancel={() => setShowPinLogin(false)}
              onRecover={handleRecoverPin}
              recentChildren={user ? allChildren : []}
            />
          )}
        </AnimatePresence>
        </div>
      </motion.div>

      {/* Quick trust strip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="relative z-10 mt-6 mb-2 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-center"
      >
        <span className="font-arabic text-[11px] font-bold text-rose-700/80">🛡️ آمن 100%</span>
        <span className="font-arabic text-[11px] font-bold text-rose-700/80">✨ بإشراف ولي الأمر</span>
        <span className="font-arabic text-[11px] font-bold text-rose-700/80">💝 محتوى عربي أصيل</span>
      </motion.div>

      {/* ─── Stats strip (modern social proof) ──────────────────────── */}
      <StatsStrip />

      {/* ─── How it works (elegant 3-step) ─────────────────────────── */}
      <HowItWorksSection />

      {/* ─── What's inside (elegant editorial) ─────────────────────── */}
      <div className="relative z-10 w-full">
        <WhatsInsideSection />
      </div>

      {/* ─── Final CTA (cartoon-game) ──────────────────────────────── */}
      <div className="relative z-10 w-full">
        <JoinCTASection onStart={() => setShowPinLogin(true)} />
      </div>

      {/* ─── Footer (full-width dark band) ─────────────────────────── */}
      <div className="relative z-10 -mx-4 w-[calc(100%+2rem)] sm:-mx-6 sm:w-[calc(100%+3rem)] lg:-mx-8 lg:w-[calc(100%+4rem)]">
        <BrandFooter />
      </div>
    </div>
  );
}
