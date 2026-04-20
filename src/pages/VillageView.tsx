import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Map, Home, Star, Sparkles, ArrowLeft, Book, Trophy, Wand2, Search, Users, MessageCircle, Clock, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { db } from '../firebase';
import { collection, onSnapshot, query, where, setDoc, doc } from 'firebase/firestore';
import { ChildProfile, ActivityLog, OnlineStatus, VisitRequest, FriendRequest } from '../types';
import { toast } from 'sonner';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';

export default function VillageView() {
  const navigate = useNavigate();
  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [friends, setFriends] = useState<ChildProfile[]>([]);
  const [onlineHeroes, setOnlineHeroes] = useState<OnlineStatus[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [activeChild, setActiveChild] = useState<ChildProfile | null>(null);
  const [sendingRequest, setSendingRequest] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'friends' | 'all'>('friends');

  useEffect(() => {
    const activeChildStr = localStorage.getItem('active_child');
    if (!activeChildStr) {
      navigate('/');
      return;
    }
    const currentChild = JSON.parse(activeChildStr) as ChildProfile;
    setActiveChild(currentChild);

    const unsubscribeChildren = onSnapshot(collection(db, 'children_profiles'), (snapshot) => {
      const allChildren = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as ChildProfile));
      setChildren(allChildren.filter(c => c.status === 'approved'));
    }, (err) => handleFirestoreError(err, OperationType.GET, 'children_profiles'));

    const twoMinutesAgo = Date.now() - 120000;
    const onlineQuery = query(collection(db, 'online_status'), where('isOnline', '==', true), where('lastActive', '>=', twoMinutesAgo));
    const unsubscribeOnline = onSnapshot(onlineQuery, (snapshot) => {
      const online = snapshot.docs.map(doc => doc.data() as OnlineStatus);
      setOnlineHeroes(online);
    }, (err) => handleFirestoreError(err, OperationType.GET, 'online_status'));

    const logsQuery = query(collection(db, 'activity_logs'));
    const unsubscribeLogs = onSnapshot(logsQuery, (snapshot) => {
      setLogs(snapshot.docs.map(doc => doc.data() as ActivityLog).sort((a, b) => b.timestamp - a.timestamp));
    }, (err) => handleFirestoreError(err, OperationType.GET, 'activity_logs'));

    return () => {
      unsubscribeChildren();
      unsubscribeOnline();
      unsubscribeLogs();
    };
  }, [navigate]);

  useEffect(() => {
    if (!activeChild || !children.length) return;
    
    const qRequests = query(collection(db, 'friend_requests'));
    const unsubscribe = onSnapshot(qRequests, (snapshot) => {
      const requests = snapshot.docs.map(doc => doc.data() as FriendRequest);
      const acceptedFriendIds = new Set<string>();
      
      requests.forEach(req => {
        if (req.status === 'accepted') {
          if (req.fromId === activeChild.uid) acceptedFriendIds.add(req.toId);
          if (req.toId === activeChild.uid) acceptedFriendIds.add(req.fromId);
        }
      });

      setFriends(children.filter(c => acceptedFriendIds.has(c.uid)));
    });

    return () => unsubscribe();
  }, [children, activeChild]);

  const handleVisitRequest = async (targetChild: ChildProfile) => {
    if (!activeChild) return;
    if (targetChild.uid === activeChild.uid) {
      toast.error('هذا بيتكِ السحري!');
      return;
    }

    const isFriend = friends.some(f => f.uid === targetChild.uid);
    if (!isFriend) {
      toast.error('يمكنكِ زيارة الصديقات فقط! أرسلي طلب صداقة أولاً ✨');
      navigate('/friends');
      return;
    }

    if (!isOnline(targetChild.uid)) {
      navigate(`/house/view_${targetChild.uid}`);
      return;
    }

    setSendingRequest(targetChild.uid);
    try {
      const requestId = `${activeChild.uid}_${targetChild.uid}_${Date.now()}`;
      const request: VisitRequest = {
        id: requestId,
        fromId: activeChild.uid,
        fromName: activeChild.name,
        fromHeroName: activeChild.heroName,
        fromAvatar: activeChild.avatar,
        toId: targetChild.uid,
        toName: targetChild.name,
        toAvatar: targetChild.avatar,
        status: 'pending',
        timestamp: Date.now()
      };

      await setDoc(doc(db, 'visit_requests', requestId), request);
      toast.info(`تم إرسال طلب الزيارة للبطلة ${targetChild.heroName}.. بانتظار الموافقة ✨`);

      const unsubscribe = onSnapshot(doc(db, 'visit_requests', requestId), (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as VisitRequest;
          if (data.status === 'accepted') {
            toast.success(`وافقت البطلة ${targetChild.heroName} على دخولكِ! تفضلي ✨`);
            setTimeout(() => {
              navigate(`/house/${requestId}`);
              unsubscribe();
            }, 2000);
          } else if (data.status === 'rejected' || data.status === 'declined') {
            toast.error(`عذراً، البطلة ${targetChild.heroName} مشغولة الآن، حاولي لاحقاً ✨`);
            unsubscribe();
          }
        }
      });
    } catch (error) {
      toast.error('حدث خطأ أثناء إرسال الطلب');
    } finally {
      setSendingRequest(null);
    }
  };

  const isOnline = (uid: string) => onlineHeroes.some(h => h.uid === uid);

  const districts = [
    { id: 'stories', name: 'وادي القصص', icon: '📚', path: '/stories', color: 'bg-purple-100' },
    { id: 'academy', name: 'أكاديمية السحر', icon: '🎓', path: '/academy', color: 'bg-yellow-100' },
    { id: 'learning', name: 'أكاديمية الحكمة', icon: '🧠', path: '/learning', color: 'bg-blue-100' },
    { id: 'stars', name: 'قاعة النجوم', icon: '🏆', path: '/stars', color: 'bg-orange-100' },
    { id: 'pet', name: 'حديقة الرفاق', icon: '🐾', path: '/pet', color: 'bg-emerald-100' },
    { id: 'journal', name: 'مكتبة العجائب', icon: '📖', path: '/journal', color: 'bg-amber-100' },
  ];

  const onlineFriendsCount = friends.filter(friend => isOnline(friend.uid)).length;
  const wisdomCards = [
    {
      id: 'visit-now',
      icon: '🚪',
      title: 'اقتراح زيارة فورية',
      description: onlineFriendsCount > 0
        ? `يوجد الآن ${onlineFriendsCount} صديقة متصلة، فرصة ممتازة لزيارة مباشرة.`
        : 'لا توجد صديقات متصلات الآن، جربي زيارة منزل أو إرسال دعوة لصديقة جديدة.',
      actionLabel: onlineFriendsCount > 0 ? 'زيارة الآن' : 'ابحثي عن صديقات',
      action: () => navigate(onlineFriendsCount > 0 ? '/village' : '/friends')
    },
    {
      id: 'safe-chat',
      icon: '💬',
      title: 'تواصل لطيف وآمن',
      description: 'ابدئي التحية أولاً ثم اتفقي على نشاط مشترك: لعبة، دردشة، أو استكشاف البيت.',
      actionLabel: 'فتح الدردشة',
      action: () => navigate('/friends')
    }
  ];

  const displayedChildren = viewMode === 'friends' ? friends : children;
  const villageHighlights = logs.filter(log => log.type !== 'login').slice(0, 8);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-princess transition-colors overflow-x-hidden relative">
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-sky-400/10 dark:bg-sky-900/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-pink-400/10 dark:bg-pink-900/10 rounded-full blur-[100px] animate-pulse delay-700" />
      </div>

      <header className="sticky top-0 z-50 bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border-b border-white/50 dark:border-slate-800/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-sky-500 dark:hover:text-sky-400 font-black transition-all group"
          >
            <div className="w-10 h-10 bg-white/50 dark:bg-slate-800/50 rounded-xl flex items-center justify-center border border-white dark:border-slate-700 group-hover:scale-110 transition-transform">
              <ArrowLeft className="w-5 h-5" />
            </div>
            <span>العودة</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="text-right hidden md:block">
              <h1 className="text-xl font-black text-slate-900 dark:text-white">مدينة البطلات</h1>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">عالم من الصداقة والمغامرة ✨</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-sky-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-sky-500/20">
              <Map className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-10 relative z-10 space-y-12">
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {wisdomCards.map((card) => (
            <motion.div 
              key={card.id}
              whileHover={{ y: -5 }}
            >
              <Card className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl p-8 rounded-[3rem] border border-white dark:border-slate-800 shadow-2xl flex items-start gap-6 group h-full">
                <div className="w-16 h-16 bg-sky-100 dark:bg-sky-900/30 rounded-3xl flex items-center justify-center text-4xl shadow-inner group-hover:scale-110 transition-transform">
                  {card.icon}
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl font-black text-slate-900 dark:text-white mb-2">{card.title}</CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400 font-bold text-sm mb-6 leading-relaxed">{card.description}</CardDescription>
                  <button 
                    onClick={card.action}
                    className="bg-sky-500 hover:bg-sky-600 text-white font-black px-6 py-3 rounded-2xl shadow-lg shadow-sky-500/20 transition-all text-sm"
                  >
                    {card.actionLabel}
                  </button>
                </div>
              </Card>
            </motion.div>
          ))}
        </section>

        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-amber-500" />
              </div>
              أحياء المدينة السحرية
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {districts.map((district) => (
              <motion.button
                key={district.id}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(district.path)}
                className={`flex flex-col items-center p-6 rounded-[2.5rem] border-2 border-white dark:border-slate-800 shadow-xl transition-all ${district.color} dark:bg-opacity-10 group`}
              >
                <div className="text-5xl mb-4 group-hover:rotate-12 transition-transform">{district.icon}</div>
                <span className="font-black text-slate-800 dark:text-white text-sm">{district.name}</span>
              </motion.button>
            ))}
          </div>
        </section>

        <Card className="bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl rounded-[3.5rem] p-10 md:p-14 border border-white dark:border-slate-800 shadow-2xl">
          <CardHeader className="p-0 flex flex-col md:flex-row items-center justify-between gap-6 mb-12 space-y-0">
            <div>
              <CardTitle className="text-3xl font-black text-slate-900 dark:text-white mb-2">سكان المدينة</CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400 font-bold">تعرفي على بطلات المدينة وزوري منازلهن السحرية ✨</CardDescription>
            </div>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
              <button 
                onClick={() => setViewMode('friends')}
                className={`px-6 py-2.5 rounded-xl font-black text-sm transition-all ${viewMode === 'friends' ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-md' : 'text-slate-500 dark:text-slate-400'}`}
              >
                صديقاتي
              </button>
              <button 
                onClick={() => setViewMode('all')}
                className={`px-6 py-2.5 rounded-xl font-black text-sm transition-all ${viewMode === 'all' ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-400 shadow-md' : 'text-slate-500 dark:text-slate-400'}`}
              >
                كل البطلات
              </button>
            </div>
          </CardHeader>

          <CardContent className="p-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {displayedChildren.map((child) => (
              <motion.div
                key={child.uid}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -10 }}
              >
                <Card className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-[3rem] p-8 border border-white dark:border-slate-700 shadow-xl flex flex-col items-center text-center group relative overflow-hidden h-full">
                  {isOnline(child.uid) && (
                    <div className="absolute top-6 right-6 flex items-center gap-1.5 bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-[10px] font-black border border-emerald-500/20">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      متصلة الآن
                    </div>
                  )}
                  
                  <Avatar className={`w-28 h-28 ${child.avatar.color} rounded-[2.5rem] mb-6 shadow-2xl border-4 border-white dark:border-slate-700 group-hover:rotate-6 transition-transform overflow-hidden relative`}>
                    <AvatarFallback className="text-7xl mt-6 bg-transparent">
                      {child.avatar.hairStyle}
                    </AvatarFallback>
                  </Avatar>
                  
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">{child.heroName}</h3>
                  <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-6">{child.heroPower} ✨</p>
                  
                  <div className="flex items-center gap-3 w-full mt-auto">
                    <button 
                      onClick={() => handleVisitRequest(child)}
                      disabled={sendingRequest === child.uid}
                      className="flex-1 bg-sky-500 hover:bg-sky-600 text-white font-black py-3 rounded-2xl shadow-lg shadow-sky-500/20 transition-all text-sm flex items-center justify-center gap-2"
                    >
                      {sendingRequest === child.uid ? <Loader2 className="w-4 h-4 animate-spin" /> : <Home className="w-4 h-4" />}
                      زيارة
                    </button>
                    <button 
                      onClick={() => navigate('/friends')}
                      className="w-12 h-12 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-2xl flex items-center justify-center hover:bg-sky-100 dark:hover:bg-sky-900/30 hover:text-sky-600 transition-all"
                    >
                      <MessageCircle className="w-5 h-5" />
                    </button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        <section className="bg-slate-900 dark:bg-slate-900/80 text-white rounded-[3.5rem] p-10 md:p-14 border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-sky-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <h2 className="text-3xl font-black mb-10 flex items-center gap-3">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center">
                <Trophy className="w-7 h-7 text-amber-400" />
              </div>
              أخبار المدينة السعيدة
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {villageHighlights.map((log, idx) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-center gap-4 bg-white/5 backdrop-blur-md p-5 rounded-2xl border border-white/10 hover:bg-white/10 transition-all"
                >
                  <div className="w-12 h-12 bg-sky-500/20 rounded-xl flex items-center justify-center text-2xl">
                    {log.type === 'mission' ? '🏆' : log.type === 'story' ? '📖' : '✨'}
                  </div>
                  <div>
                    <p className="font-bold text-sm leading-relaxed">
                      البطلة <span className="text-sky-400 font-black">{log.childName}</span> {log.message}
                    </p>
                    <p className="text-[10px] text-slate-400 font-bold mt-1">
                      {new Date(log.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
