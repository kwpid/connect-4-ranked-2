import { Banner } from '../types/game';

let bannersCache: Banner[] | null = null;

export async function loadBanners(): Promise<Banner[]> {
  if (bannersCache) {
    return bannersCache;
  }

  try {
    const response = await fetch('/banners.json');
    const banners: Banner[] = await response.json();
    bannersCache = banners;
    return banners;
  } catch (error) {
    console.error('Failed to load banners:', error);
    return getDefaultBanners();
  }
}

function getDefaultBanners(): Banner[] {
  return [
    {
      bannerId: 1,
      bannerName: 'Default',
      imageName: 'default.png',
      price: null,
      ranked: false,
      season: null,
      rank: null
    }
  ];
}

export function getBannerById(bannerId: number, banners: Banner[]): Banner | undefined {
  return banners.find(b => b.bannerId === bannerId);
}

export function getBannerImagePath(imageName: string): string {
  return `/banners/${imageName}`;
}

export function getShopBanners(banners: Banner[]): Banner[] {
  return banners.filter(banner => banner.price !== null && banner.price > 0);
}

export function getRankedBannersBySeasonAndRank(
  banners: Banner[],
  season: number,
  rank: string
): Banner | undefined {
  return banners.find(
    banner => 
      banner.ranked && 
      banner.season === season && 
      banner.rank === rank
  );
}

export function getRankBannersForPlayer(
  banners: Banner[],
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
  
  const earnedBanners: number[] = [];
  earnedRanks.forEach(rank => {
    const banner = banners.find(
      b => b.ranked && b.season === season && b.rank === rank
    );
    if (banner) {
      earnedBanners.push(banner.bannerId);
    }
  });
  
  return earnedBanners;
}

export function generateShopBannerRotation(
  banners: Banner[],
  seed: number,
  count: number = 3
): Banner[] {
  const shopBanners = getShopBanners(banners);
  
  if (shopBanners.length <= count) {
    return shopBanners;
  }
  
  const random = (n: number) => {
    seed = (seed * 9301 + 49297) % 233280;
    return (seed / 233280) * n;
  };
  
  const selected: Banner[] = [];
  const used = new Set<number>();
  
  for (let i = 0; i < count && selected.length < shopBanners.length; i++) {
    let index: number;
    do {
      index = Math.floor(random(shopBanners.length));
    } while (used.has(index));
    
    used.add(index);
    selected.push(shopBanners[index]);
  }
  
  return selected;
}
