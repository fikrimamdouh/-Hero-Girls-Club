import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send, LogOut, Camera, Palette, Wand2, Plus, Trash2, Gamepad2,
  X, Minus, RotateCw, Shirt, Save, Check, MessageCircle, Tv2, Music2, VolumeX, Volume2
} from 'lucide-react';
import { db } from '../firebase';
import {
  doc, onSnapshot, collection, addDoc, query, where, orderBy,
  updateDoc, getDoc
} from 'firebase/firestore';
import { ChildProfile, VisitRequest, ChatMessage, AvatarConfig, HouseItem, RoomConfig } from '../types';
import { toast } from 'sonner';
import { GoogleGenAI } from '@google/genai';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';

/* ─── ROOM DEFINITIONS ──────────────────────────────────── */
type RoomId = 'bedroom' | 'living' | 'garden' | 'kitchen';

const ROOMS: Record<RoomId, { label: string; icon: string; wall: string; floor: string; defaultItems: string[] }> = {
  bedroom: {
    label: 'غرفة النوم', icon: '🛏️',
    wall: 'bg-gradient-to-b from-pink-100 to-rose-200',
    floor: 'bg-rose-100',
    defaultItems: ['🛏️', '💡', '🪞']
  },
  living: {
    label: 'الصالة', icon: '🛋️',
    wall: 'bg-gradient-to-b from-amber-50 to-yellow-100',
    floor: 'bg-amber-100',
    defaultItems: ['🛋️', '📺', '🪴']
  },
  garden: {
    label: 'الحديقة', icon: '🌷',
    wall: 'bg-gradient-to-b from-emerald-100 to-teal-200',
    floor: 'bg-emerald-300',
    defaultItems: ['🌳', '🌸', '⛲']
  },
  kitchen: {
    label: 'المطبخ', icon: '🍳',
    wall: 'bg-gradient-to-b from-sky-50 to-cyan-100',
    floor: 'bg-orange-100',
    defaultItems: ['🍳', '🎂', '🫖']
  }
};

/* ─── FURNITURE CATEGORIES ───────────────────────────────── */
const FURNITURE_CATEGORIES = [
  {
    id: 'bedroom', label: 'نوم', icon: '🛏️',
    items: [
      { type: 'bed', emoji: '🛏️' }, { type: 'lamp', emoji: '💡' },
      { type: 'mirror', emoji: '🪞' }, { type: 'clock', emoji: '⏰' },
      { type: 'pillow', emoji: '🛋️' }, { type: 'window', emoji: '🖼️' },
      { type: 'curtain', emoji: '🎐' }, { type: 'teddy', emoji: '🧸' },
    ]
  },
  {
    id: 'living', label: 'صالة', icon: '🛋️',
    items: [
      { type: 'sofa', emoji: '🛋️' }, { type: 'tv', emoji: '📺' },
      { type: 'shelf', emoji: '📚' }, { type: 'plant', emoji: '🪴' },
      { type: 'lamp2', emoji: '🕯️' }, { type: 'vase', emoji: '🫙' },
      { type: 'rug', emoji: '🟫' }, { type: 'chair', emoji: '🪑' },
    ]
  },
  {
    id: 'garden', label: 'حديقة', icon: '🌷',
    items: [
      { type: 'tree', emoji: '🌳' }, { type: 'flower', emoji: '🌸' },
      { type: 'fountain', emoji: '⛲' }, { type: 'mushroom', emoji: '🍄' },
      { type: 'butterfly', emoji: '🦋' }, { type: 'rainbow', emoji: '🌈' },
      { type: 'sun', emoji: '☀️' }, { type: 'cloud', emoji: '🌥️' },
    ]
  },
  {
    id: 'kitchen', label: 'مطبخ', icon: '🍳',
    items: [
      { type: 'stove', emoji: '🍳' }, { type: 'cake', emoji: '🎂' },
      { type: 'tea', emoji: '🫖' }, { type: 'cookie', emoji: '🍪' },
      { type: 'fruit', emoji: '🍓' }, { type: 'utensils', emoji: '🍽️' },
      { type: 'fridge', emoji: '🧊' }, { type: 'bowl', emoji: '🥣' },
    ]
  },
  {
    id: 'toys', label: 'ألعاب', icon: '🎮',
    items: [
      { type: 'bear', emoji: '🧸' }, { type: 'blocks', emoji: '🧩' },
      { type: 'ball', emoji: '⚽' }, { type: 'doll', emoji: '🪆' },
      { type: 'art', emoji: '🎨' }, { type: 'magic', emoji: '🪄' },
      { type: 'robot', emoji: '🤖' }, { type: 'crown', emoji: '👑' },
    ]
  }
];

/* ─── WARDROBE ───────────────────────────────────────────── */
const WARDROBE = {
  dresses: [
    { id: 'd1', emoji: '👗', label: 'فستان أميرة' },
    { id: 'd2', emoji: '🥻', label: 'فستان ساري' },
    { id: 'd3', emoji: '👘', label: 'كيمونو' },
    { id: 'd4', emoji: '🩱', label: 'رياضية' },
    { id: 'd5', emoji: '💃', label: 'فستان رقص' },
    { id: 'd6', emoji: '🧚', label: 'جنية' },
    { id: 'd7', emoji: '🦸‍♀️', label: 'بدلة بطلة' },
    { id: 'd8', emoji: '👸', label: 'ملكة' },
    { id: 'd9', emoji: '🧜‍♀️', label: 'حورية' },
    { id: 'd10', emoji: '🌸', label: 'فستان زهور' },
  ],
  hair: [
    { id: 'h1', emoji: '👧', label: 'شعر قصير' },
    { id: 'h2', emoji: '👩', label: 'شعر طويل' },
    { id: 'h3', emoji: '👩‍🦱', label: 'مجعد' },
    { id: 'h4', emoji: '👩‍🦰', label: 'أحمر' },
    { id: 'h5', emoji: '👩‍🦳', label: 'أبيض' },
    { id: 'h6', emoji: '🧝‍♀️', label: 'جنية' },
    { id: 'h7', emoji: '🧑‍🎤', label: 'فنانة' },
    { id: 'h8', emoji: '👱‍♀️', label: 'أشقر' },
  ],
  accessories: [
    { id: 'a1', emoji: '🎀', label: 'ربطة' },
    { id: 'a2', emoji: '👑', label: 'تاج' },
    { id: 'a3', emoji: '💎', label: 'ألماس' },
    { id: 'a4', emoji: '🌟', label: 'نجمة' },
    { id: 'a5', emoji: '🦋', label: 'فراشة' },
    { id: 'a6', emoji: '🌈', label: 'قوس قزح' },
    { id: 'a7', emoji: '🪄', label: 'عصا سحر' },
    { id: 'a8', emoji: '🌸', label: 'زهرة' },
  ],
  skinColor: [
    { id: 's1', class: 'bg-amber-100', label: 'فاتح جداً' },
    { id: 's2', class: 'bg-amber-200', label: 'فاتح' },
    { id: 's3', class: 'bg-orange-200', label: 'أسمر خفيف' },
    { id: 's4', class: 'bg-orange-300', label: 'أسمر' },
    { id: 's5', class: 'bg-amber-700', label: 'داكن' },
    { id: 's6', class: 'bg-pink-100', label: 'وردي' },
  ]
};

type WardrobeTab = 'dresses' | 'hair' | 'accessories' | 'skinColor';

/* ─── WALLPAPER & FLOOR OPTIONS (kept as-is) ────────────── */
const WALLPAPER_OPTIONS = [
  { id: 'pink-stars', class: 'bg-gradient-to-b from-pink-100 to-rose-200', label: 'نجوم وردية', icon: '⭐' },
  { id: 'blue-clouds', class: 'bg-gradient-to-b from-sky-100 to-blue-200', label: 'غيوم زرقاء', icon: '☁️' },
  { id: 'purple-magic', class: 'bg-gradient-to-b from-purple-100 to-indigo-200', label: 'سحر بنفسجي', icon: '✨' },
  { id: 'green-nature', class: 'bg-gradient-to-b from-emerald-100 to-teal-200', label: 'طبيعة خضراء', icon: '🌿' },
  { id: 'yellow-sun', class: 'bg-gradient-to-b from-amber-50 to-yellow-100', label: 'شمس مشرقة', icon: '☀️' },
  { id: 'night-stars', class: 'bg-gradient-to-b from-slate-900 to-indigo-950', label: 'ليل نجوم', icon: '🌙' },
  { id: 'candy', class: 'bg-gradient-to-b from-rose-100 to-fuchsia-200', label: 'حلوى', icon: '🍬' },
  { id: 'ocean', class: 'bg-gradient-to-b from-cyan-100 to-blue-300', label: 'محيط', icon: '🌊' },
];

const FLOOR_OPTIONS = [
  { id: 'stone', class: 'bg-stone-200', label: 'حجر', icon: '🧱' },
  { id: 'wood', class: 'bg-amber-200', label: 'خشب', icon: '🪵' },
  { id: 'grass', class: 'bg-emerald-200', label: 'عشب', icon: '🌱' },
  { id: 'carpet', class: 'bg-rose-200', label: 'سجاد', icon: '🧶' },
  { id: 'cloud', class: 'bg-white/80', label: 'سحاب', icon: '☁️' },
  { id: 'water', class: 'bg-blue-200', label: 'ماء', icon: '💧' },
  { id: 'sand', class: 'bg-yellow-200', label: 'رمل', icon: '🏖️' },
  { id: 'marble', class: 'bg-slate-100', label: 'رخام', icon: '⬜' },
];

/* ─── Doll component ─────────────────────────────────────── */
function Doll({ avatar, isDancing = false, size = 'md' }: { avatar: AvatarConfig; isDancing?: boolean; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = { sm: 'text-2xl', md: 'text-5xl', lg: 'text-7xl' };
  const bgSize = { sm: 'w-12 h-12', md: 'w-20 h-20', lg: 'w-28 h-28' };
  return (
    <motion.div
      animate={isDancing ? { rotate: [-10, 10, -10, 10, 0], y: [0, -10, 0, -10, 0] } : {}}
      transition={{ duration: 0.5, repeat: isDancing ? Infinity : 0 }}
      className="flex flex-col items-center gap-1"
    >
      <div className={`relative ${bgSize[size]} ${avatar.color || 'bg-pink-200'} rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-xl`}>
        <span className={`${sizes[size]} leading-none mt-1`}>{avatar.hairStyle || '👧'}</span>
        {avatar.wings && <span className="absolute -left-2 text-lg">{avatar.wings}</span>}
      </div>
      <div className="flex items-center gap-1">
        <span className={sizes[size === 'lg' ? 'md' : 'sm']}>{avatar.dressStyle || '👗'}</span>
        {avatar.accessory && <span className="text-lg">{avatar.accessory}</span>}
      </div>
      {avatar.shoes && <span className="text-sm">{avatar.shoes}</span>}
    </motion.div>
  );
}

/* ─── MAIN COMPONENT ─────────────────────────────────────── */
export default function HeroHouse() {
  const { visitId } = useParams<{ visitId: string }>();
  const navigate = useNavigate();

  /* — core state — */
  const [visit, setVisit] = useState<VisitRequest | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeChild, setActiveChild] = useState<ChildProfile | null>(null);
  const [hostProfile, setHostProfile] = useState<ChildProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isActionBusy, setIsActionBusy] = useState(false);

  /* — UI panels — */
  const [showChat, setShowChat] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isMagicDecorating, setIsMagicDecorating] = useState(false);
  const [showWardrobe, setShowWardrobe] = useState(false);
  const [wardrobeTab, setWardrobeTab] = useState<WardrobeTab>('dresses');
  const [furnitureCategory, setFurnitureCategory] = useState(0);

  /* — room system — */
  const [activeRoom, setActiveRoom] = useState<RoomId>('bedroom');
  /* optimistic local furniture state per room — avoids stale Firestore reads during rapid edits */
  const [localRoomFurniture, setLocalRoomFurniture] = useState<Partial<Record<RoomId, HouseItem[]>>>({});

  /* — wardrobe preview — */
  const [previewAvatar, setPreviewAvatar] = useState<AvatarConfig | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  /* — TV & music — */
  const [showTvPanel, setShowTvPanel] = useState(false);
  const [tvUrlInput, setTvUrlInput] = useState('');
  const [musicUrlInput, setMusicUrlInput] = useState('');
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [showMusicSetup, setShowMusicSetup] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const pendingSave = useRef<Record<string, unknown>>({});
  const saveTimer = useRef<NodeJS.Timeout | null>(null);

  /* ─── UNIFIED DEBOUNCED SAVE (2 seconds) ─────────────────── */
  const queueSave = (hostUid: string, fields: Record<string, unknown>) => {
    pendingSave.current = { ...pendingSave.current, ...fields };
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setIsSaving(true);
    saveTimer.current = setTimeout(async () => {
      const snapshot = { ...pendingSave.current };
      pendingSave.current = {};
      try {
        await updateDoc(doc(db, 'children_profiles', hostUid), snapshot);
        /* clear local optimistic furniture state — Firestore will provide canonical state via onSnapshot */
        setLocalRoomFurniture({});
        setSavedFlash(true);
        setTimeout(() => setSavedFlash(false), 2000);
      } catch (err) {
        console.error('Auto-save error:', err);
        /* restore pending fields so next save attempt includes them */
        pendingSave.current = { ...snapshot, ...pendingSave.current };
        toast.error('تعذّر الحفظ، سيتم إعادة المحاولة');
      } finally {
        setIsSaving(false);
      }
    }, 2000);
  };

  /* ─── YouTube video-ID helper ────────────────────────────── */
  const extractYoutubeId = (url: string): string | null => {
    if (!url) return null;
    const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/\s]+)/);
    if (m) return m[1];
    if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) return url.trim();
    return null;
  };

  /* ─── AUTO-INITIALIZE houseConfig for existing users ─────── */
  /* (uses activeChild + hostProfile to avoid TDZ with isHost) */
  useEffect(() => {
    if (!hostProfile || hostProfile.houseConfig) return;
    const hostIsCurrentUser = activeChild?.uid === hostProfile?.uid;
    if (!hostIsCurrentUser) return;
    updateDoc(doc(db, 'children_profiles', hostProfile.uid), {
      houseConfig: {
        theme: 'castle',
        furniture: [],
        decorations: [],
        wallpaper: 'bg-gradient-to-b from-pink-100 to-rose-200',
        floor: 'bg-rose-100',
        rooms: {}
      }
    }).catch(() => {});
  }, [hostProfile, activeChild]);

  /* ─── LOAD DATA ─────────────────────────────────────────── */
  useEffect(() => {
    const activeChildStr = localStorage.getItem('active_child');
    if (!activeChildStr) { navigate('/'); return; }
    const currentChild = JSON.parse(activeChildStr) as ChildProfile;
    setActiveChild(currentChild);
    setPreviewAvatar(currentChild.avatar);

    if (!visitId) return;

    /* Determine host UID early so we can subscribe to their profile */
    let hostUid: string;
    let unsubHost: (() => void) | null = null;

    const subscribeToHostProfile = (uid: string) => {
      unsubHost = onSnapshot(
        doc(db, 'children_profiles', uid),
        (snap) => {
          if (snap.exists()) setHostProfile(snap.data() as ChildProfile);
        },
        (err) => handleFirestoreError(err, OperationType.GET, `children_profiles/${uid}`)
      );
    };

    if (visitId === 'self') {
      hostUid = currentChild.uid;
      setVisit({
        id: 'self', fromId: currentChild.uid, fromName: currentChild.name,
        fromHeroName: currentChild.heroName, fromAvatar: currentChild.avatar,
        toId: currentChild.uid, toName: currentChild.name, toAvatar: currentChild.avatar,
        status: 'accepted', timestamp: Date.now()
      });
      subscribeToHostProfile(hostUid);
      setLoading(false);
      return () => { unsubHost?.(); };
    }

    if (visitId.startsWith('view_')) {
      hostUid = visitId.replace('view_', '');
      setVisit({
        id: visitId, fromId: currentChild.uid, fromName: currentChild.name,
        fromHeroName: currentChild.heroName, fromAvatar: currentChild.avatar,
        toId: hostUid, toName: 'صديقتكِ', status: 'accepted', timestamp: Date.now()
      });
      subscribeToHostProfile(hostUid);
      getDoc(doc(db, 'children_profiles', hostUid)).then(hDoc => {
        if (hDoc.exists()) {
          const data = hDoc.data() as ChildProfile;
          setVisit(prev => prev ? { ...prev, toName: data.heroName || data.name, toAvatar: data.avatar } : null);
        }
        setLoading(false);
      });
      return () => { unsubHost?.(); };
    }

    const unsubVisit = onSnapshot(doc(db, 'visit_requests', visitId), async (snap) => {
      if (snap.exists()) {
        const data = snap.data() as VisitRequest;
        if (!data.toId || !data.fromId) { toast.error('بيانات الزيارة غير مكتملة'); navigate('/child'); return; }
        setVisit(data);
        if (!unsubHost) subscribeToHostProfile(data.toId);
        if (data.status === 'ended') { toast.info('انتهت الزيارة!'); navigate('/child'); }
      } else { navigate('/child'); }
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.GET, `visit_requests/${visitId}`));

    const q = query(
      collection(db, 'chat_messages'),
      where('visitId', '==', visitId),
      orderBy('timestamp', 'asc')
    );
    const unsubChat = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() } as ChatMessage)));
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }, (err) => handleFirestoreError(err, OperationType.GET, 'chat_messages'));

    return () => { unsubVisit(); unsubChat(); unsubHost?.(); };
  }, [visitId, navigate]);

  const isLocalVisitMode = visitId === 'self' || !!visitId?.startsWith('view_');
  const isHost = activeChild?.uid === hostProfile?.uid;

  /* ─── HELPERS ────────────────────────────────────────────── */
  const playSound = (type: 'knock' | 'magic' | 'pop') => {
    const sounds = {
      knock: 'https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3',
      magic: 'https://assets.mixkit.co/active_storage/sfx/2017/2017-preview.mp3',
      pop: 'https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3'
    };
    new Audio(sounds[type]).play().catch(() => {});
  };

  /* ─── ROOM helpers (typed, no `any`) ───────────────────────── */
  const getCurrentRoomConfig = (): RoomConfig | null => {
    return hostProfile?.houseConfig?.rooms?.[activeRoom] ?? null;
  };

  const getCurrentRoomFurniture = (): HouseItem[] => {
    /* local optimistic state takes priority; falls back to Firestore-derived state */
    return localRoomFurniture[activeRoom] ?? getCurrentRoomConfig()?.furniture ?? [];
  };

  const getCurrentWallpaper = (): string => {
    return getCurrentRoomConfig()?.wallpaper ?? ROOMS[activeRoom].wall;
  };

  const getCurrentFloor = (): string => {
    return getCurrentRoomConfig()?.floor ?? ROOMS[activeRoom].floor;
  };

  /* ─── FURNITURE HANDLERS (all via queueSave) ─────────────── */
  const updateLocalFurniture = (room: RoomId, furniture: HouseItem[]) => {
    setLocalRoomFurniture(prev => ({ ...prev, [room]: furniture }));
  };

  const handleAddItem = (item: Partial<HouseItem>) => {
    if (!hostProfile || !isHost) return;
    const newItem: HouseItem = {
      id: Math.random().toString(36).substr(2, 9),
      type: item.type || 'furniture', emoji: item.emoji || '✨',
      x: 30 + Math.random() * 40, y: 40 + Math.random() * 30,
      scale: 1.2, rotation: 0
    };
    const newFurniture = [...getCurrentRoomFurniture(), newItem];
    updateLocalFurniture(activeRoom, newFurniture);
    queueSave(hostProfile.uid, { [`houseConfig.rooms.${activeRoom}.furniture`]: newFurniture });
    playSound('pop');
  };

  const handleUpdateItem = (itemId: string, updates: Partial<HouseItem>) => {
    if (!hostProfile || !isHost) return;
    const newFurniture = getCurrentRoomFurniture().map(i => i.id === itemId ? { ...i, ...updates } : i);
    updateLocalFurniture(activeRoom, newFurniture);
    queueSave(hostProfile.uid, { [`houseConfig.rooms.${activeRoom}.furniture`]: newFurniture });
  };

  const handleRemoveItem = (itemId: string) => {
    if (!hostProfile || !isHost) return;
    const newFurniture = getCurrentRoomFurniture().filter(i => i.id !== itemId);
    updateLocalFurniture(activeRoom, newFurniture);
    queueSave(hostProfile.uid, { [`houseConfig.rooms.${activeRoom}.furniture`]: newFurniture });
    playSound('pop');
  };

  const handleUpdateWallpaper = (wallpaperClass: string) => {
    if (!hostProfile || !isHost) return;
    queueSave(hostProfile.uid, { [`houseConfig.rooms.${activeRoom}.wallpaper`]: wallpaperClass });
    playSound('magic');
  };

  const handleUpdateFloor = (floorClass: string) => {
    if (!hostProfile || !isHost) return;
    queueSave(hostProfile.uid, { [`houseConfig.rooms.${activeRoom}.floor`]: floorClass });
    playSound('magic');
  };

  /* ─── WARDROBE HANDLERS ──────────────────────────────────── */
  const handleWardrobeChange = (field: keyof AvatarConfig, value: string) => {
    if (!previewAvatar || !activeChild) return;
    const newAvatar = { ...previewAvatar, [field]: value };
    setPreviewAvatar(newAvatar);
    /* queue debounced Firestore save so wardrobe changes persist automatically */
    queueSave(activeChild.uid, { avatar: newAvatar });
  };

  const handleSaveOutfit = async () => {
    if (!activeChild || !previewAvatar) return;
    /* flush any pending wardrobe (and house) changes immediately */
    if (saveTimer.current) clearTimeout(saveTimer.current);
    const snapshot = { ...pendingSave.current, avatar: previewAvatar };
    pendingSave.current = {};
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'children_profiles', activeChild.uid), snapshot);
      setLocalRoomFurniture({});
      const stored = localStorage.getItem('active_child');
      if (stored) {
        const parsed = JSON.parse(stored) as ChildProfile;
        parsed.avatar = previewAvatar;
        localStorage.setItem('active_child', JSON.stringify(parsed));
      }
      setSavedFlash(true);
      setTimeout(() => setSavedFlash(false), 2000);
      toast.success('تم حفظ المظهر الجديد! ✨');
      playSound('magic');
      setShowWardrobe(false);
    } catch { toast.error('خطأ في حفظ المظهر'); }
    finally { setIsSaving(false); }
  };

  /* ─── ACTIONS (tea, music, etc.) ─────────────────────────── */
  const handleAction = async (type: VisitRequest['currentAction']['type']) => {
    if (!visitId || !activeChild || isActionBusy) return;
    const actionData = { type, timestamp: Date.now(), triggeredBy: activeChild.uid };
    const clearAfter = () => setTimeout(() => setVisit(prev => prev?.currentAction?.timestamp === actionData.timestamp ? { ...prev, currentAction: null } as VisitRequest : prev), 5000);

    if (isLocalVisitMode) {
      setVisit(prev => prev ? { ...prev, currentAction: actionData } as VisitRequest : null);
      playSound('magic'); clearAfter(); return;
    }
    setIsActionBusy(true);
    try {
      await updateDoc(doc(db, 'visit_requests', visitId), { currentAction: actionData });
      playSound('magic');
      setTimeout(async () => {
        const d = await getDoc(doc(db, 'visit_requests', visitId));
        if (d.exists() && d.data().currentAction?.timestamp === actionData.timestamp)
          await updateDoc(doc(db, 'visit_requests', visitId), { 'currentAction.type': 'none' });
      }, 5000);
    } catch {
      setVisit(prev => prev ? { ...prev, currentAction: actionData } as VisitRequest : null);
      clearAfter();
    } finally { setTimeout(() => setIsActionBusy(false), 300); }
  };

  /* ─── GAME HANDLERS ──────────────────────────────────────── */
  const handleStartGame = async () => {
    if (!visitId || !activeChild || !visit) return;
    const newGameState: VisitRequest['gameState'] = {
      type: 'tictactoe', board: Array(9).fill(null), turn: 'X',
      winner: null, isDraw: false, playerX: visit.fromId, playerO: visit.toId
    };
    try {
      if (isLocalVisitMode) setVisit(prev => prev ? { ...prev, gameState: newGameState } : prev);
      else await updateDoc(doc(db, 'visit_requests', visitId), { gameState: newGameState });
      playSound('pop');
    } catch { toast.error('خطأ في بدء اللعبة'); }
  };

  const handleMakeMove = async (index: number) => {
    if (!visitId || !activeChild || !visit?.gameState || visit.gameState.type !== 'tictactoe') return;
    if (visit.gameState.board[index] || visit.gameState.winner) return;
    const myMarker = visit.gameState.playerX === activeChild.uid ? 'X' : visit.gameState.playerO === activeChild.uid ? 'O' : null;
    if (!isLocalVisitMode && (!myMarker || visit.gameState.turn !== myMarker)) return;
    const newBoard = [...visit.gameState.board]; newBoard[index] = visit.gameState.turn;
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    let winner = null;
    for (const [a,b,c] of lines) if (newBoard[a] && newBoard[a] === newBoard[b] && newBoard[a] === newBoard[c]) { winner = newBoard[a]; break; }
    const isDraw = !winner && newBoard.every(c => c !== null);
    const nextState: VisitRequest['gameState'] = { ...visit.gameState, board: newBoard, turn: visit.gameState.turn === 'X' ? 'O' : 'X', winner: isDraw ? 'draw' : winner, isDraw };
    try {
      if (isLocalVisitMode) setVisit(prev => prev ? { ...prev, gameState: nextState } : prev);
      else await updateDoc(doc(db, 'visit_requests', visitId), { gameState: nextState });
      playSound('pop');
      if (winner) { const didIWin = myMarker ? winner === myMarker : winner === 'X'; toast.success(didIWin ? 'فزتِ! 🎉' : 'فازت صديقتكِ! 👏'); playSound('magic'); }
      else if (isDraw) toast.info('تعادل! 🤝');
    } catch { toast.error('خطأ في اللعب'); }
  };

  const handleCloseGame = async () => {
    if (!visitId) return;
    if (isLocalVisitMode) setVisit(prev => prev ? { ...prev, gameState: undefined } : prev);
    else await updateDoc(doc(db, 'visit_requests', visitId), { gameState: null }).catch(() => {});
  };

  /* ─── MAGIC DECORATE ─────────────────────────────────────── */
  type MagicFurnitureItem = Pick<HouseItem, 'type' | 'emoji' | 'x' | 'y' | 'scale' | 'rotation'>;
  type MagicDecorateResult = { wallpaper: string; floor: string; furniture: MagicFurnitureItem[] };

  const handleMagicDecorate = async () => {
    if (!hostProfile || !isHost) return;
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
    if (!apiKey) { toast.error('مفتاح API غير متوفر'); return; }
    setIsMagicDecorating(true);
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are a magical interior designer for a children's app. The hero is "${hostProfile.heroName || hostProfile.name}". Suggest a fun magical room. Return ONLY JSON: { "wallpaper": "bg-gradient-to-b from-purple-200 to-pink-100", "floor": "bg-amber-100", "furniture": [{ "type": "bed", "emoji": "🛏️", "x": 20, "y": 70, "scale": 2, "rotation": 0 }, { "type": "plant", "emoji": "🪴", "x": 10, "y": 60, "scale": 1, "rotation": 0 }] }`;
      const response = await ai.models.generateContent({ model: 'gemini-2.0-flash', contents: prompt, config: { responseMimeType: 'application/json' } });
      const result = JSON.parse(response.text ?? '{}') as Partial<MagicDecorateResult>;
      if (result.wallpaper && Array.isArray(result.furniture)) {
        const newFurniture: HouseItem[] = result.furniture.map((f) => ({
          ...f, id: Math.random().toString(36).substr(2, 9)
        }));
        await updateDoc(doc(db, 'children_profiles', hostProfile.uid), {
          [`houseConfig.rooms.${activeRoom}.wallpaper`]: result.wallpaper,
          [`houseConfig.rooms.${activeRoom}.floor`]: result.floor ?? 'bg-amber-100',
          [`houseConfig.rooms.${activeRoom}.furniture`]: newFurniture
        });
        toast.success('تم التزيين السحري! ✨'); playSound('magic');
      }
    } catch { toast.error('عذراً، السحر لم يكتمل'); }
    finally { setIsMagicDecorating(false); }
  };

  /* ─── CHAT ───────────────────────────────────────────────── */
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChild || !visitId) return;
    try {
      await addDoc(collection(db, 'chat_messages'), {
        visitId, senderId: activeChild.uid,
        senderName: activeChild.heroName || activeChild.name,
        text: newMessage, timestamp: Date.now()
      });
      setNewMessage(''); playSound('pop');
    } catch { toast.error('خطأ في إرسال الرسالة'); }
  };

  /* ─── END VISIT ──────────────────────────────────────────── */
  const handleEndVisit = async () => {
    if (visitId !== 'self' && !isLocalVisitMode) {
      await updateDoc(doc(db, 'visit_requests', visitId!), { status: 'ended' }).catch(() => {});
    }
    navigate('/child');
  };

  /* ─── LOADING ────────────────────────────────────────────── */
  if (loading || !visit || !hostProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-fuchsia-950 to-indigo-950 flex items-center justify-center" dir="rtl">
        <div className="flex flex-col items-center gap-4">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }} className="text-6xl">🏠</motion.div>
          <p className="text-white font-black text-xl">جارٍ تحميل البيت...</p>
        </div>
      </div>
    );
  }

  /* ─── COMPUTED VALUES ────────────────────────────────────── */
  const currentFurniture = getCurrentRoomFurniture();
  const currentWall = getCurrentWallpaper();
  const currentFloor = getCurrentFloor();
  /* when the current user is the host, always reflect live previewAvatar so wardrobe changes show instantly */
  const hostAvatar = isHost
    ? (previewAvatar || hostProfile?.avatar)
    : (visit.toAvatar || hostProfile?.avatar);
  const visitorAvatar = visitId === 'self' ? null : visit.fromAvatar;
  const myMarker = visit.gameState
    ? (visit.gameState.playerX === activeChild?.uid ? 'X' : visit.gameState.playerO === activeChild?.uid ? 'O' : null)
    : null;

  /* ─── RENDER ─────────────────────────────────────────────── */
  return (
    <div className="fixed inset-0 bg-slate-900 font-sans overflow-hidden" dir="rtl">

      {/* ── ROOM BACKGROUND ── */}
      <div className={`absolute inset-0 ${currentWall} transition-all duration-700`} />
      <div className={`absolute bottom-0 w-full h-1/3 ${currentFloor} border-t-8 border-black/10 transition-all duration-700`} />

      {/* ── MAGIC DECORATING OVERLAY ── */}
      <AnimatePresence>
        {isMagicDecorating && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-purple-500/30 backdrop-blur-md flex flex-col items-center justify-center pointer-events-none">
            <motion.div animate={{ scale: [1,1.5,1], rotate: [0,360], filter: ['hue-rotate(0deg)','hue-rotate(360deg)'] }}
              transition={{ duration: 2, repeat: Infinity }} className="text-9xl mb-8">🪄</motion.div>
            <motion.h2 animate={{ opacity: [0.5,1,0.5] }} transition={{ duration: 1.5, repeat: Infinity }}
              className="text-4xl font-black text-white drop-shadow-lg">جاري التزيين السحري... ✨</motion.h2>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── SAVED INDICATOR ── */}
      <AnimatePresence>
        {savedFlash && (
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-[90] bg-emerald-500 text-white px-6 py-3 rounded-full font-black shadow-2xl flex items-center gap-2">
            <Check className="w-5 h-5" /> تم الحفظ تلقائياً ✨
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── FURNITURE IN ROOM ── */}
      <div id="room-container" className="absolute inset-0 z-10 overflow-hidden">
        {currentFurniture.map((item) => (
          <motion.div key={item.id} drag={isEditing} dragMomentum={false}
            onDragEnd={(e, info) => {
              const parent = document.getElementById('room-container');
              if (parent) {
                const rect = parent.getBoundingClientRect();
                handleUpdateItem(item.id, {
                  x: Math.max(0, Math.min(95, item.x + (info.offset.x / rect.width) * 100)),
                  y: Math.max(0, Math.min(80, item.y + (info.offset.y / rect.height) * 100))
                });
              }
            }}
            animate={{ x: 0, y: 0 }} transition={{ duration: 0 }}
            style={{ left: `${item.x}%`, top: `${item.y}%` }}
            onClick={() => {
              if (isEditing) return;
              if (item.type === 'mirror') handleAction('mirror');
              if (item.type === 'tv') {
                setTvUrlInput(hostProfile?.houseConfig?.tvUrl || '');
                setShowTvPanel(true);
              }
            }}
            className={`absolute text-6xl md:text-7xl ${isEditing ? 'cursor-grab active:cursor-grabbing z-50' : 'z-20'} group select-none`}
          >
            <div className="relative flex items-center justify-center">
              <div style={{ transform: `scale(${item.scale || 1}) rotate(${item.rotation || 0}deg)`, transition: 'transform 0.2s' }}>
                {item.emoji}
              </div>
              {isEditing && (
                <div className="absolute -top-20 left-1/2 -translate-x-1/2 flex gap-1.5 bg-white/95 backdrop-blur-sm p-2 rounded-2xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity z-50 border border-slate-100">
                  <button onClick={() => handleUpdateItem(item.id, { scale: Math.min(3, (item.scale || 1) + 0.2) })} className="w-9 h-9 flex items-center justify-center bg-emerald-100 text-emerald-600 rounded-xl hover:bg-emerald-200"><Plus className="w-4 h-4" /></button>
                  <button onClick={() => handleUpdateItem(item.id, { scale: Math.max(0.4, (item.scale || 1) - 0.2) })} className="w-9 h-9 flex items-center justify-center bg-amber-100 text-amber-600 rounded-xl hover:bg-amber-200"><Minus className="w-4 h-4" /></button>
                  <button onClick={() => handleUpdateItem(item.id, { rotation: ((item.rotation || 0) + 45) % 360 })} className="w-9 h-9 flex items-center justify-center bg-blue-100 text-blue-600 rounded-xl hover:bg-blue-200"><RotateCw className="w-4 h-4" /></button>
                  <button onClick={() => handleRemoveItem(item.id)} className="w-9 h-9 flex items-center justify-center bg-red-100 text-red-600 rounded-xl hover:bg-red-200"><Trash2 className="w-4 h-4" /></button>
                </div>
              )}
            </div>
          </motion.div>
        ))}

        {/* Default furniture items shown when room is empty */}
        {currentFurniture.length === 0 && (
          <>
            {ROOMS[activeRoom].defaultItems.map((emoji, idx) => (
              <div
                key={idx}
                className="absolute text-7xl opacity-60 drop-shadow-xl pointer-events-none select-none"
                style={{ left: `${20 + idx * 30}%`, bottom: '32%' }}
              >
                {emoji}
              </div>
            ))}
            {isHost && !isEditing && (
              <motion.div
                animate={{ opacity: [0.5, 0.9, 0.5] }} transition={{ duration: 2, repeat: Infinity }}
                className="absolute bottom-[54%] left-1/2 -translate-x-1/2 pointer-events-none"
              >
                <div className="bg-white/70 backdrop-blur-sm text-slate-600 font-black text-sm px-4 py-2 rounded-full shadow">
                  اضغطي على ✏️ لتخصيص الغرفة!
                </div>
              </motion.div>
            )}
          </>
        )}

        {/* Characters */}
        <div className="absolute bottom-[30%] w-full flex justify-center gap-16 md:gap-40 z-30 pointer-events-none">
          {hostAvatar && (
            <div className="flex flex-col items-center">
              <Doll avatar={hostAvatar} isDancing={visit.currentAction?.type === 'dance'} size="lg" />
              <span className="mt-2 bg-white/80 backdrop-blur-sm text-pink-600 font-black text-xs px-3 py-1 rounded-full">
                {hostProfile?.heroName || hostProfile?.name}
              </span>
            </div>
          )}
          {visitorAvatar && (
            <div className="flex flex-col items-center">
              <Doll avatar={visitorAvatar} isDancing={visit.currentAction?.type === 'dance'} size="lg" />
              <span className="mt-2 bg-white/80 backdrop-blur-sm text-sky-600 font-black text-xs px-3 py-1 rounded-full">
                {visit.fromHeroName}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── ACTION ANIMATIONS ── */}
      <div className="absolute inset-0 pointer-events-none z-40">
        <AnimatePresence>
          {visit.currentAction?.type === 'tea' && <motion.div initial={{ opacity: 0, scale: 0, y: 100 }} animate={{ opacity: 1, scale: 2, y: -50 }} exit={{ opacity: 0, scale: 0 }} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl drop-shadow-2xl">☕✨</motion.div>}
          {visit.currentAction?.type === 'sweets' && <motion.div initial={{ opacity: 0, scale: 0, y: 100 }} animate={{ opacity: 1, scale: 2, y: -50 }} exit={{ opacity: 0, scale: 0 }} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl drop-shadow-2xl">🍰🍬</motion.div>}
          {visit.currentAction?.type === 'juice' && <motion.div initial={{ opacity: 0, scale: 0, y: 100 }} animate={{ opacity: 1, scale: 2, y: -50 }} exit={{ opacity: 0, scale: 0 }} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl drop-shadow-2xl">🍹🍊</motion.div>}
          {visit.currentAction?.type === 'cookies' && <motion.div initial={{ opacity: 0, scale: 0, y: 100 }} animate={{ opacity: 1, scale: 2, y: -50 }} exit={{ opacity: 0, scale: 0 }} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl drop-shadow-2xl">🍪🍪</motion.div>}
          {visit.currentAction?.type === 'fruit' && <motion.div initial={{ opacity: 0, scale: 0, y: 100 }} animate={{ opacity: 1, scale: 2, y: -50 }} exit={{ opacity: 0, scale: 0 }} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl drop-shadow-2xl">🍓🍎</motion.div>}
          {visit.currentAction?.type === 'heart' && <motion.div initial={{ opacity: 0, scale: 0, y: 100 }} animate={{ opacity: 1, scale: 3, y: -100 }} exit={{ opacity: 0, scale: 0 }} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl drop-shadow-2xl">💖</motion.div>}
          {visit.currentAction?.type === 'star' && <motion.div initial={{ opacity: 0, scale: 0, rotate: -180 }} animate={{ opacity: 1, scale: 3, rotate: 0 }} exit={{ opacity: 0, scale: 0, rotate: 180 }} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl drop-shadow-2xl">⭐</motion.div>}
          {visit.currentAction?.type === 'laugh' && <motion.div initial={{ opacity: 0, scale: 0, y: 50 }} animate={{ opacity: 1, scale: 2, y: -50, rotate: [0,-10,10,-10,10,0] }} exit={{ opacity: 0, scale: 0 }} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl drop-shadow-2xl">😂</motion.div>}
          {visit.currentAction?.type === 'wow' && <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 3 }} exit={{ opacity: 0, scale: 0 }} className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl drop-shadow-2xl">😲✨</motion.div>}
          {visit.currentAction?.type === 'music' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center">
              {[...Array(15)].map((_, i) => (
                <motion.div key={i} animate={{ y: [-20,-300], x: [0, i%2===0?150:-150], opacity: [0,1,0], rotate: [0,90] }} transition={{ duration: 3, repeat: Infinity, delay: i*0.2 }} className="absolute text-6xl drop-shadow-xl">🎵</motion.div>
              ))}
            </motion.div>
          )}
          {visit.currentAction?.type === 'mirror' && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
              className="absolute inset-0 flex items-center justify-center bg-white/20 backdrop-blur-sm z-50 pointer-events-auto">
              <div className="p-8 bg-white/95 rounded-[3rem] shadow-2xl border-8 border-pink-200 flex flex-col items-center gap-6">
                <div className="text-4xl font-black text-pink-500">المرآة السحرية ✨</div>
                <div className="w-64 h-64 rounded-full overflow-hidden border-8 border-pink-100 bg-gradient-to-b from-blue-50 to-pink-50 flex items-center justify-center">
                  <Doll avatar={visit.currentAction?.triggeredBy === visit.fromId ? visit.fromAvatar : (visit.toAvatar || visit.fromAvatar)} size="lg" />
                </div>
                <p className="text-xl font-bold text-slate-600">تبدين رائعة اليوم! 💖</p>
                <button onClick={() => handleAction('none')} className="bg-pink-500 text-white px-8 py-3 rounded-full font-bold shadow-lg hover:bg-pink-600">شكراً! ✨</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── TOP HEADER ── */}
      <div className="absolute top-4 left-4 right-4 z-50 flex justify-between items-start pointer-events-none">
        {/* Left: back + host info */}
        <div className="flex flex-col gap-3 pointer-events-auto">
          <div className="flex gap-2">
            <button onClick={handleEndVisit} className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-red-500 hover:bg-red-50 shadow-xl border-3 border-white">
              <LogOut className="w-5 h-5" />
            </button>
            {isHost && (
              <button onClick={() => { setIsEditing(!isEditing); setShowWardrobe(false); }}
                className={`w-12 h-12 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl border-3 border-white transition-all ${isEditing ? 'bg-pink-500 text-white' : 'bg-white/90 text-pink-500'}`}>
                <Palette className="w-5 h-5" />
              </button>
            )}
            {isHost && (
              <button onClick={() => { setShowWardrobe(!showWardrobe); setIsEditing(false); }}
                className={`w-12 h-12 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl border-3 border-white transition-all ${showWardrobe ? 'bg-fuchsia-500 text-white' : 'bg-white/90 text-fuchsia-500'}`}>
                <Shirt className="w-5 h-5" />
              </button>
            )}
            {isHost && (
              <button onClick={handleMagicDecorate}
                className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-amber-500 hover:bg-amber-50 shadow-xl border-3 border-white">
                <Wand2 className="w-5 h-5" />
              </button>
            )}
            {/* Music toggle: visible to all, setup is host-only */}
            {(() => {
              const hasBgMusic = !!extractYoutubeId(hostProfile?.houseConfig?.bgMusic || '');
              return (
                <div className="flex gap-1">
                  {hasBgMusic && (
                    <button onClick={() => setMusicPlaying(p => !p)}
                      className={`w-12 h-12 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl border-3 border-white transition-all ${musicPlaying ? 'bg-purple-500 text-white' : 'bg-white/90 text-purple-500'}`}
                      title={musicPlaying ? 'كتم الموسيقى' : 'تشغيل الموسيقى'}>
                      {musicPlaying ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                    </button>
                  )}
                  {isHost && (
                    <button onClick={() => { setMusicUrlInput(hostProfile?.houseConfig?.bgMusic || ''); setShowMusicSetup(true); }}
                      className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-purple-500 hover:bg-purple-50 shadow-xl border-3 border-white">
                      <Music2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
              );
            })()}
          </div>

          <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border-2 border-pink-100 flex items-center gap-3">
            <Doll avatar={hostProfile.avatar} size="sm" />
            <div>
              <div className="text-[10px] font-bold text-slate-400">منزل البطلة</div>
              <div className="font-black text-pink-600 text-sm">{hostProfile.heroName || hostProfile.name}</div>
            </div>
          </div>
        </div>

        {/* Center: room name badge */}
        <div className="pointer-events-none">
          <div className="bg-white/90 backdrop-blur-md px-6 py-2 rounded-full shadow-xl border-2 border-white flex items-center gap-3">
            <span className="text-2xl">{ROOMS[activeRoom].icon}</span>
            <span className="font-black text-slate-700">{ROOMS[activeRoom].label}</span>
            {visitId !== 'self' && <span className="text-slate-400 text-sm">|</span>}
            {visitId !== 'self' && <span className="font-bold text-sky-500 text-sm">{visit.fromHeroName}</span>}
          </div>
        </div>

        {/* Right: action buttons */}
        <div className="flex flex-col gap-3 items-end pointer-events-auto">
          {visitId !== 'self' && (
            <button onClick={() => handleAction('mirror')} className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-purple-500 shadow-xl border-3 border-white hover:scale-105 transition-transform">
              <Camera className="w-5 h-5" />
            </button>
          )}
          {!isEditing && !showWardrobe && visitId !== 'self' && (
            <button onClick={handleStartGame} className="w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-orange-500 shadow-xl border-3 border-white hover:scale-105 transition-transform">
              <Gamepad2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* ── ROOM SELECTOR (bottom left) ── */}
      <div className="absolute bottom-[140px] right-4 z-50 flex flex-col gap-2">
        {(Object.entries(ROOMS) as [RoomId, typeof ROOMS[RoomId]][]).map(([id, room]) => (
          <motion.button key={id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => setActiveRoom(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-black text-sm shadow-xl border-2 transition-all ${
              activeRoom === id
                ? 'bg-fuchsia-500 text-white border-fuchsia-300'
                : 'bg-white/85 backdrop-blur-md text-slate-700 border-white hover:bg-white'
            }`}>
            <span className="text-xl">{room.icon}</span>
            <span className="hidden sm:block">{room.label}</span>
          </motion.button>
        ))}
      </div>

      {/* ── EDITING PANEL ── */}
      <AnimatePresence>
        {isEditing && (
          <motion.div initial={{ opacity: 0, y: 60 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 60 }}
            className="absolute bottom-4 left-4 right-[130px] sm:right-[160px] z-50 bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl border-4 border-white p-4">

            {/* Category tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 mb-3">
              {FURNITURE_CATEGORIES.map((cat, idx) => (
                <button key={cat.id} onClick={() => setFurnitureCategory(idx)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all ${furnitureCategory === idx ? 'bg-fuchsia-500 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                  <span>{cat.icon}</span> {cat.label}
                </button>
              ))}
            </div>

            {/* Furniture items */}
            <div className="grid grid-cols-8 gap-2 mb-4">
              {FURNITURE_CATEGORIES[furnitureCategory].items.map(item => (
                <motion.button key={item.type} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                  onClick={() => handleAddItem(item)}
                  className="w-10 h-10 bg-slate-50 hover:bg-fuchsia-50 rounded-xl flex items-center justify-center text-2xl shadow-sm border border-slate-200 hover:border-fuchsia-300 transition-all">
                  {item.emoji}
                </motion.button>
              ))}
            </div>

            {/* Wallpaper + Floor */}
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="text-[10px] font-black text-slate-400 mb-1.5">ورق الحائط</div>
                <div className="flex gap-1.5 flex-wrap">
                  {WALLPAPER_OPTIONS.map(wp => (
                    <button key={wp.id} onClick={() => handleUpdateWallpaper(wp.class)}
                      className={`w-8 h-8 rounded-full border-2 transition-all text-xs flex items-center justify-center ${getCurrentWallpaper() === wp.class ? 'border-fuchsia-500 scale-110 shadow-md' : 'border-white shadow-sm'} ${wp.class}`}
                      title={wp.label}>{wp.icon}</button>
                  ))}
                </div>
              </div>
              <div className="flex-1">
                <div className="text-[10px] font-black text-slate-400 mb-1.5">الأرضية</div>
                <div className="flex gap-1.5 flex-wrap">
                  {FLOOR_OPTIONS.map(fl => (
                    <button key={fl.id} onClick={() => handleUpdateFloor(fl.class)}
                      className={`w-8 h-8 rounded-full border-2 transition-all text-xs flex items-center justify-center ${getCurrentFloor() === fl.class ? 'border-fuchsia-500 scale-110 shadow-md' : 'border-white shadow-sm'} ${fl.class}`}
                      title={fl.label}>{fl.icon}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* حفظ التصميم button */}
            <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-bold">
                {isSaving ? '⏳ جارٍ الحفظ...' : savedFlash ? '✅ تم الحفظ' : 'التغييرات تُحفظ تلقائياً بعد 2 ثانية'}
              </span>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={async () => {
                  if (!hostProfile || Object.keys(pendingSave.current).length === 0) {
                    toast.success('التصميم محفوظ بالفعل ✅');
                    return;
                  }
                  if (saveTimer.current) clearTimeout(saveTimer.current);
                  const snapshot = { ...pendingSave.current };
                  pendingSave.current = {};
                  setIsSaving(true);
                  try {
                    await updateDoc(doc(db, 'children_profiles', hostProfile.uid), snapshot);
                    setLocalRoomFurniture({});
                    setSavedFlash(true);
                    setTimeout(() => setSavedFlash(false), 2000);
                    toast.success('تم حفظ تصميم البيت! 🏠✨');
                  } catch { toast.error('خطأ في الحفظ'); }
                  finally { setIsSaving(false); }
                }}
                className="flex items-center gap-2 bg-fuchsia-500 hover:bg-fuchsia-600 text-white font-black text-xs px-4 py-2 rounded-xl shadow-md"
              >
                <Save className="w-3.5 h-3.5" />
                حفظ التصميم
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── WARDROBE PANEL ── */}
      <AnimatePresence>
        {showWardrobe && (
          <motion.div initial={{ opacity: 0, x: 80 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 80 }}
            className="absolute top-24 left-4 bottom-4 z-50 w-80 bg-white/97 backdrop-blur-xl rounded-[2rem] shadow-2xl border-4 border-fuchsia-100 flex flex-col overflow-hidden">

            {/* Header */}
            <div className="bg-gradient-to-r from-fuchsia-500 to-pink-500 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shirt className="w-5 h-5 text-white" />
                <span className="font-black text-white">خزانة الملابس</span>
              </div>
              <button onClick={() => setShowWardrobe(false)} className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center text-white hover:bg-white/30">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Doll preview */}
            <div className="flex items-center justify-center py-5 bg-gradient-to-b from-fuchsia-50 to-pink-50 border-b border-pink-100">
              {previewAvatar && <Doll avatar={previewAvatar} size="lg" />}
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-2 bg-slate-50 border-b border-slate-100">
              {(['dresses', 'hair', 'accessories', 'skinColor'] as WardrobeTab[]).map(tab => {
                const labels: Record<WardrobeTab, string> = { dresses: '👗 فساتين', hair: '💇 شعر', accessories: '🎀 إكسسوار', skinColor: '🎨 لون' };
                return (
                  <button key={tab} onClick={() => setWardrobeTab(tab)}
                    className={`flex-1 py-2 rounded-xl text-[10px] font-black transition-all ${wardrobeTab === tab ? 'bg-fuchsia-500 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>
                    {labels[tab]}
                  </button>
                );
              })}
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-3">
              {wardrobeTab === 'dresses' && (
                <div className="grid grid-cols-4 gap-2">
                  {WARDROBE.dresses.map(item => (
                    <motion.button key={item.id} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      onClick={() => handleWardrobeChange('dressStyle', item.emoji)}
                      className={`aspect-square rounded-2xl flex flex-col items-center justify-center text-3xl transition-all border-2 ${previewAvatar?.dressStyle === item.emoji ? 'border-fuchsia-500 bg-fuchsia-50 shadow-md' : 'border-slate-100 bg-slate-50 hover:border-fuchsia-200'}`}>
                      {item.emoji}
                      <span className="text-[9px] font-bold text-slate-400 mt-0.5">{item.label}</span>
                    </motion.button>
                  ))}
                </div>
              )}
              {wardrobeTab === 'hair' && (
                <div className="grid grid-cols-4 gap-2">
                  {WARDROBE.hair.map(item => (
                    <motion.button key={item.id} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      onClick={() => handleWardrobeChange('hairStyle', item.emoji)}
                      className={`aspect-square rounded-2xl flex flex-col items-center justify-center text-3xl transition-all border-2 ${previewAvatar?.hairStyle === item.emoji ? 'border-fuchsia-500 bg-fuchsia-50 shadow-md' : 'border-slate-100 bg-slate-50 hover:border-fuchsia-200'}`}>
                      {item.emoji}
                      <span className="text-[9px] font-bold text-slate-400 mt-0.5">{item.label}</span>
                    </motion.button>
                  ))}
                </div>
              )}
              {wardrobeTab === 'accessories' && (
                <div className="grid grid-cols-4 gap-2">
                  {WARDROBE.accessories.map(item => (
                    <motion.button key={item.id} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                      onClick={() => handleWardrobeChange('accessory', item.emoji)}
                      className={`aspect-square rounded-2xl flex flex-col items-center justify-center text-3xl transition-all border-2 ${previewAvatar?.accessory === item.emoji ? 'border-fuchsia-500 bg-fuchsia-50 shadow-md' : 'border-slate-100 bg-slate-50 hover:border-fuchsia-200'}`}>
                      {item.emoji}
                      <span className="text-[9px] font-bold text-slate-400 mt-0.5">{item.label}</span>
                    </motion.button>
                  ))}
                </div>
              )}
              {wardrobeTab === 'skinColor' && (
                <div className="grid grid-cols-3 gap-3">
                  {WARDROBE.skinColor.map(item => (
                    <motion.button key={item.id} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                      onClick={() => handleWardrobeChange('color', item.class)}
                      className={`h-16 rounded-2xl ${item.class} flex items-end justify-center pb-2 transition-all border-2 ${previewAvatar?.color === item.class ? 'border-fuchsia-500 shadow-md scale-105' : 'border-white'}`}>
                      <span className="text-[10px] font-black text-slate-600 bg-white/70 px-2 py-0.5 rounded-full">{item.label}</span>
                    </motion.button>
                  ))}
                </div>
              )}
            </div>

            {/* Save outfit */}
            {isHost && (
              <div className="p-3 border-t border-slate-100">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={handleSaveOutfit} disabled={isSaving}
                  className="w-full bg-gradient-to-r from-fuchsia-500 to-pink-500 text-white font-black py-3 rounded-2xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-60">
                  {isSaving ? <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" /> : <Save className="w-5 h-5" />}
                  حفظي مظهري الجديد
                </motion.button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CHAT WIDGET ── */}
      {visitId !== 'self' && (
        <div className="absolute bottom-4 left-4 z-50 w-72 pointer-events-auto">
          <AnimatePresence>
            {showChat && (
              <motion.div initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.9 }}
                className="bg-white/95 backdrop-blur-xl rounded-[2rem] shadow-2xl border-4 border-white overflow-hidden flex flex-col mb-3" style={{ height: '340px' }}>
                <div className="bg-sky-100 p-3 flex justify-between items-center border-b-2 border-white">
                  <h3 className="font-black text-sky-600 flex items-center gap-2 text-sm"><MessageCircle className="w-4 h-4" /> الدردشة</h3>
                  <button onClick={() => setShowChat(false)} className="text-sky-400 hover:text-sky-600"><X className="w-4 h-4" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2">
                  {messages.map(msg => (
                    <div key={msg.id} className={`flex flex-col ${msg.senderId === activeChild?.uid ? 'items-start' : 'items-end'}`}>
                      <span className="text-[9px] font-bold text-slate-400 mb-0.5 px-2">{msg.senderName}</span>
                      <div className={`px-3 py-2 rounded-2xl max-w-[90%] font-bold text-sm shadow-sm ${msg.senderId === activeChild?.uid ? 'bg-sky-500 text-white rounded-tr-sm' : 'bg-slate-100 text-slate-700 rounded-tl-sm'}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  <div ref={scrollRef} />
                </div>
                <form onSubmit={handleSendMessage} className="p-2 bg-slate-50 border-t-2 border-white flex gap-2">
                  <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="اكتبي رسالة..." className="flex-1 bg-white border-2 border-slate-200 rounded-xl px-3 py-2 outline-none focus:border-sky-400 font-bold text-sm" />
                  <button type="submit" disabled={!newMessage.trim()} className="bg-sky-500 text-white p-2 rounded-xl hover:bg-sky-600 disabled:opacity-50"><Send className="w-4 h-4" /></button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
          {!showChat && (
            <button onClick={() => setShowChat(true)} className="w-14 h-14 bg-sky-500 text-white rounded-full shadow-2xl flex items-center justify-center border-4 border-white hover:scale-110 transition-transform">
              <MessageCircle className="w-7 h-7" />
            </button>
          )}
        </div>
      )}

      {/* ── GAME WIDGET ── */}
      {visitId !== 'self' && (
        <div className="absolute bottom-4 right-[140px] sm:right-[170px] z-50 w-72 pointer-events-auto flex flex-col justify-end items-end">
          <AnimatePresence>
            {visit?.gameState?.type === 'tictactoe' && (
              <motion.div initial={{ opacity: 0, scale: 0.8, y: 50 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8, y: 50 }}
                className="bg-white/97 backdrop-blur-xl rounded-[2rem] shadow-2xl border-4 border-orange-100 p-5 w-full mb-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-black text-orange-500 flex items-center gap-2"><Gamepad2 className="w-5 h-5" /> إكس أو</h3>
                  <button onClick={handleCloseGame} className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500"><X className="w-4 h-4" /></button>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {visit.gameState.board?.map((cell, idx) => (
                    <button key={idx} onClick={() => handleMakeMove(idx)}
                      disabled={cell !== null || !!visit.gameState?.winner || (!isLocalVisitMode && (!myMarker || visit.gameState?.turn !== myMarker))}
                      className={`aspect-square rounded-2xl text-3xl font-black flex items-center justify-center shadow-inner transition-colors ${cell === 'X' ? 'bg-orange-100 text-orange-500' : cell === 'O' ? 'bg-sky-100 text-sky-500' : 'bg-slate-50 hover:bg-slate-100'}`}>
                      {cell}
                    </button>
                  ))}
                </div>
                <div className="text-center font-bold text-slate-600 bg-slate-50 py-2 rounded-xl text-sm">
                  {visit.gameState.winner
                    ? (visit.gameState.winner === 'draw' ? 'تعادل! 🤝' : visit.gameState.winner === myMarker ? 'فزتِ! 🎉' : 'فازت صديقتكِ! 👏')
                    : isLocalVisitMode ? `الدور: ${visit.gameState.turn}` : visit.gameState.turn === myMarker ? 'دوركِ ✨' : 'انتظري ⏳'
                  }
                </div>
                {(visit.gameState.winner || visit.gameState.isDraw) && (
                  <button onClick={handleStartGame} className="mt-3 w-full bg-orange-500 text-white font-black py-2.5 rounded-xl shadow-md hover:bg-orange-600 text-sm">العب مرة أخرى</button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* ── ACTION BAR (bottom center) ── */}
      {!isEditing && !showWardrobe && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
          <div className="bg-white/93 backdrop-blur-xl px-4 py-3 rounded-[2rem] shadow-2xl border-4 border-white flex gap-2 items-center">
            {[
              { type: 'tea' as const, emoji: '☕', label: 'شاي' },
              { type: 'sweets' as const, emoji: '🍰', label: 'حلوى' },
              { type: 'juice' as const, emoji: '🍹', label: 'عصير' },
              { type: 'cookies' as const, emoji: '🍪', label: 'بسكويت' },
              { type: 'music' as const, emoji: '🎵', label: 'موسيقى' },
              { type: 'dance' as const, emoji: '💃', label: 'رقص' },
              { type: 'heart' as const, emoji: '💖', label: 'حب' },
              { type: 'star' as const, emoji: '⭐', label: 'نجمة' },
              { type: 'laugh' as const, emoji: '😂', label: 'ضحك' },
              { type: 'wow' as const, emoji: '😲', label: 'واو' },
            ].map(action => (
              <motion.button key={action.type} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                onClick={() => handleAction(action.type)}
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-slate-50 hover:bg-fuchsia-50 border-2 border-slate-100 hover:border-fuchsia-300 flex items-center justify-center text-xl sm:text-2xl shadow-sm transition-all"
                title={action.label}>
                {action.emoji}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* ── TV PANEL (YouTube embed) ── */}
      <AnimatePresence>
        {showTvPanel && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-4"
            onClick={() => setShowTvPanel(false)}>
            <motion.div initial={{ scale: 0.85, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 30 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-[2rem] shadow-2xl border-4 border-pink-100 w-full max-w-lg p-5 flex flex-col gap-4" dir="rtl">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-black text-pink-600 flex items-center gap-2">
                  <Tv2 className="w-5 h-5" /> التلفاز السحري
                </h2>
                <button onClick={() => setShowTvPanel(false)} className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500"><X className="w-4 h-4" /></button>
              </div>

              {/* Video player */}
              {(() => {
                const videoId = extractYoutubeId(hostProfile?.houseConfig?.tvUrl || '');
                return videoId ? (
                  <div className="relative w-full rounded-xl overflow-hidden shadow-lg" style={{ paddingBottom: '56.25%' }}>
                    <iframe
                      className="absolute inset-0 w-full h-full"
                      src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-40 bg-slate-50 rounded-xl text-slate-400 font-bold text-sm">
                    📺 لم يتم تحديد فيديو بعد
                  </div>
                );
              })()}

              {/* Host can update the TV URL */}
              {isHost && (
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-slate-500">رابط YouTube للتلفاز</label>
                  <div className="flex gap-2">
                    <input
                      value={tvUrlInput}
                      onChange={e => setTvUrlInput(e.target.value)}
                      placeholder="https://youtube.com/watch?v=... أو معرف الفيديو"
                      className="flex-1 border-2 border-slate-200 rounded-xl px-3 py-2 text-sm text-right focus:border-pink-400 outline-none"
                    />
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        if (!hostProfile) return;
                        const id = extractYoutubeId(tvUrlInput.trim());
                        if (!id && tvUrlInput.trim()) { toast.error('الرابط غير صحيح'); return; }
                        const url = id ? tvUrlInput.trim() : '';
                        queueSave(hostProfile.uid, { 'houseConfig.tvUrl': url });
                        toast.success(id ? 'تم تحديث التلفاز! 📺' : 'تم مسح التلفاز');
                        setShowTvPanel(false);
                      }}
                      className="bg-pink-500 hover:bg-pink-600 text-white font-black text-xs px-4 py-2 rounded-xl">
                      حفظ
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MUSIC SETUP PANEL (host only) ── */}
      <AnimatePresence>
        {showMusicSetup && isHost && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4"
            onClick={() => setShowMusicSetup(false)}>
            <motion.div initial={{ scale: 0.85, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 30 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-[2rem] shadow-2xl border-4 border-purple-100 w-full max-w-md p-5 flex flex-col gap-4" dir="rtl">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-black text-purple-600 flex items-center gap-2">
                  <Music2 className="w-5 h-5" /> موسيقى البيت
                </h2>
                <button onClick={() => setShowMusicSetup(false)} className="w-8 h-8 flex items-center justify-center bg-slate-100 hover:bg-slate-200 rounded-full"><X className="w-4 h-4" /></button>
              </div>
              <p className="text-xs text-slate-500">اختاري رابط YouTube لتشغيل الموسيقى في الخلفية لكل زوّار البيت</p>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-slate-500">رابط YouTube للموسيقى</label>
                <div className="flex gap-2">
                  <input
                    value={musicUrlInput}
                    onChange={e => setMusicUrlInput(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="flex-1 border-2 border-slate-200 rounded-xl px-3 py-2 text-sm text-right focus:border-purple-400 outline-none"
                  />
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      if (!hostProfile) return;
                      const id = extractYoutubeId(musicUrlInput.trim());
                      if (!id && musicUrlInput.trim()) { toast.error('الرابط غير صحيح'); return; }
                      const url = id ? musicUrlInput.trim() : '';
                      queueSave(hostProfile.uid, { 'houseConfig.bgMusic': url });
                      toast.success(id ? 'تم تحديث موسيقى البيت! 🎵' : 'تم إيقاف الموسيقى');
                      setShowMusicSetup(false);
                    }}
                    className="bg-purple-500 hover:bg-purple-600 text-white font-black text-xs px-4 py-2 rounded-xl">
                    حفظ
                  </motion.button>
                </div>
              </div>
              {hostProfile?.houseConfig?.bgMusic && (
                <div className="flex items-center gap-2 bg-purple-50 rounded-xl px-3 py-2 text-xs text-purple-600 font-bold">
                  <Music2 className="w-3.5 h-3.5" /> موسيقى حالية: {hostProfile.houseConfig.bgMusic.slice(0, 40)}...
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── BACKGROUND MUSIC PLAYER (hidden YouTube iframe) ── */}
      {(() => {
        const musicId = extractYoutubeId(hostProfile?.houseConfig?.bgMusic || '');
        return musicId && musicPlaying ? (
          <iframe
            className="sr-only"
            src={`https://www.youtube.com/embed/${musicId}?autoplay=1&loop=1&playlist=${musicId}&controls=0`}
            allow="autoplay"
            title="موسيقى البيت"
          />
        ) : null;
      })()}

    </div>
  );
}
