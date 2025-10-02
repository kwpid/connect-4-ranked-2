import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import fs from "fs/promises";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const FEATURED_ITEMS_PATH = path.join(__dirname, "data", "featured-items.json");

async function readFeaturedItems() {
  try {
    const data = await fs.readFile(FEATURED_ITEMS_PATH, "utf-8");
    const items = JSON.parse(data);
    const now = Date.now();
    const activeItems = items.filter((item: any) => item.expiresAt > now);
    
    if (activeItems.length !== items.length) {
      await writeFeaturedItems(activeItems);
    }
    
    return activeItems;
  } catch (error) {
    return [];
  }
}

async function writeFeaturedItems(items: any[]) {
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
      const newItem = req.body;
      const items = await readFeaturedItems();
      items.push(newItem);
      await writeFeaturedItems(items);
      res.json(newItem);
    } catch (error) {
      res.status(500).json({ error: "Failed to add featured item" });
    }
  });

  app.delete("/api/featured-items/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const items = await readFeaturedItems();
      const filtered = items.filter((item: any) => item.id !== id);
      await writeFeaturedItems(filtered);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to remove featured item" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
