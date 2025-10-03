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
    // Read the JSON file directly
    const response = await fetch('/data/featured-items.json');
    if (!response.ok) {
      console.error('Failed to fetch featured items');
      return [];
    }
    
    interface SimpleFeaturedItem {
      itemId: string;
      duration: string;
      addedAt: number;
    }
    
    const simpleItems: SimpleFeaturedItem[] = await response.json();
    const banners = await loadBanners();
    const now = Date.now();
    
    // Expand and filter items
    const expandedItems: FeaturedItem[] = [];
    
    for (const item of simpleItems) {
      const durationMs = parseDuration(item.duration);
      const expiresAt = item.addedAt + durationMs;
      
      // Skip expired items
      if (expiresAt < now) continue;
      
      const itemId = item.itemId.toLowerCase();
      
      // Check if it's a banner
      if (itemId.startsWith('banner_') || !isNaN(Number(itemId))) {
        const bannerId = itemId.startsWith('banner_') 
          ? parseInt(itemId.replace('banner_', ''))
          : parseInt(itemId);
        
        const banner = banners.find(b => b.bannerId === bannerId);
        if (banner) {
          expandedItems.push({
            id: `featured_banner_${bannerId}_${item.addedAt}`,
            banner: banner,
            price: banner.price || 500,
            expiresAt,
            duration: item.duration
          });
        }
      } else {
        // It's a title
        const titleName = itemId.replace('grey_', '').replace(/_/g, ' ')
          .replace(/\b\w/g, c => c.toUpperCase());
        
        expandedItems.push({
          id: `featured_title_${itemId}_${item.addedAt}`,
          title: {
            id: itemId,
            name: titleName,
            type: 'grey',
            color: '#9CA3AF',
            glow: 'none'
          },
          price: 500,
          expiresAt,
          duration: item.duration
        });
      }
    }
    
    return expandedItems;
  } catch (error) {
    console.error('Error fetching featured items:', error);
    return [];
  }
}

export async function addFeaturedItem(itemId: string, duration: string): Promise<FeaturedItem> {
  try {
    const response = await fetch('/api/featured-items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ itemId, duration }),
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
  (window as any).addFeaturedShopItem = async (itemId: string, duration: string) => {
    const durationMs = parseDuration(duration);
    if (durationMs === 0) {
      console.error('Invalid duration format. Use format like: 24h, 7d, 2w');
      return;
    }
    
    try {
      const added = await addFeaturedItem(itemId, duration);
      console.log(`Added featured item: "${itemId}" for ${duration} (expires at ${new Date(added.expiresAt).toLocaleString()})`);
      return added;
    } catch (error) {
      console.error('Failed to add featured item:', error);
    }
  };
}
