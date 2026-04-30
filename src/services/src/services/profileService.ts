 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/src/services/profileService.ts b/src/services/profileService.ts
new file mode 100644
index 0000000000000000000000000000000000000000..67151dd33186dc8793c5696910b03fcdf649cb8b
--- /dev/null
+++ b/src/services/profileService.ts
@@ -0,0 +1,21 @@
+import { db } from '../firebase';
+import { collection, doc, onSnapshot, updateDoc } from 'firebase/firestore';
+import { ChildProfile, OnlineStatus } from '../types';
+
+export const profileService = {
+  listenOnlineStatus: (cb: (statuses: Record<string, OnlineStatus>) => void) =>
+    onSnapshot(collection(db, 'online_status'), (snapshot) => {
+      const statuses: Record<string, OnlineStatus> = {};
+      snapshot.docs.forEach(d => { statuses[d.id] = d.data() as OnlineStatus; });
+      cb(statuses);
+    }),
+
+  listenChildrenProfiles: (cb: (children: ChildProfile[]) => void) =>
+    onSnapshot(collection(db, 'children_profiles'), (snapshot) => {
+      cb(snapshot.docs.map(d => ({ uid: d.id, ...d.data() } as ChildProfile)));
+    }),
+
+  updateChildProfileStatus: async (uid: string, data: any) =>
+    updateDoc(doc(db, 'children_profiles', uid), data)
+};
+
 
EOF
)
