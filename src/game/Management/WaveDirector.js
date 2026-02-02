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
      this.scene.startBossWave(); // No more waves, bring the boss!
      return;
    }

    this.currentWaveIndex = index;
    const config = Endless_Waves[index];

    // Tell the UI to show Wave Number
    this.scene.startNextWave(config.wave, config.spawnDelay);

    // Setup the looping spawn timer for this wave
    if (this.spawnTimer) this.spawnTimer.remove();

    this.spawnTimer = this.scene.time.addEvent({
      delay: config.spawnDelay,
      callback: () => this.spawnRandomEnemy(config.enemies),
      callbackScope: this,
      loop: true,
    });

    // Schedule the end of this wave
    this.scene.time.delayedCall(config.duration, () => {
      this.loadNextWave();
    });
  }

  spawnRandomEnemy(allowedTypes) {
    // Pick a random enemy string from the array provided in the config
    const type = Phaser.Math.RND.pick(allowedTypes);
    const x = Phaser.Math.Between(50, this.scene.scale.width - 50);
    EnemyFactory.spawn(this.scene, type, x, -50);
  }

  loadNextWave() {
    this.loadWave(this.currentWaveIndex + 1);
  }
}
