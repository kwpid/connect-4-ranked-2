import React, { useState, useEffect } from 'react';
import { MatchState, PlayerData, GameResult } from '../../types/game';
import { createEmptyBoard, dropPiece, getWinnerWithCells, WinningCells } from '../../utils/gameLogic';
import { AIPlayer, AIDifficulty } from '../../utils/aiPlayer';
import { Connect4Board } from './Connect4Board';
import { calculateTrophyChange, getRankByTrophies } from '../../utils/rankSystem';
import { getTitleFromId } from '../../utils/titleManager';
import { getCurrentSeasonData } from '../../utils/seasonManager';

interface GameScreenProps {
  playerData: PlayerData;
  onMatchEnd: (won: boolean, trophyChange: number) => void;
  onBack: () => void;
  isPracticeMode?: boolean;
  practiceDifficulty?: AIDifficulty;
}

export function GameScreen({ playerData, onMatchEnd, onBack, isPracticeMode = false, practiceDifficulty }: GameScreenProps) {
  // Generate opponent username and trophies based on player's trophy range
  const generateOpponent = () => {
    // Mix of short, regular, and long usernames
    const shortNames = [
      'x', 'v', 'z', 'q', 'k', 'j', 'r', 'n', 'm', 'l',
      '.', '..', '...', 'kk', 'zz', 'tt', 'cj', 'tj', 'pk', 'dk'
    ];
    
    const regularNames = [
      'ace', 'fox', 'max', 'sam', 'kai', 'leo', 'rex', 'jay', 'sky', 'rio',
      'ash', 'zen', 'nova', 'luna', 'echo', 'omen', 'apex', 'flux', 'volt', 'nyx',
      'zara', 'kira', 'mira', 'ryu', 'ken', 'lux', 'orb', 'gem', 'dot', 'bit',
      'hex', 'ray', 'ice', 'hot', 'red', 'blu', 'grn', 'yel', 'pur', 'blk',
      'wht', 'vex', 'ryn', 'kyx', 'jax', 'dex', 'pix', 'nix', 'pro', 'gg',
      'wp', 'ez', 'nt', 'gl', 'hf', 'gm', 'op', 'og', 'dragg', 'lru', 'xyz', 'qwe'
    ];
    
    const longNames = [
      'shadowhunter', 'nighthawk', 'thunderbolt', 'dragonslayer', 'stargazer',
      'moonwalker', 'stormbreaker', 'firestorm', 'icebreaker', 'wildcard',
      'masterchief', 'darkphoenix', 'silverfox', 'goldeneye', 'blackwidow',
      'ironheart', 'steelwolf', 'crystalclear', 'phantomghost', 'speedster',
      'champion', 'warrior', 'fighter', 'winner', 'player', 'gamer', 'legend'
    ];
    
    // Choose name category with distribution: 30% short, 50% regular, 20% long
    let baseName: string;
    const categoryRoll = Math.random();
    if (categoryRoll < 0.3) {
      baseName = shortNames[Math.floor(Math.random() * shortNames.length)];
    } else if (categoryRoll < 0.8) {
      baseName = regularNames[Math.floor(Math.random() * regularNames.length)];
    } else {
      baseName = longNames[Math.floor(Math.random() * longNames.length)];
    }
    
    // Number distribution: 60% no numbers, 30% short numbers (1-99), 10% longer numbers (100-9999)
    let name: string;
    const numberRoll = Math.random();
    if (numberRoll < 0.6) {
      name = baseName; // No numbers
    } else if (numberRoll < 0.9) {
      name = `${baseName}${Math.floor(Math.random() * 99) + 1}`; // 1-99
    } else {
      name = `${baseName}${Math.floor(Math.random() * 9900) + 100}`; // 100-9999
    }
    
    // Generate opponent trophies around player's level
    const variance = Math.floor(Math.random() * 60) - 30; // -30 to +30 trophies
    const trophies = Math.max(0, playerData.trophies + variance);
    
    // Generate opponent title based on trophies (fixed to not use non-existent titles)
    let titleId: string | null = null;
    const currentSeason = getCurrentSeasonData();
    const getValidSeasonNum = () => Math.max(1, currentSeason.seasonNumber - Math.floor(Math.random() * 3));
    
    if (trophies >= 701) {
      // Connect Legend - only CONNECT LEGEND titles
      const rand = Math.random();
      if (rand < 0.15) {
        titleId = 'grey_immortal';
      } else {
        titleId = `S${getValidSeasonNum()} CONNECT LEGEND`;
      }
    } else if (trophies >= 551) {
      // Grand Champion - only GRAND CHAMPION titles (NO leaderboard titles)
      const rand = Math.random();
      if (rand < 0.2) {
        titleId = Math.random() < 0.5 ? 'grey_legend' : 'grey_grandmaster';
      } else {
        titleId = `S${getValidSeasonNum()} GRAND CHAMPION`;
      }
    } else if (trophies >= 401) {
      // Champion - can use CHAMPION or leaderboard titles
      const rand = Math.random();
      if (rand < 0.3) {
        const greyTitles = ['grey_master', 'grey_expert', 'grey_pro', 'grey_elite'];
        titleId = greyTitles[Math.floor(Math.random() * greyTitles.length)];
      } else if (rand < 0.7) {
        titleId = `S${getValidSeasonNum()} CHAMPION`;
      } else {
        const leaderboardTitles = ['TOP 30', 'TOP 10', 'TOP CHAMPION'];
        titleId = `S${getValidSeasonNum()} ${leaderboardTitles[Math.floor(Math.random() * leaderboardTitles.length)]}`;
      }
    } else if (trophies >= 176) {
      // Mid-tier ranks - mix of grey and leaderboard titles
      const rand = Math.random();
      if (rand < 0.3) {
        titleId = null;
      } else if (rand < 0.6) {
        const greyTitles = ['grey_veteran', 'grey_skilled', 'grey_tactician', 'grey_strategist', 'grey_competitor'];
        titleId = greyTitles[Math.floor(Math.random() * greyTitles.length)];
      } else {
        titleId = `S${getValidSeasonNum()} TOP 30`;
      }
    } else {
      // Lower ranks - grey titles or no title
      if (Math.random() < 0.5) {
        titleId = null;
      } else {
        const greyTitles = ['grey_the_noob', 'grey_casual_player', 'grey_beginner', 'grey_enthusiast', 'grey_rookie'];
        titleId = greyTitles[Math.floor(Math.random() * greyTitles.length)];
      }
    }
    
    return { name, trophies, titleId };
  };
  
  // 50/50 chance for who goes first
  const determineFirstPlayer = (): 'player' | 'ai' => {
    return Math.random() < 0.5 ? 'player' : 'ai';
  };
  
  const [opponent] = useState(isPracticeMode ? { name: `${practiceDifficulty?.toUpperCase()} AI`, trophies: 0, titleId: null } : generateOpponent());
  const [initialPlayer] = useState(determineFirstPlayer());
  const [match, setMatch] = useState<MatchState>({
    currentGame: 1,
    playerWins: 0,
    aiWins: 0,
    board: createEmptyBoard(),
    currentPlayer: initialPlayer,
    winner: null,
    matchWinner: null
  });
  const [timeLeft, setTimeLeft] = useState(15);
  const [aiPlayer] = useState(isPracticeMode ? new AIPlayer(practiceDifficulty!) : new AIPlayer(opponent.trophies));
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [totalMoves, setTotalMoves] = useState(0);
  const [winningCells, setWinningCells] = useState<Array<[number, number]>>([]);
  const [showForfeitConfirm, setShowForfeitConfirm] = useState(false);
  const [coachingHint, setCoachingHint] = useState<{ column: number; reason: string } | null>(null);
  const [bestMoveColumn, setBestMoveColumn] = useState<number | undefined>(undefined);
  
  // Setup cheat mode
  useEffect(() => {
    (window as any).test = {
      cheat: () => {
        if (match.currentPlayer === 'player' && !match.winner && !match.matchWinner) {
          const bestMove = aiPlayer.getBestMove(match.board);
          setBestMoveColumn(bestMove);
          console.log(`Best move highlighted: Column ${bestMove + 1}`);
          setTimeout(() => setBestMoveColumn(undefined), 3000);
        } else {
          console.log('Cheat mode only works on player turn during active game');
        }
      }
    };
    
    return () => {
      delete (window as any).test;
    };
  }, [match, aiPlayer]);
  
  // Coaching hint for practice mode
  useEffect(() => {
    if (isPracticeMode && match.currentPlayer === 'player' && !match.winner && !match.matchWinner) {
      const hint = aiPlayer.getCoachingHint(match.board);
      setCoachingHint(hint);
    } else {
      setCoachingHint(null);
    }
  }, [match.currentPlayer, match.winner, match.matchWinner, isPracticeMode, aiPlayer, match.board]);
  
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
      // Check if this is AI's first move of the game
      const isFirstMove = match.board.cells.every(row => row.every(cell => cell === 'empty'));
      aiPlayer.makeMove(match.board, isFirstMove).then(column => {
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
      
      const result = getWinnerWithCells(newBoard);
      const winner = result.winner;
      setTimeLeft(15);
      
      if (winner) {
        // Set winning cells for highlighting
        if (result.cells) {
          setWinningCells(result.cells.positions);
        }
        
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
          // Next game after 5 second delay to show winning cells
          setTimeout(() => {
            setTotalMoves(0);
            setWinningCells([]);
            const nextFirstPlayer = determineFirstPlayer();
            setMatch(prev => ({
              ...prev,
              currentGame: prev.currentGame + 1,
              board: createEmptyBoard(),
              currentPlayer: nextFirstPlayer,
              winner: null,
              playerWins: newPlayerWins,
              aiWins: newAiWins
            }));
          }, 5000); // 5 second delay
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
  
  const handleForfeit = () => {
    if (isPracticeMode) {
      onBack();
    } else {
      // Lose trophies and end match
      const trophyLoss = -5; // Fixed penalty for forfeiting
      onMatchEnd(false, trophyLoss);
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
  
  // New trophy calculation system (up to 10 trophies)
  const calculateNewTrophyChange = (
    won: boolean, 
    playerTrophies: number, 
    opponentTrophies: number, 
    winStreak: number,
    moves: number
  ): number => {
    if (won) {
      // Base trophy reward based on opponent comparison
      let baseTrophies = 3; // Default for lower-ranked opponent
      
      const trophyDiff = opponentTrophies - playerTrophies;
      
      if (trophyDiff >= 50) {
        baseTrophies = 8; // Much much higher rank (huge underdog victory)
      } else if (trophyDiff >= 30) {
        baseTrophies = 7; // Much higher rank (underdog victory)
      } else if (trophyDiff >= 10) {
        baseTrophies = 5; // Slightly higher rank
      } else if (trophyDiff >= -10) {
        baseTrophies = 4; // Equal rank
      }
      
      // Win streak bonus: +1 if 3+ wins in a row, +2 if 10+ wins
      let streakBonus = 0;
      if (winStreak >= 10) {
        streakBonus = 2;
      } else if (winStreak >= 3) {
        streakBonus = 1;
      }
      
      // Fast win bonus: +1 if won in under 20 moves
      const fastWinBonus = moves < 20 ? 1 : 0;
      
      // Total can be up to 10 trophies (8 base + 1 streak + 1 fast win)
      return Math.min(10, baseTrophies + streakBonus + fastWinBonus);
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
            onClick={() => setShowForfeitConfirm(true)}
            className="px-4 py-2 bg-red-700 hover:bg-red-600 rounded-lg transition-colors"
          >
            {isPracticeMode ? '← Back' : '⚠️ Forfeit'}
          </button>
          <div className="text-center">
            <h2 className="text-2xl font-bold">
              {isPracticeMode ? 'Practice Mode' : `Game ${match.currentGame} of 3`}
            </h2>
            <p className="text-gray-400">{isPracticeMode ? practiceDifficulty?.toUpperCase() : 'Best of 3'}</p>
          </div>
          <div className="text-right">
            <p className="text-lg">Time: {timeLeft}s</p>
          </div>
        </div>
        
        {/* Score */}
        <div className="flex justify-center gap-8 mb-8">
          <div className="text-center">
            <p className="text-sm text-gray-400">
              {playerData.username}
              {playerData.equippedTitle && (() => {
                const title = getTitleFromId(playerData.equippedTitle);
                const glowStyle = title.glow && title.glow !== 'none' 
                  ? { textShadow: `0 0 10px ${title.glow}, 0 0 20px ${title.glow}` }
                  : {};
                return (
                  <span className="block text-xs mt-1 font-semibold" style={{ color: title.color, ...glowStyle }}>
                    {title.name}
                  </span>
                );
              })()}
            </p>
            <p className="text-xs text-gray-500 mt-1">🏆 {playerData.trophies}</p>
            <p className="text-3xl font-bold text-blue-400 mt-1">{match.playerWins}</p>
          </div>
          <div className="text-4xl font-bold text-gray-500">-</div>
          <div className="text-center">
            <p className="text-sm text-gray-400">{opponent.name}</p>
            {opponent.titleId && (() => {
              const title = getTitleFromId(opponent.titleId);
              const glowStyle = title.glow && title.glow !== 'none' 
                ? { textShadow: `0 0 10px ${title.glow}, 0 0 20px ${title.glow}` }
                : {};
              return (
                <p className="text-xs mt-1 font-semibold" style={{ color: title.color, ...glowStyle }}>
                  {title.name}
                </p>
              );
            })()}
            {!isPracticeMode && <p className="text-xs text-gray-500 mt-1">🏆 {opponent.trophies}</p>}
            <p className="text-3xl font-bold text-red-400 mt-1">{match.aiWins}</p>
          </div>
        </div>
        
        {/* Coaching Hint */}
        {isPracticeMode && coachingHint && !match.winner && (
          <div className="text-center mb-4">
            <div className="inline-block bg-green-500/20 border border-green-500/50 rounded-lg px-4 py-2">
              <p className="text-green-400 font-semibold">💡 Coaching Tip</p>
              <p className="text-sm text-gray-300">{coachingHint.reason}</p>
            </div>
          </div>
        )}
        
        {/* Board */}
        <div className="flex justify-center mb-8">
          <Connect4Board
            board={match.board}
            onColumnClick={handleColumnClick}
            currentPlayer={match.currentPlayer}
            disabled={match.currentPlayer === 'ai' || !!match.winner || !!match.matchWinner}
            winningCells={winningCells}
            bestMoveColumn={bestMoveColumn}
            hintColumn={isPracticeMode && coachingHint ? coachingHint.column : undefined}
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
              {!isPracticeMode && (() => {
                const won = match.matchWinner === 'player';
                const trophyChange = calculateNewTrophyChange(
                  won, 
                  playerData.trophies, 
                  opponent.trophies, 
                  playerData.winStreak,
                  totalMoves
                );
                const oldRank = getRankByTrophies(playerData.trophies);
                const newTrophies = Math.max(0, playerData.trophies + trophyChange);
                const newRank = getRankByTrophies(newTrophies);
                const rankedUp = oldRank.name !== newRank.name && newRank.minTrophies > oldRank.minTrophies;
                
                return (
                  <>
                    <div className={`text-2xl font-bold ${trophyChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {trophyChange >= 0 ? '+' : ''}{trophyChange} 🏆 Trophies
                    </div>
                    
                    {rankedUp ? (
                      <div className="mt-6 p-6 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg border-2 border-yellow-500/50 animate-pulse">
                        <p className="text-2xl font-bold text-yellow-400 mb-2">🎊 RANK UP! 🎊</p>
                        <p className="text-lg text-gray-300">
                          {oldRank.name} → <span style={{ color: newRank.tier === 'legend' ? '#FFFFFF' : newRank.tier === 'grand_champion' ? '#FF0000' : newRank.tier === 'champion' ? '#FF6B9D' : newRank.tier === 'diamond' ? '#B9F2FF' : newRank.tier === 'platinum' ? '#E5E4E2' : newRank.tier === 'gold' ? '#FFD700' : newRank.tier === 'silver' ? '#C0C0C0' : '#CD7F32' }} className="font-bold">{newRank.name}</span>
                        </p>
                      </div>
                    ) : (
                      <div className="mt-4">
                        <p className="text-lg text-gray-400">Current Rank</p>
                        <p className="text-2xl font-bold" style={{ color: newRank.tier === 'legend' ? '#FFFFFF' : newRank.tier === 'grand_champion' ? '#FF0000' : newRank.tier === 'champion' ? '#FF6B9D' : newRank.tier === 'diamond' ? '#B9F2FF' : newRank.tier === 'platinum' ? '#E5E4E2' : newRank.tier === 'gold' ? '#FFD700' : newRank.tier === 'silver' ? '#C0C0C0' : '#CD7F32' }}>
                          {newRank.name}
                        </p>
                      </div>
                    )}
                  </>
                );
              })()}
              <button
                onClick={isPracticeMode ? onBack : handleEndMatch}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-lg font-semibold transition-colors mt-4"
              >
                Continue
              </button>
            </div>
          ) : match.winner ? (
            <p className="text-2xl">
              {match.winner === 'player' ? '🎉 You won this game!' : 
               match.winner === 'ai' ? `😞 ${opponent.name} won this game` : 
               '🤝 Draw!'}
              <br />
              <span className="text-sm text-gray-400 mt-2 block">Next game starting in 5 seconds...</span>
            </p>
          ) : (
            <p className="text-xl">
              {match.currentPlayer === 'player' ? '🔵 Your turn' : `🔴 ${opponent.name} is making a move...`}
            </p>
          )}
        </div>
      </div>
      
      {/* Forfeit Confirmation Modal */}
      {showForfeitConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-8 max-w-md">
            <h3 className="text-2xl font-bold mb-4">
              {isPracticeMode ? 'Leave Practice?' : 'Forfeit Match?'}
            </h3>
            <p className="text-gray-300 mb-6">
              {isPracticeMode 
                ? 'Are you sure you want to leave practice mode?' 
                : 'Forfeiting will result in a loss and you\'ll lose 5 trophies. Are you sure?'}
            </p>
            <div className="flex gap-4">
              <button
                onClick={handleForfeit}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                {isPracticeMode ? 'Leave' : 'Forfeit'}
              </button>
              <button
                onClick={() => setShowForfeitConfirm(false)}
                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
