import React, { useState, useEffect } from 'react';
import { NewsItem, loadNews, getNewsState, markNewsAsRead, markAllNewsAsRead, filterNewsByType } from '../../utils/newsManager';
import { NewsDetailPopup } from './NewsDetailPopup';

interface NewsFeedPopupProps {
  onClose: () => void;
  autoOpened?: boolean;
}

type TabType = 'all' | 'update' | 'news' | 'season';

export function NewsFeedPopup({ onClose, autoOpened = false }: NewsFeedPopupProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [selectedTab, setSelectedTab] = useState<TabType>('all');
  const [loading, setLoading] = useState(true);
  const [selectedNewsItem, setSelectedNewsItem] = useState<NewsItem | null>(null);
  const newsState = getNewsState();
  
  useEffect(() => {
    loadNews().then(newsData => {
      setNews(newsData);
      setLoading(false);
      
      // Auto-mark as read when opened
      if (autoOpened && newsData.length > 0) {
        markNewsAsRead(newsData[0].id);
      }
    });
  }, [autoOpened]);
  
  const filteredNews = filterNewsByType(news, selectedTab);
  
  const handleMarkAllRead = () => {
    markAllNewsAsRead(news);
    window.location.reload();
  };
  
  const formatDate = (dateStr: string) => {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const [month, day, year] = parts;
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }
    return dateStr;
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
  
  const isUnread = (newsId: string) => !newsState.readIds.includes(newsId);
  
  const handleNewsItemClick = (item: NewsItem) => {
    setSelectedNewsItem(item);
    if (isUnread(item.id)) {
      markNewsAsRead(item.id);
    }
  };
  
  const truncateContent = (content: string | any[], maxLength: number = 120) => {
    if (typeof content === 'string') {
      if (content.length <= maxLength) return content;
      return content.substring(0, maxLength) + '...';
    }
    
    const firstBlock = content.find(block => block.type === 'paragraph' && block.content);
    if (firstBlock && firstBlock.content) {
      if (firstBlock.content.length <= maxLength) return firstBlock.content;
      return firstBlock.content.substring(0, maxLength) + '...';
    }
    return 'Click to read more...';
  };
  
  if (selectedNewsItem) {
    return (
      <NewsDetailPopup
        newsItem={selectedNewsItem}
        onClose={() => setSelectedNewsItem(null)}
      />
    );
  }
  
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-xl max-w-3xl w-full max-h-[80vh] flex flex-col border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white">News Feed</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl font-bold px-3 py-1 hover:bg-gray-800 rounded transition-colors"
            >
              ×
            </button>
          </div>
          
          {/* Tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedTab('all')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                selectedTab === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedTab('update')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                selectedTab === 'update' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Updates
            </button>
            <button
              onClick={() => setSelectedTab('news')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                selectedTab === 'news' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              News
            </button>
            <button
              onClick={() => setSelectedTab('season')}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                selectedTab === 'season' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              Season
            </button>
            <button
              onClick={handleMarkAllRead}
              className="ml-auto px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm font-semibold transition-colors"
            >
              Mark All Read
            </button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center text-gray-400 py-8">Loading news...</div>
          ) : filteredNews.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              No {selectedTab !== 'all' ? selectedTab : ''} news available.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredNews.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleNewsItemClick(item)}
                  className={`bg-gray-800/50 backdrop-blur rounded-xl p-5 border transition-all cursor-pointer hover:bg-gray-800/70 ${
                    isUnread(item.id) 
                      ? 'border-blue-500 shadow-lg shadow-blue-500/20 hover:border-blue-400' 
                      : 'border-gray-700 hover:border-gray-600'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${getTypeColor(item.type)}`}>
                        {getTypeLabel(item.type)}
                      </span>
                      {item.version && (
                        <span className="px-3 py-1 bg-gray-700 rounded-full text-xs font-bold text-gray-300">
                          v{item.version}
                        </span>
                      )}
                      {item.season && (
                        <span className="px-3 py-1 bg-purple-700 rounded-full text-xs font-bold text-white">
                          Season {item.season}
                        </span>
                      )}
                      {isUnread(item.id) && (
                        <span className="px-3 py-1 bg-blue-500 rounded-full text-xs font-bold text-white animate-pulse">
                          NEW
                        </span>
                      )}
                    </div>
                    <span className="text-gray-400 text-sm">{formatDate(item.date)}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{truncateContent(item.content)}</p>
                  <p className="text-blue-400 text-sm mt-2 font-semibold">Click to read more →</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
