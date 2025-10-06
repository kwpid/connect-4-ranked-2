import { Crate, CrateReward, CrateOpenResult, Banner, Title, Pfp, ItemAttribute } from '../types/game';
import { loadBanners, getBannerById } from './bannerManager';
import { getTitleFromId } from './titleManager';
import { loadPfps, getPfpById } from './pfpManager';

let cratesCache: Crate[] | null = null;

function assignRandomAttributes(): ItemAttribute[] {
  const attributes: ItemAttribute[] = [];
  
  const certifiedRoll = Math.random() * 100;
  if (certifiedRoll < 4) {
    attributes.push('certified');
  }
  
  const winTrackerRoll = Math.random() * 100;
  if (winTrackerRoll < 2.5) {
    attributes.push('win_tracker');
  }
  
  return attributes;
}

export async function loadCrates(): Promise<Crate[]> {
  if (cratesCache) {
    return cratesCache;
  }

  try {
    const response = await fetch('/crates.json');
    const crates: Crate[] = await response.json();
    cratesCache = crates;
    return crates;
  } catch (error) {
    console.error('Failed to load crates:', error);
    return [];
  }
}

export function getCrateById(crateId: number, crates: Crate[]): Crate | undefined {
  return crates.find(c => c.crateId === crateId);
}

export async function openCrate(crate: Crate, ownedBanners: number[], ownedTitles: string[], ownedPfps: number[] = []): Promise<CrateOpenResult> {
  const totalRate = crate.rewards.reduce((sum, reward) => sum + reward.dropRate, 0);
  const roll = Math.random() * totalRate;
  
  let currentRate = 0;
  let selectedReward: CrateReward | null = null;
  
  for (const reward of crate.rewards) {
    currentRate += reward.dropRate;
    if (roll <= currentRate) {
      selectedReward = reward;
      break;
    }
  }
  
  if (!selectedReward) {
    selectedReward = crate.rewards[crate.rewards.length - 1];
  }
  
  let item: Banner | Title | Pfp;
  let isDuplicate = false;
  
  if (selectedReward.type === 'banner') {
    const banners = await loadBanners();
    const banner = getBannerById(selectedReward.id as number, banners);
    if (!banner) {
      throw new Error('Banner not found');
    }
    isDuplicate = ownedBanners.includes(banner.bannerId);
    
    const newAttributes = assignRandomAttributes();
    const existingAttributes = banner.attributes || [];
    const combinedAttributes = [...new Set([...existingAttributes, ...newAttributes])];
    
    item = {
      ...banner,
      attributes: combinedAttributes
    };
  } else if (selectedReward.type === 'pfp') {
    const pfps = await loadPfps();
    const pfp = getPfpById(selectedReward.id as number, pfps);
    if (!pfp) {
      throw new Error('PFP not found');
    }
    isDuplicate = ownedPfps.includes(pfp.pfpId);
    
    const newAttributes = assignRandomAttributes();
    const existingAttributes = pfp.attributes || [];
    const combinedAttributes = [...new Set([...existingAttributes, ...newAttributes])];
    
    item = {
      ...pfp,
      attributes: combinedAttributes
    };
  } else {
    item = getTitleFromId(selectedReward.id as string);
    isDuplicate = ownedTitles.includes((item as Title).id);
  }
  
  const refundAmount = isDuplicate ? Math.floor(crate.price * 0.85) : 0;
  
  return {
    reward: selectedReward,
    item,
    isDuplicate,
    refundAmount
  };
}

export function getCrateImagePath(imageName: string): string {
  return `/crates/${imageName}`;
}

export async function getRewardPreview(reward: CrateReward): Promise<Banner | Title | Pfp> {
  if (reward.type === 'banner') {
    const banners = await loadBanners();
    const banner = getBannerById(reward.id as number, banners);
    if (!banner) {
      throw new Error('Banner not found');
    }
    return banner;
  } else if (reward.type === 'pfp') {
    const pfps = await loadPfps();
    const pfp = getPfpById(reward.id as number, pfps);
    if (!pfp) {
      throw new Error('PFP not found');
    }
    return pfp;
  } else {
    return getTitleFromId(reward.id as string);
  }
}
