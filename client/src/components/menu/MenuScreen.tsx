import React, { useState, useEffect } from 'react';
import { PlayerData } from '../../types/game';
import { getRankByTrophies, getTierColor, getRankImagePath } from '../../utils/rankSystem';
import { BannerDisplay } from '../common/BannerDisplay';
import { Button } from '../ui/button';
import { getCurrentSeasonData } from '../../utils/seasonManager';

interface MenuScreenProps {
  playerData: PlayerData;
  onPlay: () => void;
  onLeaderboard: () => void;
  onShop: () => void;
  onStats: () => void;
  onSettings: () => void;
  onInventory: () => void;
  onNews: () => void;
  unreadNewsCount?: number;
  version?: string;
}

export function MenuScreen({
  playerData,
  onPlay,
  onLeaderboard,
  onShop,
  onStats,
  onSettings,
  onInventory,
  onNews,
  unreadNewsCount = 0,
  version = '1.0.0'
}: MenuScreenProps) {
  const rank = getRankByTrophies(playerData.trophies);
  const tierColor = getTierColor(rank.tier);
  
  const [seasonInfo, setSeasonInfo] = useState({ seasonNumber: 0, timeLeft: '' });
  
  useEffect(() => {
    const updateSeasonInfo = () => {
      const seasonData = getCurrentSeasonData();
      const now = Date.now();
      const diff = seasonData.endDate - now;
      
      if (diff <= 0) {
        setSeasonInfo({ seasonNumber: seasonData.seasonNumber, timeLeft: '00 00 00' });
        return;
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      const timeLeft = `${days.toString().padStart(2, '0')}d ${hours.toString().padStart(2, '0')}h ${minutes.toString().padStart(2, '0')}m`;
      setSeasonInfo({ seasonNumber: seasonData.seasonNumber, timeLeft });
    };
    
    updateSeasonInfo();
    const interval = setInterval(updateSeasonInfo, 60000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold mb-1 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Connect Ranked
          </h1>
          <div className="flex items-center justify-center gap-2">
            <p className="text-gray-400 text-sm">Competitive Connect 4</p>
            <span className="text-gray-600 text-xs">v{version}</span>
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-2xl p-6 mb-6 shadow-xl">
          <div className="flex items-center justify-center mb-6">
            <BannerDisplay 
              bannerId={playerData.equippedBanner}
              username={playerData.username}
              titleId={playerData.equippedTitle}
              pfpId={playerData.equippedPfp}
            />
          </div>
          
          <div className="grid grid-cols-4 gap-3 mb-4">
            <div className="bg-background rounded-xl p-3 text-center border border-border">
              <p className="text-gray-400 text-xs mb-1">Rank</p>
              <div className="flex items-center justify-center gap-1.5">
                <img 
                  src={getRankImagePath(rank.name)} 
                  alt={rank.name}
                  className="w-5 h-5"
                  style={{ imageRendering: 'crisp-edges' }}
                />
                <p className="text-sm font-bold" style={{ color: tierColor }}>{rank.name}</p>
              </div>
            </div>
            <div className="bg-background rounded-xl p-3 text-center border border-border">
              <p className="text-gray-400 text-xs mb-1">Trophies</p>
              <p className="text-sm font-bold text-yellow-400">🏆 {playerData.trophies}</p>
            </div>
            <div className="bg-background rounded-xl p-3 text-center border border-border">
              <p className="text-gray-400 text-xs mb-1">Level</p>
              <p className="text-sm font-bold text-blue-400">{playerData.level}</p>
            </div>
            <div className="bg-background rounded-xl p-3 text-center border border-border">
              <p className="text-gray-400 text-xs mb-1">Coins</p>
              <p className="text-sm font-bold text-yellow-400">💰 {playerData.coins}</p>
            </div>
          </div>
          
          {playerData.seasonRewardTier && (
            <div className="bg-gradient-to-r from-blue-900/40 to-purple-900/40 rounded-xl p-3 mb-4 border border-blue-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img 
                    src={getRankImagePath(`${playerData.seasonRewardTier} III`)} 
                    alt={playerData.seasonRewardTier}
                    className="w-10 h-10"
                    style={{ imageRendering: 'crisp-edges' }}
                  />
                  <div>
                    <p className="text-xs text-gray-400">Season Reward Progress</p>
                    <p className="text-sm font-bold text-blue-400">{playerData.seasonRewardTier}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-6 rounded-sm ${
                          i < (playerData.seasonRewardWins?.[playerData.seasonRewardTier!] || 0)
                            ? 'bg-gradient-to-t from-blue-500 to-blue-400'
                            : 'bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-xs font-bold text-white">
                    {playerData.seasonRewardWins?.[playerData.seasonRewardTier] || 0}/5
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <Button
            onClick={onInventory}
            className="w-full"
            variant="secondary"
            size="sm"
          >
            Inventory
          </Button>
        </div>
        
        <div className="space-y-3">
          <Button
            onClick={onPlay}
            className="w-full h-14 text-xl font-bold"
            size="lg"
          >
            Play
          </Button>
          
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={onShop}
              className="h-12"
              size="lg"
            >
              Shop
            </Button>
            <Button
              onClick={onLeaderboard}
              className="h-12 relative"
              size="lg"
            >
              Leaderboard
              <div className="absolute -top-2 -left-2 -right-2 flex justify-between items-center pointer-events-none">
                <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                  S{seasonInfo.seasonNumber}
                </span>
                <span className="bg-orange-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                  {seasonInfo.timeLeft}
                </span>
              </div>
            </Button>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <Button
              onClick={onStats}
              className="h-10"
              variant="secondary"
              size="sm"
            >
              Stats
            </Button>
            <Button
              onClick={onNews}
              className="h-10 relative"
              variant="secondary"
              size="sm"
            >
              News
              {unreadNewsCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadNewsCount > 9 ? '9+' : unreadNewsCount}
                </span>
              )}
            </Button>
            <Button
              onClick={onSettings}
              className="h-10"
              variant="secondary"
              size="sm"
            >
              Settings
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
