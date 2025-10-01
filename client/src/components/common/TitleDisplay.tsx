import React from 'react';
import { Title } from '../../types/game';

interface TitleDisplayProps {
  title: Title | null;
}

export function TitleDisplay({ title }: TitleDisplayProps) {
  if (!title) {
    return (
      <div className="text-center">
        <p className="text-gray-500 italic">No title equipped</p>
      </div>
    );
  }
  
  const getGlowStyle = () => {
    if (title.glow === 'none') return {};
    
    return {
      textShadow: `0 0 10px ${title.glow}, 0 0 20px ${title.glow}, 0 0 30px ${title.glow}`
    };
  };
  
  return (
    <div className="text-center">
      <p
        className="text-lg font-bold"
        style={{
          color: title.color,
          ...getGlowStyle()
        }}
      >
        {title.name}
      </p>
    </div>
  );
}
