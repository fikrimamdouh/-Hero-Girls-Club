import { db } from '../firebase';
import { addDoc, collection, doc, onSnapshot, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { CallSession } from '../types';

export const roomService = {
  joinRoom: async (roomId: string, payload: { uid: string; heroName: string; avatar: any }) => {
    await setDoc(doc(db, 'visit_rooms', roomId, 'participants', payload.uid), { ...payload, joinedAt: Date.now() }, { merge: true });
  },
  onParticipants: (roomId: string, cb: (names: string[]) => void) => onSnapshot(query(collection(db, 'visit_rooms', roomId, 'participants')), (snapshot) => cb(snapshot.docs.map((d) => d.data().heroName as string).filter(Boolean))),
  sendInvite: async (roomId: string, payload: { fromId: string; fromName: string; toId: string; toName: string }) => addDoc(collection(db, 'visit_rooms', roomId, 'invites'), { ...payload, status: 'pending', createdAt: Date.now() }),
  onPendingInvitesForUser: (roomId: string, uid: string, cb: (invite: any | null) => void) => onSnapshot(query(collection(db, 'visit_rooms', roomId, 'invites'), where('toId', '==', uid), where('status', '==', 'pending')), (snapshot) => cb(snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))[0] || null)),
  updateInviteStatus: async (roomId: string, inviteId: string, status: 'accepted' | 'rejected') => updateDoc(doc(db, 'visit_rooms', roomId, 'invites', inviteId), { status, respondedAt: Date.now() }),
  startVideoCall: async (roomId: string, payload: { callerId: string; callerName: string; callerAvatar: any; calleeId: string }) => addDoc(collection(db, 'visit_rooms', roomId, 'calls'), { chatId: `visit_${roomId}`, ...payload, type: 'video', status: 'ringing', createdAt: Date.now() }),
  updateCallStatus: async (roomId: string, callId: string, status: 'accepted' | 'rejected') => updateDoc(doc(db, 'visit_rooms', roomId, 'calls', callId), { status, ...(status === 'accepted' ? { acceptedAt: Date.now() } : { endedAt: Date.now() }) }),
  onIncomingCallsForUser: (roomId: string, uid: string, cb: (call: CallSession | null) => void) => onSnapshot(query(collection(db, 'visit_rooms', roomId, 'calls'), where('status', '==', 'ringing')), (snapshot) => {
    const call = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as CallSession)).find((c) => c.calleeId === uid);
    cb(call || null);
  }),
};
