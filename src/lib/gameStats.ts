import { loadKidsProgress, saveKidsProgress } from './kidsProgress';

export type GameStat = {
  bestScore: number;
  totalPlays: number;
  totalEarned: number;
  lastPlayedAt?: string;
};

export type GameStatsMap = Record<string, GameStat>;

const KEY = 'game_stats_v1';
const empty: GameStat = { bestScore: 0, totalPlays: 0, totalEarned: 0 };

export function loadGameStats(): GameStatsMap {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as GameStatsMap) : {};
  } catch { return {}; }
}

export function getGameStat(gameId: string): GameStat {
  return loadGameStats()[gameId] || empty;
}

export function saveGameStats(map: GameStatsMap) {
  localStorage.setItem(KEY, JSON.stringify(map));
}

/**
 * Record a play of a game. Awards stars + coins to the unified kids
 * progress system. Returns { newBest, starsAwarded, coinsAwarded }.
 *
 * Awards:
 *  - 1 coin per 10 game points (rounded down, capped at 50/play)
 *  - 1 star per play if score >= 30 (capped at 5 stars/play)
 *  - +5 bonus star on a new personal best
 */
export function recordGamePlay(gameId: string, score: number) {
  const all = loadGameStats();
  const prev = all[gameId] || { ...empty };
  const newBest = score > prev.bestScore;

  const coinsAwarded = Math.min(50, Math.floor(score / 10));
  const baseStars = score >= 30 ? Math.min(5, Math.floor(score / 30)) : 0;
  const starsAwarded = baseStars + (newBest ? 5 : 0);

  all[gameId] = {
    bestScore: Math.max(prev.bestScore, score),
    totalPlays: prev.totalPlays + 1,
    totalEarned: prev.totalEarned + starsAwarded,
    lastPlayedAt: new Date().toISOString(),
  };
  saveGameStats(all);

  // award to global progress
  if (starsAwarded > 0 || coinsAwarded > 0) {
    const p = loadKidsProgress();
    const stars = p.stars + starsAwarded;
    saveKidsProgress({
      ...p,
      stars,
      coins: p.coins + coinsAwarded,
      level: Math.max(1, Math.floor(stars / 120) + 1),
    });
  }

  return { newBest, starsAwarded, coinsAwarded };
}

/**
 * Picks today's daily-challenge game id from a stable rotation.
 * Same id all day for every user.
 */
export function getDailyChallengeId(candidateIds: string[]): string | null {
  if (candidateIds.length === 0) return null;
  const day = new Date();
  const seed = day.getFullYear() * 10000 + (day.getMonth() + 1) * 100 + day.getDate();
  return candidateIds[seed % candidateIds.length];
}
