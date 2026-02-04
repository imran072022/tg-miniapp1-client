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
      gameRef.current.events.on("GAME_OVER", (finalGold, isVictory, stats) => {
        console.log("Match Ended. Gold:", finalGold, "Victory:", isVictory);
        handleGameOver(finalGold, isVictory, stats);
      });
      gameRef.current.events.on("UPDATE_HP", (currentHp) => {
        console.log("Player HP Updated:", currentHp);
      });
      gameRef.current.events.once("ready", () => {
        gameRef.current.scene.start("Preloader", {
          equippedCard,
          selectedLevel,
        });
      });
    }
    return () => {
      if (gameRef.current) {
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
