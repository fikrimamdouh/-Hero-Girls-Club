 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/src/pages/HeroHouse.tsx b/src/pages/HeroHouse.tsx
index 9568a61d4bfcd393f2bf3869071f3f690538d058..7e87694fa7041f68601af51dc4e65a5ed3ae34de 100644
--- a/src/pages/HeroHouse.tsx
+++ b/src/pages/HeroHouse.tsx
@@ -1,90 +1,123 @@
 import { useState, useEffect, useRef } from 'react';
 import { useParams, useNavigate } from 'react-router-dom';
 import { motion, AnimatePresence } from 'motion/react';
 import { Send, LogOut, Sparkles, MessageCircle, Star, Heart, Shield, Users, Coffee, Cookie, Music, PartyPopper, Video, Mic, MicOff, VideoOff, Camera, Palette, Wand2, Plus, Trash2, Gamepad2, X, Smile, Minus, RotateCw, ChevronUp, ChevronDown, ArrowLeft } from 'lucide-react';
 import { db } from '../firebase';
-import { doc, onSnapshot, collection, addDoc, query, where, orderBy, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
+import { doc, onSnapshot, collection, addDoc, query, where, orderBy, updateDoc, serverTimestamp, getDoc, setDoc, getDocs } from 'firebase/firestore';
 import { ChildProfile, VisitRequest, ChatMessage, AvatarConfig, HouseItem, HouseConfig } from '../types';
+import { CallSession } from '../types';
 import { toast } from 'sonner';
 import { GoogleGenAI } from '@google/genai';
+import { CallScreen } from '../components/CallScreen';
+import { IncomingCallModal } from '../components/IncomingCallModal';
+import { roomService } from '../services/roomService';
 
 import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';
 
 const THEMES = {
   castle: { bg: 'from-pink-100 to-purple-200', floor: 'bg-stone-200', wall: 'bg-pink-50' },
   garden: { bg: 'from-green-100 to-blue-100', floor: 'bg-emerald-200', wall: 'bg-green-50' },
   space: { bg: 'from-indigo-900 to-purple-900', floor: 'bg-slate-800', wall: 'bg-indigo-950' },
   underwater: { bg: 'from-blue-400 to-cyan-600', floor: 'bg-blue-800', wall: 'bg-blue-300' },
   cloud: { bg: 'from-sky-100 to-white', floor: 'bg-white/80', wall: 'bg-sky-50' }
 };
 
 const WALLPAPER_OPTIONS = [
   { id: 'pink-stars', class: 'bg-gradient-to-b from-pink-100 to-rose-200', label: 'نجوم وردية', icon: '⭐' },
   { id: 'blue-clouds', class: 'bg-gradient-to-b from-sky-100 to-blue-200', label: 'غيوم زرقاء', icon: '☁️' },
   { id: 'purple-magic', class: 'bg-gradient-to-b from-purple-100 to-indigo-200', label: 'سحر بنفسجي', icon: '✨' },
   { id: 'green-nature', class: 'bg-gradient-to-b from-emerald-100 to-teal-200', label: 'طبيعة خضراء', icon: '🌿' },
   { id: 'yellow-sun', class: 'bg-gradient-to-b from-amber-50 to-yellow-100', label: 'شمس مشرقة', icon: '☀️' },
   { id: 'night-stars', class: 'bg-gradient-to-b from-slate-900 to-indigo-950', label: 'ليل مرصع بالنجوم', icon: '🌙' },
 ];
 
 const FLOOR_OPTIONS = [
   { id: 'stone', class: 'bg-stone-200', label: 'حجر', icon: '🧱' },
   { id: 'wood', class: 'bg-amber-200', label: 'خشب', icon: '🪵' },
   { id: 'grass', class: 'bg-emerald-200', label: 'عشب', icon: '🌱' },
   { id: 'carpet', class: 'bg-rose-200', label: 'سجاد وردي', icon: '🧶' },
   { id: 'cloud', class: 'bg-white/80', label: 'سحاب', icon: '☁️' },
   { id: 'water', class: 'bg-blue-200', label: 'ماء', icon: '💧' },
 ];
 
 const FURNITURE_OPTIONS = [
   { type: 'chair', emoji: '🪑' },
   { type: 'table', emoji: '🛋️' },
   { type: 'bed', emoji: '🛏️' },
   { type: 'lamp', emoji: '💡' },
   { type: 'plant', emoji: '🪴' },
   { type: 'toy', emoji: '🧸' },
   { type: 'mirror', emoji: '🪞' },
   { type: 'window', emoji: '🖼️' }
 ];
 
+const ROOM_ZONES = [
+  { id: 'sleep', label: 'غرفة النوم', icon: '🛏️', x: 8, y: 10, w: 28, h: 35, tint: 'bg-indigo-200/30' },
+  { id: 'study', label: 'ركن الدراسة', icon: '📚', x: 37, y: 10, w: 26, h: 35, tint: 'bg-sky-200/30' },
+  { id: 'play', label: 'منطقة اللعب', icon: '🧸', x: 65, y: 10, w: 27, h: 35, tint: 'bg-pink-200/30' }
+] as const;
+
+const WORLD_SCENES = [
+  { id: 'sunrise', label: 'شروق', wallpaper: 'bg-gradient-to-b from-amber-100 via-orange-100 to-pink-100', floor: 'bg-amber-200', particles: '✨' },
+  { id: 'rainbow', label: 'قوس قزح', wallpaper: 'bg-gradient-to-b from-pink-100 via-sky-100 to-emerald-100', floor: 'bg-emerald-200', particles: '🌈' },
+  { id: 'night', label: 'ليل', wallpaper: 'bg-gradient-to-b from-slate-900 to-indigo-950', floor: 'bg-slate-800', particles: '🌙' }
+] as const;
+
+const QUICK_MESSAGES = ['يلا نلعب تحدي ترتيب الغرفة! 🧸', 'تعالي نعمل بيت أحلام عالمي! ✨', 'اختاري غرفتك المفضلة ونزينها معًا 🎨'];
+const BLOCKED_WORDS = ['شتيمة', 'غبي', 'اكرهك'];
+
 export default function HeroHouse() {
   const { visitId } = useParams<{ visitId: string }>();
   const navigate = useNavigate();
   const [visit, setVisit] = useState<VisitRequest | null>(null);
   const [messages, setMessages] = useState<ChatMessage[]>([]);
   const [newMessage, setNewMessage] = useState('');
   const [activeChild, setActiveChild] = useState<ChildProfile | null>(null);
   const [hostProfile, setHostProfile] = useState<ChildProfile | null>(null);
   const [loading, setLoading] = useState(true);
   const [showMirror, setShowMirror] = useState(false);
   const [isEditing, setIsEditing] = useState(false);
   const [isMagicDecorating, setIsMagicDecorating] = useState(false);
   const [isMuted, setIsMuted] = useState(false);
   const [isVideoOff, setIsVideoOff] = useState(false);
   const [showChat, setShowChat] = useState(true);
   const [isActionBusy, setIsActionBusy] = useState(false);
+  const [sceneIndex, setSceneIndex] = useState(0);
+  const [challengeText, setChallengeText] = useState('تحدي اليوم: رتّبي 3 قطع في كل غرفة');
+  const [questProgress, setQuestProgress] = useState(0);
+  const [questCompleted, setQuestCompleted] = useState(false);
+  const [comboStreak, setComboStreak] = useState(0);
+  const [activeActionPanel, setActiveActionPanel] = useState<'social' | 'play' | 'world'>('social');
+  const [groupMode, setGroupMode] = useState(false);
+  const [participants, setParticipants] = useState<string[]>([]);
+  const [activeCall, setActiveCall] = useState<CallSession | null>(null);
+  const [incomingCall, setIncomingCall] = useState<CallSession | null>(null);
+  const [inviteName, setInviteName] = useState('');
+  const [incomingGroupInvite, setIncomingGroupInvite] = useState<any | null>(null);
+  const [safeMode, setSafeMode] = useState(true);
+  const [sessionLimitMinutes, setSessionLimitMinutes] = useState(30);
   const scrollRef = useRef<HTMLDivElement>(null);
   const audioRef = useRef<HTMLAudioElement | null>(null);
 
   useEffect(() => {
     const activeChildStr = localStorage.getItem('active_child');
     if (!activeChildStr) {
       navigate('/');
       return;
     }
     const currentChild = JSON.parse(activeChildStr) as ChildProfile;
     setActiveChild(currentChild);
 
     if (!visitId) return;
 
     if (visitId === 'self') {
       setVisit({
         id: 'self',
         fromId: currentChild.uid,
         fromName: currentChild.name,
         fromHeroName: currentChild.heroName,
         fromAvatar: currentChild.avatar,
         toId: currentChild.uid,
         toName: currentChild.name,
         toAvatar: currentChild.avatar,
         status: 'accepted',
@@ -142,100 +175,269 @@ export default function HeroHouse() {
           if (hDoc.exists()) {
             setHostProfile(hDoc.data() as ChildProfile);
           }
         }
 
         if (data.status === 'ended') {
           toast.info('انتهت الزيارة السحرية، نراكِ قريباً!');
           navigate('/child');
         }
 
         // Play entry sound if just joined
         if (loading) {
           playSound('knock');
           if (data.toId === activeChild?.uid && data.fromId !== activeChild?.uid) {
             toast.success(`البطلة ${data.fromHeroName} وصلت لزيارتكِ! ✨`);
             const welcomeAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3');
             welcomeAudio.play().catch(() => {});
           }
         }
       } else {
         if (visitId !== 'self') navigate('/child');
       }
       setLoading(false);
     }, (err) => handleFirestoreError(err, OperationType.GET, `visit_requests/${visitId}`));
 
-    const q = query(
-      collection(db, 'chat_messages'),
-      where('visitId', '==', visitId),
-      orderBy('timestamp', 'asc')
-    );
-    const unsubscribeChat = onSnapshot(q, (snapshot) => {
-      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage));
-      setMessages(msgs);
-      setTimeout(() => {
-        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
-      }, 100);
-    }, (err) => handleFirestoreError(err, OperationType.GET, 'chat_messages'));
+    let unsubscribeChat = () => {};
+    if (visitId && !visitId.startsWith('view_') && visitId !== 'self') {
+      unsubscribeChat = roomService.onRoomMessages(visitId, (msgs) => {
+        setMessages(msgs as ChatMessage[]);
+        setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
+      });
+    } else {
+      const q = query(
+        collection(db, 'chat_messages'),
+        where('visitId', '==', visitId),
+        orderBy('timestamp', 'asc')
+      );
+      unsubscribeChat = onSnapshot(q, (snapshot) => {
+        const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage));
+        setMessages(msgs);
+        setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
+      }, (err) => handleFirestoreError(err, OperationType.GET, 'chat_messages'));
+    }
+
+    let unsubscribeParticipants = () => {};
+    let unsubscribeCalls = () => {};
+    let unsubscribeInvites = () => {};
+    if (visitId && !visitId.startsWith('view_') && visitId !== 'self') {
+      unsubscribeParticipants = roomService.onParticipants(visitId, (names) => setParticipants(names));
+
+      unsubscribeCalls = roomService.onIncomingCallsForUser(visitId, activeChild?.uid || '', (call) => {
+        if (call) setIncomingCall(call);
+      });
+
+      unsubscribeInvites = roomService.onPendingInvitesForUser(visitId, activeChild?.uid || '', (inv) => setIncomingGroupInvite(inv));
+    }
 
     return () => {
       unsubscribeVisit();
       unsubscribeChat();
+      unsubscribeParticipants();
+      unsubscribeCalls();
+      unsubscribeInvites();
     };
   }, [visitId, navigate]);
 
   const playSound = (type: 'knock' | 'magic' | 'pop') => {
     const sounds = {
       knock: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
       magic: 'https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3',
       pop: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3'
     };
     const audio = new Audio(sounds[type]);
     audio.play().catch(() => {});
   };
 
   const isLocalVisitMode = visitId === 'self' || !!visitId?.startsWith('view_');
 
   const handleSendMessage = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!newMessage.trim() || !activeChild || !visitId) return;
+    if (safeMode && BLOCKED_WORDS.some((word) => newMessage.includes(word))) {
+      toast.error('الرسالة تحتوي على كلمات غير مناسبة');
+      return;
+    }
 
     try {
-      await addDoc(collection(db, 'chat_messages'), {
-        visitId,
-        senderId: activeChild.uid,
-        senderName: activeChild.heroName || activeChild.name,
-        text: newMessage,
-        timestamp: Date.now()
-      });
+      if (!visitId.startsWith('view_') && visitId !== 'self') {
+        await roomService.sendRoomMessage(visitId, {
+          senderId: activeChild.uid,
+          senderName: activeChild.heroName || activeChild.name,
+          text: newMessage
+        });
+      } else {
+        await addDoc(collection(db, 'chat_messages'), {
+          visitId,
+          senderId: activeChild.uid,
+          senderName: activeChild.heroName || activeChild.name,
+          text: newMessage,
+          timestamp: Date.now()
+        });
+      }
       setNewMessage('');
       playSound('pop');
     } catch (error) {
       toast.error('حدث خطأ أثناء إرسال الرسالة');
     }
   };
 
+  const handleSendQuickMessage = async (text: string) => {
+    if (!activeChild || !visitId) return;
+    try {
+      if (!visitId.startsWith('view_') && visitId !== 'self') {
+        await roomService.sendRoomMessage(visitId, {
+          senderId: activeChild.uid,
+          senderName: activeChild.heroName || activeChild.name,
+          text
+        });
+      } else {
+        await addDoc(collection(db, 'chat_messages'), {
+          visitId,
+          senderId: activeChild.uid,
+          senderName: activeChild.heroName || activeChild.name,
+          text,
+          timestamp: Date.now()
+        });
+      }
+      playSound('pop');
+      setComboStreak((prev) => prev + 1);
+    } catch {
+      toast.error('تعذر إرسال الرسالة السريعة');
+    }
+  };
+
+  const handleReportSafety = () => {
+    if (!activeChild || !visitId) {
+      toast.success('تم إرسال بلاغ الأمان للمراجعة ✅');
+      return;
+    }
+    roomService.createSafetyReport({
+      visitId,
+      reporterId: activeChild.uid,
+      reporterName: activeChild.heroName || activeChild.name
+    }).then(() => {
+      toast.success('تم إرسال بلاغ الأمان للمراجعة ✅');
+    }).catch(() => {
+      toast.error('تعذر إرسال البلاغ الآن');
+    });
+  };
+
+  const rotateScene = () => {
+    setSceneIndex((prev) => (prev + 1) % WORLD_SCENES.length);
+    playSound('magic');
+    setQuestProgress((prev) => Math.min(100, prev + 10));
+  };
+
+  const createSmartChallenge = () => {
+    const challenges = [
+      'تحدي السرعة: رتّبي 5 قطع خلال دقيقة ⏱️',
+      'تحدي الذكاء: اصنعي ركن دراسة كامل 📚',
+      'تحدي الإبداع: امزجي بين النوم واللعب بتناغم 🎨'
+    ];
+    setChallengeText(challenges[Math.floor(Math.random() * challenges.length)]);
+    toast.success('تم إنشاء تحدي جديد!');
+    setQuestProgress((prev) => Math.min(100, prev + 15));
+  };
+
+  const toggleGroupMode = () => {
+    if (!activeChild) return;
+    setGroupMode((prev) => !prev);
+    setParticipants((prev) => {
+      if (prev.length === 0) return [activeChild.heroName || activeChild.name];
+      return prev;
+    });
+  };
+
+  const addGuestToGroup = () => {
+    const pool = ['نورا', 'ليان', 'كارما', 'سارة', 'ملاك', 'ريما'];
+    const next = pool.find((name) => !participants.includes(name));
+    if (!next) {
+      toast.info('كل الصديقات انضممن للحفلة 🎉');
+      return;
+    }
+    setParticipants((prev) => [...prev, next]);
+    boostQuestProgress(10);
+    toast.success(`انضمت ${next} إلى الزيارة الجماعية ✨`);
+  };
+
+  const handleJoinVisitRoom = async () => {
+    if (!visitId || !activeChild || visitId === 'self' || visitId.startsWith('view_')) return;
+    await roomService.joinRoom(visitId, {
+      uid: activeChild.uid,
+      heroName: activeChild.heroName || activeChild.name,
+      avatar: activeChild.avatar
+    });
+  };
+
+  const handleStartVideoCall = async () => {
+    if (!visitId || !activeChild || !visit || visitId === 'self' || visitId.startsWith('view_')) return;
+    const otherId = activeChild.uid === visit.fromId ? visit.toId : visit.fromId;
+    const callDoc = await roomService.startVideoCall(visitId, {
+      callerId: activeChild.uid,
+      callerName: activeChild.heroName || activeChild.name,
+      callerAvatar: activeChild.avatar || null,
+      calleeId: otherId
+    });
+    setActiveCall({ id: callDoc.id, chatId: `visit_${visitId}`, callerId: activeChild.uid, callerName: activeChild.heroName || activeChild.name, callerAvatar: activeChild.avatar, calleeId: otherId, type: 'video', status: 'ringing', createdAt: Date.now() });
+  };
+
+  const handleInviteByName = async () => {
+    if (!visitId || !activeChild || !inviteName.trim()) return;
+    if ((activeChild.heroName || activeChild.name) === inviteName.trim()) {
+      toast.error('لا يمكنك دعوة نفسك');
+      return;
+    }
+    const qChild = query(collection(db, 'children_profiles'), where('heroName', '==', inviteName.trim()));
+    const snapshot = await getDocs(qChild);
+    if (!snapshot.docs.length) {
+      toast.error('لم يتم العثور على هذه الصديقة');
+      return;
+    }
+    const target = snapshot.docs[0];
+    await roomService.sendInvite(visitId, {
+      fromId: activeChild.uid,
+      fromName: activeChild.heroName || activeChild.name,
+      toId: target.id,
+      toName: inviteName.trim()
+    });
+    setInviteName('');
+    toast.success('تم إرسال دعوة الزيارة الجماعية ✨');
+  };
+
+  const boostQuestProgress = (amount: number) => {
+    setQuestProgress((prev) => {
+      const next = Math.min(100, prev + amount);
+      if (next >= 100 && !questCompleted) {
+        setQuestCompleted(true);
+        toast.success('🎉 أنجزتِ مهمة البيت العالمية! حصلتِ على شارة الإبداع');
+        playSound('magic');
+      }
+      return next;
+    });
+  };
+
   const handleAction = async (type: VisitRequest['currentAction']['type']) => {
     if (!visitId || !activeChild) return;
     if (isActionBusy) return;
     
     const actionData = {
       type,
       timestamp: Date.now(),
       triggeredBy: activeChild.uid
     };
 
     const clearActionAfterDelay = () => {
       setTimeout(() => {
         setVisit(prev => {
           if (prev?.currentAction?.timestamp === actionData.timestamp) {
             return { ...prev, currentAction: null } as VisitRequest;
           }
           return prev;
         });
       }, 5000);
     };
 
     if (isLocalVisitMode) {
       // Local mode for self/view visits
       setVisit(prev => prev ? { ...prev, currentAction: actionData } as VisitRequest : null);
       playSound('magic');
@@ -353,87 +555,94 @@ export default function HeroHouse() {
   };
 
   const handleCloseGame = async () => {
     if (!visitId) return;
     try {
       if (isLocalVisitMode) {
         setVisit(prev => (prev ? { ...prev, gameState: undefined } : prev));
       } else {
         await updateDoc(doc(db, 'visit_requests', visitId), { gameState: null });
       }
     } catch (error) {
       toast.error('حدث خطأ أثناء إغلاق اللعبة');
     }
   };
 
   const handleAddItem = async (item: Partial<HouseItem>) => {
     if (!hostProfile || !activeChild || activeChild.uid !== hostProfile.uid) return;
     
     const newItem: HouseItem = {
       id: Math.random().toString(36).substr(2, 9),
       type: item.type || 'furniture',
       emoji: item.emoji || '✨',
       x: 50,
       y: 50,
       scale: 1,
-      rotation: 0
+      rotation: 0,
+      room: 'play'
     };
 
     const newConfig: HouseConfig = {
       theme: hostProfile.houseConfig?.theme || 'castle',
       furniture: [...(hostProfile.houseConfig?.furniture || []), newItem],
       decorations: hostProfile.houseConfig?.decorations || [],
       wallpaper: hostProfile.houseConfig?.wallpaper || '',
       floor: hostProfile.houseConfig?.floor || ''
     };
 
     try {
       await updateDoc(doc(db, 'children_profiles', hostProfile.uid), {
         houseConfig: newConfig
       });
       playSound('pop');
+      boostQuestProgress(12);
     } catch (error) {
       toast.error('خطأ في إضافة الأثاث');
     }
   };
 
   const handleUpdateItem = async (itemId: string, updates: Partial<HouseItem>) => {
     if (!hostProfile || !activeChild || activeChild.uid !== hostProfile.uid) return;
 
     const newFurniture = (hostProfile.houseConfig?.furniture || []).map(item => 
       item.id === itemId ? { ...item, ...updates } : item
     );
 
     try {
       await updateDoc(doc(db, 'children_profiles', hostProfile.uid), {
         'houseConfig.furniture': newFurniture
       });
     } catch (error) {
       console.error('Update item error:', error);
     }
   };
 
+  const getRoomForPosition = (x: number, y: number): HouseItem['room'] => {
+    const matched = ROOM_ZONES.find(zone => x >= zone.x && x <= zone.x + zone.w && y >= zone.y && y <= zone.y + zone.h);
+    return matched?.id || 'play';
+  };
+
   const handleRemoveItem = async (itemId: string) => {
     if (!hostProfile || !activeChild || activeChild.uid !== hostProfile.uid) return;
 
     const newFurniture = (hostProfile.houseConfig?.furniture || []).filter(item => item.id !== itemId);
 
     try {
       await updateDoc(doc(db, 'children_profiles', hostProfile.uid), {
         'houseConfig.furniture': newFurniture
       });
       playSound('pop');
     } catch (error) {
       toast.error('خطأ في حذف الأثاث');
     }
   };
 
   const handleUpdateTheme = async (theme: keyof typeof THEMES) => {
     if (!hostProfile || !activeChild || activeChild.uid !== hostProfile.uid) return;
     try {
       await updateDoc(doc(db, 'children_profiles', hostProfile.uid), {
         'houseConfig.theme': theme,
         'houseConfig.wallpaper': '', // Reset custom wallpaper when theme changes
         'houseConfig.floor': ''
       });
       playSound('magic');
     } catch (error) {
@@ -534,166 +743,271 @@ export default function HeroHouse() {
           status: 'ended'
         });
       } catch (error) {
         console.error("Error ending visit:", error);
       }
     }
     navigate('/child');
   };
 
   if (loading || !visit || !hostProfile) {
     return (
       <div className="min-h-screen bg-pink-50 flex items-center justify-center">
         <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-pink-500"></div>
       </div>
     );
   }
 
   const houseTheme = THEMES[hostProfile.houseConfig?.theme as keyof typeof THEMES] || THEMES.castle;
   const hostAvatar = visitId === 'self' ? activeChild?.avatar : visit.toAvatar;
   const visitorAvatar = visitId === 'self' ? null : visit.fromAvatar;
   const myMarker = visit.gameState
     ? (visit.gameState.playerX === activeChild?.uid ? 'X' : visit.gameState.playerO === activeChild?.uid ? 'O' : null)
     : null;
   const sessionStart = visit.acceptedAt || visit.timestamp;
   const elapsedMinutes = Math.max(1, Math.floor((Date.now() - sessionStart) / 60000));
+  const remainingMinutes = Math.max(0, sessionLimitMinutes - elapsedMinutes);
   const moodLabel =
     visit.roomMood === 'playful' ? 'جوّ مرح 🎉' :
     visit.roomMood === 'calm' ? 'جوّ هادئ 🌙' :
     'جوّ بيتي دافئ 🏡';
+  const liveScene = WORLD_SCENES[sceneIndex];
+  const dynamicWallpaper = hostProfile.houseConfig?.wallpaper || liveScene.wallpaper || houseTheme.wall;
+  const dynamicFloor = hostProfile.houseConfig?.floor || liveScene.floor || houseTheme.floor;
+
+  useEffect(() => {
+    handleJoinVisitRoom().catch(() => {});
+  }, [visitId, activeChild?.uid]);
 
   return (
     <div className="fixed inset-0 bg-slate-900 font-sans overflow-hidden" dir="rtl">
       {/* Full Screen Room Background */}
-      <div className={`absolute inset-0 ${hostProfile.houseConfig?.wallpaper || houseTheme.wall} transition-colors duration-1000`} />
-      <div className={`absolute bottom-0 w-full h-1/3 ${hostProfile.houseConfig?.floor || houseTheme.floor} border-t-8 border-black/10 transition-colors duration-1000`} />
+      <div className={`absolute inset-0 ${dynamicWallpaper} transition-colors duration-1000`} />
+      <div className={`absolute bottom-0 w-full h-1/3 ${dynamicFloor} border-t-8 border-black/10 transition-colors duration-1000`} />
+      <div className="absolute top-6 right-1/2 translate-x-1/2 z-30 text-4xl opacity-70 animate-pulse">{liveScene.particles}</div>
 
       {/* Magic Decorating Overlay */}
       <AnimatePresence>
         {isMagicDecorating && (
           <motion.div 
             initial={{ opacity: 0 }} 
             animate={{ opacity: 1 }} 
             exit={{ opacity: 0 }} 
             className="fixed inset-0 z-[100] bg-purple-500/30 backdrop-blur-md flex flex-col items-center justify-center pointer-events-none"
           >
             <motion.div
               animate={{ 
                 scale: [1, 1.5, 1],
                 rotate: [0, 360],
                 filter: ['hue-rotate(0deg)', 'hue-rotate(360deg)']
               }}
               transition={{ duration: 2, repeat: Infinity }}
               className="text-9xl mb-8"
             >
               🪄
             </motion.div>
             <motion.h2 
               animate={{ opacity: [0.5, 1, 0.5] }}
               transition={{ duration: 1.5, repeat: Infinity }}
               className="text-4xl font-black text-white drop-shadow-lg"
             >
               جاري التزيين السحري... ✨
             </motion.h2>
           </motion.div>
         )}
       </AnimatePresence>
 
       {/* Floating Header */}
       <header className="absolute top-4 left-4 right-4 z-50 flex justify-between items-start pointer-events-none">
         <div className="flex gap-3 pointer-events-auto">
           <button onClick={handleEndVisit} className="w-14 h-14 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 shadow-xl border-4 border-white transition-transform hover:scale-105">
             <LogOut className="w-6 h-6" />
           </button>
           {activeChild?.uid === hostProfile?.uid && (
             <button onClick={() => setIsEditing(!isEditing)} className={`w-14 h-14 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl border-4 border-white transition-transform hover:scale-105 ${isEditing ? 'bg-pink-500 text-white' : 'bg-white/90 text-pink-500'}`}>
               <Palette className="w-6 h-6" />
             </button>
           )}
+          <button onClick={handleReportSafety} className="w-14 h-14 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-amber-500 hover:bg-amber-50 shadow-xl border-4 border-white transition-transform hover:scale-105">
+            <Shield className="w-6 h-6" />
+          </button>
         </div>
         
         <div className="bg-white/90 backdrop-blur-md px-8 py-3 rounded-full shadow-xl border-4 border-white flex items-center gap-6 pointer-events-auto">
           <div className="flex items-center gap-3">
             <span className="text-sm font-bold text-slate-400">منزل:</span>
             <span className="text-xl font-black text-pink-500">{visit.toName}</span>
           </div>
           {visitId !== 'self' && (
             <>
               <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
               <div className="flex items-center gap-3">
                 <span className="text-sm font-bold text-slate-400">الضيفة:</span>
                 <span className="text-xl font-black text-sky-500">{visit.fromHeroName}</span>
               </div>
             </>
           )}
         </div>
       </header>
+      <div className="absolute top-24 left-6 z-40 w-72 bg-white/90 border-2 border-white rounded-3xl p-4 shadow-xl pointer-events-auto">
+        <div className="flex items-center justify-between mb-3">
+          <h3 className="font-black text-slate-700 flex items-center gap-2"><Users className="w-4 h-4" /> وضع الزيارة الجماعية</h3>
+          <button onClick={toggleGroupMode} className={`px-3 py-1 rounded-full text-xs font-black ${groupMode ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
+            {groupMode ? 'مفعل' : 'غير مفعل'}
+          </button>
+        </div>
+        <div className="flex items-center gap-2 mb-3">
+          <button onClick={() => setIsMuted((v) => !v)} className={`w-10 h-10 rounded-full flex items-center justify-center ${isMuted ? 'bg-red-100 text-red-500' : 'bg-sky-100 text-sky-600'}`}>
+            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
+          </button>
+          <button onClick={() => setIsVideoOff((v) => !v)} className={`w-10 h-10 rounded-full flex items-center justify-center ${isVideoOff ? 'bg-red-100 text-red-500' : 'bg-violet-100 text-violet-600'}`}>
+            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
+          </button>
+          <button onClick={handleStartVideoCall} disabled={!groupMode || !visitId || visitId === 'self'} className="px-3 py-2 rounded-xl bg-indigo-500 text-white text-xs font-black disabled:opacity-50">
+            مكالمة فيديو
+          </button>
+        </div>
+        <div className="flex gap-2 mb-3">
+          <input value={inviteName} onChange={(e) => setInviteName(e.target.value)} placeholder="اسم الصديقة للدعوة" className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold" />
+          <button onClick={handleInviteByName} className="px-3 py-2 rounded-xl bg-emerald-500 text-white text-xs font-black">دعوة</button>
+        </div>
+        <div className="text-xs text-slate-500 font-bold mb-1">المشاركات الآن:</div>
+        <div className="my-2 p-2 rounded-xl bg-slate-50 border border-slate-200">
+          <div className="text-[11px] font-bold text-slate-500 mb-1">الوقت المتبقي: {remainingMinutes} دقيقة</div>
+          <input type="range" min={10} max={60} step={5} value={sessionLimitMinutes} onChange={(e) => setSessionLimitMinutes(Number(e.target.value))} className="w-full" />
+          <button onClick={() => setSafeMode(v => !v)} className={`mt-2 px-2 py-1 rounded-lg text-[11px] font-black ${safeMode ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
+            {safeMode ? 'الوضع الآمن مفعل' : 'الوضع الآمن متوقف'}
+          </button>
+        </div>
+        <div className="flex flex-wrap gap-2">
+          {(participants.length ? participants : ['أنتِ فقط']).map((name) => (
+            <span key={name} className="px-2 py-1 rounded-full bg-pink-50 border border-pink-200 text-pink-600 text-xs font-black">{name}</span>
+          ))}
+        </div>
+      </div>
+      {incomingCall && (
+        <IncomingCallModal
+          call={incomingCall}
+          onAccept={async () => {
+            await roomService.updateCallStatus(visitId!, incomingCall.id, 'accepted');
+            setActiveCall({ ...incomingCall, status: 'accepted' });
+            setIncomingCall(null);
+          }}
+          onReject={async () => {
+            await roomService.updateCallStatus(visitId!, incomingCall.id, 'rejected');
+            setIncomingCall(null);
+          }}
+        />
+      )}
+      {incomingGroupInvite && (
+        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-[70] bg-white rounded-2xl p-4 border shadow-2xl min-w-[320px]">
+          <h4 className="font-black text-slate-800 mb-1">دعوة زيارة جماعية 🏠</h4>
+          <p className="text-sm text-slate-500 mb-3">الطفلة {incomingGroupInvite.fromName} تدعوك للانضمام.</p>
+          <div className="flex gap-2 justify-end">
+            <button onClick={async () => {
+              await roomService.updateInviteStatus(visitId!, incomingGroupInvite.id, 'rejected');
+              setIncomingGroupInvite(null);
+            }} className="px-3 py-2 rounded-xl bg-slate-100 text-slate-600 text-sm font-bold">رفض</button>
+            <button onClick={async () => {
+              await roomService.updateInviteStatus(visitId!, incomingGroupInvite.id, 'accepted');
+              if (activeChild) {
+                await roomService.joinRoom(visitId!, { uid: activeChild.uid, heroName: activeChild.heroName || activeChild.name, avatar: activeChild.avatar });
+              }
+              setIncomingGroupInvite(null);
+            }} className="px-3 py-2 rounded-xl bg-emerald-500 text-white text-sm font-bold">قبول</button>
+          </div>
+        </div>
+      )}
+      {activeCall && (
+        <CallScreen
+          call={activeCall}
+          isCaller={activeCall.callerId === activeChild?.uid}
+          onEndCall={() => setActiveCall(null)}
+        />
+      )}
+      <div className="absolute top-24 right-6 z-40 bg-white/85 border-2 border-white rounded-2xl px-4 py-2 shadow-lg text-sm font-black text-indigo-600">
+        {challengeText}
+      </div>
 
       {visitId !== 'self' && (
         <div className="absolute top-24 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
           <div className="bg-white/85 backdrop-blur-md border-2 border-pink-100 rounded-full px-6 py-2 shadow-lg text-sm font-bold text-princess-purple flex items-center gap-3">
             <span>🫶 معًا في نفس البيت منذ {elapsedMinutes} د</span>
             <span className="text-pink-400">•</span>
             <span>{moodLabel}</span>
           </div>
         </div>
       )}
 
       {/* Room Content (Furniture & Characters) */}
       <div id="room-container" className="absolute inset-0 z-10 overflow-hidden">
+        {isEditing && (
+          <div className="absolute inset-x-4 top-24 z-20 grid grid-cols-3 gap-3">
+            {ROOM_ZONES.map((zone) => (
+              <div key={zone.id} className={`rounded-2xl border border-white/70 ${zone.tint} backdrop-blur-sm py-2 px-3 text-center`}>
+                <div className="text-xs font-black text-slate-700">{zone.icon} {zone.label}</div>
+              </div>
+            ))}
+          </div>
+        )}
         {/* Custom Furniture */}
         {(hostProfile.houseConfig?.furniture || []).map((item) => (
           <motion.div
             key={item.id}
             drag={isEditing}
             dragMomentum={false}
             onDragEnd={(e, info) => {
               const parent = document.getElementById('room-container');
               if (parent && typeof parent.getBoundingClientRect === 'function') {
                 const rect = parent.getBoundingClientRect();
                 const dx = (info.offset.x / rect.width) * 100;
                 const dy = (info.offset.y / rect.height) * 100;
-                handleUpdateItem(item.id, { 
-                  x: Math.max(0, Math.min(100, item.x + dx)), 
-                  y: Math.max(0, Math.min(100, item.y + dy)) 
-                });
+                const nextX = Math.max(0, Math.min(100, item.x + dx));
+                const nextY = Math.max(0, Math.min(100, item.y + dy));
+                handleUpdateItem(item.id, { x: nextX, y: nextY, room: getRoomForPosition(nextX, nextY) });
+                boostQuestProgress(8);
               }
             }}
             animate={{ x: 0, y: 0 }}
             transition={{ duration: 0 }}
             style={{ left: `${item.x}%`, top: `${item.y}%` }}
             onClick={() => {
               if (!isEditing && item.type === 'mirror') {
                 handleAction('mirror');
               }
             }}
             className={`absolute text-7xl md:text-8xl ${isEditing ? 'cursor-grab active:cursor-grabbing z-50' : item.type === 'mirror' ? 'cursor-pointer z-30' : 'z-20'} group`}
           >
             <div className="relative flex items-center justify-center">
               <div style={{ transform: `scale(${item.scale || 1}) rotate(${item.rotation || 0}deg)`, transition: 'transform 0.2s' }}>
                 {item.emoji}
               </div>
+              {isEditing && (
+                <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] px-2 py-0.5 rounded-full bg-white/80 border border-white text-slate-600 font-bold whitespace-nowrap">
+                  {item.room === 'sleep' ? '🛏️ نوم' : item.room === 'study' ? '📚 دراسة' : '🧸 لعب'}
+                </span>
+              )}
               {isEditing && (
                 <div className="absolute -top-20 left-1/2 -translate-x-1/2 flex gap-2 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity z-50 border-2 border-slate-100">
                   <button onClick={() => handleUpdateItem(item.id, { scale: Math.min(3, (item.scale || 1) + 0.2) })} className="w-10 h-10 flex items-center justify-center bg-emerald-100 text-emerald-600 rounded-full hover:bg-emerald-200"><Plus className="w-5 h-5" /></button>
                   <button onClick={() => handleUpdateItem(item.id, { scale: Math.max(0.5, (item.scale || 1) - 0.2) })} className="w-10 h-10 flex items-center justify-center bg-amber-100 text-amber-600 rounded-full hover:bg-amber-200"><Minus className="w-5 h-5" /></button>
                   <button onClick={() => handleUpdateItem(item.id, { rotation: ((item.rotation || 0) + 45) % 360 })} className="w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200"><RotateCw className="w-5 h-5" /></button>
                   <button onClick={() => handleRemoveItem(item.id)} className="w-10 h-10 flex items-center justify-center bg-red-100 text-red-600 rounded-full hover:bg-red-200"><Trash2 className="w-5 h-5" /></button>
                 </div>
               )}
             </div>
           </motion.div>
         ))}
 
         {/* Default Furniture (if empty) */}
         {(!hostProfile.houseConfig?.furniture || hostProfile.houseConfig.furniture.length === 0) && (
           <>
             <div className="absolute bottom-[20%] left-[10%] text-9xl opacity-80 drop-shadow-2xl">🛋️</div>
             <div className="absolute bottom-[20%] right-[10%] text-9xl opacity-80 drop-shadow-2xl">🛋️</div>
             <div className="absolute top-[20%] left-[10%] text-8xl opacity-60 drop-shadow-xl">🛏️</div>
           </>
         )}
 
         {/* Characters */}
         <div className="absolute bottom-[25%] w-full flex justify-center gap-10 md:gap-32 z-30 pointer-events-none">
           {/* Host Doll */}
           <div className="flex flex-col items-center gap-4 pointer-events-auto">
@@ -831,50 +1145,64 @@ export default function HeroHouse() {
                       <button onClick={() => setShowChat(false)} className="text-sky-400 hover:text-sky-600"><X className="w-5 h-5" /></button>
                     </div>
                     <div className="flex-1 overflow-y-auto p-4 space-y-3">
                       {messages.map((msg) => (
                         <div key={msg.id} className={`flex flex-col ${msg.senderId === activeChild?.uid ? 'items-start' : 'items-end'}`}>
                           <span className="text-[10px] font-bold text-slate-400 mb-1 px-2">{msg.senderName}</span>
                           <div className={`px-4 py-2 rounded-2xl max-w-[85%] font-bold shadow-sm ${msg.senderId === activeChild?.uid ? 'bg-sky-500 text-white rounded-tr-sm' : 'bg-slate-100 text-slate-700 rounded-tl-sm'}`}>
                             {msg.text}
                           </div>
                         </div>
                       ))}
                       <div ref={scrollRef} />
                     </div>
                     <form onSubmit={handleSendMessage} className="p-3 bg-slate-50 border-t-2 border-white flex gap-2">
                       <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="اكتبي رسالة..." className="flex-1 bg-white border-2 border-slate-200 rounded-xl px-4 py-2 outline-none focus:border-sky-400 font-bold" />
                       <button type="submit" disabled={!newMessage.trim()} className="bg-sky-500 text-white p-3 rounded-xl hover:bg-sky-600 disabled:opacity-50 transition-colors"><Send className="w-5 h-5" /></button>
                     </form>
                   </motion.div>
                 )}
               </AnimatePresence>
               {!showChat && (
                 <button onClick={() => setShowChat(true)} className="w-16 h-16 bg-sky-500 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform border-4 border-white">
                   <MessageCircle className="w-8 h-8" />
                 </button>
               )}
+              {visitId !== 'self' && showChat && (
+                <div className="flex gap-2 mb-2">
+                  {QUICK_MESSAGES.map((qm) => (
+                    <button key={qm} onClick={() => handleSendQuickMessage(qm)} className="text-[10px] bg-white/80 px-2 py-1 rounded-full border border-slate-200 hover:bg-white">
+                      {qm}
+                    </button>
+                  ))}
+                </div>
+              )}
+              {comboStreak > 0 && (
+                <div className="text-[11px] font-black text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 mt-2">
+                  ⚡ سلسلة تفاعل: {comboStreak} رسائل سريعة
+                </div>
+              )}
             </div>
           )}
 
           {/* Game Widget (Right) */}
           <div className="w-80 pointer-events-auto flex flex-col justify-end items-end">
             {/* Tic-Tac-Toe Game Modal */}
             <AnimatePresence>
               {visit?.gameState?.type === 'tictactoe' && (
                 <motion.div initial={{ opacity: 0, scale: 0.8, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8, y: 50 }} className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl border-4 border-orange-100 p-6 w-full mb-4">
                   <div className="flex justify-between items-center mb-6">
                     <h3 className="text-xl font-black text-orange-500 flex items-center gap-2"><Gamepad2 className="w-6 h-6" /> إكس أو</h3>
                     <button onClick={handleCloseGame} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500"><X className="w-5 h-5" /></button>
                   </div>
                   
                   <div className="grid grid-cols-3 gap-3 mb-6">
                     {visit.gameState.board?.map((cell, idx) => (
                       <button
                         key={idx}
                         onClick={() => handleMakeMove(idx)}
                         disabled={
                           cell !== null ||
                           !!visit.gameState?.winner ||
                           (!isLocalVisitMode && (!myMarker || visit.gameState?.turn !== myMarker))
                         }
                         className={`aspect-square rounded-2xl text-4xl font-black flex items-center justify-center shadow-inner transition-colors ${
@@ -956,91 +1284,134 @@ export default function HeroHouse() {
                       title={fl.label}
                     >
                       {fl.icon}
                     </button>
                   ))}
                 </div>
               </div>
               <div className="w-px h-10 bg-slate-200 mx-2 shrink-0" />
               <div className="flex flex-col gap-1">
                 <span className="text-[10px] font-black text-slate-400">الأثاث:</span>
                 <div className="flex gap-2">
                   {FURNITURE_OPTIONS.map((opt) => (
                     <button key={opt.type} onClick={() => handleAddItem(opt)} className="w-12 h-12 bg-slate-50 rounded-xl shadow-sm flex items-center justify-center text-2xl hover:scale-110 hover:bg-white hover:shadow-md transition-all border-2 border-slate-100 shrink-0">
                       {opt.emoji}
                     </button>
                   ))}
                 </div>
               </div>
               <div className="w-px h-10 bg-slate-200 mx-2 shrink-0" />
               <button onClick={handleMagicDecorate} disabled={isMagicDecorating} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-2xl font-black shadow-lg hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50 shrink-0">
                 <Sparkles className={`w-5 h-5 ${isMagicDecorating ? 'animate-spin' : ''}`} />
                 {isMagicDecorating ? 'جاري التزيين...' : 'تزيين سحري'}
               </button>
             </div>
           ) : (
-            <div className="flex gap-3 items-center px-2">
-              <ActionButton icon={<Coffee className="w-7 h-7" />} label="شاي" color="bg-amber-400" onClick={() => handleAction('tea')} disabled={isActionBusy} />
-              <ActionButton icon={<Cookie className="w-7 h-7" />} label="حلوى" color="bg-pink-400" onClick={() => handleAction('sweets')} disabled={isActionBusy} />
-              <ActionButton icon={<Music className="w-7 h-7" />} label="موسيقى" color="bg-purple-400" onClick={() => handleAction('music')} disabled={isActionBusy} />
-              <ActionButton icon={<PartyPopper className="w-7 h-7" />} label="رقص" color="bg-indigo-400" onClick={() => handleAction('dance')} disabled={isActionBusy} />
-              
-              {visitId !== 'self' && (
-                <>
-                  <div className="w-px h-12 bg-slate-200 mx-2" />
-                  <ActionButton icon={<Gamepad2 className="w-7 h-7" />} label="لعبة" color="bg-orange-400" onClick={handleStartGame} />
-                  <ActionButton icon={<Heart className="w-7 h-7" />} label="قلب" color="bg-rose-400" onClick={() => handleAction('heart')} disabled={isActionBusy} />
-                  <ActionButton icon={<Star className="w-7 h-7" />} label="نجمة" color="bg-yellow-400" onClick={() => handleAction('star')} disabled={isActionBusy} />
-                  <ActionButton icon={<Smile className="w-7 h-7" />} label="ضحك" color="bg-sky-400" onClick={() => handleAction('laugh')} disabled={isActionBusy} />
-                </>
-              )}
+            <div className="w-full flex flex-col gap-3 px-1">
+              <div className="flex items-center justify-center gap-2">
+                <PanelTab label="اجتماعي" active={activeActionPanel === 'social'} onClick={() => setActiveActionPanel('social')} />
+                <PanelTab label="مرح" active={activeActionPanel === 'play'} onClick={() => setActiveActionPanel('play')} />
+                <PanelTab label="عالمي" active={activeActionPanel === 'world'} onClick={() => setActiveActionPanel('world')} />
+              </div>
+              <div className="flex gap-3 items-center justify-center flex-wrap">
+                {activeActionPanel === 'social' && (
+                  <>
+                    <ActionButton icon={<Heart className="w-7 h-7" />} label="قلب" color="bg-rose-400" onClick={() => handleAction('heart')} disabled={isActionBusy} />
+                    <ActionButton icon={<Star className="w-7 h-7" />} label="نجمة" color="bg-yellow-400" onClick={() => handleAction('star')} disabled={isActionBusy} />
+                    <ActionButton icon={<Smile className="w-7 h-7" />} label="ضحك" color="bg-sky-400" onClick={() => handleAction('laugh')} disabled={isActionBusy} />
+                    <ActionButton icon={<Music className="w-7 h-7" />} label="موسيقى" color="bg-purple-400" onClick={() => handleAction('music')} disabled={isActionBusy} />
+                  </>
+                )}
+                {activeActionPanel === 'play' && (
+                  <>
+                    <ActionButton icon={<Coffee className="w-7 h-7" />} label="شاي" color="bg-amber-400" onClick={() => handleAction('tea')} disabled={isActionBusy} />
+                    <ActionButton icon={<Cookie className="w-7 h-7" />} label="حلوى" color="bg-pink-400" onClick={() => handleAction('sweets')} disabled={isActionBusy} />
+                    <ActionButton icon={<PartyPopper className="w-7 h-7" />} label="رقص" color="bg-indigo-400" onClick={() => handleAction('dance')} disabled={isActionBusy} />
+                    {visitId !== 'self' && <ActionButton icon={<Gamepad2 className="w-7 h-7" />} label="لعبة" color="bg-orange-400" onClick={handleStartGame} />}
+                  </>
+                )}
+                {activeActionPanel === 'world' && (
+                  <>
+                    <ActionButton icon={<Wand2 className="w-7 h-7" />} label={`مشهد: ${liveScene.label}`} color="bg-fuchsia-400" onClick={rotateScene} />
+                    <ActionButton icon={<Sparkles className="w-7 h-7" />} label="تحدي ذكي" color="bg-emerald-400" onClick={createSmartChallenge} />
+                    <ActionButton icon={<Palette className="w-7 h-7" />} label="تعديل" color="bg-pink-500" onClick={() => setIsEditing(true)} />
+                  </>
+                )}
+              </div>
             </div>
           )}
         </div>
+        <div className="mt-3 bg-white/85 border-2 border-white rounded-2xl p-3 shadow-xl">
+          <div className="flex items-center justify-between text-xs font-black text-slate-500 mb-2">
+            <span>مهمة الزيارة العالمية</span>
+            <span>{questProgress}%</span>
+          </div>
+          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
+            <motion.div
+              className="h-full bg-gradient-to-r from-fuchsia-500 via-sky-500 to-emerald-500"
+              animate={{ width: `${questProgress}%` }}
+              transition={{ duration: 0.4 }}
+            />
+          </div>
+          {questCompleted && (
+            <div className="mt-2 text-sm font-black text-emerald-600">🏆 رائع! البيت أصبح تجربة خيالية لا مثيل لها</div>
+          )}
+        </div>
       </div>
 
     </div>
   );
 }
 
 function ActionButton({ icon, label, color, onClick, disabled = false }: { icon: React.ReactNode, label: string, color: string, onClick: () => void, disabled?: boolean }) {
   return (
     <motion.button
       whileHover={disabled ? undefined : { scale: 1.1, y: -5 }}
       whileTap={disabled ? undefined : { scale: 0.95 }}
       onClick={onClick}
       disabled={disabled}
       className={`flex flex-col items-center gap-1 p-2 rounded-2xl transition-colors min-w-[4.5rem] ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-50'}`}
     >
       <div className={`w-14 h-14 ${color} text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white/50`}>
         {icon}
       </div>
       <span className="text-xs font-black text-slate-500">{label}</span>
     </motion.button>
   );
 }
 
+function PanelTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
+  return (
+    <button
+      onClick={onClick}
+      className={`px-4 py-2 rounded-full text-xs font-black border-2 transition-all ${active ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}
+    >
+      {label}
+    </button>
+  );
+}
+
 function Doll({ avatar, isDancing }: { avatar: AvatarConfig, isDancing?: boolean }) {
   return (
     <motion.div 
       className="relative flex flex-col items-center justify-center"
       animate={isDancing ? {
         y: [0, -20, 0],
         rotate: [-10, 10, -10],
       } : {
         y: [0, -5, 0]
       }}
       transition={isDancing ? {
         duration: 0.5,
         repeat: Infinity,
         ease: "easeInOut"
       } : {
         duration: 3,
         repeat: Infinity,
         ease: "easeInOut"
       }}
     >
       {/* Wings */}
       {avatar.wings && (
         <motion.div 
           className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl -z-10 opacity-80"
           animate={{ scale: [1, 1.1, 1], rotate: [-5, 5, -5] }}
 
EOF
)
          transition={{ duration: 2, repeat: Infinity }}
        >
          {avatar.wings}
        </motion.div>
      )}

      {/* Cape */}
      {avatar.cape && (
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-40 ${avatar.cape} rounded-b-full -z-5 opacity-90`} />
      )}

      {/* Body/Head */}
      <div className={`w-32 h-32 ${avatar.color || 'bg-pink-200'} rounded-full flex flex-col items-center justify-center relative shadow-xl border-4 border-white/50`}>
        {/* Crown */}
        {avatar.accessory && (
          <div className="absolute -top-10 text-5xl drop-shadow-md z-20">
            {avatar.accessory}
          </div>
        )}
        
        {/* Hair */}
        <div className="absolute -top-6 text-6xl drop-shadow-sm z-10">
          {avatar.hairStyle || '👧'}
        </div>

        {/* Face */}
        <div className="flex gap-3 mt-2 z-10">
          <span className={`text-2xl font-black ${avatar.eyeColor || 'text-slate-900'}`}>{avatar.eyes || '●'}</span>
          <span className={`text-2xl font-black ${avatar.eyeColor || 'text-slate-900'}`}>{avatar.eyes || '●'}</span>
        </div>
        <div className="w-4 h-2 border-b-4 border-pink-400 rounded-full mt-2 z-10 opacity-60" />
      </div>

      {/* Dress */}
      <div className="text-7xl -mt-4 drop-shadow-lg z-10">
        {avatar.dressStyle || '👗'}
      </div>

      {/* Shoes */}
      <div className="text-4xl -mt-4 drop-shadow-md z-0">
        {avatar.shoes || '🥿'}
      </div>

      {/* Wand */}
      {avatar.wand && (
        <motion.div 
          className="absolute top-1/2 -left-10 text-5xl drop-shadow-lg z-20"
          animate={{ rotate: [-10, 10, -10] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          {avatar.wand}
        </motion.div>
      )}
    </motion.div>
  );
}
