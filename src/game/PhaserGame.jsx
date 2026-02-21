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
      const game = new Phaser.Game(config);
      gameRef.current = game;

      // FORCE global assignment
      window.phaserGame = game;
      window.dispatchEvent(new CustomEvent("PHASER_READY"));
      console.log(
        "PHASER BRIDGE: Game instance successfully attached to window.",
      );

      game.events.on("GAME_OVER", (finalGold, isVictory, stats) => {
        handleGameOver(finalGold, isVictory, stats);
      });

      game.events.once("ready", () => {
        game.scene.start("Preloader", {
          equippedCard,
          selectedLevel,
        });
      });
    } else {
      // If the Phaser game already exists (e.g. user selected a level after boot),
      // restart the Preloader so the new `selectedLevel` is passed into scenes.
      gameRef.current.scene.start("Preloader", {
        equippedCard,
        selectedLevel,
      });
    }

    // IMPORTANT: Check if window.phaserGame exists here
    console.log("PHASER BRIDGE STATUS:", !!window.phaserGame);
    // Just before the return inside PhaserGame.jsx
    window.forceSmoke = (x, y, massive) => {
      const scene = gameRef.current.scene.getScene("MainGame");
      if (scene) scene.createCrateSmoke(x, y, massive);
    };
    return () => {
      // We only null it out if the component is actually being destroyed
      // window.phaserGame = null; // Temporary comment this out to test if it's being cleared too early
    };
  }, [equippedCard, selectedLevel, handleGameOver]);

  return <div id="phaser-container" className="fixed inset-0 z-[60]" />;
};

export default PhaserGame;
