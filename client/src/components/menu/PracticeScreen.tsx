import React from 'react';
import { AIDifficulty } from '../../utils/aiPlayer';

interface PracticeScreenProps {
  onSelectDifficulty: (difficulty: AIDifficulty) => void;
  onBack: () => void;
}

export function PracticeScreen({ onSelectDifficulty, onBack }: PracticeScreenProps) {
  const difficulties: Array<{ level: AIDifficulty; name: string; description: string; color: string }> = [
    {
      level: 'noob',
      name: 'Noob',
      description: 'Perfect for beginners. AI makes basic mistakes.',
      color: 'from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
    },
    {
      level: 'average',
      name: 'Average',
      description: 'Balanced gameplay. AI plays strategically.',
      color: 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
    },
    {
      level: 'good',
      name: 'Good',
      description: 'Challenging opponent. AI rarely misses blocks.',
      color: 'from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800'
    },
    {
      level: 'professional',
      name: 'Professional',
      description: 'Expert level. AI plays near-perfectly.',
      color: 'from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center mb-8">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            ← Back
          </button>
          <div className="flex-1 text-center">
            <h1 className="text-4xl font-bold mb-2">Practice Mode</h1>
            <p className="text-gray-400">Choose your AI difficulty level</p>
          </div>
          <div className="w-24"></div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4 mb-8">
          <p className="text-blue-300 text-center">
            💡 Practice mode includes coaching hints to help you improve! No trophies on the line.
          </p>
        </div>

        {/* Difficulty Selection */}
        <div className="space-y-4">
          {difficulties.map(({ level, name, description, color }) => (
            <button
              key={level}
              onClick={() => onSelectDifficulty(level)}
              className={`w-full p-6 bg-gradient-to-r ${color} rounded-xl transition-all transform hover:scale-105 shadow-lg text-left`}
            >
              <h3 className="text-2xl font-bold mb-2">{name}</h3>
              <p className="text-gray-200">{description}</p>
            </button>
          ))}
        </div>

        {/* Tips */}
        <div className="mt-8 bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4">💡 Practice Tips</h3>
          <ul className="space-y-2 text-gray-300">
            <li>• Green column highlights show suggested moves</li>
            <li>• Pay attention to the coaching tips that appear</li>
            <li>• Try the console command <code className="bg-gray-900 px-2 py-1 rounded text-yellow-400">test.cheat()</code> to see the best move</li>
            <li>• Practice makes perfect! Use this mode to learn strategies</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
