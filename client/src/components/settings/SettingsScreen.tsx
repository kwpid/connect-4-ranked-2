import React, { useState, useEffect } from 'react';
import { PlayerData } from '../../types/game';
import { getNewsState, setAutoShowDisabled } from '../../utils/newsManager';
import { Button } from '../ui/button';

interface SettingsScreenProps {
  playerData: PlayerData;
  onUsernameChange: (newUsername: string) => void;
  onBack: () => void;
}

export function SettingsScreen({ playerData, onUsernameChange, onBack }: SettingsScreenProps) {
  const [username, setUsername] = useState(playerData.username);
  const [showConfirm, setShowConfirm] = useState(false);
  const [autoShowNews, setAutoShowNews] = useState(true);
  
  useEffect(() => {
    const newsState = getNewsState();
    setAutoShowNews(!newsState.autoShowDisabled);
  }, []);
  
  const handleSave = () => {
    if (username.trim() && username !== playerData.username) {
      onUsernameChange(username.trim());
      setShowConfirm(true);
      setTimeout(() => setShowConfirm(false), 2000);
    }
  };
  
  const handleAutoShowToggle = () => {
    const newValue = !autoShowNews;
    setAutoShowNews(newValue);
    setAutoShowDisabled(!newValue);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 text-white p-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <Button onClick={onBack} variant="secondary" size="sm">
            ← Back
          </Button>
          <h2 className="text-3xl font-bold">Settings</h2>
          <div className="w-20"></div>
        </div>
        
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-2xl p-5 shadow-xl">
            <h3 className="text-lg font-bold mb-4">Username</h3>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-input border border-border rounded-xl focus:border-primary focus:outline-none transition-colors mb-4 text-white"
              placeholder="Enter username"
              maxLength={20}
            />
            <Button
              onClick={handleSave}
              disabled={!username.trim() || username === playerData.username}
              className="w-full"
            >
              Save Changes
            </Button>
            
            {showConfirm && (
              <p className="text-green-400 text-center mt-2 text-sm">
                ✓ Username updated!
              </p>
            )}
          </div>
          
          <div className="bg-card border border-border rounded-2xl p-5 shadow-xl">
            <h3 className="text-lg font-bold mb-4">News Preferences</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-white text-sm">Auto-show News</p>
                <p className="text-xs text-gray-400">Display news popup when new updates are available</p>
              </div>
              <button
                onClick={handleAutoShowToggle}
                className={`relative w-14 h-7 rounded-full transition-colors ${
                  autoShowNews ? 'bg-primary' : 'bg-gray-600'
                }`}
              >
                <div
                  className={`absolute top-1 left-1 w-5 h-5 bg-white rounded-full transition-transform ${
                    autoShowNews ? 'translate-x-7' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-2xl p-5 shadow-xl">
            <h3 className="text-lg font-bold mb-4">About Connect Ranked</h3>
            <div className="space-y-1.5 text-gray-300 text-sm">
              <p>• Competitive Connect 4 with AI opponents</p>
              <p>• Trophy-based ranking system (Bronze to Connect Legend)</p>
              <p>• Weekly seasonal competitions and rewards</p>
              <p>• Earn exclusive titles, banners, and profile pictures</p>
              <p>• Climb the leaderboard and track your stats</p>
            </div>
          </div>
          
          <div className="bg-card border border-border rounded-2xl p-5 shadow-xl">
            <h3 className="text-lg font-bold mb-4">How to Play</h3>
            <div className="space-y-1.5 text-gray-300 text-sm">
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
    </div>
  );
}
