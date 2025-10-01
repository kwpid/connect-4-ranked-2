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
  
  for (let i = 0; i < count; i++) {
    const baseName = names[Math.floor(Math.random() * names.length)];
    const username = `${baseName}${Math.floor(Math.random() * 9999)}`;
    
    // Generate varied trophy counts - top 30 will have 600+ trophies
    let trophies: number;
    const rand = Math.random();
    if (rand < 0.2) {
      // 20% in top tier (600-900) - ensures top 30 has 600+
      trophies = 600 + Math.floor(Math.random() * 300);
    } else if (rand < 0.4) {
      // 20% in high tier (400-600)
      trophies = 400 + Math.floor(Math.random() * 200);
    } else if (rand < 0.6) {
      // 20% in mid-high tier (250-400)
      trophies = 250 + Math.floor(Math.random() * 150);
    } else if (rand < 0.8) {
      // 20% in mid tier (100-250)
      trophies = 100 + Math.floor(Math.random() * 150);
    } else {
      // 20% in lower tier (0-100)
      trophies = Math.floor(Math.random() * 100);
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
  // Use similar logic to player season reset
  if (currentTrophies >= 401) return 401; // Legend
  if (currentTrophies >= 376) return 376; // Grand Champion IV
  if (currentTrophies >= 351) return 351; // Grand Champion III
  if (currentTrophies >= 326) return 326; // Grand Champion II
  if (currentTrophies >= 301) return 301; // Grand Champion I
  if (currentTrophies >= 276) return 276; // Champion III
  if (currentTrophies >= 251) return 251; // Champion II
  if (currentTrophies >= 226) return 226; // Champion I
  if (currentTrophies >= 201) return 201; // Diamond III
  if (currentTrophies >= 176) return 176; // Diamond II
  if (currentTrophies >= 151) return 151; // Diamond I
  if (currentTrophies >= 131) return 131; // Platinum III
  if (currentTrophies >= 111) return 111; // Platinum II
  if (currentTrophies >= 91) return 91; // Platinum I
  if (currentTrophies >= 76) return 76; // Gold III
  if (currentTrophies >= 61) return 61; // Gold II
  if (currentTrophies >= 46) return 46; // Gold I
  if (currentTrophies >= 36) return 36; // Silver III
  if (currentTrophies >= 26) return 26; // Silver II
  if (currentTrophies >= 16) return 16; // Silver I
  if (currentTrophies >= 11) return 11; // Bronze III
  if (currentTrophies >= 6) return 6; // Bronze II
  return 0; // Bronze I
}

// Generate random title for AI based on their trophy count
function getRandomAITitle(trophies: number): string | null {
  // Lower ranks (< 150 trophies) - 50% chance of grey title, 50% no title
  if (trophies < 150) {
    if (Math.random() < 0.5) return null;
    
    const greyTitles = [
      'grey_the_noob', 'grey_casual_player', 'grey_beginner',
      'grey_enthusiast', 'grey_rookie', 'grey_apprentice'
    ];
    return greyTitles[Math.floor(Math.random() * greyTitles.length)];
  }
  
  // Mid ranks (150-300) - mix of grey and old season titles
  if (trophies < 300) {
    const rand = Math.random();
    if (rand < 0.3) return null;
    if (rand < 0.6) {
      const greyTitles = [
        'grey_veteran', 'grey_skilled', 'grey_tactician',
        'grey_strategist', 'grey_competitor'
      ];
      return greyTitles[Math.floor(Math.random() * greyTitles.length)];
    }
    // Old season Champion/Top 30 titles
    const seasonNum = Math.floor(Math.random() * 3) + 1; // S1-S3
    return Math.random() < 0.5 
      ? `S${seasonNum} Champion`
      : `S${seasonNum} TOP 30`;
  }
  
  // High ranks (300+) - prestigious season titles
  const seasonNum = Math.floor(Math.random() * 3) + 1;
  const rand = Math.random();
  
  if (rand < 0.3) return `S${seasonNum} Legend`;
  if (rand < 0.6) return `S${seasonNum} Grand Champion`;
  if (rand < 0.8) return `S${seasonNum} TOP CHAMPION`;
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
