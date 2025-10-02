import { SeasonData, AICompetitor, LeaderboardEntry } from '../types/game';

export function getCurrentSeasonData(): SeasonData {
  const startDate = new Date('2025-09-29T12:00:00-04:00'); // Monday Sep 29, 12pm EST
  const now = new Date();
  
  // Calculate which season we're in
  const daysSinceStart = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const seasonNumber = Math.floor(daysSinceStart / 14) + 1;
  
  // Calculate current season dates
  const currentSeasonStart = new Date(startDate);
  currentSeasonStart.setDate(startDate.getDate() + (seasonNumber - 1) * 14);
  
  const currentSeasonEnd = new Date(currentSeasonStart);
  currentSeasonEnd.setDate(currentSeasonStart.getDate() + 14);
  // Set to Wednesday 12pm EST (2 weeks from start which is Monday, so add 2 days to get to Wednesday)
  currentSeasonEnd.setDate(currentSeasonEnd.getDate() - 12 + 2); // Adjust to Wednesday
  
  return {
    seasonNumber,
    startDate: currentSeasonStart.getTime(),
    endDate: currentSeasonEnd.getTime(),
    leaderboard: []
  };
}

export function shouldResetSeason(lastChecked: number): boolean {
  const seasonData = getCurrentSeasonData();
  return Date.now() >= seasonData.endDate && lastChecked < seasonData.endDate;
}

export function getTimeUntilSeasonEnd(): string {
  const seasonData = getCurrentSeasonData();
  const now = Date.now();
  const diff = seasonData.endDate - now;
  
  if (diff <= 0) return 'Season Ended';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function generateAICompetitors(count: number = 2999): AICompetitor[] {
  const competitors: AICompetitor[] = [];
  
  // Realistic short usernames
  const names = [
    '.', '..', '...', 'dragg', 'lru', 'xyz', 'qwe', 'kk', 'zz', 'tt',
    'ace', 'fox', 'max', 'sam', 'kai', 'leo', 'rex', 'jay', 'sky', 'rio',
    'ash', 'zen', 'cj', 'tj', 'pk', 'dk', 'mk', 'jk', 'rk', 'sk',
    'nova', 'luna', 'echo', 'omen', 'apex', 'flux', 'volt', 'nyx', 'zara',
    'kira', 'mira', 'vex', 'ryn', 'kyx', 'jax', 'dex', 'pix', 'nix',
    'x', 'v', 'z', 'q', 'k', 'j', 'r', 'n', 'm', 'l',
    'ax', 'bx', 'cx', 'dx', 'ex', 'fx', 'gx', 'hx', 'ix', 'jx',
    'a1', 'b2', 'c3', 'd4', 'e5', 'f6', 'g7', 'h8', 'i9', 'j0',
    'pro', 'gg', 'wp', 'ez', 'nt', 'gl', 'hf', 'gm', 'op', 'og',
    'ryu', 'ken', 'lux', 'orb', 'gem', 'dot', 'bit', 'hex', 'ray',
    'ice', 'hot', 'red', 'blu', 'grn', 'yel', 'pur', 'blk', 'wht'
  ];
  
  // Calculate season progress (0.0 = start, 1.0 = end)
  const seasonData = getCurrentSeasonData();
  const seasonDuration = seasonData.endDate - seasonData.startDate;
  const timeElapsed = Date.now() - seasonData.startDate;
  const seasonProgress = Math.min(1, Math.max(0, timeElapsed / seasonDuration));
  
  // Generate ~3000 players with bell curve distribution
  for (let i = 0; i < count; i++) {
    const baseName = names[Math.floor(Math.random() * names.length)];
    // Sometimes add numbers, sometimes keep it short
    const username = Math.random() < 0.6 ? baseName : `${baseName}${Math.floor(Math.random() * 999)}`;
    
    // Bell curve distribution - most players in middle ranks
    // Using Box-Muller transform for normal distribution
    const u1 = Math.random();
    const u2 = Math.random();
    const normalValue = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    
    // Map normal distribution to trophy range
    // Mean at 250 trophies (Gold rank), standard deviation of 150
    let trophies = Math.round(250 + normalValue * 150);
    
    // Clamp to reasonable range and adjust for season progress
    trophies = Math.max(0, Math.min(trophies, 800 + Math.floor(seasonProgress * 200)));
    
    // Top rank (700+) should have around 100 or less players
    // If random value puts them too high, reduce probability
    if (trophies >= 700) {
      const topRankChance = 100 / count; // ~3.3% chance
      if (Math.random() > topRankChance) {
        // Redistribute to lower ranks
        trophies = 400 + Math.floor(Math.random() * 300);
      } else {
        // Scale with season progress
        trophies = 700 + Math.floor(Math.random() * (100 + seasonProgress * 200));
      }
    }
    
    // Grind rate: how many trophies they gain per hour
    const grindRate = Math.random() * 3 + 0.5; // 0.5 to 3.5 trophies per hour
    
    competitors.push({
      id: `ai_${i}`,
      username,
      trophies,
      grindRate,
      lastUpdate: Date.now()
    });
  }
  
  return competitors;
}

export function updateAICompetitors(competitors: AICompetitor[]): AICompetitor[] {
  const now = Date.now();
  return competitors.map(ai => {
    const minutesSinceUpdate = (now - ai.lastUpdate) / (1000 * 60);
    
    // Simulate games played based on activity rate
    // More active players play more games per hour
    const gamesPerHour = ai.grindRate / 2; // Convert grind rate to games per hour
    const gamesProbablyPlayed = Math.floor((minutesSinceUpdate / 60) * gamesPerHour);
    
    let currentTrophies = ai.trophies;
    let winStreak = 0;
    
    // Simulate each game
    for (let i = 0; i < gamesProbablyPlayed; i++) {
      // Win rate varies by trophy count - higher trophy players are better
      let winRate = 0.5; // Base 50%
      if (currentTrophies > 300) winRate = 0.65;
      else if (currentTrophies > 200) winRate = 0.60;
      else if (currentTrophies > 100) winRate = 0.55;
      else if (currentTrophies < 50) winRate = 0.45;
      
      const won = Math.random() < winRate;
      
      if (won) {
        winStreak++;
        const streakBonus = Math.floor(winStreak / 5);
        currentTrophies += (1 + streakBonus);
      } else {
        winStreak = 0;
        currentTrophies = Math.max(0, currentTrophies - 1);
      }
    }
    
    return {
      ...ai,
      trophies: currentTrophies,
      lastUpdate: now
    };
  });
}

// Reset AI competitors for new season
export function resetAICompetitorsForSeason(competitors: AICompetitor[]): AICompetitor[] {
  return competitors.map(ai => {
    // Reset to minimum trophy for their rank (same as player logic)
    const resetTrophies = getSeasonResetTrophiesForAI(ai.trophies);
    
    return {
      ...ai,
      trophies: resetTrophies,
      lastUpdate: Date.now()
    };
  });
}

function getSeasonResetTrophiesForAI(currentTrophies: number): number {
  // Use similar logic to player season reset with new rank thresholds
  if (currentTrophies >= 701) return 701; // Connect Legend
  if (currentTrophies >= 671) return 671; // Grand Champion V
  if (currentTrophies >= 641) return 641; // Grand Champion IV
  if (currentTrophies >= 611) return 611; // Grand Champion III
  if (currentTrophies >= 581) return 581; // Grand Champion II
  if (currentTrophies >= 551) return 551; // Grand Champion I
  if (currentTrophies >= 521) return 521; // Champion V
  if (currentTrophies >= 491) return 491; // Champion IV
  if (currentTrophies >= 461) return 461; // Champion III
  if (currentTrophies >= 431) return 431; // Champion II
  if (currentTrophies >= 401) return 401; // Champion I
  if (currentTrophies >= 376) return 376; // Diamond V
  if (currentTrophies >= 351) return 351; // Diamond IV
  if (currentTrophies >= 326) return 326; // Diamond III
  if (currentTrophies >= 301) return 301; // Diamond II
  if (currentTrophies >= 276) return 276; // Diamond I
  if (currentTrophies >= 256) return 256; // Platinum V
  if (currentTrophies >= 236) return 236; // Platinum IV
  if (currentTrophies >= 216) return 216; // Platinum III
  if (currentTrophies >= 196) return 196; // Platinum II
  if (currentTrophies >= 176) return 176; // Platinum I
  if (currentTrophies >= 161) return 161; // Gold V
  if (currentTrophies >= 146) return 146; // Gold IV
  if (currentTrophies >= 131) return 131; // Gold III
  if (currentTrophies >= 116) return 116; // Gold II
  if (currentTrophies >= 101) return 101; // Gold I
  if (currentTrophies >= 91) return 91; // Silver V
  if (currentTrophies >= 81) return 81; // Silver IV
  if (currentTrophies >= 71) return 71; // Silver III
  if (currentTrophies >= 61) return 61; // Silver II
  if (currentTrophies >= 51) return 51; // Silver I
  if (currentTrophies >= 41) return 41; // Bronze V
  if (currentTrophies >= 31) return 31; // Bronze IV
  if (currentTrophies >= 21) return 21; // Bronze III
  if (currentTrophies >= 11) return 11; // Bronze II
  return 0; // Bronze I
}

// Generate random title for AI based on their trophy count
function getRandomAITitle(trophies: number, currentSeasonNum: number): string | null {
  // Ensure season numbers are valid (1 to current season, not future seasons)
  const getValidSeasonNum = () => Math.max(1, currentSeasonNum - Math.floor(Math.random() * 3));
  
  // Lower ranks (< 176 trophies) - 50% chance of grey title, 50% no title
  if (trophies < 176) {
    if (Math.random() < 0.5) return null;
    
    const greyTitles = [
      'grey_the_noob', 'grey_casual_player', 'grey_beginner',
      'grey_enthusiast', 'grey_rookie', 'grey_apprentice',
      'grey_novice', 'grey_learner', 'grey_starter'
    ];
    return greyTitles[Math.floor(Math.random() * greyTitles.length)];
  }
  
  // Mid ranks (176-400) - mix of grey and old season titles
  if (trophies < 401) {
    const rand = Math.random();
    if (rand < 0.3) return null;
    if (rand < 0.6) {
      const greyTitles = [
        'grey_veteran', 'grey_skilled', 'grey_tactician',
        'grey_strategist', 'grey_competitor', 'grey_player',
        'grey_fighter', 'grey_warrior'
      ];
      return greyTitles[Math.floor(Math.random() * greyTitles.length)];
    }
    // Old season TOP 30 titles only
    return `S${getValidSeasonNum()} TOP 30`;
  }
  
  // Champion ranks (401-550) - Can use CHAMPION or leaderboard titles
  if (trophies < 551) {
    const rand = Math.random();
    if (rand < 0.3) {
      // Grey titles still possible
      const greyTitles = ['grey_master', 'grey_expert', 'grey_pro', 'grey_elite'];
      return greyTitles[Math.floor(Math.random() * greyTitles.length)];
    } else if (rand < 0.7) {
      return `S${getValidSeasonNum()} CHAMPION`;
    } else {
      // Leaderboard titles
      const leaderboardTitles = ['TOP 30', 'TOP 10', 'TOP CHAMPION'];
      return `S${getValidSeasonNum()} ${leaderboardTitles[Math.floor(Math.random() * leaderboardTitles.length)]}`;
    }
  }
  
  // Grand Champion ranks (551-700) - GRAND CHAMPION titles only (NO leaderboard titles)
  if (trophies < 701) {
    const rand = Math.random();
    if (rand < 0.2) {
      // Some grey titles
      return Math.random() < 0.5 ? 'grey_legend' : 'grey_grandmaster';
    }
    // Only GRAND CHAMPION rank title
    return `S${getValidSeasonNum()} GRAND CHAMPION`;
  }
  
  // Connect Legend ranks (701+) - CONNECT LEGEND titles only
  const rand = Math.random();
  if (rand < 0.15) {
    // Rare grey titles
    return 'grey_immortal';
  }
  // Only CONNECT LEGEND rank title
  return `S${getValidSeasonNum()} CONNECT LEGEND`;
}

export function getTop30Leaderboard(playerData: any, aiCompetitors: AICompetitor[]): LeaderboardEntry[] {
  const currentSeason = getCurrentSeasonData();
  const entries: LeaderboardEntry[] = [
    {
      username: playerData.username,
      trophies: playerData.trophies,
      isPlayer: true,
      titleId: playerData.equippedTitle
    },
    ...aiCompetitors.map(ai => ({
      username: ai.username,
      trophies: ai.trophies,
      isPlayer: false,
      titleId: getRandomAITitle(ai.trophies, currentSeason.seasonNumber)
    }))
  ];
  
  // Sort by trophies and get top 30 (no minimum trophy requirement)
  const sorted = entries
    .sort((a, b) => b.trophies - a.trophies)
    .slice(0, 30)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));
  
  return sorted;
}
