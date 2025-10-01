import { Title } from '../types/game';

export function getTitleFromId(titleId: string): Title {
  // Grey titles (from shop)
  if (titleId.startsWith('grey_')) {
    const name = titleId.replace('grey_', '').replace(/_/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase());
    return {
      id: titleId,
      name,
      type: 'grey',
      color: '#9CA3AF',
      glow: 'none'
    };
  }
  
  // Rank-based titles (S# Grand Champion, S# Connect Legend)
  const rankBasedMatch = titleId.match(/^S(\d+)\s+(Grand Champion|Connect Legend)$/);
  if (rankBasedMatch) {
    const [, seasonNum, rank] = rankBasedMatch;
    let color = '#FF0000'; // Red for Grand Champion
    let glow = '#FF0000';
    
    if (rank === 'Connect Legend') {
      color = '#FFFFFF'; // White for Connect Legend
      glow = '#FFFFFF';
    }
    
    return {
      id: titleId,
      name: titleId,
      type: 'season',
      color,
      glow,
      season: parseInt(seasonNum)
    };
  }
  
  // Season rank titles (S# [Rank]) - for backwards compatibility
  const seasonRankMatch = titleId.match(/^S(\d+)\s+(Legend|Champion)$/);
  if (seasonRankMatch) {
    const [, seasonNum, rank] = seasonRankMatch;
    let color = '#FF6B9D'; // Champion pink
    let glow = 'none';
    
    if (rank === 'Legend') {
      color = '#FFFFFF'; // White
      glow = '#FFFFFF'; // White glow
    }
    
    return {
      id: titleId,
      name: titleId,
      type: 'season',
      color,
      glow,
      season: parseInt(seasonNum)
    };
  }
  
  // Leaderboard titles (S# TOP CHAMPION, S# TOP 10, S# TOP 30, S# TOP 100)
  const leaderboardMatch = titleId.match(/^S(\d+)\s+TOP\s+(CHAMPION|10|30|100)$/);
  if (leaderboardMatch) {
    const [, seasonNum, placement] = leaderboardMatch;
    let color = '#FFD700'; // Gold
    let glow = '#FFD700'; // Gold glow
    
    if (placement === 'CHAMPION') {
      color = '#FFD700'; // Bright gold
      glow = '#FFD700';
    } else if (placement === '10') {
      color = '#C0C0C0'; // Silver
      glow = '#C0C0C0';
    } else {
      color = '#CD7F32'; // Bronze
      glow = '#CD7F32';
    }
    
    return {
      id: titleId,
      name: titleId,
      type: 'leaderboard',
      color,
      glow,
      season: parseInt(seasonNum)
    };
  }
  
  // Fallback for any other title
  return {
    id: titleId,
    name: titleId.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    type: 'grey',
    color: '#9CA3AF',
    glow: 'none'
  };
}
