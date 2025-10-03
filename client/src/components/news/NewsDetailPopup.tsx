import React from 'react';
import { NewsItem } from '../../utils/newsManager';

interface NewsDetailPopupProps {
  newsItem: NewsItem;
  onClose: () => void;
}

export function NewsDetailPopup({ newsItem, onClose }: NewsDetailPopupProps) {
  const formatDate = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const [month, day, year] = parts;
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric'
      });
    }
    return dateStr;
  };
  
  const renderContent = () => {
    if (typeof newsItem.content === 'string') {
      return (
        <p className="text-gray-200 text-lg leading-relaxed whitespace-pre-wrap">
          {newsItem.content}
        </p>
      );
    }
    
    return newsItem.content.map((block, index) => {
      switch (block.type) {
        case 'heading':
          const HeadingTag = `h${block.level || 2}` as keyof JSX.IntrinsicElements;
          return (
            <HeadingTag key={index} className="text-white font-bold mb-4" style={{ fontSize: block.level === 2 ? '1.5rem' : '1.25rem' }}>
              {block.content}
            </HeadingTag>
          );
        case 'paragraph':
          return (
            <p key={index} className="text-gray-200 text-lg leading-relaxed mb-4">
              {block.content}
            </p>
          );
        case 'list':
          return (
            <ul key={index} className="list-disc list-inside text-gray-200 text-lg mb-4 space-y-2">
              {block.items?.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          );
        case 'image':
          return (
            <img 
              key={index} 
              src={block.imageUrl} 
              alt={block.imageAlt || ''} 
              className="w-full rounded-lg mb-4"
            />
          );
        default:
          return null;
      }
    });
  };
  
  const getTypeColor = (type: NewsItem['type']) => {
    switch (type) {
      case 'update': return 'bg-blue-600';
      case 'news': return 'bg-green-600';
      case 'season': return 'bg-purple-600';
      default: return 'bg-gray-600';
    }
  };
  
  const getTypeLabel = (type: NewsItem['type']) => {
    switch (type) {
      case 'update': return 'Update';
      case 'news': return 'News';
      case 'season': return 'Season';
      default: return type;
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl max-w-4xl w-full max-h-[85vh] flex flex-col border-2 border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="p-8 border-b border-gray-700">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-4 py-2 rounded-full text-sm font-bold text-white ${getTypeColor(newsItem.type)}`}>
                  {getTypeLabel(newsItem.type)}
                </span>
                {newsItem.version && (
                  <span className="px-4 py-2 bg-gray-700 rounded-full text-sm font-bold text-gray-300">
                    v{newsItem.version}
                  </span>
                )}
                {newsItem.season && (
                  <span className="px-4 py-2 bg-purple-700 rounded-full text-sm font-bold text-white">
                    Season {newsItem.season}
                  </span>
                )}
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">{newsItem.title}</h1>
              <p className="text-gray-400 text-sm">{formatDate(newsItem.date)}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-3xl font-bold px-4 py-2 hover:bg-gray-800 rounded-lg transition-colors ml-4"
            >
              ×
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="prose prose-invert max-w-none">
            {renderContent()}
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-6 border-t border-gray-700 bg-gray-900/50">
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-semibold text-white"
          >
            Back to News Feed
          </button>
        </div>
      </div>
    </div>
  );
}
