import React from 'react';
import { getRankImagePath } from '../../utils/rankSystem';

interface SeasonRewardsProgressProps {
  currentTier: string;
  winsInTier: number;
  onClose: () => void;
}

export function SeasonRewardsProgress({
  currentTier,
  winsInTier,
  onClose
}: SeasonRewardsProgressProps) {
  const maxWins = 5;
  const isComplete = winsInTier >= maxWins;
  
  // Get rank image for the tier
  const getTierImagePath = (tier: string) => {
    const tierToRankMap: Record<string, string> = {
      'Bronze': 'Bronze III',
      'Silver': 'Silver III',
      'Gold': 'Gold III',
      'Platinum': 'Platinum III',
      'Diamond': 'Diamond III',
      'Champion': 'Champion III',
      'Grand Champion': 'Grand Champion III',
      'Connect Legend': 'Connect Legend',
    };
    return getRankImagePath(tierToRankMap[tier] || 'Bronze I');
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl max-w-md w-full border-2 border-blue-500 shadow-2xl shadow-blue-500/20">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-center text-blue-400">
            Season Reward Progress
          </h2>
        </div>

        {/* Content */}
        <div className="p-8 flex flex-col items-center gap-6">
          {/* Rank Image */}
          <div className="relative">
            <img
              src={getTierImagePath(currentTier)}
              alt={currentTier}
              className="w-24 h-24 object-contain"
              style={{ imageRendering: 'crisp-edges' }}
            />
          </div>

          {/* Tier Name */}
          <div className="text-center">
            <h3 className="text-xl font-bold text-white">{currentTier}</h3>
            <p className="text-sm text-gray-400 mt-1">
              {isComplete ? 'Reward Unlocked!' : 'Win 5 games to unlock reward'}
            </p>
          </div>

          {/* Progress Lines */}
          <div className="flex gap-2">
            {Array.from({ length: maxWins }).map((_, index) => (
              <div
                key={index}
                className={`w-12 h-2 rounded-full transition-all ${
                  index < winsInTier
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg shadow-blue-500/50'
                    : 'bg-gray-700'
                }`}
              />
            ))}
          </div>

          {/* Win Counter */}
          <div className="text-center">
            <p className="text-3xl font-bold text-white">
              {Math.min(winsInTier, maxWins)}/{maxWins}
            </p>
            <p className="text-sm text-gray-400 mt-1">Wins</p>
          </div>

          {isComplete && (
            <div className="bg-green-600/20 border border-green-500 rounded-lg p-4 w-full">
              <p className="text-green-400 text-center font-semibold">
                ✓ You will receive this tier's reward at season end!
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 bg-gray-900/50">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-semibold text-white"
          >
            CONTINUE
          </button>
        </div>
      </div>
    </div>
  );
}
