import React from 'react';
import { PlayerData } from '../../types/game';
import { getRankByTrophies, getTierColor } from '../../utils/rankSystem';
import { BannerDisplay } from '../common/BannerDisplay';

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
              />
            </div>
          </div>
          
          <button
            onClick={onInventory}
            className="w-full mb-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors text-sm font-semibold"
          >
            Inventory
          </button>
          
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
          <button
            onClick={onPlay}
            className="w-full py-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl text-2xl font-bold transition-all transform hover:scale-105 shadow-lg"
          >
            Play
          </button>
          
          {/* Shop and Leaderboard */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={onShop}
              className="py-4 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors font-semibold text-lg"
            >
              Shop
            </button>
            <button
              onClick={onLeaderboard}
              className="py-4 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors font-semibold text-lg"
            >
              Leaderboard
            </button>
          </div>
          
          {/* CSL, Stats, Settings, News */}
          <div className="grid grid-cols-4 gap-4">
            <button
              onClick={onCSL}
              className="py-3 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-sm font-semibold transition-colors"
            >
              CSL
            </button>
            <button
              onClick={onStats}
              className="py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors font-semibold"
            >
              Stats
            </button>
            <button
              onClick={onNews}
              className="py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors font-semibold relative"
            >
              News
              {unreadNewsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
                  {unreadNewsCount > 9 ? '9+' : unreadNewsCount}
                </span>
              )}
            </button>
            <button
              onClick={onSettings}
              className="py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors font-semibold"
            >
              Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
