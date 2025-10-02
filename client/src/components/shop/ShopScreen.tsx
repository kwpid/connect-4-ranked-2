import React, { useState, useEffect } from 'react';
import { PlayerData, ShopItem } from '../../types/game';
import { generateShopItems, shouldRotateShop, getShopRotationSeed } from '../../utils/shopManager';
import { TitleDisplay } from '../common/TitleDisplay';
import { getBannerImagePath } from '../../utils/bannerManager';

interface ShopScreenProps {
  playerData: PlayerData;
  onPurchase: (titleId: string, price: number) => void;
  onPurchaseBanner: (bannerId: number, price: number) => void;
  onBack: () => void;
  lastRotation: number;
}

export function ShopScreen({ playerData, onPurchase, onPurchaseBanner, onBack, lastRotation }: ShopScreenProps) {
  const [items, setItems] = useState<ShopItem[]>([]);
  const [timeUntilRotation, setTimeUntilRotation] = useState('');
  
  useEffect(() => {
    const loadItems = async () => {
      const shopItems = await generateShopItems(getShopRotationSeed());
      setItems(shopItems);
    };
    loadItems();
  }, []);
  
  useEffect(() => {
    const updateRotation = async () => {
      if (shouldRotateShop(lastRotation)) {
        const shopItems = await generateShopItems(getShopRotationSeed());
        setItems(shopItems);
      }
      
      // Calculate time until next rotation
      const now = new Date();
      const currentHour = now.getHours();
      let nextRotationHour = currentHour >= 12 ? 24 : 12; // Next 12am or 12pm
      
      const next = new Date(now);
      next.setHours(nextRotationHour, 0, 0, 0);
      
      const diff = next.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeUntilRotation(`${hours}h ${minutes}m`);
    };
    
    updateRotation();
    const interval = setInterval(updateRotation, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [lastRotation]);
  
  const canAfford = (price: number) => playerData.coins >= price;
  const titleAlreadyOwned = (titleId: string) => playerData.ownedTitles.includes(titleId);
  const bannerAlreadyOwned = (bannerId: number) => playerData.ownedBanners.includes(bannerId);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            ← Back
          </button>
          <h2 className="text-3xl font-bold">Shop</h2>
          <div className="text-right">
            <p className="text-yellow-400 font-semibold">💰 {playerData.coins}</p>
          </div>
        </div>
        
        {/* Rotation Timer */}
        <div className="bg-blue-600/20 backdrop-blur rounded-xl p-4 mb-6 border border-blue-600/50">
          <p className="text-center text-blue-400">
            🔄 Next rotation in: {timeUntilRotation}
          </p>
        </div>
        
        {/* Shop Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map(item => {
            const isBanner = !!item.banner;
            const owned = isBanner 
              ? bannerAlreadyOwned(item.banner!.bannerId)
              : titleAlreadyOwned(item.title!.id);
            const affordable = canAfford(item.price);
            
            return (
              <div
                key={item.id}
                className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700"
              >
                {isBanner ? (
                  <div className="mb-4">
                    <p className="text-sm text-gray-400 mb-2">{item.banner!.bannerName}</p>
                    <div className="flex items-center justify-center bg-gray-900/50 rounded-lg p-3">
                      <img
                        src={getBannerImagePath(item.banner!.imageName)}
                        alt={item.banner!.bannerName}
                        className="h-[50px]"
                        style={{ imageRendering: 'crisp-edges' }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mb-4">
                    <TitleDisplay title={item.title!} />
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <div className="text-yellow-400 font-bold text-xl">
                    💰 {item.price}
                  </div>
                  
                  {owned ? (
                    <button
                      disabled
                      className="px-4 py-2 bg-green-600 rounded-lg cursor-not-allowed"
                    >
                      ✓ Owned
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (isBanner) {
                          onPurchaseBanner(item.banner!.bannerId, item.price);
                        } else {
                          onPurchase(item.title!.id, item.price);
                        }
                      }}
                      disabled={!affordable}
                      className={`px-4 py-2 rounded-lg transition-colors ${
                        affordable
                          ? 'bg-blue-600 hover:bg-blue-700'
                          : 'bg-gray-600 cursor-not-allowed'
                      }`}
                    >
                      {affordable ? 'Purchase' : 'Not enough coins'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
