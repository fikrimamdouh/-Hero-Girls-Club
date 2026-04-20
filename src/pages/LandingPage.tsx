import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Sparkles, Heart, Shield, Palette, Users, Moon, Lock, ArrowRight, Info, MapPin, Cloud, Settings } from 'lucide-react';
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
  const [isPatternMode, setIsPatternMode] = useState(false);
  const [loginPattern, setLoginPattern] = useState<number[]>([]);

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
        createdAt: Date.now()
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
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-fuchsia-950 via-violet-900 to-indigo-950 px-4 py-8 text-center sm:px-6 lg:px-8">
      {/* Magical Background Elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div 
          animate={{ x: ['-100%', '100vw'] }}
          transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          className="absolute top-16 opacity-30 sm:top-20"
        >
          <Cloud className="w-32 h-32 text-blue-200" />
        </motion.div>
        <motion.div 
          animate={{ x: ['100vw', '-100%'] }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          className="absolute top-56 opacity-20 sm:top-60"
        >
          <Cloud className="w-48 h-48 text-pink-200" />
        </motion.div>

        {/* Floating Dolls/Characters */}
        <motion.div 
          animate={{ y: [0, -40, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 6, repeat: Infinity }}
          className="absolute left-[8%] top-40 hidden text-7xl drop-shadow-sm lg:block xl:text-8xl doll-bounce"
        >
          👸
        </motion.div>
        <motion.div 
          animate={{ y: [0, -30, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          className="absolute bottom-36 right-[8%] hidden text-7xl drop-shadow-sm lg:block xl:text-8xl doll-bounce"
        >
          🧚‍♀️
        </motion.div>
        <motion.div 
          animate={{ y: [0, -20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity, delay: 2 }}
          className="absolute left-[4%] top-1/2 hidden text-6xl drop-shadow-sm lg:block xl:text-7xl doll-bounce"
        >
          🦄
        </motion.div>
        <motion.div 
          animate={{ y: [0, -25, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: 7, repeat: Infinity, delay: 0.5 }}
          className="absolute right-[4%] top-1/4 hidden text-6xl drop-shadow-sm lg:block xl:text-7xl doll-bounce"
        >
          🦋
        </motion.div>

        <motion.div 
          animate={{ y: [0, -20, 0], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute left-0 top-6 h-96 w-96 rounded-full bg-pink-600/30 blur-3xl sm:left-10 sm:top-10"
        />
        <motion.div 
          animate={{ y: [0, 20, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 7, repeat: Infinity }}
          className="absolute bottom-0 right-0 h-[28rem] w-[28rem] rounded-full bg-violet-600/25 blur-3xl sm:bottom-10 sm:right-10"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 9, repeat: Infinity }}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[40rem] w-[40rem] rounded-full bg-fuchsia-500/15 blur-3xl"
        />
        {/* Star particles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -30, 0], opacity: [0, 1, 0] }}
            transition={{ duration: 3 + (i % 4), repeat: Infinity, delay: i * 0.4 }}
            className="absolute text-white/20 text-xs"
            style={{ left: `${8 + (i * 7.5) % 84}%`, top: `${10 + (i * 13) % 80}%` }}
          >✦</motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10 w-full max-w-4xl rounded-[2.5rem] border border-white/15 bg-white/10 p-6 shadow-[0_32px_100px_rgba(0,0,0,0.5)] backdrop-blur-2xl sm:p-8 md:p-12 lg:p-14"
      >
        <div className="mb-8 flex justify-center sm:mb-10">
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
              className="absolute -inset-8 rounded-full bg-gradient-to-r from-pink-500 via-fuchsia-500 to-amber-400 blur-3xl opacity-50"
            />
            <div className="relative z-10 flex h-28 w-28 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-400 via-pink-500 to-fuchsia-600 shadow-[0_0_60px_rgba(236,72,153,0.6)] sm:h-32 sm:w-32 md:h-36 md:w-36">
              <Star className="h-16 w-16 text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.3)] sm:h-20 sm:w-20 md:h-24 md:w-24" />
            </div>
            <Sparkles className="absolute -right-3 -top-3 z-20 h-10 w-10 animate-bounce text-amber-300 sm:-right-4 sm:-top-4 sm:h-12 sm:w-12 md:h-14 md:w-14" />
            <Heart className="absolute -bottom-2 -left-3 z-20 h-8 w-8 animate-pulse text-pink-300 sm:-left-4 sm:h-10 sm:w-10" />
          </div>
        </div>

        <h1 className="sparkle-text mb-4 font-arabic text-4xl font-extrabold leading-[1.15] tracking-tight sm:mb-5 sm:text-5xl md:text-6xl lg:text-7xl">
          نادي البطلات الصغيرات
        </h1>
        <p className="mx-auto mb-10 max-w-2xl font-arabic text-lg leading-8 text-white/75 sm:mb-12 sm:text-xl md:text-2xl">
          عالم سحري آمن للبطلات الصغيرات - حيث تلتقي الشجاعة بالخيال والمغامرة! ✨
        </p>

        <AnimatePresence mode="wait">
          {!showPinLogin && !showRegister ? (
            <motion.div
              key="buttons"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="mb-10 grid grid-cols-1 gap-4 sm:gap-5 md:grid-cols-2 md:gap-6"
            >
              <button
                onClick={handleParentLogin}
                className="flex items-center justify-center gap-3 rounded-2xl border border-rose-200/70 bg-gradient-to-r from-rose-400 to-pink-500 px-8 py-4 text-base font-bold text-white shadow-[0_12px_30px_rgba(244,114,182,0.28)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(244,114,182,0.34)] active:scale-[0.98] sm:text-lg"
              >
                <Shield className="h-6 w-6" />
                {user ? 'لوحة ولي الأمر' : 'دخول ولي الأمر'}
              </button>
              <button
                onClick={() => setShowPinLogin(true)}
                className="flex items-center justify-center gap-3 rounded-2xl border border-violet-200/70 bg-gradient-to-r from-violet-500 to-fuchsia-500 px-8 py-4 text-base font-bold text-white shadow-[0_12px_30px_rgba(139,92,246,0.28)] transition-all hover:-translate-y-0.5 hover:shadow-[0_16px_36px_rgba(139,92,246,0.34)] active:scale-[0.98] sm:text-lg"
              >
                <Star className="h-6 w-6" />
                دخول البطلة الصغيرة
              </button>
              {user?.email === 'rorofikri@gmail.com' && (
                <button
                  onClick={() => navigate('/admin')}
                  className="md:col-span-2 flex items-center justify-center gap-3 rounded-2xl bg-slate-800 px-8 py-4 text-base font-bold text-white shadow-lg transition-all hover:bg-slate-900 sm:text-lg"
                >
                  <Shield className="h-6 w-6" />
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
                  className="md:col-span-2 text-sm font-bold text-slate-400 transition-colors hover:text-rose-500"
                >
                  تسجيل خروج ({user.email})
                </button>
              )}
              <button
                onClick={() => setShowRegister(true)}
                className="md:col-span-2 flex items-center justify-center gap-3 rounded-2xl border border-amber-200/70 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 px-8 py-5 text-lg font-extrabold text-white shadow-[0_16px_36px_rgba(251,146,60,0.28)] transition-all hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(251,146,60,0.34)] active:scale-[0.98] sm:text-xl"
              >
                <Sparkles className="h-8 w-8" />
                طلب انضمام بطلة جديدة
              </button>
            </motion.div>
          ) : showRegister ? (
            <motion.div
              key="register"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="relative mb-8 space-y-6 overflow-hidden rounded-[2rem] border border-white/20 bg-white/10 backdrop-blur-xl p-5 text-right shadow-[0_20px_60px_rgba(0,0,0,0.3)] sm:p-7 md:p-8"
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
                        className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-4 text-white shadow-sm outline-none transition-all placeholder:text-white/40 focus:border-pink-400/60 focus:bg-white/15 focus:shadow-[0_0_0_4px_rgba(236,72,153,0.2)]"
                        placeholder="الاسم الكامل"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-bold text-white/80">البريد الإلكتروني</label>
                      <input
                        type="email"
                        value={regData.email}
                        onChange={(e) => setRegData({...regData, email: e.target.value})}
                        className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-4 text-white shadow-sm outline-none transition-all placeholder:text-white/40 focus:border-pink-400/60 focus:bg-white/15 focus:shadow-[0_0_0_4px_rgba(236,72,153,0.2)]"
                        placeholder="example@mail.com"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-bold text-white/80">رقم الجوال (مع رمز الدولة)</label>
                      <input
                        type="tel"
                        value={regData.phone}
                        onChange={(e) => setRegData({...regData, phone: e.target.value})}
                        className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-4 text-left text-white shadow-sm outline-none transition-all placeholder:text-white/40 focus:border-pink-400/60 focus:bg-white/15 focus:shadow-[0_0_0_4px_rgba(236,72,153,0.2)]"
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
                        className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-4 text-white shadow-sm outline-none transition-all placeholder:text-white/40 focus:border-pink-400/60 focus:bg-white/15 focus:shadow-[0_0_0_4px_rgba(236,72,153,0.2)]"
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
                        className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-4 text-white shadow-sm outline-none transition-all placeholder:text-white/40 focus:border-pink-400/60 focus:bg-white/15 focus:shadow-[0_0_0_4px_rgba(236,72,153,0.2)]"
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
                      <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/20 border border-violet-400/30">
                        <Sparkles className="h-8 w-8 text-violet-300" />
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
                        className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-4 text-white shadow-sm outline-none transition-all placeholder:text-white/40 focus:border-pink-400/60 focus:bg-white/15 focus:shadow-[0_0_0_4px_rgba(236,72,153,0.2)]"
                        placeholder="اسم المدينة"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-bold text-white/80">المدرسة</label>
                      <input
                        type="text"
                        value={regData.school}
                        onChange={(e) => setRegData({...regData, school: e.target.value})}
                        className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-4 text-white shadow-sm outline-none transition-all placeholder:text-white/40 focus:border-pink-400/60 focus:bg-white/15 focus:shadow-[0_0_0_4px_rgba(236,72,153,0.2)]"
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
                        className="w-52 rounded-[1.75rem] border border-white/30 bg-white/10 p-6 text-center text-4xl font-bold tracking-[1rem] text-white outline-none shadow-inner backdrop-blur-md focus:border-pink-400/60 focus:bg-white/15 focus:shadow-[0_0_0_4px_rgba(236,72,153,0.2)]"
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
                        className="rounded-2xl bg-gradient-to-r from-rose-400 via-pink-500 to-violet-500 py-4 font-bold text-white shadow-[0_16px_34px_rgba(217,70,239,0.28)] transition-all hover:shadow-[0_20px_40px_rgba(217,70,239,0.32)] disabled:opacity-50"
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
            <motion.div
              key="pin-login"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="mb-8 space-y-4 rounded-[1.75rem] border border-white/20 bg-white/10 backdrop-blur-xl p-5 shadow-[0_18px_50px_rgba(0,0,0,0.3)] sm:p-6"
            >
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/30 border border-violet-400/40">
                  <Star className="h-6 w-6 text-violet-300" />
                </div>
                <h2 className="text-2xl font-extrabold text-white">دخول البطلة</h2>
              </div>
              <input
                type="text"
                placeholder="اسم البطلة"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-4 text-center text-lg text-white shadow-sm outline-none transition-all placeholder:text-white/40 focus:border-violet-400/60 focus:bg-white/15 focus:shadow-[0_0_0_4px_rgba(139,92,246,0.25)] sm:text-xl"
              />
              
              {!isPatternMode ? (
                <input
                  type="password"
                  placeholder="الرمز السري (PIN)"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-4 text-center text-lg text-white shadow-sm outline-none transition-all placeholder:text-white/40 focus:border-violet-400/60 focus:bg-white/15 focus:shadow-[0_0_0_4px_rgba(139,92,246,0.25)] sm:text-xl"
                />
              ) : (
                <div className="mt-4">
                  <div className="mx-auto grid max-w-[220px] grid-cols-3 gap-2 rounded-2xl bg-white/10 border border-white/20 p-2">
                    {[1,2,3,4,5,6,7,8,9].map(i => (
                      <button
                        key={i}
                        onClick={() => setLoginPattern([...loginPattern, i])}
                        className={`aspect-square rounded-xl border text-2xl font-bold transition-all ${
                          loginPattern.includes(i) ? 'scale-110 border-violet-400 bg-violet-400 text-white shadow-md' : 'border-violet-200 bg-white text-violet-400 hover:border-violet-300'
                        }`}
                      >
                        {i}
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={() => {
                      setPin(loginPattern.join(''));
                      setLoginPattern([]);
                    }}
                    className="mt-4 text-[10px] font-bold text-violet-500 hover:underline"
                  >
                    تأكيد النقش
                  </button>
                </div>
              )}

              <button 
                type="button"
                onClick={() => setIsPatternMode(!isPatternMode)}
                className="text-[10px] font-bold text-violet-400 underline hover:text-violet-600"
              >
                {isPatternMode ? 'استخدام الرمز الرقمي' : 'استخدام النقش السحري'}
              </button>

              <div className="flex gap-3">
                <button
                  onClick={handleChildLogin}
                  disabled={loading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 py-4 font-bold text-white shadow-[0_14px_30px_rgba(139,92,246,0.28)] transition-all hover:shadow-[0_18px_34px_rgba(139,92,246,0.34)]"
                >
                  {loading ? 'جاري الدخول...' : 'انطلاق!'}
                  <ArrowRight className="h-6 w-6" />
                </button>
                <button
                  onClick={() => setShowPinLogin(false)}
                  className="rounded-2xl border border-white/20 bg-white/10 px-6 py-4 font-bold text-white/80 transition-all hover:bg-white/15"
                >
                  إلغاء
                </button>
              </div>

              {/* Quick View for Children for the logged in parent */}
              {user && allChildren.length > 0 && (
                <div className="mt-5 border-t border-white/15 pt-4">
                  <p className="mb-3 text-[10px] font-bold text-white/50">أو اختاري بطلتكِ المسجلة:</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {allChildren.map(c => (
                      <button
                        key={c.uid}
                        onClick={() => {
                          setChildName(c.heroName || c.name);
                          setPin(c.pin);
                        }}
                        className="rounded-2xl border border-violet-400/30 bg-violet-500/20 px-3 py-2 text-xs font-bold text-violet-200 transition-all hover:bg-violet-500/30"
                      >
                        {c.heroName || c.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-3 text-white/40 sm:gap-4">
          <button onClick={() => navigate('/terms')} className="flex items-center gap-1 rounded-full px-3 py-2 text-sm font-medium text-white/50 transition-colors hover:bg-white/10 hover:text-white/80">
            <Info className="h-5 w-5" />
            <span className="font-arabic text-sm">الشروط والقوانين</span>
          </button>
          <Heart className="h-5 w-5 text-pink-400/60" />
          <Palette className="h-5 w-5 text-violet-400/60" />
          <Users className="h-5 w-5 text-sky-400/60" />
          <Moon className="h-5 w-5 text-amber-400/60" />
          <div className="flex items-center gap-1 rounded-full bg-white/10 border border-white/15 px-3 py-2 text-xs font-bold text-white/50">
            <span>صُنع بحب للبطلات</span>
            <Heart className="w-3 h-3 fill-current text-pink-400" />
          </div>
        </div>
      </motion.div>

      {/* Welcome Message Overlay */}
      <AnimatePresence>
        {/* Welcome Message Overlay Combined with ReenaWelcome */}
      </AnimatePresence>

      <footer className="mt-8 text-sm font-arabic text-white/30">
        &copy; 2026 نادي البطلات الصغيرات - عالم آمن للفتيات
      </footer>
    </div>
  );
}
