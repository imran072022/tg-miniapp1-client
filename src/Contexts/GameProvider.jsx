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
  const [equippedCard, setEquippedCard] = useState("Vanguard");
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
    hullScraps: 1,
    weaponTech: 0,
    thrusterParts: 8,
    logicChips: 5,
  });
  // Ships data
  const [playerShips, setPlayerShips] = useState(() => {
    // We take the blueprints and add "Live" data to them
    return SHIP_CONFIGS.map((ship) => ({
      ...ship,
      level: 1,
      cards: 70,
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
      console.log("🔥 handleGameOver FIRED in React with:", {
        gold,
        victoryStatus,
        stats,
        currentSelectedLevel: selectedLevel,
        currentGameMode: gameMode,
      });

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

        // CRITICAL: Use selectedLevel directly from closure
        if (selectedLevel && gameMode === "STORY") {
          console.log("📊 Updating level progress for:", selectedLevel.id);

          setGold((prev) => prev + gold);

          setLevelProgress((prev) => {
            console.log("Previous level progress:", prev);

            const allLevels = CAMPAIGN_DATA.flatMap((stage) => stage.levels);
            const currentIdx = allLevels.findIndex(
              (l) => l.id === selectedLevel.id,
            );

            if (currentIdx !== -1 && currentIdx < allLevels.length - 1) {
              const nextLevel = allLevels[currentIdx + 1];
              console.log("Next level to unlock:", nextLevel.id);

              const updated = prev.map((lvl) => {
                if (lvl.id === selectedLevel.id) {
                  return { ...lvl, stars: Math.max(lvl.stars || 0, stars) };
                }
                if (nextLevel && lvl.id === nextLevel.id) {
                  console.log(`✅ UNLOCKING LEVEL ${nextLevel.id}`);
                  return { ...lvl, unlocked: true };
                }
                return lvl;
              });

              console.log("Updated level progress:", updated);
              return updated;
            }

            console.log("No next level to unlock");
            return prev.map((lvl) => {
              if (lvl.id === selectedLevel?.id) {
                return { ...lvl, stars: Math.max(lvl.stars || 0, stars) };
              }
              return lvl;
            });
          });
        } else {
          console.log("⚠️ No selectedLevel or not STORY mode:", {
            selectedLevel,
            gameMode,
          });
        }
      }
    },
    [selectedLevel, gameMode], // Keep these dependencies
  );
  const upgradeShip = useCallback(
    (shipId, useGems = false) => {
      const shipIndex = playerShips.findIndex((s) => s.id === shipId);
      if (shipIndex === -1) return;

      const ship = playerShips[shipIndex];
      const currentLevel = ship.level || 1;
      const currentRank = ship.rank || 0;
      const rarity = ship.rarity;

      const isEvoGate = LevelConfig.isEvolutionGate(currentLevel, currentRank);
      const cost = LevelConfig.getUpgradeCost(
        currentLevel,
        currentRank,
        rarity,
      );
      const reqCards = LevelConfig.getRequiredCards(currentLevel, currentRank);
      const reqShards = LevelConfig.getRequiredShards(currentLevel, rarity);

      // 1. Calculate Missing Resources
      const missingGold = Math.max(0, cost - gold);
      const missingCards = isEvoGate
        ? 0
        : Math.max(0, reqCards - (ship.cards || 0));

      // Calculate Shard Scarcity
      let missingShardsTotal = 0;
      if (isEvoGate) {
        missingShardsTotal += Math.max(0, reqShards - resources.hullScraps);
        missingShardsTotal += Math.max(0, reqShards - resources.weaponTech);
        missingShardsTotal += Math.max(0, reqShards - resources.thrusterParts);
        missingShardsTotal += Math.max(0, reqShards - resources.logicChips);
      }

      // 2. Handle Purchase Logic
      if (useGems) {
        const gemTotal = calculateMissingGemCost(
          missingCards,
          rarity,
          missingGold,
          missingShardsTotal,
        );

        if (diamonds < gemTotal) return alert("Not enough Diamonds!");

        setDiamonds((prev) => prev - gemTotal);
        // If using gems, we assume gold is "covered" or deducted to 0 if partial
        setGold((prev) => (missingGold > 0 ? 0 : prev - cost));
      } else {
        // Manual upgrade checks
        if (gold < cost) return alert("Not enough Gold!");
        if (!isEvoGate && ship.cards < reqCards)
          return alert("Not enough Cards!");

        if (isEvoGate) {
          if (
            resources.hullScraps < reqShards ||
            resources.weaponTech < reqShards ||
            resources.thrusterParts < reqShards ||
            resources.logicChips < reqShards
          ) {
            return alert("Not enough Shards for Evolution!");
          }
        }

        setGold((prev) => prev - cost);
      }

      // 3. Update the Ships and Resources
      if (isEvoGate) {
        setResources((prev) => ({
          ...prev,
          // Use Math.max(0, ...) to ensure we don't go negative,
          // and correctly subtract only the requirement.
          hullScraps: Math.max(0, prev.hullScraps - reqShards),
          weaponTech: Math.max(0, prev.weaponTech - reqShards),
          thrusterParts: Math.max(0, prev.thrusterParts - reqShards),
          logicChips: Math.max(0, prev.logicChips - reqShards),
        }));
      }

      // 4. Update the Ships
      setPlayerShips((prevShips) => {
        return prevShips.map((s) => {
          if (s.id !== shipId) return s;

          if (isEvoGate) {
            // Rank up logic
            return { ...s, rank: (s.rank || 0) + 1 };
          } else {
            // Level up logic
            return {
              ...s,
              level: s.level + 1,
              cards: useGems
                ? Math.max(0, s.cards - (reqCards - missingCards))
                : s.cards - reqCards,
            };
          }
        });
      });
    },
    [gold, diamonds, resources, playerShips],
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
