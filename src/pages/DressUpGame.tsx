import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function DressUpGame() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-pink-50 to-fuchsia-100 flex flex-col" dir="rtl">
      <header className="p-4 bg-white/70 backdrop-blur-md shadow-sm flex items-center gap-3 sticky top-0 z-30">
        <button
          onClick={() => navigate('/maria-games')}
          className="p-2 hover:bg-pink-50 rounded-full transition-colors text-pink-600"
        >
          <ArrowRight className="w-6 h-6" />
        </button>
        <div>
          <h1 className="text-xl font-black text-pink-900">👗 لعبة لبيس البنات</h1>
          <p className="text-pink-500 text-xs font-bold">صمّمي أميرتك الخاصة!</p>
        </div>
      </header>

      <div className="flex-1 w-full">
        <iframe
          src="/dress-up/index.html"
          title="لعبة لبيس البنات"
          className="w-full border-0"
          style={{ height: 'calc(100vh - 68px)', minHeight: 600 }}
          allow="downloads"
        />
      </div>
    </div>
  );
}
