import React, { useState, useEffect } from 'react';
import { LeaderboardEntry, PlayerData } from '../../types/game';
import { getRankByTrophies, getTierColor } from '../../utils/rankSystem';
import { getSeasonRewardCoins } from '../../utils/rankSystem';
import { getCurrentSeasonData, getTimeUntilSeasonEnd } from '../../utils/seasonManager';
import { Button } from '../ui/button';

interface LeaderboardScreenProps {
  leaderboard: LeaderboardEntry[];
  playerData: PlayerData;
  nextAIUpdate: number;
  onBack: () => void;
  onRankInfo: () => void;
}

export function LeaderboardScreen({ leaderboard, playerData, nextAIUpdate, onBack, onRankInfo }: LeaderboardScreenProps) {
  const [currentTime, setCurrentTime] = useState(Date.now());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  const playerInTop100 = leaderboard.find(e => e.isPlayer);
  const seasonData = getCurrentSeasonData();
  const timeRemaining = getTimeUntilSeasonEnd();
  const playerRank = getRankByTrophies(playerData.trophies);
  const tierColor = getTierColor(playerRank.tier);
  
  const getAIUpdateCountdown = () => {
    const diff = Math.max(0, nextAIUpdate - currentTime);
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Button onClick={onBack} variant="secondary" size="sm">
            ← Back
          </Button>
          <h2 className="text-3xl font-bold">Leaderboard</h2>
          <Button onClick={onRankInfo} size="sm">
            📋 Ranks
          </Button>
        </div>
        
        <div className="bg-card border border-border rounded-2xl p-5 mb-4 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <p className="text-gray-400 text-xs mb-1">Season</p>
              <p className="text-xl font-bold text-blue-400">#{seasonData.seasonNumber}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-xs mb-1">Time Remaining</p>
              <p className="text-xl font-bold text-blue-400">{timeRemaining}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-xs mb-1">Your Rank</p>
              <p className="text-xl font-bold" style={{ color: tierColor }}>{playerRank.name}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-xs mb-1">Your Trophies</p>
              <p className="text-xl font-bold text-yellow-400">🏆 {playerData.trophies}</p>
            </div>
          </div>
          
          <div className="pt-4 border-t border-border text-center">
            <p className="text-gray-400 text-xs mb-1">Next Update</p>
            <p className="text-lg font-bold text-cyan-400">⏱️ {getAIUpdateCountdown()}</p>
          </div>
          
          {playerInTop100 && (
            <div className="mt-4 pt-4 border-t border-border text-center">
              <p className="text-yellow-400 font-semibold text-sm">
                🎯 Position: #{playerInTop100.rank}
              </p>
            </div>
          )}
        </div>
        
        {playerInTop100 ? (
          <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-800/20 backdrop-blur rounded-2xl p-4 mb-4 border border-yellow-600/50">
            <p className="text-center text-yellow-400 font-semibold text-sm">
              🏆 You're #{playerInTop100.rank} with {playerInTop100.trophies} trophies!
            </p>
            <p className="text-center text-gray-300 text-xs mt-1">
              Season Reward: {getSeasonRewardCoins(playerData.trophies)} coins
            </p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl p-4 mb-4">
            <p className="text-center text-gray-400 text-sm">
              Keep playing to climb the leaderboard!
            </p>
            <p className="text-center text-gray-500 text-xs mt-1">
              Current: {playerData.trophies} trophies
            </p>
          </div>
        )}
        
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-y-auto max-h-[600px]">
            <table className="w-full">
              <thead className="bg-background sticky top-0">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400">Rank</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400">Player</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400">Trophies</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-400">Reward</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry, index) => {
                  const rank = getRankByTrophies(entry.trophies);
                  const tierColor = getTierColor(rank.tier);
                  const isPlayer = entry.isPlayer;
                  
                  let rewardText = '';
                  if (entry.rank === 1) rewardText = '10,000 coins + 👑 TOP CHAMPION';
                  else if (entry.rank && entry.rank <= 10) rewardText = '5,000 coins + 🏅 TOP 10';
                  else if (entry.rank && entry.rank <= 25) rewardText = '3,000 coins + ⭐ TOP 25';
                  else if (entry.rank && entry.rank <= 50) rewardText = '2,000 coins + 🎖️ TOP 50';
                  else if (entry.rank && entry.rank <= 100) rewardText = '1,000 coins';
                  
                  return (
                    <tr
                      key={index}
                      className={`border-t border-border ${
                        isPlayer ? 'bg-blue-600/20' : 'hover:bg-muted/50'
                      } transition-colors`}
                    >
                      <td className="px-4 py-3">
                        <span className="font-bold text-sm">#{entry.rank}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-sm ${isPlayer ? 'font-bold text-blue-400' : ''}`}>
                          {entry.username} {isPlayer && '(You)'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="font-semibold text-sm" style={{ color: tierColor }}>
                          🏆 {entry.trophies}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-yellow-400">
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
