export function calculateQueueTime(trophies: number, playersInRank?: number): number {
  const hour = new Date().getHours();
  
  // Base time based on trophies (lower ranks = faster queues, higher ranks = longer queues)
  let baseTime = 5; // seconds - default for low ranks
  
  if (trophies > 700) baseTime = 45; // Connect Legend - longest queues
  else if (trophies > 600) baseTime = 40; // Grand Champion V
  else if (trophies > 500) baseTime = 35; // Champion V - Grand Champion I
  else if (trophies > 400) baseTime = 30; // Champion I-V
  else if (trophies > 300) baseTime = 25; // Diamond
  else if (trophies > 200) baseTime = 20; // Platinum
  else if (trophies > 100) baseTime = 15; // Gold
  else if (trophies > 50) baseTime = 10; // Silver
  
  // Player count multiplier (fewer players = longer queue)
  let playerMultiplier = 1;
  if (playersInRank !== undefined) {
    if (playersInRank < 50) playerMultiplier = 1.2; // Very few players
    else if (playersInRank < 100) playerMultiplier = 1.1; // Few players
    else if (playersInRank > 500) playerMultiplier = 0.9; // Many players
    else if (playersInRank > 300) playerMultiplier = 0.95; // Above average
  }
  
  // Time of day multiplier (affects queue times significantly)
  let timeMultiplier = 1;
  if (hour >= 0 && hour < 6) timeMultiplier = 1.4; // Late night - much longer queues
  else if (hour >= 6 && hour < 9) timeMultiplier = 1.2; // Early morning - longer queues
  else if (hour >= 9 && hour < 17) timeMultiplier = 1; // Day - normal
  else if (hour >= 17 && hour < 22) timeMultiplier = 0.7; // Peak evening - fastest queues
  else timeMultiplier = 1.3; // Late evening - longer queues
  
  const totalTime = Math.floor(baseTime * timeMultiplier * playerMultiplier);
  
  // Add significant randomness (±3 seconds base, with occasional spikes)
  const baseVariance = Math.floor(Math.random() * 7) - 3;
  // 15% chance for extra variance
  const extraVariance = Math.random() < 0.15 ? (Math.random() < 0.5 ? -5 : 8) : 0;
  const variance = baseVariance + extraVariance;
  
  return Math.max(2, totalTime + variance);
}

export function getEstimatedQueueTime(trophies: number): string {
  const seconds = calculateQueueTime(trophies);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ${seconds % 60}s`;
}
