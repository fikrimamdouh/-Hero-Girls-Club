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
import MagicLearning from './pages/MagicLearning';
import HeroHouse from './pages/HeroHouse';
import ColoringStudio from './pages/ColoringStudio';
import CinemaView from './pages/CinemaView';
import ValuesView from './pages/ValuesView';
import AIDesignStudio from './pages/AIDesignStudio';
import ResearchCenterPage from './pages/ResearchCenterPage';
import KidsGamesPage from './pages/KidsGamesPage';
import MariaGamesView from './pages/MariaGamesView';
import MemoryMatch from './features/games/MemoryMatch';
import FruitCatcher from './features/games/FruitCatcher';
import SnakeGame from './features/games/SnakeGame';
import Game2048 from './features/games/Game2048';
import SimonSays from './features/games/SimonSays';
import TicTacToe from './features/games/TicTacToe';
import PetMaker from './features/games/PetMaker';
import WordScramble from './features/games/WordScramble';
import WhackAStar from './features/games/WhackAStar';
import ReenaWelcome from './components/ReenaWelcome';

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
          <ReenaWelcome />
          <Routes>
            <Route path="/" element={<LandingPage user={user} />} />
            <Route path="/terms" element={<TermsPage />} />
            
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
            <Route path="/ai-design" element={isChildLoggedIn() ? <AIDesignStudio /> : <Navigate to="/" />} />
            <Route path="/research-center" element={isChildLoggedIn() ? <ResearchCenterPage /> : <Navigate to="/" />} />
            <Route path="/games" element={isChildLoggedIn() ? <KidsGamesPage /> : <Navigate to="/" />} />
            <Route path="/maria-games" element={isChildLoggedIn() ? <MariaGamesView /> : <Navigate to="/" />} />
            <Route path="/games/memory" element={isChildLoggedIn() ? <MemoryMatch /> : <Navigate to="/" />} />
            <Route path="/games/fruit-catcher" element={isChildLoggedIn() ? <FruitCatcher /> : <Navigate to="/" />} />
            <Route path="/games/snake" element={isChildLoggedIn() ? <SnakeGame /> : <Navigate to="/" />} />
            <Route path="/games/2048" element={isChildLoggedIn() ? <Game2048 /> : <Navigate to="/" />} />
            <Route path="/games/simon" element={isChildLoggedIn() ? <SimonSays /> : <Navigate to="/" />} />
            <Route path="/games/tictactoe" element={isChildLoggedIn() ? <TicTacToe /> : <Navigate to="/" />} />
            <Route path="/games/petmaker" element={isChildLoggedIn() ? <PetMaker /> : <Navigate to="/" />} />
            <Route path="/games/words" element={isChildLoggedIn() ? <WordScramble /> : <Navigate to="/" />} />
            <Route path="/games/catch" element={isChildLoggedIn() ? <WhackAStar /> : <Navigate to="/" />} />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
          <Toaster position="top-center" />
          <ChatbotWrapper />
        </div>
      </Router>
    </ErrorBoundary>
  );
}
