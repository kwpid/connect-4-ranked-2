import { GameBoard, CellValue, GameResult } from '../types/game';

export interface WinningCells {
  positions: Array<[number, number]>;
}

export function createEmptyBoard(): GameBoard {
  return {
    cells: Array(6).fill(null).map(() => Array(7).fill('empty'))
  };
}

export function dropPiece(board: GameBoard, column: number, player: CellValue): GameBoard | null {
  if (column < 0 || column >= 7) return null;
  
  const newBoard = {
    cells: board.cells.map(row => [...row])
  };
  
  // Find the lowest empty cell in the column
  for (let row = 5; row >= 0; row--) {
    if (newBoard.cells[row][column] === 'empty') {
      newBoard.cells[row][column] = player;
      return newBoard;
    }
  }
  
  return null; // Column is full
}

export function checkWinner(board: GameBoard): GameResult {
  const result = getWinnerWithCells(board);
  return result.winner;
}

export function getWinnerWithCells(board: GameBoard): { winner: GameResult; cells: WinningCells | null } {
  const cells = board.cells;
  
  // Check horizontal
  for (let row = 0; row < 6; row++) {
    for (let col = 0; col < 4; col++) {
      const cell = cells[row][col];
      if (cell !== 'empty' && 
          cell === cells[row][col + 1] && 
          cell === cells[row][col + 2] && 
          cell === cells[row][col + 3]) {
        return {
          winner: cell as GameResult,
          cells: {
            positions: [[row, col], [row, col + 1], [row, col + 2], [row, col + 3]]
          }
        };
      }
    }
  }
  
  // Check vertical
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 7; col++) {
      const cell = cells[row][col];
      if (cell !== 'empty' && 
          cell === cells[row + 1][col] && 
          cell === cells[row + 2][col] && 
          cell === cells[row + 3][col]) {
        return {
          winner: cell as GameResult,
          cells: {
            positions: [[row, col], [row + 1, col], [row + 2, col], [row + 3, col]]
          }
        };
      }
    }
  }
  
  // Check diagonal (down-right)
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < 4; col++) {
      const cell = cells[row][col];
      if (cell !== 'empty' && 
          cell === cells[row + 1][col + 1] && 
          cell === cells[row + 2][col + 2] && 
          cell === cells[row + 3][col + 3]) {
        return {
          winner: cell as GameResult,
          cells: {
            positions: [[row, col], [row + 1, col + 1], [row + 2, col + 2], [row + 3, col + 3]]
          }
        };
      }
    }
  }
  
  // Check diagonal (down-left)
  for (let row = 0; row < 3; row++) {
    for (let col = 3; col < 7; col++) {
      const cell = cells[row][col];
      if (cell !== 'empty' && 
          cell === cells[row + 1][col - 1] && 
          cell === cells[row + 2][col - 2] && 
          cell === cells[row + 3][col - 3]) {
        return {
          winner: cell as GameResult,
          cells: {
            positions: [[row, col], [row + 1, col - 1], [row + 2, col - 2], [row + 3, col - 3]]
          }
        };
      }
    }
  }
  
  // Check for draw
  const isFull = cells[0].every(cell => cell !== 'empty');
  if (isFull) return { winner: 'draw', cells: null };
  
  return { winner: null, cells: null };
}

export function isColumnFull(board: GameBoard, column: number): boolean {
  return board.cells[0][column] !== 'empty';
}

export function getAvailableColumns(board: GameBoard): number[] {
  const available: number[] = [];
  for (let col = 0; col < 7; col++) {
    if (!isColumnFull(board, col)) {
      available.push(col);
    }
  }
  return available;
}
