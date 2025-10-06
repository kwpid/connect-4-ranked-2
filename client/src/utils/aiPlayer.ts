import { GameBoard, CellValue } from '../types/game';
import { dropPiece, checkWinner, getAvailableColumns } from './gameLogic';

export type AIDifficulty = 'noob' | 'average' | 'good' | 'professional';

export class AIPlayer {
  private difficulty: number; // 0-10, based on trophies or difficulty setting
  private playerMoveHistory: number[] = [];
  private playStyle: 'aggressive' | 'defensive' | 'balanced' | 'opportunistic';
  private aiMoveHistory: number[] = [];
  
  constructor(playerTrophiesOrDifficulty: number | AIDifficulty) {
    const styleOptions: ('aggressive' | 'defensive' | 'balanced' | 'opportunistic')[] = ['aggressive', 'defensive', 'balanced', 'opportunistic'];
    this.playStyle = styleOptions[Math.floor(Math.random() * styleOptions.length)];
    if (typeof playerTrophiesOrDifficulty === 'string') {
      // Practice mode with explicit difficulty
      switch (playerTrophiesOrDifficulty) {
        case 'noob':
          this.difficulty = 1;
          break;
        case 'average':
          this.difficulty = 4;
          break;
        case 'good':
          this.difficulty = 7;
          break;
        case 'professional':
          this.difficulty = 10;
          break;
      }
    } else {
      // Ranked mode with trophy-based difficulty
      const playerTrophies = playerTrophiesOrDifficulty;
      if (playerTrophies < 16) this.difficulty = 1; // Bronze
      else if (playerTrophies < 46) this.difficulty = 2; // Silver
      else if (playerTrophies < 91) this.difficulty = 3; // Gold
      else if (playerTrophies < 151) this.difficulty = 5; // Platinum
      else if (playerTrophies < 226) this.difficulty = 7; // Diamond
      else if (playerTrophies < 301) this.difficulty = 8; // Champion
      else if (playerTrophies < 401) this.difficulty = 9; // Grand Champion
      else this.difficulty = 10; // Legend
    }
  }
  
  async makeMove(board: GameBoard, isFirstMove: boolean = false, lastPlayerMove?: number): Promise<number> {
    // Track player move patterns for higher difficulty AI
    if (lastPlayerMove !== undefined && this.difficulty >= 6) {
      this.playerMoveHistory.push(lastPlayerMove);
    }
    
    // Simulate thinking time based on difficulty (more variable for human-like behavior)
    const baseThink = 500 + Math.random() * 1000;
    const difficultyDelay = (10 - this.difficulty) * 200;
    const humanVariation = Math.random() > 0.7 ? Math.random() * 500 : 0;
    const thinkTime = baseThink + difficultyDelay + humanVariation;
    await new Promise(resolve => setTimeout(resolve, thinkTime));
    
    const availableColumns = getAvailableColumns(board);
    if (availableColumns.length === 0) return -1;
    
    // Opening move strategy: vary based on play style and make more unpredictable
    if (isFirstMove && this.difficulty >= 3) {
      const openingMove = this.getOpeningMove(availableColumns);
      if (openingMove !== -1) {
        this.aiMoveHistory.push(openingMove);
        return openingMove;
      }
    }
    
    // Check for winning move
    for (const col of availableColumns) {
      const testBoard = dropPiece(board, col, 'ai');
      if (testBoard && checkWinner(testBoard) === 'ai') {
        this.aiMoveHistory.push(col);
        return col;
      }
    }
    
    // Check for blocking move with rank-based probability
    if (this.difficulty >= 1) {
      // Calculate blocking probability based on rank
      let blockingChance = 0;
      if (this.difficulty <= 3) {
        blockingChance = 0.67; // Lower ranks: 67% chance, 33% miss
      } else if (this.difficulty <= 6) {
        blockingChance = 0.80; // Mid ranks: 80% chance
      } else if (this.difficulty <= 8) {
        blockingChance = 0.95; // High ranks: 95% chance
      } else {
        blockingChance = 0.99; // Top ranks: 99% chance (almost never miss)
      }
      
      // Only attempt to block if random roll succeeds
      if (Math.random() < blockingChance) {
        for (const col of availableColumns) {
          const testBoard = dropPiece(board, col, 'player');
          if (testBoard && checkWinner(testBoard) === 'player') {
            this.aiMoveHistory.push(col);
            return col;
          }
        }
      }
    }
    
    // Advanced threat detection - look for player building threats (3 in a row or 2 in a row)
    if (this.difficulty >= 5) {
      const threatMove = this.detectAndBlockThreat(board, availableColumns);
      if (threatMove !== -1) {
        this.aiMoveHistory.push(threatMove);
        return threatMove;
      }
    }
    
    // Use minimax for high-level AI (difficulty 8+)
    if (this.difficulty >= 8) {
      const depth = this.difficulty === 10 ? 5 : this.difficulty === 9 ? 4 : 3;
      const minimaxMove = this.minimaxWithAlphaBeta(board, depth, -Infinity, Infinity, true);
      
      if (minimaxMove.column !== -1) {
        // Even at top level, add slight unpredictability
        const variance = this.difficulty === 10 ? 0.03 : 0.08;
        if (Math.random() > variance) {
          this.aiMoveHistory.push(minimaxMove.column);
          return minimaxMove.column;
        }
      }
    }
    
    // Advanced strategy based on difficulty
    if (this.difficulty >= 5) {
      // Use player pattern analysis for high-level AI
      if (this.difficulty >= 7 && this.playerMoveHistory.length >= 4) {
        const pattern = this.analyzePlayerPattern();
        
        // Detect if player is trying the same strategy repeatedly
        if (this.difficulty >= 8 && this.detectRepeatedPattern()) {
          // Counter with a trap move
          const trapMove = this.findTrapMove(board, availableColumns);
          if (trapMove !== -1) {
            this.aiMoveHistory.push(trapMove);
            return trapMove;
          }
        }
        
        // Counter player's favored columns by controlling nearby spaces
        if (pattern.favoredColumns.length > 0) {
          const counterMoves = pattern.favoredColumns
            .flatMap(col => [col - 1, col, col + 1])
            .filter(col => col >= 0 && col < 9 && availableColumns.includes(col));
          
          if (counterMoves.length > 0 && Math.random() > 0.6) {
            const bestCounter = counterMoves[Math.floor(Math.random() * counterMoves.length)];
            const testBoard = dropPiece(board, bestCounter, 'ai');
            if (testBoard && this.evaluatePosition(testBoard, 'ai') > 2) {
              this.aiMoveHistory.push(bestCounter);
              return bestCounter;
            }
          }
        }
      }
      
      const strategicMove = this.findStrategicMove(board, availableColumns);
      if (strategicMove !== -1) {
        // Vary strategy more at high levels to be unpredictable
        const variance = this.difficulty >= 8 ? 0.12 : 0.15;
        if (Math.random() < variance) {
          // Pick a different strong move to be unpredictable
          const altMoves = this.findAlternativeStrategicMoves(board, availableColumns, strategicMove);
          if (altMoves.length > 0) {
            const chosen = altMoves[Math.floor(Math.random() * altMoves.length)];
            this.aiMoveHistory.push(chosen);
            return chosen;
          }
        }
        this.aiMoveHistory.push(strategicMove);
        return strategicMove;
      }
    }
    
    // Random move with preference for center columns at higher difficulties
    if (this.difficulty >= 3) {
      const centerColumns = availableColumns.filter(col => col >= 3 && col <= 5);
      if (centerColumns.length > 0 && Math.random() > 0.3) {
        const chosen = centerColumns[Math.floor(Math.random() * centerColumns.length)];
        this.aiMoveHistory.push(chosen);
        return chosen;
      }
    }
    
    const chosen = availableColumns[Math.floor(Math.random() * availableColumns.length)];
    this.aiMoveHistory.push(chosen);
    return chosen;
  }
  
  // Get best move for cheat mode
  getBestMove(board: GameBoard): number {
    const availableColumns = getAvailableColumns(board);
    if (availableColumns.length === 0) return -1;
    
    // Check for winning move
    for (const col of availableColumns) {
      const testBoard = dropPiece(board, col, 'player');
      if (testBoard && checkWinner(testBoard) === 'player') {
        return col;
      }
    }
    
    // Check for blocking move
    for (const col of availableColumns) {
      const testBoard = dropPiece(board, col, 'ai');
      if (testBoard && checkWinner(testBoard) === 'ai') {
        return col;
      }
    }
    
    // Return strategic move
    const strategicMove = this.findStrategicMove(board, availableColumns);
    if (strategicMove !== -1) return strategicMove;
    
    // Prefer center columns
    const centerColumns = availableColumns.filter(col => col >= 3 && col <= 5);
    if (centerColumns.length > 0) {
      return centerColumns[Math.floor(Math.random() * centerColumns.length)];
    }
    
    return availableColumns[Math.floor(Math.random() * availableColumns.length)];
  }
  
  // Get coaching hints for practice mode
  getCoachingHint(board: GameBoard): { column: number; reason: string } | null {
    const availableColumns = getAvailableColumns(board);
    if (availableColumns.length === 0) return null;
    
    // Check for winning move
    for (const col of availableColumns) {
      const testBoard = dropPiece(board, col, 'player');
      if (testBoard && checkWinner(testBoard) === 'player') {
        return { column: col, reason: 'This move wins the game!' };
      }
    }
    
    // Check for blocking move
    for (const col of availableColumns) {
      const testBoard = dropPiece(board, col, 'ai');
      if (testBoard && checkWinner(testBoard) === 'ai') {
        return { column: col, reason: 'Block the opponent from winning!' };
      }
    }
    
    // Look for setup moves (creating threats)
    let bestScore = -1;
    let bestMove = -1;
    
    for (const col of availableColumns) {
      const testBoard = dropPiece(board, col, 'player');
      if (!testBoard) continue;
      
      const score = this.evaluatePosition(testBoard, 'player');
      if (score > bestScore) {
        bestScore = score;
        bestMove = col;
      }
    }
    
    if (bestMove !== -1 && bestScore > 3) {
      return { column: bestMove, reason: 'Create a threat!' };
    }
    
    // Prefer center columns
    const centerColumns = availableColumns.filter(col => col >= 3 && col <= 5);
    if (centerColumns.length > 0) {
      return { column: centerColumns[0], reason: 'Center columns give more options' };
    }
    
    return null;
  }
  
  private getOpeningMove(availableColumns: number[]): number {
    // Vary opening strategy based on play style
    switch (this.playStyle) {
      case 'aggressive':
        // Prefer center for control
        if (availableColumns.includes(4)) return 4;
        const nearCenter = [3, 5].filter(c => availableColumns.includes(c));
        if (nearCenter.length > 0) return nearCenter[Math.floor(Math.random() * nearCenter.length)];
        break;
        
      case 'defensive':
        // Prefer sides to build defensive positions
        const sides = [0, 1, 7, 8].filter(c => availableColumns.includes(c));
        if (sides.length > 0 && Math.random() > 0.4) {
          return sides[Math.floor(Math.random() * sides.length)];
        }
        break;
        
      case 'balanced':
        // Mix of center and off-center
        if (Math.random() > 0.5 && availableColumns.includes(4)) return 4;
        const balanced = [3, 4, 5].filter(c => availableColumns.includes(c));
        if (balanced.length > 0) return balanced[Math.floor(Math.random() * balanced.length)];
        break;
        
      case 'opportunistic':
        // Vary the opening each time
        if (Math.random() > 0.6) {
          return availableColumns[Math.floor(Math.random() * availableColumns.length)];
        }
        break;
    }
    
    // Default: prefer center
    if (availableColumns.includes(4) && Math.random() > 0.3) {
      return 4;
    }
    
    return -1;
  }
  
  private analyzePlayerPattern(): { favoredColumns: number[]; predictedNext: number | null } {
    if (this.playerMoveHistory.length < 3) {
      return { favoredColumns: [], predictedNext: null };
    }
    
    // Count column frequency
    const columnCounts: { [key: number]: number } = {};
    this.playerMoveHistory.forEach(col => {
      columnCounts[col] = (columnCounts[col] || 0) + 1;
    });
    
    // Find most used columns
    const sorted = Object.entries(columnCounts)
      .sort(([, a], [, b]) => b - a)
      .map(([col]) => parseInt(col));
    
    // Check for patterns (e.g., alternating, sequential)
    const recentMoves = this.playerMoveHistory.slice(-3);
    let predictedNext = null;
    
    // Simple pattern detection: if player favors certain columns, predict they'll use them
    if (sorted.length > 0 && columnCounts[sorted[0]] >= 3) {
      predictedNext = sorted[0];
    }
    
    return { favoredColumns: sorted.slice(0, 3), predictedNext };
  }
  
  private detectAndBlockThreat(board: GameBoard, availableColumns: number[]): number {
    // Detect if player has dangerous threats (3 in a row, or 2 in a row with open ends)
    const cells = board.cells;
    const directions = [
      { dr: 0, dc: 1 },  // horizontal
      { dr: 1, dc: 0 },  // vertical
      { dr: 1, dc: 1 },  // diagonal down-right
      { dr: 1, dc: -1 }  // diagonal down-left
    ];
    
    // Find all player threats and rate them by severity
    const threats: { column: number; severity: number }[] = [];
    
    for (const col of availableColumns) {
      const testBoard = dropPiece(board, col, 'ai');
      if (!testBoard) continue;
      
      // Check what threats this move would block
      let maxThreatBlocked = 0;
      
      for (let row = 0; row < 7; row++) {
        for (let c = 0; c < 9; c++) {
          for (const dir of directions) {
            const window = this.getWindow(board.cells, row, c, dir.dr, dir.dc);
            if (window.length !== 4) continue;
            
            const playerCount = window.filter(cell => cell === 'player').length;
            const emptyCount = window.filter(cell => cell === 'empty').length;
            const aiCount = window.filter(cell => cell === 'ai').length;
            
            // Skip if AI already blocks this line
            if (aiCount > 0) continue;
            
            // Check if this move would block this threat
            const windowAfter = this.getWindow(testBoard.cells, row, c, dir.dr, dir.dc);
            const aiCountAfter = windowAfter.filter(cell => cell === 'ai').length;
            
            if (aiCountAfter > 0) {
              // This move blocks this line - calculate threat level
              let threat = 0;
              if (playerCount === 3 && emptyCount === 1) {
                threat = 100; // Critical: 3 in a row with 1 empty
              } else if (playerCount === 2 && emptyCount === 2) {
                threat = 50; // Dangerous: 2 in a row with 2 empties
              } else if (playerCount === 1 && emptyCount === 3) {
                threat = 10; // Minor: 1 in a row with 3 empties
              }
              
              maxThreatBlocked = Math.max(maxThreatBlocked, threat);
            }
          }
        }
      }
      
      if (maxThreatBlocked > 0) {
        threats.push({ column: col, severity: maxThreatBlocked });
      }
    }
    
    // Sort by severity and return the most important block
    if (threats.length > 0) {
      threats.sort((a, b) => b.severity - a.severity);
      // For high-level AI (7+), always block threats of 50+
      // For mid-level AI (5-6), block critical threats (100) always, and 50+ sometimes
      if (this.difficulty >= 7 && threats[0].severity >= 50) {
        return threats[0].column;
      } else if (this.difficulty >= 5 && threats[0].severity >= 100) {
        return threats[0].column;
      } else if (this.difficulty >= 5 && threats[0].severity >= 50 && Math.random() > 0.3) {
        return threats[0].column;
      }
    }
    
    return -1;
  }

  private findStrategicMove(board: GameBoard, availableColumns: number[]): number {
    // Look for moves that create multiple threats
    let bestScore = -1;
    let bestMove = -1;
    
    for (const col of availableColumns) {
      const testBoard = dropPiece(board, col, 'ai');
      if (!testBoard) continue;
      
      const score = this.evaluatePosition(testBoard, 'ai');
      if (score > bestScore) {
        bestScore = score;
        bestMove = col;
      }
    }
    
    return bestMove;
  }
  
  private evaluatePosition(board: GameBoard, player: CellValue): number {
    let score = 0;
    const cells = board.cells;
    
    // Check all possible 4-in-a-row positions
    const directions = [
      { dr: 0, dc: 1 },  // horizontal
      { dr: 1, dc: 0 },  // vertical
      { dr: 1, dc: 1 },  // diagonal down-right
      { dr: 1, dc: -1 }  // diagonal down-left
    ];
    
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < 9; col++) {
        for (const dir of directions) {
          const window = this.getWindow(cells, row, col, dir.dr, dir.dc);
          if (window.length === 4) {
            score += this.scoreWindow(window, player);
          }
        }
      }
    }
    
    return score;
  }
  
  private getWindow(cells: CellValue[][], row: number, col: number, dr: number, dc: number): CellValue[] {
    const window: CellValue[] = [];
    for (let i = 0; i < 4; i++) {
      const r = row + i * dr;
      const c = col + i * dc;
      if (r >= 0 && r < 7 && c >= 0 && c < 9) {
        window.push(cells[r][c]);
      }
    }
    return window;
  }
  
  private scoreWindow(window: CellValue[], player: CellValue): number {
    const opponent = player === 'ai' ? 'player' : 'ai';
    const playerCount = window.filter(c => c === player).length;
    const opponentCount = window.filter(c => c === opponent).length;
    const emptyCount = window.filter(c => c === 'empty').length;
    
    if (playerCount === 3 && emptyCount === 1) return 5;
    if (playerCount === 2 && emptyCount === 2) return 2;
    if (opponentCount === 3 && emptyCount === 1) return -4;
    
    return 0;
  }
  
  private minimaxWithAlphaBeta(
    board: GameBoard, 
    depth: number, 
    alpha: number, 
    beta: number, 
    isMaximizing: boolean
  ): { score: number; column: number } {
    const availableColumns = getAvailableColumns(board);
    
    // Check terminal states
    const winner = checkWinner(board);
    if (winner === 'ai') return { score: 100000, column: -1 };
    if (winner === 'player') return { score: -100000, column: -1 };
    if (availableColumns.length === 0) return { score: 0, column: -1 };
    if (depth === 0) return { score: this.evaluatePosition(board, 'ai'), column: -1 };
    
    if (isMaximizing) {
      let maxScore = -Infinity;
      let bestColumn = availableColumns[0];
      
      for (const col of availableColumns) {
        const testBoard = dropPiece(board, col, 'ai');
        if (!testBoard) continue;
        
        const result = this.minimaxWithAlphaBeta(testBoard, depth - 1, alpha, beta, false);
        if (result.score > maxScore) {
          maxScore = result.score;
          bestColumn = col;
        }
        
        alpha = Math.max(alpha, maxScore);
        if (beta <= alpha) break; // Beta cutoff
      }
      
      return { score: maxScore, column: bestColumn };
    } else {
      let minScore = Infinity;
      let bestColumn = availableColumns[0];
      
      for (const col of availableColumns) {
        const testBoard = dropPiece(board, col, 'player');
        if (!testBoard) continue;
        
        const result = this.minimaxWithAlphaBeta(testBoard, depth - 1, alpha, beta, true);
        if (result.score < minScore) {
          minScore = result.score;
          bestColumn = col;
        }
        
        beta = Math.min(beta, minScore);
        if (beta <= alpha) break; // Alpha cutoff
      }
      
      return { score: minScore, column: bestColumn };
    }
  }
  
  private detectRepeatedPattern(): boolean {
    // Check if player is using the same pattern multiple times
    if (this.playerMoveHistory.length < 8) return false;
    
    const recent = this.playerMoveHistory.slice(-6);
    const earlier = this.playerMoveHistory.slice(-12, -6);
    
    // Simple pattern detection: check for repeated sequences
    let matchCount = 0;
    for (let i = 0; i < 3; i++) {
      if (Math.abs(recent[i] - earlier[i]) <= 1) {
        matchCount++;
      }
    }
    
    return matchCount >= 2;
  }
  
  private findTrapMove(board: GameBoard, availableColumns: number[]): number {
    // Look for moves that create a "fork" - multiple winning threats
    let bestTrapScore = 0;
    let bestTrapMove = -1;
    
    for (const col of availableColumns) {
      const testBoard = dropPiece(board, col, 'ai');
      if (!testBoard) continue;
      
      // Count how many winning moves this creates for AI
      let winningMoveCount = 0;
      const nextAvailable = getAvailableColumns(testBoard);
      
      for (const nextCol of nextAvailable) {
        const nextBoard = dropPiece(testBoard, nextCol, 'ai');
        if (nextBoard && checkWinner(nextBoard) === 'ai') {
          winningMoveCount++;
        }
      }
      
      // A fork is when AI can create 2+ winning threats
      if (winningMoveCount >= 2 && winningMoveCount > bestTrapScore) {
        bestTrapScore = winningMoveCount;
        bestTrapMove = col;
      }
    }
    
    return bestTrapMove;
  }
  
  private findAlternativeStrategicMoves(
    board: GameBoard, 
    availableColumns: number[], 
    bestMove: number
  ): number[] {
    // Find moves that are almost as good as the best move
    const scores: { col: number; score: number }[] = [];
    
    for (const col of availableColumns) {
      if (col === bestMove) continue;
      
      const testBoard = dropPiece(board, col, 'ai');
      if (!testBoard) continue;
      
      const score = this.evaluatePosition(testBoard, 'ai');
      scores.push({ col, score });
    }
    
    // Sort by score and return top alternatives
    scores.sort((a, b) => b.score - a.score);
    
    // Return moves that are within 30% of the best score
    const bestScore = scores.length > 0 ? scores[0].score : 0;
    const threshold = bestScore * 0.7;
    
    return scores
      .filter(s => s.score >= threshold)
      .slice(0, 3)
      .map(s => s.col);
  }
}
