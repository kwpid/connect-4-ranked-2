export function calculateQueueTime(trophies: number, playersInRank?: number): number {
  const hour = new Date().getHours();
  
  // Base time based on trophies (lower ranks = faster queues, higher ranks = longer queues)
  let baseTime = 5; // seconds - default for low ranks
  
  // Connect Legend has longer queues with scaling based on trophy count
  if (trophies > 850) baseTime = 90; // Very high Connect Legend - up to 2 minutes
  else if (trophies > 800) baseTime = 75; // High Connect Legend
  else if (trophies > 750) baseTime = 65; // Mid Connect Legend
  else if (trophies > 700) baseTime = 55; // Low Connect Legend
  else if (trophies > 650) baseTime = 50; // Grand Champion III
  else if (trophies > 600) baseTime = 45; // Grand Champion II
  else if (trophies > 550) baseTime = 40; // Grand Champion I
  else if (trophies > 500) baseTime = 35; // Champion III
  else if (trophies > 450) baseTime = 32; // Champion II
  else if (trophies > 400) baseTime = 30; // Champion I
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
  
  // Cap at 120 seconds (2 minutes) as specified, minimum 2 seconds
  return Math.max(2, Math.min(120, totalTime + variance));
}

export function getEstimatedQueueTime(trophies: number): string {
  const seconds = calculateQueueTime(trophies);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ${seconds % 60}s`;
}
