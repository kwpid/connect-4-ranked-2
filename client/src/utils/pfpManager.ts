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
