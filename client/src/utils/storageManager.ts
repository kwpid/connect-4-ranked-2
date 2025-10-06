import { PlayerData, AICompetitor, SeasonData, Title, TournamentData } from '../types/game';
import { generateAICompetitors, getCurrentSeasonData } from './seasonManager';

const STORAGE_KEYS = {
  PLAYER: 'connect_ranked_player',
  AI_COMPETITORS: 'connect_ranked_ai',
  SEASON: 'connect_ranked_season',
  SHOP_ROTATION: 'connect_ranked_shop',
  LAST_SEASON_CHECK: 'connect_ranked_last_check',
  TOURNAMENT: 'connect_ranked_tournament',
  NEXT_TOURNAMENT: 'connect_ranked_next_tournament'
};

export function getPlayerData(): PlayerData {
  const stored = localStorage.getItem(STORAGE_KEYS.PLAYER);
  if (stored) {
    const player = JSON.parse(stored);
    
    // Migrate existing players to have banner fields
    if (player.equippedBanner === undefined || player.equippedBanner === null) {
      player.equippedBanner = 1; // Default banner
      player.ownedBanners = [1]; // Default banner
      savePlayerData(player);
    }
    
    // Migrate existing players to have RP field
    if (player.rp === undefined) {
      player.rp = 0;
      savePlayerData(player);
    }
    
    // Migrate existing players to have PFP fields
    if (player.equippedPfp === undefined) {
      player.equippedPfp = 1; // Default PFP equipped by default
      player.ownedPfps = [1]; // Default PFP
      savePlayerData(player);
    }
    
    return player;
  }
  
  const defaultPlayer: PlayerData = {
    username: `Player${Math.floor(Math.random() * 10000)}`,
    trophies: 0,
    level: 1,
    xp: 0,
    coins: 500,
    rp: 0,
    equippedTitle: null,
    ownedTitles: [],
    equippedBanner: 1,
    ownedBanners: [1],
    equippedPfp: 1,
    ownedPfps: [1],
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

export function getTournamentData(): TournamentData | null {
  const stored = localStorage.getItem(STORAGE_KEYS.TOURNAMENT);
  return stored ? JSON.parse(stored) : null;
}

export function saveTournamentData(data: TournamentData | null): void {
  if (data === null) {
    localStorage.removeItem(STORAGE_KEYS.TOURNAMENT);
  } else {
    localStorage.setItem(STORAGE_KEYS.TOURNAMENT, JSON.stringify(data));
  }
}

export function getNextTournamentTime(): number | null {
  const stored = localStorage.getItem(STORAGE_KEYS.NEXT_TOURNAMENT);
  return stored ? parseInt(stored) : null;
}

export function saveNextTournamentTime(timestamp: number): void {
  localStorage.setItem(STORAGE_KEYS.NEXT_TOURNAMENT, timestamp.toString());
}
