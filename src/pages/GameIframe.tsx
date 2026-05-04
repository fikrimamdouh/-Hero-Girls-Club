import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { MARIA_GAMES_WITH_SOURCE, GameSection } from '../data/mariaGamesData';

interface GameIframeProps {
  title: string;
  src: string;
  subtitle?: string;
  emoji?: string;
  bgFrom?: string;
  bgTo?: string;
  headerBg?: string;
  textColor?: string;
  backTo?: string;
}

const SECTION_ROUTE: Record<GameSection, string> = {
  maria: '/maria-games',
  arcade: '/games',
  drawing: '/drawing-games',
};

export default function GameIframe({
  title,
  src,
  subtitle = 'استمتعي باللعب! 🎮',
  emoji = '🎮',
  bgFrom = 'from-slate-900',
  bgTo = 'to-slate-950',
  headerBg = 'bg-black/70',
  textColor = 'text-white',
  backTo,
}: GameIframeProps) {
  const navigate = useNavigate();
  const location = useLocation();

  // اشتقاق وجهة زر الرجوع تلقائياً من قسم اللعبة
  let resolvedBackTo = backTo;
  if (!resolvedBackTo) {
    const game = MARIA_GAMES_WITH_SOURCE.find(g => g.route === location.pathname);
    resolvedBackTo = game ? SECTION_ROUTE[game.section] : '/games';
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br ${bgFrom} ${bgTo} flex flex-col`} dir="rtl">
      <header className={`p-3 ${headerBg} backdrop-blur-md shadow-lg flex items-center gap-3 sticky top-0 z-30 border-b border-white/10`}>
        {/* زر الرجوع — كبير وواضح للأطفال */}
        <button
          onClick={() => navigate(resolvedBackTo!)}
          aria-label="رجوع لصفحة الألعاب"
          className={`flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 hover:bg-white/30 active:scale-95 transition-all ${textColor} font-black text-sm shadow-md ring-2 ring-white/20 hover:ring-white/40`}
        >
          <ArrowRight className="w-5 h-5" />
          <span className="hidden sm:inline">رجوع</span>
        </button>
        <div className="flex-1 min-w-0">
          <h1 className={`text-base sm:text-xl font-black ${textColor} truncate`}>{emoji} {title}</h1>
          <p className={`text-[10px] sm:text-xs font-bold opacity-70 ${textColor} truncate`}>{subtitle}</p>
        </div>
      </header>
      <div className="flex-1 w-full">
        <iframe
          src={src}
          title={title}
          className="w-full border-0"
          style={{ height: 'calc(100vh - 64px)', minHeight: 600 }}
          allow="autoplay; fullscreen; clipboard-read; clipboard-write"
        />
      </div>
    </div>
  );
}
