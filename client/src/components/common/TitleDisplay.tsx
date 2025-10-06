import React from 'react';
import { Title } from '../../types/game';
import { getTitleFromId } from '../../utils/titleManager';
import { getRankImagePath } from '../../utils/rankSystem';

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
  
  const getRankImage = () => {
    if (!displayTitle.rankImage) return null;
    
    const rank = displayTitle.rankImage;
    
    // Map rank names to their Division III images (highest division)
    if (rank === 'CONNECT LEGEND') {
      return getRankImagePath('Connect Legend');
    } else if (rank === 'GRAND CHAMPION') {
      return getRankImagePath('Grand Champion III');
    } else if (rank === 'CHAMPION') {
      return getRankImagePath('Champion III');
    } else if (rank === 'DIAMOND') {
      return getRankImagePath('Diamond III');
    } else if (rank === 'PLATINUM') {
      return getRankImagePath('Platinum III');
    } else if (rank === 'GOLD') {
      return getRankImagePath('Gold III');
    } else if (rank === 'SILVER') {
      return getRankImagePath('Silver III');
    } else if (rank === 'BRONZE') {
      return getRankImagePath('Bronze III');
    }
    
    return null;
  };
  
  const rankImagePath = getRankImage();
  const hasRankImage = rankImagePath !== null;
  
  // For season and tournament titles with rank images, show them inline
  if (hasRankImage && (displayTitle.type === 'season' || displayTitle.type === 'tournament')) {
    // Extract season number from title name
    const seasonMatch = displayTitle.name.match(/^S(\d+)\s/);
    const seasonNum = seasonMatch ? seasonMatch[1] : '';
    const restOfTitle = displayTitle.name.replace(/^S\d+\s/, '').replace(displayTitle.rankImage!, '').trim();
    
    return (
      <div className="text-center flex items-center justify-center gap-1 flex-wrap">
        <span
          className={`${getFontSizeClass(displayTitle.name)} font-bold uppercase`}
          style={{
            color: displayTitle.color,
            ...getGlowStyle()
          }}
        >
          {seasonNum && `S${seasonNum} `}
        </span>
        <img 
          src={rankImagePath} 
          alt={displayTitle.rankImage} 
          className="h-5 w-auto object-contain inline-block"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
        {restOfTitle && (
          <span
            className={`${getFontSizeClass(displayTitle.name)} font-bold uppercase`}
            style={{
              color: displayTitle.color,
              ...getGlowStyle()
            }}
          >
            {restOfTitle}
          </span>
        )}
      </div>
    );
  }
  
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
