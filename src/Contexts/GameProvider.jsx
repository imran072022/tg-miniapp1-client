import React, { useState, useCallback } from "react";
import { GameContext } from "./GameContext";
import { CAMPAIGN_DATA } from "../config/CampaignConfig";
import { SHIP_CONFIGS } from "../config/ShipConfig";
import { calculateMissingGemCost, LevelConfig } from "../config/LevelConfig";

export const GameProvider = ({ children }) => {
  // --- NAVIGATION & UI STATE ---
  const [currentTab, setCurrentTab] = useState("BATTLE");
  const [isFighting, setIsFighting] = useState(false);
  const [gameMode, setGameMode] = useState(null); // "STORY" or "ENDLESS"
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const [showResult, setShowResult] = useState(false);
  // --- ECONOMY & PLAYER STATE ---
  const [gold, setGold] = useState(999999);
  const [diamonds, setDiamonds] = useState(9999);
  const [equippedCard, setEquippedCard] = useState("STARTER");
  const [goldCollected, setGoldCollected] = useState(0);
  const [isVictory, setIsVictory] = useState(false);
  const [starsEarned, setStarsEarned] = useState(0);
  const [slots, setSlots] = useState([
    { id: 1, type: "GOLD", status: "LOCKED", timer: null },
    { id: 2, type: "DIAMOND", status: "READY", timer: null },
    null,
  ]);
  // Inventory Items
  const [resources, setResources] = useState({
    hullScraps: 12,
    weaponTech: 5,
    thrusterParts: 8,
    logicChips: 5,
  });
  // Ships data
  const [playerShips, setPlayerShips] = useState(() => {
    // We take the blueprints and add "Live" data to them
    return SHIP_CONFIGS.map((ship) => ({
      ...ship,
      level: 1,
      cards: 500,
    }));
  });
  const openChest = useCallback((slotId) => {
    setSlots((prev) =>
      prev.map((slot) => {
        if (slot && slot.id === slotId) {
          // For now, let's just mark it as OPENING
          return { ...slot, status: "OPENING" };
        }
        return slot;
      }),
    );
  }, []);
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
  const upgradeShip = useCallback(
    (shipId, useGems = false) => {
      // 1. Find the target ship first to get its CURRENT data
      const shipIndex = playerShips.findIndex((s) => s.id === shipId);
      if (shipIndex === -1) return;
      const ship = playerShips[shipIndex];
      const currentLevel = ship.level || 1;
      const rarity = ship.rarity;
      const cost = LevelConfig.getUpgradeCost(currentLevel, rarity);
      const isEvolution = LevelConfig.isEvolutionLevel(currentLevel);
      const reqCards = LevelConfig.getRequiredCards(currentLevel);
      // 2. DEDUCT CURRENCY ONCE (Outside the map loop)
      if (useGems) {
        const missingGold = Math.max(0, cost - gold);
        const missingCards = isEvolution
          ? 0
          : Math.max(0, reqCards - ship.cards);
        const gemTotal = calculateMissingGemCost(
          missingCards,
          rarity,
          missingGold,
        );
        if (diamonds < gemTotal) return alert("Not enough Diamonds!");
        setDiamonds((prev) => prev - gemTotal);
        // When using gems, we consume whatever gold was left
        setGold((prev) => Math.max(0, prev - cost));
      } else {
        if (gold < cost) return alert("Not enough Gold!");
        setGold((prev) => prev - cost); // SUBTRACT GOLD ONCE HERE
      }
      // 3. UPDATE THE SHIPS ARRAY
      setPlayerShips((prevShips) => {
        return prevShips.map((s) => {
          if (s.id === shipId) {
            // Handle Shards for Evolution
            if (isEvolution) {
              const reqShards = LevelConfig.getRequiredShards(currentLevel);
              setResources((prev) => ({
                hullScraps: prev.hullScraps - reqShards,
                weaponTech: prev.weaponTech - reqShards,
                thrusterParts: prev.thrusterParts - reqShards,
                logicChips: prev.logicChips - reqShards,
              }));
            }
            // RETURN UPDATED SHIP DATA
            return {
              ...s,
              level: currentLevel + 1, // This MUST increase for the UI to update
              cards: isEvolution ? s.cards : useGems ? 0 : s.cards - reqCards,
            };
          }
          return s;
        });
      });
    },
    [gold, diamonds, playerShips],
  ); // Dependencies are vital here!
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
    diamonds,
    setDiamonds,
    slots,
    setSlots,
    openChest,
    resources,
    setResources,
    playerShips,
    setPlayerShips,
    upgradeShip,
  };

  // Fixed syntax for React Context Provider
  return <GameContext value={value}>{children}</GameContext>;
};
