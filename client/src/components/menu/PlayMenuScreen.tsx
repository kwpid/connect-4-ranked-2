import React, { useState, useEffect } from 'react';
import { PlayerData, TournamentData } from '../../types/game';
import { getRankByTrophies, getTierColor, getRankImagePath } from '../../utils/rankSystem';
import { getTimeUntilTournament } from '../../utils/tournamentManager';
import { Button } from '../ui/button';

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
  const rankImagePath = getRankImagePath(rank.name);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 text-white p-6">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-6xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Play
          </h1>
          <p className="text-gray-400">Choose your game mode</p>
        </div>
        
        <div className="space-y-4 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={onQueue}
              disabled={isRegistered}
              className={`relative overflow-hidden ${isRegistered ? 'bg-gray-800 cursor-not-allowed' : 'bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700'} rounded-2xl p-8 transition-all duration-300 ease-in-out shadow-2xl hover:shadow-blue-500/30 transform hover:scale-[1.02] border-2 ${isRegistered ? 'border-gray-700' : 'border-blue-500/40'}`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-transparent"></div>
              <div className="relative flex flex-col items-center gap-4">
                <div className="text-2xl font-bold">{isRegistered ? 'Registered for Tournament' : 'Queue Ranked'}</div>
                {!isRegistered && (
                  <div className="flex items-center gap-3 bg-black/30 backdrop-blur px-6 py-3 rounded-xl">
                    <img 
                      src={rankImagePath} 
                      alt={rank.name} 
                      className="w-10 h-10 object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <div className="text-left">
                      <div style={{ color: tierColor }} className="font-bold text-lg">{rank.name}</div>
                      <div className="text-yellow-400 font-bold text-sm">🏆 {playerData.trophies} Trophies</div>
                    </div>
                  </div>
                )}
              </div>
            </button>
            
            <button
              onClick={onPractice}
              className="relative overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 rounded-2xl p-8 transition-all duration-300 ease-in-out shadow-2xl hover:shadow-blue-500/30 transform hover:scale-[1.02] border-2 border-blue-500/40"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-transparent"></div>
              <div className="relative flex flex-col items-center gap-3">
                <div className="text-4xl">🎯</div>
                <div className="text-2xl font-bold">Practice</div>
                <div className="text-sm text-blue-200 opacity-80">Sharpen your skills</div>
              </div>
            </button>
          </div>
          
          {currentTournament && (
            <button
              onClick={onTournament}
              className="relative w-full overflow-hidden bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 rounded-2xl p-8 transition-all duration-300 ease-in-out shadow-2xl hover:shadow-blue-500/30 transform hover:scale-[1.02] border-2 border-blue-500/40"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-transparent"></div>
              <div className="relative flex flex-col md:flex-row items-center justify-center gap-4">
                <div className="text-4xl">🏆</div>
                <div className="text-center md:text-left">
                  <div className="text-2xl font-bold">Tournament</div>
                  <div className="text-sm opacity-90 mt-1">
                    {currentTournament.status === 'registration' 
                      ? `Registration: ${getTimeUntilTournament(currentTime, nextTournamentTime)}`
                      : 'In Progress'}
                  </div>
                </div>
              </div>
            </button>
          )}
        </div>
        
        <Button
          onClick={onBack}
          className="w-full py-6 text-lg"
          variant="secondary"
        >
          ← Back to Menu
        </Button>
      </div>
    </div>
  );
}
