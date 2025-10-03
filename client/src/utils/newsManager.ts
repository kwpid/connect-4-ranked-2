export interface NewsContentBlock {
  type: 'paragraph' | 'heading' | 'list' | 'image';
  content?: string;
  items?: string[];
  imageUrl?: string;
  imageAlt?: string;
  level?: number;
}

export interface NewsItem {
  id: string;
  type: 'update' | 'news' | 'season';
  version?: string;
  title: string;
  content: string | NewsContentBlock[];
  date: string;
  releaseDate?: string;
  season?: number | null;
}

export interface NewsState {
  lastReadId: string | null;
  readIds: string[];
  autoShowDisabled: boolean;
}

const STORAGE_KEY = 'connect_ranked_news';
const DYNAMIC_NEWS_KEY = 'connect_ranked_dynamic_news';
const CURRENT_VERSION = '1.0.0';

export function getCurrentVersion(): string {
  return CURRENT_VERSION;
}

function getDynamicNews(): NewsItem[] {
  const stored = localStorage.getItem(DYNAMIC_NEWS_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return [];
}

function saveDynamicNews(news: NewsItem[]): void {
  localStorage.setItem(DYNAMIC_NEWS_KEY, JSON.stringify(news));
}

export function addDynamicNews(newsItem: NewsItem): void {
  const existing = getDynamicNews();
  const updated = [newsItem, ...existing];
  saveDynamicNews(updated);
}

function parseDateString(dateStr: string): Date {
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const [month, day, year] = parts;
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  }
  return new Date(dateStr);
}

function isNewsAvailable(newsItem: NewsItem): boolean {
  if (!newsItem.releaseDate) return true;
  
  const releaseDate = parseDateString(newsItem.releaseDate);
  const now = new Date();
  return now >= releaseDate;
}

export async function loadNews(): Promise<NewsItem[]> {
  try {
    const response = await fetch('/data/news.json');
    const staticNews: NewsItem[] = await response.json();
    const dynamicNews = getDynamicNews();
    const allNews = [...dynamicNews, ...staticNews]
      .filter(isNewsAvailable)
      .sort((a, b) => parseDateString(b.date).getTime() - parseDateString(a.date).getTime());
    return allNews;
  } catch (error) {
    console.error('Failed to load news:', error);
    return getDynamicNews()
      .filter(isNewsAvailable)
      .sort((a, b) => parseDateString(b.date).getTime() - parseDateString(a.date).getTime());
  }
}

export function getNewsState(): NewsState {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    return JSON.parse(stored);
  }
  return {
    lastReadId: null,
    readIds: [],
    autoShowDisabled: false
  };
}

export function saveNewsState(state: NewsState): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function markNewsAsRead(newsId: string): void {
  const state = getNewsState();
  if (!state.readIds.includes(newsId)) {
    state.readIds.push(newsId);
  }
  state.lastReadId = newsId;
  saveNewsState(state);
}

export function markAllNewsAsRead(news: NewsItem[]): void {
  const state = getNewsState();
  news.forEach(item => {
    if (!state.readIds.includes(item.id)) {
      state.readIds.push(item.id);
    }
  });
  if (news.length > 0) {
    state.lastReadId = news[0].id;
  }
  saveNewsState(state);
}

export function hasUnreadNews(news: NewsItem[]): boolean {
  const state = getNewsState();
  return news.some(item => !state.readIds.includes(item.id));
}

export function getUnreadCount(news: NewsItem[]): number {
  const state = getNewsState();
  return news.filter(item => !state.readIds.includes(item.id)).length;
}

export function setAutoShowDisabled(disabled: boolean): void {
  const state = getNewsState();
  state.autoShowDisabled = disabled;
  saveNewsState(state);
}

export function shouldAutoShowNews(news: NewsItem[]): boolean {
  const state = getNewsState();
  if (state.autoShowDisabled) return false;
  return hasUnreadNews(news);
}

export function filterNewsByType(news: NewsItem[], type: 'all' | 'update' | 'news' | 'season'): NewsItem[] {
  if (type === 'all') return news;
  return news.filter(item => item.type === type);
}

function getCurrentDateString(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const year = now.getFullYear();
  return `${month}-${day}-${year}`;
}

export function generateSeasonNews(seasonNumber: number): NewsItem {
  return {
    id: `season_${seasonNumber}_end`,
    type: 'season',
    title: `Season ${seasonNumber} Has Ended!`,
    content: `Season ${seasonNumber} has concluded! Rewards have been distributed based on your final rank. Check your inventory for new titles and banners. The new season has begun - good luck climbing the ladder!`,
    date: getCurrentDateString(),
    season: seasonNumber
  };
}
