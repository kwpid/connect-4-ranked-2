import React, { useState, useEffect } from 'react';
import { Banner, Title, Pfp } from '../../types/game';
import { loadBanners, getBannerById, getBannerImagePath } from '../../utils/bannerManager';
import { getTitleFromId } from '../../utils/titleManager';
import { loadPfps, getPfpById, getPfpImagePath } from '../../utils/pfpManager';

export interface NewItem {
  type: 'banner' | 'title' | 'pfp';
  banner?: Banner;
  title?: Title;
  pfp?: Pfp;
  titleId?: string;
}

interface ItemNotificationPopupProps {
  items: NewItem[];
  username: string;
  currentBannerId: number;
  currentTitleId: string | null;
  onClose: () => void;
}

export function ItemNotificationPopup({ 
  items, 
  username, 
  currentBannerId, 
  currentTitleId,
  onClose 
}: ItemNotificationPopupProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [bannerUrl, setBannerUrl] = useState<string | null>(null);

  const currentItem = items[currentIndex];
  const isLastItem = currentIndex === items.length - 1;

  useEffect(() => {
    if (currentItem.type === 'banner' && currentItem.banner) {
      loadBanners().then(banners => {
        const banner = getBannerById(currentItem.banner!.bannerId, banners);
        if (banner) {
          setBannerUrl(getBannerImagePath(banner.imageName));
        }
      });
    } else if (currentItem.type === 'title' && currentBannerId !== null && currentBannerId !== undefined) {
      loadBanners().then(banners => {
        const banner = getBannerById(currentBannerId, banners);
        if (banner) {
          setBannerUrl(getBannerImagePath(banner.imageName));
        }
      });
    }
  }, [currentItem, currentBannerId]);

  const handleNext = () => {
    if (isLastItem) {
      onClose();
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleOkToAll = () => {
    onClose();
  };

  const getItemName = () => {
    if (currentItem.type === 'banner') {
      return currentItem.banner?.bannerName || 'Unknown Banner';
    } else if (currentItem.type === 'pfp') {
      return currentItem.pfp?.pfpName || 'Unknown PFP';
    } else {
      const title = currentItem.titleId ? getTitleFromId(currentItem.titleId) : currentItem.title;
      return title?.name || 'Unknown Title';
    }
  };

  const renderItemPreview = () => {
    if (currentItem.type === 'banner' && currentItem.banner && bannerUrl) {
      const title = currentTitleId ? getTitleFromId(currentTitleId) : null;
      const glowStyle = title && title.glow && title.glow !== 'none' 
        ? { textShadow: `0 0 10px ${title.glow}, 0 0 20px ${title.glow}` }
        : {};

      return (
        <div className="relative inline-block scale-150">
          <img
            src={bannerUrl}
            alt="Banner"
            className="h-[62px] w-auto"
            style={{ imageRendering: 'crisp-edges' }}
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-white font-bold px-2 text-base" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
              {username}
            </span>
            {title && (
              <p 
                className="text-xs font-bold mt-0.5 px-1 leading-tight"
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
    } else if (currentItem.type === 'title') {
      const title = currentItem.titleId ? getTitleFromId(currentItem.titleId) : currentItem.title;
      if (!title) return null;

      const glowStyle = title.glow && title.glow !== 'none'
        ? { textShadow: `0 0 10px ${title.glow}, 0 0 20px ${title.glow}, 0 0 30px ${title.glow}` }
        : {};

      return (
        <div className="relative inline-block scale-150">
          {bannerUrl && (
            <img
              src={bannerUrl}
              alt="Banner"
              className="h-[62px] w-auto"
              style={{ imageRendering: 'crisp-edges' }}
            />
          )}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-white font-bold px-2 text-base" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
              {username}
            </span>
            <p 
              className="text-sm font-bold mt-0.5 px-1 leading-tight"
              style={{ 
                color: title.color, 
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)', 
                ...glowStyle 
              }}
            >
              {title.name.toUpperCase()}
            </p>
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl max-w-2xl w-full border-2 border-yellow-500 shadow-2xl shadow-yellow-500/20">
        {/* Header */}
        <div className="p-8 border-b border-gray-700">
          <h2 className="text-3xl font-bold text-center text-yellow-400">
            NEW ITEM: {getItemName()} ({currentItem.type === 'banner' ? 'BANNER' : currentItem.type === 'pfp' ? 'PFP' : 'TITLE'})
          </h2>
        </div>

        {/* Preview */}
        <div className="p-12 flex items-center justify-center min-h-[300px]">
          {renderItemPreview()}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-700 bg-gray-900/50">
          <div className="flex gap-4">
            {items.length > 1 && !isLastItem ? (
              <>
                <button
                  onClick={handleNext}
                  className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-semibold text-white"
                >
                  NEXT ({currentIndex + 1}/{items.length})
                </button>
                <button
                  onClick={handleOkToAll}
                  className="flex-1 px-6 py-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors font-semibold text-white"
                >
                  OK TO ALL
                </button>
              </>
            ) : (
              <button
                onClick={onClose}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-semibold text-white"
              >
                OK
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
