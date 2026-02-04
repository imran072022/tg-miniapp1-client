import React, { useState, useCallback } from "react";
import { GameContext } from "./GameContext";
import { CAMPAIGN_DATA } from "../config/CampaignConfig";

export const GameProvider = ({ children }) => {
  // --- NAVIGATION & UI STATE ---
  const [currentTab, setCurrentTab] = useState("BATTLE");
  const [isFighting, setIsFighting] = useState(false);
  const [gameMode, setGameMode] = useState(null); // "STORY" or "ENDLESS"
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const [showResult, setShowResult] = useState(false);
  // --- ECONOMY & PLAYER STATE ---
  const [gold, setGold] = useState(500);
  const [equippedCard, setEquippedCard] = useState("STARTER");
  const [goldCollected, setGoldCollected] = useState(0);
  const [isVictory, setIsVictory] = useState(false);
  const [starsEarned, setStarsEarned] = useState(0);
  // --- LEVEL PROGRESSION STATE ---
  // We initialize level progress based on our CampaignConfig
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [levelProgress, setLevelProgress] = useState(() => {
    // Flatten all levels from all sectors to track their status
    const allLevels = CAMPAIGN_DATA.flatMap((sector) => sector.levels);
    return allLevels.map((lvl, index) => ({
      id: lvl.id,
      unlocked: index === 0, // Level 1 is unlocked by default
      stars: 0,
    }));
  });

  // --- HELPER METHODS ---

  const isLevelUnlocked = useCallback(
    (levelId) => {
      return levelProgress.find((l) => l.id === levelId)?.unlocked;
    },
    [levelProgress],
  );

  const isStageUnlocked = useCallback(
    (stageId) => {
      const stage = CAMPAIGN_DATA.find((s) => s.id === stageId);
      if (!stage || !stage.levels.length) return false;
      // Stage is considered unlocked if its first level is unlocked
      return isLevelUnlocked(stage.levels[0].id);
    },
    [isLevelUnlocked],
  );

  const handleGameOver = useCallback(
    (gold = 0, victoryStatus = false, stats = null) => {
      setGoldCollected(gold);
      setIsVictory(victoryStatus);
      setShowResult(true);

      if (victoryStatus) {
        // Calculate Stars based on HP percentage
        let stars = 1;
        if (stats) {
          const hpPercent = (stats.hp / stats.maxHp) * 100;
          if (hpPercent >= 80) stars = 3;
          else if (hpPercent >= 40) stars = 2;
        }
        setStarsEarned(stars);

        if (selectedLevel && gameMode === "STORY") {
          setGold((prev) => prev + gold);
          setLevelProgress((prev) => {
            const currentLevelIndex = prev.findIndex(
              (l) => l.id === selectedLevel.id,
            );
            if (currentLevelIndex !== -1) {
              return prev.map((lvl, index) => {
                if (index === currentLevelIndex) {
                  // Update stars if current run was better
                  return { ...lvl, stars: Math.max(lvl.stars || 0, stars) };
                }
                if (index === currentLevelIndex + 1) {
                  return { ...lvl, unlocked: true };
                }
                return lvl;
              });
            }
            return prev;
          });
        }
      }
    },
    [selectedLevel, gameMode],
  );

  // --- CONTEXT VALUE ---
  const value = {
    currentTab,
    setCurrentTab,
    isFighting,
    setIsFighting,
    gold,
    setGold,
    equippedCard,
    setEquippedCard,
    selectedLevel,
    setSelectedLevel,
    gameMode,
    setGameMode,
    showPauseMenu,
    setShowPauseMenu,
    showResult,
    setShowResult,
    goldCollected,
    setGoldCollected,
    levelProgress, // Replaces old levelData
    isLevelUnlocked, // New helper
    isStageUnlocked,
    handleGameOver,
    isVictory,
    setIsVictory,
    starsEarned,
    setStarsEarned,
  };

  // Fixed syntax for React Context Provider
  return <GameContext value={value}>{children}</GameContext>;
};
