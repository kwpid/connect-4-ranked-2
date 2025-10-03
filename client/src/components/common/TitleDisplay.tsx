import React from 'react';
import { Title } from '../../types/game';
import { getTitleFromId } from '../../utils/titleManager';

interface TitleDisplayProps {
  title?: Title | null;
  titleId?: string | null;
}

export function TitleDisplay({ title, titleId }: TitleDisplayProps) {
  // If titleId is provided, parse it to get the full title object
  const displayTitle = titleId ? getTitleFromId(titleId) : title;
  
  if (!displayTitle) {
    return (
      <div className="text-center">
        <p className="text-gray-500 italic">No title equipped</p>
      </div>
    );
  }
  
  const getGlowStyle = () => {
    if (displayTitle.glow === 'none' || !displayTitle.glow) return {};
    
    return {
      textShadow: `0 0 10px ${displayTitle.glow}, 0 0 20px ${displayTitle.glow}, 0 0 30px ${displayTitle.glow}`
    };
  };
  
  const getFontSizeClass = (text: string) => {
    const length = text.length;
    
    if (length <= 8) return 'text-lg';
    if (length <= 12) return 'text-base';
    if (length <= 16) return 'text-sm';
    if (length <= 20) return 'text-xs';
    return 'text-[10px]';
  };
  
  return (
    <div className="text-center">
      <p
        className={`${getFontSizeClass(displayTitle.name)} font-bold uppercase`}
        style={{
          color: displayTitle.color,
          ...getGlowStyle()
        }}
      >
        {displayTitle.name}
      </p>
    </div>
  );
}
