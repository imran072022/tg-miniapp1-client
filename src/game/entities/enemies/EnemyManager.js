import { Enemy } from "./Enemy";
import Phaser from "phaser";

export class EnemyManager {
  constructor(scene) {
    this.scene = scene;
    this.level = scene.selectedLevel || 1;
  }

  spawnBatch() {
    const x = Phaser.Math.Between(50, this.scene.scale.width - 50);
    const config = {
      texture: "e_1",
      hp: 10 + this.level * 2,
      speed: 150 + this.level * 5,
    };

    const enemy = new Enemy(this.scene, x, -50, config);
    this.scene.enemies.add(enemy);
  }
}
