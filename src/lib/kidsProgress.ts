export type KidsProgress = {
  stars: number;
  coins: number;
  level: number;
  streakDays: number;
  completedMissionIds: string[];
  unlockedItems: string[];
  equippedItem?: string;
  lastMissionAt?: string;
};

const STORAGE_KEY = 'kids_progress_v1';

const defaultState: KidsProgress = {
  stars: 0,
  coins: 0,
  level: 1,
  streakDays: 0,
  completedMissionIds: [],
  unlockedItems: ['starter_wand'],
  equippedItem: 'starter_wand'
};

export function loadKidsProgress(): KidsProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    return { ...defaultState, ...(JSON.parse(raw) as Partial<KidsProgress>) };
  } catch {
    return defaultState;
  }
}

export function saveKidsProgress(progress: KidsProgress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

export function completeMission(progress: KidsProgress, missionId: string, starsReward: number, coinsReward: number): KidsProgress {
  if (progress.completedMissionIds.includes(missionId)) return progress;

  const today = new Date().toISOString().slice(0, 10);
  const wasToday = progress.lastMissionAt === today;
  const nextStreak = wasToday ? progress.streakDays : progress.streakDays + 1;

  const stars = progress.stars + starsReward;
  const level = Math.max(1, Math.floor(stars / 120) + 1);

  return {
    ...progress,
    stars,
    coins: progress.coins + coinsReward,
    level,
    streakDays: nextStreak,
    completedMissionIds: [...progress.completedMissionIds, missionId],
    lastMissionAt: today
  };
}

export function buyItem(progress: KidsProgress, itemId: string, cost: number): KidsProgress {
  if (progress.unlockedItems.includes(itemId) || progress.coins < cost) return progress;
  return {
    ...progress,
    coins: progress.coins - cost,
    unlockedItems: [...progress.unlockedItems, itemId]
  };
}

export function equipItem(progress: KidsProgress, itemId: string): KidsProgress {
  if (!progress.unlockedItems.includes(itemId)) return progress;
  return { ...progress, equippedItem: itemId };
}
