import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight, Swords, Users, Loader2, Trophy,
  RotateCcw, Sparkles,
} from 'lucide-react';
import { db } from '../firebase';
import {
  addDoc, collection, doc, onSnapshot, query, updateDoc, where,
  getDocs,
} from 'firebase/firestore';
import { ChildProfile, OnlineStatus } from '../types';
import { toast } from 'sonner';
import { createNotification } from '../lib/notifications';

type Marker = 'X' | 'O';
type Cell = Marker | null;

interface ArenaMatch {
  id: string;
  hostId: string;
  hostName: string;
  hostAvatar?: any;
  guestId: string;
  guestName: string;
  guestAvatar?: any;
  status: 'pending' | 'active' | 'ended';
  game: 'xo';
  board: Cell[];
  turn: Marker;
  hostMarker: Marker;
  winner: Marker | 'draw' | null;
  createdAt: number;
  updatedAt: number;
}

const WIN_LINES: number[][] = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6],
];

function checkWinner(board: Cell[]): Marker | 'draw' | null {
  for (const line of WIN_LINES) {
    const [a,b,c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a] as Marker;
    }
  }
  if (board.every(Boolean)) return 'draw';
  return null;
}

export default function MultiplayerArena() {
  const navigate = useNavigate();
  const [me, setMe] = useState<ChildProfile | null>(null);
  const [friends, setFriends] = useState<ChildProfile[]>([]);
  const [statuses, setStatuses] = useState<Record<string, OnlineStatus>>({});
  const [activeMatch, setActiveMatch] = useState<ArenaMatch | null>(null);
  const [creating, setCreating] = useState(false);

  // Load active child
  useEffect(() => {
    const str = localStorage.getItem('active_child');
    if (!str) { navigate('/'); return; }
    try { setMe(JSON.parse(str)); } catch { navigate('/'); }
  }, [navigate]);

  // Load friends list (people I have a chat with)
  useEffect(() => {
    if (!me) return;
    let cancelled = false;
    (async () => {
      try {
        const chatsSnap = await getDocs(
          query(collection(db, 'chats'), where('participants', 'array-contains', me.uid))
        );
        const friendIds = new Set<string>();
        chatsSnap.docs.forEach((d) => {
          const data: any = d.data();
          (data.participants || []).forEach((uid: string) => {
            if (uid !== me.uid) friendIds.add(uid);
          });
        });
        if (friendIds.size === 0) { setFriends([]); return; }

        // Firestore 'in' op limit is 30 — chunk if needed.
        const ids = Array.from(friendIds);
        const chunks: string[][] = [];
        for (let i = 0; i < ids.length; i += 10) chunks.push(ids.slice(i, i + 10));

        const profiles: ChildProfile[] = [];
        for (const chunk of chunks) {
          const snap = await getDocs(
            query(collection(db, 'children_profiles'), where('uid', 'in', chunk))
          );
          snap.docs.forEach((d) => profiles.push({ uid: d.id, ...(d.data() as any) }));
        }
        if (!cancelled) setFriends(profiles);
      } catch (e) {
        console.warn('arena: load friends failed', e);
      }
    })();
    return () => { cancelled = true; };
  }, [me]);

  // Online status feed
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'online_status'), (snap) => {
      const map: Record<string, OnlineStatus> = {};
      snap.docs.forEach((d) => { map[d.id] = d.data() as OnlineStatus; });
      setStatuses(map);
    });
    return () => unsub();
  }, []);

  // Listen for incoming match invitations (where I am the guest)
  const [pendingInvite, setPendingInvite] = useState<ArenaMatch | null>(null);
  const seenInvitesRef = useRef<Set<string>>(new Set());
  useEffect(() => {
    if (!me) return;
    const q = query(
      collection(db, 'arena_matches'),
      where('guestId', '==', me.uid),
      where('status', '==', 'pending')
    );
    const unsub = onSnapshot(q, (snap) => {
      const fresh = snap.docs
        .map((d) => ({ id: d.id, data: d.data() as ArenaMatch }))
        .filter(({ data }) => Date.now() - data.createdAt <= 60000)
        .sort((a, b) => b.data.createdAt - a.data.createdAt);
      if (fresh.length === 0) { setPendingInvite(null); return; }
      const top = fresh[0];
      if (seenInvitesRef.current.has(top.id)) return;
      seenInvitesRef.current.add(top.id);
      setPendingInvite({ ...top.data, id: top.id });
      // ringtone
      try {
        const a = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
        a.play().catch(() => {});
      } catch {}
    });
    return () => unsub();
  }, [me]);

  // Live match listener
  useEffect(() => {
    if (!activeMatch?.id) return;
    const unsub = onSnapshot(doc(db, 'arena_matches', activeMatch.id), (snap) => {
      if (!snap.exists()) { setActiveMatch(null); return; }
      setActiveMatch({ id: snap.id, ...(snap.data() as any) });
    });
    return () => unsub();
  }, [activeMatch?.id]);

  const isOnline = (uid: string) => {
    const s = statuses[uid];
    return s?.isOnline && Date.now() - s.lastActive < 2 * 60 * 1000;
  };

  const sortedFriends = useMemo(
    () => [...friends].sort((a, b) => Number(isOnline(b.uid)) - Number(isOnline(a.uid))),
    [friends, statuses]
  );

  const challenge = async (friend: ChildProfile) => {
    if (!me) return;
    setCreating(true);
    try {
      const ref = await addDoc(collection(db, 'arena_matches'), {
        hostId: me.uid,
        hostName: me.heroName || me.name,
        hostAvatar: me.avatar || null,
        guestId: friend.uid,
        guestName: friend.heroName || friend.name,
        guestAvatar: friend.avatar || null,
        status: 'pending',
        game: 'xo',
        board: Array(9).fill(null),
        turn: 'X' as Marker,
        hostMarker: 'X' as Marker,
        winner: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      // Notify friend
      await createNotification({
        recipientId: friend.uid,
        type: 'system',
        title: '⚔️ تحدّي XO!',
        body: `${me.heroName || me.name} تتحداكِ في XO`,
        link: '/arena',
        fromId: me.uid,
        fromName: me.heroName || me.name,
      });
      // Wait for opponent to accept
      setActiveMatch({
        id: ref.id,
        hostId: me.uid,
        hostName: me.heroName || me.name,
        guestId: friend.uid,
        guestName: friend.heroName || friend.name,
        status: 'pending',
        game: 'xo',
        board: Array(9).fill(null),
        turn: 'X',
        hostMarker: 'X',
        winner: null,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      toast.success(`أُرسل التحدّي إلى ${friend.heroName || friend.name}!`);
    } catch (e) {
      console.error(e);
      toast.error('تعذّر إرسال التحدّي');
    } finally {
      setCreating(false);
    }
  };

  const acceptMatch = async (m: ArenaMatch) => {
    try {
      await updateDoc(doc(db, 'arena_matches', m.id), {
        status: 'active',
        updatedAt: Date.now(),
      });
      setActiveMatch({ ...m, status: 'active' });
      setPendingInvite(null);
    } catch (e) {
      console.warn('accept failed', e);
    }
  };

  const declineMatch = async (id: string) => {
    try {
      await updateDoc(doc(db, 'arena_matches', id), {
        status: 'ended',
        winner: null,
        updatedAt: Date.now(),
      });
    } catch {}
    setPendingInvite(null);
  };

  const myMarker: Marker | null = useMemo(() => {
    if (!me || !activeMatch) return null;
    if (activeMatch.hostId === me.uid) return activeMatch.hostMarker;
    if (activeMatch.guestId === me.uid) return activeMatch.hostMarker === 'X' ? 'O' : 'X';
    return null;
  }, [me, activeMatch]);

  const isMyTurn = activeMatch?.status === 'active' && activeMatch.turn === myMarker && !activeMatch.winner;

  const playCell = async (i: number) => {
    if (!activeMatch || !isMyTurn || activeMatch.board[i]) return;
    const board = [...activeMatch.board];
    board[i] = myMarker!;
    const winner = checkWinner(board);
    try {
      await updateDoc(doc(db, 'arena_matches', activeMatch.id), {
        board,
        turn: myMarker === 'X' ? 'O' : 'X',
        winner,
        updatedAt: Date.now(),
        ...(winner ? { status: 'ended' } : {}),
      });
    } catch (e) {
      console.warn('move failed', e);
    }
  };

  const restart = async () => {
    if (!activeMatch) return;
    try {
      await updateDoc(doc(db, 'arena_matches', activeMatch.id), {
        board: Array(9).fill(null),
        turn: 'X',
        winner: null,
        status: 'active',
        updatedAt: Date.now(),
      });
    } catch {}
  };

  const leave = async () => {
    if (!activeMatch) { return; }
    try {
      await updateDoc(doc(db, 'arena_matches', activeMatch.id), {
        status: 'ended', updatedAt: Date.now(),
      });
    } catch {}
    setActiveMatch(null);
  };

  if (!me) return null;

  // Incoming-challenge modal (rendered on top of any view)
  const inviteModal = pendingInvite && (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[70] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.85, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.85, y: 20 }}
          className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl max-w-sm w-full p-6 text-center"
        >
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-violet-400 to-rose-500 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <Swords className="w-10 h-10 text-white" />
          </div>
          <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">⚔️ تحدّي جديد!</h3>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            <span className="font-bold text-violet-600">{pendingInvite.hostName}</span> تتحداكِ في XO
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => declineMatch(pendingInvite.id)}
              className="flex-1 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold py-3 rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            >
              لاحقاً
            </button>
            <button
              onClick={() => acceptMatch(pendingInvite)}
              className="flex-1 bg-gradient-to-r from-violet-500 to-rose-500 text-white font-bold py-3 rounded-2xl shadow-md shadow-violet-200 hover:shadow-lg transition-all"
            >
              لنبدأ! 🎯
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );

  // ─── Match in progress ───
  if (activeMatch) {
    const opponent = activeMatch.hostId === me.uid
      ? { name: activeMatch.guestName, marker: activeMatch.hostMarker === 'X' ? 'O' : 'X' as Marker }
      : { name: activeMatch.hostName, marker: activeMatch.hostMarker };
    const winnerLabel = activeMatch.winner === 'draw'
      ? 'تعادل! 🤝'
      : activeMatch.winner === myMarker
        ? '🎉 فزتِ!'
        : activeMatch.winner
          ? '💪 فاز خصمكِ — حاولي مرة أخرى!'
          : null;

    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-50 via-rose-50 to-amber-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 p-4 sm:p-8" dir="rtl">
        <div className="max-w-2xl mx-auto">
          <button
            onClick={leave}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-rose-600 mb-6 font-bold"
          >
            <ArrowRight className="w-5 h-5" /> الرجوع للساحة
          </button>

          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-2xl p-6 sm:p-10 ring-1 ring-violet-100 dark:ring-slate-700">
            {activeMatch.status === 'pending' ? (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 animate-spin text-violet-500 mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                  بانتظار {opponent.name}...
                </h2>
                <p className="text-slate-500 dark:text-slate-400">سنبدأ المباراة فور قبولها التحدّي ✨</p>
              </div>
            ) : (
              <>
                {/* Score header */}
                <div className="flex items-center justify-between mb-6">
                  <PlayerBadge name={me.heroName || me.name} marker={myMarker!} active={isMyTurn} />
                  <div className="text-center">
                    <Swords className="w-8 h-8 text-rose-500 mx-auto" />
                    <div className="text-xs font-bold text-slate-500 mt-1">XO</div>
                  </div>
                  <PlayerBadge name={opponent.name} marker={opponent.marker} active={activeMatch.turn === opponent.marker && !activeMatch.winner} reverse />
                </div>

                {/* Board */}
                <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto">
                  {activeMatch.board.map((cell, i) => (
                    <motion.button
                      key={i}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => playCell(i)}
                      disabled={!!cell || !isMyTurn}
                      className={`aspect-square rounded-2xl border-2 text-5xl font-black flex items-center justify-center transition-all
                        ${cell ? 'bg-white dark:bg-slate-700' : 'bg-violet-50 dark:bg-slate-700/50 hover:bg-violet-100 dark:hover:bg-slate-700'}
                        ${isMyTurn && !cell ? 'border-violet-300 cursor-pointer shadow-md' : 'border-transparent cursor-default'}
                        ${cell === 'X' ? 'text-rose-500' : cell === 'O' ? 'text-violet-500' : ''}`}
                    >
                      {cell}
                    </motion.button>
                  ))}
                </div>

                {/* Status / Result */}
                <div className="mt-8 text-center">
                  <AnimatePresence mode="wait">
                    {winnerLabel ? (
                      <motion.div
                        key="winner"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                      >
                        <div className="flex items-center justify-center gap-2 mb-4">
                          <Trophy className="w-8 h-8 text-amber-500" />
                          <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">{winnerLabel}</h3>
                        </div>
                        <button
                          onClick={restart}
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-500 to-rose-500 text-white font-bold px-6 py-3 rounded-2xl shadow-lg shadow-violet-200 hover:shadow-xl transition-all"
                        >
                          <RotateCcw className="w-5 h-5" /> العبي مرة أخرى
                        </button>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="status"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-lg font-bold text-slate-600 dark:text-slate-300"
                      >
                        {isMyTurn ? '🎯 دوركِ — اختاري خانة' : `⏳ دور ${opponent.name}...`}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </>
            )}
          </div>
        </div>
        {inviteModal}
      </div>
    );
  }

  // ─── Lobby ───
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-rose-50 to-amber-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 p-4 sm:p-8" dir="rtl">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate('/child')}
          className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-rose-600 mb-6 font-bold"
        >
          <ArrowRight className="w-5 h-5" /> الرجوع للوحة
        </button>

        {/* Hero */}
        <div className="relative bg-gradient-to-br from-violet-500 via-fuchsia-500 to-rose-500 rounded-3xl p-6 sm:p-10 text-white shadow-2xl shadow-violet-200 mb-8 overflow-hidden">
          <div className="absolute -top-4 -right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-amber-300/20 rounded-full blur-2xl" />
          <div className="relative flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm p-4 rounded-2xl">
              <Swords className="w-10 h-10" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-4xl font-black mb-1">ساحة التحدّيات</h1>
              <p className="text-white/90 text-sm sm:text-base">تحدّي صديقاتكِ في XO حيّاً ⚔️✨</p>
            </div>
          </div>
        </div>

        {/* Friends list */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl shadow-xl p-6 ring-1 ring-violet-100 dark:ring-slate-700">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-violet-500" />
              <h2 className="font-black text-lg text-slate-800 dark:text-slate-100">اختاري خصمكِ</h2>
            </div>
            <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-bold">
              {sortedFriends.filter((f) => isOnline(f.uid)).length} متصلة
            </span>
          </div>

          {sortedFriends.length === 0 ? (
            <div className="text-center py-12">
              <Sparkles className="w-12 h-12 text-violet-300 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400 mb-4">لا توجد صديقات بعد!</p>
              <button
                onClick={() => navigate('/friends')}
                className="bg-violet-500 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-violet-600"
              >
                اعثري على صديقات
              </button>
            </div>
          ) : (
            <ul className="space-y-3">
              {sortedFriends.map((f) => (
                <li
                  key={f.uid}
                  className="flex items-center justify-between bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-4 hover:bg-violet-50 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-pink-200 to-violet-200 rounded-full flex items-center justify-center text-2xl">
                        {f.avatar?.hairStyle === 'spiky' ? '👦' : '👧'}
                      </div>
                      {isOnline(f.uid) && (
                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-800" />
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-100">{f.heroName || f.name}</div>
                      <div className="text-xs text-slate-500">
                        {isOnline(f.uid) ? 'متصلة الآن' : 'غير متصلة'}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => challenge(f)}
                    disabled={creating}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-violet-500 to-rose-500 text-white text-sm font-bold px-4 py-2 rounded-xl shadow-md shadow-violet-200 hover:shadow-lg disabled:opacity-50 transition-all"
                  >
                    <Swords className="w-4 h-4" /> تحدّي
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      {inviteModal}
    </div>
  );
}

function PlayerBadge({ name, marker, active, reverse = false }: { name: string; marker: Marker; active: boolean; reverse?: boolean }) {
  return (
    <div className={`flex items-center gap-2 ${reverse ? 'flex-row-reverse' : ''}`}>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-xl
        ${marker === 'X' ? 'bg-rose-100 text-rose-600' : 'bg-violet-100 text-violet-600'}
        ${active ? 'ring-4 ring-emerald-300 animate-pulse' : ''}`}
      >
        {marker}
      </div>
      <div className={reverse ? 'text-left' : 'text-right'}>
        <div className="font-bold text-sm text-slate-800 dark:text-slate-100">{name}</div>
        {active && <div className="text-[10px] text-emerald-600 font-bold">دوركِ الآن</div>}
      </div>
    </div>
  );
}
