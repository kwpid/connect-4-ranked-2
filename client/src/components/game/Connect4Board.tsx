import React from 'react';
import { GameBoard, CellValue } from '../../types/game';

interface Connect4BoardProps {
  board: GameBoard;
  onColumnClick: (column: number) => void;
  currentPlayer: 'player' | 'ai';
  disabled: boolean;
  winningCells?: Array<[number, number]>;
  bestMoveColumn?: number;
  hintColumn?: number;
}

export function Connect4Board({ board, onColumnClick, currentPlayer, disabled, winningCells = [], bestMoveColumn, hintColumn }: Connect4BoardProps) {
  const getCellColor = (cell: CellValue): string => {
    if (cell === 'player') return '#3B82F6'; // Blue
    if (cell === 'ai') return '#EF4444'; // Red
    return '#1F2937'; // Empty
  };
  
  const isWinningCell = (row: number, col: number): boolean => {
    return winningCells.some(([r, c]) => r === row && c === col);
  };
  
  const isBestMoveColumn = (col: number): boolean => {
    return bestMoveColumn === col;
  };
  
  const isHintColumn = (col: number): boolean => {
    return hintColumn === col;
  };
  
  return (
    <div className="inline-block bg-gradient-to-b from-blue-600 to-blue-800 p-2 sm:p-4 rounded-lg shadow-2xl">
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {/* Render columns for better click handling */}
        {Array.from({ length: 7 }).map((_, colIndex) => (
          <div 
            key={`col-${colIndex}`} 
            className={`flex flex-col gap-1 sm:gap-2 ${!disabled && currentPlayer === 'player' ? 'cursor-pointer hover:bg-blue-400/10' : ''} ${isBestMoveColumn(colIndex) ? 'bg-yellow-400/20' : ''} ${isHintColumn(colIndex) ? 'bg-green-400/20' : ''} rounded-lg transition-all`}
            onClick={() => {
              if (!disabled && currentPlayer === 'player') {
                onColumnClick(colIndex);
              }
            }}
          >
            {/* Render cells in this column */}
            {board.cells.map((row, rowIndex) => {
              const cell = row[colIndex];
              const isWinning = isWinningCell(rowIndex, colIndex);
              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className="w-10 h-10 sm:w-16 sm:h-16 rounded-full flex items-center justify-center"
                >
                  <div
                    className={`w-8 h-8 sm:w-14 sm:h-14 rounded-full shadow-inner transition-all duration-300 ${isWinning ? 'animate-pulse ring-2 sm:ring-4 ring-yellow-400' : ''}`}
                    style={{
                      backgroundColor: getCellColor(cell),
                      boxShadow: cell !== 'empty' 
                        ? `0 4px 6px -1px ${getCellColor(cell)}40, 0 2px 4px -1px ${getCellColor(cell)}40`
                        : 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.3)'
                    }}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
