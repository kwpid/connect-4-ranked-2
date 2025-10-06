import React from 'react';
import { PlayerData } from '../../types/game';
import { getRankByTrophies, getTierColor } from '../../utils/rankSystem';
import { BannerDisplay } from '../common/BannerDisplay';
import { Button } from '../ui/button';

interface MenuScreenProps {
  playerData: PlayerData;
  onPlay: () => void;
  onLeaderboard: () => void;
  onCSL: () => void;
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
  onCSL,
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
              <p className="text-sm font-bold" style={{ color: tierColor }}>{rank.name}</p>
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
              className="h-12"
              size="lg"
            >
              Leaderboard
            </Button>
          </div>
          
          <div className="grid grid-cols-4 gap-3">
            <Button
              onClick={onCSL}
              className="h-10"
              variant="secondary"
              size="sm"
            >
              CSL
            </Button>
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
