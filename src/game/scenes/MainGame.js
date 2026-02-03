import Phaser from "phaser";
//Bosses
import GuardianBoss from "../entities/Boss/Level1Boss";
import StormBoss from "../entities/Boss/Level2Boss";
import PhantomBoss from "../entities/Boss/PhantomBoss";
import EnergyCoreBoss from "../entities/Boss/EnergyCoreBoss";
//Players
import Titan from "../entities/Players/Titan";
import Vanguard from "../entities/Players/Vanguard";
import SwiftBird from "../entities/Players/SwiftBird";
import CyberPulse808 from "../entities/Players/CyberPulse808";
import StormSilver from "../entities/Players/StormSilver";
// Super Button
import SuperButton from "../abilities/SuperButton";
import CollisionManager from "../Management/CollisionManager";
import { EnemyFactory } from "../entities/enemies/EnemyFactory/EnemyFactory";
import WaveDirector from "../Management/WaveDirector";
export class MainGame extends Phaser.Scene {
  constructor() {
    super("MainGame");
  }

  // DATA passed from PhaserGame.jsx via scene.start()
  // ============ Initialization (1) =============
  init(data) {
    console.log("Phaser received card:", data.equippedCard);
    this.equippedCard = data.equippedCard || "STARTER";
    this.selectedLevel = data.selectedLevel || 1;
    this.gold = 0;
    this.isGameOver = false;
    this.gameTimer = 0;
    this.currentWave = 1;
    this.spawnRate = 1000;
    this.currentLevel = 1; // Tracks how many cycles we've completed
  }
  // ============ Functions called inside create() =============
  setupPlayer() {
    const { width, height } = this.scale;

    if (this.equippedCard === "titan") {
      this.player = new Titan(this, width / 2, height - 120);
    } else if (this.equippedCard === "swift_bird") {
      this.player = new SwiftBird(this, width / 2, height - 120);
    } else if (this.equippedCard === "cyber_pulse_808") {
      this.player = new CyberPulse808(this, width / 2, height - 120);
    } else if (this.equippedCard === "storm_silver") {
      this.player = new StormSilver(this, width / 2, height - 120);
    } else {
      this.player = new Vanguard(this, width / 2, height - 120);
    }
    this.player.superBtn = this.superBtn;
  }
  // Inside MainGame.js -> createImpactSparks
  createImpactSparks(x, y, color, isBoss = false) {
    const particleCount = isBoss ? 20 : 6; // Increased slightly
    const scaleRange = isBoss ? { start: 1.0, end: 0 } : { start: 0.5, end: 0 }; // Bigger sparks
    const speedRange = isBoss ? 300 : 200;

    const emitter = this.add.particles(x, y, "base-rounded-bullet", {
      speed: { min: -speedRange, max: speedRange },
      angle: { min: 0, max: 360 },
      scale: scaleRange,
      alpha: { start: 1, end: 0 },
      lifespan: 400,
      blendMode: "ADD",
      tint: color,
      quantity: particleCount,
      emitting: false,
    });

    // CRITICAL: Set depth higher than the enemy (which is at 10)
    emitter.setDepth(50);

    emitter.explode();
    this.time.delayedCall(500, () => emitter.destroy());

    if (isBoss) {
      this.cameras.main.shake(100, 0.012);
    }
  }
  setupUI() {
    this.goldText = this.add
      .text(20, 20, `GOLD: ${this.gold}`, {
        fontSize: "20px",
        fill: "#ffd700",
        fontWeight: "bold",
        fontFamily: "Arial",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setDepth(100);
  }
  // ============ Scene Creation (2) =============
  create() {
    this.isTouchingUI = false;
    const { width, height } = this.scale;
    // 1. Visuals & Background
    this.cameras.main.setBackgroundColor("#000000");
    this.bg = this.add
      .tileSprite(0, 0, width, height, "nebula")
      .setOrigin(0, 0)
      .setDepth(-1);
    // 2. Groups (Must be first)
    this.bullets = this.physics.add.group();
    this.enemies = this.physics.add.group();
    this.enemyBullets = this.physics.add.group();
    // 3. UI (Create superBtn BEFORE player so player can reference it)
    const btnX = this.scale.width - 80;
    const btnY = this.scale.height - 80;
    this.superBtn = new SuperButton(this, btnX, btnY);
    // 4. Player (Must be before Collisions)
    this.setupPlayer();
    // 5. Wave Director
    this.waveDirector = new WaveDirector(this);
    this.waveDirector.start();
    // 6. Collisions (Must be AFTER Player and Groups are ready)
    this.collisionManager = new CollisionManager(this);
    this.collisionManager.init(
      this.player,
      this.enemies,
      this.bullets,
      this.enemyBullets,
    );
    // 7. Systems & HUD
    this.setupUI();
    // Update this line in MainGame.js
    // Ensure this is exactly like this:
    this.physics.world.setBounds(0, 0, width, height, true, true, true, false);
    this.physics.world.TILE_BIAS = 32;
  }
  //
  showGoldPopup(x, y, amount) {
    const text = this.add
      .text(x, y, `+${amount}`, {
        fontSize: "20px",
        fill: "#ffd700",
        fontWeight: "bold",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(50);
    // 2. Animate it floating up and fading out
    this.tweens.add({
      targets: text,
      y: y - 50,
      alpha: 0,
      duration: 800,
      onComplete: () => text.destroy(),
    });
    // 3. Update the actual gold count
    this.gold += amount;
    // 4. FIX: Update the HUD text on the screen!
    if (this.goldText) {
      this.goldText.setText(`GOLD: ${this.gold}`);
    }
  }

  startBossWave(bossKey) {
    this.currentWave = "BOSS";
    if (this.spawnTimer) this.spawnTimer.remove();
    const { width } = this.scale;
    switch (bossKey) {
      case "GuardianBoss":
        this.boss = new GuardianBoss(this, width / 2, -100);
        break;
      case "PhantomBoss":
        this.boss = new PhantomBoss(this, width / 2, -100);
        break;
      case "EnergyCoreBoss":
        this.boss = new EnergyCoreBoss(this, width / 2, -100);
        break;
      default:
        // Fallback to your original level logic if no key is sent
        console.warn(`No boss found for key: ${bossKey}. Skipping boss phase.`);
        this.handleBossVictory(); // Immediately trigger victory to move to next wave
        return;
    }
    if (this.boss) {
      this.collisionManager.setupBossCollision(this.bullets, this.boss);
      // Listen for the boss death
      this.events.once("BOSS_DEFEATED", () => {
        this.handleBossVictory();
      });
    }
  }
  handleBossVictory() {
    console.log("Boss Defeated! Resuming Wave Director...");

    // 1. Give the player 3 seconds to see the boss explode/collect loot
    this.time.delayedCall(3000, () => {
      // 2. Clear the boss reference so it's not targeted anymore
      this.boss = null;
      this.currentWave = "LEVEL"; // Reset state from "BOSS" back to "LEVEL"

      // 3. IMPORTANT: Tell the WaveDirector to load the NEXT wave index
      if (this.waveDirector) {
        const nextIndex = this.waveDirector.currentWaveIndex + 1;
        console.log("Loading Wave Index:", nextIndex);
        this.waveDirector.loadWave(nextIndex);
      }
    });
  }
  triggerRedAlert() {
    // 1. Create a red rectangle covering the whole screen
    const alertOverlay = this.add
      .rectangle(0, 0, this.scale.width, this.scale.height, 0xff0000)
      .setOrigin(0, 0)
      .setDepth(150)
      .setAlpha(0);
    // 2. Create the "On-Off" Strobe Effect
    this.tweens.add({
      targets: alertOverlay,
      alpha: 0.3, // Subtle red pulse
      duration: 300,
      yoyo: true, // Goes back to 0
      repeat: 5, // Blinks 6 times total
      onComplete: () => alertOverlay.destroy(),
    });
    // 3. Camera Shake for impact
    this.cameras.main.shake(1000, 0.01);
  }
  takeDamage(amount) {
    if (this.isGameOver) return;
    this.player.hp -= amount;
    this.player.setTint(0xff0000);
    this.game.events.emit("UPDATE_HP", this.player.hp);
    this.time.delayedCall(100, () => {
      if (this.player.active) this.player.clearTint();
    });
    if (this.player.hp <= 0) {
      this.isGameOver = true;
      this.physics.pause();
      this.game.events.emit("GAME_OVER", this.gold);
    }
  }
  spawnEnemy(type) {
    const x = Phaser.Math.Between(50, this.scale.width - 50);
    const y = -50;
    // The Factory handles the rest!
    EnemyFactory.spawn(this, type, x, y);
  }
  // =========== Functions called inside update() =============
  updateEnemies(time) {
    this.enemies.children.each((e) => {
      e.update(time); // Runs health bar drawing and movement

      // Cleanup check: removes enemies that pass the player
      if (e.y > this.scale.height + 50) {
        if (e.hpBar) e.hpBar.destroy();
        e.destroy();
      }
    });
  }
  updateProjectiles() {
    // Cleanup Player Bullets
    this.bullets.getChildren().forEach((bullet) => {
      if (
        bullet.active &&
        (bullet.y < -50 || bullet.y > this.scale.height + 50)
      ) {
        bullet.destroy();
      } else if (bullet.active) {
        bullet.update();
      }
    });
    // NEW: Cleanup Enemy Bullets (Crucial to prevent lag)
    this.enemyBullets.getChildren().forEach((bullet) => {
      // If bullet goes off any side of the screen, kill it
      if (
        bullet.y > this.scale.height + 50 ||
        bullet.y < -100 ||
        bullet.x < -100 ||
        bullet.x > this.scale.width + 100
      ) {
        bullet.destroy();
      }
    });
  }
  update(time, delta) {
    if (this.isGameOver) return;
    // 1. Visuals
    this.bg.tilePositionY -= 0.2;
    // 3. Tell Bullets to handle their particles/cleanup
    this.updateProjectiles();
    // 4. Tell Player to handle movement & firing
    if (this.player && this.player.active) {
      this.player.update(time, delta);
    }
    // BaseBoss will run it's update
    if (this.boss && this.boss.active) {
      this.boss.update();
    }
    // TEMPORARY TESTING KEY
    if (this.input.keyboard.checkDown(this.input.keyboard.addKey("K"), 500)) {
      if (this.boss) {
        console.log("Cheater! Boss dying...");
        this.boss.takeDamage(9999);
      }
    }
  }
}
