import { Title, ShopItem, Banner, FeaturedItem } from '../types/game';
import { loadBanners, getShopBanners, generateShopBannerRotation } from './bannerManager';

const FEATURED_ITEMS_KEY = 'connect_ranked_featured_items';

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

// Featured Items Management
export async function getFeaturedItems(): Promise<FeaturedItem[]> {
  try {
    const response = await fetch('/api/featured-items');
    if (!response.ok) {
      console.error('Failed to fetch featured items');
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching featured items:', error);
    return [];
  }
}

export async function addFeaturedItem(item: Omit<FeaturedItem, 'id' | 'expiresAt'>, durationInMs: number): Promise<FeaturedItem> {
  const newItem: FeaturedItem = {
    ...item,
    id: `featured_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    expiresAt: Date.now() + durationInMs
  };
  
  try {
    const response = await fetch('/api/featured-items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(newItem),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add featured item');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error adding featured item:', error);
    throw error;
  }
}

export async function removeFeaturedItem(id: string): Promise<void> {
  try {
    const response = await fetch(`/api/featured-items/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to remove featured item');
    }
  } catch (error) {
    console.error('Error removing featured item:', error);
    throw error;
  }
}

export function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)([hdw])$/);
  if (!match) return 0;
  
  const value = parseInt(match[1]);
  const unit = match[2];
  
  switch (unit) {
    case 'h': return value * 60 * 60 * 1000; // hours
    case 'd': return value * 24 * 60 * 60 * 1000; // days
    case 'w': return value * 7 * 24 * 60 * 60 * 1000; // weeks
    default: return 0;
  }
}

// Console helper for adding featured items
if (typeof window !== 'undefined') {
  (window as any).addFeaturedShopItem = async (type: 'title' | 'banner', name: string, price: number, duration: string) => {
    const durationMs = parseDuration(duration);
    if (durationMs === 0) {
      console.error('Invalid duration format. Use format like: 24h, 7d, 2w');
      return;
    }
    
    let item: Omit<FeaturedItem, 'id' | 'expiresAt'>;
    
    if (type === 'title') {
      item = {
        title: {
          id: `featured_title_${name.toLowerCase()}`,
          name: name,
          type: 'grey',
          color: '#FFD700', // Gold color for featured
          glow: 'gold'
        },
        price,
        duration
      };
    } else {
      item = {
        banner: {
          bannerId: 999, // Special ID for featured banners
          bannerName: name,
          imageName: 'default', // You'll need to set this properly
          price,
          ranked: false,
          season: null,
          rank: null
        },
        price,
        duration
      };
    }
    
    const added = await addFeaturedItem(item, durationMs);
    console.log(`Added featured ${type}: "${name}" for ${duration} (expires at ${new Date(added.expiresAt).toLocaleString()})`);
  };
}
