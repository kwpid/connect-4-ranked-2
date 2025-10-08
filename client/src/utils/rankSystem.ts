import { RankInfo } from '../types/game';

export const RANKS: RankInfo[] = [
  { name: 'Bronze I', minTrophies: 0, maxTrophies: 32, tier: 'bronze' },
  { name: 'Bronze II', minTrophies: 33, maxTrophies: 65, tier: 'bronze' },
  { name: 'Bronze III', minTrophies: 66, maxTrophies: 98, tier: 'bronze' },
  { name: 'Silver I', minTrophies: 99, maxTrophies: 131, tier: 'silver' },
  { name: 'Silver II', minTrophies: 132, maxTrophies: 164, tier: 'silver' },
  { name: 'Silver III', minTrophies: 165, maxTrophies: 197, tier: 'silver' },
  { name: 'Gold I', minTrophies: 198, maxTrophies: 230, tier: 'gold' },
  { name: 'Gold II', minTrophies: 231, maxTrophies: 263, tier: 'gold' },
  { name: 'Gold III', minTrophies: 264, maxTrophies: 296, tier: 'gold' },
  { name: 'Platinum I', minTrophies: 297, maxTrophies: 329, tier: 'platinum' },
  { name: 'Platinum II', minTrophies: 330, maxTrophies: 362, tier: 'platinum' },
  { name: 'Platinum III', minTrophies: 363, maxTrophies: 395, tier: 'platinum' },
  { name: 'Diamond I', minTrophies: 396, maxTrophies: 428, tier: 'diamond' },
  { name: 'Diamond II', minTrophies: 429, maxTrophies: 462, tier: 'diamond' },
  { name: 'Diamond III', minTrophies: 463, maxTrophies: 496, tier: 'diamond' },
  { name: 'Champion I', minTrophies: 497, maxTrophies: 530, tier: 'champion' },
  { name: 'Champion II', minTrophies: 531, maxTrophies: 564, tier: 'champion' },
  { name: 'Champion III', minTrophies: 565, maxTrophies: 598, tier: 'champion' },
  { name: 'Grand Champion I', minTrophies: 599, maxTrophies: 632, tier: 'grand_champion' },
  { name: 'Grand Champion II', minTrophies: 633, maxTrophies: 666, tier: 'grand_champion' },
  { name: 'Grand Champion III', minTrophies: 667, maxTrophies: 700, tier: 'grand_champion' },
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

export function getRankImagePath(rankName: string): string {
  // Convert rank name to image filename
  // Example: "Diamond I" -> "diamond_i.png"
  const imageName = rankName.toLowerCase().replace(/ /g, '_') + '.png';
  return `/ranks/${imageName}`;
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
  const minTrophies = rank.name === 'Connect Legend' ? 701 : rank.minTrophies;
  
  // Reset to minimum trophies of current tier (stay at or slightly above minimum)
  // Add 0-10% above minimum to give slight variance
  const additionPercent = Math.random() * 0.10; // Random between 0-10%
  const addition = Math.floor(minTrophies * additionPercent);
  const resetTrophies = minTrophies + addition;
  
  // Never reset to more than current trophies (prevent trophy gains)
  return Math.min(currentTrophies, resetTrophies);
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
