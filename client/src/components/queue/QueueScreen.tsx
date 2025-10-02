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
  const [dots, setDots] = useState('.');
  
  const rank = getRankByTrophies(playerData.trophies);
  const tierColor = getTierColor(rank.tier);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  useEffect(() => {
    const dotsTimer = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '.';
        return prev + '.';
      });
    }, 500);
    
    return () => clearInterval(dotsTimer);
  }, []);
  
  useEffect(() => {
    if (elapsed >= queueTime) {
      // Send notification if user is not viewing the tab
      if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('Connect Ranked', {
          body: 'Match found! Your game is ready.',
          icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🏆</text></svg>'
        });
      }
      onMatchFound();
    }
  }, [elapsed, queueTime, onMatchFound]);
  
  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="bg-gray-800/50 backdrop-blur rounded-xl p-8 border border-gray-700">
          {/* Searching Animation */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">
              Searching for opponent{dots}
            </h2>
            <p className="text-gray-400">{elapsed}s elapsed</p>
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
                  {playerData.trophies}
                </p>
              </div>
            </div>
          </div>
          
          {elapsed >= queueTime - 1 && (
            <div className="text-center mb-4 text-green-400 font-semibold animate-pulse">
              Match Found!
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
