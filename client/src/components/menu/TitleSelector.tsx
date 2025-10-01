import React, { useState } from 'react';
import { PlayerData, Title } from '../../types/game';
import { TitleDisplay } from '../common/TitleDisplay';

interface TitleSelectorProps {
  playerData: PlayerData;
  onEquip: (titleId: string | null) => void;
  onBack: () => void;
}

export function TitleSelector({ playerData, onEquip, onBack }: TitleSelectorProps) {
  const [selectedTitle, setSelectedTitle] = useState<string | null>(playerData.equippedTitle);
  
  // Get owned titles
  const ownedTitles: Title[] = playerData.ownedTitles.map(titleId => ({
    id: titleId,
    name: titleId.replace(/_/g, ' ').replace(/^./, str => str.toUpperCase()),
    type: 'grey',
    color: '#9CA3AF',
    glow: 'none'
  }));
  
  const handleEquip = () => {
    onEquip(selectedTitle);
  };
  
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
          <h2 className="text-3xl font-bold">Select Title</h2>
          <div className="w-20"></div>
        </div>
        
        {/* Current Title */}
        <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 mb-8 border border-gray-700">
          <p className="text-gray-400 text-sm mb-2">Currently Equipped</p>
          <TitleDisplay 
            title={playerData.equippedTitle ? {
              id: playerData.equippedTitle,
              name: playerData.equippedTitle,
              type: 'grey',
              color: '#9CA3AF',
              glow: 'none'
            } : null}
          />
        </div>
        
        {/* Title List */}
        <div className="space-y-3 mb-8">
          {/* No Title Option */}
          <div
            onClick={() => setSelectedTitle(null)}
            className={`p-4 rounded-lg cursor-pointer transition-all ${
              selectedTitle === null
                ? 'bg-blue-600 border-2 border-blue-400'
                : 'bg-gray-800/50 border-2 border-gray-700 hover:border-gray-600'
            }`}
          >
            <p className="text-gray-400">No Title Equipped</p>
          </div>
          
          {ownedTitles.map(title => (
            <div
              key={title.id}
              onClick={() => setSelectedTitle(title.id)}
              className={`p-4 rounded-lg cursor-pointer transition-all ${
                selectedTitle === title.id
                  ? 'bg-blue-600 border-2 border-blue-400'
                  : 'bg-gray-800/50 border-2 border-gray-700 hover:border-gray-600'
              }`}
            >
              <TitleDisplay title={title} />
            </div>
          ))}
          
          {ownedTitles.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No titles owned yet</p>
              <p className="text-gray-500 mt-2">Purchase titles from the shop or earn them through seasons</p>
            </div>
          )}
        </div>
        
        {/* Equip Button */}
        <button
          onClick={handleEquip}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
        >
          Equip Selected
        </button>
      </div>
    </div>
  );
}
