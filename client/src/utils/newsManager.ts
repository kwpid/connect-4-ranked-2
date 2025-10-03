export interface NewsItem {
  id: string;
  type: 'update' | 'news' | 'season';
  version?: string;
  title: string;
  content: string;
  date: number;
  season?: number | null;
}

export interface NewsState {
  lastReadId: string | null;
  readIds: string[];
  autoShowDisabled: boolean;
}

const STORAGE_KEY = 'connect_ranked_news';
const CURRENT_VERSION = '1.0.0';

export function getCurrentVersion(): string {
  return CURRENT_VERSION;
}

export async function loadNews(): Promise<NewsItem[]> {
  try {
    const response = await fetch('/data/news.json');
    const news: NewsItem[] = await response.json();
    return news.sort((a, b) => b.date - a.date);
  } catch (error) {
    console.error('Failed to load news:', error);
    return [];
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

export function generateSeasonNews(seasonNumber: number): NewsItem {
  return {
    id: `season_${seasonNumber}_end`,
    type: 'season',
    title: `Season ${seasonNumber} Has Ended!`,
    content: `Season ${seasonNumber} has concluded! Rewards have been distributed based on your final rank. Check your inventory for new titles and banners. The new season has begun - good luck climbing the ladder!`,
    date: Date.now(),
    season: seasonNumber
  };
}
