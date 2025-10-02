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
  // Find AI with similar trophy range (±100)
  const similarAI = aiCompetitors.filter(ai => 
    Math.abs(ai.trophies - playerTrophies) <= 100
  );
  
  const participants: TournamentParticipant[] = [];
  const usedIds = new Set<string>();
  
  for (let i = 0; i < count; i++) {
    let ai: AICompetitor;
    
    if (similarAI.length > 0 && Math.random() < 0.7) {
      // 70% chance to pick from similar trophy range
      ai = similarAI[Math.floor(Math.random() * similarAI.length)];
    } else {
      // 30% chance to pick any AI
      ai = aiCompetitors[Math.floor(Math.random() * aiCompetitors.length)];
    }
    
    // Avoid duplicates
    if (usedIds.has(ai.id)) {
      i--;
      continue;
    }
    
    usedIds.add(ai.id);
    
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
  if (trophies < 41) return null; // Bronze V minimum for titles
  
  // Random chance to have a tournament title (higher rank = higher chance)
  const titleChance = Math.min(0.3 + (trophies / 1000) * 0.5, 0.8);
  if (Math.random() > titleChance) return null;
  
  // Determine rank tier
  let rankName = '';
  let tier = '';
  
  if (trophies >= 701) { rankName = 'CONNECT LEGEND'; tier = 'legend'; }
  else if (trophies >= 551) { rankName = 'GRAND CHAMPION'; tier = 'grand_champion'; }
  else if (trophies >= 401) { rankName = 'CHAMPION'; tier = 'champion'; }
  else if (trophies >= 276) { rankName = 'DIAMOND'; tier = 'diamond'; }
  else if (trophies >= 176) { rankName = 'PLATINUM'; tier = 'platinum'; }
  else if (trophies >= 101) { rankName = 'GOLD'; tier = 'gold'; }
  else if (trophies >= 51) { rankName = 'SILVER'; tier = 'silver'; }
  else { rankName = 'BRONZE'; tier = 'bronze'; }
  
  // Determine season (current or previous)
  const season = currentSeasonNumber === 1 ? 1 : 
    Math.random() < 0.7 ? currentSeasonNumber : currentSeasonNumber - 1;
  
  // Determine if multi-win title (3+ wins)
  const isMultiWin = Math.random() < 0.2; // 20% chance
  
  return `S${season} ${rankName} TOURNAMENT WINNER${isMultiWin ? '_MULTI' : ''}`;
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
  // Generate 15 AI participants
  const aiParticipants = generateAIParticipants(
    aiCompetitors,
    playerData.trophies,
    15,
    currentSeasonNumber
  );
  
  // Combine with player (if registered)
  let allParticipants = [...tournament.participants, ...aiParticipants];
  
  // If player didn't register, add them anyway with one AI slot
  if (!allParticipants.some(p => p.isPlayer)) {
    allParticipants = [
      {
        id: 'player',
        username: playerData.username,
        trophies: playerData.trophies,
        isPlayer: true,
        titleId: playerData.equippedTitle
      },
      ...aiParticipants.slice(0, 15)
    ];
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
  if (placement === 1) return 10000;
  if (placement <= 4) return 5000;
  if (placement <= 8) return 2500;
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
