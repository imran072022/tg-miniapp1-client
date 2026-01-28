import Phaser from "phaser";
import Enemy from "../entities/enemies/Enemy";
import Projectile from "../abilities/Projectiles";
import Boss from "../entities/enemies/Bosses";
import { SHIP_CONFIGS } from "../../config/ShipConfig";

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
    // Get the config based on what the user equipped (from init)
    this.shipConfig = SHIP_CONFIGS[this.equippedCard] || SHIP_CONFIGS.STARTER;
    // Create the player sprite
    this.player = this.physics.add
      .sprite(width / 2, height - 120, this.shipConfig.key)
      .setScale(this.shipConfig.scale)
      .setCollideWorldBounds(true)
      .setDepth(10);
    this.player.body.setAllowGravity(false);
    this.player.hp = this.shipConfig.hp;
  }
  setupCollisions() {
    // Collision A: Bullets vs enemy
    this.physics.add.overlap(this.bullets, this.enemies, (bullet, enemy) => {
      const ex = enemy.x;
      const ey = enemy.y;
      bullet.destroy();

      if (enemy.active && !enemy.isDead) {
        enemy.takeDamage(10);
        if (enemy.hp <= 0) {
          this.showGoldPopup(ex, ey, 10);
        }
      }
    });
    // Collision B: Player vs enemy
    this.physics.add.overlap(this.player, this.enemies, (_, enemy) => {
      if (enemy.active && !enemy.isDead) {
        const ex = enemy.x;
        const ey = enemy.y;
        enemy.die();
        this.takeDamage(20);
        this.showGoldPopup(ex, ey, 10);
      }
    });

    // Collision: Helicopter Bullets vs Player
    this.physics.add.overlap(
      this.player,
      this.enemyBullets,
      (player, bullet) => {
        if (this.isGameOver) return; // Don't trigger if already dead
        bullet.destroy();
        this.takeDamage(10);
      },
    );
  }
  setupTimers() {
    // Bullet/Shooting Timer
    this.time.addEvent({
      delay: this.shipConfig.fireRate,
      callback: this.fireBullet,
      callbackScope: this,
      loop: true,
    });

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
    // 3. System Initialization
    this.setupPlayer();
    this.setupTimers();
    this.setupCollisions();
    // 4. UI / HUD
    this.setupUI(); // You can move the goldText creation here too!
    // 5. World Setup
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
    this.boss = new Boss(this, width / 2, -100, "boss1", 2000);
    this.setupBossCollisions();
    // Listen for the boss death to CONTINUE the endless loop
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
  setupBossCollisions() {
    this.physics.add.overlap(this.bullets, this.boss, (boss, bullet) => {
      // 1. Create the spark exactly where the bullet hit
      const spark = this.add
        .sprite(bullet.x, bullet.y, "flash")
        .setScale(0.6)
        .setTint(0xffff00)
        .setDepth(12);
      this.tweens.add({
        targets: spark,
        scale: 0.6,
        alpha: 0,
        duration: 100,
        onComplete: () => spark.destroy(),
      });
      bullet.destroy(); // 2. Destroy the bullet
      // 3. Tell the boss to handle its own HP and damage numbers
      boss.takeDamage(10);
    });
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
  fireBullet() {
    if (this.isGameOver || !this.player.active) return;
    const spawnShot = (xOff, vXOff) => {
      const bullet = new Projectile(
        this,
        this.player.x + xOff,
        this.player.y - 30,
        "energy_bullet",
        this.shipConfig,
      );

      // FIX: Add to group FIRST
      this.bullets.add(bullet);

      // FIX: Set velocities AFTER adding to group to ensure they "stick"
      bullet.body.velocity.y = this.shipConfig.bVel;
      bullet.body.velocity.x = vXOff;
    };
    if (this.shipConfig.shotType === "QUAD") {
      spawnShot(-15, 0);
      spawnShot(15, 0);
      spawnShot(-20, -150);
      spawnShot(20, 150);
      // We can still trigger a simple flash here or move it to Projectile
      this.triggerMuzzleFlash(0);
    } else {
      spawnShot(0, 0);
      this.triggerMuzzleFlash(0);
    }
  }
  // Keep a very simple version for the ship
  triggerMuzzleFlash(xOff) {
    const flash = this.add
      .sprite(this.player.x + xOff, this.player.y - 45, "flash")
      .setDepth(11)
      .setScale(0.8);
    this.tweens.add({
      targets: flash,
      scale: 1.2,
      alpha: 0,
      duration: 50,
      onComplete: () => flash.destroy(),
    });
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

  checkGameTimeline(delta) {
    if (this.isGameOver || this.currentWave === "BOSS") return;
    this.gameTimer += delta;

    // 0-15s: Wave 1 (Auto)
    // 15-30s: Wave 2
    if (this.currentWave === 1 && this.gameTimer > 2000) {
      this.startNextWave(2, 800);
    }
    // 30-45s: Wave 3
    if (this.currentWave === 2 && this.gameTimer > 4000) {
      this.startNextWave(3, 1200);
    }
    // 45s+: Boss
    if (this.currentWave === 3 && this.gameTimer > 6000) {
      this.startBossWave();
    }
  }
  // =========== Functions called inside update() =============
  handlePlayerMovement() {
    const pointer = this.input.activePointer;
    if (pointer.isDown) {
      // Smooth X movement
      this.player.x = Phaser.Math.Linear(this.player.x, pointer.x, 0.2);
      // Smooth Y movement with Safety Clamp
      const targetY = Phaser.Math.Clamp(
        pointer.y - 50,
        100,
        this.scale.height - 50,
      );
      this.player.y = Phaser.Math.Linear(this.player.y, targetY, 0.2);
    }
  }
  updateProjectiles() {
    this.bullets.children.each((b) => {
      b.update(); // Runs the Projectile's internal update logic
      if (b.y < -50) b.destroy(); // Cleanup off-screen
    });
  }
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

    // 0-15s: Wave 1 (Straight)
    // 15-30s: Wave 2 (ZigZag)
    if (this.currentWave === 1 && this.gameTimer > 15000) {
      this.startNextWave(2, 800);
    }
    // 30-45s: Wave 3 (Helicopter)
    if (this.currentWave === 2 && this.gameTimer > 30000) {
      this.startNextWave(3, 1500); // Slower spawn rate for tanky Helis
    }
    // 45s+: Boss
    if (this.currentWave === 3 && this.gameTimer > 45000) {
      this.startBossWave();
    }
  }
  update(time, delta) {
    if (this.isGameOver) return;
    // 1. Visuals
    this.bg.tilePositionY -= 1;
    // 2. Systems
    this.handlePlayerMovement();
    this.updateProjectiles();
    this.updateEnemies(time);
    this.checkGameTimeline(delta);
    // 3. Special Entities
    if (this.boss && this.boss.active) {
      this.boss.update();
    }
  }
}
