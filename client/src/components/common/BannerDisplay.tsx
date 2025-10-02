import React, { useState, useEffect } from 'react';
import { loadBanners, getBannerById, getBannerImagePath } from '../../utils/bannerManager';

interface BannerDisplayProps {
  bannerId: number | null;
  username?: string;
  className?: string;
}

export function BannerDisplay({ bannerId, username, className = '' }: BannerDisplayProps) {
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
    return (
      <div className={`inline-block relative ${className}`}>
        <img
          src={bannerUrl}
          alt="Banner"
          className="h-[50px] w-auto"
          style={{ imageRendering: 'crisp-edges' }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-bold px-2 text-shadow-lg" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
            {username}
          </span>
        </div>
      </div>
    );
  }

  return (
    <img
      src={bannerUrl}
      alt="Banner"
      className={`h-[50px] w-auto ${className}`}
      style={{ imageRendering: 'crisp-edges' }}
    />
  );
}
