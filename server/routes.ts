import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import fs from "fs/promises";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const FEATURED_ITEMS_PATH = path.join(__dirname, "data", "featured-items.json");
const BANNERS_PATH = path.join(__dirname, "..", "client", "public", "banners.json");

interface SimpleFeaturedItem {
  itemId: string;
  duration: string;
  addedAt: number;
}

function parseDuration(duration: string): number {
  const match = duration.match(/^(\d+)([hdw])$/);
  if (!match) return 0;
  
  const value = parseInt(match[1]);
  const unit = match[2];
  
  switch (unit) {
    case 'h': return value * 60 * 60 * 1000;
    case 'd': return value * 24 * 60 * 60 * 1000;
    case 'w': return value * 7 * 24 * 60 * 60 * 1000;
    default: return 0;
  }
}

function getTitleFromId(titleId: string): any {
  if (titleId.startsWith('grey_')) {
    const name = titleId.replace('grey_', '').replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
    return {
      id: titleId,
      name,
      type: 'grey',
      color: '#9CA3AF',
      glow: 'none'
    };
  }
  
  return {
    id: titleId,
    name: titleId,
    type: 'grey',
    color: '#9CA3AF',
    glow: 'none'
  };
}

async function loadBanners(): Promise<any[]> {
  try {
    const data = await fs.readFile(BANNERS_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
}

async function expandFeaturedItem(item: SimpleFeaturedItem, banners: any[]): Promise<any | null> {
  const durationMs = parseDuration(item.duration);
  const expiresAt = item.addedAt + durationMs;
  const now = Date.now();
  
  if (expiresAt < now) {
    return null;
  }
  
  const itemId = item.itemId.toLowerCase();
  
  if (itemId.startsWith('banner_') || !isNaN(Number(itemId))) {
    const bannerId = itemId.startsWith('banner_') 
      ? parseInt(itemId.replace('banner_', ''))
      : parseInt(itemId);
    
    const banner = banners.find(b => b.bannerId === bannerId);
    if (!banner) return null;
    
    return {
      id: `featured_banner_${bannerId}_${item.addedAt}`,
      banner: banner,
      price: banner.price || 500,
      expiresAt,
      duration: item.duration
    };
  } else {
    const title = getTitleFromId(itemId);
    
    return {
      id: `featured_title_${itemId}_${item.addedAt}`,
      title: title,
      price: title.price || 500,
      expiresAt,
      duration: item.duration
    };
  }
}

async function readFeaturedItems() {
  try {
    const data = await fs.readFile(FEATURED_ITEMS_PATH, "utf-8");
    const simpleItems: SimpleFeaturedItem[] = JSON.parse(data);
    const banners = await loadBanners();
    
    const expandedItems = await Promise.all(
      simpleItems.map(item => expandFeaturedItem(item, banners))
    );
    
    const activeItems = expandedItems.filter(item => item !== null);
    
    const stillActiveSimple = simpleItems.filter((item) => {
      const durationMs = parseDuration(item.duration);
      const expiresAt = item.addedAt + durationMs;
      return expiresAt > Date.now();
    });
    
    if (stillActiveSimple.length !== simpleItems.length) {
      await writeFeaturedItems(stillActiveSimple);
    }
    
    return activeItems;
  } catch (error) {
    return [];
  }
}

async function writeFeaturedItems(items: SimpleFeaturedItem[]) {
  await fs.writeFile(FEATURED_ITEMS_PATH, JSON.stringify(items, null, 2));
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/featured-items", async (req, res) => {
    try {
      const items = await readFeaturedItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: "Failed to read featured items" });
    }
  });

  app.post("/api/featured-items", async (req, res) => {
    try {
      const { itemId, duration } = req.body;
      
      const data = await fs.readFile(FEATURED_ITEMS_PATH, "utf-8");
      const items: SimpleFeaturedItem[] = JSON.parse(data);
      
      const newSimpleItem: SimpleFeaturedItem = {
        itemId,
        duration,
        addedAt: Date.now()
      };
      
      items.push(newSimpleItem);
      await writeFeaturedItems(items);
      
      const banners = await loadBanners();
      const expanded = await expandFeaturedItem(newSimpleItem, banners);
      
      res.json(expanded);
    } catch (error) {
      res.status(500).json({ error: "Failed to add featured item" });
    }
  });

  app.delete("/api/featured-items/:itemId", async (req, res) => {
    try {
      const { itemId } = req.params;
      
      const data = await fs.readFile(FEATURED_ITEMS_PATH, "utf-8");
      const items: SimpleFeaturedItem[] = JSON.parse(data);
      
      const filtered = items.filter((item: SimpleFeaturedItem) => item.itemId !== itemId);
      await writeFeaturedItems(filtered);
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to remove featured item" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
