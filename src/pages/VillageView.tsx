import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Home, Users, Sparkles, Search, Video, MessageCircle } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';
import { ChildProfile, HouseSession } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrorHandler';

const HOUSE_EMOJIS = ['🏠', '🏡', '🏘️', '🏰', '🏯', '🌸', '⭐', '🌈', '🦋', '🌟'];
const HOUSE_COLORS = [
  'from-fuchsia-500/40 to-pink-500/25',
  'from-sky-500/40 to-cyan-500/25',
  'from-amber-500/40 to-orange-500/25',
  'from-violet-500/40 to-indigo-500/25',
  'from-emerald-500/40 to-teal-500/25',
  'from-rose-500/40 to-red-500/25',
  'from-blue-500/40 to-indigo-500/25',
  'from-lime-500/40 to-green-500/25',
];

function getHouseEmoji(uid: string) {
  const idx = uid.charCodeAt(0) % HOUSE_EMOJIS.length;
  return HOUSE_EMOJIS[idx];
}
function getHouseColor(uid: string) {
  const idx = (uid.charCodeAt(0) + uid.charCodeAt(1)) % HOUSE_COLORS.length;
  return HOUSE_COLORS[idx];
}

export default function VillageView() {
  const navigate = useNavigate();
  const [activeChild, setActiveChild] = useState<ChildProfile | null>(null);
  const [allChildren, setAllChildren] = useState<ChildProfile[]>([]);
  const [sessions, setSessions] = useState<Record<string, HouseSession>>({});
  const [onlineUids, setOnlineUids] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'online' | 'active'>('all');

  useEffect(() => {
    const stored = localStorage.getItem('active_child');
    if (stored) setActiveChild(JSON.parse(stored) as ChildProfile);

    /* Single subscription: children_profiles contains both profile + liveSession */
    const unsub = onSnapshot(
      query(collection(db, 'children_profiles'), where('status', '==', 'approved')),
      snap => {
        const children: ChildProfile[] = [];
        const map: Record<string, HouseSession> = {};
        snap.docs.forEach(d => {
          const child = d.data() as ChildProfile;
          children.push(child);
          const ls = (child.houseConfig as Record<string, unknown> | undefined)?.liveSession;
          if (ls) map[child.uid] = ls as HouseSession;
        });
        setAllChildren(children);
        setSessions(map);
      },
      err => handleFirestoreError(err, OperationType.GET, 'children_profiles')
    );

    const unsubOnline = onSnapshot(
      collection(db, 'online_status'),
      snap => {
        const now = Date.now();
        const online = new Set<string>();
        snap.docs.forEach(d => {
          const data = d.data();
          if (data.isOnline && now - data.lastActive < 2 * 60 * 1000) online.add(d.id);
        });
        setOnlineUids(online);
      },
      () => {}
    );

    return () => { unsub(); unsubOnline(); };
  }, []);

  const filtered = allChildren.filter(c => {
    if (c.uid === activeChild?.uid) return false;
    const matchSearch = !search || c.heroName?.toLowerCase().includes(search.toLowerCase()) || c.name?.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filter === 'online') return onlineUids.has(c.uid);
    if (filter === 'active') return !!sessions[c.uid];
    return true;
  });

  const mySession = activeChild ? sessions[activeChild.uid] : null;

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-rose-900 via-pink-800 to-rose-700 text-white">
      {/* Header */}
      <header className="sticky top-0 z-20 backdrop-blur-xl bg-black/30 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <button onClick={() => navigate('/child')}
            className="flex items-center gap-2 rounded-2xl bg-white/10 hover:bg-white/20 px-4 py-2 border border-white/15 transition-all text-sm font-bold">
            <ArrowLeft className="w-4 h-4" /> العودة
          </button>

          <div className="flex-1 flex items-center gap-3">
            <div className="text-3xl">🏰</div>
            <div>
              <h1 className="font-black text-lg">مدينة البطلات</h1>
              <p className="text-xs text-white/60">{allChildren.length} بطلة مسجّلة · {onlineUids.size} أونلاين الآن</p>
            </div>
          </div>

          {activeChild && (
            <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/house/self')}
              className="flex items-center gap-2 bg-gradient-to-l from-fuchsia-500 to-pink-500 hover:from-fuchsia-400 hover:to-pink-400 text-white font-black text-sm px-5 py-2.5 rounded-2xl shadow-lg">
              <Home className="w-4 h-4" /> بيتي
            </motion.button>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* My house banner if I have visitors */}
        {mySession && Object.values(mySession.visitors ?? {}).length > 0 && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="rounded-[2rem] bg-gradient-to-l from-fuchsia-900/60 to-pink-900/60 border-2 border-fuchsia-400/50 p-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🏠</span>
              <div>
                <div className="font-black text-lg text-fuchsia-200">بيتك مفتوح الآن!</div>
                <div className="text-sm text-white/70">{Object.values(mySession.visitors ?? {}).length} صديقة في بيتك</div>
              </div>
              <div className="flex -space-x-2 rtl:space-x-reverse">
                {Object.values(mySession.visitors ?? {}).slice(0, 5).map(v => (
                  <div key={v.uid} className="w-9 h-9 rounded-full bg-pink-400/30 border-2 border-white/30 flex items-center justify-center text-lg" title={v.heroName}>
                    {v.avatar?.hairStyle || '👧'}
                  </div>
                ))}
              </div>
            </div>
            <motion.button whileTap={{ scale: 0.96 }}
              onClick={() => navigate('/house/self')}
              className="bg-fuchsia-500 hover:bg-fuchsia-400 text-white font-black px-5 py-2.5 rounded-xl shadow-lg text-sm">
              ادخلي بيتك
            </motion.button>
          </motion.div>
        )}

        {/* Search & filter */}
        <div className="flex gap-3 items-center flex-wrap">
          <div className="flex-1 min-w-[200px] flex items-center gap-2 bg-white/10 border border-white/15 rounded-2xl px-4 py-2.5">
            <Search className="w-4 h-4 text-white/50 shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="ابحثي عن بطلة..."
              className="bg-transparent text-white placeholder-white/40 text-sm outline-none flex-1 text-right" />
          </div>
          {(['all', 'online', 'active'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2.5 rounded-2xl text-sm font-black border transition-all ${filter === f ? 'bg-fuchsia-500 border-fuchsia-400 text-white' : 'bg-white/10 border-white/15 text-white/70 hover:bg-white/20'}`}>
              {f === 'all' ? `🏘️ الكل (${allChildren.length - 1})` : f === 'online' ? `🟢 أونلاين (${onlineUids.size})` : `🎉 نشطة (${Object.keys(sessions).length})`}
            </button>
          ))}
        </div>

        {/* City grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-white/40">
            <div className="text-6xl mb-4">🏙️</div>
            <div className="font-black text-xl">لا توجد بطلات حالياً</div>
            <div className="text-sm mt-2">جرّبي فلتر مختلف أو ارجعي لاحقاً</div>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filtered.map(child => {
              const session = sessions[child.uid];
              const isOnline = onlineUids.has(child.uid);
              const visitorCount = Object.values(session?.visitors ?? {}).length;
              const hasCall = session?.callActive;

              return (
                <motion.button key={child.uid}
                  whileHover={{ scale: 1.04, y: -3 }} whileTap={{ scale: 0.97 }}
                  onClick={() => navigate(`/house/view_${child.uid}`)}
                  className={`relative rounded-[1.75rem] p-4 text-right bg-gradient-to-br ${getHouseColor(child.uid)} border border-white/15 backdrop-blur-sm shadow-xl flex flex-col gap-3 group transition-all hover:border-white/30 hover:shadow-fuchsia-500/20 hover:shadow-2xl`}>

                  {/* Online badge */}
                  {isOnline && (
                    <span className="absolute top-3 left-3 w-3 h-3 bg-emerald-400 rounded-full shadow-lg shadow-emerald-400/50 animate-pulse" />
                  )}

                  {/* Active call badge */}
                  {hasCall && (
                    <span className="absolute top-3 left-7 bg-red-500 text-white text-[10px] font-black px-1.5 py-0.5 rounded-full flex items-center gap-1">
                      <Video className="w-2.5 h-2.5" /> لايف
                    </span>
                  )}

                  {/* Visitor count */}
                  {visitorCount > 0 && (
                    <span className="absolute top-3 right-3 bg-fuchsia-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
                      +{visitorCount}
                    </span>
                  )}

                  {/* House emoji */}
                  <div className="text-5xl text-center">
                    {getHouseEmoji(child.uid)}
                  </div>

                  {/* Avatar */}
                  <div className={`mx-auto w-12 h-12 rounded-full ${child.avatar?.color || 'bg-pink-300'} flex items-center justify-center text-2xl border-2 border-white/40 shadow-lg`}>
                    {child.avatar?.hairStyle || '👧'}
                  </div>

                  {/* Name */}
                  <div>
                    <div className="font-black text-sm text-white leading-tight text-center">
                      {child.heroName || child.name}
                    </div>
                    <div className="text-[10px] text-white/50 text-center mt-0.5">
                      {isOnline ? '🟢 أونلاين' : '⚫ غير متاحة'}
                    </div>
                  </div>

                  {/* Visitor preview */}
                  {visitorCount > 0 && (
                    <div className="flex items-center justify-center gap-1 text-[10px] text-white/70">
                      <Users className="w-3 h-3" />
                      {visitorCount === 1 ? 'صديقة واحدة في البيت' : `${visitorCount} صديقات في البيت`}
                    </div>
                  )}

                  {/* Hover: visit button */}
                  <div className="absolute inset-0 rounded-[1.75rem] bg-fuchsia-600/0 group-hover:bg-fuchsia-600/10 flex items-end justify-center pb-3 transition-all opacity-0 group-hover:opacity-100">
                    <span className="bg-white text-fuchsia-700 font-black text-xs px-4 py-1.5 rounded-full shadow-lg">
                      زوّري البيت ✨
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}

        {/* City stats footer */}
        <div className="grid grid-cols-3 gap-4 pt-4">
          {[
            { icon: '🏠', label: 'بيوت مسجّلة', value: allChildren.length },
            { icon: '🟢', label: 'أونلاين الآن', value: onlineUids.size },
            { icon: '🎉', label: 'بيوت نشطة', value: Object.keys(sessions).length },
          ].map(stat => (
            <div key={stat.label} className="rounded-[1.5rem] bg-white/5 border border-white/10 p-4 text-center">
              <div className="text-3xl mb-1">{stat.icon}</div>
              <div className="font-black text-2xl text-white">{stat.value}</div>
              <div className="text-xs text-white/50 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
