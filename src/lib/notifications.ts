import { addDoc, collection, doc, updateDoc, writeBatch, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '../firebase';

export type NotificationType =
  | 'message'
  | 'friend_request'
  | 'friend_accepted'
  | 'visit'
  | 'reward'
  | 'call_incoming'
  | 'call_missed'
  | 'announcement';

export interface AppNotification {
  id?: string;
  recipientId: string;
  type: NotificationType;
  title: string;
  body: string;
  icon?: string;
  link?: string;
  fromId?: string;
  fromName?: string;
  read: boolean;
  createdAt: number;
}

const TYPE_ICON: Record<NotificationType, string> = {
  message: '💬',
  friend_request: '🤝',
  friend_accepted: '✨',
  visit: '🚪',
  reward: '⭐',
  call_incoming: '📞',
  call_missed: '📵',
  announcement: '📣',
};

export async function createNotification(
  n: Omit<AppNotification, 'id' | 'read' | 'createdAt' | 'icon'> & { icon?: string }
): Promise<void> {
  if (!n.recipientId) return;
  try {
    await addDoc(collection(db, 'notifications'), {
      ...n,
      icon: n.icon || TYPE_ICON[n.type] || '🔔',
      read: false,
      createdAt: Date.now(),
    });
  } catch (err) {
    console.warn('createNotification failed (non-critical):', err);
  }
}

export async function markNotificationRead(id: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'notifications', id), { read: true });
  } catch (err) {
    console.warn('markNotificationRead failed:', err);
  }
}

/**
 * Send a notification to every approved child. Use for admin
 * announcements / system-wide alerts. Batched to avoid hot loops.
 */
export async function broadcastAnnouncement(
  title: string,
  body: string,
  fromName = 'الإدارة',
  link = '/dashboard'
): Promise<{ sent: number }> {
  const snap = await getDocs(
    query(collection(db, 'children_profiles'), where('status', '==', 'approved'))
  );
  let sent = 0;
  for (const d of snap.docs) {
    const uid = d.id;
    if (!uid) continue;
    await createNotification({
      recipientId: uid,
      type: 'announcement',
      title,
      body,
      fromName,
      link,
    });
    sent++;
  }
  return { sent };
}

/**
 * Convenience wrapper for star/reward notifications.
 */
export async function notifyReward(
  recipientId: string,
  body: string,
  link = '/dashboard'
): Promise<void> {
  await createNotification({
    recipientId,
    type: 'reward',
    title: '🌟 مكافأة جديدة!',
    body,
    link,
  });
}

export async function markAllRead(recipientId: string): Promise<void> {
  try {
    // Loop in batches of 200 to handle >50 unread notifications safely.
    // (Firestore supports 500 ops per batch.)
    for (let i = 0; i < 10; i++) {
      const q = query(
        collection(db, 'notifications'),
        where('recipientId', '==', recipientId),
        where('read', '==', false),
        limit(200)
      );
      const snap = await getDocs(q);
      if (snap.empty) return;
      const batch = writeBatch(db);
      snap.docs.forEach((d) => batch.update(d.ref, { read: true }));
      await batch.commit();
      if (snap.size < 200) return;
    }
  } catch (err) {
    console.warn('markAllRead failed:', err);
  }
}
