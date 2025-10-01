import { GameBoard, CellValue } from '../types/game';
import { dropPiece, checkWinner, getAvailableColumns } from './gameLogic';

export class AIPlayer {
  private difficulty: number; // 0-10, based on trophies
  
  constructor(playerTrophies: number) {
    // Map trophies to difficulty
    if (playerTrophies < 16) this.difficulty = 1; // Bronze
    else if (playerTrophies < 46) this.difficulty = 2; // Silver
    else if (playerTrophies < 91) this.difficulty = 3; // Gold
    else if (playerTrophies < 151) this.difficulty = 5; // Platinum
    else if (playerTrophies < 226) this.difficulty = 7; // Diamond
    else if (playerTrophies < 301) this.difficulty = 8; // Champion
    else if (playerTrophies < 401) this.difficulty = 9; // Grand Champion
    else this.difficulty = 10; // Legend
  }
  
  async makeMove(board: GameBoard): Promise<number> {
    // Simulate thinking time based on difficulty
    const thinkTime = 500 + Math.random() * 1000 + (10 - this.difficulty) * 200;
    await new Promise(resolve => setTimeout(resolve, thinkTime));
    
    const availableColumns = getAvailableColumns(board);
    if (availableColumns.length === 0) return -1;
    
    // Check for winning move
    for (const col of availableColumns) {
      const testBoard = dropPiece(board, col, 'ai');
      if (testBoard && checkWinner(testBoard) === 'ai') {
        return col;
      }
    }
    
    // Check for blocking move
    if (this.difficulty >= 2) {
      for (const col of availableColumns) {
        const testBoard = dropPiece(board, col, 'player');
        if (testBoard && checkWinner(testBoard) === 'player') {
          return col;
        }
      }
    }
    
    // Advanced strategy based on difficulty
    if (this.difficulty >= 5) {
      const strategicMove = this.findStrategicMove(board, availableColumns);
      if (strategicMove !== -1) return strategicMove;
    }
    
    // Random move with preference for center columns at higher difficulties
    if (this.difficulty >= 3) {
      const centerColumns = availableColumns.filter(col => col >= 2 && col <= 4);
      if (centerColumns.length > 0 && Math.random() > 0.3) {
        return centerColumns[Math.floor(Math.random() * centerColumns.length)];
      }
    }
    
    return availableColumns[Math.floor(Math.random() * availableColumns.length)];
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
    
    for (let row = 0; row < 6; row++) {
      for (let col = 0; col < 7; col++) {
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
      if (r >= 0 && r < 6 && c >= 0 && c < 7) {
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
}
