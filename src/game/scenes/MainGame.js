import Phaser from "phaser";

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
      enemy.destroy();
      this.gold += 10;
      this.game.events.emit("UPDATE_GOLD", this.gold);
    });

    this.physics.add.overlap(this.player, this.enemies, (player, enemy) => {
      enemy.destroy();
      this.takeDamage(20);
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
  showMuzzleFlash(xOffset) {
    // 1. Check the key: ensure this matches your this.load.image("flash", ...)
    const flash = this.add
      .sprite(this.player.x + xOffset, this.player.y - 40, "flash")
      .setDepth(20) // Higher depth so it's definitely on top
      .setScale(0.8) // Increased from 0.1 so you can actually see it
      .setAlpha(1)
      .setTint(0xffffff);

    // 2. The Animation
    this.tweens.add({
      targets: flash,
      scale: 2, // Grow slightly
      alpha: 0, // Fade out
      duration: 60, // Very fast flash
      onComplete: () => flash.destroy(),
    });
  }
  fireBullet() {
    if (this.isGameOver || !this.player.active) return;

    if (this.shipConfig.shotType === "QUAD") {
      // Fire bullets + Show flashes at the wing tips/cannons
      this.createBullet(-15, 0);
      this.createBullet(15, 0);
      this.createBullet(-20, -150);
      this.createBullet(20, 150);

      // Two muzzle flashes look great for a dual-cannon ship
      this.showMuzzleFlash(-15);
      this.showMuzzleFlash(15);
    } else {
      this.createBullet(0, 0);
      this.showMuzzleFlash(0);
    }
  }

  // Helper function to create the actual bullet object
  createBullet(xOffset, velocityXOffset) {
    const bullet = this.bullets.create(
      this.player.x + xOffset,
      this.player.y - 30,
      "energy_bullet",
    );

    if (bullet) {
      bullet.setVelocityY(this.shipConfig.bVel);
      bullet.setVelocityX(velocityXOffset);
      bullet.setDepth(5);
      bullet.body.setAllowGravity(false);
      bullet.setBlendMode(Phaser.BlendModes.ADD);

      if (this.equippedCard === "TITAN") {
        bullet.setTint(0xffaa00);
        bullet.setScale(1.2);

        // --- NEW TRAIL LOGIC ---
        // Create a local emitter just for this bullet
        const emitter = this.add.particles(0, 0, "energy_bullet", {
          speed: 0,
          scale: { start: 0.4, end: 0 },
          alpha: { start: 0.5, end: 0 },
          lifespan: 300,
          blendMode: "ADD",
          follow: bullet, // Attached directly to this bullet!
          tint: 0xffaa00,
          gravityY: 400,
        });

        // Crucial: Tell the emitter to stop when the bullet is gone
        bullet.once("destroy", () => {
          emitter.stop(); // Stop spawning new particles
          // Delete the emitter object after the last particles fade away
          this.time.delayedCall(300, () => emitter.destroy());
        });
        // -----------------------
      } else {
        bullet.setTint(0x00ffff);
        bullet.setScale(0.8);
      }
    }
  }

  spawnEnemy() {
    if (this.isGameOver) return;

    const x = Phaser.Math.Between(50, this.scale.width - 50);
    const enemy = this.enemies.create(x, -50, "e_1");
    if (enemy) {
      enemy
        .setVelocityY(200 + this.selectedLevel * 5)
        .setDepth(5)
        .setTint(0xff4444);
      enemy.body.setAllowGravity(false);
    }
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
    }

    // CLEANUP
    this.bullets.children.each((b) => {
      if (b.y < -50) b.destroy();
    });
    this.enemies.children.each((e) => {
      if (e.y > this.scale.height + 50) e.destroy();
    });
  }
}
