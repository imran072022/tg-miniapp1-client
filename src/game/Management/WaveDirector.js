import Phaser from "phaser";
import { Endless_Waves } from "../../config/WaveConfig";
import { EnemyFactory } from "../entities/enemies/EnemyFactory/EnemyFactory";

export default class WaveDirector {
  constructor(scene) {
    this.scene = scene;
    this.currentWaveIndex = 0;
    this.spawnTimer = null;
  }

  start() {
    this.loadWave(0);
  }

  loadWave(index) {
    if (index >= Endless_Waves.length) {
      this.scene.startBossWave();
      return;
    }

    this.currentWaveIndex = index;
    const config = Endless_Waves[index];

    this.scene.startNextWave(config.wave, config.spawnDelay);

    if (this.spawnTimer) this.spawnTimer.remove();

    // 1. PRODUCTION FIX: SPAWN THE FIRST ENEMY INSTANTLY
    // This removes the 6-second "dead air" at the start of the match.
    this.spawnRandomEnemy(config.enemies);

    // 2. Start the timer for all FUTURE enemies in this wave
    this.spawnTimer = this.scene.time.addEvent({
      delay: config.spawnDelay,
      callback: () => this.spawnRandomEnemy(config.enemies),
      callbackScope: this,
      loop: true,
    });

    this.scene.time.delayedCall(config.duration, () => {
      this.loadNextWave();
    });
  }
  spawnRandomEnemy(allowedTypes) {
    const type = Phaser.Math.RND.pick(allowedTypes);
    const width = this.scene.scale.width;

    if (type === "Type2" || type === "Type2Enemy") {
      const xLeft = Phaser.Math.Between(width * 0.1, width * 0.4);
      const xRight = Phaser.Math.Between(width * 0.6, width * 0.9);

      EnemyFactory.spawn(this.scene, type, xLeft, -50);
      this.scene.time.delayedCall(300, () => {
        EnemyFactory.spawn(this.scene, type, xRight, -80);
      });
    } else {
      const x = Phaser.Math.Between(50, width - 50);
      EnemyFactory.spawn(this.scene, type, x, -50);
    }
  }

  loadNextWave() {
    this.loadWave(this.currentWaveIndex + 1);
  }
}
