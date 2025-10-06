import React, { useState, useEffect, useMemo } from 'react';
import { PlayerData, Banner, Pfp, ItemRarity } from '../../types/game';
import { TitleDisplay } from '../common/TitleDisplay';
import { getTitleFromId } from '../../utils/titleManager';
import { loadBanners, getBannerById, getBannerImagePath } from '../../utils/bannerManager';
import { loadPfps, getPfpById, getPfpImagePath } from '../../utils/pfpManager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { ItemCard } from '../ui/item-card';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface InventoryScreenProps {
  playerData: PlayerData;
  onEquipTitle: (titleId: string | null) => void;
  onEquipBanner: (bannerId: number | null) => void;
  onEquipPfp: (pfpId: number | null) => void;
  onBack: () => void;
}

const rarityOrder: Record<ItemRarity, number> = {
  'legacy': 1,
  'blackmarket': 2,
  'exotic': 3,
  'deluxe': 4,
  'special': 5,
  'regular': 6,
  'common': 7,
};

export function InventoryScreen({ playerData, onEquipTitle, onEquipBanner, onEquipPfp, onBack }: InventoryScreenProps) {
  const [selectedTitle, setSelectedTitle] = useState<string | null>(playerData.equippedTitle);
  const [selectedBanner, setSelectedBanner] = useState<number | null>(playerData.equippedBanner || 1);
  const [selectedPfp, setSelectedPfp] = useState<number | null>(playerData.equippedPfp);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [pfps, setPfps] = useState<Pfp[]>([]);
  
  const [bannerSearch, setBannerSearch] = useState('');
  const [bannerRarityFilter, setBannerRarityFilter] = useState<string>('all');
  const [bannerSortBy, setBannerSortBy] = useState<'alphabetical' | 'rarity'>('alphabetical');
  
  const [pfpSearch, setPfpSearch] = useState('');
  const [pfpRarityFilter, setPfpRarityFilter] = useState<string>('all');
  const [pfpSortBy, setPfpSortBy] = useState<'alphabetical' | 'rarity'>('alphabetical');
  
  const [titleSearch, setTitleSearch] = useState('');
  const [titleTypeFilter, setTitleTypeFilter] = useState<string>('all');

  useEffect(() => {
    loadBanners().then(setBanners);
    loadPfps().then(setPfps);
  }, []);

  useEffect(() => {
    setSelectedTitle(playerData.equippedTitle);
  }, [playerData.equippedTitle]);

  useEffect(() => {
    setSelectedBanner(playerData.equippedBanner || 1);
  }, [playerData.equippedBanner]);

  useEffect(() => {
    setSelectedPfp(playerData.equippedPfp);
  }, [playerData.equippedPfp]);

  const ownedTitles = useMemo(() => {
    let titles = playerData.ownedTitles.map(titleId => getTitleFromId(titleId));
    
    if (titleSearch) {
      titles = titles.filter(t => 
        t.name.toLowerCase().includes(titleSearch.toLowerCase())
      );
    }
    
    if (titleTypeFilter !== 'all') {
      titles = titles.filter(t => t.type === titleTypeFilter);
    }
    
    titles.sort((a, b) => {
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
    
    return titles;
  }, [playerData.ownedTitles, titleSearch, titleTypeFilter]);

  const ownedBanners = useMemo(() => {
    let filteredBanners = (playerData.ownedBanners || [])
      .map(bannerId => getBannerById(bannerId, banners))
      .filter((b): b is Banner => b !== undefined);
    
    if (bannerSearch) {
      filteredBanners = filteredBanners.filter(b => 
        b.bannerName.toLowerCase().includes(bannerSearch.toLowerCase())
      );
    }
    
    if (bannerRarityFilter !== 'all') {
      filteredBanners = filteredBanners.filter(b => 
        b.rarity === bannerRarityFilter || (!b.rarity && bannerRarityFilter === 'common')
      );
    }
    
    filteredBanners.sort((a, b) => {
      if (a.bannerId === 1) return -1;
      if (b.bannerId === 1) return 1;
      
      if (bannerSortBy === 'alphabetical') {
        return a.bannerName.localeCompare(b.bannerName);
      } else {
        const rarityA = rarityOrder[a.rarity || 'common'];
        const rarityB = rarityOrder[b.rarity || 'common'];
        return rarityA - rarityB;
      }
    });
    
    return filteredBanners;
  }, [playerData.ownedBanners, banners, bannerSearch, bannerRarityFilter, bannerSortBy]);

  const ownedPfps = useMemo(() => {
    let filteredPfps = (playerData.ownedPfps || [])
      .map(pfpId => getPfpById(pfpId, pfps))
      .filter((p): p is Pfp => p !== undefined);
    
    if (pfpSearch) {
      filteredPfps = filteredPfps.filter(p => 
        p.pfpName.toLowerCase().includes(pfpSearch.toLowerCase())
      );
    }
    
    if (pfpRarityFilter !== 'all') {
      filteredPfps = filteredPfps.filter(p => 
        p.rarity === pfpRarityFilter || (!p.rarity && pfpRarityFilter === 'common')
      );
    }
    
    filteredPfps.sort((a, b) => {
      if (pfpSortBy === 'alphabetical') {
        return a.pfpName.localeCompare(b.pfpName);
      } else {
        const rarityA = rarityOrder[a.rarity || 'common'];
        const rarityB = rarityOrder[b.rarity || 'common'];
        return rarityA - rarityB;
      }
    });
    
    return filteredPfps;
  }, [playerData.ownedPfps, pfps, pfpSearch, pfpRarityFilter, pfpSortBy]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <Button onClick={onBack} variant="outline">
            ← Back
          </Button>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            Inventory
          </h2>
          <div className="w-20"></div>
        </div>

        <Tabs defaultValue="banners" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="banners">Banners</TabsTrigger>
            <TabsTrigger value="pfps">PFPs</TabsTrigger>
            <TabsTrigger value="chips">Chips</TabsTrigger>
            <TabsTrigger value="titles">Titles</TabsTrigger>
          </TabsList>

          <TabsContent value="banners">
            <div className="space-y-6">
              <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
                <p className="text-gray-400 text-sm mb-3">Currently Equipped</p>
                {playerData.equippedBanner && getBannerById(playerData.equippedBanner, banners) ? (
                  <div className="flex items-center justify-center bg-gray-900/50 rounded-lg p-4">
                    <img
                      src={getBannerImagePath(getBannerById(playerData.equippedBanner, banners)!.imageName)}
                      alt={getBannerById(playerData.equippedBanner, banners)!.bannerName}
                      className="h-[50px]"
                    />
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No banner equipped</p>
                )}
              </div>

              <div className="flex gap-4 flex-wrap">
                <Input
                  placeholder="Search banners..."
                  value={bannerSearch}
                  onChange={(e) => setBannerSearch(e.target.value)}
                  className="flex-1 min-w-[200px] bg-gray-800 border-gray-700"
                />
                <Select value={bannerRarityFilter} onValueChange={setBannerRarityFilter}>
                  <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Rarity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Rarities</SelectItem>
                    <SelectItem value="common">Common</SelectItem>
                    <SelectItem value="regular">Regular</SelectItem>
                    <SelectItem value="special">Special</SelectItem>
                    <SelectItem value="deluxe">Deluxe</SelectItem>
                    <SelectItem value="exotic">Exotic</SelectItem>
                    <SelectItem value="blackmarket">Black Market</SelectItem>
                    <SelectItem value="legacy">Legacy</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={bannerSortBy} onValueChange={(v) => setBannerSortBy(v as 'alphabetical' | 'rarity')}>
                  <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alphabetical">Alphabetical</SelectItem>
                    <SelectItem value="rarity">Rarity</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {ownedBanners.map(banner => (
                  <TooltipProvider key={banner.bannerId} delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <ItemCard
                            rarity={banner.rarity}
                            attributes={banner.attributes}
                            selected={selectedBanner === banner.bannerId}
                            onClick={() => onEquipBanner(banner.bannerId)}
                            className="aspect-square p-4 cursor-pointer"
                          >
                            <div className="flex flex-col items-center justify-center h-full">
                              <img
                                src={getBannerImagePath(banner.imageName)}
                                alt={banner.bannerName}
                                className="h-[50px] w-auto object-contain mb-2"
                                style={{ imageRendering: banner.fileType === 'gif' ? 'auto' : 'crisp-edges' }}
                              />
                              <p className="text-xs text-center truncate w-full">{banner.bannerName}</p>
                              {banner.ranked && banner.season && (
                                <span className="text-[10px] bg-yellow-600/20 text-yellow-400 px-1 py-0.5 rounded mt-1">
                                  S{banner.season}
                                </span>
                              )}
                            </div>
                          </ItemCard>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-1">
                          <p className="font-semibold">{banner.bannerName}</p>
                          {banner.description && <p className="text-xs text-gray-400">{banner.description}</p>}
                          {banner.rarity && (
                            <p className="text-xs">
                              <span className="text-gray-400">Rarity:</span> {banner.rarity}
                            </p>
                          )}
                          {banner.attributes && banner.attributes.length > 0 && (
                            <p className="text-xs">
                              <span className="text-gray-400">Attributes:</span> {banner.attributes.join(', ')}
                            </p>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>

              {ownedBanners.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-400">No banners found</p>
                </div>
              )}

            </div>
          </TabsContent>

          <TabsContent value="pfps">
            <div className="space-y-6">
              <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
                <p className="text-gray-400 text-sm mb-3">Currently Equipped</p>
                {playerData.equippedPfp && getPfpById(playerData.equippedPfp, pfps) ? (
                  <div className="flex items-center justify-center bg-gray-900/50 rounded-lg p-4">
                    <div className="w-[80px] h-[80px] rounded-full overflow-hidden border-2 border-gray-600">
                      <img
                        src={getPfpImagePath(getPfpById(playerData.equippedPfp, pfps)!.imageName)}
                        alt={getPfpById(playerData.equippedPfp, pfps)!.pfpName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No PFP equipped</p>
                )}
              </div>

              <div className="flex gap-4 flex-wrap">
                <Input
                  placeholder="Search PFPs..."
                  value={pfpSearch}
                  onChange={(e) => setPfpSearch(e.target.value)}
                  className="flex-1 min-w-[200px] bg-gray-800 border-gray-700"
                />
                <Select value={pfpRarityFilter} onValueChange={setPfpRarityFilter}>
                  <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Rarity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Rarities</SelectItem>
                    <SelectItem value="common">Common</SelectItem>
                    <SelectItem value="regular">Regular</SelectItem>
                    <SelectItem value="special">Special</SelectItem>
                    <SelectItem value="deluxe">Deluxe</SelectItem>
                    <SelectItem value="exotic">Exotic</SelectItem>
                    <SelectItem value="blackmarket">Black Market</SelectItem>
                    <SelectItem value="legacy">Legacy</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={pfpSortBy} onValueChange={(v) => setPfpSortBy(v as 'alphabetical' | 'rarity')}>
                  <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="alphabetical">Alphabetical</SelectItem>
                    <SelectItem value="rarity">Rarity</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {ownedPfps.map(pfp => (
                  <TooltipProvider key={pfp.pfpId} delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div>
                          <ItemCard
                            rarity={pfp.rarity}
                            attributes={pfp.attributes}
                            selected={selectedPfp === pfp.pfpId}
                            onClick={() => onEquipPfp(pfp.pfpId)}
                            className="aspect-square p-4 cursor-pointer"
                          >
                            <div className="flex flex-col items-center justify-center h-full">
                              <div className="w-[80px] h-[80px] rounded-full overflow-hidden border-2 border-gray-600 mb-2">
                                <img
                                  src={getPfpImagePath(pfp.imageName)}
                                  alt={pfp.pfpName}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <p className="text-xs text-center truncate w-full">{pfp.pfpName}</p>
                            </div>
                          </ItemCard>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-1">
                          <p className="font-semibold">{pfp.pfpName}</p>
                          {pfp.description && <p className="text-xs text-gray-400">{pfp.description}</p>}
                          {pfp.rarity && (
                            <p className="text-xs">
                              <span className="text-gray-400">Rarity:</span> {pfp.rarity}
                            </p>
                          )}
                          {pfp.attributes && pfp.attributes.length > 0 && (
                            <p className="text-xs">
                              <span className="text-gray-400">Attributes:</span> {pfp.attributes.join(', ')}
                            </p>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ))}
              </div>

              {ownedPfps.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-400">No PFPs found</p>
                </div>
              )}

            </div>
          </TabsContent>

          <TabsContent value="chips">
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <p className="text-6xl mb-4">🎮</p>
                <p className="text-2xl text-gray-400 mb-2">Chips Coming Soon</p>
                <p className="text-gray-500">Custom chips will be available in a future update</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="titles">
            <div className="space-y-6">
              <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
                <p className="text-gray-400 text-sm mb-2">Currently Equipped</p>
                <TitleDisplay titleId={playerData.equippedTitle} />
              </div>

              <div className="flex gap-4 flex-wrap">
                <Input
                  placeholder="Search titles..."
                  value={titleSearch}
                  onChange={(e) => setTitleSearch(e.target.value)}
                  className="flex-1 min-w-[200px] bg-gray-800 border-gray-700"
                />
                <Select value={titleTypeFilter} onValueChange={setTitleTypeFilter}>
                  <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="season">Season</SelectItem>
                    <SelectItem value="tournament">Tournament</SelectItem>
                    <SelectItem value="leaderboard">Leaderboard</SelectItem>
                    <SelectItem value="grey">Shop</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div
                  onClick={() => onEquipTitle(null)}
                  className={`p-4 rounded-lg cursor-pointer transition-all border-2 ${
                    selectedTitle === null
                      ? 'bg-blue-600 border-blue-400'
                      : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <p className="text-gray-400 text-center">No Title Equipped</p>
                </div>

                {ownedTitles.map(title => (
                  <div
                    key={title.id}
                    onClick={() => onEquipTitle(title.id)}
                    className={`p-4 rounded-lg cursor-pointer transition-all border-2 ${
                      selectedTitle === title.id
                        ? 'bg-blue-600 border-blue-400'
                        : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
                    }`}
                  >
                    <TitleDisplay title={title} />
                  </div>
                ))}
              </div>

              {ownedTitles.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-gray-400">No titles found</p>
                </div>
              )}

            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
