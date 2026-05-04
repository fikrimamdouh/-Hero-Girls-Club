import admin from "firebase-admin";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import clientConfig from "../firebase-applet-config.json";

let initialized = false;
let app: admin.app.App | null = null;
let firestoreDb: Firestore | null = null;

function getDb(): Firestore | null {
  if (firestoreDb) return firestoreDb;
  if (!app) return null;
  const databaseId = (clientConfig as { firestoreDatabaseId?: string }).firestoreDatabaseId;
  firestoreDb = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
  return firestoreDb;
}

function initAdmin(): admin.app.App | null {
  if (initialized) return app;
  initialized = true;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    console.warn("[fcm] FIREBASE_SERVICE_ACCOUNT_JSON not set — push disabled");
    return null;
  }
  try {
    const cleaned = raw.trim().replace(/^["']|["']$/g, "");
    const creds = JSON.parse(cleaned);
    if (creds.private_key && typeof creds.private_key === "string") {
      creds.private_key = creds.private_key.replace(/\\n/g, "\n");
    }
    const expected = clientConfig.projectId;
    if (creds.project_id && expected && creds.project_id !== expected) {
      console.error(
        `[fcm] PROJECT MISMATCH! Service account project=${creds.project_id} but client config project=${expected}. ` +
        `Push disabled. Please provide a Service Account JSON for project ${expected}.`
      );
      return null;
    }
    app = admin.initializeApp({
      credential: admin.credential.cert(creds as admin.ServiceAccount),
      projectId: creds.project_id,
    });
    console.log(
      `[fcm] Firebase Admin initialized — project=${creds.project_id} db=${(clientConfig as any).firestoreDatabaseId || "(default)"}`
    );
    return app;
  } catch (e) {
    console.error("[fcm] failed to parse FIREBASE_SERVICE_ACCOUNT_JSON:", (e as Error).message);
    return null;
  }
}

const ICONS: Record<string, string> = {
  message: "💌",
  friend_request: "👯",
  friend_accept: "💖",
  call_incoming: "📞",
  call_missed: "📵",
  game_invite: "🎮",
  arena_invite: "⚔️",
  reward: "🌟",
  stars: "✨",
  announcement: "📢",
  system: "🔔",
};

const LINKS_DEFAULT: Record<string, string> = {
  message: "/friends",
  friend_request: "/friends",
  friend_accept: "/friends",
  call_incoming: "/friends",
  call_missed: "/friends",
  game_invite: "/arena",
  arena_invite: "/arena",
  reward: "/dashboard",
  stars: "/dashboard",
  announcement: "/dashboard",
};

async function pruneInvalidTokens(
  db: Firestore,
  uid: string,
  invalid: string[]
) {
  if (!invalid.length) return;
  try {
    const ref = db.collection("children_profiles").doc(uid);
    await ref.update({
      fcmTokens: admin.firestore.FieldValue.arrayRemove(...invalid),
    });
    console.log(`[fcm] pruned ${invalid.length} invalid tokens for ${uid}`);
  } catch (e) {
    console.warn("[fcm] prune failed:", (e as Error).message);
  }
}

async function sendToChild(
  uid: string,
  title: string,
  body: string,
  type: string,
  link?: string,
  callId?: string
) {
  const a = initAdmin();
  if (!a) return;
  const db = getDb();
  if (!db) return;
  try {
    const snap = await db.collection("children_profiles").doc(uid).get();
    if (!snap.exists) return;
    const data = snap.data() as { fcmTokens?: string[] };
    const tokens = (data.fcmTokens || []).filter(Boolean);
    if (!tokens.length) return;

    const icon = ICONS[type] || "🔔";
    const targetLink = link || LINKS_DEFAULT[type] || "/dashboard";

    const res = await a.messaging().sendEachForMulticast({
      tokens,
      notification: {
        title: `${icon} ${title}`.slice(0, 80),
        body: body.slice(0, 200),
      },
      data: {
        type,
        link: targetLink,
        callId: callId || "",
      },
      webpush: {
        fcmOptions: { link: targetLink },
        notification: {
          icon: "/vite.svg",
          badge: "/vite.svg",
          requireInteraction: type === "call_incoming",
        },
      },
    });

    const invalid: string[] = [];
    res.responses.forEach((r, i) => {
      if (!r.success) {
        const code = r.error?.code || "";
        if (
          code.includes("registration-token-not-registered") ||
          code.includes("invalid-registration-token") ||
          code.includes("invalid-argument")
        ) {
          invalid.push(tokens[i]);
        }
      }
    });
    await pruneInvalidTokens(db, uid, invalid);
    console.log(
      `[fcm] sent → ${uid} | ${type} | ok=${res.successCount} fail=${res.failureCount}`
    );
  } catch (e) {
    console.warn("[fcm] send failed:", (e as Error).message);
  }
}

let watcherStarted = false;

export function startFcmWatcher() {
  if (watcherStarted) return;
  const a = initAdmin();
  if (!a) return;
  const db = getDb();
  if (!db) return;
  watcherStarted = true;

  const startedAt = Date.now();
  console.log("[fcm] starting notifications watcher…");

  db.collection("notifications").onSnapshot(
    (snap) => {
      snap.docChanges().forEach((change) => {
        if (change.type !== "added") return;
        const data = change.doc.data() as {
          recipientId?: string;
          type?: string;
          title?: string;
          body?: string;
          link?: string;
          callId?: string;
          createdAt?: number;
        };
        if (!data.recipientId || !data.title || !data.body) return;
        if (data.createdAt && data.createdAt < startedAt - 5_000) return;
        sendToChild(
          data.recipientId,
          data.title,
          data.body,
          data.type || "system",
          data.link,
          data.callId
        );
      });
    },
    (err) => {
      console.warn("[fcm] watcher error:", err.message);
    }
  );
}
