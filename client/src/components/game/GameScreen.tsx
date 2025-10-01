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
  // Generate opponent username based on player's trophy range
  const generateOpponentName = () => {
    const names = [
      'ProGamer', 'ChessMaster', 'ConnectKing', 'StrategyPro', 'TrophyHunter',
      'RankClimber', 'ElitePlayer', 'SkillMaster', 'TopTier', 'Challenger',
      'Dominator', 'Victory', 'Champion', 'Legend', 'Immortal', 'Divine',
      'Mythic', 'Supreme', 'Ultimate', 'Omega', 'Alpha', 'Sigma', 'Delta',
      'Phoenix', 'Dragon', 'Tiger', 'Eagle', 'Wolf', 'Bear', 'Lion',
      'Shadow', 'Ghost', 'Phantom', 'Ninja', 'Samurai', 'Warrior', 'Knight'
    ];
    const baseName = names[Math.floor(Math.random() * names.length)];
    return `${baseName}${Math.floor(Math.random() * 9999)}`;
  };
  
  const [opponentName] = useState(generateOpponentName());
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
  const [aiPlayer] = useState(new AIPlayer(playerData.trophies));
  const [isAiThinking, setIsAiThinking] = useState(false);
  
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
    const newBoard = dropPiece(match.board, column, player);
    if (!newBoard) return;
    
    const winner = checkWinner(newBoard);
    setTimeLeft(15);
    
    if (winner) {
      // Game over
      const newPlayerWins = match.playerWins + (winner === 'player' ? 1 : 0);
      const newAiWins = match.aiWins + (winner === 'ai' ? 1 : 0);
      
      // Check if match is over (best of 3)
      if (newPlayerWins === 2 || newAiWins === 2) {
        setMatch({
          ...match,
          board: newBoard,
          winner,
          playerWins: newPlayerWins,
          aiWins: newAiWins,
          matchWinner: newPlayerWins === 2 ? 'player' : 'ai'
        });
      } else {
        // Next game
        setTimeout(() => {
          setMatch({
            ...match,
            currentGame: match.currentGame + 1,
            board: createEmptyBoard(),
            currentPlayer: 'player',
            winner: null,
            playerWins: newPlayerWins,
            aiWins: newAiWins
          });
        }, 2000);
      }
    } else {
      setMatch({
        ...match,
        board: newBoard,
        currentPlayer: player === 'player' ? 'ai' : 'player'
      });
    }
  };
  
  const handleColumnClick = (column: number) => {
    if (match.currentPlayer === 'player' && !match.winner && !match.matchWinner) {
      handleMove(column, 'player');
    }
  };
  
  const handleEndMatch = () => {
    if (match.matchWinner) {
      const won = match.matchWinner === 'player';
      const trophyChange = calculateTrophyChange(won, playerData.winStreak);
      onMatchEnd(won, trophyChange);
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
            <p className="text-sm text-gray-400">{opponentName}</p>
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
               match.winner === 'ai' ? `😞 ${opponentName} won this game` : 
               '🤝 Draw!'}
            </p>
          ) : (
            <p className="text-xl">
              {match.currentPlayer === 'player' ? '🔵 Your turn' : `🔴 ${opponentName} is making a move...`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
