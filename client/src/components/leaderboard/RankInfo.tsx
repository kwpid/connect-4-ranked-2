import React from 'react';
import { RANKS, getTierColor, getSeasonRewardCoins, getRankByTrophies } from '../../utils/rankSystem';
import { PlayerData } from '../../types/game';

interface RankInfoProps {
  onBack: () => void;
  playerData: PlayerData;
}

export function RankInfo({ onBack, playerData }: RankInfoProps) {
  const currentRank = getRankByTrophies(playerData.trophies);
  
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
          <h2 className="text-3xl font-bold">Rank Information</h2>
          <div className="w-20"></div>
        </div>
        
        <div className="space-y-4">
          {RANKS.map((rank, index) => {
            const tierColor = getTierColor(rank.tier);
            const reward = getSeasonRewardCoins(rank.minTrophies);
            const isCurrentRank = rank.name === currentRank.name;
            
            return (
              <div
                key={index}
                className={`backdrop-blur rounded-xl p-4 border-2 transition-all ${
                  isCurrentRank 
                    ? 'bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-500 ring-2 ring-blue-400 shadow-lg shadow-blue-500/50' 
                    : 'bg-gray-800/50 border-gray-700'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className={`text-xl font-bold ${isCurrentRank ? 'text-2xl' : ''}`} style={{ color: tierColor }}>
                      {rank.name}
                      {isCurrentRank && (
                        <span className="ml-2 text-sm bg-blue-500 text-white px-2 py-1 rounded-full">
                          You are here
                        </span>
                      )}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {rank.minTrophies} - {rank.maxTrophies === 999999 ? '∞' : rank.maxTrophies} trophies
                      {isCurrentRank && (
                        <span className="ml-2 text-blue-400 font-semibold">
                          (Your trophies: {playerData.trophies})
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-yellow-400 font-semibold">
                      💰 {reward} coins
                    </p>
                    <p className="text-gray-400 text-sm">Season Reward</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-8 bg-blue-600/20 backdrop-blur rounded-xl p-6 border border-blue-600/50">
          <h3 className="text-xl font-bold mb-3">Trophy System</h3>
          <ul className="space-y-2 text-gray-300">
            <li>• Win: +3 to +10 trophies (based on opponent rank)</li>
            <li>• Loss: -2 to -4 trophies (based on opponent rank)</li>
            <li>• Higher opponent rank = more trophies on win</li>
            <li>• Win Streak Bonus: +1 for 3+ wins, +2 for 10+ wins</li>
            <li>• Fast Win Bonus: +1 for wins in under 20 moves</li>
            <li>• Maximum reward: 10 trophies per match</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
