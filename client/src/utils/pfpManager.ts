import { Pfp } from '../types/game';

let pfpsCache: Pfp[] | null = null;

export async function loadPfps(): Promise<Pfp[]> {
  if (pfpsCache) {
    return pfpsCache;
  }

  try {
    const response = await fetch('/pfps.json');
    const pfps: Pfp[] = await response.json();
    pfpsCache = pfps;
    return pfps;
  } catch (error) {
    console.error('Failed to load pfps:', error);
    return getDefaultPfps();
  }
}

function getDefaultPfps(): Pfp[] {
  return [
    {
      pfpId: 1,
      pfpName: 'Default',
      imageName: 'default.png',
      price: null,
      ranked: false,
      season: null,
      rank: null
    }
  ];
}

export function getPfpById(pfpId: number, pfps: Pfp[]): Pfp | undefined {
  return pfps.find(p => p.pfpId === pfpId);
}

export function getPfpImagePath(imageName: string): string {
  return `/pfps/${imageName}`;
}

export function getShopPfps(pfps: Pfp[]): Pfp[] {
  return pfps.filter(pfp => 
    pfp.price !== null && 
    pfp.price > 0 && 
    pfp.offSale !== true
  );
}

export function getRankedPfpsBySeasonAndRank(
  pfps: Pfp[],
  season: number,
  rank: string
): Pfp | undefined {
  return pfps.find(
    pfp => 
      pfp.ranked && 
      pfp.season === season && 
      pfp.rank === rank
  );
}

export function getRankPfpsForPlayer(
  pfps: Pfp[],
  finalRank: string,
  season: number
): number[] {
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
  
  const earnedPfps: number[] = [];
  earnedRanks.forEach(rank => {
    const pfp = pfps.find(
      p => p.ranked && p.season === season && p.rank === rank
    );
    if (pfp) {
      earnedPfps.push(pfp.pfpId);
    }
  });
  
  return earnedPfps;
}

export function generateShopPfpRotation(
  pfps: Pfp[],
  seed: number,
  count: number = 3
): Pfp[] {
  const shopPfps = getShopPfps(pfps);
  
  if (shopPfps.length <= count) {
    return shopPfps;
  }
  
  const random = (n: number) => {
    seed = (seed * 9301 + 49297) % 233280;
    return (seed / 233280) * n;
  };
  
  const selected: Pfp[] = [];
  const used = new Set<number>();
  
  for (let i = 0; i < count && selected.length < shopPfps.length; i++) {
    let index: number;
    do {
      index = Math.floor(random(shopPfps.length));
    } while (used.has(index));
    
    used.add(index);
    selected.push(shopPfps[index]);
  }
  
  return selected;
}

export function getAIPfp(
  pfps: Pfp[],
  aiTrophies: number,
  currentSeason: number
): number | null {
  const rankOrder = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Champion', 'Grand Champion', 'Connect Legend'];
  
  const getRankTierFromTrophies = (trophies: number): string | null => {
    if (trophies >= 701) return 'Connect Legend';
    if (trophies >= 551) return 'Grand Champion';
    if (trophies >= 401) return 'Champion';
    if (trophies >= 276) return 'Diamond';
    if (trophies >= 176) return 'Platinum';
    if (trophies >= 101) return 'Gold';
    if (trophies >= 51) return 'Silver';
    if (trophies >= 0) return 'Bronze';
    return null;
  };

  const aiRankTier = getRankTierFromTrophies(aiTrophies);
  if (!aiRankTier) return null;

  const shopPfpIds = getShopPfps(pfps).map(p => p.pfpId);
  
  const availableRankedPfps: Pfp[] = [];
  for (let season = 1; season < currentSeason; season++) {
    const pfp = pfps.find(
      p => p.ranked && p.season === season && p.rank === aiRankTier
    );
    if (pfp) {
      availableRankedPfps.push(pfp);
    }
  }

  const possiblePfps: number[] = [];
  
  if (aiTrophies < 176) {
    possiblePfps.push(...shopPfpIds);
    if (availableRankedPfps.length > 0) {
      possiblePfps.push(...availableRankedPfps.map(p => p.pfpId));
    }
    possiblePfps.push(null as any);
  } else if (aiTrophies < 401) {
    if (availableRankedPfps.length > 0) {
      possiblePfps.push(...availableRankedPfps.map(p => p.pfpId));
      possiblePfps.push(...availableRankedPfps.map(p => p.pfpId));
    }
    possiblePfps.push(...shopPfpIds);
    possiblePfps.push(null as any);
  } else {
    if (availableRankedPfps.length > 0) {
      possiblePfps.push(...availableRankedPfps.map(p => p.pfpId));
      possiblePfps.push(...availableRankedPfps.map(p => p.pfpId));
      possiblePfps.push(...availableRankedPfps.map(p => p.pfpId));
    }
    possiblePfps.push(...shopPfpIds);
    possiblePfps.push(null as any);
  }

  if (possiblePfps.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * possiblePfps.length);
  return possiblePfps[randomIndex] || null;
}
