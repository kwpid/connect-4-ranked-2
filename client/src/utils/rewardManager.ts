import { Banner, Pfp } from '../types/game';
import { loadBanners, getRankedBannersBySeasonAndRank } from './bannerManager';
import { loadPfps, getRankedPfpsBySeasonAndRank } from './pfpManager';

export interface SeasonReward {
  type: 'banner' | 'pfp';
  item: Banner | Pfp;
  rank: string;
}

/**
 * Get seasonal rewards for a player based on their reward progress.
 * Tries to award banners first, but falls back to PFPs if banners are not available for that season/rank.
 * @param currentTier The player's current rank tier (Bronze, Silver, Gold, etc.)
 * @param seasonRewardWins Wins per tier for the current season
 * @param season The season number
 * @returns Array of rewards (banners or PFPs) that the player earned
 */
export async function getSeasonalRewardsForPlayer(
  currentTier: string,
  seasonRewardWins: { [tier: string]: number } = {},
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
  
  const currentTierIndex = rankOrder.findIndex(r => r.toLowerCase() === currentTier.toLowerCase());
  if (currentTierIndex === -1) return [];
  
  const rewards: SeasonReward[] = [];
  
  // Load both banners and PFPs
  const banners = await loadBanners();
  const pfps = await loadPfps();
  
  // Find highest tier with 5+ wins
  let highestEarnedTierIndex = -1;
  for (let i = rankOrder.length - 1; i >= 0; i--) {
    if ((seasonRewardWins[rankOrder[i]] || 0) >= 5) {
      highestEarnedTierIndex = i;
      break;
    }
  }
  
  // Award rewards for highest earned tier and all below
  rankOrder.forEach((rank, index) => {
    // Award reward if this tier is at or below the highest earned tier
    const shouldAward = index <= highestEarnedTierIndex;
    
    if (shouldAward) {
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
