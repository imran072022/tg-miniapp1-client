import Phaser from "phaser";
import Enemy from "../entities/enemies/Enemy";
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
// Super Button
import SuperButton from "../abilities/SuperButton";
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
    } else {
      this.player = new Vanguard(this, width / 2, height - 120);
    }
  }
  createImpactSparks(x, y, color, isBoss = false) {
    const particleCount = isBoss ? 20 : 5; // Bosses get a bigger explosion
    const scaleRange = isBoss ? { start: 0.6, end: 0 } : { start: 0.3, end: 0 };
    const speedRange = isBoss ? 300 : 150;
    const emitter = this.add.particles(x, y, "energy_bullet", {
      speed: { min: -speedRange, max: speedRange },
      angle: { min: 0, max: 360 },
      scale: scaleRange,
      alpha: { start: 1, end: 0 },
      lifespan: 400,
      blendMode: "ADD",
      tint: color,
      quantity: particleCount,
      emitting: false, // Trigger once
    });
    emitter.explode();
    // Auto-cleanup after half a second
    this.time.delayedCall(500, () => emitter.destroy());
    // Big Screen Shake for Boss Hits
    if (isBoss) {
      this.cameras.main.shake(100, 0.008);
    }
  }
  setupCollisions() {
    // Collision A: player bullets hit enemy
    this.physics.add.overlap(this.bullets, this.enemies, (bullet, enemy) => {
      // Vanguard missile explosion with enemy
      if (bullet.isMissile) {
        this.player.triggerMissileExplosion(bullet.x, bullet.y);
        bullet.destroy();
        return;
      }
      // Sparkling when bullet hits boss
      const ex = enemy.x;
      const ey = enemy.y;
      const sparkColor = bullet.tintTopLeft || 0xff00ff;
      const isBoss = enemy.maxHP > 1000 || enemy.isBoss;
      this.createImpactSparks(bullet.x, bullet.y, sparkColor, isBoss);
      bullet.destroy();
      if (enemy.active && !enemy.isDead) {
        enemy.takeDamage(10);
        // Super charging + btn being active when bullet hits enemy
        this.player.ultCharge = Math.min(
          this.player.ultCharge + this.player.ultGainRate,
          100,
        );
        this.superBtn.updateCharge(this.player.ultCharge);
        if (this.player.ultCharge >= 100) {
          this.player.isUltReady = true;
          this.superBtn.setReady(true);
        }
        // if enemy dies, show gold popup
        if (enemy.hp <= 0) {
          this.showGoldPopup(ex, ey, 10);
        }
      }
    });
    // Collision B: Player vs Enemy (UPDATED)
    this.physics.add.overlap(this.player, this.enemies, (player, enemy) => {
      if (enemy.active && !enemy.isDead) {
        const ex = enemy.x;
        const ey = enemy.y;
        enemy.die();
        player.takeDamage(20);
        this.showGoldPopup(ex, ey, 10);
      }
    });
    // Collision C: Enemy Bullets vs Player (UPDATED)
    this.physics.add.overlap(
      this.player,
      this.enemyBullets,
      (player, bullet) => {
        if (this.isGameOver) return;
        bullet.destroy();
        player.takeDamage(10);
      },
    );
  }
  setupTimers() {
    // Enemy Spawn Timer
    this.spawnTimer = this.time.addEvent({
      delay: 1000,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true,
    });
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

    // 2. Groups
    this.bullets = this.physics.add.group();
    this.enemies = this.physics.add.group();
    this.enemyBullets = this.physics.add.group();
    // 3. Super Button
    // Position the container at the bottom right
    const x = this.scale.width - 80;
    const y = this.scale.height - 80;
    this.superBtn = new SuperButton(this, x, y);
    // 4. System Initialization
    this.setupPlayer();
    this.setupTimers();
    this.setupCollisions();
    // 5. UI / HUD
    this.setupUI(); // You can move the goldText creation here too!
    // 6. World Setup
    this.physics.world.setBounds(0, 0, width, height, true, true, false, false);
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
  startNextWave(waveNumber, newRate) {
    this.currentWave = waveNumber;
    // Safety check: ensure spawnTimer exists
    if (this.spawnTimer) this.spawnTimer.paused = true;
    const waveText = this.add
      .text(this.scale.width / 2, this.scale.height / 2, `WAVE ${waveNumber}`, {
        fontSize: "48px",
        fill: "#ffffff",
        fontWeight: "bold",
        stroke: "#000000",
        strokeThickness: 4,
      })
      .setOrigin(0.5)
      .setDepth(200);
    // Animation for the text
    this.tweens.add({
      targets: waveText,
      scale: { from: 0.8, to: 1.2 },
      alpha: { from: 1, to: 0 },
      duration: 2000,
      onComplete: () => {
        waveText.destroy();
        // Resume spawning with new speed
        this.spawnRate = newRate;
        if (this.spawnTimer) {
          this.spawnTimer.delay = newRate;
          this.spawnTimer.paused = false;
        }
      },
    });
  }

  startBossWave() {
    this.currentWave = "BOSS";
    if (this.spawnTimer) this.spawnTimer.remove();
    const { width } = this.scale;
    // --- MODULAR BOSS SELECTION ---
    if (this.currentLevel === 1) {
      this.boss = new GuardianBoss(this, width / 2, -100);
    } else if (this.currentLevel === 2) {
      this.boss = new StormBoss(this, width / 2, -100);
    } else if (this.currentLevel === 3) {
      this.boss = new PhantomBoss(this, width / 2, -100);
    } else if (this.currentLevel === 4) {
      this.boss = new EnergyCoreBoss(this, width / 2, -100);
    }
    this.setupBossCollisions();
    // Listen for the boss death
    this.events.once("BOSS_DEFEATED", () => {
      this.handleBossVictory();
    });
  }

  handleBossVictory() {
    this.time.delayedCall(3000, () => {
      this.currentLevel++; // Increase difficulty multiplier
      this.gameTimer = 0; // Reset clock to 0
      this.currentWave = 1; // Go back to Wave 1 enemies
      // Restart the wave spawning
      this.startNextWave(1, 1000 / this.currentLevel);
      this.spawnTimer = this.time.addEvent({
        delay: 1000 / this.currentLevel,
        callback: this.spawnEnemy,
        callbackScope: this,
        loop: true,
      });
    });
  }
  // sparkle, damage text
  setupBossCollisions() {
    this.physics.add.overlap(this.bullets, this.boss, (boss, bullet) => {
      const spark = this.add
        .rectangle(bullet.x, bullet.y, 8, 8, boss.hitColor)
        .setDepth(2000) // Ensure it's on top
        .setRotation(Phaser.Math.Between(0, 360));
      // 2. Make it "explode" and fade
      this.tweens.add({
        targets: spark,
        scale: 2,
        alpha: 0,
        angle: 180,
        duration: 150,
        onComplete: () => spark.destroy(),
      });
      // 2. Create Floating Damage Text
      const damageAmount = 10;
      const damageText = this.add
        .text(bullet.x, bullet.y, `-${damageAmount}`, {
          fontSize: "20px",
          fill: "#ffffff",
          fontStyle: "bold",
          stroke: "#000000",
          strokeThickness: 3,
        })
        .setOrigin(0.5)
        .setDepth(200);
      // Animate the damage text (float up and drift)
      this.tweens.add({
        targets: damageText,
        y: bullet.y - 60,
        x: bullet.x + Phaser.Math.Between(-25, 25),
        alpha: 0,
        duration: 800,
        onComplete: () => damageText.destroy(),
      });
      // 3. Cleanup and Logic
      bullet.destroy();
      boss.takeDamage(damageAmount);
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
  // NEW Step 4: Logic-based spawning
  spawnEnemy() {
    if (this.isGameOver || this.currentWave === "BOSS") return;

    const x = Phaser.Math.Between(50, this.scale.width - 50);

    // Wave Selection Logic
    const isWave3 = this.gameTimer > 30000;
    const isWave2 = this.gameTimer > 15000 && this.gameTimer <= 30000;

    let type = "STRAIGHT";
    let texture = "enemyType1";
    let hp = 20;
    let vSpeed = 200;

    if (isWave3) {
      type = "HELI";
      texture = "helicopter";
      hp = 100;
      vSpeed = 100;
    } else if (isWave2) {
      type = "ZIGZAG";
      texture = "enemyType2";
      hp = 40;
      vSpeed = 160;
    }

    // Apply Level Scaling
    hp *= this.currentLevel;

    const enemy = new Enemy(this, x, -20, texture, hp, type);
    this.enemies.add(enemy);

    if (enemy.body instanceof Phaser.Physics.Arcade.Body) {
      enemy.body.setVelocityY(vSpeed);

      // Restore your original Wave 2 Bounce logic
      if (type === "ZIGZAG") {
        const horizontalSpeed = 150;
        const startRight = x < this.scale.width / 2;
        enemy.body.setVelocityX(
          startRight ? horizontalSpeed : -horizontalSpeed,
        );
        enemy.body.setBounce(1, 0);
        enemy.body.setCollideWorldBounds(true);
        enemy.setTint(0x00ff00);
      }

      // Superiority visual (Level 2+)
      if (this.currentLevel > 1) {
        enemy.setTint(0xff00ff);
      }
    }
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
  checkGameTimeline(delta) {
    if (this.isGameOver || this.currentWave === "BOSS") return;
    this.gameTimer += delta;
    // --- WAVE 1 to 2 GAP (at 15s) ---
    if (this.currentWave === 1 && this.gameTimer > 15000) {
      if (this.spawnTimer) this.spawnTimer.paused = true; // Stop spawning
      this.startNextWave(2, 800); // This shows text and resumes after 2s
    }
    // --- WAVE 2 to 3 GAP (at 30s) ---
    if (this.currentWave === 2 && this.gameTimer > 30000) {
      if (this.spawnTimer) this.spawnTimer.paused = true;
      this.startNextWave(3, 1200);
    }
    // --- BOSS PREP (at 45s) ---
    if (this.currentWave === 3 && this.gameTimer > 45000) {
      this.currentWave = "BOSS_PREP"; // Temporary state for the gap
      // 1. Stop Spawning
      if (this.spawnTimer) this.spawnTimer.remove();
      // 2. Tell all current enemies to retreat
      this.enemies.children.each((enemy) => {
        enemy.retreat();
      });
      // 3. TRIGGER RED ALERT
      this.triggerRedAlert();
      // 4. Boss Warning Text
      const warningText = this.add
        .text(
          this.scale.width / 2,
          this.scale.height / 2,
          "WARNING: BOSS DETECTED",
          {
            fontSize: "32px",
            fill: "#ff0000",
            fontWeight: "bold",
            stroke: "#000000",
            strokeThickness: 6,
          },
        )
        .setOrigin(0.5)
        .setDepth(200);
      // Blink the text
      this.tweens.add({
        targets: warningText,
        alpha: 0,
        duration: 500,
        yoyo: true,
        repeat: 3,
        onComplete: () => warningText.destroy(),
      });
      // 3. Wait 4 seconds for cleanup, then bring the Boss
      this.time.delayedCall(4000, () => {
        this.startBossWave();
      });
    }
  }
  updateProjectiles() {
    this.bullets.getChildren().forEach((bullet) => {
      if (bullet.active) {
        bullet.update();
      }
    });
  }
  update(time, delta) {
    if (this.isGameOver) return;
    // 1. Visuals
    this.bg.tilePositionY -= 0.2;
    // 2. Systems
    this.updateEnemies(time);
    this.checkGameTimeline(delta);
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
