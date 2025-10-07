import React, { useState, useEffect } from "react";
import {
  Screen,
  PlayerData,
  TournamentData,
  TournamentMatch,
} from "./types/game";
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
  saveNextTournamentTime,
} from "./utils/storageManager";
import {
  shouldResetSeason,
  updateAICompetitors,
  updateLeaderboardAI,
  resetAICompetitorsForSeason,
  getTop100Leaderboard,
  getCurrentSeasonData,
  catchUpAICompetitors,
} from "./utils/seasonManager";
import {
  getSeasonResetTrophies,
  getSeasonRewardCoins,
  getRankByTrophies,
} from "./utils/rankSystem";
import { shouldRotateShop, getShopRotationSeed } from "./utils/shopManager";
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
  getTournamentTitle,
} from "./utils/tournamentManager";
import { loadBanners, getRankBannersForPlayer } from "./utils/bannerManager";
import { loadPfps } from "./utils/pfpManager";
import {
  getSeasonalRewardsForPlayer,
  extractBannerIds,
  extractPfpIds,
} from "./utils/rewardManager";

// Screens
import { MenuScreen } from "./components/menu/MenuScreen";
import { PlayMenuScreen } from "./components/menu/PlayMenuScreen";
import { TitleSelector } from "./components/menu/TitleSelector";
import { PracticeScreen } from "./components/menu/PracticeScreen";
import { QueueScreen } from "./components/queue/QueueScreen";
import { GameScreen } from "./components/game/GameScreen";
import { LeaderboardScreen } from "./components/leaderboard/LeaderboardScreen";
import { RankInfo } from "./components/leaderboard/RankInfo";
import { ShopScreen } from "./components/shop/ShopScreen";
import { StatsScreen } from "./components/stats/StatsScreen";
import { SettingsScreen } from "./components/settings/SettingsScreen";
import { TournamentScreen } from "./components/tournament/TournamentScreen";
import { InventoryScreen } from "./components/inventory/InventoryScreen";
import { CSLScreen } from "./components/csl/CSLScreen";
import { AIDifficulty } from "./utils/aiPlayer";
import { NewsFeedPopup } from "./components/news/NewsFeedPopup";
import {
  ItemNotificationPopup,
  type NewItem,
} from "./components/common/ItemNotificationPopup";
import { SeasonRewardsProgress } from "./components/common/SeasonRewardsProgress";
import {
  loadNews,
  getUnreadCount,
  shouldAutoShowNews,
  getCurrentVersion,
  generateSeasonNews,
  addDynamicNews,
  type NewsItem,
} from "./utils/newsManager";
import { MobileTestingPanel } from "./components/debug/MobileTestingPanel";

function App() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [playerData, setPlayerData] = useState<PlayerData>(getPlayerData());
  const [aiCompetitors, setAiCompetitors] = useState(getAICompetitors());
  const [seasonData, setSeasonData] = useState(getSeasonData());
  const [shopRotationTime, setShopRotationTime] = useState(getShopRotation());
  const [practiceDifficulty, setPracticeDifficulty] =
    useState<AIDifficulty>("average");
  const [isPracticeMode, setIsPracticeMode] = useState(false);
  const [isTournamentMode, setIsTournamentMode] = useState(false);
  const [currentTournament, setCurrentTournament] =
    useState<TournamentData | null>(getTournamentData());
  const [nextTournamentTime, setNextTournamentTime] = useState<number>(
    getNextTournamentTime() || calcNextTournamentTime(),
  );
  const [tournamentMatch, setTournamentMatch] =
    useState<TournamentMatch | null>(null);
  const [nextAIUpdate, setNextAIUpdate] = useState<number>(
    Date.now() + 5 * 60 * 1000,
  );
  // Player's trophy count snapshot for leaderboard (updates every 5 minutes with AI)
  const [playerLeaderboardTrophies, setPlayerLeaderboardTrophies] = useState<number>(
    playerData.trophies,
  );
  const [news, setNews] = useState<NewsItem[]>([]);
  const [showNewsPopup, setShowNewsPopup] = useState(false);
  const [newsAutoOpened, setNewsAutoOpened] = useState(false);
  const [newItems, setNewItems] = useState<NewItem[]>([]);
  const [showItemNotification, setShowItemNotification] = useState(false);
  const [refundAmount, setRefundAmount] = useState<number>(0);
  const [showRefundNotification, setShowRefundNotification] = useState(false);
  const [showSeasonRewardsProgress, setShowSeasonRewardsProgress] = useState(false);
  const [seasonProgressData, setSeasonProgressData] = useState<{ tier: string; wins: number }>({ tier: 'Bronze', wins: 0 });
  const [showMobileTestPanel, setShowMobileTestPanel] = useState(false); // Set to false to disable

  // Catch up AI competitors on initial load (simulates grinding while player was away)
  useEffect(() => {
    const caughtUpAI = catchUpAICompetitors(aiCompetitors);
    const hasChanges = caughtUpAI.some(
      (ai, index) => ai.trophies !== aiCompetitors[index].trophies,
    );

    if (hasChanges) {
      setAiCompetitors(caughtUpAI);
      saveAICompetitors(caughtUpAI);
      console.log("AI competitors caught up from offline time");
    }
  }, []); // Only run once on mount

  // Tournament timer
  useEffect(() => {
    const checkTournament = () => {
      const now = Date.now();

      // Check if tournament should start
      if (now >= nextTournamentTime) {
        if (currentTournament?.status === "registration") {
          // Start the tournament
          const started = startTournament(
            currentTournament,
            aiCompetitors,
            playerData,
            seasonData.seasonNumber,
          );
          setCurrentTournament(started);
          saveTournamentData(started);
        } else if (
          !currentTournament ||
          currentTournament.status === "completed"
        ) {
          // Create new tournament only if no active tournament or previous is completed
          const newTournamentTime = calcNextTournamentTime(now + 1000);
          const newTournament = createNewTournament(newTournamentTime);
          // Explicitly ensure participants array is empty to prevent auto-registration bug
          newTournament.participants = [];
          setNextTournamentTime(newTournamentTime);
          saveNextTournamentTime(newTournamentTime);
          setCurrentTournament(newTournament);
          saveTournamentData(newTournament);
        }
      }

      // Open registration 3 minutes before
      if (
        !currentTournament &&
        canRegisterForTournament(now, nextTournamentTime)
      ) {
        const newTournament = createNewTournament(nextTournamentTime);
        // Explicitly ensure participants array is empty to prevent auto-registration bug
        newTournament.participants = [];
        setCurrentTournament(newTournament);
        saveTournamentData(newTournament);
      }
    };

    checkTournament();
    const interval = setInterval(checkTournament, 1000);

    return () => clearInterval(interval);
  }, [
    nextTournamentTime,
    currentTournament,
    aiCompetitors,
    playerData.trophies,
    seasonData.seasonNumber,
  ]);

  // AI match simulation when player is NOT in tournament or has been eliminated
  useEffect(() => {
    if (!currentTournament || currentTournament.status !== "in_progress")
      return;
    if (!currentTournament.bracket) return;

    // Check if player has a pending match (still actively playing)
    const findPlayerMatch = (): boolean => {
      const allMatches = [
        ...currentTournament.bracket!.round1,
        ...currentTournament.bracket!.round2,
        ...currentTournament.bracket!.round3,
        ...currentTournament.bracket!.finals,
      ];

      for (const match of allMatches) {
        if (
          !match.winner &&
          (match.participant1.isPlayer || match.participant2.isPlayer)
        ) {
          return true;
        }
      }

      return false;
    };

    const playerHasPendingMatch = findPlayerMatch();
    if (playerHasPendingMatch) return; // Player has a pending match, don't auto-simulate

    // Find all pending AI matches (matches without winners)
    const allRounds = [
      { matches: currentTournament.bracket.round1, roundNum: 1 },
      { matches: currentTournament.bracket.round2, roundNum: 2 },
      { matches: currentTournament.bracket.round3, roundNum: 3 },
      { matches: currentTournament.bracket.finals, roundNum: 4 },
    ];

    // Find the earliest round with pending matches
    for (const { matches, roundNum } of allRounds) {
      const pendingMatches = matches.filter((m) => !m.winner);

      if (pendingMatches.length > 0) {
        // Simulate one match at a time with a delay
        const timer = setTimeout(() => {
          const matchToSimulate = pendingMatches[0];
          const winner = simulateAIMatch(matchToSimulate);

          // Update the match with the winner
          const updatedBracket = { ...currentTournament.bracket! };
          const roundKey =
            roundNum === 1
              ? "round1"
              : roundNum === 2
                ? "round2"
                : roundNum === 3
                  ? "round3"
                  : "finals";

          updatedBracket[roundKey] = updatedBracket[roundKey].map((m) =>
            m.id === matchToSimulate.id ? { ...m, winner } : m,
          );

          // Check if this was the last match in the round
          const allMatchesComplete = updatedBracket[roundKey].every(
            (m) => m.winner,
          );

          let finalBracket = updatedBracket;
          if (allMatchesComplete && roundNum < 4) {
            // Advance to next round
            finalBracket = advanceTournamentRound(updatedBracket, roundNum);
          }

          const updatedTournament = {
            ...currentTournament,
            bracket: finalBracket,
          };

          // Check if tournament is complete (finals winner exists)
          if (roundNum === 4 && finalBracket.finals[0]?.winner) {
            updatedTournament.status = "completed" as const;
            updatedTournament.participants = []; // Clear participants
          }

          setCurrentTournament(updatedTournament);
          saveTournamentData(updatedTournament);
        }, 2000); // 2 second delay between AI matches

        return () => clearTimeout(timer);
      }
    }
  }, [currentTournament]);

  // Load news and check for auto-show on initial mount
  useEffect(() => {
    loadNews().then((newsData) => {
      setNews(newsData);

      // Auto-show news popup if there are unread news and setting is enabled
      if (shouldAutoShowNews(newsData)) {
        setShowNewsPopup(true);
        setNewsAutoOpened(true);
      }
    });
  }, []);

  // Console cheat code to start tournament immediately
  useEffect(() => {
    (window as any).startTournament = () => {
      const now = Date.now();
      const immediateTournament = createNewTournament(now + 5000); // 5 seconds from now
      setNextTournamentTime(now + 5000);
      saveNextTournamentTime(now + 5000);
      setCurrentTournament(immediateTournament);
      saveTournamentData(immediateTournament);
      console.log(
        "Tournament will start in 5 seconds! Registration is now open.",
      );
    };
  }, []);

  // Leaderboard AI update every 5 minutes based on clock time (XX:00, XX:05, XX:10, etc.)
  useEffect(() => {
    // Calculate next 5-minute mark timestamp
    const getNext5MinuteTimestamp = () => {
      const now = new Date();
      const next = new Date(now);
      const minutes = now.getMinutes();
      const seconds = now.getSeconds();
      
      // If we're in a 5-minute slot (minutes % 5 === 0), always go to next 5-minute mark
      // Otherwise, round up to the next 5-minute mark
      const nextMinuteMark = (minutes % 5 === 0) 
        ? minutes + 5
        : Math.ceil(minutes / 5) * 5;
      
      next.setMinutes(nextMinuteMark);
      next.setSeconds(0);
      next.setMilliseconds(0);
      return next.getTime();
    };

    const updateLeaderboard = () => {
      setAiCompetitors((currentAI) => {
        const updatedAI = updateLeaderboardAI(currentAI);
        saveAICompetitors(updatedAI);
        return updatedAI;
      });
      // Update player's leaderboard trophy snapshot to current value
      setPlayerData(current => {
        setPlayerLeaderboardTrophies(current.trophies);
        return current;
      });
      
      // Calculate next update timestamp
      const nextUpdate = getNext5MinuteTimestamp();
      setNextAIUpdate(nextUpdate);
      console.log("Leaderboard AI updated - some AI won/lost trophies");
      console.log("Player leaderboard position updated");
    };

    // Calculate initial delay to sync with clock time
    const nextUpdate = getNext5MinuteTimestamp();
    const delay = Math.max(0, nextUpdate - Date.now());
    setNextAIUpdate(nextUpdate);
    
    // Store timeout and interval IDs for cleanup
    let timeoutId: NodeJS.Timeout | null = null;
    let intervalId: NodeJS.Timeout | null = null;
    
    // Set initial timeout to sync with clock
    timeoutId = setTimeout(() => {
      updateLeaderboard();
      // Then set interval for every 5 minutes
      intervalId = setInterval(updateLeaderboard, 5 * 60 * 1000);
    }, delay);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, []); // No dependencies - interval runs independently based on clock time

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

  const handleSeasonReset = async () => {
    const currentSeason = getCurrentSeasonData();
    
    // IMPORTANT: currentSeason is the NEW season that just started
    // We need to award rewards for the PREVIOUS season that just ended
    const endedSeasonNumber = Math.max(1, currentSeason.seasonNumber - 1);
    
    console.log('=== SEASON RESET ===');
    console.log('New season:', currentSeason.seasonNumber);
    console.log('Awarding rewards for season:', endedSeasonNumber);
    console.log('Player trophies:', playerData.trophies);
    console.log('Season reward wins:', playerData.seasonRewardWins);

    // Generate and save season end news dynamically
    const seasonNews = generateSeasonNews(endedSeasonNumber);
    addDynamicNews(seasonNews);

    // Reload news to include the new season news
    const updatedNews = await loadNews();
    setNews(updatedNews);

    // Capture final trophies before reset for coin/trophy calculation
    const finalTrophies = playerData.trophies;

    // Award season rewards
    const coinsReward = getSeasonRewardCoins(finalTrophies);
    const resetTrophies = getSeasonResetTrophies(finalTrophies);

    // Collect new items for notification
    const earnedItems: NewItem[] = [];

    // Map tier to rank name
    const tierToRankName: Record<string, string> = {
      legend: "Connect Legend",
      grand_champion: "Grand Champion",
      champion: "Champion",
      diamond: "Diamond",
      platinum: "Platinum",
      gold: "Gold",
      silver: "Silver",
      bronze: "Bronze",
    };

    // Rank order for cascading rewards (Bronze to Connect Legend)
    const rankOrder = [
      'Bronze',
      'Silver',
      'Gold',
      'Platinum',
      'Diamond',
      'Champion',
      'Grand Champion',
      'Connect Legend'
    ];

    // Find highest tier with 5+ wins for reward eligibility
    let highestEarnedTierIndex = -1;
    for (let i = rankOrder.length - 1; i >= 0; i--) {
      if ((playerData.seasonRewardWins?.[rankOrder[i]] || 0) >= 5) {
        highestEarnedTierIndex = i;
        break;
      }
    }

    // Award season titles based on 5+ wins requirement (same as banners/PFPs)
    const newTitles = [...playerData.ownedTitles];
    
    if (highestEarnedTierIndex >= 0) {
      console.log('Highest earned tier:', rankOrder[highestEarnedTierIndex]);
      // Award titles for all tiers from Bronze up to highest earned tier
      for (let i = 0; i <= highestEarnedTierIndex; i++) {
        const tierName = rankOrder[i].toUpperCase().replace(' ', ' ');
        const seasonTitle = `S${endedSeasonNumber} ${tierName}`;
        
        if (!newTitles.includes(seasonTitle)) {
          newTitles.push(seasonTitle);
          earnedItems.push({ type: "title", titleId: seasonTitle });
          console.log('Awarded title:', seasonTitle);
        } else {
          console.log('Already owned title:', seasonTitle);
        }
      }
    } else {
      console.log('No tier with 5+ wins - no season titles awarded');
    }

    // Check leaderboard position and extract top 100 AI IDs
    // Use snapshot trophies for leaderboard (updates every 5 minutes)
    const leaderboard = getTop100Leaderboard(playerData, aiCompetitors, playerLeaderboardTrophies);
    const playerEntry = leaderboard.find((e) => e.isPlayer);
    // Only top 50 get placement titles
    if (playerEntry && playerEntry.rank && playerEntry.rank <= 50) {
      let lbTitle = "";
      if (playerEntry.rank === 1)
        lbTitle = `S${endedSeasonNumber} TOP CHAMPION`;
      else if (playerEntry.rank <= 10)
        lbTitle = `S${endedSeasonNumber} TOP 10`;
      else if (playerEntry.rank <= 25)
        lbTitle = `S${endedSeasonNumber} TOP 25`;
      else if (playerEntry.rank <= 50)
        lbTitle = `S${endedSeasonNumber} TOP 50`;

      if (lbTitle && !newTitles.includes(lbTitle)) {
        newTitles.push(lbTitle);
        earnedItems.push({ type: "title", titleId: lbTitle });
      }
    }

    // Extract top 100 AI IDs for reset (exclude player)
    const top100AIIds = new Set(
      leaderboard
        .filter((entry) => !entry.isPlayer)
        .map((entry) => entry.username)
        .slice(0, 100)
        .map(
          (username) =>
            aiCompetitors.find((ai) => ai.username === username)?.id,
        )
        .filter(Boolean) as string[],
    );

    // Award seasonal rewards (banners or PFPs based on availability)
    const newBanners = [...playerData.ownedBanners];
    const newPfps = [...playerData.ownedPfps];
    const rank = getRankByTrophies(finalTrophies);

    const finalRankName = tierToRankName[rank.tier] || "";

    if (finalRankName) {
      // Get seasonal rewards (tries banners first, falls back to PFPs if not available)
      // Now using the correct season number (the season that ended)
      const rewards = await getSeasonalRewardsForPlayer(
        finalRankName,
        playerData.seasonRewardWins || {},
        endedSeasonNumber,
      );

      // Process rewards
      console.log('Processing', rewards.length, 'banner/PFP rewards');
      rewards.forEach((reward) => {
        if (reward.type === "banner") {
          const banner = reward.item as any;
          if (!newBanners.includes(banner.bannerId)) {
            newBanners.push(banner.bannerId);
            earnedItems.push({ type: "banner", banner });
            console.log('Awarded banner:', banner.bannerName, 'for rank:', reward.rank);
          }
        } else if (reward.type === "pfp") {
          const pfp = reward.item as any;
          if (!newPfps.includes(pfp.pfpId)) {
            newPfps.push(pfp.pfpId);
            earnedItems.push({ type: "pfp", pfp });
            console.log('Awarded PFP:', pfp.pfpName, 'for rank:', reward.rank);
          }
        }
      });
    } else {
      console.log('No valid rank for banner/PFP rewards');
    }

    console.log('Total items earned:', earnedItems.length);
    console.log('Coins reward:', coinsReward);
    console.log('Trophy reset:', playerData.trophies, '->', resetTrophies);

    // Update player
    const updatedPlayer = {
      ...playerData,
      trophies: resetTrophies,
      coins: playerData.coins + coinsReward,
      ownedTitles: newTitles,
      ownedBanners: newBanners,
      ownedPfps: newPfps,
      tournamentStats: {
        ...(playerData.tournamentStats || {
          tournamentsWon: 0,
          tournamentsPlayed: 0,
          currentSeasonWins: 0,
          lastTournamentLeft: null,
        }),
        currentSeasonWins: 0,
      },
      seasonRewardWins: {}, // Reset season reward wins
      seasonRewardTier: undefined, // Reset season reward tier
    };

    setPlayerData(updatedPlayer);
    savePlayerData(updatedPlayer);

    // Reset AI competitors for new season (top 100 leaderboard AI reset to 701 trophies)
    const resetAI = resetAICompetitorsForSeason(aiCompetitors, top100AIIds);
    setAiCompetitors(resetAI);
    saveAICompetitors(resetAI);

    // Update season data
    setSeasonData(currentSeason);
    saveSeasonData(currentSeason);

    // Show item notifications if any items were earned
    if (earnedItems.length > 0) {
      setNewItems(earnedItems);
      setShowItemNotification(true);
    }
  };

  const handleMatchEnd = (
    won: boolean,
    trophyChange: number = 0,
    opponentName?: string,
    opponentTrophies?: number,
    matchScore?: string,
  ) => {
    const currentSeason = getCurrentSeasonData();
    const newTrophies = Math.max(0, playerData.trophies + trophyChange);
    const newWinStreak = won ? playerData.winStreak + 1 : 0;
    const newLosingStreak = won ? 0 : playerData.losingStreak + 1;
    const xpGain = won ? 25 : 10;
    const newXP = playerData.xp + xpGain;
    const newLevel = Math.floor(newXP / 100) + 1;
    const coinsGain = won
      ? Math.floor(Math.random() * 9) + 17
      : Math.floor(Math.random() * 7) + 10; // 17-25 for win, 10-16 for loss

    // Check if leveled up
    const leveledUp = newLevel > playerData.level;
    const levelUpCoins = leveledUp ? (newLevel - playerData.level) * 100 : 0;

    // Season titles are now awarded at the end of the season based on final rank
    const newTitles = [...playerData.ownedTitles];
    const earnedItems: NewItem[] = [];

    // Track peak rank and trophies
    let newPeakTrophies = playerData.peakTrophies || playerData.trophies;
    let newPeakRank =
      playerData.peakRank ||
      getRankByTrophies(playerData.trophies).minTrophies.toString();
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
        result: won ? "win" : "loss",
        score: matchScore,
        trophyChange,
        opponentName,
        opponentTrophies,
        timestamp: Date.now(),
        trophyBefore: playerData.trophies,
        trophyAfter: newTrophies,
      });
      // Keep only last 20 matches
      if (newMatchHistory.length > 20) {
        newMatchHistory.pop();
      }
    }

    // Track season reward wins per tier
    const currentRank = getRankByTrophies(newTrophies);
    const tierToRankName: Record<string, string> = {
      legend: "Connect Legend",
      grand_champion: "Grand Champion",
      champion: "Champion",
      diamond: "Diamond",
      platinum: "Platinum",
      gold: "Gold",
      silver: "Silver",
      bronze: "Bronze",
    };
    const currentTierName = tierToRankName[currentRank.tier] || "Bronze";
    
    const seasonRewardWins = { ...(playerData.seasonRewardWins || {}) };
    if (won) {
      seasonRewardWins[currentTierName] = (seasonRewardWins[currentTierName] || 0) + 1;
    }
    
    // Update seasonRewardTier to the highest tier with 5+ wins or current tier
    let highestRewardTier = playerData.seasonRewardTier || "Bronze";
    const rankOrder = [
      'Bronze',
      'Silver',
      'Gold',
      'Platinum',
      'Diamond',
      'Champion',
      'Grand Champion',
      'Connect Legend'
    ];
    
    // Find highest tier with 5+ wins or the current tier
    for (let i = rankOrder.length - 1; i >= 0; i--) {
      const tier = rankOrder[i];
      if ((seasonRewardWins[tier] || 0) >= 5) {
        highestRewardTier = tier;
        break;
      }
    }
    
    // If current tier is higher than highestRewardTier, use current tier
    const currentTierIndex = rankOrder.indexOf(currentTierName);
    const highestTierIndex = rankOrder.indexOf(highestRewardTier);
    if (currentTierIndex > highestTierIndex) {
      highestRewardTier = currentTierName;
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
      matchHistory: newMatchHistory,
      seasonRewardWins,
      seasonRewardTier: highestRewardTier,
    };

    setPlayerData(updatedPlayer);
    savePlayerData(updatedPlayer);
    setScreen("menu");

    // Show item notifications if any items were earned
    if (earnedItems.length > 0) {
      setNewItems(earnedItems);
      setShowItemNotification(true);
    }
    
    // Show season rewards progress after winning a ranked game (not practice)
    if (won && !isPracticeMode) {
      setSeasonProgressData({
        tier: currentTierName,
        wins: seasonRewardWins[currentTierName] || 0
      });
      // Show progress after item notification or immediately if no items
      if (earnedItems.length === 0) {
        setShowSeasonRewardsProgress(true);
      }
    }
  };

  const handleEquipTitle = (titleId: string | null) => {
    const updatedPlayer = { ...playerData, equippedTitle: titleId };
    setPlayerData(updatedPlayer);
    savePlayerData(updatedPlayer);
  };

  const handleEquipBanner = (bannerId: number | null) => {
    const updatedPlayer = { ...playerData, equippedBanner: bannerId };
    setPlayerData(updatedPlayer);
    savePlayerData(updatedPlayer);
  };

  const handlePurchaseTitle = (titleId: string, price: number) => {
    if (
      playerData.coins >= price &&
      !playerData.ownedTitles.includes(titleId)
    ) {
      const updatedPlayer = {
        ...playerData,
        coins: playerData.coins - price,
        ownedTitles: [...playerData.ownedTitles, titleId],
      };
      setPlayerData(updatedPlayer);
      savePlayerData(updatedPlayer);

      setNewItems([{ type: "title", titleId }]);
      setShowItemNotification(true);
    }
  };

  const handlePurchaseBanner = async (bannerId: number, price: number) => {
    if (
      playerData.coins >= price &&
      !playerData.ownedBanners.includes(bannerId)
    ) {
      const updatedPlayer = {
        ...playerData,
        coins: playerData.coins - price,
        ownedBanners: [...playerData.ownedBanners, bannerId],
      };
      setPlayerData(updatedPlayer);
      savePlayerData(updatedPlayer);

      const banners = await loadBanners();
      const banner = banners.find((b) => b.bannerId === bannerId);
      if (banner) {
        setNewItems([{ type: "banner", banner }]);
        setShowItemNotification(true);
      }
    }
  };

  const handleCratePurchase = (
    cratePrice: number,
    item: any,
    isDuplicate: boolean,
    refundAmountValue: number,
  ) => {
    if (isDuplicate) {
      const updatedPlayer = {
        ...playerData,
        coins: playerData.coins - cratePrice + refundAmountValue,
      };
      setPlayerData(updatedPlayer);
      savePlayerData(updatedPlayer);

      setRefundAmount(refundAmountValue);
      setShowRefundNotification(true);
    } else {
      if ("bannerId" in item) {
        handlePurchaseBanner(item.bannerId, cratePrice);
      } else if ("pfpId" in item) {
        handlePurchasePfp(item.pfpId, cratePrice);
      } else {
        handlePurchaseTitle(item.id, cratePrice);
      }
    }
  };

  const handlePurchasePfp = async (pfpId: number, price: number) => {
    if (playerData.coins >= price && !playerData.ownedPfps.includes(pfpId)) {
      const updatedPlayer = {
        ...playerData,
        coins: playerData.coins - price,
        ownedPfps: [...playerData.ownedPfps, pfpId],
      };
      setPlayerData(updatedPlayer);
      savePlayerData(updatedPlayer);

      const { loadPfps } = await import("./utils/pfpManager");
      const pfps = await loadPfps();
      const pfp = pfps.find((p) => p.pfpId === pfpId);
      if (pfp) {
        setNewItems([{ type: "pfp", pfp }]);
        setShowItemNotification(true);
      }
    }
  };

  const handleEquipPfp = (pfpId: number | null) => {
    const updatedPlayer = { ...playerData, equippedPfp: pfpId };
    setPlayerData(updatedPlayer);
    savePlayerData(updatedPlayer);
  };

  const handleUsernameChange = (newUsername: string) => {
    const updatedPlayer = { ...playerData, username: newUsername };
    setPlayerData(updatedPlayer);
    savePlayerData(updatedPlayer);
  };

  const handleMobileTestUpdate = (updates: {
    trophies?: number;
    wins?: number;
    losses?: number;
  }) => {
    const updatedPlayer = {
      ...playerData,
      ...(updates.trophies !== undefined && { trophies: updates.trophies }),
      ...(updates.wins !== undefined && { wins: updates.wins }),
      ...(updates.losses !== undefined && { losses: updates.losses }),
    };
    setPlayerData(updatedPlayer);
    savePlayerData(updatedPlayer);
  };

  // Tournament handlers
  const handleTournamentRegister = () => {
    if (currentTournament) {
      const registered = registerPlayerForTournament(
        currentTournament,
        playerData,
      );
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
    setScreen("tournamentGame");
  };

  const handleTournamentMatchEnd = (won: boolean) => {
    if (!currentTournament || !tournamentMatch || !currentTournament.bracket)
      return;

    // Determine winner
    const winner = won
      ? tournamentMatch.participant1.isPlayer
        ? tournamentMatch.participant1
        : tournamentMatch.participant2
      : tournamentMatch.participant1.isPlayer
        ? tournamentMatch.participant2
        : tournamentMatch.participant1;

    // Update match
    const updatedMatch = { ...tournamentMatch, winner };

    // Update bracket
    let updatedBracket = { ...currentTournament.bracket };
    const round = tournamentMatch.round;

    if (round === 1) {
      updatedBracket.round1 = updatedBracket.round1.map((m) =>
        m.id === updatedMatch.id ? updatedMatch : m,
      );
    } else if (round === 2) {
      updatedBracket.round2 = updatedBracket.round2.map((m) =>
        m.id === updatedMatch.id ? updatedMatch : m,
      );
    } else if (round === 3) {
      updatedBracket.round3 = updatedBracket.round3.map((m) =>
        m.id === updatedMatch.id ? updatedMatch : m,
      );
    } else if (round === 4) {
      updatedBracket.finals = updatedBracket.finals.map((m) =>
        m.id === updatedMatch.id ? updatedMatch : m,
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
        lastTournamentLeft: null,
      };

      const updatedPlayer = {
        ...playerData,
        coins: playerData.coins + reward,
        tournamentStats: {
          ...tournamentStats,
          tournamentsPlayed: tournamentStats.tournamentsPlayed + 1,
        },
      };

      setPlayerData(updatedPlayer);
      savePlayerData(updatedPlayer);

      // Keep tournament as 'in_progress' so AI simulation can continue
      // Don't mark as 'completed' - let AI simulation complete the tournament
      const eliminatedTournament = {
        ...currentTournament,
        bracket: updatedBracket,
        status: "in_progress" as const, // Keep in progress for AI to finish
        playerPlacement: placement,
        playerReward: reward,
      };

      setCurrentTournament(eliminatedTournament);
      saveTournamentData(eliminatedTournament);
      setIsTournamentMode(false);
      setScreen("tournament");
      return;
    }

    // Simulate other matches in the same round
    if (round === 1) {
      updatedBracket.round1 = updatedBracket.round1.map((m) => {
        if (m.id === updatedMatch.id || m.winner) return m;
        return { ...m, winner: simulateAIMatch(m) };
      });

      // Check if round is complete
      if (updatedBracket.round1.every((m) => m.winner)) {
        updatedBracket = advanceTournamentRound(updatedBracket, 1);
      }
    } else if (round === 2) {
      updatedBracket.round2 = updatedBracket.round2.map((m) => {
        if (m.id === updatedMatch.id || m.winner) return m;
        return { ...m, winner: simulateAIMatch(m) };
      });

      if (updatedBracket.round2.every((m) => m.winner)) {
        updatedBracket = advanceTournamentRound(updatedBracket, 2);
      }
    } else if (round === 3) {
      updatedBracket.round3 = updatedBracket.round3.map((m) => {
        if (m.id === updatedMatch.id || m.winner) return m;
        return { ...m, winner: simulateAIMatch(m) };
      });

      if (updatedBracket.round3.every((m) => m.winner)) {
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
        lastTournamentLeft: null,
      };

      // Calculate new season wins (this is the count AFTER this win)
      const newSeasonWins = tournamentStats.currentSeasonWins + 1;
      
      // Get title based on new win count
      // Note: Multi-win title (3+) is awarded starting from the 3rd win
      const title = getTournamentTitle(
        placement,
        playerData.trophies,
        seasonData.seasonNumber,
        newSeasonWins,
      );

      const newTitles = [...playerData.ownedTitles];
      const earnedItems: NewItem[] = [];

      if (title && !newTitles.includes(title)) {
        newTitles.push(title);
        earnedItems.push({ type: "title", titleId: title });
      }

      const updatedPlayer = {
        ...playerData,
        coins: playerData.coins + reward,
        ownedTitles: newTitles,
        tournamentStats: {
          ...tournamentStats,
          tournamentsWon: tournamentStats.tournamentsWon + 1,
          tournamentsPlayed: tournamentStats.tournamentsPlayed + 1,
          currentSeasonWins: newSeasonWins,
        },
      };

      setPlayerData(updatedPlayer);
      savePlayerData(updatedPlayer);

      const completedTournament = {
        ...currentTournament,
        bracket: updatedBracket,
        status: "completed" as const,
        playerPlacement: 1,
        playerReward: reward,
        participants: [], // Clear participants to prevent auto-registration in next tournament
      };

      setCurrentTournament(completedTournament);
      saveTournamentData(completedTournament);
      setIsTournamentMode(false);
      setScreen("tournament");

      // Show item notifications if any items were earned
      if (earnedItems.length > 0) {
        setNewItems(earnedItems);
        setShowItemNotification(true);
      }
      return;
    }

    const updatedTournament = { ...currentTournament, bracket: updatedBracket };
    setCurrentTournament(updatedTournament);
    saveTournamentData(updatedTournament);
    setIsTournamentMode(false);
    setScreen("tournament");
  };

  const handleTournamentLeave = () => {
    if (currentTournament?.status === "in_progress") {
      // Player left during tournament - no rewards, penalized
      const tournamentStats = playerData.tournamentStats || {
        tournamentsWon: 0,
        tournamentsPlayed: 0,
        currentSeasonWins: 0,
        lastTournamentLeft: null,
      };

      const updatedPlayer = {
        ...playerData,
        tournamentStats: {
          ...tournamentStats,
          lastTournamentLeft: Date.now(),
        },
      };

      setPlayerData(updatedPlayer);
      savePlayerData(updatedPlayer);
    }

    // Clear tournament data
    setCurrentTournament(null);
    saveTournamentData(null);
    setScreen("menu");
  };

  const isPlayerRegistered =
    currentTournament?.participants.some((p) => p.isPlayer) || false;
  // Use snapshot trophies for leaderboard display (updates every 5 minutes)
  const leaderboard = getTop100Leaderboard(playerData, aiCompetitors, playerLeaderboardTrophies);

  return (
    <>
      {screen === "menu" && (
        <MenuScreen
          playerData={playerData}
          onPlay={() => setScreen("playMenu")}
          onLeaderboard={() => setScreen("leaderboard")}
          onShop={() => setScreen("shop")}
          onStats={() => setScreen("stats")}
          onSettings={() => setScreen("settings")}
          onInventory={() => setScreen("inventory")}
          onNews={() => {
            setShowNewsPopup(true);
            setNewsAutoOpened(false);
          }}
          unreadNewsCount={getUnreadCount(news)}
          version={getCurrentVersion()}
        />
      )}

      {showNewsPopup && (
        <NewsFeedPopup
          onClose={() => setShowNewsPopup(false)}
          autoOpened={newsAutoOpened}
        />
      )}

      {showItemNotification && newItems.length > 0 && (
        <ItemNotificationPopup
          items={newItems}
          username={playerData.username}
          currentBannerId={playerData.equippedBanner || 1}
          currentTitleId={playerData.equippedTitle}
          currentPfpId={playerData.equippedPfp || null}
          onClose={() => {
            setShowItemNotification(false);
            setNewItems([]);
            // Show season rewards progress after item notification if it was set
            if (seasonProgressData.wins > 0 || seasonProgressData.tier !== 'Bronze') {
              setShowSeasonRewardsProgress(true);
            }
          }}
        />
      )}

      {showRefundNotification && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl max-w-md w-full border-2 border-yellow-500 shadow-2xl shadow-yellow-500/20">
            <div className="p-8 border-b border-gray-700">
              <h2 className="text-3xl font-bold text-center text-yellow-400">
                DUPLICATE ITEM
              </h2>
            </div>
            <div className="p-12 text-center">
              <p className="text-xl text-gray-300 mb-4">
                You already own this item!
              </p>
              <p className="text-2xl font-bold text-green-400">
                💰 Refunded: {refundAmount} coins
              </p>
            </div>
            <div className="p-6 border-t border-gray-700 bg-gray-900/50">
              <button
                onClick={() => setShowRefundNotification(false)}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors font-semibold text-white"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {showSeasonRewardsProgress && (
        <SeasonRewardsProgress
          currentTier={seasonProgressData.tier}
          winsInTier={seasonProgressData.wins}
          onClose={() => {
            setShowSeasonRewardsProgress(false);
            setSeasonProgressData({ tier: 'Bronze', wins: 0 });
          }}
        />
      )}

      {screen === "playMenu" && (
        <PlayMenuScreen
          playerData={playerData}
          onQueue={() => setScreen("queue")}
          onPractice={() => setScreen("practice")}
          onTournament={() => setScreen("tournament")}
          onBack={() => setScreen("menu")}
          currentTournament={currentTournament}
          nextTournamentTime={nextTournamentTime}
          isRegistered={isPlayerRegistered}
        />
      )}

      {screen === "practice" && (
        <PracticeScreen
          onSelectDifficulty={(difficulty) => {
            setPracticeDifficulty(difficulty);
            setIsPracticeMode(true);
            setScreen("game");
          }}
          onBack={() => setScreen("playMenu")}
        />
      )}

      {screen === "titleSelector" && (
        <TitleSelector
          playerData={playerData}
          onEquip={handleEquipTitle}
          onBack={() => setScreen("menu")}
        />
      )}

      {screen === "inventory" && (
        <InventoryScreen
          playerData={playerData}
          onEquipTitle={handleEquipTitle}
          onEquipBanner={handleEquipBanner}
          onEquipPfp={handleEquipPfp}
          onBack={() => setScreen("menu")}
        />
      )}

      {screen === "queue" && (
        <QueueScreen
          playerData={playerData}
          onMatchFound={() => {
            setIsPracticeMode(false);
            setScreen("game");
          }}
          onCancel={() => setScreen("playMenu")}
        />
      )}

      {screen === "game" && (
        <GameScreen
          playerData={playerData}
          onMatchEnd={handleMatchEnd}
          onBack={() => setScreen("menu")}
          isPracticeMode={isPracticeMode}
          practiceDifficulty={practiceDifficulty}
        />
      )}

      {screen === "tournament" && currentTournament && (
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

      {screen === "tournamentGame" && tournamentMatch && (
        <GameScreen
          playerData={playerData}
          onMatchEnd={(won) => handleTournamentMatchEnd(won)}
          onBack={handleTournamentLeave}
          isPracticeMode={false}
          isTournamentMode={true}
          tournamentMatch={tournamentMatch}
        />
      )}

      {screen === "leaderboard" && (
        <LeaderboardScreen
          leaderboard={leaderboard}
          playerData={playerData}
          nextAIUpdate={nextAIUpdate}
          onBack={() => setScreen("menu")}
          onRankInfo={() => setScreen("rankInfo")}
        />
      )}

      {screen === "rankInfo" && (
        <RankInfo
          onBack={() => setScreen("leaderboard")}
          playerData={playerData}
        />
      )}

      {screen === "shop" && (
        <ShopScreen
          playerData={playerData}
          onPurchase={handlePurchaseTitle}
          onPurchaseBanner={handlePurchaseBanner}
          onPurchasePfp={handlePurchasePfp}
          onCratePurchase={handleCratePurchase}
          onBack={() => setScreen("menu")}
          lastRotation={shopRotationTime}
        />
      )}

      {screen === "stats" && (
        <StatsScreen playerData={playerData} onBack={() => setScreen("menu")} />
      )}

      {screen === "settings" && (
        <SettingsScreen
          playerData={playerData}
          onUsernameChange={handleUsernameChange}
          onBack={() => setScreen("menu")}
        />
      )}

      {showMobileTestPanel && (
        <MobileTestingPanel
          playerData={playerData}
          onUpdate={handleMobileTestUpdate}
          onClose={() => setShowMobileTestPanel(false)}
        />
      )}
    </>
  );
}

export default App;
