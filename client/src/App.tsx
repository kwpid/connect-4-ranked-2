import React, { useState, useEffect } from 'react';
import { Screen, PlayerData } from './types/game';
import { 
  getPlayerData, 
  savePlayerData, 
  getAICompetitors, 
  saveAICompetitors,
  getSeasonData,
  saveSeasonData,
  getLastSeasonCheck,
  saveLastSeasonCheck,
  getShopRotation,
  saveShopRotation
} from './utils/storageManager';
import { 
  shouldResetSeason, 
  updateAICompetitors, 
  resetAICompetitorsForSeason,
  getTop30Leaderboard,
  getCurrentSeasonData 
} from './utils/seasonManager';
import { getSeasonResetTrophies, getSeasonRewardCoins } from './utils/rankSystem';
import { shouldRotateShop, getShopRotationSeed } from './utils/shopManager';

// Screens
import { MenuScreen } from './components/menu/MenuScreen';
import { TitleSelector } from './components/menu/TitleSelector';
import { QueueScreen } from './components/queue/QueueScreen';
import { GameScreen } from './components/game/GameScreen';
import { LeaderboardScreen } from './components/leaderboard/LeaderboardScreen';
import { RankInfo } from './components/leaderboard/RankInfo';
import { ShopScreen } from './components/shop/ShopScreen';
import { StatsScreen } from './components/stats/StatsScreen';
import { SettingsScreen } from './components/settings/SettingsScreen';

function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [playerData, setPlayerData] = useState<PlayerData>(getPlayerData());
  const [aiCompetitors, setAiCompetitors] = useState(getAICompetitors());
  const [seasonData, setSeasonData] = useState(getSeasonData());
  const [shopRotationTime, setShopRotationTime] = useState(getShopRotation());
  
  // Check for season reset and shop rotation on load and periodically
  useEffect(() => {
    const checkUpdates = () => {
      const lastCheck = getLastSeasonCheck();
      
      // Check season reset
      if (shouldResetSeason(lastCheck)) {
        handleSeasonReset();
      }
      
      // Update AI competitors
      const updatedAI = updateAICompetitors(aiCompetitors);
      setAiCompetitors(updatedAI);
      saveAICompetitors(updatedAI);
      
      // Check shop rotation
      if (shouldRotateShop(shopRotationTime)) {
        const newRotation = Date.now();
        setShopRotationTime(newRotation);
        saveShopRotation(newRotation);
      }
      
      saveLastSeasonCheck(Date.now());
    };
    
    checkUpdates();
    const interval = setInterval(checkUpdates, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);
  
  const handleSeasonReset = () => {
    const currentSeason = getCurrentSeasonData();
    
    // Award season rewards
    const coinsReward = getSeasonRewardCoins(playerData.trophies);
    const resetTrophies = getSeasonResetTrophies(playerData.trophies);
    
    // Generate season title if eligible
    const newTitles = [...playerData.ownedTitles];
    if (playerData.trophies >= 401) {
      const rank = playerData.trophies >= 701 ? 'CONNECT LEGEND' : 
                   playerData.trophies >= 551 ? 'GRAND CHAMPION' : 'CHAMPION';
      const seasonTitle = `S${currentSeason.seasonNumber} ${rank}`;
      newTitles.push(seasonTitle);
    }
    
    // Check leaderboard position
    const leaderboard = getTop30Leaderboard(playerData, aiCompetitors);
    const playerEntry = leaderboard.find(e => e.isPlayer);
    if (playerEntry) {
      let lbTitle = '';
      if (playerEntry.rank === 1) lbTitle = `S${currentSeason.seasonNumber} TOP CHAMPION`;
      else if (playerEntry.rank && playerEntry.rank <= 10) lbTitle = `S${currentSeason.seasonNumber} TOP 10`;
      else if (playerEntry.rank && playerEntry.rank <= 30) lbTitle = `S${currentSeason.seasonNumber} TOP 30`;
      
      if (lbTitle) newTitles.push(lbTitle);
    }
    
    // Update player
    const updatedPlayer = {
      ...playerData,
      trophies: resetTrophies,
      coins: playerData.coins + coinsReward,
      ownedTitles: newTitles,
      currentSeasonWins: 0
    };
    
    setPlayerData(updatedPlayer);
    savePlayerData(updatedPlayer);
    
    // Reset AI competitors for new season
    const resetAI = resetAICompetitorsForSeason(aiCompetitors);
    setAiCompetitors(resetAI);
    saveAICompetitors(resetAI);
    
    // Update season data
    setSeasonData(currentSeason);
    saveSeasonData(currentSeason);
  };
  
  const handleMatchEnd = (won: boolean, trophyChange: number) => {
    const newTrophies = Math.max(0, playerData.trophies + trophyChange);
    const newWinStreak = won ? playerData.winStreak + 1 : 0;
    const xpGain = won ? 25 : 10;
    const newXP = playerData.xp + xpGain;
    const newLevel = Math.floor(newXP / 100) + 1;
    const coinsGain = won ? 50 : 20;
    
    // Check if leveled up
    const leveledUp = newLevel > playerData.level;
    const levelUpCoins = leveledUp ? (newLevel - playerData.level) * 100 : 0;
    
    // Award rank-based titles if player won and is in Grand Champion or Legend rank
    const newTitles = [...playerData.ownedTitles];
    const currentSeason = getCurrentSeasonData();
    
    if (won && newTrophies >= 551) {
      // Connect Legend title (701+)
      if (newTrophies >= 701) {
        const legendTitle = `S${currentSeason.seasonNumber} CONNECT LEGEND`;
        if (!newTitles.includes(legendTitle)) {
          newTitles.push(legendTitle);
        }
      }
      
      // Grand Champion title (551+) - always add if in range, even if they already have Legend
      if (newTrophies >= 551) {
        const gcTitle = `S${currentSeason.seasonNumber} GRAND CHAMPION`;
        if (!newTitles.includes(gcTitle)) {
          newTitles.push(gcTitle);
        }
      }
    }
    
    const updatedPlayer: PlayerData = {
      ...playerData,
      trophies: newTrophies,
      wins: playerData.wins + (won ? 1 : 0),
      losses: playerData.losses + (won ? 0 : 1),
      totalGames: playerData.totalGames + 1,
      winStreak: newWinStreak,
      currentSeasonWins: playerData.currentSeasonWins + (won ? 1 : 0),
      bestWinStreak: Math.max(playerData.bestWinStreak, newWinStreak),
      xp: newXP,
      level: newLevel,
      coins: playerData.coins + coinsGain + levelUpCoins,
      ownedTitles: newTitles
    };
    
    setPlayerData(updatedPlayer);
    savePlayerData(updatedPlayer);
    setScreen('menu');
  };
  
  const handleEquipTitle = (titleId: string | null) => {
    const updatedPlayer = { ...playerData, equippedTitle: titleId };
    setPlayerData(updatedPlayer);
    savePlayerData(updatedPlayer);
    setScreen('menu');
  };
  
  const handlePurchaseTitle = (titleId: string, price: number) => {
    if (playerData.coins >= price && !playerData.ownedTitles.includes(titleId)) {
      const updatedPlayer = {
        ...playerData,
        coins: playerData.coins - price,
        ownedTitles: [...playerData.ownedTitles, titleId]
      };
      setPlayerData(updatedPlayer);
      savePlayerData(updatedPlayer);
    }
  };
  
  const handleUsernameChange = (newUsername: string) => {
    const updatedPlayer = { ...playerData, username: newUsername };
    setPlayerData(updatedPlayer);
    savePlayerData(updatedPlayer);
  };
  
  const leaderboard = getTop30Leaderboard(playerData, aiCompetitors);
  
  return (
    <>
      {screen === 'menu' && (
        <MenuScreen
          playerData={playerData}
          onQueue={() => setScreen('queue')}
          onLeaderboard={() => setScreen('leaderboard')}
          onShop={() => setScreen('shop')}
          onStats={() => setScreen('stats')}
          onSettings={() => setScreen('settings')}
          onTitleSelector={() => setScreen('titleSelector')}
        />
      )}
      
      {screen === 'titleSelector' && (
        <TitleSelector
          playerData={playerData}
          onEquip={handleEquipTitle}
          onBack={() => setScreen('menu')}
        />
      )}
      
      {screen === 'queue' && (
        <QueueScreen
          playerData={playerData}
          onMatchFound={() => setScreen('game')}
          onCancel={() => setScreen('menu')}
        />
      )}
      
      {screen === 'game' && (
        <GameScreen
          playerData={playerData}
          onMatchEnd={handleMatchEnd}
          onBack={() => setScreen('menu')}
        />
      )}
      
      {screen === 'leaderboard' && (
        <LeaderboardScreen
          leaderboard={leaderboard}
          playerData={playerData}
          onBack={() => setScreen('menu')}
          onRankInfo={() => setScreen('rankInfo')}
        />
      )}
      
      {screen === 'rankInfo' && (
        <RankInfo onBack={() => setScreen('leaderboard')} />
      )}
      
      {screen === 'shop' && (
        <ShopScreen
          playerData={playerData}
          onPurchase={handlePurchaseTitle}
          onBack={() => setScreen('menu')}
          lastRotation={shopRotationTime}
        />
      )}
      
      {screen === 'stats' && (
        <StatsScreen
          playerData={playerData}
          onBack={() => setScreen('menu')}
        />
      )}
      
      {screen === 'settings' && (
        <SettingsScreen
          playerData={playerData}
          onUsernameChange={handleUsernameChange}
          onBack={() => setScreen('menu')}
        />
      )}
    </>
  );
}

export default App;
