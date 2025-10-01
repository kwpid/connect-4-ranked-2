import React, { useState, useEffect } from 'react';
import { MatchState, PlayerData, GameResult } from '../../types/game';
import { createEmptyBoard, dropPiece, checkWinner } from '../../utils/gameLogic';
import { AIPlayer } from '../../utils/aiPlayer';
import { Connect4Board } from './Connect4Board';
import { calculateTrophyChange } from '../../utils/rankSystem';

interface GameScreenProps {
  playerData: PlayerData;
  onMatchEnd: (won: boolean, trophyChange: number) => void;
  onBack: () => void;
}

export function GameScreen({ playerData, onMatchEnd, onBack }: GameScreenProps) {
  // Generate opponent username and trophies based on player's trophy range
  const generateOpponent = () => {
    const names = [
      'ProGamer', 'ChessMaster', 'ConnectKing', 'StrategyPro', 'TrophyHunter',
      'RankClimber', 'ElitePlayer', 'SkillMaster', 'TopTier', 'Challenger',
      'Dominator', 'Victory', 'Champion', 'Legend', 'Immortal', 'Divine',
      'Mythic', 'Supreme', 'Ultimate', 'Omega', 'Alpha', 'Sigma', 'Delta',
      'Phoenix', 'Dragon', 'Tiger', 'Eagle', 'Wolf', 'Bear', 'Lion',
      'Shadow', 'Ghost', 'Phantom', 'Ninja', 'Samurai', 'Warrior', 'Knight'
    ];
    const baseName = names[Math.floor(Math.random() * names.length)];
    const name = `${baseName}${Math.floor(Math.random() * 9999)}`;
    
    // Generate opponent trophies around player's level
    const variance = Math.floor(Math.random() * 60) - 30; // -30 to +30 trophies
    const trophies = Math.max(0, playerData.trophies + variance);
    
    return { name, trophies };
  };
  
  const [opponent] = useState(generateOpponent());
  const [match, setMatch] = useState<MatchState>({
    currentGame: 1,
    playerWins: 0,
    aiWins: 0,
    board: createEmptyBoard(),
    currentPlayer: 'player',
    winner: null,
    matchWinner: null
  });
  const [timeLeft, setTimeLeft] = useState(15);
  const [aiPlayer] = useState(new AIPlayer(opponent.trophies));
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [totalMoves, setTotalMoves] = useState(0);
  
  // Timer
  useEffect(() => {
    if (match.winner || match.matchWinner) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          // Time's up - random move
          handleTimeOut();
          return 15;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [match.currentPlayer, match.winner, match.matchWinner]);
  
  // AI move
  useEffect(() => {
    if (match.currentPlayer === 'ai' && !match.winner && !match.matchWinner && !isAiThinking) {
      setIsAiThinking(true);
      aiPlayer.makeMove(match.board).then(column => {
        if (column !== -1) {
          handleMove(column, 'ai');
        }
        setIsAiThinking(false);
      });
    }
  }, [match.currentPlayer, match.winner, match.matchWinner]);
  
  const handleTimeOut = () => {
    // Make random move for current player
    const availableCols = [];
    for (let col = 0; col < 7; col++) {
      if (match.board.cells[0][col] === 'empty') {
        availableCols.push(col);
      }
    }
    if (availableCols.length > 0) {
      const randomCol = availableCols[Math.floor(Math.random() * availableCols.length)];
      handleMove(randomCol, match.currentPlayer);
    }
  };
  
  const handleMove = (column: number, player: 'player' | 'ai') => {
    setTotalMoves(prev => prev + 1);
    setMatch(prevMatch => {
      const newBoard = dropPiece(prevMatch.board, column, player);
      if (!newBoard) return prevMatch;
      
      const winner = checkWinner(newBoard);
      setTimeLeft(15);
      
      if (winner) {
        // Game over
        const newPlayerWins = prevMatch.playerWins + (winner === 'player' ? 1 : 0);
        const newAiWins = prevMatch.aiWins + (winner === 'ai' ? 1 : 0);
        
        // Check if match is over (best of 3)
        if (newPlayerWins === 2 || newAiWins === 2) {
          return {
            ...prevMatch,
            board: newBoard,
            winner,
            playerWins: newPlayerWins,
            aiWins: newAiWins,
            matchWinner: newPlayerWins === 2 ? 'player' : 'ai'
          };
        } else {
          // Next game - reset move counter
          setTimeout(() => {
            setTotalMoves(0);
            setMatch(prev => ({
              ...prev,
              currentGame: prev.currentGame + 1,
              board: createEmptyBoard(),
              currentPlayer: 'player',
              winner: null,
              playerWins: newPlayerWins,
              aiWins: newAiWins
            }));
          }, 2000);
          return {
            ...prevMatch,
            board: newBoard,
            winner,
            playerWins: newPlayerWins,
            aiWins: newAiWins
          };
        }
      } else {
        return {
          ...prevMatch,
          board: newBoard,
          currentPlayer: player === 'player' ? 'ai' : 'player'
        };
      }
    });
  };
  
  const handleColumnClick = (column: number) => {
    if (match.currentPlayer === 'player' && !match.winner && !match.matchWinner) {
      handleMove(column, 'player');
    }
  };
  
  const handleEndMatch = () => {
    if (match.matchWinner) {
      const won = match.matchWinner === 'player';
      const trophyChange = calculateNewTrophyChange(
        won, 
        playerData.trophies, 
        opponent.trophies, 
        playerData.winStreak,
        totalMoves
      );
      onMatchEnd(won, trophyChange);
    }
  };
  
  // New trophy calculation system
  const calculateNewTrophyChange = (
    won: boolean, 
    playerTrophies: number, 
    opponentTrophies: number, 
    winStreak: number,
    moves: number
  ): number => {
    if (won) {
      // Base trophy reward based on opponent comparison
      let baseTrophies = 2; // Default for lower-ranked opponent
      
      const trophyDiff = opponentTrophies - playerTrophies;
      
      if (trophyDiff >= 30) {
        baseTrophies = 5; // Much higher rank (underdog victory)
      } else if (trophyDiff >= 10) {
        baseTrophies = 4; // Slightly higher rank
      } else if (trophyDiff >= -10) {
        baseTrophies = 3; // Equal rank
      }
      
      // Win streak bonus: +1 if 3+ wins in a row
      const streakBonus = winStreak >= 3 ? 1 : 0;
      
      // Fast win bonus: +1 if won in under 20 moves
      const fastWinBonus = moves < 20 ? 1 : 0;
      
      return baseTrophies + streakBonus + fastWinBonus;
    } else {
      // Loss penalties based on opponent rank
      const trophyDiff = opponentTrophies - playerTrophies;
      
      if (trophyDiff <= -30) {
        return -4; // Lost to much lower rank (hurts more)
      } else if (trophyDiff <= -10) {
        return -3; // Lost to lower rank
      } else {
        return -2; // Lost to equal or higher rank
      }
    }
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
          >
            ← Back
          </button>
          <div className="text-center">
            <h2 className="text-2xl font-bold">Game {match.currentGame} of 3</h2>
            <p className="text-gray-400">Best of 3</p>
          </div>
          <div className="text-right">
            <p className="text-lg">Time: {timeLeft}s</p>
          </div>
        </div>
        
        {/* Score */}
        <div className="flex justify-center gap-8 mb-8">
          <div className="text-center">
            <p className="text-sm text-gray-400">{playerData.username}</p>
            <p className="text-3xl font-bold text-blue-400">{match.playerWins}</p>
          </div>
          <div className="text-4xl font-bold text-gray-500">-</div>
          <div className="text-center">
            <p className="text-sm text-gray-400">{opponent.name}</p>
            <p className="text-3xl font-bold text-red-400">{match.aiWins}</p>
          </div>
        </div>
        
        {/* Board */}
        <div className="flex justify-center mb-8">
          <Connect4Board
            board={match.board}
            onColumnClick={handleColumnClick}
            currentPlayer={match.currentPlayer}
            disabled={match.currentPlayer === 'ai' || !!match.winner || !!match.matchWinner}
          />
        </div>
        
        {/* Status */}
        <div className="text-center">
          {match.matchWinner ? (
            <div className="space-y-4">
              <h3 className="text-3xl font-bold">
                {match.matchWinner === 'player' ? '🎉 Victory!' : '😞 Defeat'}
              </h3>
              <p className="text-xl text-gray-300">
                Match Score: {match.playerWins} - {match.aiWins}
              </p>
              {(() => {
                const won = match.matchWinner === 'player';
                const trophyChange = calculateNewTrophyChange(
                  won, 
                  playerData.trophies, 
                  opponent.trophies, 
                  playerData.winStreak,
                  totalMoves
                );
                return (
                  <div className={`text-2xl font-bold ${trophyChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {trophyChange >= 0 ? '+' : ''}{trophyChange} 🏆 Trophies
                  </div>
                );
              })()}
              <button
                onClick={handleEndMatch}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-lg font-semibold transition-colors"
              >
                Continue
              </button>
            </div>
          ) : match.winner ? (
            <p className="text-2xl">
              {match.winner === 'player' ? '🎉 You won this game!' : 
               match.winner === 'ai' ? `😞 ${opponent.name} won this game` : 
               '🤝 Draw!'}
            </p>
          ) : (
            <p className="text-xl">
              {match.currentPlayer === 'player' ? '🔵 Your turn' : `🔴 ${opponent.name} is making a move...`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
