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
    
    // Generate varied trophy counts
    let trophies: number;
    const rand = Math.random();
    if (rand < 0.4) {
      // 40% in lower ranks (0-150)
      trophies = Math.floor(Math.random() * 150);
    } else if (rand < 0.7) {
      // 30% in mid ranks (150-300)
      trophies = 150 + Math.floor(Math.random() * 150);
    } else if (rand < 0.9) {
      // 20% in high ranks (300-450)
      trophies = 300 + Math.floor(Math.random() * 150);
    } else {
      // 10% in very high ranks (450-600)
      trophies = 450 + Math.floor(Math.random() * 150);
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
    const hoursSinceUpdate = (now - ai.lastUpdate) / (1000 * 60 * 60);
    const trophyGain = Math.floor(hoursSinceUpdate * ai.grindRate * (Math.random() * 0.5 + 0.75));
    
    return {
      ...ai,
      trophies: Math.max(0, ai.trophies + trophyGain),
      lastUpdate: now
    };
  });
}

export function getTop100Leaderboard(playerData: any, aiCompetitors: AICompetitor[]): LeaderboardEntry[] {
  const entries: LeaderboardEntry[] = [
    {
      username: playerData.username,
      trophies: playerData.trophies,
      isPlayer: true
    },
    ...aiCompetitors.map(ai => ({
      username: ai.username,
      trophies: ai.trophies,
      isPlayer: false
    }))
  ];
  
  // Sort by trophies and get top 100
  const sorted = entries
    .filter(e => e.trophies >= 400) // Minimum 400 trophies for top 100
    .sort((a, b) => b.trophies - a.trophies)
    .slice(0, 100)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));
  
  return sorted;
}
