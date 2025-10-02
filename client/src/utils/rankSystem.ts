import { RankInfo } from '../types/game';

export const RANKS: RankInfo[] = [
  { name: 'Bronze I', minTrophies: 0, maxTrophies: 10, tier: 'bronze' },
  { name: 'Bronze II', minTrophies: 11, maxTrophies: 20, tier: 'bronze' },
  { name: 'Bronze III', minTrophies: 21, maxTrophies: 30, tier: 'bronze' },
  { name: 'Bronze IV', minTrophies: 31, maxTrophies: 40, tier: 'bronze' },
  { name: 'Bronze V', minTrophies: 41, maxTrophies: 50, tier: 'bronze' },
  { name: 'Silver I', minTrophies: 51, maxTrophies: 60, tier: 'silver' },
  { name: 'Silver II', minTrophies: 61, maxTrophies: 70, tier: 'silver' },
  { name: 'Silver III', minTrophies: 71, maxTrophies: 80, tier: 'silver' },
  { name: 'Silver IV', minTrophies: 81, maxTrophies: 90, tier: 'silver' },
  { name: 'Silver V', minTrophies: 91, maxTrophies: 100, tier: 'silver' },
  { name: 'Gold I', minTrophies: 101, maxTrophies: 115, tier: 'gold' },
  { name: 'Gold II', minTrophies: 116, maxTrophies: 130, tier: 'gold' },
  { name: 'Gold III', minTrophies: 131, maxTrophies: 145, tier: 'gold' },
  { name: 'Gold IV', minTrophies: 146, maxTrophies: 160, tier: 'gold' },
  { name: 'Gold V', minTrophies: 161, maxTrophies: 175, tier: 'gold' },
  { name: 'Platinum I', minTrophies: 176, maxTrophies: 195, tier: 'platinum' },
  { name: 'Platinum II', minTrophies: 196, maxTrophies: 215, tier: 'platinum' },
  { name: 'Platinum III', minTrophies: 216, maxTrophies: 235, tier: 'platinum' },
  { name: 'Platinum IV', minTrophies: 236, maxTrophies: 255, tier: 'platinum' },
  { name: 'Platinum V', minTrophies: 256, maxTrophies: 275, tier: 'platinum' },
  { name: 'Diamond I', minTrophies: 276, maxTrophies: 300, tier: 'diamond' },
  { name: 'Diamond II', minTrophies: 301, maxTrophies: 325, tier: 'diamond' },
  { name: 'Diamond III', minTrophies: 326, maxTrophies: 350, tier: 'diamond' },
  { name: 'Diamond IV', minTrophies: 351, maxTrophies: 375, tier: 'diamond' },
  { name: 'Diamond V', minTrophies: 376, maxTrophies: 400, tier: 'diamond' },
  { name: 'Champion I', minTrophies: 401, maxTrophies: 430, tier: 'champion' },
  { name: 'Champion II', minTrophies: 431, maxTrophies: 460, tier: 'champion' },
  { name: 'Champion III', minTrophies: 461, maxTrophies: 490, tier: 'champion' },
  { name: 'Champion IV', minTrophies: 491, maxTrophies: 520, tier: 'champion' },
  { name: 'Champion V', minTrophies: 521, maxTrophies: 550, tier: 'champion' },
  { name: 'Grand Champion I', minTrophies: 551, maxTrophies: 580, tier: 'grand_champion' },
  { name: 'Grand Champion II', minTrophies: 581, maxTrophies: 610, tier: 'grand_champion' },
  { name: 'Grand Champion III', minTrophies: 611, maxTrophies: 640, tier: 'grand_champion' },
  { name: 'Grand Champion IV', minTrophies: 641, maxTrophies: 670, tier: 'grand_champion' },
  { name: 'Grand Champion V', minTrophies: 671, maxTrophies: 700, tier: 'grand_champion' },
  { name: 'Connect Legend', minTrophies: 701, maxTrophies: 999999, tier: 'legend' }
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
  if (rank.name === 'Connect Legend') return 701;
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

export function countPlayersInRank(allPlayers: { trophies: number }[], rank: RankInfo): number {
  return allPlayers.filter(p => 
    p.trophies >= rank.minTrophies && p.trophies <= rank.maxTrophies
  ).length;
}

export function getPlayerCountsByRank(allPlayers: { trophies: number }[]): Map<string, number> {
  const counts = new Map<string, number>();
  
  for (const rank of RANKS) {
    const count = countPlayersInRank(allPlayers, rank);
    counts.set(rank.name, count);
  }
  
  return counts;
}
