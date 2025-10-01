import React from 'react';
import { PlayerData } from '../../types/game';
import { getRankByTrophies, getTierColor } from '../../utils/rankSystem';

interface StatsScreenProps {
  playerData: PlayerData;
  onBack: () => void;
}

export function StatsScreen({ playerData, onBack }: StatsScreenProps) {
  const rank = getRankByTrophies(playerData.trophies);
  const tierColor = getTierColor(rank.tier);
  const winRate = playerData.totalGames > 0 
    ? ((playerData.wins / playerData.totalGames) * 100).toFixed(1)
    : '0.0';
  
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
          <h2 className="text-3xl font-bold">Your Statistics</h2>
          <div className="w-20"></div>
        </div>
        
        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
            <h3 className="text-gray-400 text-sm mb-2">Current Rank</h3>
            <p className="text-3xl font-bold" style={{ color: tierColor }}>
              {rank.name}
            </p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
            <h3 className="text-gray-400 text-sm mb-2">Trophies</h3>
            <p className="text-3xl font-bold text-yellow-400">
              🏆 {playerData.trophies}
            </p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
            <h3 className="text-gray-400 text-sm mb-2">Level</h3>
            <p className="text-3xl font-bold text-purple-400">
              {playerData.level}
            </p>
            <div className="mt-2 bg-gray-700 rounded-full h-2 overflow-hidden">
              <div
                className="bg-purple-500 h-full"
                style={{ width: `${(playerData.xp % 100)}%` }}
              />
            </div>
            <p className="text-sm text-gray-400 mt-1">
              {playerData.xp % 100}/100 XP
            </p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
            <h3 className="text-gray-400 text-sm mb-2">Coins</h3>
            <p className="text-3xl font-bold text-yellow-400">
              💰 {playerData.coins}
            </p>
          </div>
        </div>
        
        {/* Match Stats */}
        <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700 mb-8">
          <h3 className="text-xl font-bold mb-4">Match Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-gray-400 text-sm">Total Games</p>
              <p className="text-2xl font-bold">{playerData.totalGames}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">Wins</p>
              <p className="text-2xl font-bold text-green-400">{playerData.wins}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">Losses</p>
              <p className="text-2xl font-bold text-red-400">{playerData.losses}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-sm">Win Rate</p>
              <p className="text-2xl font-bold text-blue-400">{winRate}%</p>
            </div>
          </div>
        </div>
        
        {/* Streak Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
            <h3 className="text-gray-400 text-sm mb-2">Current Win Streak</h3>
            <p className="text-3xl font-bold text-orange-400">
              🔥 {playerData.winStreak}
            </p>
          </div>
          
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
            <h3 className="text-gray-400 text-sm mb-2">Best Win Streak</h3>
            <p className="text-3xl font-bold text-orange-400">
              ⭐ {playerData.bestWinStreak}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
