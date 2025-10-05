import React, { useState, useEffect } from 'react';
import { PlayerData, ShopItem, FeaturedItem, Crate, Banner, Title, CrateOpenResult } from '../../types/game';
import { generateShopItems, shouldRotateShop, getShopRotationSeed, getFeaturedItems } from '../../utils/shopManager';
import { loadCrates, openCrate, getCrateImagePath, getRewardPreview } from '../../utils/crateManager';
import { TitleDisplay } from '../common/TitleDisplay';
import { getBannerImagePath } from '../../utils/bannerManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ItemCard } from '../ui/item-card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';

interface ShopScreenProps {
  playerData: PlayerData;
  onPurchase: (titleId: string, price: number) => void;
  onPurchaseBanner: (bannerId: number, price: number) => void;
  onBack: () => void;
  lastRotation: number;
}

export function ShopScreen({ playerData, onPurchase, onPurchaseBanner, onBack, lastRotation }: ShopScreenProps) {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [featuredItems, setFeaturedItems] = useState<FeaturedItem[]>([]);
  const [crates, setCrates] = useState<Crate[]>([]);
  const [timeUntilRotation, setTimeUntilRotation] = useState('');
  const [selectedCrate, setSelectedCrate] = useState<Crate | null>(null);
  const [cratePreviewOpen, setCratePreviewOpen] = useState(false);
  const [crateOpeningResult, setCrateOpeningResult] = useState<CrateOpenResult | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  
  useEffect(() => {
    const loadItems = async () => {
      const shopItems = await generateShopItems(getShopRotationSeed());
      setItems(shopItems);
      
      const featured = await getFeaturedItems();
      setFeaturedItems(featured);
      
      const cratesData = await loadCrates();
      setCrates(cratesData);
    };
    loadItems();
  }, []);
  
  useEffect(() => {
    const updateRotation = async () => {
      if (shouldRotateShop(lastRotation)) {
        const shopItems = await generateShopItems(getShopRotationSeed());
        setItems(shopItems);
      }
      
      const featured = await getFeaturedItems();
      setFeaturedItems(featured);
      
      const now = new Date();
      const currentHour = now.getHours();
      let nextRotationHour = currentHour >= 12 ? 24 : 12;
      
      const next = new Date(now);
      next.setHours(nextRotationHour, 0, 0, 0);
      
      const diff = next.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeUntilRotation(`${hours}h ${minutes}m`);
    };
    
    updateRotation();
    const interval = setInterval(updateRotation, 60000);
    
    return () => clearInterval(interval);
  }, [lastRotation]);
  
  const canAfford = (price: number) => playerData.coins >= price;
  const titleAlreadyOwned = (titleId: string) => playerData.ownedTitles.includes(titleId);
  const bannerAlreadyOwned = (bannerId: number) => playerData.ownedBanners.includes(bannerId);
  
  const handleCrateClick = (crate: Crate) => {
    setSelectedCrate(crate);
    setCratePreviewOpen(true);
  };
  
  const handlePurchaseCrate = async () => {
    if (!selectedCrate || !canAfford(selectedCrate.price)) return;
    
    setIsOpening(true);
    setCratePreviewOpen(false);
    
    // Simulate opening animation delay
    setTimeout(async () => {
      const result = await openCrate(selectedCrate);
      setCrateOpeningResult(result);
      
      // Always deduct coins and add item (purchase functions handle duplicates)
      if (result.reward.type === 'banner') {
        const banner = result.item as Banner;
        onPurchaseBanner(banner.bannerId, selectedCrate.price);
      } else {
        const title = result.item as Title;
        onPurchase(title.id, selectedCrate.price);
      }
      
      setIsOpening(false);
    }, 2000);
  };
  
  const renderItem = (item: ShopItem | FeaturedItem, isFeatured = false) => {
    const isBanner = !!item.banner;
    const owned = isBanner 
      ? bannerAlreadyOwned(item.banner!.bannerId)
      : titleAlreadyOwned(item.title!.id);
    const affordable = canAfford(item.price);
    
    const timeRemaining = 'expiresAt' in item ? item.expiresAt - Date.now() : 0;
    const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutesRemaining = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));
    
    const itemRarity = isBanner && item.banner?.rarity ? item.banner.rarity : undefined;
    const itemAttributes = isBanner && item.banner?.attributes ? item.banner.attributes : undefined;
    
    return (
      <ItemCard
        key={item.id}
        rarity={itemRarity}
        attributes={itemAttributes}
        className={`p-6 ${isFeatured ? 'border-yellow-500 bg-gradient-to-br from-yellow-900/30 to-orange-900/30' : ''}`}
      >
        {isFeatured && (
          <div className="absolute top-2 left-2 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded">
            FEATURED
          </div>
        )}
        
        <div className="mb-4 mt-6">
          {isBanner ? (
            <>
              <p className="text-sm text-gray-300 mb-2">{item.banner!.bannerName}</p>
              <div className="flex items-center justify-center bg-gray-900/50 rounded-lg p-3">
                <img
                  src={getBannerImagePath(item.banner!.imageName)}
                  alt={item.banner!.bannerName}
                  className="h-[50px]"
                  style={{ imageRendering: item.banner!.fileType === 'gif' ? 'auto' : 'crisp-edges' }}
                />
              </div>
            </>
          ) : (
            <TitleDisplay title={item.title!} />
          )}
        </div>
        
        {isFeatured && (
          <div className="text-xs text-yellow-400 mb-3">
            ⏱️ {hoursRemaining}h {minutesRemaining}m
          </div>
        )}
        
        <div className="flex justify-between items-center">
          <div className="text-yellow-400 font-bold text-lg">
            💰 {item.price}
          </div>
          
          {owned ? (
            <Button disabled variant="secondary" size="sm">
              ✓ Owned
            </Button>
          ) : (
            <Button
              onClick={() => {
                if (isBanner) {
                  onPurchaseBanner(item.banner!.bannerId, item.price);
                } else {
                  onPurchase(item.title!.id, item.price);
                }
              }}
              disabled={!affordable}
              variant={affordable ? "default" : "secondary"}
              size="sm"
            >
              {affordable ? 'Purchase' : 'No coins'}
            </Button>
          )}
        </div>
      </ItemCard>
    );
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <Button onClick={onBack} variant="outline">
            ← Back
          </Button>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            Shop
          </h2>
          <div className="text-right">
            <p className="text-yellow-400 font-semibold text-lg">💰 {playerData.coins}</p>
          </div>
        </div>
        
        {/* Tabs */}
        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="daily">Daily Shop</TabsTrigger>
            <TabsTrigger value="featured">Featured</TabsTrigger>
            <TabsTrigger value="crates">Crates</TabsTrigger>
          </TabsList>
          
          {/* Daily Shop Tab */}
          <TabsContent value="daily">
            <div className="bg-blue-600/20 backdrop-blur rounded-xl p-4 mb-6 border border-blue-600/50">
              <p className="text-center text-blue-400">
                🔄 Next rotation: {timeUntilRotation}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map(item => renderItem(item))}
            </div>
          </TabsContent>
          
          {/* Featured Items Tab */}
          <TabsContent value="featured">
            {featuredItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {featuredItems.map(item => renderItem(item, true))}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-12">
                <p>No featured items available right now</p>
              </div>
            )}
          </TabsContent>
          
          {/* Crates Tab */}
          <TabsContent value="crates">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {crates.map(crate => (
                <div
                  key={crate.crateId}
                  onClick={() => handleCrateClick(crate)}
                  className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border-2 border-purple-500/50 cursor-pointer hover:scale-105 transition-transform"
                >
                  <div className="flex items-center justify-center mb-4">
                    <div className="w-32 h-32 bg-purple-900/30 rounded-lg flex items-center justify-center">
                      <span className="text-6xl">📦</span>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-center mb-2">{crate.crateName}</h3>
                  <p className="text-sm text-gray-400 text-center mb-4">{crate.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-yellow-400 font-bold text-lg">💰 {crate.price}</span>
                    <Button 
                      variant="default"
                      size="sm"
                      disabled={!canAfford(crate.price)}
                    >
                      {canAfford(crate.price) ? 'Preview' : 'No coins'}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Crate Preview Dialog */}
        <Dialog open={cratePreviewOpen} onOpenChange={setCratePreviewOpen}>
          <DialogContent className="bg-gray-900 text-white border-purple-500/50">
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedCrate?.crateName}</DialogTitle>
              <DialogDescription className="text-gray-400">
                {selectedCrate?.description}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <h4 className="font-semibold text-lg">Possible Rewards:</h4>
              <div className="grid grid-cols-2 gap-3 max-h-60 overflow-y-auto">
                {selectedCrate?.rewards.map((reward, idx) => (
                  <CrateRewardPreview key={idx} reward={reward} />
                ))}
              </div>
              
              <div className="flex justify-between items-center pt-4 border-t border-gray-700">
                <span className="text-yellow-400 font-bold text-xl">
                  💰 {selectedCrate?.price}
                </span>
                <Button
                  onClick={handlePurchaseCrate}
                  disabled={!selectedCrate || !canAfford(selectedCrate.price)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Open Crate
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Crate Opening Animation */}
        <Dialog open={isOpening || !!crateOpeningResult} onOpenChange={() => setCrateOpeningResult(null)}>
          <DialogContent className="bg-gray-900 text-white border-purple-500/50">
            {isOpening ? (
              <div className="text-center py-12">
                <div className="animate-spin text-6xl mb-4">📦</div>
                <p className="text-xl">Opening crate...</p>
              </div>
            ) : crateOpeningResult && (
              <div className="text-center py-8">
                <h3 className="text-2xl font-bold mb-6 text-yellow-400">You got!</h3>
                <div className="mb-6">
                  {crateOpeningResult.reward.type === 'banner' ? (
                    <div className="flex flex-col items-center">
                      <img
                        src={getBannerImagePath((crateOpeningResult.item as Banner).imageName)}
                        alt={(crateOpeningResult.item as Banner).bannerName}
                        className="h-[60px] mb-2"
                      />
                      <p className="text-lg">{(crateOpeningResult.item as Banner).bannerName}</p>
                    </div>
                  ) : (
                    <TitleDisplay title={crateOpeningResult.item as Title} />
                  )}
                </div>
                <Button onClick={() => setCrateOpeningResult(null)}>
                  Claim
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function CrateRewardPreview({ reward }: { reward: any }) {
  const [item, setItem] = useState<Banner | Title | null>(null);
  
  useEffect(() => {
    getRewardPreview(reward).then(setItem);
  }, [reward]);
  
  if (!item) return null;
  
  const isBanner = 'bannerId' in item;
  
  return (
    <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
      <div className="mb-2">
        {isBanner ? (
          <div className="flex items-center justify-center h-12">
            <img
              src={getBannerImagePath((item as Banner).imageName)}
              alt={(item as Banner).bannerName}
              className="h-10"
            />
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm" style={{ color: (item as Title).color }}>
              {(item as Title).name}
            </p>
          </div>
        )}
      </div>
      <p className="text-xs text-gray-400 text-center">
        {reward.dropRate}% chance
      </p>
    </div>
  );
}
