import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Sparkles, ArrowRight, Star, Coffee, Play, Moon, Wand2 } from 'lucide-react';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ChildProfile, MagicPet } from '../types';
import { toast } from 'sonner';

const PET_TYPES = [
  { id: 'dragon', name: 'تنين صغير', icon: '🐲', color: 'bg-emerald-400' },
  { id: 'unicorn', name: 'يونيكورن سحري', icon: '🦄', color: 'bg-pink-400' },
  { id: 'cat', name: 'قطة النجوم', icon: '🐱', color: 'bg-purple-400' },
  { id: 'fox', name: 'ثعلب النار', icon: '🦊', color: 'bg-orange-400' },
  { id: 'owl', name: 'بومة الحكمة', icon: '🦉', color: 'bg-indigo-400' },
];

import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';

export default function MagicPetPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ChildProfile | null>(null);
  const [pet, setPet] = useState<MagicPet | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNaming, setShowNaming] = useState(false);
  const [newPetName, setNewPetName] = useState('');
  const [selectedType, setSelectedType] = useState(PET_TYPES[0]);

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
          if (data.pet) setPet(data.pet);
        }
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, `children_profiles/${activeChild.uid}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleAdopt = async () => {
    if (!profile || !newPetName.trim()) return;

    const newPet: MagicPet = {
      id: Math.random().toString(36).substr(2, 9),
      name: newPetName,
      type: selectedType.id,
      level: 1,
      experience: 0,
      mood: 'happy',
      lastFed: Date.now()
    };

    try {
      await updateDoc(doc(db, 'children_profiles', profile.uid), {
        pet: newPet
      });
      setPet(newPet);
      setShowNaming(false);
      toast.success(`مبروك! لقد تبنيتِ ${newPetName}!`);
    } catch (error) {
      toast.error('حدث خطأ أثناء التبني');
    }
  };

  const handleInteract = async (action: 'feed' | 'play' | 'sleep') => {
    if (!pet || !profile) return;

    let newExperience = pet.experience + 10;
    let newLevel = pet.level;
    let newMood = pet.mood;

    if (newExperience >= 100) {
      newExperience = 0;
      newLevel += 1;
      toast.success(`رائع! ${pet.name} ارتقى للمستوى ${newLevel}!`);
    }

    if (action === 'feed') newMood = 'happy';
    if (action === 'play') newMood = 'playful';
    if (action === 'sleep') newMood = 'sleepy';

    const updatedPet: MagicPet = {
      ...pet,
      experience: newExperience,
      level: newLevel,
      mood: newMood,
      lastFed: action === 'feed' ? Date.now() : pet.lastFed
    };

    try {
      await updateDoc(doc(db, 'children_profiles', profile.uid), {
        pet: updatedPet
      });
      setPet(updatedPet);
    } catch (error) {
      toast.error('حدث خطأ في التفاعل');
    }
  };

  if (loading) return <div className="min-h-screen bg-sky-50 flex items-center justify-center"><Loader /></div>;

  return (
    <div className="min-h-screen bg-[#fff5f7] p-4 md:p-8 relative overflow-hidden">
      {/* Magical Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <motion.div 
          animate={{ y: [0, -30, 0], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-20 left-20 w-96 h-96 bg-pink-200/20 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ y: [0, 30, 0], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-20 right-20 w-[30rem] h-[30rem] bg-purple-200/20 rounded-full blur-3xl"
        />
      </div>

      <header className="max-w-4xl mx-auto flex items-center justify-between mb-8 relative z-10">
        <button 
          onClick={() => navigate('/child')} 
          className="bg-white/80 backdrop-blur-md p-3 rounded-2xl shadow-md text-princess-pink hover:bg-white transition-all border-2 border-pink-100"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
        <div className="princess-card px-8 py-4">
          <h1 className="text-2xl md:text-3xl font-bold text-princess-purple flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-princess-gold" />
            مختبر الرفيق السحري
          </h1>
        </div>
        <div className="w-12 h-12" />
      </header>

      <main className="max-w-4xl mx-auto relative z-10">
        {!pet ? (
          <div className="bg-white/80 backdrop-blur-md rounded-[3rem] p-12 shadow-2xl border-4 border-pink-100 text-center">
            {!showNaming ? (
              <>
                <h2 className="text-3xl font-bold text-princess-purple mb-8">اختاري رفيقكِ السحري</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-12">
                  {PET_TYPES.map(type => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type)}
                      className={`p-6 rounded-3xl transition-all transform hover:scale-110 ${selectedType.id === type.id ? 'bg-pink-100 ring-4 ring-princess-pink' : 'bg-white/50'}`}
                    >
                      <div className="text-6xl mb-2">{type.icon}</div>
                      <div className="font-bold text-princess-purple">{type.name}</div>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowNaming(true)}
                  className="princess-button py-4 px-12 text-xl"
                >
                  اختيار هذا الرفيق
                </button>
              </>
            ) : (
              <div className="max-w-md mx-auto">
                <div className="text-9xl mb-8">{selectedType.icon}</div>
                <h2 className="text-3xl font-bold text-princess-purple mb-4">ماذا ستسمين رفيقكِ؟</h2>
                <input
                  type="text"
                  value={newPetName}
                  onChange={(e) => setNewPetName(e.target.value)}
                  placeholder="اسم الرفيق السحري..."
                  className="w-full p-4 rounded-2xl border-2 border-pink-200 text-center text-xl mb-8 focus:border-princess-pink outline-none bg-white/50"
                />
                <div className="flex gap-4">
                  <button onClick={() => setShowNaming(false)} className="flex-1 py-4 bg-gray-100 rounded-2xl font-bold text-gray-500">تراجع</button>
                  <button onClick={handleAdopt} className="flex-2 py-4 princess-button">تبني الرفيق!</button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Pet Display */}
            <div className="bg-white/80 backdrop-blur-md p-12 rounded-[3rem] shadow-2xl border-4 border-pink-100 flex flex-col items-center justify-center relative overflow-hidden">
              <div className={`w-64 h-64 ${PET_TYPES.find(t => t.id === pet.type)?.color} rounded-full flex items-center justify-center text-9xl shadow-inner relative border-8 border-white/30`}>
                <motion.div
                  animate={{ 
                    y: [0, -20, 0],
                    scale: pet.mood === 'playful' ? [1, 1.1, 1] : 1
                  }}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  {PET_TYPES.find(t => t.id === pet.type)?.icon}
                </motion.div>
                {pet.mood === 'sleepy' && <div className="absolute top-0 right-0 text-4xl animate-bounce">💤</div>}
                {pet.mood === 'happy' && <div className="absolute -top-4 text-4xl animate-pulse">✨</div>}
              </div>
              
              <div className="mt-8 text-center">
                <h2 className="text-4xl font-bold text-princess-purple mb-2">{pet.name}</h2>
                <div className="flex items-center justify-center gap-4">
                  <div className="bg-pink-100 px-4 py-1 rounded-full text-princess-pink font-bold">المستوى {pet.level}</div>
                  <div className="flex items-center gap-1 text-princess-pink">
                    <Heart className="w-5 h-5 fill-current" />
                    <span className="font-bold">{pet.mood === 'happy' ? 'سعيد' : pet.mood === 'sleepy' ? 'متعب' : pet.mood === 'playful' ? 'مرح' : 'جائع'}</span>
                  </div>
                </div>
              </div>

              <div className="w-full mt-8 space-y-2">
                <div className="flex justify-between text-sm font-bold text-princess-purple">
                  <span>الخبرة</span>
                  <span>{pet.experience}%</span>
                </div>
                <div className="w-full h-4 bg-pink-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${pet.experience}%` }}
                    className="h-full bg-princess-pink"
                  />
                </div>
              </div>
            </div>

            {/* Interactions */}
            <div className="space-y-6">
              <InteractionCard 
                title="إطعام" 
                icon={<Coffee className="w-8 h-8" />} 
                color="bg-orange-500" 
                onClick={() => handleInteract('feed')}
                description="أطعمي رفيقكِ ليكون سعيداً"
              />
              <InteractionCard 
                title="لعب" 
                icon={<Play className="w-8 h-8" />} 
                color="bg-princess-pink" 
                onClick={() => handleInteract('play')}
                description="العبوا معاً لزيادة الخبرة"
              />
              <InteractionCard 
                title="نوم" 
                icon={<Moon className="w-8 h-8" />} 
                color="bg-princess-purple" 
                onClick={() => handleInteract('sleep')}
                description="دعي رفيقكِ يرتاح قليلاً"
              />
              
              <div className="bg-white/80 backdrop-blur-md p-8 rounded-3xl shadow-xl border-2 border-pink-100">
                <h3 className="text-xl font-bold text-princess-purple mb-4 flex items-center gap-2">
                  <Wand2 className="w-6 h-6 text-princess-gold" />
                  نصيحة سحرية
                </h3>
                <p className="text-pink-600 italic leading-relaxed">"كلما اعتنيتِ برفيقكِ أكثر، زادت قوته السحرية وساعدكِ في مغامراتكِ القادمة!"</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function InteractionCard({ title, icon, color, onClick, description }: { title: string, icon: any, color: string, onClick: () => void, description: string }) {
  return (
    <button
      onClick={onClick}
      className="w-full bg-white/80 backdrop-blur-md p-6 rounded-3xl shadow-lg border-2 border-transparent hover:border-pink-200 transition-all flex items-center gap-6 group"
    >
      <div className={`${color} p-4 rounded-2xl text-white group-hover:scale-110 transition-transform shadow-md`}>
        {icon}
      </div>
      <div className="text-right">
        <div className="text-2xl font-bold text-princess-purple">{title}</div>
        <div className="text-princess-pink text-sm">{description}</div>
      </div>
    </button>
  );
}

function Loader() {
  return <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-princess-pink"></div>;
}
