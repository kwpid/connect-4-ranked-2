import React, { useState, useEffect } from 'react';
import { PlayerData, Banner } from '../../types/game';
import { TitleDisplay } from '../common/TitleDisplay';
import { getTitleFromId } from '../../utils/titleManager';
import { loadBanners, getBannerById, getBannerImagePath } from '../../utils/bannerManager';

interface InventoryScreenProps {
  playerData: PlayerData;
  onEquipTitle: (titleId: string | null) => void;
  onEquipBanner: (bannerId: number | null) => void;
  onBack: () => void;
}

type InventoryTab = 'banners' | 'chips' | 'titles';

export function InventoryScreen({ playerData, onEquipTitle, onEquipBanner, onBack }: InventoryScreenProps) {
  const [activeTab, setActiveTab] = useState<InventoryTab>('banners');
  const [selectedTitle, setSelectedTitle] = useState<string | null>(playerData.equippedTitle);
  const [selectedBanner, setSelectedBanner] = useState<number | null>(playerData.equippedBanner || 1);
  const [banners, setBanners] = useState<Banner[]>([]);

  useEffect(() => {
    loadBanners().then(setBanners);
  }, []);

  // Get owned titles and sort them (ranked > tournament > leaderboard > grey)
  const ownedTitles = playerData.ownedTitles
    .map(titleId => getTitleFromId(titleId))
    .sort((a, b) => {
      const priorityMap: Record<string, number> = {
        'season': 1,
        'tournament': 2,
        'leaderboard': 3,
        'grey': 4
      };
      const priorityA = priorityMap[a.type] || 5;
      const priorityB = priorityMap[b.type] || 5;
      
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }
      
      if (a.season && b.season) {
        return b.season - a.season;
      }
      return a.name.localeCompare(b.name);
    });

  // Sort banners with default banner (ID 1) first
  const ownedBanners = (playerData.ownedBanners || [])
    .map(bannerId => getBannerById(bannerId, banners))
    .filter((b): b is Banner => b !== undefined)
    .sort((a, b) => {
      if (a.bannerId === 1) return -1;
      if (b.bannerId === 1) return 1;
      return a.bannerId - b.bannerId;
    });

  const handleEquipTitle = () => {
    onEquipTitle(selectedTitle);
  };

  const handleEquipBanner = () => {
    onEquipBanner(selectedBanner);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto h-screen flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            ← Back
          </button>
          <h2 className="text-3xl font-bold">Inventory</h2>
          <div className="w-20"></div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-shrink-0">
          <button
            onClick={() => setActiveTab('banners')}
            className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'banners'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Banners
          </button>
          <button
            onClick={() => setActiveTab('chips')}
            className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'chips'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Chips
          </button>
          <button
            onClick={() => setActiveTab('titles')}
            className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'titles'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700'
            }`}
          >
            Titles
          </button>
        </div>

        {/* Banners Tab */}
        {activeTab === 'banners' && (
          <>
            {/* Currently Equipped */}
            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 mb-6 border border-gray-700 flex-shrink-0">
              <p className="text-gray-400 text-sm mb-3">Currently Equipped Banner</p>
              {playerData.equippedBanner && getBannerById(playerData.equippedBanner, banners) ? (
                <div className="flex items-center justify-center bg-gray-900/50 rounded-lg p-4">
                  <img
                    src={getBannerImagePath(getBannerById(playerData.equippedBanner, banners)!.imageName)}
                    alt={getBannerById(playerData.equippedBanner, banners)!.bannerName}
                    className="h-[50px]"
                    style={{ imageRendering: 'crisp-edges' }}
                  />
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No banner equipped</p>
              )}
            </div>

            {/* Banner List */}
            <div className="flex-1 overflow-y-auto mb-6 pr-2">
              <div className="space-y-3">
                {ownedBanners.map(banner => (
                  <div
                    key={banner.bannerId}
                    onClick={() => setSelectedBanner(banner.bannerId)}
                    className={`p-4 rounded-lg cursor-pointer transition-all ${
                      selectedBanner === banner.bannerId
                        ? 'bg-blue-600 border-2 border-blue-400'
                        : 'bg-gray-800/50 border-2 border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-semibold">{banner.bannerName}</p>
                      {banner.ranked && banner.season && (
                        <span className="text-xs bg-yellow-600/20 text-yellow-400 px-2 py-1 rounded">
                          S{banner.season} {banner.rank}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-center bg-gray-900/50 rounded-lg p-3">
                      <img
                        src={getBannerImagePath(banner.imageName)}
                        alt={banner.bannerName}
                        className="h-[50px]"
                        style={{ imageRendering: 'crisp-edges' }}
                      />
                    </div>
                  </div>
                ))}

                {ownedBanners.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-400 text-lg">No banners owned yet</p>
                    <p className="text-gray-500 mt-2">Purchase banners from the shop or earn them through ranked seasons</p>
                  </div>
                )}
              </div>
            </div>

            {/* Equip Button */}
            <button
              onClick={handleEquipBanner}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors flex-shrink-0"
            >
              Equip Selected
            </button>
          </>
        )}

        {/* Chips Tab */}
        {activeTab === 'chips' && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-gray-400 text-2xl mb-4">🎮</p>
              <p className="text-gray-400 text-lg">Chips Coming Soon</p>
              <p className="text-gray-500 mt-2">Custom chips will be available in a future update</p>
            </div>
          </div>
        )}

        {/* Titles Tab */}
        {activeTab === 'titles' && (
          <>
            {/* Currently Equipped */}
            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 mb-6 border border-gray-700 flex-shrink-0">
              <p className="text-gray-400 text-sm mb-2">Currently Equipped Title</p>
              <TitleDisplay titleId={playerData.equippedTitle} />
            </div>

            {/* Title List */}
            <div className="flex-1 overflow-y-auto mb-6 pr-2">
              <div className="space-y-3">
                {/* No Title Option */}
                <div
                  onClick={() => setSelectedTitle(null)}
                  className={`p-4 rounded-lg cursor-pointer transition-all ${
                    selectedTitle === null
                      ? 'bg-blue-600 border-2 border-blue-400'
                      : 'bg-gray-800/50 border-2 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <p className="text-gray-400">No Title Equipped</p>
                </div>

                {ownedTitles.map(title => (
                  <div
                    key={title.id}
                    onClick={() => setSelectedTitle(title.id)}
                    className={`p-4 rounded-lg cursor-pointer transition-all ${
                      selectedTitle === title.id
                        ? 'bg-blue-600 border-2 border-blue-400'
                        : 'bg-gray-800/50 border-2 border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <TitleDisplay title={title} />
                  </div>
                ))}

                {ownedTitles.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-gray-400 text-lg">No titles owned yet</p>
                    <p className="text-gray-500 mt-2">Purchase titles from the shop or earn them through seasons</p>
                  </div>
                )}
              </div>
            </div>

            {/* Equip Button */}
            <button
              onClick={handleEquipTitle}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors flex-shrink-0"
            >
              Equip Selected
            </button>
          </>
        )}
      </div>
    </div>
  );
}
