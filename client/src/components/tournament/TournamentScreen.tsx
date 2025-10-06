import React, { useState, useEffect } from 'react';
import { TournamentData, PlayerData, TournamentMatch } from '../../types/game';
import { getTimeUntilTournament, simulateAIMatch, advanceTournamentRound } from '../../utils/tournamentManager';
import { getRankByTrophies, getTierColor } from '../../utils/rankSystem';
import { Button } from '../ui/button';

interface TournamentScreenProps {
  tournament: TournamentData;
  playerData: PlayerData;
  isRegistered: boolean;
  onRegister: () => void;
  onUnregister: () => void;
  onPlayMatch: (match: TournamentMatch) => void;
  onBack: () => void;
}

export function TournamentScreen({
  tournament,
  playerData,
  isRegistered,
  onRegister,
  onUnregister,
  onPlayMatch,
  onBack
}: TournamentScreenProps) {
  const [currentTime, setCurrentTime] = useState(Date.now());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(Date.now());
    }, 100);
    
    return () => clearInterval(timer);
  }, []);
  
  const timeUntil = getTimeUntilTournament(currentTime, tournament.startTime);
  const rank = getRankByTrophies(playerData.trophies);
  const tierColor = getTierColor(rank.tier);
  
  // Find player's current match in the bracket
  const findPlayerMatch = (): TournamentMatch | null => {
    if (!tournament.bracket) return null;
    
    const allMatches = [
      ...tournament.bracket.round1,
      ...tournament.bracket.round2,
      ...tournament.bracket.round3,
      ...tournament.bracket.finals
    ];
    
    for (const match of allMatches) {
      if (!match.winner && (match.participant1.isPlayer || match.participant2.isPlayer)) {
        return match;
      }
    }
    
    return null;
  };
  
  const playerMatch = findPlayerMatch();
  
  // Check if player is eliminated
  const isEliminated = tournament.status === 'in_progress' && 
    tournament.participants.some(p => p.isPlayer) && 
    !playerMatch &&
    tournament.playerPlacement !== null;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 text-white p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <Button 
          onClick={onBack}
          variant="secondary"
          size="sm"
          className="mb-6"
        >
          ← Back to Menu
        </Button>
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-yellow-400 to-orange-600 bg-clip-text text-transparent">
            Tournament
          </h1>
          {tournament.status === 'registration' && (
            <p className="text-gray-400">Registration closes in: {timeUntil}</p>
          )}
        </div>
        
        {/* Prize Pool */}
        <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 mb-6 border border-gray-700">
          <h2 className="text-xl font-bold mb-4 text-center">Prize Pool</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-yellow-600/20 rounded-lg border border-yellow-600/50">
              <div className="text-3xl mb-2">🥇</div>
              <div className="text-lg font-bold text-yellow-400">1st Place</div>
              <div className="text-sm text-gray-300">10,000 💰</div>
              <div className="text-xs text-gray-400 mt-1">+ Title</div>
            </div>
            <div className="text-center p-4 bg-gray-600/20 rounded-lg border border-gray-500/50">
              <div className="text-3xl mb-2">🥈</div>
              <div className="text-lg font-bold text-gray-300">Top 4</div>
              <div className="text-sm text-gray-300">5,000 💰</div>
            </div>
            <div className="text-center p-4 bg-orange-600/20 rounded-lg border border-orange-600/50">
              <div className="text-3xl mb-2">🥉</div>
              <div className="text-lg font-bold text-orange-400">Top 8</div>
              <div className="text-sm text-gray-300">2,500 💰</div>
            </div>
          </div>
        </div>
        
        {/* Tournament Status */}
        {tournament.status === 'registration' && (
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 mb-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4">Tournament Info</h2>
            <div className="space-y-2 text-gray-300">
              <p>• 16 participants compete in single-elimination bracket</p>
              <p>• Rounds 1-3: Best of 3</p>
              <p>• Finals: Best of 5</p>
              <p>• One loss eliminates you from the tournament</p>
              <p>• Cannot play regular matches while registered</p>
            </div>
            
            {!isRegistered ? (
              <button
                onClick={onRegister}
                className="w-full mt-6 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-xl text-xl font-bold transition-all transform hover:scale-105 shadow-lg"
              >
                Register for Tournament
              </button>
            ) : (
              <div className="mt-6">
                <div className="text-center mb-4">
                  <p className="text-green-400 font-bold text-lg">✓ You are registered!</p>
                  <p className="text-gray-400 text-sm">Tournament starts in {timeUntil}</p>
                </div>
                <button
                  onClick={onUnregister}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-lg transition-colors font-semibold"
                >
                  Leave Registration
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* Active Tournament */}
        {tournament.status === 'in_progress' && (
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 mb-6 border border-gray-700">
            {isEliminated ? (
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">Tournament Ended</h2>
                <div className="bg-gray-900/50 rounded-lg p-6 mb-4">
                  <p className="text-3xl mb-2">
                    {tournament.playerPlacement === 1 ? '🥇' : 
                     tournament.playerPlacement! <= 4 ? '🥈' : 
                     tournament.playerPlacement! <= 8 ? '🥉' : ''}
                  </p>
                  <p className="text-xl font-bold mb-2">
                    {tournament.playerPlacement === 1 ? '1st Place!' :
                     tournament.playerPlacement === 2 ? '2nd Place' :
                     `${tournament.playerPlacement}th Place`}
                  </p>
                  {tournament.playerReward > 0 && (
                    <p className="text-yellow-400 font-bold">
                      +{tournament.playerReward.toLocaleString()} Coins
                    </p>
                  )}
                </div>
                <button
                  onClick={onBack}
                  className="px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors font-semibold"
                >
                  Return to Menu
                </button>
              </div>
            ) : playerMatch ? (
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-4">
                  Round {playerMatch.round} - Match Ready
                </h2>
                <p className="text-gray-400 mb-6">Best of {playerMatch.bestOf}</p>
                
                <div className="bg-gray-900/50 rounded-lg p-6 mb-6">
                  <div className="flex items-center justify-between">
                    <div className="text-center flex-1">
                      <p className="font-bold text-xl" style={{ color: tierColor }}>
                        {playerMatch.participant1.isPlayer ? 'You' : playerMatch.participant1.username}
                      </p>
                    </div>
                    
                    <div className="text-3xl mx-6">VS</div>
                    
                    <div className="text-center flex-1">
                      <p className="font-bold text-xl" style={{ color: tierColor }}>
                        {playerMatch.participant2.isPlayer ? 'You' : playerMatch.participant2.username}
                      </p>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => onPlayMatch(playerMatch)}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl text-xl font-bold transition-all transform hover:scale-105 shadow-lg"
                >
                  Play Match
                </button>
              </div>
            ) : (
              <div className="text-center">
                <h2 className="text-xl font-bold mb-4">Waiting for other matches...</h2>
                <p className="text-gray-400">Your next match will be ready soon</p>
              </div>
            )}
          </div>
        )}
        
        {/* Bracket Display */}
        {tournament.bracket && (
          <div className="bg-gray-800/50 backdrop-blur rounded-xl p-6 mb-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4">Tournament Bracket</h2>
            <div className="space-y-4">
              {/* Round 1 */}
              {tournament.bracket.round1.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">Round 1</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {tournament.bracket.round1.slice(0, 4).map(match => (
                      <MatchResult key={match.id} match={match} />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Round 2 */}
              {tournament.bracket.round2.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">Quarter Finals</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {tournament.bracket.round2.map(match => (
                      <MatchResult key={match.id} match={match} />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Round 3 */}
              {tournament.bracket.round3.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">Semi Finals</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {tournament.bracket.round3.map(match => (
                      <MatchResult key={match.id} match={match} />
                    ))}
                  </div>
                </div>
              )}
              
              {/* Finals */}
              {tournament.bracket.finals.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-400 mb-2">Finals (Best of 5)</h3>
                  {tournament.bracket.finals.map(match => (
                    <MatchResult key={match.id} match={match} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Back Button */}
        {tournament.status === 'registration' && !isRegistered && (
          <button
            onClick={onBack}
            className="w-full py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors font-semibold"
          >
            Back to Menu
          </button>
        )}
      </div>
    </div>
  );
}

function MatchResult({ match }: { match: TournamentMatch }) {
  return (
    <div className="bg-gray-900/50 rounded-lg p-2 text-sm">
      <div className="flex justify-between items-center">
        <span className={match.winner?.id === match.participant1.id ? 'font-bold text-green-400' : 'text-gray-400'}>
          {match.participant1.isPlayer ? 'You' : match.participant1.username}
        </span>
        {match.winner && (
          <span className="text-xs">
            {match.winner.id === match.participant1.id ? '✓' : ''}
          </span>
        )}
      </div>
      <div className="flex justify-between items-center mt-1">
        <span className={match.winner?.id === match.participant2.id ? 'font-bold text-green-400' : 'text-gray-400'}>
          {match.participant2.isPlayer ? 'You' : match.participant2.username}
        </span>
        {match.winner && (
          <span className="text-xs">
            {match.winner.id === match.participant2.id ? '✓' : ''}
          </span>
        )}
      </div>
    </div>
  );
}
