import { PlayerData, AICompetitor, SeasonData, Title } from '../types/game';
import { generateAICompetitors, getCurrentSeasonData } from './seasonManager';

const STORAGE_KEYS = {
  PLAYER: 'connect_ranked_player',
  AI_COMPETITORS: 'connect_ranked_ai',
  SEASON: 'connect_ranked_season',
  SHOP_ROTATION: 'connect_ranked_shop',
  LAST_SEASON_CHECK: 'connect_ranked_last_check'
};

export function getPlayerData(): PlayerData {
  const stored = localStorage.getItem(STORAGE_KEYS.PLAYER);
  if (stored) {
    return JSON.parse(stored);
  }
  
  const defaultPlayer: PlayerData = {
    username: `Player${Math.floor(Math.random() * 10000)}`,
    trophies: 0,
    level: 1,
    xp: 0,
    coins: 500,
    equippedTitle: null,
    ownedTitles: [],
    wins: 0,
    losses: 0,
    totalGames: 0,
    winStreak: 0,
    losingStreak: 0,
    currentSeasonWins: 0,
    bestWinStreak: 0,
    peakTrophies: 0,
    peakRank: 'Bronze I',
    peakSeason: 1
  };
  
  savePlayerData(defaultPlayer);
  return defaultPlayer;
}

export function savePlayerData(data: PlayerData): void {
  localStorage.setItem(STORAGE_KEYS.PLAYER, JSON.stringify(data));
}

export function getAICompetitors(): AICompetitor[] {
  const stored = localStorage.getItem(STORAGE_KEYS.AI_COMPETITORS);
  if (stored) {
    return JSON.parse(stored);
  }
  
  const competitors = generateAICompetitors();
  saveAICompetitors(competitors);
  return competitors;
}

export function saveAICompetitors(competitors: AICompetitor[]): void {
  localStorage.setItem(STORAGE_KEYS.AI_COMPETITORS, JSON.stringify(competitors));
}

export function getSeasonData(): SeasonData {
  const stored = localStorage.getItem(STORAGE_KEYS.SEASON);
  const current = getCurrentSeasonData();
  
  if (stored) {
    const saved: SeasonData = JSON.parse(stored);
    // Check if it's the same season
    if (saved.seasonNumber === current.seasonNumber) {
      return saved;
    }
  }
  
  saveSeasonData(current);
  return current;
}

export function saveSeasonData(data: SeasonData): void {
  localStorage.setItem(STORAGE_KEYS.SEASON, JSON.stringify(data));
}

export function getLastSeasonCheck(): number {
  const stored = localStorage.getItem(STORAGE_KEYS.LAST_SEASON_CHECK);
  return stored ? parseInt(stored) : 0;
}

export function saveLastSeasonCheck(timestamp: number): void {
  localStorage.setItem(STORAGE_KEYS.LAST_SEASON_CHECK, timestamp.toString());
}

export function getShopRotation(): number {
  const stored = localStorage.getItem(STORAGE_KEYS.SHOP_ROTATION);
  return stored ? parseInt(stored) : 0;
}

export function saveShopRotation(timestamp: number): void {
  localStorage.setItem(STORAGE_KEYS.SHOP_ROTATION, timestamp.toString());
}
