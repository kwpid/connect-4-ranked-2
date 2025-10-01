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

export function generateAICompetitors(count: number = 150): AICompetitor[] {
  const competitors: AICompetitor[] = [];
  const names = [
    'ProGamer', 'ChessMaster', 'ConnectKing', 'StrategyPro', 'TrophyHunter',
    'RankClimber', 'ElitePlayer', 'SkillMaster', 'TopTier', 'Challenger',
    'Dominator', 'Victory', 'Champion', 'Legend', 'Immortal', 'Divine',
    'Mythic', 'Supreme', 'Ultimate', 'Omega', 'Alpha', 'Sigma', 'Delta',
    'Phoenix', 'Dragon', 'Tiger', 'Eagle', 'Wolf', 'Bear', 'Lion',
    'Shadow', 'Ghost', 'Phantom', 'Ninja', 'Samurai', 'Warrior', 'Knight',
    'Mage', 'Wizard', 'Sorcerer', 'Warlock', 'Sage', 'Oracle', 'Prophet'
  ];
  
  // Calculate season progress (0.0 = start, 1.0 = end)
  const seasonData = getCurrentSeasonData();
  const seasonDuration = seasonData.endDate - seasonData.startDate;
  const timeElapsed = Date.now() - seasonData.startDate;
  const seasonProgress = Math.min(1, Math.max(0, timeElapsed / seasonDuration));
  
  for (let i = 0; i < count; i++) {
    const baseName = names[Math.floor(Math.random() * names.length)];
    const username = `${baseName}${Math.floor(Math.random() * 9999)}`;
    
    // Generate varied trophy counts based on season progress
    // Early season: 701-800 for top tier
    // Late season: 900-1000 for top tier (they've been grinding)
    let trophies: number;
    const rand = Math.random();
    
    if (rand < 0.2) {
      // 20% in top tier - scales with season progress
      const minTrophies = 701 + Math.floor(seasonProgress * 200); // 701 -> 901
      const maxTrophies = 800 + Math.floor(seasonProgress * 200); // 800 -> 1000
      trophies = minTrophies + Math.floor(Math.random() * (maxTrophies - minTrophies));
    } else if (rand < 0.4) {
      // 20% in high tier
      const minTrophies = 551 + Math.floor(seasonProgress * 100); // 551 -> 651
      const maxTrophies = 700 + Math.floor(seasonProgress * 100); // 700 -> 800
      trophies = minTrophies + Math.floor(Math.random() * (maxTrophies - minTrophies));
    } else if (rand < 0.6) {
      // 20% in mid-high tier
      const minTrophies = 401 + Math.floor(seasonProgress * 80); // 401 -> 481
      const maxTrophies = 550 + Math.floor(seasonProgress * 80); // 550 -> 630
      trophies = minTrophies + Math.floor(Math.random() * (maxTrophies - minTrophies));
    } else if (rand < 0.8) {
      // 20% in mid tier
      trophies = 200 + Math.floor(Math.random() * 200);
    } else {
      // 20% in lower tier
      trophies = Math.floor(Math.random() * 200);
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
function getRandomAITitle(trophies: number): string | null {
  // Lower ranks (< 176 trophies) - 50% chance of grey title, 50% no title
  if (trophies < 176) {
    if (Math.random() < 0.5) return null;
    
    const greyTitles = [
      'grey_the_noob', 'grey_casual_player', 'grey_beginner',
      'grey_enthusiast', 'grey_rookie', 'grey_apprentice'
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
        'grey_strategist', 'grey_competitor'
      ];
      return greyTitles[Math.floor(Math.random() * greyTitles.length)];
    }
    // Old season TOP 30 titles
    const seasonNum = Math.floor(Math.random() * 3) + 1; // S1-S3
    return `S${seasonNum} TOP 30`;
  }
  
  // High ranks (401-700) - CHAMPION titles
  if (trophies < 701) {
    const seasonNum = Math.floor(Math.random() * 3) + 1;
    const rand = Math.random();
    
    if (rand < 0.5) return `S${seasonNum} CHAMPION`;
    if (rand < 0.8) return `S${seasonNum} TOP 10`;
    return `S${seasonNum} TOP CHAMPION`;
  }
  
  // Top ranks (701+) - GRAND CHAMPION and CONNECT LEGEND titles
  const seasonNum = Math.floor(Math.random() * 3) + 1;
  const rand = Math.random();
  
  if (rand < 0.4) return `S${seasonNum} CONNECT LEGEND`;
  if (rand < 0.7) return `S${seasonNum} GRAND CHAMPION`;
  if (rand < 0.85) return `S${seasonNum} TOP CHAMPION`;
  return `S${seasonNum} TOP 10`;
}

export function getTop30Leaderboard(playerData: any, aiCompetitors: AICompetitor[]): LeaderboardEntry[] {
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
      titleId: getRandomAITitle(ai.trophies)
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
