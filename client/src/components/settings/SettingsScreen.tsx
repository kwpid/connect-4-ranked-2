import React, { useState } from 'react';
import { PlayerData } from '../../types/game';

interface SettingsScreenProps {
  playerData: PlayerData;
  onUsernameChange: (newUsername: string) => void;
  onBack: () => void;
}

export function SettingsScreen({ playerData, onUsernameChange, onBack }: SettingsScreenProps) {
  const [username, setUsername] = useState(playerData.username);
  const [showConfirm, setShowConfirm] = useState(false);
  
  const handleSave = () => {
    if (username.trim() && username !== playerData.username) {
      onUsernameChange(username.trim());
      setShowConfirm(true);
      setTimeout(() => setShowConfirm(false), 2000);
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            ← Back
          </button>
          <h2 className="text-3xl font-bold">Settings</h2>
          <div className="w-20"></div>
        </div>
        
        {/* Username */}
        <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700 mb-6">
          <h3 className="text-xl font-bold mb-4">Username</h3>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 bg-gray-700 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none transition-colors mb-4"
            placeholder="Enter username"
            maxLength={20}
          />
          <button
            onClick={handleSave}
            disabled={!username.trim() || username === playerData.username}
            className={`w-full py-2 rounded-lg transition-colors ${
              username.trim() && username !== playerData.username
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-600 cursor-not-allowed'
            }`}
          >
            Save Changes
          </button>
          
          {showConfirm && (
            <p className="text-green-400 text-center mt-2 animate-pulse">
              ✓ Username updated!
            </p>
          )}
        </div>
        
        {/* Game Info */}
        <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700 mb-6">
          <h3 className="text-xl font-bold mb-4">About Connect Ranked</h3>
          <div className="space-y-2 text-gray-300">
            <p>• Competitive Connect 4 with ranked matchmaking</p>
            <p>• Trophy-based ranking system</p>
            <p>• 2-week seasonal competitions</p>
            <p>• Earn titles and rewards</p>
          </div>
        </div>
        
        {/* Controls */}
        <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-bold mb-4">How to Play</h3>
          <div className="space-y-2 text-gray-300">
            <p>• Click a column to drop your piece (blue)</p>
            <p>• Connect 4 pieces in a row to win</p>
            <p>• Best of 3 matches in ranked</p>
            <p>• 15 seconds per turn</p>
            <p>• Win to gain trophies, lose to lose trophies</p>
            <p>• Win streaks give bonus trophies!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
