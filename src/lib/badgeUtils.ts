import { db } from '../firebase';
import { doc, getDoc, updateDoc, arrayUnion } from 'firebase/firestore';
import { toast } from 'sonner';

export const BADGE_IDS = {
  COURAGE: 'شجاعة',
  WISDOM: 'حكمة',
  FRIENDSHIP: 'صداقة',
} as const;

export type BadgeId = typeof BADGE_IDS[keyof typeof BADGE_IDS];

export const BADGE_DEFINITIONS = [
  {
    id: BADGE_IDS.COURAGE,
    title: 'وسام الشجاعة',
    icon: '⚔️',
    desc: 'أكملي 10 مهام',
    color: 'red',
  },
  {
    id: BADGE_IDS.WISDOM,
    title: 'وسام الحكمة',
    icon: '📖',
    desc: 'اكتبي في المفكرة 5 مرات',
    color: 'indigo',
  },
  {
    id: BADGE_IDS.FRIENDSHIP,
    title: 'وسام الصداقة',
    icon: '🤝',
    desc: 'زوري بيت صديقة',
    color: 'teal',
  },
];

const BADGE_TOAST_MESSAGES: Record<BadgeId, string> = {
  [BADGE_IDS.COURAGE]: '🏆 حصلتِ على وسام الشجاعة! أكملتِ 10 مهام رائعة!',
  [BADGE_IDS.WISDOM]: '📖 حصلتِ على وسام الحكمة! كتبتِ في مفكرتكِ 5 مرات!',
  [BADGE_IDS.FRIENDSHIP]: '🤝 حصلتِ على وسام الصداقة! زرتِ بيت صديقتكِ!',
};

export async function awardBadgeIfNotEarned(uid: string, badgeId: BadgeId): Promise<boolean> {
  try {
    const profileRef = doc(db, 'children_profiles', uid);
    const snap = await getDoc(profileRef);
    if (!snap.exists()) return false;

    const data = snap.data();
    const badges: string[] = data.badges || [];

    if (badges.includes(badgeId)) return false;

    await updateDoc(profileRef, {
      badges: arrayUnion(badgeId),
    });

    toast.success(BADGE_TOAST_MESSAGES[badgeId], { duration: 5000 });

    const stored = localStorage.getItem('active_child');
    if (stored) {
      const child = JSON.parse(stored);
      if (child.uid === uid) {
        child.badges = [...badges, badgeId];
        localStorage.setItem('active_child', JSON.stringify(child));
      }
    }

    return true;
  } catch {
    return false;
  }
}
