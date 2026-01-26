import React, { useEffect, useRef } from "react";
import Phaser from "phaser";
import { MainGame } from "./scenes/MainGame";

const PhaserGame = ({
  onEnd,
  stats,
  equippedCard,
  isFighting,
  selectedLevel,
  isPaused,
}) => {
  const gameContainerRef = useRef(null);
  const gameRef = useRef(null);

  useEffect(() => {
    // 1. If a game instance already exists, destroy it immediately
    if (gameRef.current) {
      gameRef.current.destroy(true);
      gameRef.current = null;
    }

    // 2. Clean up any leftover canvases from the DOM before starting
    const existingCanvas = gameContainerRef.current?.querySelector("canvas");
    if (existingCanvas) {
      existingCanvas.remove();
    }

    const config = {
      type: Phaser.AUTO,
      parent: gameContainerRef.current,
      width: window.innerWidth,
      height: window.innerHeight,
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      physics: {
        default: "arcade",
        arcade: { gravity: { y: 0 }, debug: false },
      },
      scene: [MainGame],
    };

    // 3. Create the game
    const game = new Phaser.Game(config);
    gameRef.current = game;
    game.isPaused = isPaused;

    // Start scene with data
    game.scene.start("MainGame", { onEnd, stats, equippedCard, selectedLevel });

    // 4. Cleanup function
    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, [equippedCard, stats, selectedLevel, onEnd, isPaused]); // Runs when core game props change (not on pause)

  // Sync Pause State
  useEffect(() => {
    if (gameRef.current) {
      gameRef.current.isPaused = isPaused;
    }
  }, [isPaused]);

  return (
    <div
      ref={gameContainerRef}
      className="absolute inset-0 w-full h-full overflow-hidden"
    />
  );
};

export default PhaserGame;
