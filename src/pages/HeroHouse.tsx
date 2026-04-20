import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Send, LogOut, Sparkles, MessageCircle, Star, Heart, Shield, Users, Coffee, Cookie, Music, PartyPopper, Video, Mic, MicOff, VideoOff, Camera, Palette, Wand2, Plus, Trash2, Gamepad2, X, Smile, Minus, RotateCw, ChevronUp, ChevronDown, ArrowLeft } from 'lucide-react';
import { db } from '../firebase';
import { doc, onSnapshot, collection, addDoc, query, where, orderBy, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { ChildProfile, VisitRequest, ChatMessage, AvatarConfig, HouseItem, HouseConfig } from '../types';
import { toast } from 'sonner';
import { GoogleGenAI } from '@google/genai';

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
        timestamp: Date.now()
      });
      setHostProfile(currentChild);
      setLoading(false);
      return;
    }

    if (visitId.startsWith('view_')) {
      const hostUid = visitId.replace('view_', '');
      setVisit({
        id: visitId,
        fromId: currentChild.uid,
        fromName: currentChild.name,
        fromHeroName: currentChild.heroName,
        fromAvatar: currentChild.avatar,
        toId: hostUid,
        toName: 'صديقتكِ',
        status: 'accepted',
        timestamp: Date.now()
      });
      
      const fetchHost = async () => {
        const hDoc = await getDoc(doc(db, 'children_profiles', hostUid));
        if (hDoc.exists()) {
          const data = hDoc.data() as ChildProfile;
          setHostProfile(data);
          setVisit(prev => prev ? { ...prev, toName: data.heroName || data.name, toAvatar: data.avatar } : null);
        }
        setLoading(false);
      };
      fetchHost();
      return;
    }

    const unsubscribeVisit = onSnapshot(doc(db, 'visit_requests', visitId), async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as VisitRequest;
        
        // Handle invalid documents (e.g. created by merge without full data)
        if (!data.toId || !data.fromId) {
          console.error('HeroHouse: Invalid visit request data', data);
          toast.error('بيانات الزيارة غير مكتملة أو تالفة');
          navigate('/child');
          return;
        }

        setVisit(data);
        
        // Fetch host profile for house config
        if (!hostProfile || hostProfile.uid !== data.toId) {
          const hDoc = await getDoc(doc(db, 'children_profiles', data.toId));
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

    const q = query(
      collection(db, 'chat_messages'),
      where('visitId', '==', visitId),
      orderBy('timestamp', 'asc')
    );
    const unsubscribeChat = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage));
      setMessages(msgs);
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }, (err) => handleFirestoreError(err, OperationType.GET, 'chat_messages'));

    return () => {
      unsubscribeVisit();
      unsubscribeChat();
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

    try {
      await addDoc(collection(db, 'chat_messages'), {
        visitId,
        senderId: activeChild.uid,
        senderName: activeChild.heroName || activeChild.name,
        text: newMessage,
        timestamp: Date.now()
      });
      setNewMessage('');
      playSound('pop');
    } catch (error) {
      toast.error('حدث خطأ أثناء إرسال الرسالة');
    }
  };

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
      clearActionAfterDelay();
      return;
    }

    setIsActionBusy(true);
    try {
      await updateDoc(doc(db, 'visit_requests', visitId), {
        currentAction: actionData
      });
      
      playSound('magic');
      
      setTimeout(async () => {
        // Only reset if it's still the same action
        const currentDoc = await getDoc(doc(db, 'visit_requests', visitId));
        if (currentDoc.exists() && currentDoc.data().currentAction?.timestamp === actionData.timestamp) {
          await updateDoc(doc(db, 'visit_requests', visitId), {
            'currentAction.type': 'none'
          });
        }
      }, 5000);
    } catch (error) {
      // Graceful fallback to local interaction if remote update fails
      setVisit(prev => prev ? { ...prev, currentAction: actionData } as VisitRequest : null);
      clearActionAfterDelay();
      toast.error('تعذر مزامنة الحركة الآن، تم تنفيذها محليًا ✨');
    } finally {
      setTimeout(() => setIsActionBusy(false), 300);
    }
  };

  const handleStartGame = async () => {
    if (!visitId || !activeChild || !visit) return;
    const newGameState: VisitRequest['gameState'] = {
      type: 'tictactoe',
      board: Array(9).fill(null),
      turn: 'X',
      winner: null,
      isDraw: false,
      playerX: visit.fromId,
      playerO: visit.toId
    };

    try {
      if (isLocalVisitMode) {
        setVisit(prev => (prev ? { ...prev, gameState: newGameState } : prev));
      } else {
        await updateDoc(doc(db, 'visit_requests', visitId), { gameState: newGameState });
      }
      playSound('pop');
    } catch (error) {
      toast.error('حدث خطأ أثناء بدء اللعبة');
    }
  };

  const handleMakeMove = async (index: number) => {
    if (!visitId || !activeChild || !visit?.gameState || visit.gameState.type !== 'tictactoe') return;
    if (visit.gameState.board[index] || visit.gameState.winner) return;

    const myMarker =
      visit.gameState.playerX === activeChild.uid ? 'X' :
      visit.gameState.playerO === activeChild.uid ? 'O' :
      null;

    if (!isLocalVisitMode && (!myMarker || visit.gameState.turn !== myMarker)) return;

    const newBoard = [...visit.gameState.board];
    newBoard[index] = visit.gameState.turn;

    const winningLines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8],
      [0, 3, 6], [1, 4, 7], [2, 5, 8],
      [0, 4, 8], [2, 4, 6]
    ];

    let winner = null;
    for (const line of winningLines) {
      const [a, b, c] = line;
      if (newBoard[a] && newBoard[a] === newBoard[b] && newBoard[a] === newBoard[c]) {
        winner = newBoard[a];
        break;
      }
    }

    const isDraw = !winner && newBoard.every(cell => cell !== null);
    const nextTurn = visit.gameState.turn === 'X' ? 'O' : 'X';

    try {
      const nextState: VisitRequest['gameState'] = {
        ...visit.gameState,
        board: newBoard,
        turn: nextTurn,
        winner: isDraw ? 'draw' : winner,
        isDraw
      };
      if (isLocalVisitMode) {
        setVisit(prev => (prev ? { ...prev, gameState: nextState } : prev));
      } else {
        await updateDoc(doc(db, 'visit_requests', visitId), { gameState: nextState });
      }
      playSound('pop');
      if (winner) {
        const didIWin = myMarker ? winner === myMarker : winner === 'X';
        toast.success(`فاز ${didIWin ? 'أنتِ' : 'صديقتكِ'}! 🎉`);
        playSound('magic');
      } else if (isDraw) {
        toast.info('تعادل! 🤝');
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء اللعب');
    }
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
      rotation: 0
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
      toast.error('خطأ في تغيير السمة');
    }
  };

  const handleUpdateWallpaper = async (wallpaperClass: string) => {
    if (!hostProfile || !activeChild || activeChild.uid !== hostProfile.uid) return;
    try {
      await updateDoc(doc(db, 'children_profiles', hostProfile.uid), {
        'houseConfig.wallpaper': wallpaperClass
      });
      playSound('magic');
    } catch (error) {
      toast.error('خطأ في تغيير ورق الحائط');
    }
  };

  const handleUpdateFloor = async (floorClass: string) => {
    if (!hostProfile || !activeChild || activeChild.uid !== hostProfile.uid) return;
    try {
      await updateDoc(doc(db, 'children_profiles', hostProfile.uid), {
        'houseConfig.floor': floorClass
      });
      playSound('magic');
    } catch (error) {
      toast.error('خطأ في تغيير الأرضية');
    }
  };

  const handleMagicDecorate = async () => {
    if (!hostProfile || !activeChild || activeChild.uid !== hostProfile.uid) return;
    
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      toast.error('مفتاح API غير متوفر');
      return;
    }

    setIsMagicDecorating(true);
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `
        You are a magical interior designer for a children's app called "Magic Village".
        The host is a hero named "${hostProfile.heroName || hostProfile.name}".
        Suggest a fun, magical room decoration theme based on their name or just a generally awesome theme (like "Magic Forest", "Candy Land", "Starry Night", "Ocean Kingdom").
        Return ONLY a JSON object with this structure:
        {
          "wallpaper": "bg-gradient-to-b from-purple-200 to-pink-100", // A valid tailwind background color or gradient class
          "floor": "bg-amber-100", // A valid tailwind background color class
          "furniture": [
            { "type": "bed", "emoji": "🛏️", "x": 20, "y": 70, "scale": 2, "rotation": 0 },
            { "type": "chair", "emoji": "🪑", "x": 50, "y": 75, "scale": 1.2, "rotation": 0 },
            { "type": "table", "emoji": "🛋️", "x": 70, "y": 80, "scale": 1.5, "rotation": 0 },
            { "type": "plant", "emoji": "🪴", "x": 10, "y": 60, "scale": 1, "rotation": 0 },
            { "type": "toy", "emoji": "🧸", "x": 40, "y": 85, "scale": 1, "rotation": 0 }
          ]
        }
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
        }
      });

      const result = JSON.parse(response.text || '{}');
      
      if (result.wallpaper && result.furniture) {
        const newFurniture = result.furniture.map((f: any) => ({
          ...f,
          id: Math.random().toString(36).substr(2, 9)
        }));

        await updateDoc(doc(db, 'children_profiles', hostProfile.uid), {
          'houseConfig.wallpaper': result.wallpaper,
          'houseConfig.floor': result.floor || 'bg-amber-100',
          'houseConfig.furniture': newFurniture
        });
        toast.success('تم التزيين السحري! ✨');
        playSound('magic');
      }
    } catch (error) {
      console.error("Magic decorate error:", error);
      toast.error('عذراً، السحر لم يكتمل هذه المرة');
    } finally {
      setIsMagicDecorating(false);
    }
  };

  const handleEndVisit = async () => {
    if (visitId !== 'self' && !isLocalVisitMode) {
      try {
        await updateDoc(doc(db, 'visit_requests', visitId), {
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
  const moodLabel =
    visit.roomMood === 'playful' ? 'جوّ مرح 🎉' :
    visit.roomMood === 'calm' ? 'جوّ هادئ 🌙' :
    'جوّ بيتي دافئ 🏡';

  return (
    <div className="fixed inset-0 bg-slate-900 font-sans overflow-hidden" dir="rtl">
      {/* Full Screen Room Background */}
      <div className={`absolute inset-0 ${hostProfile.houseConfig?.wallpaper || houseTheme.wall} transition-colors duration-1000`} />
      <div className={`absolute bottom-0 w-full h-1/3 ${hostProfile.houseConfig?.floor || houseTheme.floor} border-t-8 border-black/10 transition-colors duration-1000`} />

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
                handleUpdateItem(item.id, { 
                  x: Math.max(0, Math.min(100, item.x + dx)), 
                  y: Math.max(0, Math.min(100, item.y + dy)) 
                });
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
            <Doll 
              avatar={hostAvatar || { color: 'bg-pink-200', hairStyle: '👧', dressStyle: '👗', accessory: '🎀' }} 
              isDancing={visit.currentAction?.type === 'dance'}
            />
          </div>

          {/* Visitor Doll */}
          {visitorAvatar && (
            <div className="flex flex-col items-center gap-4 pointer-events-auto">
              <Doll 
                avatar={visitorAvatar} 
                isDancing={visit.currentAction?.type === 'dance'}
              />
            </div>
          )}
        </div>
      </div>

      {/* Action Animations Overlay */}
      <div className="absolute inset-0 pointer-events-none z-40">
        <AnimatePresence>
          {visit.currentAction?.type === 'tea' && (
            <motion.div initial={{ opacity: 0, scale: 0, y: 100 }} animate={{ opacity: 1, scale: 2, y: -50 }} exit={{ opacity: 0, scale: 0 }} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl drop-shadow-2xl">☕✨</motion.div>
          )}
          {visit.currentAction?.type === 'sweets' && (
            <motion.div initial={{ opacity: 0, scale: 0, y: 100 }} animate={{ opacity: 1, scale: 2, y: -50 }} exit={{ opacity: 0, scale: 0 }} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl drop-shadow-2xl">🍰🍬</motion.div>
          )}
          {visit.currentAction?.type === 'juice' && (
            <motion.div initial={{ opacity: 0, scale: 0, y: 100 }} animate={{ opacity: 1, scale: 2, y: -50 }} exit={{ opacity: 0, scale: 0 }} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl drop-shadow-2xl">🍹🍊</motion.div>
          )}
          {visit.currentAction?.type === 'cookies' && (
            <motion.div initial={{ opacity: 0, scale: 0, y: 100 }} animate={{ opacity: 1, scale: 2, y: -50 }} exit={{ opacity: 0, scale: 0 }} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl drop-shadow-2xl">🍪🍪</motion.div>
          )}
          {visit.currentAction?.type === 'fruit' && (
            <motion.div initial={{ opacity: 0, scale: 0, y: 100 }} animate={{ opacity: 1, scale: 2, y: -50 }} exit={{ opacity: 0, scale: 0 }} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl drop-shadow-2xl">🍓🍎</motion.div>
          )}
          {visit.currentAction?.type === 'mirror' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.8 }} 
              className="absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-sm z-50"
            >
              <div className="relative p-8 bg-white/90 rounded-[3rem] shadow-2xl border-8 border-pink-200 flex flex-col items-center gap-6">
                <div className="text-4xl font-black text-pink-500 mb-2">المرآة السحرية ✨</div>
                <div className="w-64 h-64 rounded-full overflow-hidden border-8 border-pink-100 shadow-inner bg-gradient-to-b from-blue-50 to-pink-50 flex items-center justify-center">
                  <Doll avatar={visit.currentAction?.triggeredBy === visit.fromId ? visit.fromAvatar : visit.toAvatar!} />
                </div>
                <p className="text-xl font-bold text-slate-600">تبدين رائعة اليوم! 💖</p>
                <button 
                  onClick={() => handleAction('none')}
                  className="bg-pink-500 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-pink-600 pointer-events-auto"
                >
                  شكراً! ✨
                </button>
              </div>
            </motion.div>
          )}
          {visit.currentAction?.type === 'heart' && (
            <motion.div initial={{ opacity: 0, scale: 0, y: 100 }} animate={{ opacity: 1, scale: 3, y: -100 }} exit={{ opacity: 0, scale: 0 }} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl drop-shadow-2xl">💖</motion.div>
          )}
          {visit.currentAction?.type === 'star' && (
            <motion.div initial={{ opacity: 0, scale: 0, rotate: -180 }} animate={{ opacity: 1, scale: 3, rotate: 0 }} exit={{ opacity: 0, scale: 0, rotate: 180 }} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl drop-shadow-2xl">⭐</motion.div>
          )}
          {visit.currentAction?.type === 'laugh' && (
            <motion.div initial={{ opacity: 0, scale: 0, y: 50 }} animate={{ opacity: 1, scale: 2, y: -50, rotate: [0, -10, 10, -10, 10, 0] }} exit={{ opacity: 0, scale: 0 }} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl drop-shadow-2xl">😂</motion.div>
          )}
          {visit.currentAction?.type === 'wow' && (
            <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 3 }} exit={{ opacity: 0, scale: 0 }} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl drop-shadow-2xl">😲✨</motion.div>
          )}
          {visit.currentAction?.type === 'music' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center">
              {[...Array(15)].map((_, i) => (
                <motion.div key={i} animate={{ y: [-20, -300], x: [0, (i % 2 === 0 ? 150 : -150)], opacity: [0, 1, 0], rotate: [0, 90] }} transition={{ duration: 3, repeat: Infinity, delay: i * 0.2 }} className="absolute text-6xl drop-shadow-xl">🎵</motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating UI Overlay */}
      <div className="absolute inset-0 pointer-events-none z-50 flex flex-col justify-between p-6">
        
        {/* Top Bar */}
        <div className="flex justify-between items-start">
          {/* Back Button & Host Info (Left) */}
          <div className="flex flex-col gap-4 pointer-events-auto">
            <button 
              onClick={() => navigate('/child')}
              className="bg-white/90 backdrop-blur-sm text-sky-600 px-6 py-3 rounded-full font-bold shadow-lg hover:bg-sky-50 transition-colors flex items-center gap-2 border-2 border-sky-100"
            >
              <ArrowLeft className="w-5 h-5" />
              العودة للقرية
            </button>
            
            <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-2xl shadow-lg border-2 border-pink-100 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-pink-200 bg-pink-50 flex items-center justify-center">
                <Doll avatar={hostProfile?.avatar!} />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-500">منزل البطلة</div>
                <div className="font-black text-pink-600">{hostProfile?.heroName || hostProfile?.name}</div>
              </div>
            </div>
          </div>

          {/* Action Menus (Right) */}
          <div className="flex flex-col gap-4 items-end pointer-events-auto w-80">
            {/* Magic Mirror Toggle */}
            {visitId !== 'self' && (
              <button 
                onClick={() => handleAction('mirror')} 
                className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform border-4 border-white bg-white text-purple-500`}
              >
                <Camera className="w-8 h-8" />
              </button>
            )}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex justify-between items-end">
          
          {/* Chat Widget (Left) */}
          {visitId !== 'self' && (
            <div className="w-80 pointer-events-auto flex flex-col justify-end">
              <AnimatePresence>
                {showChat && (
                  <motion.div initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }} className="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-2xl border-4 border-white overflow-hidden flex flex-col h-96 mb-4">
                    <div className="bg-sky-100 p-4 flex justify-between items-center border-b-2 border-white">
                      <h3 className="font-black text-sky-600 flex items-center gap-2"><MessageCircle className="w-5 h-5" /> الدردشة</h3>
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
                          cell === 'X' ? 'bg-orange-100 text-orange-500' : 
                          cell === 'O' ? 'bg-sky-100 text-sky-500' : 
                          'bg-slate-50 hover:bg-slate-100'
                        }`}
                      >
                        {cell}
                      </button>
                    ))}
                  </div>

                  <div className="text-center font-bold text-slate-600 bg-slate-50 py-3 rounded-xl">
                    {visit.gameState.winner ? (
                      visit.gameState.winner === 'draw' ? 'تعادل! 🤝' :
                      visit.gameState.winner === myMarker ? 'لقد فزتِ! 🎉' : 'فازت صديقتك! 👏'
                    ) : (
                      isLocalVisitMode
                        ? `الدور الآن: ${visit.gameState.turn === 'X' ? 'X' : 'O'}`
                        : visit.gameState.turn === myMarker
                          ? 'دوركِ الآن! ✨'
                          : 'انتظري دور صديقتكِ ⏳'
                    )}
                  </div>
                  {(visit.gameState.winner || visit.gameState.winner === 'draw') && (
                    <button onClick={handleStartGame} className="mt-4 w-full bg-orange-500 text-white font-black py-3 rounded-xl shadow-md hover:bg-orange-600">العب مرة أخرى</button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto w-full max-w-4xl px-4">
        <div className="bg-white/90 backdrop-blur-xl p-4 rounded-[2.5rem] shadow-2xl border-4 border-white flex gap-3 items-center justify-center overflow-x-auto hide-scrollbar">
          {isEditing ? (
            <div className="flex gap-4 items-center px-4">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-slate-400">السمات:</span>
                <div className="flex gap-2">
                  {Object.keys(THEMES).map((t) => (
                    <button 
                      key={t} 
                      onClick={() => handleUpdateTheme(t as keyof typeof THEMES)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${hostProfile.houseConfig?.theme === t ? 'border-pink-500 scale-110 shadow-md' : 'border-white'} ${THEMES[t as keyof typeof THEMES].wall}`}
                      title={t}
                    />
                  ))}
                </div>
              </div>
              <div className="w-px h-10 bg-slate-200 mx-2 shrink-0" />
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-slate-400">ورق الحائط:</span>
                <div className="flex gap-2">
                  {WALLPAPER_OPTIONS.map((wp) => (
                    <button 
                      key={wp.id} 
                      onClick={() => handleUpdateWallpaper(wp.class)}
                      className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center text-xs ${hostProfile.houseConfig?.wallpaper === wp.class ? 'border-pink-500 scale-110 shadow-md' : 'border-white'} ${wp.class}`}
                      title={wp.label}
                    >
                      {wp.icon}
                    </button>
                  ))}
                </div>
              </div>
              <div className="w-px h-10 bg-slate-200 mx-2 shrink-0" />
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-slate-400">الأرضية:</span>
                <div className="flex gap-2">
                  {FLOOR_OPTIONS.map((fl) => (
                    <button 
                      key={fl.id} 
                      onClick={() => handleUpdateFloor(fl.class)}
                      className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center text-xs ${hostProfile.houseConfig?.floor === fl.class ? 'border-pink-500 scale-110 shadow-md' : 'border-white'} ${fl.class}`}
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
            <div className="flex gap-3 items-center px-2">
              <ActionButton icon={<Coffee className="w-7 h-7" />} label="شاي" color="bg-amber-400" onClick={() => handleAction('tea')} disabled={isActionBusy} />
              <ActionButton icon={<Cookie className="w-7 h-7" />} label="حلوى" color="bg-pink-400" onClick={() => handleAction('sweets')} disabled={isActionBusy} />
              <ActionButton icon={<Music className="w-7 h-7" />} label="موسيقى" color="bg-purple-400" onClick={() => handleAction('music')} disabled={isActionBusy} />
              <ActionButton icon={<PartyPopper className="w-7 h-7" />} label="رقص" color="bg-indigo-400" onClick={() => handleAction('dance')} disabled={isActionBusy} />
              
              {visitId !== 'self' && (
                <>
                  <div className="w-px h-12 bg-slate-200 mx-2" />
                  <ActionButton icon={<Gamepad2 className="w-7 h-7" />} label="لعبة" color="bg-orange-400" onClick={handleStartGame} />
                  <ActionButton icon={<Heart className="w-7 h-7" />} label="قلب" color="bg-rose-400" onClick={() => handleAction('heart')} disabled={isActionBusy} />
                  <ActionButton icon={<Star className="w-7 h-7" />} label="نجمة" color="bg-yellow-400" onClick={() => handleAction('star')} disabled={isActionBusy} />
                  <ActionButton icon={<Smile className="w-7 h-7" />} label="ضحك" color="bg-sky-400" onClick={() => handleAction('laugh')} disabled={isActionBusy} />
                </>
              )}
            </div>
          )}
        </div>
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
