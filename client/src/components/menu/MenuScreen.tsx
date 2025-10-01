import React from 'react';
import { PlayerData } from '../../types/game';
import { getRankByTrophies, getTierColor } from '../../utils/rankSystem';
import { TitleDisplay } from '../common/TitleDisplay';

interface MenuScreenProps {
  playerData: PlayerData;
  onQueue: () => void;
  onLeaderboard: () => void;
  onStats: () => void;
  onSettings: () => void;
  onTitleSelector: () => void;
}

export function MenuScreen({
  playerData,
  onQueue,
  onLeaderboard,
  onStats,
  onSettings,
  onTitleSelector
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
          <p className="text-gray-400">Competitive Connect 4</p>
        </div>
        
        {/* Player Info */}
        <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 mb-8 border border-gray-700">
          <div className="text-center mb-4">
            <h2 className="text-3xl font-bold mb-2">{playerData.username}</h2>
            <TitleDisplay 
              title={playerData.equippedTitle ? {
                id: playerData.equippedTitle,
                name: playerData.equippedTitle,
                type: 'grey',
                color: '#9CA3AF',
                glow: 'none'
              } : null}
            />
          </div>
          
          <button
            onClick={onTitleSelector}
            className="w-full mb-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors text-sm"
          >
            Change Title
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
        
        {/* Main Actions */}
        <div className="space-y-4 mb-8">
          <button
            onClick={onQueue}
            className="w-full py-6 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl text-2xl font-bold transition-all transform hover:scale-105 shadow-lg"
          >
            🎮 Find Match
          </button>
          
          <button
            onClick={onLeaderboard}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 rounded-xl text-xl font-bold transition-all transform hover:scale-105 shadow-lg"
          >
            🏆 Leaderboard
          </button>
        </div>
        
        {/* Secondary Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={onStats}
            className="py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors font-semibold"
          >
            📊 Stats
          </button>
          <button
            onClick={onSettings}
            className="py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors font-semibold"
          >
            ⚙️ Settings
          </button>
        </div>
      </div>
    </div>
  );
}
