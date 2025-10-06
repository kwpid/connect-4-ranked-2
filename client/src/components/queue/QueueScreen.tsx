import React, { useState, useEffect } from 'react';
import { PlayerData } from '../../types/game';
import { getRankByTrophies, getTierColor } from '../../utils/rankSystem';
import { calculateQueueTime } from '../../utils/queueSystem';
import { Button } from '../ui/button';

interface QueueScreenProps {
  playerData: PlayerData;
  onMatchFound: () => void;
  onCancel: () => void;
}

export function QueueScreen({ playerData, onMatchFound, onCancel }: QueueScreenProps) {
  const estimatedTime = calculateQueueTime(playerData.trophies);
  const [actualMatchTime] = useState(() => {
    const base = estimatedTime;
    const variance = Math.max(1, Math.floor(base * 0.15));
    
    const offset = Math.random() < 0.5 
      ? -Math.floor(Math.random() * variance + 1)
      : Math.floor(Math.random() * variance + 1);
    let actual = Math.max(1, base + offset);
    
    if (actual === estimatedTime) {
      actual = estimatedTime + 1;
    }
    
    return actual;
  });
  const [elapsed, setElapsed] = useState(0);
  const [dots, setDots] = useState('.');
  const [matchFound, setMatchFound] = useState(false);
  const [waitingForPlayers, setWaitingForPlayers] = useState(false);
  
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
    if (elapsed >= actualMatchTime && !matchFound) {
      setMatchFound(true);
      if (document.hidden && 'Notification' in window && Notification.permission === 'granted') {
        new Notification('Connect Ranked', {
          body: 'Match found! Your game is ready.',
          icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🏆</text></svg>'
        });
      }
      
      setTimeout(() => {
        setWaitingForPlayers(true);
        setTimeout(() => {
          onMatchFound();
        }, 1000 + Math.random() * 1000);
      }, 800);
    }
  }, [elapsed, actualMatchTime, matchFound, onMatchFound]);
  
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 text-white p-6 flex items-center justify-center">
      <div className="max-w-md w-full">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
          <div className="text-center mb-8">
            <h2 className={`text-3xl font-bold mb-3 ${matchFound || waitingForPlayers ? 'text-green-400 animate-pulse' : ''}`}>
              {waitingForPlayers ? 'Waiting for Players...' : matchFound ? 'Match Found!' : `Searching for opponent${dots}`}
            </h2>
            {!matchFound && (
              <div className="space-y-3">
                <div className="flex justify-between items-center px-4">
                  <span className="text-gray-400 text-sm">Time Elapsed</span>
                  <span className="text-blue-400 font-bold">{formatTime(elapsed)}</span>
                </div>
                <div className="flex justify-between items-center px-4">
                  <span className="text-gray-400 text-sm">Est. Time</span>
                  <span className="text-gray-400 font-bold">{formatTime(estimatedTime)}</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-background border border-border rounded-xl p-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-gray-400 text-xs mb-1">Your Rank</p>
                <p className="font-bold text-sm" style={{ color: tierColor }}>
                  {rank.name}
                </p>
              </div>
              <div className="text-center">
                <p className="text-gray-400 text-xs mb-1">Trophies</p>
                <p className="font-bold text-sm text-yellow-400">
                  🏆 {playerData.trophies}
                </p>
              </div>
            </div>
          </div>
          
          <Button
            onClick={onCancel}
            className="w-full"
            variant="destructive"
          >
            Cancel Queue
          </Button>
        </div>
      </div>
    </div>
  );
}
