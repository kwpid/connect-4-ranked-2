import React, { useState, useEffect } from 'react';
import { loadBanners, getBannerById, getBannerImagePath } from '../../utils/bannerManager';
import { getTitleFromId } from '../../utils/titleManager';

interface BannerDisplayProps {
  bannerId: number | null;
  username?: string;
  titleId?: string | null;
  className?: string;
}

export function BannerDisplay({ bannerId, username, titleId, className = '' }: BannerDisplayProps) {
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);

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

  if (!bannerId || !bannerUrl) {
    return username ? <span className={className}>{username}</span> : null;
  }

  if (username) {
    const title = titleId ? getTitleFromId(titleId) : null;
    const glowStyle = title && title.glow && title.glow !== 'none' 
      ? { textShadow: `0 0 10px ${title.glow}, 0 0 20px ${title.glow}` }
      : {};
    
    // Dynamic title size based on length - bigger text that scales down for longer titles
    const getTitleSizeClass = (titleName: string) => {
      const length = titleName.length;
      if (length <= 10) return 'text-sm'; // Small titles: bigger text (14px)
      if (length <= 20) return 'text-xs'; // Medium titles: medium text (12px)
      if (length <= 30) return 'text-[11px]'; // Long titles: smaller text (11px)
      return 'text-[10px]'; // Very long titles: smallest text (10px)
    };
    
    return (
      <div className={`inline-block relative ${className}`}>
        <img
          src={bannerUrl}
          alt="Banner"
          className="h-[62px] w-auto"
          style={{ imageRendering: 'crisp-edges' }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-white font-bold px-2 text-shadow-lg text-base" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
            {username}
          </span>
          {title && (
            <p 
              className={`${getTitleSizeClass(title.name)} font-bold mt-0.5 px-1 leading-tight`}
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
      </div>
    );
  }

  return (
    <img
      src={bannerUrl}
      alt="Banner"
      className={`h-[65px] w-auto ${className}`}
      style={{ imageRendering: 'crisp-edges' }}
    />
  );
}
