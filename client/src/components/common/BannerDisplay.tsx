import React, { useState, useEffect } from 'react';
import { loadBanners, getBannerById, getBannerImagePath } from '../../utils/bannerManager';
import { getTitleFromId } from '../../utils/titleManager';
import { loadPfps, getPfpById, getPfpImagePath } from '../../utils/pfpManager';
import { getRankImagePath } from '../../utils/rankSystem';

interface BannerDisplayProps {
  bannerId: number | null;
  username?: string;
  titleId?: string | null;
  pfpId?: number | null;
  className?: string;
}

export function BannerDisplay({ bannerId, username, titleId, pfpId, className = '' }: BannerDisplayProps) {
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);
  const [pfpUrl, setPfpUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!bannerId) {
      setBannerUrl(null);
      return;
    }

    loadBanners().then(banners => {
      const banner = getBannerById(bannerId, banners);
      if (banner) {
        setBannerUrl(getBannerImagePath(banner.imageName));
      }
    });
  }, [bannerId]);

  useEffect(() => {
    if (!pfpId) {
      setPfpUrl(null);
      return;
    }

    loadPfps().then(pfps => {
      const pfp = getPfpById(pfpId, pfps);
      if (pfp) {
        setPfpUrl(getPfpImagePath(pfp.imageName));
      }
    });
  }, [pfpId]);

  if (!bannerId || !bannerUrl) {
    return username ? <span className={className}>{username}</span> : null;
  }

  const isGif = bannerUrl?.toLowerCase().endsWith('.gif');
  
  if (username) {
    const title = titleId ? getTitleFromId(titleId) : null;
    const glowStyle = title && title.glow && title.glow !== 'none' 
      ? { textShadow: `0 0 10px ${title.glow}, 0 0 20px ${title.glow}` }
      : {};
    
    return (
      <div className={`inline-block relative ${className}`}>
        <img
          src={bannerUrl}
          alt="Banner"
          className="h-[62px] w-auto"
          style={{ imageRendering: isGif ? 'auto' : 'crisp-edges' }}
        />
        <div className="absolute inset-0 flex items-center pl-2">
          {pfpUrl && (
            <div className="w-[45px] h-[45px] rounded-full overflow-hidden border-2 border-white shadow-lg flex-shrink-0">
              <img
                src={pfpUrl}
                alt="Profile Picture"
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className={`flex flex-col justify-center ${pfpUrl ? 'ml-2' : ''}`}>
            <span className="text-white font-bold text-shadow-lg text-base leading-tight" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
              {username}
            </span>
            {title && (
              <div className="flex items-center gap-1">
                {title.type === 'tournament' && title.rankImage ? (() => {
                  // Parse the rank to get the image path
                  const rank = title.rankImage;
                  let rankPath = '';
                  
                  if (rank === 'CONNECT LEGEND') {
                    rankPath = getRankImagePath('Connect Legend');
                  } else if (rank === 'GRAND CHAMPION') {
                    rankPath = getRankImagePath('Grand Champion III');
                  } else if (rank === 'CHAMPION') {
                    rankPath = getRankImagePath('Champion III');
                  } else if (rank === 'DIAMOND') {
                    rankPath = getRankImagePath('Diamond III');
                  } else if (rank === 'PLATINUM') {
                    rankPath = getRankImagePath('Platinum III');
                  } else if (rank === 'GOLD') {
                    rankPath = getRankImagePath('Gold III');
                  } else if (rank === 'SILVER') {
                    rankPath = getRankImagePath('Silver III');
                  } else if (rank === 'BRONZE') {
                    rankPath = getRankImagePath('Bronze III');
                  }
                  
                  // Extract season number from title name
                  const seasonMatch = title.name.match(/^S(\d+)\s/);
                  const seasonNum = seasonMatch ? seasonMatch[1] : '';
                  
                  return (
                    <>
                      <span 
                        className="text-xs font-bold leading-tight"
                        style={{ 
                          color: title.color, 
                          textShadow: '2px 2px 4px rgba(0,0,0,0.8)', 
                          ...glowStyle 
                        }}
                      >
                        {seasonNum && `S${seasonNum} `}
                      </span>
                      {rankPath && (
                        <img 
                          src={rankPath} 
                          alt={rank} 
                          className="h-4 w-auto object-contain inline-block"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      )}
                      <span 
                        className="text-xs font-bold leading-tight"
                        style={{ 
                          color: title.color, 
                          textShadow: '2px 2px 4px rgba(0,0,0,0.8)', 
                          ...glowStyle 
                        }}
                      >
                        TOURNAMENT WINNER
                      </span>
                    </>
                  );
                })() : (
                  <p 
                    className="text-xs font-bold leading-tight"
                    style={{ 
                      color: title.color, 
                      textShadow: '2px 2px 4px rgba(0,0,0,0.8)', 
                      ...glowStyle 
                    }}
                  >
                    {title.name.toUpperCase()}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <img
      src={bannerUrl}
      alt="Banner"
      className={`h-[65px] w-auto ${className}`}
      style={{ imageRendering: isGif ? 'auto' : 'crisp-edges' }}
    />
  );
}
