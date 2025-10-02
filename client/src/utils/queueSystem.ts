export function calculateQueueTime(trophies: number, playersInRank?: number): number {
  const hour = new Date().getHours();
  
  // Base time based on trophies
  let baseTime = 5; // seconds
  
  if (trophies > 400) baseTime = 15;
  else if (trophies > 300) baseTime = 12;
  else if (trophies > 200) baseTime = 10;
  else if (trophies > 100) baseTime = 8;
  
  // Player count multiplier (fewer players = longer queue)
  let playerMultiplier = 1;
  if (playersInRank !== undefined) {
    if (playersInRank < 50) playerMultiplier = 2.0; // Very few players
    else if (playersInRank < 100) playerMultiplier = 1.5; // Few players
    else if (playersInRank < 200) playerMultiplier = 1.2; // Below average
    else if (playersInRank > 500) playerMultiplier = 0.7; // Many players
    else if (playersInRank > 300) playerMultiplier = 0.85; // Above average
  }
  
  // Time of day multiplier
  let timeMultiplier = 1;
  if (hour >= 0 && hour < 6) timeMultiplier = 2.5; // Late night
  else if (hour >= 6 && hour < 9) timeMultiplier = 1.5; // Early morning
  else if (hour >= 9 && hour < 17) timeMultiplier = 1; // Day
  else if (hour >= 17 && hour < 22) timeMultiplier = 0.8; // Peak evening
  else timeMultiplier = 1.8; // Late evening
  
  const totalTime = Math.floor(baseTime * timeMultiplier * playerMultiplier);
  
  // Add some randomness
  const variance = Math.floor(Math.random() * 3) - 1;
  return Math.max(2, totalTime + variance);
}

export function getEstimatedQueueTime(trophies: number): string {
  const seconds = calculateQueueTime(trophies);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ${seconds % 60}s`;
}
