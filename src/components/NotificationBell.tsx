import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { collection, onSnapshot, query, where, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { AppNotification, markAllRead, markNotificationRead } from '../lib/notifications';

const TIMEAGO = (ms: number): string => {
  const diff = Date.now() - ms;
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'الآن';
  if (m < 60) return `قبل ${m}د`;
  const h = Math.floor(m / 60);
  if (h < 24) return `قبل ${h}س`;
  const d = Math.floor(h / 24);
  return `قبل ${d} يوم`;
};

export default function NotificationBell({ recipientId }: { recipientId: string }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);
  const prevUnreadRef = useRef<number>(0);

  useEffect(() => {
    if (!recipientId) return;
    // Avoid composite index requirement: filter by recipientId only, sort client-side.
    const q = query(
      collection(db, 'notifications'),
      where('recipientId', '==', recipientId),
      limit(50)
    );
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as any) }))
        .sort((a: any, b: any) => (b.createdAt || 0) - (a.createdAt || 0))
        .slice(0, 30) as AppNotification[];
      setItems(list);

      const unread = list.filter((n) => !n.read).length;
      if (unread > prevUnreadRef.current && document.visibilityState === 'visible') {
        try {
          const a = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
          a.volume = 0.4;
          a.play().catch(() => {});
        } catch {}
      }
      prevUnreadRef.current = unread;
    }, (err) => console.warn('notifications listen failed:', err));
    return () => unsub();
  }, [recipientId]);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);

  const unread = items.filter((n) => !n.read).length;

  const handleItemClick = (n: AppNotification) => {
    if (n.id && !n.read) markNotificationRead(n.id);
    if (n.link) navigate(n.link);
    setOpen(false);
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="إشعارات"
        className="relative h-10 w-10 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors"
      >
        <Bell className="h-4 w-4" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 h-5 min-w-[20px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center ring-2 ring-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.18 }}
            className="fixed sm:absolute right-2 left-2 sm:right-0 sm:left-auto mt-2 sm:w-96 max-h-[70vh] bg-white rounded-2xl shadow-2xl ring-1 ring-stone-200 overflow-hidden z-50 flex flex-col"
            dir="rtl"
          >
            <div className="px-4 py-3 bg-gradient-to-r from-rose-50 to-pink-50 border-b border-rose-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-rose-900">الإشعارات</p>
                <p className="text-[11px] text-rose-600 font-bold">
                  {unread > 0 ? `${unread} جديدة` : 'لا يوجد جديد'}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {unread > 0 && (
                  <button
                    onClick={() => markAllRead(recipientId)}
                    className="text-[11px] font-extrabold text-rose-600 hover:text-rose-800 px-2 py-1 rounded-lg hover:bg-rose-100 inline-flex items-center gap-1"
                  >
                    <Check className="h-3 w-3" /> اقرأي الكل
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="h-7 w-7 rounded-lg hover:bg-rose-100 text-rose-500 flex items-center justify-center"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto flex-1">
              {items.length === 0 ? (
                <div className="py-12 text-center text-stone-400">
                  <Bell className="h-10 w-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm font-bold">لا توجد إشعارات بعد</p>
                  <p className="text-[11px] mt-1">رسائل صديقاتك ومكافآتك ستظهر هنا</p>
                </div>
              ) : (
                <ul className="divide-y divide-stone-100">
                  {items.map((n) => (
                    <li key={n.id}>
                      <button
                        onClick={() => handleItemClick(n)}
                        className={`w-full text-right px-4 py-3 flex items-start gap-3 hover:bg-stone-50 transition-colors ${
                          !n.read ? 'bg-rose-50/50' : ''
                        }`}
                      >
                        <div className="shrink-0 h-10 w-10 rounded-xl bg-gradient-to-br from-rose-100 to-pink-100 flex items-center justify-center text-xl ring-1 ring-rose-200">
                          {n.icon || '🔔'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm leading-tight truncate ${!n.read ? 'font-black text-stone-900' : 'font-bold text-stone-700'}`}>
                            {n.title}
                          </p>
                          <p className="text-[12px] text-stone-500 leading-snug line-clamp-2 mt-0.5">{n.body}</p>
                          <p className="text-[10px] text-stone-400 font-bold mt-1">{TIMEAGO(n.createdAt)}</p>
                        </div>
                        {!n.read && (
                          <span className="shrink-0 mt-1.5 h-2 w-2 rounded-full bg-rose-500" />
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
