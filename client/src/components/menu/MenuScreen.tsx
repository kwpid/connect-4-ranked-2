import React, { useState, useEffect } from 'react';
import { PlayerData, TournamentData } from '../../types/game';
import { getRankByTrophies, getTierColor } from '../../utils/rankSystem';
import { TitleDisplay } from '../common/TitleDisplay';
import { BannerDisplay } from '../common/BannerDisplay';
import { getTimeUntilTournament } from '../../utils/tournamentManager';

interface MenuScreenProps {
  playerData: PlayerData;
  onQueue: () => void;
  onPractice: () => void;
  onLeaderboard: () => void;
  onShop: () => void;
  onStats: () => void;
  onSettings: () => void;
  onTitleSelector: () => void;
  onInventory: () => void;
  onTournament: () => void;
  currentTournament: TournamentData | null;
  nextTournamentTime: number;
  isRegistered: boolean;
}

export function MenuScreen({
  playerData,
  onQueue,
  onPractice,
  onLeaderboard,
  onShop,
  onStats,
  onSettings,
  onTitleSelector,
  onInventory,
  onTournament,
  currentTournament,
  nextTournamentTime,
  isRegistered
}: MenuScreenProps) {
  const [currentTime, setCurrentTime] = useState(Date.now());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
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
        
        {/* Main Actions */}
        <div className="space-y-4 mb-8">
          <button
            onClick={onQueue}
            disabled={isRegistered}
            className={`w-full py-6 ${isRegistered ? 'bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'} rounded-xl text-2xl font-bold transition-all transform hover:scale-105 shadow-lg`}
          >
            {isRegistered ? 'Registered for Tournament' : 'Find Match'}
          </button>
          
          {/* Tournament Button */}
          {currentTournament && (
            <button
              onClick={onTournament}
              className="w-full py-5 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 rounded-xl text-xl font-bold transition-all transform hover:scale-105 shadow-lg"
            >
              Tournament
              <span className="text-sm block mt-1">
                {currentTournament.status === 'registration' 
                  ? `Registration: ${getTimeUntilTournament(currentTime, nextTournamentTime)}`
                  : 'In Progress'}
              </span>
            </button>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={onPractice}
              className="py-3 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-semibold transition-colors"
            >
              🎓 Practice
            </button>
            
            <button
              onClick={onLeaderboard}
              className="py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-semibold transition-colors"
            >
              🏆 Leaderboard
            </button>
          </div>
        </div>
        
        {/* Secondary Actions */}
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={onShop}
            className="py-3 bg-yellow-600 hover:bg-yellow-700 rounded-lg transition-colors font-semibold"
          >
            $ Shop
          </button>
          <button
            onClick={onStats}
            className="py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors font-semibold"
          >
            ≡ Stats
          </button>
          <button
            onClick={onSettings}
            className="py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors font-semibold"
          >
            ⋮ Settings
          </button>
        </div>
      </div>
    </div>
  );
}
