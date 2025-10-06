import React, { useState } from 'react';
import { PlayerData } from '../../types/game';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface MobileTestingPanelProps {
  playerData: PlayerData;
  onUpdate: (updates: { trophies?: number; wins?: number; losses?: number }) => void;
  onClose: () => void;
}

export function MobileTestingPanel({ playerData, onUpdate, onClose }: MobileTestingPanelProps) {
  const [trophies, setTrophies] = useState(playerData.trophies.toString());
  const [wins, setWins] = useState(playerData.wins.toString());
  const [losses, setLosses] = useState(playerData.losses.toString());
  const [isMinimized, setIsMinimized] = useState(false);

  const handleApply = () => {
    const updates: { trophies?: number; wins?: number; losses?: number } = {};
    
    const trophyNum = parseInt(trophies);
    if (!isNaN(trophyNum) && trophyNum >= 0) {
      updates.trophies = trophyNum;
    }
    
    const winsNum = parseInt(wins);
    if (!isNaN(winsNum) && winsNum >= 0) {
      updates.wins = winsNum;
    }
    
    const lossesNum = parseInt(losses);
    if (!isNaN(lossesNum) && lossesNum >= 0) {
      updates.losses = lossesNum;
    }
    
    onUpdate(updates);
  };

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsMinimized(false)}
          className="bg-purple-600 hover:bg-purple-700 shadow-lg"
        >
          🔧 Testing Panel
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-gray-900 border-2 border-purple-500 rounded-lg shadow-2xl p-4 w-80">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-bold text-purple-400">🔧 Mobile Testing</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setIsMinimized(true)}
            className="text-gray-400 hover:text-white text-sm px-2"
          >
            −
          </button>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-sm px-2"
          >
            ✕
          </button>
        </div>
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="text-xs text-gray-400 block mb-1">Trophies</label>
          <Input
            type="number"
            value={trophies}
            onChange={(e) => setTrophies(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white"
            placeholder="Enter trophies"
          />
        </div>
        
        <div>
          <label className="text-xs text-gray-400 block mb-1">Wins</label>
          <Input
            type="number"
            value={wins}
            onChange={(e) => setWins(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white"
            placeholder="Enter wins"
          />
        </div>
        
        <div>
          <label className="text-xs text-gray-400 block mb-1">Losses</label>
          <Input
            type="number"
            value={losses}
            onChange={(e) => setLosses(e.target.value)}
            className="bg-gray-800 border-gray-700 text-white"
            placeholder="Enter losses"
          />
        </div>
        
        <Button
          onClick={handleApply}
          className="w-full bg-purple-600 hover:bg-purple-700"
        >
          Apply Changes
        </Button>
        
        <div className="text-xs text-gray-500 text-center pt-2 border-t border-gray-700">
          For testing only - can be disabled
        </div>
      </div>
    </div>
  );
}
