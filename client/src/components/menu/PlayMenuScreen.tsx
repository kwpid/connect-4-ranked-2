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
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-1 bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
            Play
          </h1>
          <p className="text-gray-400 text-sm">Choose your game mode</p>
        </div>
        
        <div className="space-y-3 mb-6">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onQueue}
              disabled={isRegistered}
              className={`h-32 ${isRegistered ? 'bg-gray-700 cursor-not-allowed' : 'bg-primary hover:bg-primary/90'} rounded-2xl text-lg font-bold transition-all shadow-xl flex flex-col items-center justify-center border ${isRegistered ? 'border-border' : 'border-blue-600/50'}`}
            >
              <span>{isRegistered ? 'Registered for Tournament' : 'Queue Ranked'}</span>
              {!isRegistered && (
                <div className="flex items-center gap-2 mt-2">
                  <img 
                    src={rankImagePath} 
                    alt={rank.name} 
                    className="w-7 h-7 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                  <span className="text-xs font-normal opacity-80">
                    <span style={{ color: tierColor }} className="font-bold">{rank.name}</span>
                    {' • '}
                    <span className="text-yellow-400 font-bold">🏆 {playerData.trophies}</span>
                  </span>
                </div>
              )}
            </button>
            
            <button
              onClick={onPractice}
              className="h-32 bg-primary hover:bg-primary/90 rounded-2xl text-lg font-bold transition-all shadow-xl border border-blue-600/50"
            >
              Practice
            </button>
          </div>
          
          {currentTournament && (
            <button
              onClick={onTournament}
              className="w-full py-5 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 rounded-2xl text-lg font-bold transition-all shadow-xl border border-yellow-500/50"
            >
              Tournament
              <span className="text-xs block mt-1 opacity-90">
                {currentTournament.status === 'registration' 
                  ? `Registration: ${getTimeUntilTournament(currentTime, nextTournamentTime)}`
                  : 'In Progress'}
              </span>
            </button>
          )}
        </div>
        
        <Button
          onClick={onBack}
          className="w-full"
          variant="secondary"
        >
          ← Back to Menu
        </Button>
      </div>
    </div>
  );
}
