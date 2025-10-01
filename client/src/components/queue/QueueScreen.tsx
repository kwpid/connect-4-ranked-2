import React, { useState, useEffect } from 'react';
import { PlayerData } from '../../types/game';
import { getRankByTrophies, getTierColor } from '../../utils/rankSystem';
import { calculateQueueTime } from '../../utils/queueSystem';

interface QueueScreenProps {
  playerData: PlayerData;
  onMatchFound: () => void;
  onCancel: () => void;
}

export function QueueScreen({ playerData, onMatchFound, onCancel }: QueueScreenProps) {
  const [queueTime, setQueueTime] = useState(calculateQueueTime(playerData.trophies));
  const [elapsed, setElapsed] = useState(0);
  const [estimatedTime, setEstimatedTime] = useState(queueTime);
  
  const rank = getRankByTrophies(playerData.trophies);
  const tierColor = getTierColor(rank.tier);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(prev => {
        const newElapsed = prev + 1;
        
        // Occasionally update estimated time
        if (newElapsed % 3 === 0 && Math.random() > 0.5) {
          const variance = Math.floor(Math.random() * 3) - 1;
          setEstimatedTime(Math.max(1, queueTime + variance));
        }
        
        if (newElapsed >= queueTime) {
          onMatchFound();
          return newElapsed;
        }
        
        return newElapsed;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [queueTime]);
  
  const progress = Math.min((elapsed / queueTime) * 100, 100);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="bg-gray-800/50 backdrop-blur rounded-xl p-8 border border-gray-700">
          {/* Searching Animation */}
          <div className="text-center mb-8">
            <div className="inline-block animate-pulse">
              <div className="text-6xl mb-4">🎮</div>
            </div>
            <h2 className="text-3xl font-bold mb-2">Finding Match...</h2>
            <p className="text-gray-400">Please wait</p>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-6">
            <div className="bg-gray-700 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-center mt-2 text-sm text-gray-400">
              Estimated: {estimatedTime}s
            </p>
          </div>
          
          {/* Player Info */}
          <div className="bg-gray-900/50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-gray-400 text-sm">Your Rank</p>
                <p className="font-bold text-lg" style={{ color: tierColor }}>
                  {rank.name}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-sm">Trophies</p>
                <p className="font-bold text-lg text-yellow-400">
                  🏆 {playerData.trophies}
                </p>
              </div>
            </div>
          </div>
          
          {elapsed >= queueTime - 1 && (
            <div className="text-center mb-4 text-green-400 font-semibold animate-pulse">
              ✓ Match Found!
            </div>
          )}
          
          {/* Cancel Button */}
          <button
            onClick={onCancel}
            className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-lg font-semibold transition-colors"
          >
            Cancel Queue
          </button>
        </div>
      </div>
    </div>
  );
}
