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
  const [lastScore, setLastScore] = useState(0);

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
    (score = 0, isVictory = false) => {
      setLastScore(score);
      setShowResult(true);

      // Only unlock the next level if the player actually won
      if (isVictory && selectedLevel && gameMode === "STORY") {
        setLevelProgress((prev) =>
          prev.map((lvl) => {
            // Mark current level as completed (3 stars for now)
            if (lvl.id === selectedLevel.id) {
              return { ...lvl, stars: 3 };
            }
            // Unlock the very next level in the sequence
            if (lvl.id === selectedLevel.id + 1) {
              return { ...lvl, unlocked: true };
            }
            return lvl;
          }),
        );
      }

      // Update total gold (example logic)
      setGold((prev) => prev + score);
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
    lastScore,
    setLastScore,
    levelProgress, // Replaces old levelData
    isLevelUnlocked, // New helper
    isStageUnlocked,
    handleGameOver,
  };

  // Fixed syntax for React Context Provider
  return <GameContext value={value}>{children}</GameContext>;
};
