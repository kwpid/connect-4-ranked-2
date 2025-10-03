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
  return banners.filter(banner => 
    banner.price !== null && 
    banner.price > 0 && 
    banner.offSale !== true
  );
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

export function getAIBanner(
  banners: Banner[],
  aiTrophies: number,
  currentSeason: number
): number {
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
  if (!aiRankTier) return 1; // Default banner

  const shopBannerIds = [2, 3, 4];
  const defaultBannerId = 1;
  
  const availableRankedBanners: Banner[] = [];
  for (let season = 1; season < currentSeason; season++) {
    const banner = banners.find(
      b => b.ranked && b.season === season && b.rank === aiRankTier
    );
    if (banner) {
      availableRankedBanners.push(banner);
    }
  }

  const possibleBanners: number[] = [];
  
  if (aiTrophies < 176) {
    possibleBanners.push(...shopBannerIds);
    if (availableRankedBanners.length > 0) {
      possibleBanners.push(...availableRankedBanners.map(b => b.bannerId));
    }
    possibleBanners.push(defaultBannerId);
  } else if (aiTrophies < 401) {
    if (availableRankedBanners.length > 0) {
      possibleBanners.push(...availableRankedBanners.map(b => b.bannerId));
      possibleBanners.push(...availableRankedBanners.map(b => b.bannerId));
    }
    possibleBanners.push(...shopBannerIds);
    possibleBanners.push(defaultBannerId);
  } else {
    if (availableRankedBanners.length > 0) {
      possibleBanners.push(...availableRankedBanners.map(b => b.bannerId));
      possibleBanners.push(...availableRankedBanners.map(b => b.bannerId));
      possibleBanners.push(...availableRankedBanners.map(b => b.bannerId));
    }
    possibleBanners.push(...shopBannerIds);
    possibleBanners.push(defaultBannerId);
  }

  if (possibleBanners.length === 0) {
    return defaultBannerId;
  }

  const randomIndex = Math.floor(Math.random() * possibleBanners.length);
  return possibleBanners[randomIndex] || defaultBannerId;
}
