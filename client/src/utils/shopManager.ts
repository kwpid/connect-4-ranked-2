import { Title, ShopItem, Banner } from '../types/game';
import { loadBanners, getShopBanners, generateShopBannerRotation } from './bannerManager';

const GREY_TITLES = [
  'Novice', 'Apprentice', 'Journeyman', 'Expert', 'Master',
  'Tactician', 'Strategist', 'Thinker', 'Genius', 'Prodigy',
  'Veteran', 'Elite', 'Champion', 'Legend', 'Mythic',
  'Divine', 'Immortal', 'Eternal', 'Supreme', 'Ultimate',
  'Ace', 'Star', 'Hero', 'Guardian', 'Defender',
  'Warrior', 'Knight', 'Paladin', 'Crusader', 'Conqueror'
];

export function shouldRotateShop(lastRotation: number): boolean {
  const now = new Date();
  const last = new Date(lastRotation);
  
  // Check if we've passed a 12-hour rotation point (12am or 12pm EST)
  const currentHour = now.getHours();
  const lastHour = last.getHours();
  
  const currentRotation = currentHour >= 12 ? 1 : 0; // 0 for midnight rotation, 1 for noon
  const lastRotationPoint = lastHour >= 12 ? 1 : 0;
  
  // Different day or different rotation point
  return now.getDate() !== last.getDate() || currentRotation !== lastRotationPoint;
}

export async function generateShopItems(seed: number): Promise<ShopItem[]> {
  // Use seed for consistent rotation
  const random = (n: number) => {
    seed = (seed * 9301 + 49297) % 233280;
    return (seed / 233280) * n;
  };
  
  const items: ShopItem[] = [];
  const usedTitles = new Set<string>();
  
  // Generate 3 random grey titles
  for (let i = 0; i < 3; i++) {
    let titleName: string;
    do {
      titleName = GREY_TITLES[Math.floor(random(GREY_TITLES.length))];
    } while (usedTitles.has(titleName));
    
    usedTitles.add(titleName);
    
    const price = Math.floor(random(400) + 100); // 100-500 coins
    
    items.push({
      id: `shop_title_${titleName.toLowerCase()}`,
      title: {
        id: `grey_${titleName.toLowerCase()}`,
        name: titleName,
        type: 'grey',
        color: '#9CA3AF',
        glow: 'none'
      },
      price
    });
  }
  
  // Load and add 3 banners (only shop banners, not ranked ones)
  const banners = await loadBanners();
  const shopBanners = generateShopBannerRotation(banners, seed, 3);
  
  shopBanners.forEach(banner => {
    // Only add if it has a valid price (ranked banners have null price)
    if (banner.price !== null && banner.price > 0) {
      items.push({
        id: `shop_banner_${banner.bannerId}`,
        banner,
        price: banner.price
      });
    }
  });
  
  return items;
}

export function getShopRotationSeed(): number {
  const now = new Date();
  // Create seed based on date and rotation (am/pm)
  const rotation = now.getHours() >= 12 ? 1 : 0;
  return now.getFullYear() * 100000 + (now.getMonth() + 1) * 10000 + now.getDate() * 10 + rotation;
}
