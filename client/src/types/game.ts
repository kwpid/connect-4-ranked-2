// Game types and interfaces

export type CellValue = 'empty' | 'player' | 'ai';

export type GameResult = 'player' | 'ai' | 'draw' | null;

export interface GameBoard {
  cells: CellValue[][];
}

export interface RankInfo {
  name: string;
  minTrophies: number;
  maxTrophies: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond' | 'champion' | 'grand_champion' | 'legend';
}

export interface Title {
  id: string;
  name: string;
  type: 'grey' | 'season' | 'leaderboard';
  color: string;
  glow: string;
  season?: number;
  price?: number;
}

export interface PlayerData {
  username: string;
  trophies: number;
  level: number;
  xp: number;
  coins: number;
  equippedTitle: string | null;
  ownedTitles: string[];
  wins: number;
  losses: number;
  totalGames: number;
  winStreak: number;
  losingStreak: number;
  currentSeasonWins: number;
  bestWinStreak: number;
  peakTrophies?: number;
  peakRank?: string;
  peakSeason?: number;
}

export interface AICompetitor {
  id: string;
  username: string;
  trophies: number;
  grindRate: number; // How aggressively they gain trophies
  lastUpdate: number;
}

export interface SeasonData {
  seasonNumber: number;
  startDate: number;
  endDate: number;
  leaderboard: LeaderboardEntry[];
}

export interface LeaderboardEntry {
  username: string;
  trophies: number;
  isPlayer: boolean;
  rank?: number;
  titleId?: string | null;
}

export interface ShopItem {
  id: string;
  title: Title;
  price: number;
}

export interface MatchState {
  currentGame: number; // 1, 2, or 3
  playerWins: number;
  aiWins: number;
  board: GameBoard;
  currentPlayer: 'player' | 'ai';
  winner: GameResult;
  matchWinner: 'player' | 'ai' | null;
}

export type Screen = 'menu' | 'queue' | 'game' | 'practice' | 'leaderboard' | 'shop' | 'stats' | 'settings' | 'titleSelector' | 'rankInfo';
