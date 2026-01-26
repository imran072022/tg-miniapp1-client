import React, { useEffect, useRef } from "react";
import Phaser from "phaser";
import { getGameConfig } from "./config";
import { useGame } from "../hooks/useGame";

const PhaserGame = () => {
  const gameRef = useRef(null);
  const { handleGameOver, equippedCard, selectedLevel } = useGame();

  useEffect(() => {
    // Inside PhaserGame.jsx useEffect
    if (!gameRef.current) {
      const config = getGameConfig("phaser-container");
      gameRef.current = new Phaser.Game(config);

      // Crucial: Don't send data until the scene is actually switched
      gameRef.current.events.once("ready", () => {
        // We start the PRELOADER first (it's index 0 in your config)
        // Then the Preloader will trigger MainGame
        gameRef.current.scene.start("Preloader", {
          equippedCard,
          selectedLevel,
        });
      });
    }

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [equippedCard, selectedLevel, handleGameOver]);

  return <div id="phaser-container" className="fixed inset-0 z-[60]" />;
};

export default PhaserGame;
