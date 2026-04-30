 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/src/services/roomService.ts b/src/services/roomService.ts
new file mode 100644
index 0000000000000000000000000000000000000000..a108fcbec69604116c8f4e54d3b0a31d816968cd
--- /dev/null
+++ b/src/services/roomService.ts
@@ -0,0 +1,88 @@
+import { db } from '../firebase';
+import { addDoc, collection, doc, onSnapshot, query, setDoc, updateDoc, where } from 'firebase/firestore';
+import { CallSession } from '../types';
+
+export const roomService = {
+  participantsRef: (roomId: string) => collection(db, 'visit_rooms', roomId, 'participants'),
+  invitesRef: (roomId: string) => collection(db, 'visit_rooms', roomId, 'invites'),
+  callsRef: (roomId: string) => collection(db, 'visit_rooms', roomId, 'calls'),
+  messagesRef: (roomId: string) => collection(db, 'visit_rooms', roomId, 'messages'),
+
+  joinRoom: async (roomId: string, payload: { uid: string; heroName: string; avatar: any }) => {
+    await setDoc(doc(db, 'visit_rooms', roomId, 'participants', payload.uid), {
+      ...payload,
+      joinedAt: Date.now()
+    }, { merge: true });
+  },
+
+  sendInvite: async (roomId: string, payload: { fromId: string; fromName: string; toId: string; toName: string }) => {
+    await addDoc(collection(db, 'visit_rooms', roomId, 'invites'), {
+      ...payload,
+      status: 'pending',
+      createdAt: Date.now()
+    });
+  },
+
+  updateInviteStatus: async (roomId: string, inviteId: string, status: 'accepted' | 'rejected') => {
+    await updateDoc(doc(db, 'visit_rooms', roomId, 'invites', inviteId), {
+      status,
+      respondedAt: Date.now()
+    });
+  },
+
+  onParticipants: (roomId: string, cb: (names: string[]) => void) =>
+    onSnapshot(query(collection(db, 'visit_rooms', roomId, 'participants')), (snapshot) => {
+      cb(snapshot.docs.map(d => d.data().heroName as string).filter(Boolean));
+    }),
+
+  onPendingInvitesForUser: (roomId: string, uid: string, cb: (invite: any | null) => void) =>
+    onSnapshot(query(collection(db, 'visit_rooms', roomId, 'invites'), where('toId', '==', uid), where('status', '==', 'pending')), (snapshot) => {
+      cb(snapshot.docs.map(d => ({ id: d.id, ...d.data() }))[0] || null);
+    }),
+
+  startVideoCall: async (roomId: string, payload: { callerId: string; callerName: string; callerAvatar: any; calleeId: string }) => {
+    return addDoc(collection(db, 'visit_rooms', roomId, 'calls'), {
+      chatId: `visit_${roomId}`,
+      ...payload,
+      type: 'video',
+      status: 'ringing',
+      createdAt: Date.now()
+    });
+  },
+
+  updateCallStatus: async (roomId: string, callId: string, status: 'accepted' | 'rejected') => {
+    await updateDoc(doc(db, 'visit_rooms', roomId, 'calls', callId), {
+      status,
+      ...(status === 'accepted' ? { acceptedAt: Date.now() } : { endedAt: Date.now() })
+    });
+  },
+
+  sendRoomMessage: async (roomId: string, payload: { senderId: string; senderName: string; text: string }) => {
+    await addDoc(collection(db, 'visit_rooms', roomId, 'messages'), {
+      ...payload,
+      timestamp: Date.now()
+    });
+  },
+
+  onRoomMessages: (roomId: string, cb: (messages: any[]) => void) =>
+    onSnapshot(query(collection(db, 'visit_rooms', roomId, 'messages')), (snapshot) => {
+      const msgs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
+        .sort((a: any, b: any) => (a.timestamp || 0) - (b.timestamp || 0));
+      cb(msgs);
+    }),
+
+  onIncomingCallsForUser: (roomId: string, uid: string, cb: (call: CallSession | null) => void) =>
+    onSnapshot(query(collection(db, 'visit_rooms', roomId, 'calls'), where('status', 'in', ['ringing', 'accepted'])), (snapshot) => {
+      const call = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as CallSession))
+        .find(c => c.calleeId === uid && c.status === 'ringing');
+      cb(call || null);
+    }),
+
+  createSafetyReport: async (payload: { visitId: string; reporterId: string; reporterName: string }) => {
+    await addDoc(collection(db, 'safety_reports'), {
+      ...payload,
+      createdAt: Date.now(),
+      status: 'new'
+    });
+  }
+};
 
EOF
)
