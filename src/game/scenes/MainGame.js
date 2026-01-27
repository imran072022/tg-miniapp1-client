import Phaser from "phaser";
import Enemy from "../entities/enemies/Enemy";
import Projectile from "../abilities/Projectiles";

export class MainGame extends Phaser.Scene {
  constructor() {
    super("MainGame");
  }

  // DATA passed from PhaserGame.jsx via scene.start()
  init(data) {
    console.log("Phaser received card:", data.equippedCard);
    this.equippedCard = data.equippedCard || "STARTER";
    this.selectedLevel = data.selectedLevel || 1;
    this.gold = 0;
    this.isGameOver = false;
    this.gameTimer = 0;
    this.currentWave = 1;
    this.spawnRate = 1000;
  }

  create() {
    const { width, height } = this.scale;
    // 1. STOP THE FLICKERING: Set a solid black background first
    this.cameras.main.setBackgroundColor("#000000");
    // 2. BACKGROUND: Ensure depth is behind everything
    this.bg = this.add
      .tileSprite(0, 0, width, height, "nebula")
      .setOrigin(0, 0)
      .setDepth(-1);
    // 3. GROUPS
    this.bullets = this.physics.add.group();
    this.enemies = this.physics.add.group();
    // 4. SHIP SELECTION LOGIC
    const shipConfigs = {
      STARTER: {
        key: "plane",
        scale: 0.15,
        fireRate: 250,
        bVel: -600,
        bScale: 0.6,
        shotType: "SINGLE", // Standard shot
        hp: 100,
      },
      TITAN: {
        key: "spaceship1",
        scale: 0.1,
        fireRate: 180,
        bVel: -800,
        bScale: 0.8,
        shotType: "QUAD", // Special ability
        hp: 200,
      },
    };
    this.shipConfig = shipConfigs[this.equippedCard] || shipConfigs.STARTER;
    this.player = this.physics.add
      .sprite(width / 2, height - 120, this.shipConfig.key)
      .setScale(this.shipConfig.scale)
      .setCollideWorldBounds(true)
      .setDepth(10);
    this.player.body.setAllowGravity(false);
    this.player.hp = this.shipConfig.hp;
    // 6. TIMERS both for bullets and enemies
    this.time.addEvent({
      delay: this.shipConfig.fireRate,
      callback: this.fireBullet,
      callbackScope: this,
      loop: true,
    });
    // Enemy Timer
    this.spawnTimer = this.time.addEvent({
      delay: 1000,
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true,
    });
    // 7. COLLISIONS
    // Scenario A: Bullet hits Enemy
    this.physics.add.overlap(this.bullets, this.enemies, (bullet, enemy) => {
      // Capture position before anything is destroyed
      const ex = enemy.x;
      const ey = enemy.y;
      bullet.destroy();
      // Check if enemy is already 'dying' to prevent double gold
      if (enemy.active && !enemy.isDead) {
        enemy.takeDamage(10);
        // Only show gold if this specific hit killed the enemy
        if (enemy.hp <= 0) {
          this.showGoldPopup(ex, ey, 10);
        }
      }
    });
    // Scenario B: Player ship crashes into Enemy
    this.physics.add.overlap(this.player, this.enemies, (_, enemy) => {
      if (enemy.active && !enemy.isDead) {
        const ex = enemy.x;
        const ey = enemy.y;
        enemy.die();
        this.takeDamage(20);
        this.showGoldPopup(ex, ey, 10);
      }
    });
    // 8. UI / HUD
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

    // 9. WORLD BOUNDS
    this.physics.world.setBounds(0, 0, width, height, true, true, false, false);
    // ADD THIS LINE: It forces the world to check for collisions more accurately
    this.physics.world.TILE_BIAS = 32;
  }

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
    console.log("Boss Wave Started!");
    // We will build the actual Boss spawn logic next!
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
    if (this.isGameOver) return;
    const x = Phaser.Math.Between(50, this.scale.width - 50);
    const isWave2 = this.currentWave === 2;
    const type = isWave2 ? "ZIGZAG" : "STRAIGHT";
    const texture = isWave2 ? "enemyType2" : "enemyType1";
    const hp = isWave2 ? 40 : 20;
    const enemy = new Enemy(this, x, -20, texture, hp, type);
    this.enemies.add(enemy);
    // 1. ALL ENEMIES need vertical velocity to move down
    if (enemy.body instanceof Phaser.Physics.Arcade.Body) {
      enemy.body.setVelocityY(isWave2 ? 160 : 200);
      // 2. WAVE 2 SPECIFIC: Horizontal Ping-Pong
      if (isWave2) {
        enemy.setTint(0x00ff00);
        const horizontalSpeed = 150;
        const startRight = x < this.scale.width / 2;
        enemy.body.setVelocityX(
          startRight ? horizontalSpeed : -horizontalSpeed,
        );
        enemy.body.setBounce(1, 0);
        enemy.body.setCollideWorldBounds(true);
      }
    }
  }

  update(time, delta) {
    if (this.isGameOver) return;
    // Scroll Background
    this.bg.tilePositionY -= 1;
    // CONTINUOUS TOUCH MOVEMENT
    const pointer = this.input.activePointer;
    if (pointer.isDown) {
      this.player.x = Phaser.Math.Linear(this.player.x, pointer.x, 0.2);
      // 2. Smooth Y movement with the Offset and the Safety Clamp (Combined)
      const targetY = Phaser.Math.Clamp(
        pointer.y - 50,
        100,
        this.scale.height - 50,
      );
      this.player.y = Phaser.Math.Linear(this.player.y, targetY, 0.2);
    }
    // Combined Bullet Logic
    this.bullets.children.each((b) => {
      b.update(); // Runs the Projectile's internal update
      if (b.y < -50) b.destroy(); // Cleans up off-screen
    });

    // Combined Enemy Logic in update()
    this.enemies.children.each((e) => {
      e.update(time);
      // Cleanup check inside the same loop
      if (e.y > this.scale.height + 50) {
        if (e.hpBar) e.hpBar.destroy();
        e.destroy();
      }
    });

    // Inside update(time, delta)
    if (!this.isGameOver) {
      this.gameTimer += delta; // delta is the time passed since last frame
      // Check for Wave 2 at 20 seconds
      if (this.currentWave === 1 && this.gameTimer > 10000) {
        this.startNextWave(2, 800); // Wave 2, faster spawn
      }
      // Check for Boss at 60 seconds
      if (this.currentWave === 2 && this.gameTimer > 30000) {
        this.startBossWave();
      }
    }
  }
}
