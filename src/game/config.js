import Phaser from "phaser";
import { MainGame } from "./scenes/MainGame";
import { Preloader } from "./scenes/Preloader";

export const getGameConfig = (containerId) => ({
  type: Phaser.AUTO,
  parent: containerId,
  backgroundColor: "#000000",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: window.innerWidth,
    height: window.innerHeight,
  },
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: [Preloader, MainGame],
});
