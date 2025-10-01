import { RankInfo } from '../types/game';

export const RANKS: RankInfo[] = [
  { name: 'Bronze I', minTrophies: 0, maxTrophies: 5, tier: 'bronze' },
  { name: 'Bronze II', minTrophies: 6, maxTrophies: 10, tier: 'bronze' },
  { name: 'Bronze III', minTrophies: 11, maxTrophies: 15, tier: 'bronze' },
  { name: 'Silver I', minTrophies: 16, maxTrophies: 25, tier: 'silver' },
  { name: 'Silver II', minTrophies: 26, maxTrophies: 35, tier: 'silver' },
  { name: 'Silver III', minTrophies: 36, maxTrophies: 45, tier: 'silver' },
  { name: 'Gold I', minTrophies: 46, maxTrophies: 60, tier: 'gold' },
  { name: 'Gold II', minTrophies: 61, maxTrophies: 75, tier: 'gold' },
  { name: 'Gold III', minTrophies: 76, maxTrophies: 90, tier: 'gold' },
  { name: 'Platinum I', minTrophies: 91, maxTrophies: 110, tier: 'platinum' },
  { name: 'Platinum II', minTrophies: 111, maxTrophies: 130, tier: 'platinum' },
  { name: 'Platinum III', minTrophies: 131, maxTrophies: 150, tier: 'platinum' },
  { name: 'Diamond I', minTrophies: 151, maxTrophies: 175, tier: 'diamond' },
  { name: 'Diamond II', minTrophies: 176, maxTrophies: 200, tier: 'diamond' },
  { name: 'Diamond III', minTrophies: 201, maxTrophies: 225, tier: 'diamond' },
  { name: 'Champion I', minTrophies: 226, maxTrophies: 250, tier: 'champion' },
  { name: 'Champion II', minTrophies: 251, maxTrophies: 275, tier: 'champion' },
  { name: 'Champion III', minTrophies: 276, maxTrophies: 300, tier: 'champion' },
  { name: 'Grand Champion I', minTrophies: 301, maxTrophies: 325, tier: 'grand_champion' },
  { name: 'Grand Champion II', minTrophies: 326, maxTrophies: 350, tier: 'grand_champion' },
  { name: 'Grand Champion III', minTrophies: 351, maxTrophies: 375, tier: 'grand_champion' },
  { name: 'Grand Champion IV', minTrophies: 376, maxTrophies: 400, tier: 'grand_champion' },
  { name: 'Connect Legend', minTrophies: 401, maxTrophies: 999999, tier: 'legend' }
];

export function getRankByTrophies(trophies: number): RankInfo {
  for (const rank of RANKS) {
    if (trophies >= rank.minTrophies && trophies <= rank.maxTrophies) {
      return rank;
    }
  }
  return RANKS[RANKS.length - 1];
}

export function getTierColor(tier: string): string {
  const colors: Record<string, string> = {
    bronze: '#CD7F32',
    silver: '#C0C0C0',
    gold: '#FFD700',
    platinum: '#E5E4E2',
    diamond: '#B9F2FF',
    champion: '#FF6B9D',
    grand_champion: '#FF0000',
    legend: '#FFFFFF'
  };
  return colors[tier] || '#FFFFFF';
}

export function calculateTrophyChange(won: boolean, winStreak: number): number {
  if (won) {
    const streakBonus = Math.floor(winStreak / 5);
    return 1 + streakBonus;
  } else {
    return -1;
  }
}

export function getSeasonResetTrophies(currentTrophies: number): number {
  const rank = getRankByTrophies(currentTrophies);
  if (rank.name === 'Connect Legend') return 401;
  return rank.minTrophies;
}

export function getSeasonRewardCoins(trophies: number): number {
  const rank = getRankByTrophies(trophies);
  const rewards: Record<string, number> = {
    bronze: 100,
    silver: 250,
    gold: 500,
    platinum: 1000,
    diamond: 2000,
    champion: 3500,
    grand_champion: 5000,
    legend: 10000
  };
  return rewards[rank.tier] || 0;
}
