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
  
  // Rank-based titles (S# BRONZE, S# SILVER, S# GOLD, S# PLATINUM, S# DIAMOND, S# CHAMPION, S# GRAND CHAMPION, S# CONNECT LEGEND)
  const rankBasedMatch = titleId.match(/^S(\d+)\s+(BRONZE|SILVER|GOLD|PLATINUM|DIAMOND|CHAMPION|GRAND CHAMPION|CONNECT LEGEND)$/);
  if (rankBasedMatch) {
    const [, seasonNum, rank] = rankBasedMatch;
    let color = '#9CA3AF'; // Grey for most ranks
    let glow = 'none';
    
    // Only Grand Champion and Connect Legend have special colors
    if (rank === 'GRAND CHAMPION') {
      color = '#FF0000'; // Red for Grand Champion
      glow = '#FF0000';
    } else if (rank === 'CONNECT LEGEND') {
      color = '#FFFFFF'; // White for Connect Legend
      glow = '#FFFFFF';
    }
    // All other ranks (BRONZE, SILVER, GOLD, PLATINUM, DIAMOND, CHAMPION) use grey
    
    return {
      id: titleId,
      name: titleId,
      type: 'season',
      color,
      glow,
      season: parseInt(seasonNum)
      // NOTE: No rankImage for normal ranked titles - only tournament titles have rank images
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
  
  // Tournament titles (S# [RANK] TOURNAMENT WINNER or S# [RANK] TOURNAMENT WINNER_MULTI)
  const tournamentMatch = titleId.match(/^S(\d+)\s+(.+?)\s+TOURNAMENT\s+WINNER(_MULTI)?$/);
  if (tournamentMatch) {
    const [, seasonNum, rank, multi] = tournamentMatch;
    let color = '#9CA3AF'; // Default grey
    let glow = 'none';
    
    if (multi) {
      // Multi-win (3+) colors
      if (rank === 'CONNECT LEGEND') {
        color = '#FF69B4'; // Pink for multi-win Legend
        glow = '#FF69B4';
      } else if (rank.startsWith('GRAND CHAMPION')) {
        color = '#FFD700'; // Gold for multi-win GC
        glow = '#FFD700';
      } else {
        color = '#00FF00'; // Green for multi-win regular ranks
        glow = '#00FF00';
      }
    } else {
      // Single-win colors
      if (rank === 'CONNECT LEGEND') {
        color = '#FFFFFF'; // White for Legend
        glow = '#FFFFFF';
      } else if (rank.startsWith('GRAND CHAMPION')) {
        color = '#FF0000'; // Red for GC
        glow = '#FF0000';
      } else {
        color = '#9CA3AF'; // Grey for regular ranks
        glow = 'none';
      }
    }
    
    const displayName = `S${seasonNum} ${rank} TOURNAMENT WINNER`;
    
    return {
      id: titleId,
      name: displayName,
      type: 'tournament',
      color,
      glow,
      season: parseInt(seasonNum),
      rankImage: rank // Store rank for image lookup
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
