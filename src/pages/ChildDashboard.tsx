import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Star, Sparkles, Map, Palette, Book, Trophy, LogOut, Home, Settings, X, Lock, Loader2, Wand2, Users, PlayCircle, CheckCircle2, User, Heart, ArrowRight, Clock, Moon, Sun, LayoutGrid, Shield, Zap, MapPin, School, Smile } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { generateDailyQuest } from '../services/aiService';
import { auth, db } from '../firebase';
import { doc, onSnapshot, setDoc, updateDoc, collection, query, where, getDoc, getDocs, limit } from 'firebase/firestore';
import { ChildProfile, VisitRequest } from '../types';
import { toast } from 'sonner';
import { dailyMissions } from '../data/kidsUniverse';
import { useTheme } from '../context/ThemeContext';

import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';

export default function ChildDashboard() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [editData, setEditData] = useState<Partial<ChildProfile>>({});
  const [usePattern, setUsePattern] = useState(false);
  const [pattern, setPattern] = useState<number[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [dailyQuest, setDailyQuest] = useState<string>('');
  const [loadingQuest, setLoadingQuest] = useState(false);
  const [incomingRequest, setIncomingRequest] = useState<VisitRequest | null>(null);
  const [dailyMission, setDailyMission] = useState(dailyMissions[0]);
  const [completedToday, setCompletedToday] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const handledVisitUpdatesRef = useRef<Set<string>>(new Set());

  const HERO_POWERS = [
    { id: 'courage', name: 'قوة الشجاعة', icon: '🛡️' },
    { id: 'kindness', name: 'قوة اللطف', icon: '💖' },
    { id: 'wisdom', name: 'قوة الحكمة', icon: '🧠' },
    { id: 'creativity', name: 'قوة الإبداع', icon: '🎨' },
    { id: 'nature', name: 'قوة الطبيعة', icon: '🌿' },
    { id: 'sparkle', name: 'قوة اللمعان', icon: '✨' },
  ];

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;
    let unsubscribeRequests: (() => void) | null = null;
    let unsubscribeDecisions: (() => void) | null = null;
    let isMounted = true;
    let activityInterval: any = null;

    const setup = async () => {
      const activeChildStr = localStorage.getItem('active_child');
      let activeChild: ChildProfile | null = null;
      
      if (activeChildStr) {
        try {
          activeChild = JSON.parse(activeChildStr);
        } catch (e) {
          console.error('Failed to parse active_child', e);
        }
      }

      // If missing from local storage, try to recover from Firestore if parent is logged in
      if (!activeChild?.uid && auth.currentUser) {
        try {
          const q = query(
            collection(db, 'children_profiles'), 
            where('parentId', '==', auth.currentUser.uid), 
            limit(1)
          );
          const snapshot = await getDocs(q);
          if (!snapshot.empty && isMounted) {
            activeChild = { uid: snapshot.docs[0].id, ...snapshot.docs[0].data() } as ChildProfile;
            localStorage.setItem('active_child', JSON.stringify(activeChild));
          }
        } catch (e) {
          console.error('Recovery failed:', e);
        }
      }

      if (activeChild?.uid && isMounted) {
        // Presence Heartbeat
        const updatePresence = () => {
          if (activeChild?.uid) {
            updateDoc(doc(db, 'children_profiles', activeChild.uid), {
              lastActive: Date.now()
            }).catch(err => console.error('Failed to update presence:', err));
          }
        };

        updatePresence(); // Initial call
        activityInterval = setInterval(updatePresence, 60000); // Every minute

        const today = new Date().toDateString();
        const missionIndex = today.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % dailyMissions.length;
        setDailyMission(dailyMissions[missionIndex]);
        
        if (localStorage.getItem(`mission_completed_${activeChild.uid}_${today}`)) {
          setCompletedToday(true);
        }
        
        // Safety timeout for loading
        const timeoutId = setTimeout(() => {
          if (loading && isMounted) {
            console.warn('ChildDashboard: Loading timeout reached');
            setLoading(false);
          }
        }, 5000); // Reduce to 5 seconds

        // 1. Profile Listener
        unsubscribeProfile = onSnapshot(doc(db, 'children_profiles', activeChild.uid), (snapshot) => {
          clearTimeout(timeoutId);
          if (!isMounted) return;
          
          if (snapshot.exists()) {
            const data = { ...snapshot.data(), uid: snapshot.id } as ChildProfile;
            setProfile(data);
            setEditData(data);
            localStorage.setItem('active_child', JSON.stringify(data));
          } else {
            setProfile(null);
          }
          setLoading(false);
        }, (err) => {
          clearTimeout(timeoutId);
          if (isMounted) setLoading(false);
          if (err.code !== 'not-found') {
            console.error('Profile snapshot error:', err);
          }
        });

        // 2. Visit Requests Listener
        unsubscribeRequests = onSnapshot(
          query(
            collection(db, 'visit_requests'), 
            where('toId', '==', activeChild.uid), 
            where('status', '==', 'pending')
          ),
          (snapshot) => {
            if (!isMounted) return;
            if (!snapshot.empty) {
              const sortedDocs = [...snapshot.docs].sort((a, b) => b.data().timestamp - a.data().timestamp);
              const validRequest = sortedDocs.map(d => ({ id: d.id, ...d.data() } as VisitRequest))
                .find(r => !!r.id && !!r.fromId && !!r.fromAvatar);

              if (validRequest) {
                setIncomingRequest(validRequest);
                new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3').play().catch(() => {});
              }
            } else {
              setIncomingRequest(null);
            }
          }
        );

        // 3. Decisions Listener
        unsubscribeDecisions = onSnapshot(
          query(
            collection(db, 'visit_requests'), 
            where('fromId', '==', activeChild.uid), 
            where('status', 'in', ['accepted', 'rejected', 'declined'])
          ),
          (snapshot) => {
            if (!isMounted) return;
            snapshot.docs.forEach(docSnap => {
              const request = { id: docSnap.id, ...docSnap.data() } as VisitRequest;
              const key = `${request.id}_${request.status}`;
              if (!handledVisitUpdatesRef.current.has(key)) {
                handledVisitUpdatesRef.current.add(key);
                if (request.status === 'accepted') {
                  toast.success(`وافقت البطلة ${request.toName} على زيارتكِ 🎉`, {
                    action: { label: 'الدخول الآن', onClick: () => navigate(`/house/${request.id}`) }
                  });
                }
              }
            });
          }
        );
      } else if (isMounted) {
        setLoading(false);
      }
    };

    setup();

    return () => {
      isMounted = false;
      if (activityInterval) clearInterval(activityInterval);
      if (unsubscribeProfile) unsubscribeProfile();
      if (unsubscribeRequests) unsubscribeRequests();
      if (unsubscribeDecisions) unsubscribeDecisions();
    };
  }, [navigate]);

  const handleAcceptVisit = async (request: VisitRequest) => {
    if (!request || !request.id || !request.fromId || !request.toId || !request.fromAvatar) {
      toast.error('بيانات الزيارة غير مكتملة');
      return;
    }

    try {
      const visitRef = doc(db, 'visit_requests', request.id);
      await setDoc(visitRef, {
        id: request.id,
        fromId: request.fromId,
        fromName: request.fromName,
        fromHeroName: request.fromHeroName,
        fromAvatar: request.fromAvatar,
        toId: request.toId,
        toName: request.toName,
        toAvatar: request.toAvatar,
        status: 'accepted',
        acceptedAt: Date.now(),
        roomMood: 'cozy'
      }, { merge: true });
      
      // Clear incoming request locally to prevent double clicks
      setIncomingRequest(null);
      
      // Small delay to ensure Firestore update propagates if needed, though navigate should be fine
      setTimeout(() => {
        navigate(`/house/${request.id}`);
      }, 100);
    } catch (error) {
      console.error("Accept visit error:", error);
      // If document doesn't exist, just clear the request
      setIncomingRequest(null);
    }
  };

  const handleRejectVisit = async (request: VisitRequest) => {
    try {
      await setDoc(doc(db, 'visit_requests', request.id), {
        status: 'rejected',
        resolvedAt: Date.now()
      }, { merge: true });
      setIncomingRequest(null);
    } catch (error) {
      console.error("Reject visit error:", error);
      toast.error('تعذر رفض الطلب حالياً، حاولي مرة أخرى');
    }
  };

  useEffect(() => {
    if (profile && !dailyQuest) {
      handleGetQuest();
    }
  }, [profile]);

  const handleGetQuest = async () => {
    if (!profile) return;
    setLoadingQuest(true);
    try {
      const quest = await generateDailyQuest(profile.heroName || profile.name);
      setDailyQuest(quest);
    } catch (error) {
      console.error("Error fetching quest:", error);
    } finally {
      setLoadingQuest(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('active_child');
    window.location.href = '/';
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    
    setLoading(true);
    try {
      const profileRef = doc(db, 'children_profiles', profile.uid);
      await updateDoc(profileRef, {
        ...editData,
        updatedAt: Date.now()
      });
      
      toast.success('تم تحديث بياناتكِ السحرية بنجاح! ✨');
      setShowSettings(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `children_profiles/${profile.uid}`);
      toast.error('حدث خطأ أثناء التحديث');
    } finally {
      setLoading(false);
    }
  };

  const handlePatternComplete = (finalPattern: number[]) => {
    setPattern(finalPattern);
    const patternPin = finalPattern.join('');
    setEditData(prev => ({ 
      ...prev, 
      pattern: finalPattern,
      pin: patternPin,
      usePattern: true 
    }));
    toast.success('تم تسجيل النقش السحري وتحديث الرمز السري! 🎨');
  };

  const handleCompleteMission = async () => {
    if (!completedToday && profile) {
      try {
        const today = new Date().toDateString();
        const completionKey = `mission_completed_${profile.uid}_${today}`;
        localStorage.setItem(completionKey, 'true');
        setCompletedToday(true);
        
        // Update stars in Firestore
        const profileRef = doc(db, 'children_profiles', profile.uid);
        await updateDoc(profileRef, {
          stars: (profile.stars || 0) + dailyMission.reward,
          points: (profile.points || 0) + Math.floor(dailyMission.reward / 2)
        });

        toast.success(`رائع! لقد حصلتِ على ${dailyMission.reward} نجمة! ⭐`);
        
        // Play success sound
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3');
        audio.play().catch(() => {});
      } catch (e) {
        console.error('Error completing mission:', e);
        toast.error('حدث خطأ أثناء حفظ تقدمك');
      }
    }
  };

  if (!profile && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-fuchsia-950 via-violet-900 to-indigo-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="text-8xl mb-6 animate-pulse">✨</div>
        <h2 className="text-2xl font-black text-white mb-2">عذراً، لم نتمكن من العثور على ملفكِ السحري</h2>
        <p className="text-white/70 mb-8 max-w-md font-bold">
          ربما تم تسجيل الخروج أو أن الجلسة انتهت. يرجى العودة للرئيسية وتسجيل الدخول مرة أخرى يا بطلة!
        </p>
        <div className="flex flex-col gap-3 w-full max-w-xs">
          <button 
            onClick={() => {
              localStorage.removeItem('active_child');
              navigate('/');
            }}
            className="bg-violet-500 hover:bg-violet-600 text-white font-black py-4 rounded-2xl shadow-lg transition-all"
          >
            العودة للرئيسية والدخول مجدداً
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-fuchsia-950 via-violet-900 to-indigo-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="relative w-24 h-24 mb-6">
          <div className="absolute inset-0 animate-spin rounded-full border-t-4 border-b-4 border-violet-400"></div>
          <div className="absolute inset-0 flex items-center justify-center text-4xl">✨</div>
        </div>
        <h2 className="text-2xl font-black text-white mb-2">جاري فتح بوابات العالم السحري...</h2>
        <p className="text-white/70 font-bold mb-6">انتظري قليلاً يا بطلة!</p>
        
        {/* Fallback button if stuck */}
        <button 
          onClick={() => window.location.reload()}
          className="text-violet-300 text-sm font-bold hover:underline"
        >
          إذا استغرق الأمر طويلاً، اضغطي هنا لإعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-fuchsia-950 via-violet-900 to-indigo-950 font-sans overflow-hidden flex flex-col relative" dir="rtl">
      {/* Magic Wand Effect */}
      <motion.div
        className="fixed pointer-events-none z-[9999] text-2xl"
        animate={{ x: mousePos.x - 10, y: mousePos.y - 10 }}
        transition={{ type: 'spring', damping: 20, stiffness: 200, mass: 0.5 }}
      >
        <Sparkles className="w-6 h-6 text-yellow-400 animate-pulse" />
      </motion.div>

      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-80 bg-gradient-to-b from-violet-800/40 via-fuchsia-800/20 to-transparent" />
        <div className="absolute top-20 -left-16 w-72 h-72 bg-fuchsia-600/30 rounded-full blur-3xl" />
        <div className="absolute top-10 -right-16 w-72 h-72 bg-cyan-600/20 rounded-full blur-3xl" />
        <motion.div 
          animate={{ x: [0, 100, 0], y: [0, -20, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-20 left-10 text-8xl opacity-20"
        >☁️</motion.div>
        <motion.div 
          animate={{ x: [0, -100, 0], y: [0, 20, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-40 right-20 text-9xl opacity-15"
        >☁️</motion.div>
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 5, repeat: Infinity }}
          className="absolute top-1/4 left-1/4 text-4xl"
        >✨</motion.div>
        <motion.div 
          animate={{ scale: [1, 1.5, 1], opacity: [0.1, 0.3, 0.1] }}
          transition={{ duration: 7, repeat: Infinity, delay: 1 }}
          className="absolute bottom-1/4 right-1/3 text-6xl"
        >🌟</motion.div>
        <motion.div 
          animate={{ y: [0, -30, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute top-1/2 right-10 text-5xl opacity-20"
        >🎈</motion.div>
      </div>

      {/* Top Navigation Bar */}
      <header className="relative z-20 p-4 md:p-6 flex justify-between items-center">
        <div className="flex items-center gap-4 bg-white/10 backdrop-blur-xl p-3 pr-4 rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.3)] border border-white/20">
          <Avatar className={`w-14 h-14 ${profile.avatar?.color || 'bg-pink-600/50'} border-4 border-white/30 shadow-inner`}>
            <AvatarFallback className="text-3xl scale-150 mt-4 bg-transparent">
              {profile.avatar?.hairStyle || '👧'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-xl font-black text-white">{profile.heroName || profile.name}</h1>
            <div className="flex items-center gap-3 text-sm font-bold">
              <span className="flex items-center gap-1 text-amber-300">
                <Star className="w-4 h-4 fill-current star-glow" /> {profile.points}
              </span>
              <span className="flex items-center gap-1 text-violet-300">
                <Trophy className="w-4 h-4" /> م {profile.level}
              </span>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button 
            onClick={toggleTheme}
            className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15 shadow-[0_8px_20px_rgba(0,0,0,0.2)] border border-white/20 transition-all hover:scale-105"
            title={theme === 'light' ? 'الوضع الليلي' : 'الوضع النهاري'}
          >
            {theme === 'light' ? <Moon className="w-6 h-6" /> : <Sun className="w-6 h-6" />}
          </button>
          <button onClick={() => setShowSettings(true)} className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15 shadow-[0_8px_20px_rgba(0,0,0,0.2)] border border-white/20 transition-all hover:scale-105">
            <Settings className="w-6 h-6" />
          </button>
          <button onClick={handleLogout} className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center text-red-300 hover:text-red-200 hover:bg-red-500/20 shadow-[0_8px_20px_rgba(0,0,0,0.2)] border border-white/20 transition-all hover:scale-105">
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative z-10 flex flex-col px-4 md:px-8 pb-12 space-y-10 max-w-7xl mx-auto w-full mt-4">
        
        {/* Welcome & Progress Section */}
        <Card className="relative overflow-hidden bg-gradient-to-l from-indigo-600 via-fuchsia-600 to-pink-500 rounded-[3rem] p-8 md:p-12 shadow-[0_30px_70px_rgba(79,70,229,0.35)] border border-white/30 flex flex-col md:flex-row items-center justify-between gap-8 transition-all group">
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-cyan-300/20 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 flex-1 text-center md:text-right w-full">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="inline-flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full text-xs font-black text-white mb-4 border border-white/30"
            >
              <Sparkles className="w-3 h-3" />
              بطلة اليوم المتألقة
            </motion.div>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight">مرحباً {profile.heroName || profile.name}</h2>
            <p className="text-xl text-white/90 font-bold mb-2">جاهزة لمغامرة أجمل؟ كل يوم إنجاز جديد ينتظرك ✨</p>
          </div>
          
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative z-10 w-full md:w-auto bg-white text-indigo-700 font-black text-xl py-5 px-10 rounded-3xl shadow-2xl transition-all whitespace-nowrap flex items-center justify-center gap-3 overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-100/60 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <PlayCircle className="w-6 h-6" />
            <span>ابدأ اللعب الآن</span>
          </motion.button>
        </Card>

        {/* Daily Challenge Hero Section */}
        <section className="relative overflow-hidden rounded-[3.5rem] bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 p-10 md:p-14 text-white shadow-2xl shadow-purple-500/30 border border-white/20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-pink-400/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex-1 text-center md:text-right">
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-xl px-5 py-2 rounded-full text-sm font-black mb-6 border border-white/20 shadow-lg"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                تحدي اليوم السحري
              </motion.div>
              <h2 className="text-4xl md:text-6xl font-black mb-6 leading-[1.1] tracking-tight">
                {dailyMission.title}
              </h2>
              <p className="text-indigo-100 text-xl font-bold mb-8 max-w-2xl leading-relaxed opacity-90">
                {dailyMission.description}
              </p>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
                <motion.button 
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(0,0,0,0.2)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleCompleteMission}
                  disabled={completedToday}
                  className={`px-10 py-5 rounded-3xl font-black text-xl shadow-2xl transition-all flex items-center gap-4 ${
                    completedToday 
                      ? 'bg-emerald-400 text-white cursor-default' 
                      : 'bg-white text-purple-700 hover:bg-indigo-50'
                  }`}
                >
                  {completedToday ? (
                    <>
                      <CheckCircle2 className="w-7 h-7" />
                      <span>تم الإنجاز!</span>
                    </>
                  ) : (
                    <>
                      <Star className="w-7 h-7 text-amber-500 fill-current" />
                      <span>أنجزت المهمة! (+{dailyMission.reward})</span>
                    </>
                  )}
                </motion.button>
                <div className="flex items-center gap-3 bg-black/20 px-6 py-3 rounded-2xl backdrop-blur-md border border-white/10 shadow-inner">
                  <span className="text-sm font-bold opacity-70">الصعوبة:</span>
                  <span className="text-base font-black">{dailyMission.difficulty}</span>
                </div>
              </div>
            </div>
            
            <div className="relative group">
              <motion.div 
                animate={{ y: [0, -20, 0], rotate: [0, 5, -5, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="w-56 h-56 md:w-80 md:h-80 bg-white/10 backdrop-blur-2xl rounded-[4rem] border-2 border-white/30 flex items-center justify-center text-9xl shadow-[0_0_50px_rgba(255,255,255,0.1)] group-hover:shadow-[0_0_80px_rgba(255,255,255,0.2)] transition-all duration-500"
              >
                {completedToday ? '🏆' : '✨'}
              </motion.div>
              {/* Floating elements */}
              <motion.div animate={{ scale: [1, 1.3, 1], rotate: 360 }} transition={{ duration: 3, repeat: Infinity }} className="absolute -top-6 -right-6 text-5xl filter drop-shadow-lg">⭐</motion.div>
              <motion.div animate={{ scale: [1, 1.2, 1], y: [0, 10, 0] }} transition={{ duration: 4, repeat: Infinity, delay: 0.5 }} className="absolute -bottom-6 -left-6 text-5xl filter drop-shadow-lg">💎</motion.div>
            </div>
          </div>
        </section>

        {/* Quick Progress Bar */}
        <Card className="bg-white/10 backdrop-blur-xl p-8 rounded-[3.5rem] border border-white/15 shadow-2xl transition-all">
          <CardHeader className="p-0 mb-6 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-2xl font-black text-white flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-500/20 border border-amber-400/30 rounded-2xl flex items-center justify-center">
                <Trophy className="w-7 h-7 text-amber-400" />
              </div>
              مستوى البطلة
            </CardTitle>
            <div className="text-right">
              <span className="block text-xs font-black text-white/40 uppercase tracking-widest mb-1">المستوى الحالي</span>
              <span className="text-2xl font-black text-violet-300">المستوى {Math.floor((profile?.points || 0) / 100) + 1}</span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-8 bg-white/10 rounded-full overflow-hidden border border-white/20 shadow-inner p-1">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(profile?.points || 0) % 100}%` }}
                transition={{ duration: 2, ease: "circOut" }}
                className="h-full bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500 rounded-full relative"
              >
                <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:30px_30px] animate-[shimmer_3s_linear_infinite]" />
                <motion.div 
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute right-0 top-0 bottom-0 w-8 bg-white/30 blur-md"
                />
              </motion.div>
            </div>
            <div className="flex justify-between items-center mt-4">
              <p className="text-sm font-bold text-white/60">باقي {100 - ((profile?.points || 0) % 100)} نقطة للوصول للمستوى القادم! 🚀</p>
              <div className="flex -space-x-2 rtl:space-x-reverse">
                {[1, 2, 3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white/30 bg-white/10 flex items-center justify-center text-xs">⭐</div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Incoming Visit Request */}
        <AnimatePresence>
          {incomingRequest && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="max-w-2xl mx-auto mb-8 bg-white/15 backdrop-blur-xl p-6 rounded-[2rem] shadow-2xl border-2 border-pink-400/50 flex flex-col md:flex-row items-center gap-6"
            >
              <div className={`w-24 h-24 ${incomingRequest.fromAvatar.color} rounded-full flex items-center justify-center text-6xl border-4 border-white/30 shadow-inner overflow-hidden`}>
                <span className="mt-6">{incomingRequest.fromAvatar.hairStyle}</span>
              </div>
              <div className="text-center md:text-right flex-1">
                <h3 className="text-2xl font-black text-pink-300 mb-1">طرق طرق! 🚪</h3>
                <p className="text-lg font-bold text-white/80">البطلة <span className="text-pink-300">{incomingRequest.fromHeroName}</span> تريد زيارتكِ!</p>
              </div>
              <div className="flex gap-3 w-full md:w-auto">
                <button onClick={() => handleAcceptVisit(incomingRequest)} className="flex-1 md:flex-none bg-emerald-500 text-white font-black py-3 px-6 rounded-xl shadow-lg hover:bg-emerald-600 hover:scale-105 transition-all">
                  تفضلي! ✨
                </button>
                <button onClick={() => handleRejectVisit(incomingRequest)} className="flex-1 md:flex-none bg-white/10 text-white/70 border border-white/20 font-bold py-3 px-6 rounded-xl hover:bg-white/15 transition-all">
                  ليس الآن
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* أقسام التواصل والزيارات - Moved up for better visibility */}
        <section>
          <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-2">
            🏘️ أقسام التواصل والزيارات
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <MiniZoneCard title="بيتي السحري" subtitle="العبي وزيني غرفتكِ" icon="🏰" color="bg-amber-500/20 text-amber-100 border-amber-400/30" onClick={() => navigate('/house/self')} />
            <MiniZoneCard title="مدينة البطلات" subtitle="زوري البطلات وتابعي النشاط" icon="🗺️" color="bg-sky-500/20 text-sky-100 border-sky-400/30" onClick={() => navigate('/village')} />
            <MiniZoneCard title="الدردشة والتواصل" subtitle="صديقاتك في مساحة آمنة" icon="💬" color="bg-indigo-500/20 text-indigo-100 border-indigo-400/30" onClick={() => navigate('/friends')} />
          </div>
        </section>

        {/* Daily Quest Banner */}
        <div className="w-full">
          <motion.div 
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-[2rem] p-6 md:p-8 text-white shadow-xl relative overflow-hidden cursor-pointer"
            onClick={handleGetQuest}
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border-2 border-white/30 shrink-0">
                <Wand2 className="w-10 h-10 text-yellow-300" />
              </div>
              <div className="flex-1 text-center md:text-right">
                <h2 className="text-xl font-black text-yellow-300 mb-2">مهمة اليوم السحرية</h2>
                {loadingQuest ? (
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="font-bold">جاري الاستماع للنجوم...</span>
                  </div>
                ) : (
                  <p className="text-lg md:text-xl font-bold leading-relaxed">"{dailyQuest || 'يا بطلة الزهور! مهمتكِ السحرية اليوم هي **"نشر عبير النظام"**؛ استخدمي قواكِ الخارقة لإعادة ألعابكِ المبعثرة إلى مخبئها السري، وبلمسة من يدكِ ستتحول غرفتكِ إلى أجمل مملكة في العالم. انطلقي يا بطلة، نحن نثق بكِ! ✨🌸'}"</p>
                )}
              </div>
            </div>
          </motion.div>
        </div>



        {/* الأكاديمية الإسلامية */}
        <Card className="bg-white/10 backdrop-blur-xl rounded-[3.5rem] p-10 md:p-14 border border-white/15 shadow-2xl transition-all">
          <CardHeader className="p-0 flex flex-col md:flex-row items-center justify-between gap-6 mb-12 space-y-0">
            <div className="text-center md:text-right">
              <CardTitle className="text-3xl md:text-4xl font-black text-white mb-2 flex items-center justify-center md:justify-start gap-3">
                <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-400/30 rounded-2xl flex items-center justify-center">
                  <Book className="w-8 h-8 text-emerald-400" />
                </div>
                الأكاديمية الإسلامية
              </CardTitle>
              <CardDescription className="text-white/60 font-bold text-lg">رحلة إيمانية ممتعة لتعلم القرآن والسنة ✨</CardDescription>
            </div>
            <button className="bg-emerald-500 hover:bg-emerald-600 text-white font-black px-8 py-4 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              عرض كل الدروس
            </button>
          </CardHeader>

          <CardContent className="p-0 space-y-12 relative z-10">
            {/* القرآن الكريم */}
            <div>
              <h4 className="text-xl font-black text-emerald-300 mb-6 flex items-center gap-3">
                <span className="w-2 h-8 bg-emerald-500 rounded-full" />
                🕌 القرآن الكريم
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <MiniZoneCard 
                  title="المصحف كامل" 
                  subtitle="المصحف المعلم" 
                  icon="📖" 
                  color="bg-emerald-500/15 text-emerald-100 border-emerald-400/25" 
                  onClick={() => navigate('/cinema?cat=quran_full&sub=المصحف كامل')} 
                />
                <MiniZoneCard 
                  title="السور القصيرة" 
                  subtitle="حفظ وفهم" 
                  icon="✨" 
                  color="bg-emerald-500/15 text-emerald-100 border-emerald-400/25" 
                  onClick={() => navigate('/cinema?cat=quran_full&sub=المصحف المعلم')} 
                />
                <MiniZoneCard 
                  title="تحفيظ الأطفال" 
                  subtitle="رددي مع الأطفال" 
                  icon="👧" 
                  color="bg-emerald-500/15 text-emerald-100 border-emerald-400/25" 
                  onClick={() => navigate('/cinema?cat=quran_full&sub=المصحف المعلم')} 
                />
                <MiniZoneCard 
                  title="قراء مختلفين" 
                  subtitle="أجمل الأصوات" 
                  icon="🎙️" 
                  color="bg-emerald-500/15 text-emerald-100 border-emerald-400/25" 
                  onClick={() => navigate('/cinema?cat=quran_full')} 
                />
              </div>
            </div>

            {/* التفسير وقصص الأنبياء */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="bg-amber-500/10 p-8 rounded-[2.5rem] border border-amber-400/20">
                <h4 className="text-xl font-black text-amber-300 mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500/20 border border-amber-400/30 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-amber-400" />
                  </div>
                  💡 التفسير
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <MiniZoneCard 
                    title="تفسير مبسط" 
                    subtitle="للأطفال" 
                    icon="🔍" 
                    color="bg-amber-500/15 text-amber-100 border-amber-400/25" 
                    onClick={() => navigate('/cinema?cat=interpretation&sub=تفسير مبسط')} 
                  />
                  <MiniZoneCard 
                    title="تفسير السور" 
                    subtitle="السور القصيرة" 
                    icon="📖" 
                    color="bg-amber-500/15 text-amber-100 border-amber-400/25" 
                    onClick={() => navigate('/cinema?cat=interpretation&sub=تفسير السور القصيرة')} 
                  />
                </div>
              </div>
              <div className="bg-sky-500/10 p-8 rounded-[2.5rem] border border-sky-400/20">
                <h4 className="text-xl font-black text-sky-300 mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-sky-500/20 border border-sky-400/30 rounded-xl flex items-center justify-center">
                    <Star className="w-6 h-6 text-sky-400" />
                  </div>
                  🌟 قصص الأنبياء
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <MiniZoneCard 
                    title="قصص الأنبياء" 
                    subtitle="مغامرات إيمانية" 
                    icon="📜" 
                    color="bg-sky-500/15 text-sky-100 border-sky-400/25" 
                    onClick={() => navigate('/cinema?cat=prophets_stories&sub=مغامرات إيمانية')} 
                  />
                  <MiniZoneCard 
                    title="قصة اليوم" 
                    subtitle="نبي الله يوسف" 
                    icon="✨" 
                    color="bg-sky-500/15 text-sky-100 border-sky-400/25" 
                    onClick={() => navigate('/cinema?cat=prophets_stories&sub=قصص الأنبياء')} 
                  />
                </div>
              </div>
            </div>

            {/* السنة النبوية */}
            <div className="bg-indigo-500/10 p-8 rounded-[2.5rem] border border-indigo-400/20">
              <h4 className="text-xl font-black text-indigo-300 mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-500/20 border border-indigo-400/30 rounded-xl flex items-center justify-center">
                  <Heart className="w-6 h-6 text-indigo-400" />
                </div>
                ❤️ السنة النبوية
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <MiniZoneCard 
                  title="سلوكيات" 
                  subtitle="أخلاق المسلم" 
                  icon="🤝" 
                  color="bg-indigo-500/15 text-indigo-100 border-indigo-400/25" 
                  onClick={() => navigate('/cinema?cat=sunnah&sub=أخلاق المسلم')} 
                />
                <MiniZoneCard 
                  title="آداب" 
                  subtitle="آداب يومية" 
                  icon="🍽️" 
                  color="bg-indigo-500/15 text-indigo-100 border-indigo-400/25" 
                  onClick={() => navigate('/cinema?cat=sunnah&sub=آداب يومية')} 
                />
                <MiniZoneCard 
                  title="أذكار" 
                  subtitle="حصن المسلم" 
                  icon="📿" 
                  color="bg-indigo-500/15 text-indigo-100 border-indigo-400/25" 
                  onClick={() => navigate('/cinema?cat=sunnah')} 
                />
                <MiniZoneCard 
                  title="عادات يومية" 
                  subtitle="روتين البطلة" 
                  icon="☀️" 
                  color="bg-indigo-500/15 text-indigo-100 border-indigo-400/25" 
                  onClick={() => navigate('/cinema?cat=sunnah')} 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* المفضلة والمشاهدة مؤخراً */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <section className="bg-white/10 backdrop-blur-xl rounded-[3rem] p-8 md:p-10 border border-white/15 shadow-2xl">
            <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
              <div className="w-10 h-10 bg-pink-500/20 border border-pink-400/30 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-pink-400" />
              </div>
              مفضلاتي السحرية
            </h3>
            <div className="bg-white/10 rounded-3xl p-8 text-center border border-pink-400/20">
              <div className="text-5xl mb-4">💖</div>
              <p className="text-white/70 font-bold mb-6 text-lg">الفيديوهات والقصص التي تحبينها ستظهر هنا!</p>
              <button 
                onClick={() => navigate('/cinema?cat=favorites')}
                className="bg-pink-500 hover:bg-pink-600 text-white font-black px-8 py-3 rounded-2xl shadow-lg shadow-pink-500/20 transition-all flex items-center justify-center gap-2 mx-auto"
              >
                اذهبي للمفضلة <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </section>

          <section className="bg-white/10 backdrop-blur-xl rounded-[3rem] p-8 md:p-10 border border-white/15 shadow-2xl">
            <h3 className="text-2xl font-black text-white mb-8 flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-500/20 border border-indigo-400/30 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-indigo-400" />
              </div>
              شوهد مؤخراً
            </h3>
            <div className="bg-white/10 rounded-3xl p-8 text-center border border-indigo-400/20">
              <div className="text-5xl mb-4">🎬</div>
              <p className="text-white/70 font-bold mb-6 text-lg">تابعي من حيث توقفتِ في مغامراتكِ!</p>
              <button 
                onClick={() => navigate('/cinema?cat=recent')}
                className="bg-indigo-500 hover:bg-indigo-600 text-white font-black px-8 py-3 rounded-2xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 mx-auto"
              >
                تابعي المشاهدة <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </section>
        </div>

        {/* عالم البطلات الكبير */}
        <section>
          <div className="mb-6">
            <h3 className="text-2xl font-black text-white flex items-center gap-2 mb-1">
              🌟 عالم البطلات الكبير
            </h3>
            <p className="text-white/60 font-bold">اختاري أي منطقة واستمري في رحلة الاكتشاف والمرح والتعلّم.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <MicroZoneCard title="ألعاب ماريا الشقية" subtitle="ألعاب جديدة وممتعة" icon="🎀" color="bg-pink-500/20 hover:bg-pink-500/30 text-pink-100 border-pink-400/30" onClick={() => navigate('/maria-games')} />
            <MicroZoneCard title="مركز الألعاب" subtitle="كل الألعاب في مكان واحد" icon="🎮" color="bg-orange-500/20 hover:bg-orange-500/30 text-orange-100 border-orange-400/30" onClick={() => navigate('/games')} />
            <MicroZoneCard title="مجرة القصص" subtitle="قصص سحرية قبل النوم" icon="📚" color="bg-purple-500/20 hover:bg-purple-500/30 text-purple-100 border-purple-400/30" onClick={() => navigate('/stories')} />
            <MicroZoneCard title="قاعة السينما" subtitle="فيديوهات آمنة وممتعة" icon="🎬" color="bg-fuchsia-500/20 hover:bg-fuchsia-500/30 text-fuchsia-100 border-fuchsia-400/30" onClick={() => navigate('/cinema')} />
            <MicroZoneCard title="فيديوهات تعليمية" subtitle="تعلم ممتع من يوتيوب" icon="🎓" color="bg-rose-500/20 hover:bg-rose-500/30 text-rose-100 border-rose-400/30" onClick={() => navigate('/cinema?cat=educational')} />
            <MicroZoneCard title="المصمم الذكي" subtitle="صممي بالذكاء الاصطناعي" icon="🪄" color="bg-violet-500/20 hover:bg-violet-500/30 text-violet-100 border-violet-400/30" onClick={() => navigate('/ai-design')} />
            <MicroZoneCard title="عالم التلوين" subtitle="ألوانكِ السحرية" icon="🎨" color="bg-rose-500/20 hover:bg-rose-500/30 text-rose-100 border-rose-400/30" onClick={() => navigate('/coloring')} />
            <MicroZoneCard title="حكايات عالمية" subtitle="قصص من كل مكان" icon="📖" color="bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 border-amber-400/30" onClick={() => navigate('/cinema?cat=stories')} />
            <MicroZoneCard title="واحة القيم" subtitle="قرآن وأخلاق إيمانية" icon="🌙" color="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-100 border-emerald-400/30" onClick={() => navigate('/values')} />
            <MicroZoneCard title="ركن الاكتشاف" subtitle="حقائق لطيفة يومية" icon="🔍" color="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-100 border-cyan-400/30" onClick={() => navigate('/values')} />
            <div className="relative group">
              <motion.div
                whileHover={{ scale: 1.1, rotate: -2 }}
                whileTap={{ scale: 0.9 }}
                className="relative"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-[2.5rem] blur opacity-40 group-hover:opacity-80 transition duration-1000 group-hover:duration-200" />
                <MicroZoneCard 
                  title="مركز الأبحاث المذهل" 
                  subtitle="مساعد الواجبات والبحث العلمي" 
                  icon="🧪" 
                  color="bg-white/15 border-cyan-400/40 text-white relative z-10" 
                  onClick={() => navigate('/research-center')} 
                />
              </motion.div>
            </div>
            <MicroZoneCard title="لعبة الذاكرة" subtitle="تحديات ذكاء وتركيز" icon="🧩" color="bg-fuchsia-500/20 hover:bg-fuchsia-500/30 text-fuchsia-100 border-fuchsia-400/30" onClick={() => navigate('/games/memory')} />
            <MicroZoneCard title="لعبة 2048" subtitle="تحدي الأرقام" icon="🔢" color="bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 border-amber-400/30" onClick={() => navigate('/games/2048')} />
            <MicroZoneCard title="سيمون يقول" subtitle="تحدي الذاكرة البصرية" icon="🎨" color="bg-slate-500/20 hover:bg-slate-500/30 text-slate-100 border-slate-400/30" onClick={() => navigate('/games/simon')} />
            <MicroZoneCard title="إكس أو" subtitle="تحدي الذكاء" icon="❌" color="bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-100 border-indigo-400/30" onClick={() => navigate('/games/tictactoe')} />
            <MicroZoneCard title="صانع المرافق" subtitle="تلبيس وتصميم" icon="🦄" color="bg-pink-500/20 hover:bg-pink-500/30 text-pink-100 border-pink-400/30" onClick={() => navigate('/games/petmaker')} />
            <MicroZoneCard title="الكلمات السحرية" subtitle="لعبة الحروف" icon="🔤" color="bg-sky-500/20 hover:bg-sky-500/30 text-sky-100 border-sky-400/30" onClick={() => navigate('/games/words')} />
            <MicroZoneCard title="صيد النجوم" subtitle="لعبة سرعة" icon="⭐" color="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-100 border-yellow-400/30" onClick={() => navigate('/games/catch')} />
            <MicroZoneCard title="جزيرة المهمات" subtitle="مهام يومية ممتعة" icon="🗺️" color="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-100 border-emerald-400/30" onClick={() => navigate('/academy')} />
            <MicroZoneCard title="مغامرات التعلم" subtitle="علوم ولغة وحساب" icon="🚀" color="bg-orange-500/20 hover:bg-orange-500/30 text-orange-100 border-orange-400/30" onClick={() => navigate('/learning')} />
            <MicroZoneCard title="قصر الجوائز" subtitle="شارات وإنجازات" icon="🏆" color="bg-amber-500/20 hover:bg-amber-500/30 text-amber-100 border-amber-400/30" onClick={() => navigate('/stars')} />
            <MicroZoneCard title="أنشطة المنزل" subtitle="فعاليات مع العائلة" icon="🏠" color="bg-teal-500/20 hover:bg-teal-500/30 text-teal-100 border-teal-400/30" onClick={() => {}} />
            <MicroZoneCard title="ملفي السحري" subtitle="الأفاتار والإنجازات" icon="👧" color="bg-pink-500/20 hover:bg-pink-500/30 text-pink-100 border-pink-400/30" onClick={() => navigate('/studio')} />
          </div>
        </section>

        {/* Bottom Widgets */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* الشارات القريبة */}
          <div className="bg-white/10 backdrop-blur-xl rounded-[2rem] p-6 shadow-xl border border-white/15">
            <h4 className="text-xl font-black text-white mb-4 flex items-center gap-2">🏅 الشارات القريبة</h4>
            <div className="space-y-4">
              <BadgeItem icon="🌟" title="شارة القارئة اللامعة" desc="قراءة 5 قصص" />
              <BadgeItem icon="🧪" title="شارة العالمة الصغيرة" desc="إتمام 3 تجارب تعليمية" />
              <BadgeItem icon="🤝" title="شارة صديقة الجميع" desc="إكمال 4 مهام لطف" />
            </div>
            <button className="mt-4 text-violet-300 font-bold text-sm hover:underline w-full text-left" onClick={() => navigate('/stars')}>
              شاهدي كل الجوائز ←
            </button>
          </div>

          {/* نشاط منزلي سريع */}
          <div className="bg-amber-500/15 rounded-[2rem] p-6 shadow-xl border border-amber-400/25">
            <h4 className="text-xl font-black text-amber-200 mb-2 flex items-center gap-2">🏠 نشاط منزلي سريع</h4>
            <h5 className="text-2xl font-black text-amber-300 mb-2">مسرح الدمى السحري</h5>
            <p className="text-amber-200/80 font-bold mb-4">المدة: 20 دقيقة</p>
            <ul className="space-y-2 text-amber-100/80 font-medium mb-4 list-disc list-inside">
              <li>اختاري شخصيتين</li>
              <li>زيني الدمى</li>
              <li>اعملي حوار قصير مضحك</li>
            </ul>
            <button className="text-amber-300 font-bold text-sm hover:underline w-full text-left">
              اكتشفي أنشطة أكثر ←
            </button>
          </div>

          {/* حقيقة اليوم */}
          <div className="bg-cyan-500/15 rounded-[2rem] p-6 shadow-xl border border-cyan-400/25 flex flex-col justify-between">
            <div>
              <h4 className="text-xl font-black text-cyan-200 mb-4 flex items-center gap-2">🔍 حقيقة اليوم</h4>
              <p className="text-2xl font-black text-cyan-100 leading-relaxed">
                الأخطبوط لديه ثلاثة قلوب! 🐙
              </p>
            </div>
            <button className="mt-4 text-cyan-300 font-bold text-sm hover:underline w-full text-left">
              حقائق أكثر ←
            </button>
          </div>
        </div>
      </main>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettings && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[70] p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white/15 backdrop-blur-2xl w-full max-w-2xl p-8 rounded-[3rem] shadow-2xl relative text-right border border-white/20 my-8"
            >
              <button 
                onClick={() => setShowSettings(false)}
                className="absolute top-6 left-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white/60 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 bg-violet-500/20 border border-violet-400/30 text-violet-300 rounded-2xl flex items-center justify-center">
                  <Settings className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">إعدادات ملفي السحري</h2>
                  <p className="text-white/60 font-bold">تحكمي في بياناتكِ وقواكِ السحرية</p>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-8">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-black text-white/60 mb-2 mr-2 flex items-center gap-2">
                      <User className="w-4 h-4" /> اسمكِ الحقيقي
                    </label>
                    <input
                      type="text"
                      value={editData.name || ''}
                      onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full p-4 rounded-2xl bg-white/10 border border-white/20 focus:border-violet-400/60 outline-none font-bold text-white placeholder:text-white/40 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-black text-white/60 mb-2 mr-2 flex items-center gap-2">
                      <Shield className="w-4 h-4" /> لقبكِ البطولي
                    </label>
                    <input
                      type="text"
                      value={editData.heroName || ''}
                      onChange={(e) => setEditData(prev => ({ ...prev, heroName: e.target.value }))}
                      className="w-full p-4 rounded-2xl bg-white/10 border border-white/20 focus:border-violet-400/60 outline-none font-bold text-white placeholder:text-white/40 transition-all"
                    />
                  </div>
                </div>

                {/* Power Selection */}
                <div>
                  <label className="block text-sm font-black text-white/60 mb-4 mr-2 flex items-center gap-2">
                    <Zap className="w-4 h-4" /> قوتكِ السحرية المفضلة
                  </label>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {HERO_POWERS.map((power) => (
                      <button
                        key={power.id}
                        type="button"
                        onClick={() => setEditData(prev => ({ ...prev, heroPower: power.id }))}
                        className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-2 text-white ${
                          editData.heroPower === power.id 
                            ? 'bg-violet-500/30 border-violet-400/60 scale-105 shadow-md' 
                            : 'bg-white/10 border-white/20 hover:border-violet-400/40'
                        }`}
                      >
                        <span className="text-2xl">{power.icon}</span>
                        <span className="text-[10px] font-black leading-tight">{power.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Location & School */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-black text-white/60 mb-2 mr-2 flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> مدينتكِ
                    </label>
                    <input
                      type="text"
                      value={editData.city || ''}
                      onChange={(e) => setEditData(prev => ({ ...prev, city: e.target.value }))}
                      className="w-full p-4 rounded-2xl bg-white/10 border border-white/20 focus:border-violet-400/60 outline-none font-bold text-white placeholder:text-white/40 transition-all"
                      placeholder="مثلاً: القاهرة"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-black text-white/60 mb-2 mr-2 flex items-center gap-2">
                      <School className="w-4 h-4" /> مدرستكِ
                    </label>
                    <input
                      type="text"
                      value={editData.school || ''}
                      onChange={(e) => setEditData(prev => ({ ...prev, school: e.target.value }))}
                      className="w-full p-4 rounded-2xl bg-white/10 border border-white/20 focus:border-violet-400/60 outline-none font-bold text-white placeholder:text-white/40 transition-all"
                      placeholder="اسم مدرستكِ الجميلة"
                    />
                  </div>
                </div>

                {/* Security Section */}
                <div className="bg-white/10 p-6 rounded-3xl border border-white/20">
                  <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                    <Lock className="w-5 h-5" /> حماية ملفكِ السحري
                  </h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-black text-white/60 mb-2">الرمز السري (PIN)</label>
                      <input
                        type="password"
                        value={editData.pin || ''}
                        onChange={(e) => setEditData(prev => ({ ...prev, pin: e.target.value.replace(/\D/g, '') }))}
                        className="w-full p-4 rounded-2xl border border-white/20 focus:border-violet-400/60 outline-none text-center text-2xl tracking-[0.5em] font-black text-white bg-white/10"
                        placeholder="••••"
                        maxLength={8}
                      />
                      <p className="text-[10px] text-white/40 mt-2 text-center font-bold">يمكنكِ اختيار رمز من 4 إلى 8 أرقام</p>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl border border-white/20">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-pink-500/20 border border-pink-400/30 text-pink-300 rounded-xl flex items-center justify-center">
                          <LayoutGrid className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-black text-white">استخدام النقش السحري</p>
                          <p className="text-xs text-white/50 font-bold">زيادة الخصوصية بنقش فريد</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setUsePattern(!usePattern)}
                        className={`w-12 h-6 rounded-full transition-colors relative ${usePattern ? 'bg-pink-500' : 'bg-white/20'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${usePattern ? 'right-7' : 'right-1'}`} />
                      </button>
                    </div>

                    {usePattern && (
                      <div className="p-6 bg-white/10 rounded-2xl border border-pink-400/20 text-center">
                        <p className="text-sm font-black text-pink-300 mb-4">ارسمي نقشكِ السحري هنا</p>
                        <div className="grid grid-cols-3 gap-4 max-w-[200px] mx-auto">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                            <div 
                              key={i} 
                              className={`w-12 h-12 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all ${
                                pattern.includes(i) ? 'bg-pink-500 border-pink-400 scale-110 shadow-lg' : 'bg-white/10 border-white/20'
                              }`}
                              onClick={() => {
                                if (pattern.includes(i)) {
                                  setPattern(pattern.filter(p => p !== i));
                                } else {
                                  setPattern([...pattern, i]);
                                }
                              }}
                            >
                              {pattern.includes(i) && <div className="w-3 h-3 bg-white rounded-full" />}
                            </div>
                          ))}
                        </div>
                        <button 
                          type="button"
                          onClick={() => handlePatternComplete(pattern)}
                          className="mt-6 text-xs font-black text-pink-500 hover:underline"
                        >
                          تأكيد النقش
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white font-black py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl hover:-translate-y-1 text-lg flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : 'حفظ التعديلات السحرية ✨'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ZoneCard({ title, subtitle, icon, color, onClick }: { title: string, subtitle: string, icon: string, color: string, onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.03, y: -5 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`relative overflow-hidden rounded-[2.5rem] text-right text-white shadow-xl transition-all group ${color} aspect-[4/3] flex flex-col justify-between p-6 md:p-8`}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/5 to-transparent z-10" />
      
      {/* Decorative background circle */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
      
      <div className="relative z-20 flex justify-between items-start w-full">
        <div className="text-6xl md:text-7xl drop-shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300 origin-bottom-right">
          {icon}
        </div>
        <div className="w-10 h-10 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center shrink-0">
          <PlayCircle className="w-6 h-6 text-white" />
        </div>
      </div>
      
      <div className="relative z-20 w-full mt-auto">
        <h3 className="text-2xl md:text-3xl font-black mb-1 drop-shadow-md">{title}</h3>
        <p className="text-white/90 font-bold text-sm md:text-base drop-shadow-md">{subtitle}</p>
      </div>
    </motion.button>
  );
}

function MiniZoneCard({ title, subtitle, icon, color, onClick }: { title: string, subtitle: string, icon: string, color: string, onClick: () => void }) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        onClick={onClick}
        className={`relative overflow-hidden rounded-2xl text-right shadow-sm transition-all group ${color} p-4 flex items-center gap-4 border-2 cursor-pointer`}
      >
        <div className="text-4xl drop-shadow-sm group-hover:scale-110 transition-transform">{icon}</div>
        <div>
          <h3 className="text-lg font-black mb-1">{title}</h3>
          <p className="font-bold text-sm opacity-90">{subtitle}</p>
        </div>
      </Card>
    </motion.div>
  );
}

function MicroZoneCard({ title, subtitle, icon, color, onClick }: { title: string, subtitle: string, icon: string, color: string, onClick: () => void }) {
  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
    >
      <Card 
        onClick={onClick}
        className={`relative overflow-hidden rounded-2xl text-center shadow-sm transition-all group ${color} p-4 flex flex-col items-center justify-center border-2 aspect-square cursor-pointer`}
      >
        <div className="text-4xl mb-2 drop-shadow-sm group-hover:scale-110 transition-transform">{icon}</div>
        <h3 className="text-sm font-black mb-1">{title}</h3>
        <p className="text-xs font-bold opacity-80">{subtitle}</p>
      </Card>
    </motion.div>
  );
}

function BadgeItem({ icon, title, desc }: { icon: string, title: string, desc: string }) {
  return (
    <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl border border-white/15">
      <div className="text-2xl">{icon}</div>
      <div>
        <h5 className="font-black text-white text-sm">{title}</h5>
        <p className="text-xs font-bold text-white/60">{desc}</p>
      </div>
    </div>
  );
}
