 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/src/services/chatService.ts b/src/services/chatService.ts
new file mode 100644
index 0000000000000000000000000000000000000000..423a59217722639196eb9ea1223460923112930a
--- /dev/null
+++ b/src/services/chatService.ts
@@ -0,0 +1,67 @@
+import { db } from '../firebase';
+import { addDoc, arrayRemove, arrayUnion, collection, doc, getDocs, onSnapshot, orderBy, query, setDoc, updateDoc, where } from 'firebase/firestore';
+
+export const chatService = {
+  listenMessages: (chatId: string, cb: (messages: any[]) => void) => {
+    const qMessages = query(
+      collection(db, 'direct_messages'),
+      where('chatId', '==', chatId),
+      orderBy('timestamp', 'asc')
+    );
+    return onSnapshot(qMessages, (snapshot) => {
+      cb(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
+    });
+  },
+
+  markMessageRead: async (messageId: string, uid: string) => {
+    await updateDoc(doc(db, 'direct_messages', messageId), {
+      readBy: arrayUnion(uid)
+    });
+  },
+
+  sendDirectMessage: async (messageData: any) => {
+    await addDoc(collection(db, 'direct_messages'), messageData);
+  },
+
+  updateChatMeta: async (chatId: string, data: any) => {
+    await setDoc(doc(db, 'chats', chatId), data, { merge: true });
+  },
+
+  setTyping: async (chatId: string, uid: string, isTyping: boolean) => {
+    await setDoc(doc(db, 'chats', chatId), { typing: isTyping ? arrayUnion(uid) : arrayRemove(uid) }, { merge: true });
+  },
+
+  listenIncomingCalls: (chatId: string, calleeId: string, cb: (call: any | null) => void) => {
+    const qCalls = query(
+      collection(db, 'chats', chatId, 'calls'),
+      where('calleeId', '==', calleeId),
+      where('status', '==', 'ringing')
+    );
+    return onSnapshot(qCalls, (snapshot) => {
+      if (!snapshot.empty) cb({ ...snapshot.docs[0].data(), id: snapshot.docs[0].id });
+      else cb(null);
+    });
+  },
+
+  startCall: async (chatId: string, payload: any) => addDoc(collection(db, 'chats', chatId, 'calls'), payload),
+  updateCall: async (chatId: string, callId: string, data: any) => updateDoc(doc(db, 'chats', chatId, 'calls', callId), data),
+  findActiveCalls: async (chatId: string, calleeId: string) => {
+    const qCalls = query(
+      collection(db, 'chats', chatId, 'calls'),
+      where('calleeId', '==', calleeId),
+      where('status', 'in', ['ringing', 'accepted', 'connected'])
+    );
+    return getDocs(qCalls);
+  },
+
+  sendFriendRequest: async (data: any) => addDoc(collection(db, 'friend_requests'), data),
+  updateFriendRequest: async (requestId: string, status: 'accepted' | 'declined') =>
+    updateDoc(doc(db, 'friend_requests', requestId), { status }),
+  listenFriendRequests: (cb: (requests: any[]) => void) =>
+    onSnapshot(query(collection(db, 'friend_requests')), (snapshot) => cb(snapshot.docs.map(d => ({ id: d.id, ...d.data() })))),
+
+  updateReactions: async (messageId: string, reactions: any) =>
+    updateDoc(doc(db, 'direct_messages', messageId), { reactions }),
+  editMessage: async (messageId: string, text: string) =>
+    updateDoc(doc(db, 'direct_messages', messageId), { text, editedAt: Date.now() })
+};
 
EOF
)
