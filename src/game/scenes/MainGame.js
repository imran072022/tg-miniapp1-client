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
    this.time.addEvent({
      delay: 1000, // Spawns one enemy every 1 second
      callback: this.spawnEnemy,
      callbackScope: this,
      loop: true,
    });

    // 7. COLLISIONS
    this.physics.add.overlap(this.bullets, this.enemies, (bullet, enemy) => {
      bullet.destroy();
      enemy.takeDamage(10); // The enemy handles the rest!
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

  spawnEnemy() {
    if (this.isGameOver) return;
    const x = Phaser.Math.Between(50, this.scale.width - 50);
    // Create an instance of our new Enemy class
    const enemy = new Enemy(this, x, -50, "e_1", 20);
    // Add it to the physics group so collisions still work
    this.enemies.add(enemy);
    // Set movement
    enemy.setVelocityY(200 + this.selectedLevel * 5);
  }

  update() {
    if (this.isGameOver) return;
    // Scroll Background
    this.bg.tilePositionY -= 1;
    // CONTINUOUS TOUCH MOVEMENT
    const pointer = this.input.activePointer;
    if (pointer.isDown) {
      // Smooth movement (Lerp)
      this.player.x = Phaser.Math.Linear(this.player.x, pointer.x, 0.2);
      this.player.y = Phaser.Math.Linear(this.player.y, pointer.y - 50, 0.2);
    }
    // Combined Bullet Logic
    this.bullets.children.each((b) => {
      b.update(); // Runs the Projectile's internal update
      if (b.y < -50) b.destroy(); // Cleans up off-screen
    });
    // Inside update() in MainGame.js
    this.enemies.children.each((e) => {
      e.update(); // This ensures drawHealthBar() is called as the enemy moves down
    });
    // Enemy Cleanup
    this.enemies.children.each((e) => {
      if (e.y > this.scale.height + 50) e.destroy();
    });
  }
}
