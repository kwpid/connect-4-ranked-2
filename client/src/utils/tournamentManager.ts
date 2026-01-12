import { TournamentData, TournamentParticipant, TournamentMatch, TournamentBracket, AICompetitor, PlayerData } from '../types/game';
import { nanoid } from 'nanoid';

const TOURNAMENT_INTERVAL = 10 * 60 * 1000; // 10 minutes
const REGISTRATION_TIME = 3 * 60 * 1000; // 3 minutes before start

export function getNextTournamentTime(currentTime: number = Date.now()): number {
  // Calculate next tournament start time (every 10 minutes on the clock)
  const minutesSinceEpoch = Math.floor(currentTime / (60 * 1000));
  const nextTournamentMinute = Math.ceil(minutesSinceEpoch / 10) * 10;
  return nextTournamentMinute * 60 * 1000;
}

export function getTournamentRegistrationTime(tournamentStartTime: number): number {
  return tournamentStartTime - REGISTRATION_TIME;
}

export function canRegisterForTournament(currentTime: number, tournamentStartTime: number): boolean {
  const registrationTime = getTournamentRegistrationTime(tournamentStartTime);
  return currentTime >= registrationTime && currentTime < tournamentStartTime;
}

export function isTournamentInProgress(tournament: TournamentData | null, currentTime: number): boolean {
  if (!tournament) return false;
  return tournament.status === 'in_progress' || tournament.status === 'registration';
}

export function createNewTournament(startTime: number): TournamentData {
  return {
    id: nanoid(),
    startTime,
    registrationOpenTime: getTournamentRegistrationTime(startTime),
    status: 'registration',
    participants: [],
    bracket: null,
    playerPlacement: null,
    playerReward: 0
  };
}

export function generateAIParticipants(
  aiCompetitors: AICompetitor[],
  playerTrophies: number,
  count: number,
  currentSeasonNumber: number
): TournamentParticipant[] {
  // Strictly enforce trophy range - only use AI within ±150 trophies
  const MAX_TROPHY_RANGE = 150;
  const similarAI = aiCompetitors.filter(ai => 
    Math.abs(ai.trophies - playerTrophies) <= MAX_TROPHY_RANGE
  );
  
  // If not enough AI in range, use what we have and fill the rest with duplicates
  const participants: TournamentParticipant[] = [];
  const usedIds = new Set<string>();
  
  if (similarAI.length === 0) {
    // No suitable opponents - should not happen with proper AI generation
    console.warn('No AI opponents within trophy range for tournament');
    return participants;
  }
  
  for (let i = 0; i < count; i++) {
    let ai: AICompetitor;
    
    // Pick from similar trophy range pool only
    const availableAI = similarAI.filter(a => !usedIds.has(a.id));
    
    if (availableAI.length > 0) {
      ai = availableAI[Math.floor(Math.random() * availableAI.length)];
      usedIds.add(ai.id);
    } else {
      // If we've used all unique AI, allow duplicates from the pool
      ai = similarAI[Math.floor(Math.random() * similarAI.length)];
    }
    
    // Generate appropriate title for AI based on rank and season
    const titleId = generateAITournamentTitle(ai.trophies, currentSeasonNumber);
    
    participants.push({
      id: ai.id,
      username: ai.username,
      trophies: ai.trophies,
      isPlayer: false,
      titleId
    });
  }
  
  return participants;
}

function generateAITournamentTitle(trophies: number, currentSeasonNumber: number): string | null {
  // Only give tournament titles to AI if they have appropriate rank
  if (trophies < 33) return null; // Bronze II minimum for titles
  
  // Random chance to have a tournament title (higher rank = higher chance)
  const titleChance = Math.min(0.3 + (trophies / 1000) * 0.5, 0.8);
  if (Math.random() > titleChance) return null;
  
  // Determine rank tier - use highest division (III) for each rank
  let rankName = '';
  let tier = '';
  
  if (trophies >= 701) { rankName = 'CONNECT LEGEND'; tier = 'connect_legend'; }
  else if (trophies >= 599) { rankName = 'GRAND CHAMPION III'; tier = 'grand_champion_iii'; }
  else if (trophies >= 497) { rankName = 'CHAMPION III'; tier = 'champion_iii'; }
  else if (trophies >= 396) { rankName = 'DIAMOND III'; tier = 'diamond_iii'; }
  else if (trophies >= 297) { rankName = 'PLATINUM III'; tier = 'platinum_iii'; }
  else if (trophies >= 198) { rankName = 'GOLD III'; tier = 'gold_iii'; }
  else if (trophies >= 99) { rankName = 'SILVER III'; tier = 'silver_iii'; }
  else { rankName = 'BRONZE III'; tier = 'bronze_iii'; }
  
  // Determine season (ONLY prior seasons, never current)
  // AI should only have tournament titles from completed seasons
  // Ensure we don't pick currentSeasonNumber
  const maxPriorSeason = Math.max(1, currentSeasonNumber - 1);
  const season = currentSeasonNumber === 1 ? 1 : 
    maxPriorSeason - Math.floor(Math.random() * Math.min(3, maxPriorSeason));
  
  // If we accidentally picked current season, force to a prior one
  const finalSeason = (season === currentSeasonNumber && currentSeasonNumber > 1) ? currentSeasonNumber - 1 : season;
  
  // Determine if multi-win title (3+ wins)
  const isMultiWin = Math.random() < 0.2; // 20% chance
  
  return `S${finalSeason} ${rankName} TOURNAMENT WINNER${isMultiWin ? '_MULTI' : ''}`;
}

export function registerPlayerForTournament(
  tournament: TournamentData,
  player: PlayerData
): TournamentData {
  const playerParticipant: TournamentParticipant = {
    id: 'player',
    username: player.username,
    trophies: player.trophies,
    isPlayer: true,
    titleId: player.equippedTitle
  };
  
  return {
    ...tournament,
    participants: [playerParticipant]
  };
}

export function startTournament(
  tournament: TournamentData,
  aiCompetitors: AICompetitor[],
  playerData: PlayerData,
  currentSeasonNumber: number
): TournamentData {
  // Check if player registered
  const isPlayerRegistered = tournament.participants.some(p => p.isPlayer);
  
  // Generate AI participants - 15 if player registered, 16 if not
  const aiCount = isPlayerRegistered ? 15 : 16;
  const aiParticipants = generateAIParticipants(
    aiCompetitors,
    playerData.trophies,
    aiCount,
    currentSeasonNumber
  );
  
  // Combine with player only if they registered
  let allParticipants: TournamentParticipant[];
  if (isPlayerRegistered) {
    allParticipants = [...tournament.participants, ...aiParticipants];
  } else {
    // Player didn't register, tournament proceeds with only AI
    allParticipants = aiParticipants;
  }
  
  // Shuffle participants for random seeding
  const shuffled = [...allParticipants].sort(() => Math.random() - 0.5);
  
  // Create bracket
  const bracket = createBracket(shuffled);
  
  return {
    ...tournament,
    status: 'in_progress',
    participants: shuffled,
    bracket
  };
}

function createBracket(participants: TournamentParticipant[]): TournamentBracket {
  // Round 1: 16 -> 8 (Best of 3)
  const round1: TournamentMatch[] = [];
  for (let i = 0; i < 16; i += 2) {
    round1.push({
      id: nanoid(),
      participant1: participants[i],
      participant2: participants[i + 1],
      winner: null,
      round: 1,
      bestOf: 3
    });
  }
  
  return {
    round1,
    round2: [],
    round3: [],
    finals: []
  };
}

export function simulateAIMatch(match: TournamentMatch): TournamentParticipant {
  const p1 = match.participant1;
  const p2 = match.participant2;
  
  // Calculate win probability based on trophy difference
  const trophyDiff = p1.trophies - p2.trophies;
  const baseProb = 0.5;
  const trophyFactor = trophyDiff / 200; // ±200 trophies = ±0.5 probability
  const p1WinProb = Math.max(0.1, Math.min(0.9, baseProb + trophyFactor));
  
  // Simulate best of series
  let p1Wins = 0;
  let p2Wins = 0;
  const winsNeeded = Math.ceil(match.bestOf / 2);
  
  while (p1Wins < winsNeeded && p2Wins < winsNeeded) {
    if (Math.random() < p1WinProb) {
      p1Wins++;
    } else {
      p2Wins++;
    }
  }
  
  return p1Wins > p2Wins ? p1 : p2;
}

export function advanceTournamentRound(bracket: TournamentBracket, round: number): TournamentBracket {
  if (round === 1) {
    // Process round 1, create round 2
    const winners = bracket.round1.map(match => match.winner!).filter(Boolean);
    const round2: TournamentMatch[] = [];
    
    for (let i = 0; i < winners.length; i += 2) {
      round2.push({
        id: nanoid(),
        participant1: winners[i],
        participant2: winners[i + 1],
        winner: null,
        round: 2,
        bestOf: 3
      });
    }
    
    return { ...bracket, round2 };
  } else if (round === 2) {
    // Process round 2, create round 3
    const winners = bracket.round2.map(match => match.winner!).filter(Boolean);
    const round3: TournamentMatch[] = [];
    
    for (let i = 0; i < winners.length; i += 2) {
      round3.push({
        id: nanoid(),
        participant1: winners[i],
        participant2: winners[i + 1],
        winner: null,
        round: 3,
        bestOf: 3
      });
    }
    
    return { ...bracket, round3 };
  } else if (round === 3) {
    // Process round 3, create finals
    const winners = bracket.round3.map(match => match.winner!).filter(Boolean);
    const finals: TournamentMatch[] = [{
      id: nanoid(),
      participant1: winners[0],
      participant2: winners[1],
      winner: null,
      round: 4,
      bestOf: 5 // Finals is best of 5
    }];
    
    return { ...bracket, finals };
  }
  
  return bracket;
}

export function getPlayerPlacement(bracket: TournamentBracket, isPlayer: boolean): number {
  if (!isPlayer) return 16;
  
  // Check which round player lost in
  if (bracket.finals.length > 0 && bracket.finals[0].winner) {
    return bracket.finals[0].winner.isPlayer ? 1 : 2;
  }
  
  if (bracket.round3.length > 0) {
    const playerInSemis = bracket.round3.some(m => 
      m.participant1.isPlayer || m.participant2.isPlayer
    );
    if (playerInSemis) return 4; // Lost in semis
  }
  
  if (bracket.round2.length > 0) {
    const playerInQuarters = bracket.round2.some(m => 
      m.participant1.isPlayer || m.participant2.isPlayer
    );
    if (playerInQuarters) return 8; // Lost in quarters
  }
  
  return 16; // Lost in round 1
}

export function calculateTournamentReward(placement: number): number {
  if (placement === 1) return 5000;
  if (placement <= 4) return 2000;
  if (placement <= 8) return 1000;
  return 0;
}

export function getTournamentTitle(
  placement: number,
  playerTrophies: number,
  seasonNumber: number,
  currentSeasonWins: number
): string | null {
  if (placement !== 1) return null;
  
  // Determine rank tier
  let rankName = '';
  
  if (playerTrophies >= 701) rankName = 'CONNECT LEGEND';
  else if (playerTrophies >= 551) rankName = 'GRAND CHAMPION';
  else if (playerTrophies >= 401) rankName = 'CHAMPION';
  else if (playerTrophies >= 276) rankName = 'DIAMOND';
  else if (playerTrophies >= 176) rankName = 'PLATINUM';
  else if (playerTrophies >= 101) rankName = 'GOLD';
  else if (playerTrophies >= 51) rankName = 'SILVER';
  else rankName = 'BRONZE';
  
  // Check if multi-win (3+ wins this season)
  const suffix = currentSeasonWins >= 3 ? '_MULTI' : '';
  
  return `S${seasonNumber} ${rankName} TOURNAMENT WINNER${suffix}`;
}

export function shouldShowTournamentTimer(currentTime: number, tournamentStartTime: number | null): boolean {
  if (!tournamentStartTime) return true;
  const timeUntilTournament = tournamentStartTime - currentTime;
  return timeUntilTournament <= REGISTRATION_TIME;
}

export function getTimeUntilTournament(currentTime: number, tournamentStartTime: number): string {
  const diff = tournamentStartTime - currentTime;
  
  if (diff <= 0) return "Starting...";
  
  const minutes = Math.floor(diff / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
