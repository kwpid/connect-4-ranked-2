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

export type ItemRarity = 'common' | 'regular' | 'special' | 'deluxe' | 'exotic' | 'blackmarket' | 'legacy';

export type ItemAttribute = 'certified' | 'painted' | 'animated' | 'seasonal' | 'win_tracker';

export interface Title {
  id: string;
  name: string;
  type: 'grey' | 'season' | 'leaderboard' | 'tournament';
  color: string;
  glow: string;
  season?: number;
  price?: number;
  rankImage?: string;
}

export interface Banner {
  bannerId: number;
  bannerName: string;
  imageName: string;
  fileType?: 'png' | 'gif';
  price: number | null;
  ranked: boolean;
  season: number | null;
  rank: string | null;
  offSale?: boolean;
  rarity?: ItemRarity;
  attributes?: ItemAttribute[];
  description?: string;
}

export interface Pfp {
  pfpId: number;
  pfpName: string;
  imageName: string;
  fileType?: 'png' | 'gif';
  price: number | null;
  ranked: boolean;
  season: number | null;
  rank: string | null;
  offSale?: boolean;
  rarity?: ItemRarity;
  attributes?: ItemAttribute[];
  description?: string;
}

export interface MatchHistoryEntry {
  result: 'win' | 'loss';
  score: string;
  trophyChange: number;
  opponentName: string;
  opponentTrophies: number;
  timestamp: number;
  trophyBefore?: number;
  trophyAfter?: number;
}

export interface PlayerData {
  username: string;
  trophies: number;
  level: number;
  xp: number;
  coins: number;
  rp: number;
  equippedTitle: string | null;
  ownedTitles: string[];
  equippedBanner: number | null;
  ownedBanners: number[];
  equippedPfp: number | null;
  ownedPfps: number[];
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
  matchHistory?: MatchHistoryEntry[];
  tournamentStats?: PlayerTournamentStats;
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
  title?: Title;
  banner?: Banner;
  pfp?: Pfp;
  price: number;
}

export interface FeaturedItem {
  id: string;
  title?: Title;
  banner?: Banner;
  pfp?: Pfp;
  price: number;
  expiresAt: number; // Timestamp when this item should be removed
  duration: string; // Human-readable duration like "24h", "7d", "2w"
}

export interface CrateReward {
  type: 'banner' | 'title' | 'pfp';
  id: number | string;
  dropRate: number;
}

export interface Crate {
  crateId: number;
  crateName: string;
  crateImage: string;
  price: number;
  description: string;
  rewards: CrateReward[];
}

export interface CrateOpenResult {
  reward: CrateReward;
  item: Banner | Title | Pfp;
  isDuplicate: boolean;
  refundAmount: number;
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

export interface TournamentParticipant {
  id: string;
  username: string;
  trophies: number;
  isPlayer: boolean;
  titleId?: string | null;
}

export interface TournamentMatch {
  id: string;
  participant1: TournamentParticipant;
  participant2: TournamentParticipant;
  winner: TournamentParticipant | null;
  round: number;
  bestOf: number;
}

export interface TournamentBracket {
  round1: TournamentMatch[];
  round2: TournamentMatch[];
  round3: TournamentMatch[];
  finals: TournamentMatch[];
}

export interface TournamentData {
  id: string;
  startTime: number;
  registrationOpenTime: number;
  status: 'registration' | 'in_progress' | 'completed';
  participants: TournamentParticipant[];
  bracket: TournamentBracket | null;
  playerPlacement: number | null;
  playerReward: number;
}

export interface PlayerTournamentStats {
  tournamentsWon: number;
  tournamentsPlayed: number;
  currentSeasonWins: number;
  lastTournamentLeft: number | null;
}

export type Screen = 'menu' | 'playMenu' | 'queue' | 'game' | 'practice' | 'leaderboard' | 'shop' | 'stats' | 'settings' | 'titleSelector' | 'rankInfo' | 'tournament' | 'tournamentGame' | 'inventory' | 'csl';
