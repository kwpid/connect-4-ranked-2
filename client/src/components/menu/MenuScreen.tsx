import React from 'react';
import { PlayerData } from '../../types/game';
import { getRankByTrophies, getTierColor } from '../../utils/rankSystem';
import { BannerDisplay } from '../common/BannerDisplay';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            Connect Ranked
          </h1>
          <div className="flex items-center justify-center gap-2">
            <p className="text-gray-400">Competitive Connect 4</p>
            <span className="text-gray-600 text-sm">v{version}</span>
          </div>
        </div>
        
        {/* Player Info */}
        <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 mb-8 border border-gray-700">
          <div className="text-center mb-4">
            <div className="flex items-center justify-center mb-2">
              <BannerDisplay 
                bannerId={playerData.equippedBanner}
                username={playerData.username}
                titleId={playerData.equippedTitle}
                pfpId={playerData.equippedPfp}
              />
            </div>
          </div>
          
          <Button
            onClick={onInventory}
            className="w-full mb-4"
            variant="default"
          >
            Inventory
          </Button>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-gray-400 text-sm">Rank</p>
              <p className="text-xl font-bold" style={{ color: tierColor }}>{rank.name}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">Trophies</p>
              <p className="text-xl font-bold text-yellow-400">🏆 {playerData.trophies}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">Level</p>
              <p className="text-xl font-bold text-purple-400">{playerData.level}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">Coins</p>
              <p className="text-xl font-bold text-yellow-400">💰 {playerData.coins}</p>
            </div>
          </div>
        </div>
        
        {/* Main Play Button */}
        <div className="space-y-4 mb-8">
          <Button
            onClick={onPlay}
            className="w-full h-16 text-2xl font-bold transform hover:scale-105"
            size="lg"
          >
            Play
          </Button>
          
          {/* Shop and Leaderboard */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={onShop}
              className="py-4 h-auto text-lg"
              variant="default"
            >
              Shop
            </Button>
            <Button
              onClick={onLeaderboard}
              className="py-4 h-auto text-lg"
              variant="default"
            >
              Leaderboard
            </Button>
          </div>
          
          {/* CSL, Stats, Settings, News */}
          <div className="grid grid-cols-4 gap-4">
            <Button
              onClick={onCSL}
              className="py-3 h-auto"
              variant="secondary"
              size="sm"
            >
              CSL
            </Button>
            <Button
              onClick={onStats}
              className="py-3 h-auto"
              variant="secondary"
              size="sm"
            >
              Stats
            </Button>
            <Button
              onClick={onNews}
              className="py-3 h-auto relative"
              variant="secondary"
              size="sm"
            >
              News
              {unreadNewsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
                  {unreadNewsCount > 9 ? '9+' : unreadNewsCount}
                </span>
              )}
            </Button>
            <Button
              onClick={onSettings}
              className="py-3 h-auto"
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
