import Phaser from "phaser";
import { MainGame } from "./scenes/MainGame";
import { ShopScene } from "./scenes/ShopScene";
import { HomeScene } from "./scenes/HomeScene";

export const config = {
  type: Phaser.AUTO,
  parent: "game-container",
  width: 500, // Increased width to show more background
  height: 800, // Increased height for better mobile feel
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: [MainGame, ShopScene, HomeScene],
};
