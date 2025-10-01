import React from 'react';
import { LeaderboardEntry, PlayerData } from '../../types/game';
import { getRankByTrophies, getTierColor } from '../../utils/rankSystem';
import { getSeasonRewardCoins } from '../../utils/rankSystem';

interface LeaderboardScreenProps {
  leaderboard: LeaderboardEntry[];
  playerData: PlayerData;
  onBack: () => void;
  onRankInfo: () => void;
}

export function LeaderboardScreen({ leaderboard, playerData, onBack, onRankInfo }: LeaderboardScreenProps) {
  const playerInTop30 = leaderboard.find(e => e.isPlayer);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            ← Back
          </button>
          <h2 className="text-3xl font-bold">Top 30 Leaderboard</h2>
          <button
            onClick={onRankInfo}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            📋 Ranks
          </button>
        </div>
        
        {/* Player Status */}
        {playerInTop30 ? (
          <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-800/20 backdrop-blur rounded-xl p-4 mb-6 border border-yellow-600/50">
            <p className="text-center text-yellow-400 font-semibold">
              🏆 You're #{playerInTop30.rank} with {playerInTop30.trophies} trophies!
            </p>
            <p className="text-center text-gray-300 text-sm mt-1">
              Season Reward: {getSeasonRewardCoins(playerData.trophies)} coins
            </p>
          </div>
        ) : (
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-4 mb-6 border border-gray-700">
            <p className="text-center text-gray-400">
              Keep playing to climb the leaderboard!
            </p>
            <p className="text-center text-gray-500 text-sm mt-1">
              Current: {playerData.trophies} trophies
            </p>
          </div>
        )}
        
        {/* Leaderboard */}
        <div className="bg-gray-800/30 backdrop-blur rounded-xl border border-gray-700 overflow-hidden">
          <div className="overflow-y-auto max-h-[600px]">
            <table className="w-full">
              <thead className="bg-gray-900/50 sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left">Rank</th>
                  <th className="px-4 py-3 text-left">Player</th>
                  <th className="px-4 py-3 text-right">Trophies</th>
                  <th className="px-4 py-3 text-right">Reward</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, index) => {
                  const rank = getRankByTrophies(entry.trophies);
                  const tierColor = getTierColor(rank.tier);
                  const isPlayer = entry.isPlayer;
                  
                  let rewardText = '';
                  if (entry.rank === 1) rewardText = '👑 TOP CHAMPION';
                  else if (entry.rank && entry.rank <= 10) rewardText = '🏅 TOP 10';
                  else if (entry.rank && entry.rank <= 30) rewardText = '⭐ TOP 30';
                  
                  return (
                    <tr
                      key={index}
                      className={`border-t border-gray-700 ${
                        isPlayer ? 'bg-blue-600/20' : 'hover:bg-gray-700/30'
                      } transition-colors`}
                    >
                      <td className="px-4 py-3">
                        <span className="font-bold">#{entry.rank}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={isPlayer ? 'font-bold text-blue-400' : ''}>
                          {entry.username} {isPlayer && '(You)'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-semibold" style={{ color: tierColor }}>
                          🏆 {entry.trophies}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-yellow-400">
                        {rewardText}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
