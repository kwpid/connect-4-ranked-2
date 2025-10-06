import { Banner, Pfp } from '../types/game';
import { loadBanners, getRankedBannersBySeasonAndRank } from './bannerManager';
import { loadPfps, getRankedPfpsBySeasonAndRank } from './pfpManager';

export interface SeasonReward {
  type: 'banner' | 'pfp';
  item: Banner | Pfp;
  rank: string;
}

/**
 * Get seasonal rewards for a player based on their final rank.
 * Tries to award banners first, but falls back to PFPs if banners are not available for that season/rank.
 * @param finalRank The player's final rank tier (Bronze, Silver, Gold, etc.)
 * @param season The season number
 * @returns Array of rewards (banners or PFPs) that the player earned
 */
export async function getSeasonalRewardsForPlayer(
  finalRank: string,
  season: number
): Promise<SeasonReward[]> {
  const rankOrder = [
    'Bronze',
    'Silver',
    'Gold',
    'Platinum',
    'Diamond',
    'Champion',
    'Grand Champion',
    'Connect Legend'
  ];
  
  const finalRankIndex = rankOrder.findIndex(r => r.toLowerCase() === finalRank.toLowerCase());
  if (finalRankIndex === -1) return [];
  
  const earnedRanks = rankOrder.slice(0, finalRankIndex + 1);
  const rewards: SeasonReward[] = [];
  
  // Load both banners and PFPs
  const banners = await loadBanners();
  const pfps = await loadPfps();
  
  // For each earned rank, try to find a reward
  earnedRanks.forEach(rank => {
    // First, try to find a banner for this rank/season
    const banner = getRankedBannersBySeasonAndRank(banners, season, rank);
    
    if (banner) {
      rewards.push({
        type: 'banner',
        item: banner,
        rank
      });
    } else {
      // If no banner available, try to find a PFP
      const pfp = getRankedPfpsBySeasonAndRank(pfps, season, rank);
      
      if (pfp) {
        rewards.push({
          type: 'pfp',
          item: pfp,
          rank
        });
      }
      // If neither banner nor PFP available, no reward for this rank
    }
  });
  
  return rewards;
}

/**
 * Extract banner IDs from season rewards
 */
export function extractBannerIds(rewards: SeasonReward[]): number[] {
  return rewards
    .filter(r => r.type === 'banner')
    .map(r => (r.item as Banner).bannerId);
}

/**
 * Extract PFP IDs from season rewards
 */
export function extractPfpIds(rewards: SeasonReward[]): number[] {
  return rewards
    .filter(r => r.type === 'pfp')
    .map(r => (r.item as Pfp).pfpId);
}
