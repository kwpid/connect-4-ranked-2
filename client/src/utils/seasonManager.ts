import { SeasonData, AICompetitor, LeaderboardEntry } from '../types/game';

// Helper to determine if a date is in DST for US Eastern timezone
function isEasternDST(year: number, month: number, day: number): boolean {
  // US DST: Second Sunday in March (2 AM) to First Sunday in November (2 AM)
  // 2025: March 9 to November 2
  // 2026: March 8 to November 1
  // 2027: March 14 to November 7
  
  // Before March or after November: definitely not DST
  if (month < 3 || month > 11) return false;
  if (month > 3 && month < 11) return true; // April to October: definitely DST
  
  // Find second Sunday in March for DST start
  const marchFirst = new Date(year, 2, 1); // March 1
  const marchFirstDay = marchFirst.getDay(); // 0 = Sunday
  const daysUntilFirstSunday = marchFirstDay === 0 ? 0 : 7 - marchFirstDay;
  const secondSundayInMarch = 1 + daysUntilFirstSunday + 7;
  
  // Find first Sunday in November for DST end
  const novFirst = new Date(year, 10, 1); // November 1
  const novFirstDay = novFirst.getDay();
  const firstSundayInNov = novFirstDay === 0 ? 1 : 1 + (7 - novFirstDay);
  
  if (month === 3) { // March
    return day >= secondSundayInMarch;
  } else { // November
    return day < firstSundayInNov;
  }
}

// Helper to get UTC time for a specific Eastern date/time, accounting for DST
function getEasternTimeInUTC(year: number, month: number, day: number, hour: number, minute: number): number {
  // Eastern Time: EDT (UTC-4) during DST, EST (UTC-5) otherwise
  const isDST = isEasternDST(year, month, day);
  const utcHour = isDST ? hour + 4 : hour + 5;
  
  return Date.UTC(year, month - 1, day, utcHour, minute, 0);
}

export function getCurrentSeasonData(): SeasonData {
  // Season 1 ended on Oct 1, 2025 at 11:59 PM Eastern (Wed)
  // All seasons last exactly 2 weeks and end on Wednesdays at 11:59 PM Eastern
  // Starting season number is 2
  
  const now = Date.now();
  
  // Base season: Season 1 ended Oct 1, 2025 (season 2 starts then)
  let seasonStartYear = 2025;
  let seasonStartMonth = 10;
  let seasonStartDay = 1;
  let seasonNumber = 2;
  
  // Find current season by iterating through season boundaries
  // Each season spans exactly 14 calendar days in Eastern time
  while (true) {
    // Calculate when this season ends (14 days after it started)
    const startDate = new Date(seasonStartYear, seasonStartMonth - 1, seasonStartDay);
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 14);
    
    const endYear = endDate.getFullYear();
    const endMonth = endDate.getMonth() + 1;
    const endDay = endDate.getDate();
    
    // Convert end boundary to UTC using Eastern timezone rules
    const seasonEndUTC = getEasternTimeInUTC(endYear, endMonth, endDay, 23, 59);
    
    // If we haven't reached this season's end yet, this is our current season
    if (now < seasonEndUTC) {
      const seasonStartUTC = getEasternTimeInUTC(seasonStartYear, seasonStartMonth, seasonStartDay, 23, 59);
      return {
        seasonNumber,
        startDate: seasonStartUTC,
        endDate: seasonEndUTC,
        leaderboard: []
      };
    }
    
    // Move to next season
    seasonStartYear = endYear;
    seasonStartMonth = endMonth;
    seasonStartDay = endDay;
    seasonNumber++;
    
    // Safety check to prevent infinite loop (max 1000 seasons ~38 years)
    if (seasonNumber > 1000) {
      throw new Error('Season calculation exceeded maximum iterations');
    }
  }
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

export function generateAICompetitors(count: number = 6865): AICompetitor[] {
  const competitors: AICompetitor[] = [];
  
  // Mix of short, regular, and long usernames
  const shortNames = [
    'x', 'v', 'z', 'q', 'k', 'j', 'r', 'n', 'm', 'l',
    '.', '..', '...', 'kk', 'zz', 'tt', 'cj', 'tj', 'pk', 'dk'
  ];
  
  const regularNames = [
    'ace', 'fox', 'max', 'sam', 'kai', 'leo', 'rex', 'jay', 'sky', 'rio',
    'ash', 'zen', 'nova', 'luna', 'echo', 'omen', 'apex', 'flux', 'volt', 'nyx',
    'zara', 'kira', 'mira', 'ryu', 'ken', 'lux', 'orb', 'gem', 'dot', 'bit',
    'hex', 'ray', 'ice', 'hot', 'red', 'blu', 'grn', 'yel', 'pur', 'blk',
    'wht', 'vex', 'ryn', 'kyx', 'jax', 'dex', 'pix', 'nix', 'pro', 'gg',
    'wp', 'ez', 'nt', 'gl', 'hf', 'gm', 'op', 'og', 'dragg', 'lru', 'xyz', 'qwe'
  ];
  
  const longNames = [
    'shadowhunter', 'nighthawk', 'thunderbolt', 'dragonslayer', 'stargazer',
    'moonwalker', 'stormbreaker', 'firestorm', 'icebreaker', 'wildcard',
    'masterchief', 'darkphoenix', 'silverfox', 'goldeneye', 'blackwidow',
    'ironheart', 'steelwolf', 'crystalclear', 'phantomghost', 'speedster',
    'champion', 'warrior', 'fighter', 'winner', 'player', 'gamer', 'legend'
  ];
  
  // Calculate season progress (0.0 = start, 1.0 = end)
  const seasonData = getCurrentSeasonData();
  const seasonDuration = seasonData.endDate - seasonData.startDate;
  const timeElapsed = Date.now() - seasonData.startDate;
  const seasonProgress = Math.min(1, Math.max(0, timeElapsed / seasonDuration));
  
  // Per-division quotas: Bronze I highest, bell curve in middle, Connect Legend ~50 (lowest)
  // Trophy ranges match RANKS array exactly
  const divisionQuotas: { [key: string]: number } = {
    // Bronze ranks (0-50): Start very high at Bronze I
    'bronze_0_10': 400,      // Bronze I - Most players (beginners/inactive)
    'bronze_11_20': 300,     // Bronze II
    'bronze_21_30': 250,     // Bronze III
    'bronze_31_40': 200,     // Bronze IV
    'bronze_41_50': 180,     // Bronze V
    
    // Silver ranks (51-100): Building up
    'silver_51_60': 160,     // Silver I
    'silver_61_70': 180,     // Silver II
    'silver_71_80': 200,     // Silver III
    'silver_81_90': 220,     // Silver IV
    'silver_91_100': 240,    // Silver V
    
    // Gold ranks (101-175): Approaching peak
    'gold_101_115': 260,     // Gold I
    'gold_116_130': 280,     // Gold II
    'gold_131_145': 300,     // Gold III - Peak starts
    'gold_146_160': 280,     // Gold IV
    'gold_161_175': 260,     // Gold V
    
    // Platinum ranks (176-275): Peak of bell curve
    'plat_176_195': 240,     // Platinum I
    'plat_196_215': 220,     // Platinum II
    'plat_216_235': 200,     // Platinum III
    'plat_236_255': 180,     // Platinum IV
    'plat_256_275': 160,     // Platinum V
    
    // Diamond ranks (276-400): Declining
    'dia_276_300': 150,      // Diamond I
    'dia_301_325': 140,      // Diamond II
    'dia_326_350': 130,      // Diamond III
    'dia_351_375': 120,      // Diamond IV
    'dia_376_400': 110,      // Diamond V
    
    // Champion ranks (401-550): Continuing decline
    'champ_401_430': 100,    // Champion I
    'champ_431_460': 90,     // Champion II
    'champ_461_490': 80,     // Champion III
    'champ_491_520': 70,     // Champion IV
    'champ_521_550': 60,     // Champion V
    
    // Grand Champion ranks (551-700): Sharp decline
    'gc_551_580': 300,       // Grand Champion I
    'gc_581_610': 280,       // Grand Champion II
    'gc_611_640': 250,       // Grand Champion III
    'gc_641_670': 150,       // Grand Champion IV
    'gc_671_700': 75,        // Grand Champion V
    
    // Connect Legend (701+): Minimum
    'legend_701': 50         // Connect Legend - Lowest count
  };
  
  // Create array of division assignments
  const divisionAssignments: string[] = [];
  Object.entries(divisionQuotas).forEach(([division, quota]) => {
    for (let i = 0; i < quota; i++) {
      divisionAssignments.push(division);
    }
  });
  
  // Shuffle to randomize order
  for (let i = divisionAssignments.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [divisionAssignments[i], divisionAssignments[j]] = [divisionAssignments[j], divisionAssignments[i]];
  }
  
  // Generate players with guaranteed division distribution
  for (let i = 0; i < count && i < divisionAssignments.length; i++) {
    // Choose name category with distribution: 30% short, 50% regular, 20% long
    let baseName: string;
    const categoryRoll = Math.random();
    if (categoryRoll < 0.3) {
      baseName = shortNames[Math.floor(Math.random() * shortNames.length)];
    } else if (categoryRoll < 0.8) {
      baseName = regularNames[Math.floor(Math.random() * regularNames.length)];
    } else {
      baseName = longNames[Math.floor(Math.random() * longNames.length)];
    }
    
    // Number distribution: 60% no numbers, 30% short numbers (1-99), 10% longer numbers (100-9999)
    let username: string;
    const numberRoll = Math.random();
    if (numberRoll < 0.6) {
      username = baseName; // No numbers
    } else if (numberRoll < 0.9) {
      username = `${baseName}${Math.floor(Math.random() * 99) + 1}`; // 1-99
    } else {
      username = `${baseName}${Math.floor(Math.random() * 9900) + 100}`; // 100-9999
    }
    
    // Assign trophies based on pre-determined division
    let trophies: number;
    const division = divisionAssignments[i];
    
    // Map division key to trophy range
    if (division === 'bronze_0_10') trophies = 0 + Math.floor(Math.random() * 11);
    else if (division === 'bronze_11_20') trophies = 11 + Math.floor(Math.random() * 10);
    else if (division === 'bronze_21_30') trophies = 21 + Math.floor(Math.random() * 10);
    else if (division === 'bronze_31_40') trophies = 31 + Math.floor(Math.random() * 10);
    else if (division === 'bronze_41_50') trophies = 41 + Math.floor(Math.random() * 10);
    
    else if (division === 'silver_51_60') trophies = 51 + Math.floor(Math.random() * 10);
    else if (division === 'silver_61_70') trophies = 61 + Math.floor(Math.random() * 10);
    else if (division === 'silver_71_80') trophies = 71 + Math.floor(Math.random() * 10);
    else if (division === 'silver_81_90') trophies = 81 + Math.floor(Math.random() * 10);
    else if (division === 'silver_91_100') trophies = 91 + Math.floor(Math.random() * 10);
    
    else if (division === 'gold_101_115') trophies = 101 + Math.floor(Math.random() * 15);
    else if (division === 'gold_116_130') trophies = 116 + Math.floor(Math.random() * 15);
    else if (division === 'gold_131_145') trophies = 131 + Math.floor(Math.random() * 15);
    else if (division === 'gold_146_160') trophies = 146 + Math.floor(Math.random() * 15);
    else if (division === 'gold_161_175') trophies = 161 + Math.floor(Math.random() * 15);
    
    else if (division === 'plat_176_195') trophies = 176 + Math.floor(Math.random() * 20);
    else if (division === 'plat_196_215') trophies = 196 + Math.floor(Math.random() * 20);
    else if (division === 'plat_216_235') trophies = 216 + Math.floor(Math.random() * 20);
    else if (division === 'plat_236_255') trophies = 236 + Math.floor(Math.random() * 20);
    else if (division === 'plat_256_275') trophies = 256 + Math.floor(Math.random() * 20);
    
    else if (division === 'dia_276_300') trophies = 276 + Math.floor(Math.random() * 25);
    else if (division === 'dia_301_325') trophies = 301 + Math.floor(Math.random() * 25);
    else if (division === 'dia_326_350') trophies = 326 + Math.floor(Math.random() * 25);
    else if (division === 'dia_351_375') trophies = 351 + Math.floor(Math.random() * 25);
    else if (division === 'dia_376_400') trophies = 376 + Math.floor(Math.random() * 25);
    
    else if (division === 'champ_401_430') trophies = 401 + Math.floor(Math.random() * 30);
    else if (division === 'champ_431_460') trophies = 431 + Math.floor(Math.random() * 30);
    else if (division === 'champ_461_490') trophies = 461 + Math.floor(Math.random() * 30);
    else if (division === 'champ_491_520') trophies = 491 + Math.floor(Math.random() * 30);
    else if (division === 'champ_521_550') trophies = 521 + Math.floor(Math.random() * 30);
    
    else if (division === 'gc_551_580') trophies = 551 + Math.floor(Math.random() * 30);
    else if (division === 'gc_581_610') trophies = 581 + Math.floor(Math.random() * 30);
    else if (division === 'gc_611_640') trophies = 611 + Math.floor(Math.random() * 30);
    else if (division === 'gc_641_670') trophies = 641 + Math.floor(Math.random() * 30);
    else if (division === 'gc_671_700') trophies = 671 + Math.floor(Math.random() * 30);
    
    else if (division === 'legend_701') trophies = 701 + Math.floor(Math.random() * (100 + seasonProgress * 200));
    else trophies = 0; // Fallback
    
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
export function resetAICompetitorsForSeason(competitors: AICompetitor[], top30AIIds?: Set<string>): AICompetitor[] {
  return competitors.map(ai => {
    // Top 30 leaderboard AI get reset to 701 trophies
    // All other AI reset to minimum trophy for their rank
    const resetTrophies = top30AIIds?.has(ai.id) ? 701 : getSeasonResetTrophiesForAI(ai.trophies);
    
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
