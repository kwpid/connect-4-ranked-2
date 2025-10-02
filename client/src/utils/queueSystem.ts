export function calculateQueueTime(trophies: number, playersInRank?: number): number {
  const hour = new Date().getHours();
  
  // Base time based on trophies (highest ranks = longest queues, 30s-1m range)
  let baseTime = 30; // seconds
  
  if (trophies > 700) baseTime = 60; // Connect Legend - longest queues (1 minute)
  else if (trophies > 600) baseTime = 55; // Grand Champion V
  else if (trophies > 500) baseTime = 50; // Champion V - Grand Champion I
  else if (trophies > 400) baseTime = 45; // Champion I-V
  else if (trophies > 300) baseTime = 40; // Diamond
  else if (trophies > 200) baseTime = 35; // Platinum
  else if (trophies > 100) baseTime = 32; // Gold
  
  // Player count multiplier (fewer players = longer queue)
  let playerMultiplier = 1;
  if (playersInRank !== undefined) {
    if (playersInRank < 50) playerMultiplier = 1.2; // Very few players
    else if (playersInRank < 100) playerMultiplier = 1.1; // Few players
    else if (playersInRank > 500) playerMultiplier = 0.9; // Many players
    else if (playersInRank > 300) playerMultiplier = 0.95; // Above average
  }
  
  // Time of day multiplier (less impact now)
  let timeMultiplier = 1;
  if (hour >= 0 && hour < 6) timeMultiplier = 1.15; // Late night
  else if (hour >= 6 && hour < 9) timeMultiplier = 1.1; // Early morning
  else if (hour >= 9 && hour < 17) timeMultiplier = 1; // Day
  else if (hour >= 17 && hour < 22) timeMultiplier = 0.95; // Peak evening
  else timeMultiplier = 1.1; // Late evening
  
  const totalTime = Math.floor(baseTime * timeMultiplier * playerMultiplier);
  
  // Add some randomness (±3 seconds)
  const variance = Math.floor(Math.random() * 7) - 3;
  return Math.max(30, Math.min(60, totalTime + variance));
}

export function getEstimatedQueueTime(trophies: number): string {
  const seconds = calculateQueueTime(trophies);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ${seconds % 60}s`;
}
