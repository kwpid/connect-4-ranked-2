import React from 'react';
import { GameBoard, CellValue } from '../../types/game';

interface Connect4BoardProps {
  board: GameBoard;
  onColumnClick: (column: number) => void;
  currentPlayer: 'player' | 'ai';
  disabled: boolean;
}

export function Connect4Board({ board, onColumnClick, currentPlayer, disabled }: Connect4BoardProps) {
  const getCellColor = (cell: CellValue): string => {
    if (cell === 'player') return '#3B82F6'; // Blue
    if (cell === 'ai') return '#EF4444'; // Red
    return '#1F2937'; // Empty
  };
  
  return (
    <div className="inline-block bg-gradient-to-b from-blue-600 to-blue-800 p-4 rounded-lg shadow-2xl">
      <div className="grid grid-cols-7 gap-2">
        {board.cells.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`w-16 h-16 rounded-full flex items-center justify-center cursor-pointer transition-all duration-200 ${
                rowIndex === 0 && !disabled ? 'hover:bg-blue-400' : ''
              }`}
              onClick={() => {
                if (rowIndex === 0 && !disabled && currentPlayer === 'player') {
                  onColumnClick(colIndex);
                }
              }}
            >
              <div
                className="w-14 h-14 rounded-full shadow-inner transition-all duration-300"
                style={{
                  backgroundColor: getCellColor(cell),
                  boxShadow: cell !== 'empty' 
                    ? `0 4px 6px -1px ${getCellColor(cell)}40, 0 2px 4px -1px ${getCellColor(cell)}40`
                    : 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.3)'
                }}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
