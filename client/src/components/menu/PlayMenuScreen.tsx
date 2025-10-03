import React, { useState, useEffect } from 'react';
import { PlayerData, TournamentData } from '../../types/game';
import { getRankByTrophies, getTierColor } from '../../utils/rankSystem';
import { getTimeUntilTournament } from '../../utils/tournamentManager';

interface PlayMenuScreenProps {
  playerData: PlayerData;
  onQueue: () => void;
  onPractice: () => void;
  onTournament: () => void;
  onBack: () => void;
  currentTournament: TournamentData | null;
  nextTournamentTime: number;
  isRegistered: boolean;
}

export function PlayMenuScreen({
  playerData,
  onQueue,
  onPractice,
  onTournament,
  onBack,
  currentTournament,
  nextTournamentTime,
  isRegistered
}: PlayMenuScreenProps) {
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
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            Play
          </h1>
          <p className="text-gray-400">Choose your game mode</p>
        </div>
        
        <div className="space-y-4 mb-8">
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={onQueue}
              disabled={isRegistered}
              className={`w-full h-32 ${isRegistered ? 'bg-gray-600 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'} rounded-xl text-xl font-bold transition-all transform hover:scale-105 shadow-lg flex flex-col items-center justify-center`}
            >
              <span>{isRegistered ? 'Registered for Tournament' : 'Queue Ranked'}</span>
              {!isRegistered && (
                <span className="text-sm font-normal mt-2 opacity-80">
                  <span style={{ color: tierColor }} className="font-bold">{rank.name}</span>
                  {' • '}
                  <span className="text-yellow-400 font-bold">🏆 {playerData.trophies}</span>
                </span>
              )}
            </button>
            
            <button
              onClick={onPractice}
              className="w-full h-32 bg-green-600 hover:bg-green-700 rounded-xl text-xl font-bold transition-all transform hover:scale-105 shadow-lg"
            >
              Practice
            </button>
          </div>
          
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
        </div>
        
        <button
          onClick={onBack}
          className="w-full py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors font-semibold"
        >
          ← Back to Menu
        </button>
      </div>
    </div>
  );
}
