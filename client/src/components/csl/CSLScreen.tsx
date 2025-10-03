import React, { useState } from 'react';
import { PlayerData } from '../../types/game';

interface CSLScreenProps {
  playerData: PlayerData;
  onBack: () => void;
}

export function CSLScreen({ playerData, onBack }: CSLScreenProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'earnings'>('overview');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <button
            onClick={onBack}
            className="mb-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            ← Back
          </button>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
            Connect Series League
          </h1>
          <p className="text-gray-400 mt-2">Compete in exclusive CSL tournaments</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'overview'
                ? 'bg-cyan-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('earnings')}
            className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
              activeTab === 'earnings'
                ? 'bg-cyan-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Career Earnings
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* RP Display */}
            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-8 border border-cyan-500/30">
              <div className="text-center">
                <p className="text-gray-400 text-sm mb-2">Your RP Balance</p>
                <p className="text-5xl font-bold text-cyan-400">⚡ {playerData.rp}</p>
                <p className="text-gray-500 text-sm mt-2">Ranked Points</p>
              </div>
            </div>

            {/* Upcoming Tournaments */}
            <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
              <h2 className="text-2xl font-bold mb-4 text-cyan-400">Upcoming CSL Tournaments</h2>
              <div className="text-center py-12">
                <p className="text-gray-400 text-lg">Coming Soon</p>
                <p className="text-gray-500 text-sm mt-2">CSL tournaments will be available in future updates</p>
              </div>
            </div>
          </div>
        )}

        {/* Career Earnings Tab */}
        {activeTab === 'earnings' && (
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 border border-gray-700">
            <h2 className="text-2xl font-bold mb-4 text-cyan-400">Career Earnings</h2>
            <div className="space-y-4">
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Total RP Earned</span>
                  <span className="text-xl font-bold text-cyan-400">⚡ {playerData.rp}</span>
                </div>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">CSL Tournaments Won</span>
                  <span className="text-xl font-bold text-yellow-400">0</span>
                </div>
              </div>
              <div className="bg-gray-700/50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Total CSL Matches</span>
                  <span className="text-xl font-bold text-purple-400">0</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
