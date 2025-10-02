import React, { useState, useEffect } from 'react';
import { Screen, PlayerData, TournamentData, TournamentMatch } from './types/game';
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
  saveShopRotation,
  getTournamentData,
  saveTournamentData,
  getNextTournamentTime,
  saveNextTournamentTime
} from './utils/storageManager';
import { 
  shouldResetSeason, 
  updateAICompetitors, 
  resetAICompetitorsForSeason,
  getTop30Leaderboard,
  getCurrentSeasonData 
} from './utils/seasonManager';
import { getSeasonResetTrophies, getSeasonRewardCoins, getRankByTrophies } from './utils/rankSystem';
import { shouldRotateShop, getShopRotationSeed } from './utils/shopManager';
import {
  getNextTournamentTime as calcNextTournamentTime,
  canRegisterForTournament,
  createNewTournament,
  registerPlayerForTournament,
  startTournament,
  simulateAIMatch,
  advanceTournamentRound,
  getPlayerPlacement,
  calculateTournamentReward,
  getTournamentTitle
} from './utils/tournamentManager';

// Screens
import { MenuScreen } from './components/menu/MenuScreen';
import { TitleSelector } from './components/menu/TitleSelector';
import { PracticeScreen } from './components/menu/PracticeScreen';
import { QueueScreen } from './components/queue/QueueScreen';
import { GameScreen } from './components/game/GameScreen';
import { LeaderboardScreen } from './components/leaderboard/LeaderboardScreen';
import { RankInfo } from './components/leaderboard/RankInfo';
import { ShopScreen } from './components/shop/ShopScreen';
import { StatsScreen } from './components/stats/StatsScreen';
import { SettingsScreen } from './components/settings/SettingsScreen';
import { TournamentScreen } from './components/tournament/TournamentScreen';
import { AIDifficulty } from './utils/aiPlayer';

function App() {
  const [screen, setScreen] = useState<Screen>('menu');
  const [playerData, setPlayerData] = useState<PlayerData>(getPlayerData());
  const [aiCompetitors, setAiCompetitors] = useState(getAICompetitors());
  const [seasonData, setSeasonData] = useState(getSeasonData());
  const [shopRotationTime, setShopRotationTime] = useState(getShopRotation());
  const [practiceDifficulty, setPracticeDifficulty] = useState<AIDifficulty>('average');
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [isTournamentMode, setIsTournamentMode] = useState(false);
  const [currentTournament, setCurrentTournament] = useState<TournamentData | null>(getTournamentData());
  const [nextTournamentTime, setNextTournamentTime] = useState<number>(
    getNextTournamentTime() || calcNextTournamentTime()
  );
  const [tournamentMatch, setTournamentMatch] = useState<TournamentMatch | null>(null);
  
  // Tournament timer
  useEffect(() => {
    const checkTournament = () => {
      const now = Date.now();
      
      // Check if tournament should start
      if (now >= nextTournamentTime) {
        if (currentTournament?.status === 'registration') {
          // Start the tournament
          const started = startTournament(currentTournament, aiCompetitors, playerData, seasonData.seasonNumber);
          setCurrentTournament(started);
          saveTournamentData(started);
        } else if (!currentTournament || currentTournament.status === 'completed') {
          // Create new tournament only if no active tournament or previous is completed
          const newTournamentTime = calcNextTournamentTime(now + 1000);
          const newTournament = createNewTournament(newTournamentTime);
          setNextTournamentTime(newTournamentTime);
          saveNextTournamentTime(newTournamentTime);
          setCurrentTournament(newTournament);
          saveTournamentData(newTournament);
        }
      }
      
      // Open registration 3 minutes before
      if (!currentTournament && canRegisterForTournament(now, nextTournamentTime)) {
        const newTournament = createNewTournament(nextTournamentTime);
        setCurrentTournament(newTournament);
        saveTournamentData(newTournament);
      }
    };
    
    checkTournament();
    const interval = setInterval(checkTournament, 1000);
    
    return () => clearInterval(interval);
  }, [nextTournamentTime, currentTournament, aiCompetitors, playerData.trophies, seasonData.seasonNumber]);
  
  // Console cheat code to start tournament immediately
  useEffect(() => {
    (window as any).startTournament = () => {
      const now = Date.now();
      const immediateTournament = createNewTournament(now + 5000); // 5 seconds from now
      setNextTournamentTime(now + 5000);
      saveNextTournamentTime(now + 5000);
      setCurrentTournament(immediateTournament);
      saveTournamentData(immediateTournament);
      console.log('Tournament will start in 5 seconds! Registration is now open.');
    };
  }, []);
  
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
  
  const handleMatchEnd = (won: boolean, trophyChange: number = 0, opponentName?: string, opponentTrophies?: number, matchScore?: string) => {
    const newTrophies = Math.max(0, playerData.trophies + trophyChange);
    const newWinStreak = won ? playerData.winStreak + 1 : 0;
    const newLosingStreak = won ? 0 : playerData.losingStreak + 1;
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
    
    // Track peak rank and trophies
    let newPeakTrophies = playerData.peakTrophies || playerData.trophies;
    let newPeakRank = playerData.peakRank || getRankByTrophies(playerData.trophies).minTrophies.toString();
    let newPeakSeason = playerData.peakSeason || currentSeason.seasonNumber;
    
    if (newTrophies > newPeakTrophies) {
      newPeakTrophies = newTrophies;
      const currentRank = getRankByTrophies(newTrophies);
      newPeakRank = newTrophies.toString();
      newPeakSeason = currentSeason.seasonNumber;
    }
    
    // Add match to history (only if opponent info provided)
    const newMatchHistory = [...(playerData.matchHistory || [])];
    if (opponentName && opponentTrophies !== undefined && matchScore) {
      newMatchHistory.unshift({
        result: won ? 'win' : 'loss',
        score: matchScore,
        trophyChange,
        opponentName,
        opponentTrophies,
        timestamp: Date.now()
      });
      // Keep only last 20 matches
      if (newMatchHistory.length > 20) {
        newMatchHistory.pop();
      }
    }
    
    const updatedPlayer: PlayerData = {
      ...playerData,
      trophies: newTrophies,
      wins: playerData.wins + (won ? 1 : 0),
      losses: playerData.losses + (won ? 0 : 1),
      totalGames: playerData.totalGames + 1,
      winStreak: newWinStreak,
      losingStreak: newLosingStreak,
      currentSeasonWins: playerData.currentSeasonWins + (won ? 1 : 0),
      bestWinStreak: Math.max(playerData.bestWinStreak, newWinStreak),
      xp: newXP,
      level: newLevel,
      coins: playerData.coins + coinsGain + levelUpCoins,
      ownedTitles: newTitles,
      peakTrophies: newPeakTrophies,
      peakRank: newPeakRank,
      peakSeason: newPeakSeason,
      matchHistory: newMatchHistory
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
  
  // Tournament handlers
  const handleTournamentRegister = () => {
    if (currentTournament) {
      const registered = registerPlayerForTournament(currentTournament, playerData);
      setCurrentTournament(registered);
      saveTournamentData(registered);
    }
  };
  
  const handleTournamentUnregister = () => {
    if (currentTournament) {
      const unregistered = { ...currentTournament, participants: [] };
      setCurrentTournament(unregistered);
      saveTournamentData(unregistered);
    }
  };
  
  const handleTournamentMatchStart = (match: TournamentMatch) => {
    setTournamentMatch(match);
    setIsTournamentMode(true);
    setScreen('tournamentGame');
  };
  
  const handleTournamentMatchEnd = (won: boolean) => {
    if (!currentTournament || !tournamentMatch || !currentTournament.bracket) return;
    
    // Determine winner
    const winner = won ? 
      (tournamentMatch.participant1.isPlayer ? tournamentMatch.participant1 : tournamentMatch.participant2) :
      (tournamentMatch.participant1.isPlayer ? tournamentMatch.participant2 : tournamentMatch.participant1);
    
    // Update match
    const updatedMatch = { ...tournamentMatch, winner };
    
    // Update bracket
    let updatedBracket = { ...currentTournament.bracket };
    const round = tournamentMatch.round;
    
    if (round === 1) {
      updatedBracket.round1 = updatedBracket.round1.map(m => 
        m.id === updatedMatch.id ? updatedMatch : m
      );
    } else if (round === 2) {
      updatedBracket.round2 = updatedBracket.round2.map(m => 
        m.id === updatedMatch.id ? updatedMatch : m
      );
    } else if (round === 3) {
      updatedBracket.round3 = updatedBracket.round3.map(m => 
        m.id === updatedMatch.id ? updatedMatch : m
      );
    } else if (round === 4) {
      updatedBracket.finals = updatedBracket.finals.map(m => 
        m.id === updatedMatch.id ? updatedMatch : m
      );
    }
    
    // Check if player lost
    if (!won) {
      const placement = getPlayerPlacement(updatedBracket, true);
      const reward = calculateTournamentReward(placement);
      
      // Initialize tournament stats if not present
      const tournamentStats = playerData.tournamentStats || {
        tournamentsWon: 0,
        tournamentsPlayed: 0,
        currentSeasonWins: 0,
        lastTournamentLeft: null
      };
      
      const updatedPlayer = {
        ...playerData,
        coins: playerData.coins + reward,
        tournamentStats: {
          ...tournamentStats,
          tournamentsPlayed: tournamentStats.tournamentsPlayed + 1
        }
      };
      
      setPlayerData(updatedPlayer);
      savePlayerData(updatedPlayer);
      
      const completedTournament = {
        ...currentTournament,
        bracket: updatedBracket,
        status: 'completed' as const,
        playerPlacement: placement,
        playerReward: reward
      };
      
      setCurrentTournament(completedTournament);
      saveTournamentData(completedTournament);
      setIsTournamentMode(false);
      setScreen('tournament');
      return;
    }
    
    // Simulate other matches in the same round
    if (round === 1) {
      updatedBracket.round1 = updatedBracket.round1.map(m => {
        if (m.id === updatedMatch.id || m.winner) return m;
        return { ...m, winner: simulateAIMatch(m) };
      });
      
      // Check if round is complete
      if (updatedBracket.round1.every(m => m.winner)) {
        updatedBracket = advanceTournamentRound(updatedBracket, 1);
      }
    } else if (round === 2) {
      updatedBracket.round2 = updatedBracket.round2.map(m => {
        if (m.id === updatedMatch.id || m.winner) return m;
        return { ...m, winner: simulateAIMatch(m) };
      });
      
      if (updatedBracket.round2.every(m => m.winner)) {
        updatedBracket = advanceTournamentRound(updatedBracket, 2);
      }
    } else if (round === 3) {
      updatedBracket.round3 = updatedBracket.round3.map(m => {
        if (m.id === updatedMatch.id || m.winner) return m;
        return { ...m, winner: simulateAIMatch(m) };
      });
      
      if (updatedBracket.round3.every(m => m.winner)) {
        updatedBracket = advanceTournamentRound(updatedBracket, 3);
      }
    } else if (round === 4) {
      // Finals - tournament complete
      const placement = 1;
      const reward = calculateTournamentReward(placement);
      
      // Initialize tournament stats if not present
      const tournamentStats = playerData.tournamentStats || {
        tournamentsWon: 0,
        tournamentsPlayed: 0,
        currentSeasonWins: 0,
        lastTournamentLeft: null
      };
      
      const newSeasonWins = tournamentStats.currentSeasonWins + 1;
      const title = getTournamentTitle(placement, playerData.trophies, seasonData.seasonNumber, newSeasonWins);
      
      const newTitles = [...playerData.ownedTitles];
      if (title && !newTitles.includes(title)) {
        newTitles.push(title);
      }
      
      const updatedPlayer = {
        ...playerData,
        coins: playerData.coins + reward,
        ownedTitles: newTitles,
        tournamentStats: {
          ...tournamentStats,
          tournamentsWon: tournamentStats.tournamentsWon + 1,
          tournamentsPlayed: tournamentStats.tournamentsPlayed + 1,
          currentSeasonWins: newSeasonWins
        }
      };
      
      setPlayerData(updatedPlayer);
      savePlayerData(updatedPlayer);
      
      const completedTournament = {
        ...currentTournament,
        bracket: updatedBracket,
        status: 'completed' as const,
        playerPlacement: 1,
        playerReward: reward
      };
      
      setCurrentTournament(completedTournament);
      saveTournamentData(completedTournament);
      setIsTournamentMode(false);
      setScreen('tournament');
      return;
    }
    
    const updatedTournament = { ...currentTournament, bracket: updatedBracket };
    setCurrentTournament(updatedTournament);
    saveTournamentData(updatedTournament);
    setIsTournamentMode(false);
    setScreen('tournament');
  };
  
  const handleTournamentLeave = () => {
    if (currentTournament?.status === 'in_progress') {
      // Player left during tournament - no rewards, penalized
      const tournamentStats = playerData.tournamentStats || {
        tournamentsWon: 0,
        tournamentsPlayed: 0,
        currentSeasonWins: 0,
        lastTournamentLeft: null
      };
      
      const updatedPlayer = {
        ...playerData,
        tournamentStats: {
          ...tournamentStats,
          lastTournamentLeft: Date.now()
        }
      };
      
      setPlayerData(updatedPlayer);
      savePlayerData(updatedPlayer);
    }
    
    // Clear tournament data
    setCurrentTournament(null);
    saveTournamentData(null);
    setScreen('menu');
  };
  
  const isPlayerRegistered = currentTournament?.participants.some(p => p.isPlayer) || false;
  const leaderboard = getTop30Leaderboard(playerData, aiCompetitors);
  
  return (
    <>
      {screen === 'menu' && (
        <MenuScreen
          playerData={playerData}
          onQueue={() => setScreen('queue')}
          onPractice={() => setScreen('practice')}
          onLeaderboard={() => setScreen('leaderboard')}
          onShop={() => setScreen('shop')}
          onStats={() => setScreen('stats')}
          onSettings={() => setScreen('settings')}
          onTitleSelector={() => setScreen('titleSelector')}
          onTournament={() => setScreen('tournament')}
          currentTournament={currentTournament}
          nextTournamentTime={nextTournamentTime}
          isRegistered={isPlayerRegistered}
        />
      )}
      
      {screen === 'practice' && (
        <PracticeScreen
          onSelectDifficulty={(difficulty) => {
            setPracticeDifficulty(difficulty);
            setIsPracticeMode(true);
            setScreen('game');
          }}
          onBack={() => setScreen('menu')}
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
          onMatchFound={() => {
            setIsPracticeMode(false);
            setScreen('game');
          }}
          onCancel={() => setScreen('menu')}
        />
      )}
      
      {screen === 'game' && (
        <GameScreen
          playerData={playerData}
          onMatchEnd={handleMatchEnd}
          onBack={() => setScreen('menu')}
          isPracticeMode={isPracticeMode}
          practiceDifficulty={practiceDifficulty}
        />
      )}
      
      {screen === 'tournament' && currentTournament && (
        <TournamentScreen
          tournament={currentTournament}
          playerData={playerData}
          isRegistered={isPlayerRegistered}
          onRegister={handleTournamentRegister}
          onUnregister={handleTournamentUnregister}
          onPlayMatch={handleTournamentMatchStart}
          onBack={handleTournamentLeave}
        />
      )}
      
      {screen === 'tournamentGame' && tournamentMatch && (
        <GameScreen
          playerData={playerData}
          onMatchEnd={(won) => handleTournamentMatchEnd(won)}
          onBack={handleTournamentLeave}
          isPracticeMode={false}
          isTournamentMode={true}
          tournamentMatch={tournamentMatch}
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
        <RankInfo onBack={() => setScreen('leaderboard')} playerData={playerData} />
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
