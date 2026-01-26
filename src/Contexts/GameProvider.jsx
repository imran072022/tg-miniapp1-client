import React, { useState, useCallback } from "react";
import { GameContext } from "./GameContext";

export const GameProvider = ({ children }) => {
  // --- RESTORING ALL ORIGINAL STATE ---
  const [currentTab, setCurrentTab] = useState("BATTLE");
  const [isFighting, setIsFighting] = useState(false);
  const [gold, setGold] = useState(500);
  const [equippedCard, setEquippedCard] = useState("STARTER");
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [gameMode, setGameMode] = useState(null);
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [lastScore, setLastScore] = useState(0);

  const [levelData, setLevelData] = useState(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i + 1,
      stage: Math.floor(i / 10) + 1,
      unlocked: i === 0,
      stars: 0,
      isBoss: (i + 1) % 10 === 0,
    })),
  );

  // --- LOGIC METHODS ---
  const isStageUnlocked = useCallback(
    (stageId) => {
      if (stageId === 1) return true;
      return levelData.find((l) => l.stage === stageId)?.unlocked;
    },
    [levelData],
  );

  const handleGameOver = useCallback(
    (score = 0) => {
      setLastScore(score);
      setShowResult(true);

      if (selectedLevel) {
        setLevelData((prev) =>
          prev.map((lvl) => {
            if (lvl.id === selectedLevel.id) return { ...lvl, stars: 3 };
            if (lvl.id === selectedLevel.id + 1)
              return { ...lvl, unlocked: true };
            return lvl;
          }),
        );
      }
    },
    [selectedLevel],
  );

  // Providing everything back to the game
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
    levelData,
    isStageUnlocked,
    handleGameOver,
  };

  return <GameContext value={value}>{children}</GameContext>;
};
