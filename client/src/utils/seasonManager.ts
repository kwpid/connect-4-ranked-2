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
  // TESTING: Season ends on Oct 7, 2025 at 6:15 PM Eastern
  const now = Date.now();
  
  // Fixed season end time for testing: Oct 7, 2025 at 6:15 PM EST (18:15)
  const seasonEndUTC = getEasternTimeInUTC(2025, 10, 7, 18, 15);
  
  // Season starts 7 days before it ends
  const seasonStartUTC = seasonEndUTC - (7 * 24 * 60 * 60 * 1000);
  
  return {
    seasonNumber: 2,
    startDate: seasonStartUTC,
    endDate: seasonEndUTC,
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
  // Trophy ranges match new 3-division RANKS array
  const divisionQuotas: { [key: string]: number } = {
    // Bronze ranks (0-98): Start very high at Bronze I
    'bronze_I': 600,      // Bronze I (0-32) - Most players (beginners/inactive)
    'bronze_II': 450,     // Bronze II (33-65)
    'bronze_III': 350,    // Bronze III (66-98)
    
    // Silver ranks (99-197): Building up
    'silver_I': 300,      // Silver I (99-131)
    'silver_II': 350,     // Silver II (132-164)
    'silver_III': 400,    // Silver III (165-197)
    
    // Gold ranks (198-296): Approaching peak
    'gold_I': 450,        // Gold I (198-230)
    'gold_II': 500,       // Gold II (231-263)
    'gold_III': 520,      // Gold III (264-296) - Peak starts
    
    // Platinum ranks (297-395): Peak of bell curve
    'plat_I': 500,        // Platinum I (297-329)
    'plat_II': 450,       // Platinum II (330-362)
    'plat_III': 400,      // Platinum III (363-395)
    
    // Diamond ranks (396-496): Declining
    'dia_I': 350,         // Diamond I (396-428)
    'dia_II': 300,        // Diamond II (429-462)
    'dia_III': 250,       // Diamond III (463-496)
    
    // Champion ranks (497-598): Continuing decline
    'champ_I': 200,       // Champion I (497-530)
    'champ_II': 150,      // Champion II (531-564)
    'champ_III': 120,     // Champion III (565-598)
    
    // Grand Champion ranks (599-700): Sharp decline
    'gc_I': 450,          // Grand Champion I (599-632)
    'gc_II': 350,         // Grand Champion II (633-666)
    'gc_III': 200,        // Grand Champion III (667-700)
    
    // Connect Legend (701+): Minimum
    'legend': 50          // Connect Legend - Lowest count
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
    
    // Map division key to trophy range (new 3-division structure)
    if (division === 'bronze_I') trophies = 0 + Math.floor(Math.random() * 33);
    else if (division === 'bronze_II') trophies = 33 + Math.floor(Math.random() * 33);
    else if (division === 'bronze_III') trophies = 66 + Math.floor(Math.random() * 33);
    
    else if (division === 'silver_I') trophies = 99 + Math.floor(Math.random() * 33);
    else if (division === 'silver_II') trophies = 132 + Math.floor(Math.random() * 33);
    else if (division === 'silver_III') trophies = 165 + Math.floor(Math.random() * 33);
    
    else if (division === 'gold_I') trophies = 198 + Math.floor(Math.random() * 33);
    else if (division === 'gold_II') trophies = 231 + Math.floor(Math.random() * 33);
    else if (division === 'gold_III') trophies = 264 + Math.floor(Math.random() * 33);
    
    else if (division === 'plat_I') trophies = 297 + Math.floor(Math.random() * 33);
    else if (division === 'plat_II') trophies = 330 + Math.floor(Math.random() * 33);
    else if (division === 'plat_III') trophies = 363 + Math.floor(Math.random() * 33);
    
    else if (division === 'dia_I') trophies = 396 + Math.floor(Math.random() * 33);
    else if (division === 'dia_II') trophies = 429 + Math.floor(Math.random() * 34);
    else if (division === 'dia_III') trophies = 463 + Math.floor(Math.random() * 34);
    
    else if (division === 'champ_I') trophies = 497 + Math.floor(Math.random() * 34);
    else if (division === 'champ_II') trophies = 531 + Math.floor(Math.random() * 34);
    else if (division === 'champ_III') trophies = 565 + Math.floor(Math.random() * 34);
    
    else if (division === 'gc_I') trophies = 599 + Math.floor(Math.random() * 34);
    else if (division === 'gc_II') trophies = 633 + Math.floor(Math.random() * 34);
    else if (division === 'gc_III') trophies = 667 + Math.floor(Math.random() * 34);
    
    else if (division === 'legend') trophies = 701 + Math.floor(Math.random() * (100 + seasonProgress * 200));
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

// Helper to get activity multiplier based on time of day (simulates peak hours)
function getTimeOfDayMultiplier(timestamp?: number): number {
  const now = timestamp ? new Date(timestamp) : new Date();
  const hour = now.getHours();
  
  // Peak hours: 6 PM - 11 PM (18-23) - 100% activity
  // Good hours: 12 PM - 6 PM (12-17) and 11 PM - 1 AM (23, 0, 1) - 70% activity
  // Medium hours: 8 AM - 12 PM (8-11) and 1 AM - 3 AM (1-3) - 40% activity
  // Low hours: 3 AM - 8 AM (3-7) - 15% activity
  
  if (hour >= 18 && hour <= 23) return 1.0; // Peak
  if ((hour >= 12 && hour <= 17) || hour === 0 || hour === 1) return 0.7; // Good
  if ((hour >= 8 && hour <= 11) || (hour >= 2 && hour <= 3)) return 0.4; // Medium
  return 0.15; // Low (late night/early morning)
}

// Catch up AI competitors based on time elapsed since last update
// This allows AI to continue "grinding" even when player is offline
export function catchUpAICompetitors(competitors: AICompetitor[]): AICompetitor[] {
  const now = Date.now();
  const FIVE_MINUTES = 5 * 60 * 1000;
  
  return competitors.map(ai => {
    const timeSinceLastUpdate = now - ai.lastUpdate;
    
    // If less than 5 minutes, no catch-up needed
    if (timeSinceLastUpdate < FIVE_MINUTES) {
      return ai;
    }
    
    // Calculate how many 5-minute periods have passed
    const periodsToSimulate = Math.floor(timeSinceLastUpdate / FIVE_MINUTES);
    
    // Cap at 288 periods (24 hours worth) to prevent extreme calculations
    const cappedPeriods = Math.min(periodsToSimulate, 288);
    
    let currentTrophies = ai.trophies;
    let currentTime = ai.lastUpdate;
    
    // Simulate each 5-minute period
    for (let period = 0; period < cappedPeriods; period++) {
      currentTime += FIVE_MINUTES;
      const timeMultiplier = getTimeOfDayMultiplier(currentTime);
      
      // Determine if this AI plays during this period
      const playsThisPeriod = Math.random() < (0.9 * timeMultiplier);
      
      if (!playsThisPeriod) {
        continue;
      }
      
      // Determine grinding intensity
      const intensityRoll = Math.random();
      let gamesPlayed: number;
      
      if (intensityRoll < 0.05) {
        gamesPlayed = Math.floor(Math.random() * 6) + 10;
      } else if (intensityRoll < 0.20) {
        gamesPlayed = Math.floor(Math.random() * 4) + 6;
      } else if (intensityRoll < 0.50) {
        gamesPlayed = Math.floor(Math.random() * 3) + 3;
      } else if (intensityRoll < 0.80) {
        gamesPlayed = Math.floor(Math.random() * 2) + 1;
      } else {
        gamesPlayed = Math.random() < 0.5 ? 1 : 0;
      }
      
      gamesPlayed = Math.floor(gamesPlayed * timeMultiplier);
      
      if (gamesPlayed === 0) {
        continue;
      }
      
      let consecutiveWins = 0;
      let consecutiveLosses = 0;
      
      for (let i = 0; i < gamesPlayed; i++) {
        let baseWinRate = 0.5;
        if (currentTrophies > 650) baseWinRate = 0.58;
        else if (currentTrophies > 500) baseWinRate = 0.56;
        else if (currentTrophies > 300) baseWinRate = 0.53;
        else if (currentTrophies > 150) baseWinRate = 0.51;
        else if (currentTrophies < 50) baseWinRate = 0.47;
        
        const streakEffect = (consecutiveWins * 0.01) - (consecutiveLosses * 0.02);
        const winRate = Math.min(0.70, Math.max(0.30, baseWinRate + streakEffect));
        
        const won = Math.random() < winRate;
        
        if (won) {
          consecutiveWins++;
          consecutiveLosses = 0;
          const baseGain = Math.floor(Math.random() * 5) + 4; // 4-8 trophies (increased from 2-5)
          const streakBonus = Math.floor(consecutiveWins / 3);
          currentTrophies += (baseGain + streakBonus);
        } else {
          consecutiveLosses++;
          consecutiveWins = 0;
          const trophyLoss = Math.floor(Math.random() * 5) + 2; // 2-6 trophies (increased from 1-4)
          currentTrophies = Math.max(0, currentTrophies - trophyLoss);
        }
      }
    }
    
    return {
      ...ai,
      trophies: currentTrophies,
      lastUpdate: now
    };
  });
}

export function updateLeaderboardAI(competitors: AICompetitor[]): AICompetitor[] {
  const now = Date.now();
  const timeMultiplier = getTimeOfDayMultiplier();
  
  return competitors.map(ai => {
    // Determine if this AI plays during this 5-minute period
    // Some AI don't play at all (10% chance), adjusted by time of day
    const playsThisPeriod = Math.random() < (0.9 * timeMultiplier);
    
    if (!playsThisPeriod) {
      return { ...ai, lastUpdate: now };
    }
    
    // Determine AI's grinding intensity for this period
    // Some grind hard (~45 trophies), some casual (~10 trophies), most in between
    const intensityRoll = Math.random();
    let gamesPlayed: number;
    
    if (intensityRoll < 0.05) {
      // 5% - Super grinders (10-15 games, can get ~45 trophies with good wins)
      gamesPlayed = Math.floor(Math.random() * 6) + 10;
    } else if (intensityRoll < 0.20) {
      // 15% - Heavy grinders (6-9 games, ~25-35 trophies)
      gamesPlayed = Math.floor(Math.random() * 4) + 6;
    } else if (intensityRoll < 0.50) {
      // 30% - Active players (3-5 games, ~12-20 trophies)
      gamesPlayed = Math.floor(Math.random() * 3) + 3;
    } else if (intensityRoll < 0.80) {
      // 30% - Casual players (1-2 games, ~4-8 trophies)
      gamesPlayed = Math.floor(Math.random() * 2) + 1;
    } else {
      // 20% - Very casual (0-1 games, barely any change)
      gamesPlayed = Math.random() < 0.5 ? 1 : 0;
    }
    
    // Adjust games by time of day
    gamesPlayed = Math.floor(gamesPlayed * timeMultiplier);
    
    if (gamesPlayed === 0) {
      return { ...ai, lastUpdate: now };
    }
    
    let currentTrophies = ai.trophies;
    let consecutiveWins = 0;
    let consecutiveLosses = 0;
    
    for (let i = 0; i < gamesPlayed; i++) {
      // Win rate varies by trophy count and current streak
      let baseWinRate = 0.5;
      if (currentTrophies > 650) baseWinRate = 0.58;
      else if (currentTrophies > 500) baseWinRate = 0.56;
      else if (currentTrophies > 300) baseWinRate = 0.53;
      else if (currentTrophies > 150) baseWinRate = 0.51;
      else if (currentTrophies < 50) baseWinRate = 0.47;
      
      // Streak effects: winning streaks slightly increase win rate, losing streaks decrease it
      const streakEffect = (consecutiveWins * 0.01) - (consecutiveLosses * 0.02);
      const winRate = Math.min(0.70, Math.max(0.30, baseWinRate + streakEffect));
      
      const won = Math.random() < winRate;
      
      if (won) {
        consecutiveWins++;
        consecutiveLosses = 0;
        // Trophy gain: 4-8 trophies per win, with streak bonus (increased from 2-5)
        const baseGain = Math.floor(Math.random() * 5) + 4;
        const streakBonus = Math.floor(consecutiveWins / 3);
        currentTrophies += (baseGain + streakBonus);
      } else {
        consecutiveLosses++;
        consecutiveWins = 0;
        // Trophy loss: 2-6 trophies per loss (increased from 1-4)
        const trophyLoss = Math.floor(Math.random() * 5) + 2;
        currentTrophies = Math.max(0, currentTrophies - trophyLoss);
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
export function resetAICompetitorsForSeason(competitors: AICompetitor[], top100AIIds?: Set<string>): AICompetitor[] {
  return competitors.map(ai => {
    // Top 100 leaderboard AI get reset to 701 trophies
    // All other AI reset to minimum trophy for their rank
    const resetTrophies = top100AIIds?.has(ai.id) ? 701 : getSeasonResetTrophiesForAI(ai.trophies);
    
    return {
      ...ai,
      trophies: resetTrophies,
      lastUpdate: Date.now()
    };
  });
}

function getSeasonResetTrophiesForAI(currentTrophies: number): number {
  // Use new 3-division rank structure for season reset
  if (currentTrophies >= 701) return 701; // Connect Legend
  if (currentTrophies >= 667) return 667; // Grand Champion III
  if (currentTrophies >= 633) return 633; // Grand Champion II
  if (currentTrophies >= 599) return 599; // Grand Champion I
  if (currentTrophies >= 565) return 565; // Champion III
  if (currentTrophies >= 531) return 531; // Champion II
  if (currentTrophies >= 497) return 497; // Champion I
  if (currentTrophies >= 463) return 463; // Diamond III
  if (currentTrophies >= 429) return 429; // Diamond II
  if (currentTrophies >= 396) return 396; // Diamond I
  if (currentTrophies >= 363) return 363; // Platinum III
  if (currentTrophies >= 330) return 330; // Platinum II
  if (currentTrophies >= 297) return 297; // Platinum I
  if (currentTrophies >= 264) return 264; // Gold III
  if (currentTrophies >= 231) return 231; // Gold II
  if (currentTrophies >= 198) return 198; // Gold I
  if (currentTrophies >= 165) return 165; // Silver III
  if (currentTrophies >= 132) return 132; // Silver II
  if (currentTrophies >= 99) return 99; // Silver I
  if (currentTrophies >= 66) return 66; // Bronze III
  if (currentTrophies >= 33) return 33; // Bronze II
  return 0; // Bronze I
}

// Generate random title for AI based on their trophy count
function getRandomAITitle(trophies: number, currentSeasonNum: number): string | null {
  // Ensure season numbers are valid (only prior seasons, not current)
  // AI can only have titles from completed seasons
  const getValidSeasonNum = () => {
    // Must be at least 1 season before current
    const maxPriorSeason = Math.max(1, currentSeasonNum - 1);
    // Randomly select from available prior seasons (1 to maxPriorSeason)
    if (maxPriorSeason === 1) return 1;
    return Math.floor(Math.random() * maxPriorSeason) + 1;
  };
  
  // Lower ranks (< 297 trophies) - 50% chance of grey title, 50% no title
  if (trophies < 297) {
    if (Math.random() < 0.5) return null;
    
    const greyTitles = [
      'grey_the_noob', 'grey_casual_player', 'grey_beginner',
      'grey_enthusiast', 'grey_rookie', 'grey_apprentice',
      'grey_novice', 'grey_learner', 'grey_starter'
    ];
    return greyTitles[Math.floor(Math.random() * greyTitles.length)];
  }
  
  // Mid ranks (297-496) - mix of grey and old season titles
  if (trophies < 497) {
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
  
  // Champion ranks (497-598) - Can use CHAMPION or leaderboard titles
  if (trophies < 599) {
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

export function getTop100Leaderboard(playerData: any, aiCompetitors: AICompetitor[], playerTrophyOverride?: number): LeaderboardEntry[] {
  const currentSeason = getCurrentSeasonData();
  // Use trophy override if provided (for delayed leaderboard updates)
  const playerTrophies = playerTrophyOverride !== undefined ? playerTrophyOverride : playerData.trophies;
  const entries: LeaderboardEntry[] = [
    {
      username: playerData.username,
      trophies: playerTrophies,
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
  
  // Sort by trophies and get top 100 (no minimum trophy requirement)
  const sorted = entries
    .sort((a, b) => b.trophies - a.trophies)
    .slice(0, 100)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));
  
  return sorted;
}

// Keep legacy function name for backwards compatibility during migration
export const getTop30Leaderboard = getTop100Leaderboard;
