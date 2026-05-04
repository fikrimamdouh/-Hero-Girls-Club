import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc, collection, query, where, onSnapshot, updateDoc, setDoc } from 'firebase/firestore';
import { UserProfile, VisitRequest } from './types';
import { Toaster } from 'sonner';
import ErrorBoundary from './components/ErrorBoundary';
import IdeaChatbot from './components/IdeaChatbot';

// Pages (to be created)
import LandingPage from './pages/LandingPage';
import ParentDashboard from './pages/ParentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ChildDashboard from './pages/ChildDashboard';
import FriendsChat from './pages/FriendsChat';
import VillageView from './pages/VillageView';
import CharacterStudio from './pages/CharacterStudio';
import StoryWorld from './pages/StoryWorld';
import MagicAcademy from './pages/MagicAcademy';
import StarsPage from './pages/StarsPage';
import MagicPet from './pages/MagicPet';
import WonderJournal from './pages/WonderJournal';
import TermsPage from './pages/TermsPage';
import ContactPage from './pages/ContactPage';
import MagicLearning from './pages/MagicLearning';
import HeroHouse from './pages/HeroHouse';
import ColoringStudio from './pages/ColoringStudio';
import CinemaView from './pages/CinemaView';
import ValuesView from './pages/ValuesView';
import AIDesignStudio from './pages/AIDesignStudio';
import ResearchCenterPage from './pages/ResearchCenterPage';
import KidsGamesPage from './pages/KidsGamesPage';
import MariaGamesView from './pages/MariaGamesView';
import { DRAWING_GAMES } from './data/mariaGamesData';
import KidsVideosPage from './pages/KidsVideosPage';
import MemoryMatch from './features/games/MemoryMatch';
import FruitCatcher from './features/games/FruitCatcher';
import SimonSays from './features/games/SimonSays';
import TicTacToe from './features/games/TicTacToe';
import PetMaker from './features/games/PetMaker';
import WordScramble from './features/games/WordScramble';
import WhackAStar from './features/games/WhackAStar';
import MathHero from './features/games/MathHero';
import PianoKids from './features/games/PianoKids';
import ColorMix from './features/games/ColorMix';
import AnimalQuiz from './features/games/AnimalQuiz';
import ReenaWelcome from './components/ReenaWelcome';
import GlobalCallListener from './components/GlobalCallListener';
import GlobalPushRegister from './components/GlobalPushRegister';
import HomeActivities from './pages/HomeActivities';
import DressUpGame from './pages/DressUpGame';
import GameIframe from './pages/GameIframe';
import MultiplayerArena from './pages/MultiplayerArena';

function ChatbotWrapper() {
  const location = useLocation();
  const isChildRoute = location.pathname !== '/' && location.pathname !== '/parent' && location.pathname !== '/admin' && location.pathname !== '/terms';
  const hasActiveChild = !!localStorage.getItem('active_child');
  
  if (isChildRoute && hasActiveChild) {
    return <IdeaChatbot />;
  }
  return null;
}

function PresenceTracker() {
  const location = useLocation();
  const isChildRoute = location.pathname !== '/' && location.pathname !== '/parent' && location.pathname !== '/admin' && location.pathname !== '/terms';
  
  useEffect(() => {
    const activeChildStr = localStorage.getItem('active_child');
    if (!activeChildStr || !isChildRoute) return;

    let activeChild;
    try {
      activeChild = JSON.parse(activeChildStr);
    } catch (e) {
      console.error('Failed to parse active_child', e);
      return;
    }

    if (!activeChild?.uid) return;

    const statusRef = doc(db, 'online_status', activeChild.uid);

    const updatePresence = async (isOnline: boolean) => {
      try {
        await updateDoc(statusRef, {
          lastActive: Date.now(),
          isOnline
        });
      } catch (err) {
        // If document doesn't exist, create it
        try {
          await setDoc(statusRef, {
            uid: activeChild.uid,
            name: activeChild.name,
            heroName: activeChild.heroName,
            avatar: activeChild.avatar || null,
            lastActive: Date.now(),
            isOnline
          }, { merge: true });
        } catch (e) {
          console.error('Failed to update presence', e);
        }
      }
    };

    // Set online on mount
    updatePresence(true);

    // Keep alive interval
    const interval = setInterval(() => {
      updatePresence(true);
    }, 60000); // Every 1 minute

    // Handle visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updatePresence(true);
      } else {
        updatePresence(false);
      }
    };

    // Handle beforeunload
    const handleBeforeUnload = () => {
      updatePresence(false);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      updatePresence(false);
    };
  }, [isChildRoute]);

  return null;
}

export default function App() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data() as UserProfile);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const isChildLoggedIn = () => !!localStorage.getItem('active_child');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-pink-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-pink-50 font-sans" dir="rtl">
          <PresenceTracker />
          <GlobalCallListener />
          <GlobalPushRegister />
          <ReenaWelcome />
          <Routes>
            <Route path="/" element={<LandingPage user={user} />} />
            <Route path="/terms" element={<TermsPage />} />
            <Route path="/contact" element={<ContactPage />} />
            
            {/* Parent Routes */}
            <Route 
              path="/parent" 
              element={user?.role === 'parent' ? <ParentDashboard /> : <Navigate to="/" />} 
            />

            {/* Admin Route */}
            <Route 
              path="/admin" 
              element={user?.email === 'rorofikri@gmail.com' ? <AdminDashboard /> : <Navigate to="/" />} 
            />
            
            {/* Child Routes */}
            <Route 
              path="/child" 
              element={isChildLoggedIn() ? <ChildDashboard /> : <Navigate to="/" />} 
            />
            <Route path="/friends" element={isChildLoggedIn() ? <FriendsChat /> : <Navigate to="/" />} />
            <Route path="/village" element={isChildLoggedIn() ? <VillageView /> : <Navigate to="/" />} />
            <Route path="/studio" element={isChildLoggedIn() ? <CharacterStudio /> : <Navigate to="/" />} />
            <Route path="/stories" element={isChildLoggedIn() ? <StoryWorld /> : <Navigate to="/" />} />
            <Route path="/academy" element={isChildLoggedIn() ? <MagicAcademy /> : <Navigate to="/" />} />
            <Route path="/stars" element={isChildLoggedIn() ? <StarsPage /> : <Navigate to="/" />} />
            <Route path="/pet" element={isChildLoggedIn() ? <MagicPet /> : <Navigate to="/" />} />
            <Route path="/journal" element={isChildLoggedIn() ? <WonderJournal /> : <Navigate to="/" />} />
            <Route path="/learning" element={isChildLoggedIn() ? <MagicLearning /> : <Navigate to="/" />} />
            <Route path="/house/:visitId" element={isChildLoggedIn() ? <HeroHouse /> : <Navigate to="/" />} />
            <Route path="/coloring" element={isChildLoggedIn() ? <ColoringStudio /> : <Navigate to="/" />} />
            <Route path="/cinema" element={isChildLoggedIn() ? <CinemaView /> : <Navigate to="/" />} />
            <Route path="/values" element={isChildLoggedIn() ? <ValuesView /> : <Navigate to="/" />} />
            <Route path="/arena" element={isChildLoggedIn() ? <MultiplayerArena /> : <Navigate to="/" />} />
            <Route path="/ai-design" element={isChildLoggedIn() ? <AIDesignStudio /> : <Navigate to="/" />} />
            <Route path="/research-center" element={isChildLoggedIn() ? <ResearchCenterPage /> : <Navigate to="/" />} />
            <Route path="/games" element={isChildLoggedIn() ? <KidsGamesPage /> : <Navigate to="/" />} />
            <Route path="/maria-games" element={isChildLoggedIn() ? <MariaGamesView /> : <Navigate to="/" />} />
            <Route path="/drawing-games" element={isChildLoggedIn() ? (
              <MariaGamesView
                games={DRAWING_GAMES}
                title="ركن الرسم والتلوين"
                emoji="🎨"
                navBarFromColor="from-fuchsia-500"
                navBarToColor="to-purple-600"
                tabsBarColor="bg-purple-500"
                tabsActiveBg="bg-purple-700"
                tabsHoverBg="hover:bg-purple-700/60"
                searchPlaceholder="ابحثي عن لعبة رسم..."
              />
            ) : <Navigate to="/" />} />
            <Route path="/games/harmony" element={isChildLoggedIn() ? <GameIframe src="/games/harmony/index.html" title="هارموني للرسم" /> : <Navigate to="/" />} />
            <Route path="/games/mdraw" element={isChildLoggedIn() ? <GameIframe src="/games/mdraw/index.html" title="استوديو الفن SVG" /> : <Navigate to="/" />} />
            <Route path="/games/sigpad" element={isChildLoggedIn() ? <GameIframe src="/games/sigpad/index.html" title="لوحة التوقيع" /> : <Navigate to="/" />} />
            <Route path="/games/mpaint" element={isChildLoggedIn() ? <GameIframe src="/games/mpaint/index.html" title="استوديو miniPaint الاحترافي" /> : <Navigate to="/" />} />
            <Route path="/games/jspaint" element={isChildLoggedIn() ? <GameIframe src="/games/jspaint/index.html" title="الرسام الكلاسيكي" /> : <Navigate to="/" />} />
            <Route path="/videos" element={isChildLoggedIn() ? <KidsVideosPage /> : <Navigate to="/" />} />
            <Route path="/games/memory" element={isChildLoggedIn() ? <MemoryMatch /> : <Navigate to="/" />} />
            <Route path="/games/fruit-catcher" element={isChildLoggedIn() ? <FruitCatcher /> : <Navigate to="/" />} />
            <Route path="/games/simon" element={isChildLoggedIn() ? <SimonSays /> : <Navigate to="/" />} />
            <Route path="/games/tictactoe" element={isChildLoggedIn() ? <TicTacToe /> : <Navigate to="/" />} />
            <Route path="/games/petmaker" element={isChildLoggedIn() ? <PetMaker /> : <Navigate to="/" />} />
            <Route path="/games/words" element={isChildLoggedIn() ? <WordScramble /> : <Navigate to="/" />} />
            <Route path="/games/math-hero" element={isChildLoggedIn() ? <MathHero /> : <Navigate to="/" />} />
            <Route path="/games/piano" element={isChildLoggedIn() ? <PianoKids /> : <Navigate to="/" />} />
            <Route path="/games/color-mix" element={isChildLoggedIn() ? <ColorMix /> : <Navigate to="/" />} />
            <Route path="/games/animal-quiz" element={isChildLoggedIn() ? <AnimalQuiz /> : <Navigate to="/" />} />
            <Route path="/games/catch" element={isChildLoggedIn() ? <WhackAStar /> : <Navigate to="/" />} />
            <Route path="/games/dress-up" element={isChildLoggedIn() ? <DressUpGame /> : <Navigate to="/" />} />
            <Route path="/games/snake" element={isChildLoggedIn() ? <GameIframe title="الثعبان الجائع" subtitle="تحرّكي بالأسهم واجمعي الطعام!" src="/games/snake/index.html" emoji="🐍" bgFrom="from-emerald-900" bgTo="to-teal-900" headerBg="bg-black/60" textColor="text-emerald-300" /> : <Navigate to="/" />} />
            <Route path="/games/tetris" element={isChildLoggedIn() ? <GameIframe title="تتريس" subtitle="رتّبي القطع بذكاء!" src="/games/tetris/index.html" emoji="🧩" bgFrom="from-indigo-900" bgTo="to-purple-900" headerBg="bg-black/60" textColor="text-indigo-300" /> : <Navigate to="/" />} />
            <Route path="/games/flappy" element={isChildLoggedIn() ? <GameIframe title="الطائر الرشيق" subtitle="اضغطي للتحليق فوق الأعمدة!" src="/games/flappy/index.html" emoji="🐦" bgFrom="from-sky-200" bgTo="to-blue-300" headerBg="bg-white/60" textColor="text-sky-800" /> : <Navigate to="/" />} />
            <Route path="/games/2048" element={isChildLoggedIn() ? <GameIframe title="لعبة 2048" subtitle="اجمعي الأرقام وصلي لـ 2048!" src="/games/2048/index.html" emoji="🔢" bgFrom="from-amber-50" bgTo="to-orange-100" headerBg="bg-white/60" textColor="text-amber-800" /> : <Navigate to="/" />} />
            <Route path="/games/breakout" element={isChildLoggedIn() ? <GameIframe title="تكسير الطوب" subtitle="حرّكي المجداف وكسّري الطوب!" src="/games/breakout/index.html" emoji="🎯" bgFrom="from-slate-900" bgTo="to-blue-900" headerBg="bg-black/60" textColor="text-cyan-300" /> : <Navigate to="/" />} />
            <Route path="/games/whack" element={isChildLoggedIn() ? <GameIframe title="اضرب الخلد!" subtitle="اضغطي على الخلد قبل أن يختفي!" src="/games/whack/index.html" emoji="🔨" bgFrom="from-lime-800" bgTo="to-green-900" headerBg="bg-black/60" textColor="text-lime-300" /> : <Navigate to="/" />} />
            <Route path="/games/pong" element={isChildLoggedIn() ? <GameIframe title="بينج بونج" subtitle="لاعبتين — مفاتيح W/S و↑/↓" src="/games/pong/index.html" emoji="🏓" bgFrom="from-slate-900" bgTo="to-gray-900" headerBg="bg-black/60" textColor="text-white" /> : <Navigate to="/" />} />
            <Route path="/games/racer" element={isChildLoggedIn() ? <GameIframe title="سباق السيارات" subtitle="تجنّبي السيارات وحطّمي الأرقام!" src="/games/racer/index.html" emoji="🏎️" bgFrom="from-gray-900" bgTo="to-slate-900" headerBg="bg-black/60" textColor="text-orange-300" /> : <Navigate to="/" />} />
            <Route path="/games/platformer" element={isChildLoggedIn() ? <GameIframe title="مغامرة البطلة" subtitle="استخدمي الأسهم للتحرك والقفز!" src="/games/platformer/index.html" emoji="🦸‍♀️" bgFrom="from-purple-900" bgTo="to-indigo-900" headerBg="bg-black/60" textColor="text-purple-300" /> : <Navigate to="/" />} />
            <Route path="/games/minesweeper" element={isChildLoggedIn() ? <GameIframe title="كاشفة الألغام" subtitle="افتحي المربعات بدون أن تنفجري!" src="/games/minesweeper/index.html" emoji="💣" bgFrom="from-gray-100" bgTo="to-slate-200" headerBg="bg-white/70" textColor="text-slate-700" /> : <Navigate to="/" />} />
            <Route path="/games/shooter" element={isChildLoggedIn() ? <GameIframe title="الطائرة المقاتلة" subtitle="أطلقي النار على الأعداء وتجنّبي هجماتهم!" src="/games/shooter/index.html" emoji="🚀" bgFrom="from-slate-950" bgTo="to-blue-950" headerBg="bg-black/70" textColor="text-blue-300" /> : <Navigate to="/" />} />
            <Route path="/games/hextris" element={isChildLoggedIn() ? <GameIframe title="هيكستريس" subtitle="رتّبي الألوان داخل السداسي!" src="/games/hextris/index.html" emoji="⬡" bgFrom="from-gray-100" bgTo="to-slate-200" headerBg="bg-white/70" textColor="text-slate-700" /> : <Navigate to="/" />} />
            <Route path="/games/pacman" element={isChildLoggedIn() ? <GameIframe title="باك مان" subtitle="كلي النقاط واهربي من الأشباح!" src="/games/pacman/index.html" emoji="🟡" bgFrom="from-black" bgTo="to-slate-900" headerBg="bg-black/70" textColor="text-yellow-300" /> : <Navigate to="/" />} />
            <Route path="/games/sudoku" element={isChildLoggedIn() ? <GameIframe title="سودوكو" subtitle="املئي المربعات بالأرقام بذكاء!" src="/games/sudoku/demo/index.html" emoji="🔢" bgFrom="from-blue-50" bgTo="to-indigo-100" headerBg="bg-white/70" textColor="text-indigo-700" /> : <Navigate to="/" />} />
            <Route path="/games/factors" element={isChildLoggedIn() ? <GameIframe title="لعبة الأرقام" subtitle="اقسمي حتى تصلي للرقم 1!" src="/games/factors/index.html" emoji="➗" bgFrom="from-rose-100" bgTo="to-pink-200" headerBg="bg-white/70" textColor="text-rose-800" /> : <Navigate to="/" />} />
            <Route path="/games/trex" element={isChildLoggedIn() ? <GameIframe title="ركض الديناصور" subtitle="اقفزي فوق الصبار بمسطرة المسافة!" src="/games/trex/index.html" emoji="🦖" bgFrom="from-gray-50" bgTo="to-stone-200" headerBg="bg-white/70" textColor="text-stone-700" /> : <Navigate to="/" />} />
            <Route path="/games/alien" element={isChildLoggedIn() ? <GameIframe title="غزو الفضائيين" subtitle="أطلقي النار على الفضائيين!" src="/games/alien/index.html" emoji="👾" bgFrom="from-black" bgTo="to-purple-950" headerBg="bg-black/70" textColor="text-green-400" /> : <Navigate to="/" />} />
            <Route path="/games/nshaft" element={isChildLoggedIn() ? <GameIframe title="السقوط الحر" subtitle="انزلي على المنصات وتجنّبي الأشواك!" src="/games/nshaft/index.html" emoji="🪂" bgFrom="from-slate-100" bgTo="to-gray-300" headerBg="bg-white/70" textColor="text-slate-700" /> : <Navigate to="/" />} />
            <Route path="/games/asteroids" element={isChildLoggedIn() ? <GameIframe title="حرب النيازك" subtitle="حطّمي النيازك بسفينتك الفضائية!" src="/games/asteroids/index.html" emoji="☄️" bgFrom="from-black" bgTo="to-slate-950" headerBg="bg-black/70" textColor="text-cyan-300" /> : <Navigate to="/" />} />
            <Route path="/games/match3" element={isChildLoggedIn() ? <GameIframe title="ماتش 3" subtitle="طابقي 3 ألوان أو أكثر معاً!" src="/games/match3/index.html" emoji="💎" bgFrom="from-pink-100" bgTo="to-purple-200" headerBg="bg-white/70" textColor="text-purple-700" /> : <Navigate to="/" />} />
            <Route path="/games/bubble" element={isChildLoggedIn() ? <GameIframe title="قاذفة الفقاعات" subtitle="فجّري الفقاعات بنفس اللون!" src="/games/bubble/index.html" emoji="🫧" bgFrom="from-sky-100" bgTo="to-blue-200" headerBg="bg-white/70" textColor="text-sky-700" /> : <Navigate to="/" />} />
            <Route path="/games/blockit" element={isChildLoggedIn() ? <GameIframe title="اصطد الكرة" subtitle="ارسمي حواجز لإمساك الكرة!" src="/games/blockit/index.html" emoji="⚫" bgFrom="from-slate-700" bgTo="to-blue-900" headerBg="bg-black/70" textColor="text-blue-200" /> : <Navigate to="/" />} />
            <Route path="/games/runner" element={isChildLoggedIn() ? <GameIframe title="عداءة كاندي" subtitle="اقفزي وتفادي الحواجز الملوّنة!" src="/games/runner/part3/index.html" emoji="🏃‍♀️" bgFrom="from-pink-400" bgTo="to-yellow-300" headerBg="bg-white/70" textColor="text-pink-800" /> : <Navigate to="/" />} />
            <Route path="/games/tower" element={isChildLoggedIn() ? <GameIframe title="بناء البرج" subtitle="ارفعي الطوابق فوق بعضها بدقّة!" src="/games/tower/index.html" emoji="🏗️" bgFrom="from-orange-200" bgTo="to-red-300" headerBg="bg-white/70" textColor="text-red-800" /> : <Navigate to="/" />} />
            <Route path="/games/invaders" element={isChildLoggedIn() ? <GameIframe title="غزاة الفضاء" subtitle="أطلقي على المركبات قبل أن تنزل!" src="/games/invaders/index.html" emoji="🛸" bgFrom="from-black" bgTo="to-emerald-950" headerBg="bg-black/70" textColor="text-green-400" /> : <Navigate to="/" />} />
            <Route path="/games/hangman" element={isChildLoggedIn() ? <GameIframe title="خمّني الكلمة" subtitle="خمّني الحروف قبل أن ينتهي الوقت!" src="/games/hangman/index.html" emoji="🔤" bgFrom="from-yellow-100" bgTo="to-amber-200" headerBg="bg-white/70" textColor="text-amber-800" /> : <Navigate to="/" />} />
            <Route path="/games/coil" element={isChildLoggedIn() ? <GameIframe title="احصري الكرات" subtitle="أحطي بالكرات الزرقاء قبل أن تنفجر!" src="/games/coil/index.html" emoji="🔵" bgFrom="from-slate-900" bgTo="to-teal-950" headerBg="bg-black/70" textColor="text-teal-300" /> : <Navigate to="/" />} />
            <Route path="/games/connect4" element={isChildLoggedIn() ? <GameIframe title="وصل أربعة" subtitle="رتّبي 4 قطع بنفس اللون لتفوزي!" src="/games/connect4/browser/index.html" emoji="🔴" bgFrom="from-yellow-100" bgTo="to-red-200" headerBg="bg-white/70" textColor="text-red-800" /> : <Navigate to="/" />} />
            <Route path="/games/catcat" element={isChildLoggedIn() ? <GameIframe title="امسكي القطة" subtitle="حاصري القطة قبل أن تهرب!" src="/games/catcat/public/index.html" emoji="🐱" bgFrom="from-orange-100" bgTo="to-amber-200" headerBg="bg-white/70" textColor="text-orange-800" /> : <Navigate to="/" />} />
            <Route path="/games/chess" element={isChildLoggedIn() ? <GameIframe title="الشطرنج" subtitle="حرّكي قطعك بذكاء واحمي ملكك!" src="/games/chess/index.html" emoji="♟️" bgFrom="from-stone-200" bgTo="to-stone-400" headerBg="bg-white/70" textColor="text-stone-800" /> : <Navigate to="/" />} />
            <Route path="/games/kurve" element={isChildLoggedIn() ? <GameIframe title="خط البقاء" subtitle="ابقي حية أطول وقت ممكن!" src="/games/kurve/examples/html/index.html" emoji="〰️" bgFrom="from-zinc-900" bgTo="to-yellow-950" headerBg="bg-black/70" textColor="text-yellow-400" /> : <Navigate to="/" />} />
            <Route path="/games/blockrain" element={isChildLoggedIn() ? <GameIframe title="مطر القوالب" subtitle="رتّبي القوالب الملوّنة بسرعة!" src="/games/blockrain/index.html" emoji="🟪" bgFrom="from-black" bgTo="to-purple-950" headerBg="bg-black/70" textColor="text-pink-300" /> : <Navigate to="/" />} />
            <Route path="/games/tinyplat" element={isChildLoggedIn() ? <GameIframe title="منصات صغيرة" subtitle="اقفزي على المنصات واجمعي الذهب!" src="/games/tinyplat/index.html" emoji="🟨" bgFrom="from-zinc-900" bgTo="to-red-950" headerBg="bg-black/70" textColor="text-amber-300" /> : <Navigate to="/" />} />
            <Route path="/games/darkroom" element={isChildLoggedIn() ? <GameIframe title="غرفة المغامرة" subtitle="مغامرة نصّية تعليمية!" src="/games/darkroom/index.html" emoji="🔥" bgFrom="from-stone-100" bgTo="to-stone-300" headerBg="bg-white/70" textColor="text-stone-800" /> : <Navigate to="/" />} />
            <Route path="/games/clumsy" element={isChildLoggedIn() ? <GameIframe title="النحلة الأخرق" subtitle="ساعدي النحلة على عبور الأنابيب!" src="/games/clumsy/index.html" emoji="🐝" bgFrom="from-sky-300" bgTo="to-blue-400" headerBg="bg-white/70" textColor="text-blue-900" /> : <Navigate to="/" />} />
            <Route path="/games/linkup" element={isChildLoggedIn() ? <GameIframe title="وصلة الصور" subtitle="اربطي الصور المتشابهة بخط واحد!" src="/games/linkup/index.html" emoji="🔗" bgFrom="from-fuchsia-100" bgTo="to-pink-200" headerBg="bg-white/70" textColor="text-fuchsia-800" /> : <Navigate to="/" />} />
            <Route path="/games/blackhole" element={isChildLoggedIn() ? <GameIframe title="الثقب الأسود" subtitle="حلّي ألغاز الفضاء!" src="/games/blackhole/public/index.html" emoji="🕳️" bgFrom="from-black" bgTo="to-indigo-950" headerBg="bg-black/70" textColor="text-indigo-300" /> : <Navigate to="/" />} />
            <Route path="/games/bullethell" element={isChildLoggedIn() ? <GameIframe title="مطر الرصاص" subtitle="تجنّبي الرصاص وانجي بنفسك!" src="/games/bullethell/index.html" emoji="🎯" bgFrom="from-black" bgTo="to-rose-950" headerBg="bg-black/70" textColor="text-rose-300" /> : <Navigate to="/" />} />
            <Route path="/games/guessword" element={isChildLoggedIn() ? <GameIframe title="خمّني كلمتي" subtitle="خمّني الكلمة قبل أن تنتهي المحاولات!" src="/games/guessword/index.html" emoji="🤔" bgFrom="from-emerald-100" bgTo="to-green-200" headerBg="bg-white/70" textColor="text-emerald-800" /> : <Navigate to="/" />} />
            <Route path="/games/wordsearch" element={isChildLoggedIn() ? <GameIframe title="ابحثي عن الكلمات" subtitle="اعثري على الكلمات في الشبكة!" src="/games/wordsearch/index.html" emoji="🔎" bgFrom="from-violet-100" bgTo="to-purple-200" headerBg="bg-white/70" textColor="text-violet-800" /> : <Navigate to="/" />} />
            <Route path="/games/wordpluck" element={isChildLoggedIn() ? <GameIframe title="اكتبي بسرعة" subtitle="اكتبي الكلمات قبل أن تختفي!" src="/games/wordpluck/index.html" emoji="⌨️" bgFrom="from-cyan-100" bgTo="to-sky-200" headerBg="bg-white/70" textColor="text-cyan-800" /> : <Navigate to="/" />} />
            <Route path="/games/pacman2" element={isChildLoggedIn() ? <GameIframe title="باك مان كلاسيك" subtitle="نسخة عربية كلاسيكية لباك مان!" src="/games/pacman2/index.html" emoji="🟡" bgFrom="from-black" bgTo="to-blue-950" headerBg="bg-black/70" textColor="text-yellow-400" /> : <Navigate to="/" />} />
            <Route path="/games/blastar" element={isChildLoggedIn() ? <GameIframe title="بلاستار" subtitle="دمّري الأعداء بسفينتك الفضائية!" src="/games/blastar/index.html" emoji="🚀" bgFrom="from-black" bgTo="to-violet-950" headerBg="bg-black/70" textColor="text-violet-300" /> : <Navigate to="/" />} />
            <Route path="/games/memory2" element={isChildLoggedIn() ? <GameIframe title="ذاكرة ماريو" subtitle="اعثري على الأزواج المتطابقة!" src="/games/memory2/index.html" emoji="🧠" bgFrom="from-blue-300" bgTo="to-blue-500" headerBg="bg-white/70" textColor="text-blue-900" /> : <Navigate to="/" />} />
            <Route path="/games/memcards" element={isChildLoggedIn() ? <GameIframe title="بطاقات الفواكه" subtitle="طابقي بطاقات الفواكه بأقل عدد محاولات!" src="/games/memcards/index.html" emoji="🍓" bgFrom="from-slate-900" bgTo="to-slate-950" headerBg="bg-black/70" textColor="text-emerald-300" /> : <Navigate to="/" />} />
            <Route path="/games/piano" element={isChildLoggedIn() ? <GameIframe title="بيانو الكتابة" subtitle="اعزفي اللحن بأصابعك على لوحة المفاتيح!" src="/games/piano/docs/index.html" emoji="🎹" bgFrom="from-stone-800" bgTo="to-stone-950" headerBg="bg-black/70" textColor="text-amber-300" /> : <Navigate to="/" />} />
            <Route path="/games/radius" element={isChildLoggedIn() ? <GameIframe title="غارة الدائرة" subtitle="دافعي عن دائرتك بضربات سريعة!" src="/games/radius/index.html" emoji="💫" bgFrom="from-black" bgTo="to-zinc-900" headerBg="bg-black/70" textColor="text-cyan-300" /> : <Navigate to="/" />} />
            <Route path="/games/citius" element={isChildLoggedIn() ? <GameIframe title="غزاة الجينات" subtitle="لعبة كلاسيكية تُعلّم علم الوراثة!" src="/games/citius/js/index.html" emoji="🧬" bgFrom="from-black" bgTo="to-green-950" headerBg="bg-black/70" textColor="text-green-300" /> : <Navigate to="/" />} />
            <Route path="/games/elematter" element={isChildLoggedIn() ? <GameIframe title="دفاع البرج" subtitle="اصدّي موجات الأعداء ببرج قويّ!" src="/games/elematter/build/index.html" emoji="🏰" bgFrom="from-black" bgTo="to-stone-900" headerBg="bg-black/70" textColor="text-amber-300" /> : <Navigate to="/" />} />
            <Route path="/games/spacepi" element={isChildLoggedIn() ? <GameIframe title="فطيرة الفضاء" subtitle="اختبري دقة الفأرة في الفضاء!" src="/games/spacepi/index.html" emoji="🥧" bgFrom="from-black" bgTo="to-indigo-950" headerBg="bg-black/70" textColor="text-pink-300" /> : <Navigate to="/" />} />
            <Route path="/games/island" element={isChildLoggedIn() ? <GameIframe title="الجزيرة المفقودة" subtitle="مغامرة لاكتشاف الجزيرة!" src="/games/island/index.html" emoji="🏝️" bgFrom="from-cyan-200" bgTo="to-blue-400" headerBg="bg-white/70" textColor="text-blue-900" /> : <Navigate to="/" />} />
            <Route path="/games/diablo" element={isChildLoggedIn() ? <GameIframe title="قلعة المغامرة" subtitle="استكشفي القلعة وحاربي الأشرار!" src="/games/diablo/index.html" emoji="⚔️" bgFrom="from-stone-900" bgTo="to-red-950" headerBg="bg-black/70" textColor="text-red-300" /> : <Navigate to="/" />} />
            <Route path="/games/duckhunt" element={isChildLoggedIn() ? <GameIframe title="صيد البط" subtitle="صوّبي على البط الطائر!" src="/games/duckhunt/dist/index.html" emoji="🦆" bgFrom="from-orange-300" bgTo="to-amber-500" headerBg="bg-white/70" textColor="text-orange-900" /> : <Navigate to="/" />} />
            <Route path="/games/emojimine" element={isChildLoggedIn() ? <GameIframe title="ألغام الإيموجي" subtitle="ابحثي عن القنابل بحذر!" src="/games/emojimine/index.html" emoji="💣" bgFrom="from-yellow-100" bgTo="to-orange-200" headerBg="bg-white/70" textColor="text-orange-800" /> : <Navigate to="/" />} />
            <Route path="/games/kaboom" element={isChildLoggedIn() ? <GameIframe title="كنس الألغام" subtitle="نسخة كنس الألغام الكلاسيكية!" src="/games/kaboom/index.html" emoji="🚩" bgFrom="from-slate-100" bgTo="to-slate-300" headerBg="bg-white/70" textColor="text-slate-800" /> : <Navigate to="/" />} />
            <Route path="/games/tictactoe2" element={isChildLoggedIn() ? <GameIframe title="إكس أو الذكي" subtitle="ذكاء اصطناعي بمستويات صعوبة!" src="/games/tictactoe/index.html" emoji="🎯" bgFrom="from-slate-800" bgTo="to-slate-950" headerBg="bg-black/70" textColor="text-cyan-300" /> : <Navigate to="/" />} />
            <Route path="/games/towerbuild" element={isChildLoggedIn() ? <GameIframe title="ابني البرج" subtitle="ضعي الطوابق فوق بعضها بدقة!" src="/games/towerbuild/index.html" emoji="🏗️" bgFrom="from-rose-300" bgTo="to-red-500" headerBg="bg-white/70" textColor="text-rose-900" /> : <Navigate to="/" />} />
            <Route path="/games/spaceinv" element={isChildLoggedIn() ? <GameIframe title="غزاة الفضاء" subtitle="دافعي عن الأرض ضد غزاة الفضاء!" src="/games/spaceinv/index.html" emoji="👾" bgFrom="from-black" bgTo="to-indigo-950" headerBg="bg-black/70" textColor="text-green-300" /> : <Navigate to="/" />} />
            <Route path="/games/shenzhen" element={isChildLoggedIn() ? <GameIframe title="سوليتير الأرقام" subtitle="رتّبي الأرقام بأقل خطوات ممكنة!" src="/games/shenzhen/index.html" emoji="🃏" bgFrom="from-teal-900" bgTo="to-slate-950" headerBg="bg-black/70" textColor="text-teal-300" /> : <Navigate to="/" />} />
            <Route path="/games/g2048" element={isChildLoggedIn() ? <GameIframe title="٢٠٤٨ الأرقام" subtitle="ادمجي الأرقام للوصول لـ ٢٠٤٨!" src="/games/g2048/index.html" emoji="🔢" bgFrom="from-amber-100" bgTo="to-orange-300" headerBg="bg-white/70" textColor="text-amber-900" /> : <Navigate to="/" />} />
            <Route path="/games/doodle" element={isChildLoggedIn() ? <GameIframe title="كريكيت الرسومات" subtitle="اضربي الكرة بأقصى ما تستطيعين!" src="/games/doodle/index.html" emoji="🏏" bgFrom="from-green-200" bgTo="to-emerald-400" headerBg="bg-white/70" textColor="text-green-900" /> : <Navigate to="/" />} />
            <Route path="/games/atree" element={isChildLoggedIn() ? <GameIframe title="شجرة الفنون" subtitle="فن تجريدي حركي جميل!" src="/games/atree/index.html" emoji="🎄" bgFrom="from-slate-900" bgTo="to-black" headerBg="bg-black/70" textColor="text-emerald-300" /> : <Navigate to="/" />} />
            <Route path="/games/racer2" element={isChildLoggedIn() ? <GameIframe title="سباق السرعة" subtitle="سباق سيارات على الطرق المتعرجة!" src="/games/racer2/v4.final.html" emoji="🏎️" bgFrom="from-sky-300" bgTo="to-indigo-500" headerBg="bg-white/70" textColor="text-indigo-900" /> : <Navigate to="/" />} />
            <Route path="/games/jpong" element={isChildLoggedIn() ? <GameIframe title="بونغ الكلاسيكي" subtitle="لعبة المضرب الأشهر في التاريخ!" src="/games/jpong/index.html" emoji="🏓" bgFrom="from-zinc-900" bgTo="to-black" headerBg="bg-black/70" textColor="text-white" /> : <Navigate to="/" />} />
            <Route path="/games/origsnake" element={isChildLoggedIn() ? <GameIframe title="الثعبان الأصلي" subtitle="كُلي التفاح وكبّري الثعبان!" src="/games/origsnake/index.html" emoji="🐍" bgFrom="from-lime-200" bgTo="to-green-500" headerBg="bg-white/70" textColor="text-green-900" /> : <Navigate to="/" />} />
            <Route path="/games/alien2" element={isChildLoggedIn() ? <GameIframe title="غزو الفضائيين" subtitle="أنقذي الأرض من الغزو!" src="/games/alien2/index.html" emoji="👽" bgFrom="from-black" bgTo="to-purple-950" headerBg="bg-black/70" textColor="text-purple-300" /> : <Navigate to="/" />} />
            <Route path="/games/tetris3" element={isChildLoggedIn() ? <GameIframe title="تتريس الكلاسيكي" subtitle="رتّبي القطع المتساقطة!" src="/games/tetris3/index.html" emoji="🧱" bgFrom="from-slate-200" bgTo="to-slate-400" headerBg="bg-white/70" textColor="text-slate-800" /> : <Navigate to="/" />} />
            <Route path="/games/snake3" element={isChildLoggedIn() ? <GameIframe title="الثعبان البسيط" subtitle="نسخة بسيطة وممتعة!" src="/games/snake3/index.html" emoji="🐍" bgFrom="from-green-200" bgTo="to-green-500" headerBg="bg-white/70" textColor="text-green-900" /> : <Navigate to="/" />} />
            <Route path="/games/jkp" element={isChildLoggedIn() ? <GameIframe title="حجرة ورقة مقص" subtitle="تحدّي الكمبيوتر!" src="/games/jkp/index.html" emoji="✊" bgFrom="from-yellow-100" bgTo="to-yellow-300" headerBg="bg-white/70" textColor="text-amber-900" /> : <Navigate to="/" />} />
            <Route path="/games/canvgame" element={isChildLoggedIn() ? <GameIframe title="صائدة الغوبلين" subtitle="اصطادي أكبر عدد من الغوبلين!" src="/games/canvgame/index.html" emoji="🧙" bgFrom="from-green-300" bgTo="to-green-600" headerBg="bg-white/70" textColor="text-green-900" /> : <Navigate to="/" />} />
            <Route path="/games/aimshoot" element={isChildLoggedIn() ? <GameIframe title="صوّبي ودمّري" subtitle="رسومات بسيطة ولعبة ممتعة!" src="/games/aimshoot/index.html" emoji="🎯" bgFrom="from-stone-100" bgTo="to-stone-300" headerBg="bg-white/70" textColor="text-stone-800" /> : <Navigate to="/" />} />
            <Route path="/games/spinv2" element={isChildLoggedIn() ? <GameIframe title="غزاة الفضاء الكلاسيكي" subtitle="نسخة كلاسيكية أنيقة!" src="/games/spinv2/index.html" emoji="🛸" bgFrom="from-black" bgTo="to-blue-950" headerBg="bg-black/70" textColor="text-cyan-300" /> : <Navigate to="/" />} />
            <Route path="/games/ainv" element={isChildLoggedIn() ? <GameIframe title="هجوم الفضائيين" subtitle="أطلقي على المركبات قبل أن تصل!" src="/games/ainv/index.html" emoji="👽" bgFrom="from-black" bgTo="to-violet-950" headerBg="bg-black/70" textColor="text-violet-300" /> : <Navigate to="/" />} />
            <Route path="/games/itower" element={isChildLoggedIn() ? <GameIframe title="برج الذكاء" subtitle="ابني البرج بدقّة قبل أن يسقط!" src="/games/itower/index.html" emoji="🗼" bgFrom="from-amber-200" bgTo="to-orange-400" headerBg="bg-white/70" textColor="text-amber-900" /> : <Navigate to="/" />} />
            <Route path="/games/ctet" element={isChildLoggedIn() ? <GameIframe title="تتريس الكلاسيكي 2" subtitle="رتّبي القطع وحقّقي أعلى نتيجة!" src="/games/ctet/index.html" emoji="🧱" bgFrom="from-indigo-900" bgTo="to-blue-950" headerBg="bg-black/70" textColor="text-indigo-300" /> : <Navigate to="/" />} />
            <Route path="/games/slots" element={isChildLoggedIn() ? <GameIframe title="سلوتس الحظ" subtitle="جرّبي حظّك مع الرموز الملوّنة!" src="/games/slots/index.html" emoji="🎰" bgFrom="from-rose-200" bgTo="to-pink-400" headerBg="bg-white/70" textColor="text-rose-900" /> : <Navigate to="/" />} />
            <Route path="/games/fbjs" element={isChildLoggedIn() ? <GameIframe title="الطائر السريع" subtitle="حلّقي بين الأنابيب بدون توقّف!" src="/games/fbjs/index.html" emoji="🐤" bgFrom="from-sky-300" bgTo="to-cyan-500" headerBg="bg-white/70" textColor="text-sky-900" /> : <Navigate to="/" />} />
            <Route path="/games/hearts" element={isChildLoggedIn() ? <GameIframe title="لعبة القلوب" subtitle="لعبة ورق كلاسيكية ممتعة!" src="/games/hearts/index.html" emoji="♥️" bgFrom="from-red-200" bgTo="to-rose-400" headerBg="bg-white/70" textColor="text-red-900" /> : <Navigate to="/" />} />
            <Route path="/games/boulder" element={isChildLoggedIn() ? <GameIframe title="مغامرة الكهف" subtitle="احفري واجمعي الأحجار الكريمة!" src="/games/boulder/index.html" emoji="💎" bgFrom="from-stone-800" bgTo="to-amber-950" headerBg="bg-black/70" textColor="text-amber-300" /> : <Navigate to="/" />} />
            <Route path="/games/towerplat" element={isChildLoggedIn() ? <GameIframe title="برج المنصات" subtitle="اصعدي البرج بالقفز بين المنصات!" src="/games/towerplat/index.html" emoji="🏯" bgFrom="from-purple-800" bgTo="to-indigo-900" headerBg="bg-black/70" textColor="text-purple-300" /> : <Navigate to="/" />} />
            <Route path="/games/fifteen" element={isChildLoggedIn() ? <GameIframe title="لغز الـ 15" subtitle="رتّبي الأرقام بترتيب صحيح!" src="/games/fifteen/index.html" emoji="🔢" bgFrom="from-emerald-100" bgTo="to-green-300" headerBg="bg-white/70" textColor="text-emerald-900" /> : <Navigate to="/" />} />
            <Route path="/games/mssudoku" element={isChildLoggedIn() ? <GameIframe title="سودوكو HTML5" subtitle="نسخة قوية من سودوكو الكلاسيكية!" src="/games/mssudoku/index.html" emoji="🔢" bgFrom="from-red-100" bgTo="to-rose-200" headerBg="bg-white/70" textColor="text-rose-900" /> : <Navigate to="/" />} />
            <Route path="/games/lwsearch" element={isChildLoggedIn() ? <GameIframe title="بحث الكلمات" subtitle="ابحثي عن الكلمات في الشبكة!" src="/games/lwsearch/index.html" emoji="🔠" bgFrom="from-stone-100" bgTo="to-stone-300" headerBg="bg-white/70" textColor="text-stone-800" /> : <Navigate to="/" />} />
            <Route path="/games/pmem" element={isChildLoggedIn() ? <GameIframe title="ذاكرة البطاقات" subtitle="اقلبي البطاقات وطابقي الأزواج!" src="/games/pmem/index.html" emoji="🃏" bgFrom="from-blue-200" bgTo="to-sky-400" headerBg="bg-white/70" textColor="text-blue-900" /> : <Navigate to="/" />} />
            <Route path="/games/hwordle" element={isChildLoggedIn() ? <GameIframe title="وردل بسيط" subtitle="خمّني الكلمة بـ 6 محاولات!" src="/games/hwordle/index.html" emoji="🔤" bgFrom="from-cyan-300" bgTo="to-emerald-400" headerBg="bg-white/70" textColor="text-emerald-900" /> : <Navigate to="/" />} />
            <Route path="/games/smem" element={isChildLoggedIn() ? <GameIframe title="ذاكرة النجوم" subtitle="ذاكرة كلاسيكية بـ 3 نجوم!" src="/games/smem/index.html" emoji="⭐" bgFrom="from-slate-100" bgTo="to-gray-300" headerBg="bg-white/70" textColor="text-slate-800" /> : <Navigate to="/" />} />
            <Route path="/games/k2048" element={isChildLoggedIn() ? <GameIframe title="2048 الكلاسيكي" subtitle="ادمجي الأرقام للوصول لـ 2048!" src="/games/k2048/index.html" emoji="🔢" bgFrom="from-amber-100" bgTo="to-orange-300" headerBg="bg-white/70" textColor="text-amber-900" /> : <Navigate to="/" />} />
            <Route path="/games/kc4" element={isChildLoggedIn() ? <GameIframe title="وصل 4 سريع" subtitle="رتّبي 4 أقراص بنفس اللون!" src="/games/kc4/index.html" emoji="🔴" bgFrom="from-yellow-200" bgTo="to-amber-400" headerBg="bg-white/70" textColor="text-amber-900" /> : <Navigate to="/" />} />
            <Route path="/games/kfrog" element={isChildLoggedIn() ? <GameIframe title="مختبر السرعة" subtitle="اختبري سرعة ردّة فعلك!" src="/games/kfrog/index.html" emoji="⚡" bgFrom="from-lime-200" bgTo="to-green-400" headerBg="bg-white/70" textColor="text-green-900" /> : <Navigate to="/" />} />
            <Route path="/games/kwhack" element={isChildLoggedIn() ? <GameIframe title="اضربي الفأر" subtitle="اضغطي على الفأر قبل أن يهرب!" src="/games/kwhack/index.html" emoji="🐭" bgFrom="from-stone-200" bgTo="to-amber-300" headerBg="bg-white/70" textColor="text-stone-900" /> : <Navigate to="/" />} />
            <Route path="/games/ksinv" element={isChildLoggedIn() ? <GameIframe title="دفاع الفضاء" subtitle="دافعي عن الأرض ضد الغزاة!" src="/games/ksinv/index.html" emoji="👾" bgFrom="from-black" bgTo="to-purple-950" headerBg="bg-black/70" textColor="text-purple-300" /> : <Navigate to="/" />} />
            
            <Route path="/home-activities" element={isChildLoggedIn() ? <HomeActivities /> : <Navigate to="/" />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          <Toaster position="top-center" />
          <ChatbotWrapper />
        </div>
      </Router>
    </ErrorBoundary>
  );
}
