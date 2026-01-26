import React, { useEffect, useRef } from "react";
import Phaser from "phaser";
import { getGameConfig } from "./config";
import { useGame } from "../hooks/useGame";

const PhaserGame = () => {
  const gameRef = useRef(null);
  const { handleGameOver, equippedCard, selectedLevel } = useGame();

  useEffect(() => {
    if (!gameRef.current) {
      const config = getGameConfig("phaser-container");
      gameRef.current = new Phaser.Game(config);
      // --- NEW: LISTENERS TO BRIDGE PHASER AND REACT ---
      // Listen for the Game Over event from MainGame.js
      gameRef.current.events.on("GAME_OVER", (finalGold) => {
        console.log("Match Ended. Gold Collected:", finalGold);
        handleGameOver(finalGold);
        // handleGameOver should set showResult(true) and update the local state
      });
      // Listen for HP updates if you want to show a health bar in React TopNav
      gameRef.current.events.on("UPDATE_HP", (currentHp) => {
        console.log("Player HP Updated:", currentHp);
      });

      // Existing ready logic
      gameRef.current.events.once("ready", () => {
        gameRef.current.scene.start("Preloader", {
          equippedCard,
          selectedLevel,
        });
      });
    }

    return () => {
      if (gameRef.current) {
        // Clean up listeners before destroying
        gameRef.current.events.off("GAME_OVER");
        gameRef.current.events.off("UPDATE_HP");
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [equippedCard, selectedLevel, handleGameOver]);

  return <div id="phaser-container" className="fixed inset-0 z-[60]" />;
};

export default PhaserGame;
