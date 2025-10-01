import React from 'react';
import { RANKS, getTierColor, getSeasonRewardCoins } from '../../utils/rankSystem';

interface RankInfoProps {
  onBack: () => void;
}

export function RankInfo({ onBack }: RankInfoProps) {
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
            
            return (
              <div
                key={index}
                className="bg-gray-800/50 backdrop-blur rounded-xl p-4 border border-gray-700"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold" style={{ color: tierColor }}>
                      {rank.name}
                    </h3>
                    <p className="text-gray-400 text-sm">
                      {rank.minTrophies} - {rank.maxTrophies === 999999 ? '∞' : rank.maxTrophies} trophies
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
            <li>• Win: +1 trophy (+ bonus based on win streak)</li>
            <li>• Loss: -1 trophy</li>
            <li>• Win Streak Bonus: +1 extra per 5-win block</li>
            <li>• Example: 5 wins in a row = +1 extra on 5th win</li>
            <li>• Example: 10 wins in a row = +2 extra on 10th win</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
