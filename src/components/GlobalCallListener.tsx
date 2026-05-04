import { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  collectionGroup,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase';
import { CallSession } from '../types';
import { IncomingCallModal } from './IncomingCallModal';
import { createNotification } from '../lib/notifications';

/**
 * Global incoming-call listener.
 *
 * Mounted once in App.tsx for any logged-in child. Listens to the
 * `calls` collection-group across all chats for documents where
 * `calleeId == this child` and `status == 'ringing'`. Shows the
 * IncomingCallModal anywhere in the app. Accepting navigates to
 * /friends so the existing Jitsi flow takes over.
 *
 * Note: requires a Firestore composite index on
 *   collectionGroup('calls') (calleeId ASC, status ASC).
 */
export default function GlobalCallListener() {
  const location = useLocation();
  const navigate = useNavigate();
  const [incomingCall, setIncomingCall] = useState<CallSession | null>(null);
  const notifiedIdsRef = useRef<Set<string>>(new Set());

  // Don't run inside FriendsChat — it owns its own listener already.
  const isFriendsRoute = location.pathname.startsWith('/friends');
  const childStr = typeof window !== 'undefined' ? localStorage.getItem('active_child') : null;
  const isPublicRoute = location.pathname === '/' || location.pathname === '/parent' || location.pathname === '/admin' || location.pathname === '/terms' || location.pathname === '/contact';

  useEffect(() => {
    if (isFriendsRoute || isPublicRoute || !childStr) {
      setIncomingCall(null);
      return;
    }
    let activeChild: any;
    try {
      activeChild = JSON.parse(childStr);
    } catch {
      return;
    }
    if (!activeChild?.uid) return;

    const q = query(
      collectionGroup(db, 'calls'),
      where('calleeId', '==', activeChild.uid),
      where('status', '==', 'ringing')
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        if (snap.empty) {
          setIncomingCall(null);
          return;
        }
        // Process ALL ringing docs: filter stale, sort by createdAt desc,
        // pick the freshest as the active modal, and notify once per id.
        const fresh = snap.docs
          .map((d) => ({ id: d.id, data: d.data() as CallSession }))
          .filter(
            ({ data }) => !data.createdAt || Date.now() - data.createdAt <= 60000
          )
          .sort((a, b) => (b.data.createdAt || 0) - (a.data.createdAt || 0));

        if (fresh.length === 0) {
          setIncomingCall(null);
          return;
        }

        const top = fresh[0];
        setIncomingCall({ ...top.data, id: top.id });

        // Drop one notification per unseen ringing call.
        for (const { id, data } of fresh) {
          if (notifiedIdsRef.current.has(id)) continue;
          notifiedIdsRef.current.add(id);
          createNotification({
            recipientId: activeChild.uid,
            type: 'call_incoming',
            title: data.type === 'video' ? '📹 مكالمة فيديو' : '📞 مكالمة صوتية',
            body: `${data.callerName} تتصل بكِ الآن`,
            link: '/friends',
            fromId: data.callerId,
            fromName: data.callerName,
          });
        }
      },
      (err) => {
        // Index missing or permission denied — fail silently.
        console.warn('GlobalCallListener: ', err.message);
      }
    );

    return () => unsub();
  }, [isFriendsRoute, isPublicRoute, childStr]);

  if (!incomingCall) return null;

  const handleAccept = async () => {
    try {
      await updateDoc(
        doc(db, 'chats', incomingCall.chatId, 'calls', incomingCall.id),
        { status: 'accepted', acceptedAt: Date.now() }
      );
    } catch (e) {
      console.warn('accept call failed:', e);
    }
    setIncomingCall(null);
    navigate('/friends');
  };

  const handleReject = async () => {
    const callId = incomingCall.id;
    const chatId = incomingCall.chatId;
    const callerId = incomingCall.callerId;
    setIncomingCall(null);
    try {
      await updateDoc(doc(db, 'chats', chatId, 'calls', callId), {
        status: 'rejected',
        endedAt: Date.now(),
      });
      // notify caller of missed call
      if (callerId) {
        createNotification({
          recipientId: callerId,
          type: 'call_missed',
          title: '📵 مكالمة فائتة',
          body: 'لم يتمّ الردّ على مكالمتكِ',
          link: '/friends',
        });
      }
    } catch (e) {
      console.warn('reject call failed:', e);
    }
  };

  return (
    <IncomingCallModal
      call={incomingCall}
      onAccept={handleAccept}
      onReject={handleReject}
    />
  );
}
