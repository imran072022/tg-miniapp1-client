import { Endless_Waves } from "../../config/WaveConfig";
import { EnemyFactory } from "../entities/enemies/EnemyFactory/EnemyFactory";

export default class WaveDirector {
  constructor(scene) {
    this.scene = scene;
    this.currentWaveIndex = 0;
    this.currentPhaseIndex = 0;
    this.spawnTimer = null;
    this.phaseTimer = null;
  }

  start() {
    this.loadWave(0);
  }

  loadWave(index) {
    if (index >= Endless_Waves.length) {
      console.log("WAVES EXHAUSTED - TRIGGERING BOSS");
      if (this.scene.startBossWave) this.scene.startBossWave();
      return;
    }

    this.currentWaveIndex = index;
    this.currentPhaseIndex = 0;
    this.startPhase();
  }

  startPhase() {
    const wave = Endless_Waves[this.currentWaveIndex];
    const phase = wave.phases[this.currentPhaseIndex];

    if (this.spawnTimer) this.spawnTimer.remove();
    if (this.phaseTimer) this.phaseTimer.remove();

    console.log(`Wave ${wave.wave} | Phase: ${phase.name}`);

    this.spawnTimer = this.scene.time.addEvent({
      delay: phase.spawnDelay,
      callback: () => {
        // Spawn Primary Enemy
        this.executePattern(phase.enemyType, phase.pattern);

        // Spawn Support/Disturbing Enemy (if defined)
        if (phase.supportType) {
          // Delay support by 1/3 of the spawn delay so they are staggered
          this.scene.time.delayedCall(phase.spawnDelay * 0.33, () => {
            this.executePattern(phase.supportType, "SOLO");
          });
        }
      },
      callbackScope: this,
      loop: true,
    });

    this.phaseTimer = this.scene.time.delayedCall(phase.duration, () => {
      this.nextPhase();
    });
  }

  nextPhase() {
    const wave = Endless_Waves[this.currentWaveIndex];
    this.currentPhaseIndex++;

    if (this.currentPhaseIndex < wave.phases.length) {
      this.startPhase();
    } else {
      this.loadWave(this.currentWaveIndex + 1);
    }
  }

  executePattern(type, pattern) {
    const width = this.scene.scale.width;
    const centerX = Phaser.Math.Between(width * 0.2, width * 0.8);

    if (pattern === "SWARM") {
      this.spawnVFormation(type, centerX, -50);
    } else if (type === "Type2" || type === "Type2Enemy") {
      // Logic for your rotating heavy offensive units (always pairs)
      const xLeft = Phaser.Math.Between(width * 0.1, width * 0.4);
      const xRight = Phaser.Math.Between(width * 0.6, width * 0.9);
      EnemyFactory.spawn(this.scene, type, xLeft, -50);
      this.scene.time.delayedCall(400, () => {
        EnemyFactory.spawn(this.scene, type, xRight, -80);
      });
    } else {
      // Standard Solo Spawn (Drones or Bouncing Cars)
      const x = Phaser.Math.Between(50, width - 50);
      EnemyFactory.spawn(this.scene, type, x, -50);
    }
  }

  spawnVFormation(type, centerX, startY) {
    const gapX = 60;
    const gapY = 50;
    EnemyFactory.spawn(this.scene, type, centerX, startY);
    this.scene.time.delayedCall(250, () => {
      EnemyFactory.spawn(this.scene, type, centerX - gapX, startY - gapY);
      EnemyFactory.spawn(this.scene, type, centerX + gapX, startY - gapY);
    });
    this.scene.time.delayedCall(500, () => {
      EnemyFactory.spawn(
        this.scene,
        type,
        centerX - gapX * 2,
        startY - gapY * 2,
      );
      EnemyFactory.spawn(
        this.scene,
        type,
        centerX + gapX * 2,
        startY - gapY * 2,
      );
    });
  }
}
