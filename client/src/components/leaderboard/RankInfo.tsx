import React, { useMemo } from 'react';
import { RANKS, getTierColor, getSeasonRewardCoins, getRankByTrophies, getRankImagePath } from '../../utils/rankSystem';
import { PlayerData } from '../../types/game';
import { getAICompetitors } from '../../utils/storageManager';
import { Button } from '../ui/button';

interface RankInfoProps {
  onBack: () => void;
  playerData: PlayerData;
}

export function RankInfo({ onBack, playerData }: RankInfoProps) {
  const currentRank = getRankByTrophies(playerData.trophies);
  
  const rankCounts = useMemo(() => {
    const aiCompetitors = getAICompetitors();
    const allPlayers = [playerData, ...aiCompetitors];
    
    const counts = new Map<string, number>();
    RANKS.forEach(rank => {
      const count = allPlayers.filter(p => 
        p.trophies >= rank.minTrophies && p.trophies <= rank.maxTrophies
      ).length;
      counts.set(rank.name, count);
    });
    
    return counts;
  }, [playerData]);
  
  const reversedRanks = [...RANKS].reverse();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Button onClick={onBack} variant="secondary" size="sm">
            ← Back
          </Button>
          <h2 className="text-3xl font-bold">Rank Information</h2>
          <div className="w-20"></div>
        </div>
        
        <div className="space-y-3 mb-6">
          {reversedRanks.map((rank, index) => {
            const tierColor = getTierColor(rank.tier);
            const reward = getSeasonRewardCoins(rank.minTrophies);
            const isCurrentRank = rank.name === currentRank.name;
            const playerCount = rankCounts.get(rank.name) || 0;
            const rankImagePath = getRankImagePath(rank.name);
            
            return (
              <div
                key={index}
                className={`backdrop-blur rounded-2xl p-4 border-2 transition-all shadow-lg ${
                  isCurrentRank 
                    ? 'bg-gradient-to-r from-blue-600/30 to-blue-800/30 border-blue-500 ring-2 ring-blue-400' 
                    : 'bg-card border-border'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3 flex-1">
                    <img 
                      src={rankImagePath} 
                      alt={rank.name} 
                      className="w-11 h-11 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <div className="flex-1">
                      <h3 className={`text-lg font-bold ${isCurrentRank ? 'text-xl' : ''}`} style={{ color: tierColor }}>
                        {rank.name}
                      </h3>
                      <p className="text-gray-400 text-xs">
                        {rank.minTrophies} - {rank.maxTrophies === 999999 ? '∞' : rank.maxTrophies} trophies
                        {isCurrentRank && (
                          <span className="ml-2 text-blue-400 font-semibold">
                            (You: {playerData.trophies})
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-yellow-400 font-semibold text-sm">
                      💰 {reward}
                    </p>
                    <p className="text-gray-400 text-xs">Season Reward</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="bg-blue-600/20 backdrop-blur rounded-2xl p-5 border border-blue-600/50">
          <h3 className="text-lg font-bold mb-3">Trophy System</h3>
          <ul className="space-y-1.5 text-gray-300 text-sm">
            <li>• Win: +5 to +10 trophies (based on opponent rank)</li>
            <li>• Loss: -5 to -10 trophies (based on opponent rank)</li>
            <li>• Higher opponent rank = more trophies on win</li>
            <li>• Win Streak Bonus: +1 for 3+ wins, +2 for 10+ wins</li>
            <li>• Fast Win Bonus: +1 for wins in under 20 moves</li>
            <li>• Minimum per match: 5 trophies, Maximum: 10 trophies</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
