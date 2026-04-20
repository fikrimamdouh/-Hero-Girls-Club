import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Palette, ArrowLeft, Save, Loader2, Sparkles, Dice5, Trophy, Plus, Minus, RotateCw, Trash2 } from 'lucide-react';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ChildProfile, AvatarConfig, HouseConfig, HouseItem } from '../types';
import { toast } from 'sonner';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';

const OPTIONS = {
  body: {
    color: [
      { id: 'bg-pink-300', value: 'bg-pink-300' },
      { id: 'bg-purple-300', value: 'bg-purple-300' },
      { id: 'bg-sky-300', value: 'bg-sky-300' },
      { id: 'bg-amber-300', value: 'bg-amber-300' },
      { id: 'bg-emerald-300', value: 'bg-emerald-300' },
      { id: 'bg-rose-300', value: 'bg-rose-300' },
    ],
    hair: [
      { id: 'hair1', value: '👧' },
      { id: 'hair2', value: '💇‍♀️' },
      { id: 'hair3', value: '👩‍🦰' },
      { id: 'hair4', value: '👱‍♀️' },
      { id: 'hair5', value: '👸' },
      { id: 'hair6', value: '🧚‍♀️' },
    ],
    eyes: [
      { id: 'eyes1', value: '●' },
      { id: 'eyes2', value: '★' },
      { id: 'eyes3', value: '♥' },
      { id: 'eyes4', value: '◠' },
      { id: 'eyes5', value: '✦' },
      { id: 'eyes6', value: '♦' },
    ],
    eyeColor: [
      { id: 'ec_black', value: 'text-slate-900' },
      { id: 'ec_blue', value: 'text-blue-500' },
      { id: 'ec_green', value: 'text-emerald-500' },
      { id: 'ec_brown', value: 'text-amber-800' },
      { id: 'ec_purple', value: 'text-purple-500' },
      { id: 'ec_red', value: 'text-red-500' },
    ]
  },
  clothes: {
    dress: [
      { id: 'dress1', value: '👗' },
      { id: 'dress2', value: '🥋' },
      { id: 'dress3', value: '👘' },
      { id: 'dress4', value: '💃' },
      { id: 'dress5', value: '🎽' },
      { id: 'dress6', value: '🧥' },
    ],
    shoes: [
      { id: 'shoes1', value: '🥿' },
      { id: 'shoes2', value: '👟' },
      { id: 'shoes3', value: '👢' },
      { id: 'shoes4', value: '👡' },
      { id: 'shoes5', value: '🛼' },
      { id: 'shoes6', value: '🩰' },
    ],
    cape: [
      { id: 'cape0', value: '' },
      { id: 'cape1', value: 'bg-red-500' },
      { id: 'cape2', value: 'bg-slate-800' },
      { id: 'cape3', value: 'bg-blue-300' },
      { id: 'cape4', value: 'bg-emerald-500' },
      { id: 'cape5', value: 'bg-purple-600' },
    ]
  },
  magic: {
    crown: [
      { id: 'crown0', value: '' },
      { id: 'crown1', value: '👑' },
      { id: 'crown2', value: '🌸' },
      { id: 'crown3', value: '🎩' },
      { id: 'crown4', value: '🎀' },
      { id: 'crown5', value: '✨' },
    ],
    wand: [
      { id: 'wand0', value: '' },
      { id: 'wand1', value: '🪄' },
      { id: 'wand2', value: '🗡️' },
      { id: 'wand3', value: '🌻' },
      { id: 'wand4', value: '☂️' },
      { id: 'wand5', value: '🏮' },
    ],
    wings: [
      { id: 'wings0', value: '' },
      { id: 'wings1', value: '🦋' },
      { id: 'wings2', value: '🕊️' },
      { id: 'wings3', value: '🔥' },
      { id: 'wings4', value: '🦇' },
      { id: 'wings5', value: '❄️' },
    ]
  },
  room: {
    wall: [
      { id: 'wall1', value: 'bg-pink-200' },
      { id: 'wall2', value: 'bg-emerald-200' },
      { id: 'wall3', value: 'bg-indigo-900' },
      { id: 'wall4', value: 'bg-sky-200' },
      { id: 'wall5', value: 'bg-purple-200' },
      { id: 'wall6', value: 'bg-cyan-800' },
    ],
    furniture: [
      { id: 'furn1', value: '🛏️' },
      { id: 'furn2', value: '⛺' },
      { id: 'furn3', value: '🛋️' },
      { id: 'furn4', value: '🛬' },
      { id: 'furn5', value: '🪑' },
      { id: 'furn6', value: '🧸' },
    ],
    decorations: [
      { id: 'dec1', value: '✨' },
      { id: 'dec2', value: '🏮' },
      { id: 'dec3', value: '🌙' },
      { id: 'dec4', value: '☀️' },
      { id: 'dec5', value: '🎈' },
      { id: 'dec6', value: '🖼️' },
    ]
  }
};

const TABS = [
  { id: 'body', icon: '👤', label: 'الجسم' },
  { id: 'clothes', icon: '👗', label: 'الملابس' },
  { id: 'magic', icon: '🪄', label: 'السحر' },
  { id: 'room', icon: '🏠', label: 'الغرفة' },
];

const CATEGORY_LABELS: Record<string, string> = {
  color: 'البشرة', hair: 'الشعر', eyes: 'العيون', eyeColor: 'لون العيون',
  dress: 'اللباس', shoes: 'الحذاء', cape: 'العباءة',
  crown: 'الرأس', wand: 'الأداة', wings: 'الأجنحة',
  wall: 'الخلفية', furniture: 'الأثاث', decorations: 'الزينة'
};

const DESIGN_CHALLENGES = [
  { id: 'royal', title: 'تحدي الملكة', hint: 'استخدمي تاجًا وأجنحة ولمسة بنفسجية.' },
  { id: 'nature', title: 'تحدي الطبيعة', hint: 'اختاري ألوانًا خضراء وإكسسوارات هادئة.' },
  { id: 'night', title: 'تحدي السماء الليلية', hint: 'درجات داكنة مع نجوم وإضاءة قمر.' },
];

const THEME_PRESETS = [
  {
    id: 'sunrise',
    title: 'شروق البطلات',
    apply: {
      body: { color: 'bg-amber-300', hair: '👱‍♀️', eyes: '✦', eyeColor: 'text-amber-800' },
      clothes: { dress: '👗', shoes: '🩰', cape: 'bg-red-500' },
      magic: { crown: '🌸', wand: '🌻', wings: '🦋' },
      room: { wall: 'bg-pink-200', furniture: '', decorations: '' }
    }
  },
  {
    id: 'moonlight',
    title: 'ضوء القمر',
    apply: {
      body: { color: 'bg-sky-300', hair: '🧚‍♀️', eyes: '★', eyeColor: 'text-purple-500' },
      clothes: { dress: '👘', shoes: '👢', cape: 'bg-slate-800' },
      magic: { crown: '✨', wand: '🪄', wings: '❄️' },
      room: { wall: 'bg-indigo-900', furniture: '', decorations: '' }
    }
  }
];

export default function CharacterStudio() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [activeTab, setActiveTab] = useState('body');
  const [activeCategory, setActiveCategory] = useState('color');
  const [saving, setSaving] = useState(false);
  const [activeChallenge, setActiveChallenge] = useState(DESIGN_CHALLENGES[0]);
  const [completedChallenges, setCompletedChallenges] = useState<string[]>([]);
  const [placedItems, setPlacedItems] = useState<HouseItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);

  const [builderState, setBuilderState] = useState({
    body: { color: 'bg-pink-300', hair: '👧', eyes: '●', eyeColor: 'text-slate-900' },
    clothes: { dress: '👗', shoes: '🥿', cape: '' },
    magic: { crown: '👑', wand: '🪄', wings: '' },
    room: { wall: 'bg-pink-200', furniture: '', decorations: '' }
  });

  useEffect(() => {
    const activeChildStr = localStorage.getItem('active_child');
    if (!activeChildStr) {
      navigate('/');
      return;
    }
    
    const activeChild = JSON.parse(activeChildStr) as ChildProfile;
    
    const fetchProfile = async () => {
      try {
        const docRef = doc(db, 'children_profiles', activeChild.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data() as ChildProfile;
          setProfile(data);
          
          if (data.avatar) {
            setBuilderState(prev => ({
              ...prev,
              body: { 
                color: data.avatar.color || prev.body.color, 
                hair: data.avatar.hairStyle || prev.body.hair, 
                eyes: data.avatar.eyes || prev.body.eyes,
                eyeColor: data.avatar.eyeColor || prev.body.eyeColor
              },
              clothes: { 
                dress: data.avatar.dressStyle || prev.clothes.dress, 
                shoes: data.avatar.shoes || prev.clothes.shoes, 
                cape: data.avatar.cape || prev.clothes.cape 
              },
              magic: { 
                crown: data.avatar.accessory || prev.magic.crown, 
                wand: data.avatar.wand || prev.magic.wand, 
                wings: data.avatar.wings || prev.magic.wings 
              }
            }));
          }
          if (data.houseConfig) {
            setPlacedItems([
              ...(data.houseConfig.furniture || []),
              ...(data.houseConfig.decorations || [])
            ]);
            setBuilderState(prev => ({
              ...prev,
              room: {
                wall: data.houseConfig?.wallpaper || prev.room.wall,
                furniture: '',
                decorations: ''
              }
            }));
          }
        }
      } catch (error) {
        handleFirestoreError(error, OperationType.GET, 'children_profiles');
      }
    };
    
    fetchProfile();
  }, [navigate]);

  useEffect(() => {
    // Reset active category when tab changes
    const firstCategory = Object.keys(OPTIONS[activeTab as keyof typeof OPTIONS])[0];
    setActiveCategory(firstCategory);
  }, [activeTab]);

  const updateBuilderState = (tabId: string, category: string, value: string) => {
    if (tabId === 'room' && (category === 'furniture' || category === 'decorations')) {
      const newItem: HouseItem = {
        id: Math.random().toString(36).substr(2, 9),
        type: category,
        emoji: value,
        x: 50,
        y: 50,
        scale: 1,
        rotation: 0
      };
      setPlacedItems(prev => [...prev, newItem]);
      setSelectedItemId(newItem.id);
      return;
    }
    setBuilderState(prev => ({
      ...prev,
      [tabId]: {
        ...prev[tabId as keyof typeof prev],
        [category]: value
      }
    }));
  };

  const handleUpdateItem = (id: string, updates: Partial<HouseItem>) => {
    setPlacedItems(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };

  const handleRemoveItem = (id: string) => {
    setPlacedItems(prev => prev.filter(item => item.id !== id));
    if (selectedItemId === id) setSelectedItemId(null);
  };

  const randomizeCurrentTab = () => {
    const categories = Object.keys(OPTIONS[activeTab as keyof typeof OPTIONS]);
    setBuilderState(prev => {
      const next = { ...prev };
      categories.forEach((category) => {
        const list = (OPTIONS[activeTab as keyof typeof OPTIONS] as any)[category] || [];
        const randomOption = list[Math.floor(Math.random() * list.length)];
        if (randomOption) {
          (next as any)[activeTab][category] = randomOption.value;
        }
      });
      return next;
    });
  };

  const applyPreset = (presetId: string) => {
    const selectedPreset = THEME_PRESETS.find((preset) => preset.id === presetId);
    if (!selectedPreset) return;
    setBuilderState(selectedPreset.apply as typeof builderState);
    toast.success(`تم تطبيق ثيم ${selectedPreset.title} ✨`);
  };

  const completeChallenge = () => {
    if (completedChallenges.includes(activeChallenge.id)) {
      toast.info('هذا التحدي مكتمل بالفعل!');
      return;
    }
    setCompletedChallenges(prev => [...prev, activeChallenge.id]);
    toast.success(`أحسنتِ! أنهيتِ ${activeChallenge.title} وربحتِ شارة تصميم 👑`);
  };

  const styleScore = Math.min(100, 40 + (completedChallenges.length * 20) + (builderState.magic.wings ? 10 : 0) + (builderState.clothes.cape ? 10 : 0));

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      const updatedAvatar: AvatarConfig = {
        color: builderState.body.color,
        hairStyle: builderState.body.hair,
        eyes: builderState.body.eyes,
        eyeColor: builderState.body.eyeColor,
        dressStyle: builderState.clothes.dress,
        shoes: builderState.clothes.shoes,
        cape: builderState.clothes.cape,
        accessory: builderState.magic.crown,
        wings: builderState.magic.wings,
        wand: builderState.magic.wand,
      };

      const updatedHouseConfig: HouseConfig = {
        ...(profile.houseConfig || { theme: 'castle', furniture: [], decorations: [], wallpaper: 'bg-pink-100', floor: 'bg-amber-100' }),
        wallpaper: builderState.room.wall,
        furniture: placedItems.filter(item => item.type === 'furniture'),
        decorations: placedItems.filter(item => item.type === 'decorations')
      };

      await updateDoc(doc(db, 'children_profiles', profile.uid), {
        avatar: updatedAvatar,
        houseConfig: updatedHouseConfig
      });
      
      const updatedProfile = { ...profile, avatar: updatedAvatar, houseConfig: updatedHouseConfig };
      localStorage.setItem('active_child', JSON.stringify(updatedProfile));
      
      toast.success('تم الحفظ بنجاح! ✨');
      setTimeout(() => navigate('/child'), 1500);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'children_profiles');
      toast.error('حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-fuchsia-50 via-sky-50 to-indigo-100 flex flex-col font-sans overflow-hidden" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 left-0 right-0 z-50 p-4 md:p-5 flex justify-between items-center bg-white/70 backdrop-blur-xl border-b border-white/70 shadow-sm">
        <button onClick={() => navigate('/child')} className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-600 hover:text-fuchsia-600 shadow border border-slate-100 transition-transform hover:scale-105">
          <ArrowLeft className="w-6 h-6" />
        </button>
        <h1 className="text-lg md:text-2xl font-black text-slate-800 flex items-center gap-2">
          <Palette className="w-5 h-5 text-fuchsia-500" />
          غرفة التصميم الاحترافية
        </h1>
        <button onClick={handleSave} disabled={saving} className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg transition-transform hover:scale-105 flex items-center gap-2 disabled:opacity-50">
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />} حفظ التصميم
        </button>
      </header>

      <div className="right-4 left-4 z-40 pointer-events-none mt-4 px-4">
        <div className="max-w-5xl mx-auto bg-white/85 backdrop-blur-md rounded-3xl p-4 border border-white/80 shadow-xl pointer-events-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <p className="text-slate-500 text-sm font-bold">بطولة غرفة التصميم</p>
              <p className="text-slate-800 font-black">{activeChallenge.title}: <span className="text-fuchsia-600">{activeChallenge.hint}</span></p>
            </div>
            <div className="flex gap-2">
              {DESIGN_CHALLENGES.map((challenge) => (
                <button
                  key={challenge.id}
                  onClick={() => setActiveChallenge(challenge)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold ${activeChallenge.id === challenge.id ? 'bg-fuchsia-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                  {challenge.title}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-3">
            <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
              <span>نقاط التصميم</span>
              <span>{styleScore}/100</span>
            </div>
            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-fuchsia-500 to-sky-500" style={{ width: `${styleScore}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Preview Area (Top Half) */}
      <div className="flex-1 px-4 md:px-8 pb-4">
        <div className={`h-full relative transition-colors duration-1000 ${builderState.room.wall} flex items-center justify-center overflow-hidden mt-4 rounded-[2.5rem] border-4 border-white/70 shadow-2xl`}>
        {/* Background Elements */}
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-10 right-10 w-32 h-32 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-fuchsia-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        </div>

        {/* Room Items */}
        <div id="room-container" className="absolute inset-0" onClick={() => setSelectedItemId(null)}>
          {placedItems.map(item => (
            <motion.div
              key={item.id}
              drag
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
              onClick={(e) => {
                e.stopPropagation();
                setSelectedItemId(item.id);
              }}
              animate={{ x: 0, y: 0 }}
              transition={{ duration: 0 }}
              style={{ left: `${item.x}%`, top: `${item.y}%` }}
              className={`absolute text-7xl md:text-8xl cursor-grab active:cursor-grabbing z-20 group`}
            >
              <div className="relative flex items-center justify-center">
                <div style={{ transform: `scale(${item.scale || 1}) rotate(${item.rotation || 0}deg)`, transition: 'transform 0.2s' }}>
                  {item.emoji}
                </div>
                {selectedItemId === item.id && (
                  <div className="absolute -top-20 left-1/2 -translate-x-1/2 flex gap-2 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-2xl z-50 border-2 border-slate-100">
                    <button onClick={(e) => { e.stopPropagation(); handleUpdateItem(item.id, { scale: Math.min(3, (item.scale || 1) + 0.2) }); }} className="w-10 h-10 flex items-center justify-center bg-emerald-100 text-emerald-600 rounded-full hover:bg-emerald-200"><Plus className="w-5 h-5" /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleUpdateItem(item.id, { scale: Math.max(0.5, (item.scale || 1) - 0.2) }); }} className="w-10 h-10 flex items-center justify-center bg-amber-100 text-amber-600 rounded-full hover:bg-amber-200"><Minus className="w-5 h-5" /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleUpdateItem(item.id, { rotation: ((item.rotation || 0) + 45) % 360 }); }} className="w-10 h-10 flex items-center justify-center bg-blue-100 text-blue-600 rounded-full hover:bg-blue-200"><RotateCw className="w-5 h-5" /></button>
                    <button onClick={(e) => { e.stopPropagation(); handleRemoveItem(item.id); }} className="w-10 h-10 flex items-center justify-center bg-red-100 text-red-600 rounded-full hover:bg-red-200"><Trash2 className="w-5 h-5" /></button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Character */}
        <motion.div 
          className="relative z-10 flex flex-col items-center justify-center mt-10 bg-white/10 rounded-[2rem] p-6 border border-white/30 backdrop-blur-sm"
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Wings */}
          {builderState.magic.wings && (
            <motion.div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl md:text-9xl -z-10 opacity-80"
              animate={{ scale: [1, 1.1, 1], rotate: [-5, 5, -5] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              {builderState.magic.wings}
            </motion.div>
          )}

          {/* Cape */}
          {builderState.clothes.cape && (
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-40 md:w-40 md:h-48 ${builderState.clothes.cape} rounded-b-full -z-5 opacity-90`} />
          )}

          {/* Body/Head */}
          <div className={`w-32 h-32 md:w-40 md:h-40 ${builderState.body.color} rounded-full flex flex-col items-center justify-center relative shadow-xl border-4 border-white/50`}>
            {/* Crown */}
            {builderState.magic.crown && (
              <div className="absolute -top-12 text-5xl md:text-6xl drop-shadow-md z-20">
                {builderState.magic.crown}
              </div>
            )}
            
            {/* Hair */}
            <div className="absolute -top-6 text-6xl md:text-7xl drop-shadow-sm z-10">
              {builderState.body.hair}
            </div>

            {/* Face */}
            <div className="flex gap-4 mt-2 z-10">
              <span className={`text-2xl md:text-3xl font-black ${builderState.body.eyeColor}`}>{builderState.body.eyes}</span>
              <span className={`text-2xl md:text-3xl font-black ${builderState.body.eyeColor}`}>{builderState.body.eyes}</span>
            </div>
            <div className="w-4 h-2 border-b-4 border-pink-400 rounded-full mt-2 z-10 opacity-60" />
          </div>

          {/* Dress */}
          <div className="text-7xl md:text-8xl -mt-4 drop-shadow-lg z-10">
            {builderState.clothes.dress}
          </div>

          {/* Shoes */}
          <div className="text-4xl md:text-5xl -mt-4 drop-shadow-md z-0">
            {builderState.clothes.shoes}
          </div>

          {/* Wand */}
          {builderState.magic.wand && (
            <motion.div 
              className="absolute top-1/2 -left-12 text-5xl md:text-6xl drop-shadow-lg z-20"
              animate={{ rotate: [-10, 10, -10] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              {builderState.magic.wand}
            </motion.div>
          )}
        </motion.div>
        </div>
      </div>

      {/* Bottom Drawer (Controls) */}
      <div className="bg-white rounded-t-[2.5rem] shadow-[0_-12px_45px_rgba(45,55,72,0.12)] relative z-20 flex flex-col h-[46vh] md:h-[41vh] border-t-2 border-white/70">
        <div className="px-4 pt-3 flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-fuchsia-50 rounded-t-[2.5rem]">
          <div className="flex gap-2">
            <button onClick={randomizeCurrentTab} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm">
              <Dice5 className="w-4 h-4" />
              مزج تلقائي
            </button>
            <button onClick={completeChallenge} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-700 font-bold text-sm">
              <Trophy className="w-4 h-4" />
              إنهاء التحدي
            </button>
          </div>
          <div className="text-xs font-bold text-slate-500">
            تم إنجاز {completedChallenges.length}/{DESIGN_CHALLENGES.length} تحديات
          </div>
        </div>

        <div className="px-4 py-3 border-b border-slate-100 bg-white">
          <p className="text-xs font-bold text-slate-500 mb-2">ثيمات جاهزة</p>
          <div className="flex gap-2 flex-wrap">
            {THEME_PRESETS.map((preset) => (
              <button key={preset.id} onClick={() => applyPreset(preset.id)} className="px-3 py-2 rounded-xl bg-fuchsia-50 text-fuchsia-700 hover:bg-fuchsia-100 font-bold text-sm">
                {preset.title}
              </button>
            ))}
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex justify-around p-4 border-b-2 border-slate-100">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-1 p-2 transition-all ${activeTab === tab.id ? 'text-sky-500 scale-110' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <span className="text-3xl drop-shadow-sm">{tab.icon}</span>
              <span className="text-xs font-bold">{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div layoutId="activeTab" className="w-1.5 h-1.5 bg-sky-500 rounded-full mt-1" />
              )}
            </button>
          ))}
        </div>

        {/* Categories & Items */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Sub-categories */}
          <div className="flex gap-2 p-4 overflow-x-auto snap-x hide-scrollbar">
            {Object.keys(OPTIONS[activeTab as keyof typeof OPTIONS]).map(category => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full font-bold whitespace-nowrap snap-start transition-colors ${activeCategory === category ? 'bg-sky-100 text-sky-600' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                {CATEGORY_LABELS[category] || category}
              </button>
            ))}
          </div>

          {/* Items Grid */}
          <div className="flex-1 overflow-y-auto p-4 pt-0">
            <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
              {(OPTIONS[activeTab as keyof typeof OPTIONS] as any)[activeCategory]?.map((option: any) => {
                const isSelected = (builderState[activeTab as keyof typeof builderState] as any)[activeCategory] === option.value;
                
                return (
                  <button
                    key={option.id}
                    onClick={() => updateBuilderState(activeTab, activeCategory, option.value)}
                    className={`aspect-square rounded-2xl flex items-center justify-center text-4xl transition-all ${isSelected ? 'bg-sky-50 border-4 border-sky-400 scale-105 shadow-md' : 'bg-slate-50 border-2 border-slate-100 hover:bg-slate-100 hover:scale-105'}`}
                  >
                    {/* Render color/bg differently than emoji */}
                    {option.value.startsWith('bg-') ? (
                      <div className={`w-10 h-10 rounded-full ${option.value} shadow-inner border-2 border-white/50`} />
                    ) : option.value.startsWith('text-') ? (
                      <div className={`w-8 h-8 rounded-full bg-current ${option.value} shadow-inner`} />
                    ) : (
                      <span className="drop-shadow-sm">{option.value || '🚫'}</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
