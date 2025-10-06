import React from 'react';
import { PlayerData } from '../../types/game';
import { getRankByTrophies, getTierColor, getRankImagePath } from '../../utils/rankSystem';
import { Button } from '../ui/button';

interface StatsScreenProps {
  playerData: PlayerData;
  onBack: () => void;
}

export function StatsScreen({ playerData, onBack }: StatsScreenProps) {
  const rank = getRankByTrophies(playerData.trophies);
  const tierColor = getTierColor(rank.tier);
  const rankImagePath = getRankImagePath(rank.name);
  const winRate = playerData.totalGames > 0 
    ? ((playerData.wins / playerData.totalGames) * 100).toFixed(1)
    : '0.0';
  
  const peakRank = playerData.peakRank ? getRankByTrophies(parseInt(playerData.peakRank)) : rank;
  const peakTierColor = getTierColor(peakRank.tier);
  const peakRankImagePath = getRankImagePath(peakRank.name);
  
  const matchHistory = playerData.matchHistory || [];
  const recentMatches = matchHistory.slice(0, 10);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Button onClick={onBack} variant="secondary" size="sm">
            ← Back
          </Button>
          <h2 className="text-3xl font-bold">Your Statistics</h2>
          <div className="w-20"></div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-card border border-border rounded-2xl p-4 text-center shadow-xl">
            <h3 className="text-gray-400 text-xs mb-1">Current Rank</h3>
            <div className="flex items-center justify-center gap-2 mt-1">
              <img 
                src={rankImagePath} 
                alt={rank.name} 
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <p className="text-xl font-bold" style={{ color: tierColor }}>
                {rank.name}
              </p>
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-2xl p-4 text-center shadow-xl">
            <h3 className="text-gray-400 text-xs mb-1">Trophies</h3>
            <p className="text-2xl font-bold text-yellow-400">
              🏆 {playerData.trophies}
            </p>
          </div>
          
          <div className="bg-card border border-border rounded-2xl p-4 text-center shadow-xl">
            <h3 className="text-gray-400 text-xs mb-1">Level</h3>
            <p className="text-2xl font-bold text-blue-400">
              {playerData.level}
            </p>
            <div className="mt-1.5 bg-background rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-blue-500 h-full"
                style={{ width: `${(playerData.xp % 100)}%` }}
              />
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-2xl p-4 text-center shadow-xl">
            <h3 className="text-gray-400 text-xs mb-1">Coins</h3>
            <p className="text-2xl font-bold text-yellow-400">
              💰 {playerData.coins}
            </p>
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-2xl p-5 mb-4 shadow-xl">
          <h3 className="text-lg font-bold mb-4">Match Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-gray-400 text-xs mb-1">Total Games</p>
              <p className="text-xl font-bold">{playerData.totalGames}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-xs mb-1">Wins</p>
              <p className="text-xl font-bold text-green-400">{playerData.wins}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-xs mb-1">Losses</p>
              <p className="text-xl font-bold text-red-400">{playerData.losses}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400 text-xs mb-1">Win Rate</p>
              <p className="text-xl font-bold text-blue-400">{winRate}%</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="bg-card border border-border rounded-2xl p-4 text-center shadow-xl">
            <h3 className="text-gray-400 text-xs mb-1">Win Streak</h3>
            <p className="text-2xl font-bold text-orange-400">
              🔥 {playerData.winStreak}
            </p>
          </div>
          
          <div className="bg-card border border-border rounded-2xl p-4 text-center shadow-xl">
            <h3 className="text-gray-400 text-xs mb-1">Best Streak</h3>
            <p className="text-2xl font-bold text-orange-400">
              ⭐ {playerData.bestWinStreak}
            </p>
          </div>
          
          <div className="bg-card border border-border rounded-2xl p-4 text-center shadow-xl">
            <h3 className="text-gray-400 text-xs mb-1">Losing Streak</h3>
            <p className="text-2xl font-bold text-blue-400">
              💧 {playerData.losingStreak}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div className="bg-card border border-border rounded-2xl p-4 shadow-xl">
            <h3 className="text-gray-400 text-xs mb-1">Peak Rank</h3>
            <div className="flex items-center justify-center gap-2 mt-1">
              <img 
                src={peakRankImagePath} 
                alt={peakRank.name} 
                className="w-8 h-8 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <p className="text-xl font-bold" style={{ color: peakTierColor }}>
                {peakRank.name}
              </p>
            </div>
            {playerData.peakSeason && (
              <p className="text-xs text-gray-400 mt-1">
                Season {playerData.peakSeason}
              </p>
            )}
          </div>
          
          <div className="bg-card border border-border rounded-2xl p-4 shadow-xl">
            <h3 className="text-gray-400 text-xs mb-1">Peak Trophies</h3>
            <p className="text-xl font-bold text-yellow-400">
              🏆 {playerData.peakTrophies || playerData.trophies}
            </p>
            {playerData.peakSeason && (
              <p className="text-xs text-gray-400 mt-1">
                Season {playerData.peakSeason}
              </p>
            )}
          </div>
        </div>
        
        <div className="bg-card border border-border rounded-2xl p-5 shadow-xl">
          <h3 className="text-lg font-bold mb-4">Match History</h3>
          {recentMatches.length === 0 ? (
            <p className="text-gray-400 text-center py-4 text-sm">No matches played yet</p>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
              {recentMatches.map((match, index) => {
                const trophyBefore = match.trophyBefore || (playerData.trophies - match.trophyChange);
                const trophyAfter = match.trophyAfter || playerData.trophies;
                
                return (
                  <div
                    key={index}
                    className={`p-3 rounded-xl border ${
                      match.result === 'win'
                        ? 'bg-green-900/20 border-green-500/30'
                        : 'bg-red-900/20 border-red-500/30'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className={`font-bold text-sm ${
                          match.result === 'win' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {match.result === 'win' ? 'Victory' : 'Defeat'}
                        </p>
                        <p className="text-gray-400 text-xs">
                          vs {match.opponentName} ({match.opponentTrophies} 🏆)
                        </p>
                        <p className="text-gray-500 text-xs mt-0.5">
                          {new Date(match.timestamp).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400 text-xs">Score: {match.score}</p>
                        <p className={`text-lg font-bold ${
                          match.trophyChange >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {match.trophyChange >= 0 ? '+' : ''}{match.trophyChange} 🏆
                        </p>
                        <p className="text-gray-500 text-xs mt-0.5">
                          {trophyBefore} → {trophyAfter}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
