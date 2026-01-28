import Phaser from "phaser";

export default class Boss extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, hp) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.hp = hp;
    this.maxHp = hp;
    this.isEntering = true;
    this.isDead = false;
    this.setDepth(10);
    this.setScale(0.7);
    // Inside Boss.js constructor
    this.hpBar = scene.add.graphics();
    this.hpBar.setScrollFactor(0); // Fixes it to the screen camera
    this.hpBar.setAlpha(0); // Hide it initially
    this.hpBar.setDepth(100);
    this.drawHealthBar();
    // adjust the sparkle on the boss
    if (this.body) {
      this.body.setSize(this.width * 0.8, this.height * 0.6);
      this.body.setOffset(this.width * 0.1, 0);
    }
    if (this.body instanceof Phaser.Physics.Arcade.Body) {
      this.body.setAllowGravity(false);
      // The Boss flies down to y=150 and then starts its pattern
      this.body.setVelocityY(100);
    }
  }

  startPattern() {
    const { width } = this.scene.scale;
    this.scene.tweens.add({
      targets: this,
      x: width - 100,
      duration: 1500,
      ease: "Sine.easeInOut",
      onComplete: () => {
        this.scene.tweens.add({
          targets: this,
          x: { from: width - 100, to: 100 },
          duration: 3000,
          yoyo: true,
          loop: -1,
          ease: "Sine.easeInOut",
        });
      },
    });
  }

  takeDamage(amount) {
    if (this.isDead) return;
    this.hp -= amount;
    this.drawHealthBar();
    // --- NEW: Damage Number Pop-up ---
    const damageText = this.scene.add
      .text(
        this.x + Phaser.Math.Between(-30, 30), // Randomize X slightly
        this.y + Phaser.Math.Between(-20, 20), // Randomize Y slightly
        `-${amount}`,
        {
          fontSize: "18px",
          fill: "#ffffff",
          fontWeight: "bold",
          stroke: "#ff0000",
          strokeThickness: 2,
        },
      )
      .setDepth(100);
    // Animate the text (Float up and fade)
    this.scene.tweens.add({
      targets: damageText,
      y: damageText.y - 40,
      alpha: 0,
      duration: 600,
      onComplete: () => damageText.destroy(),
    });
    // --------------------------------
    this.setTint(0xffff00);
    this.scene.time.delayedCall(50, () => {
      if (this.active) this.clearTint();
    });
    if (this.hp <= 0) this.die();
  }

  fire() {
    if (this.isDead || !this.active || this.isEntering) return;

    // First Burst
    this.spawnShells();

    // Second Burst (0.3 seconds later for that "mechanical" feel)
    this.scene.time.delayedCall(300, () => {
      if (!this.isDead && this.active) {
        this.spawnShells();
      }
    });
  }

  spawnShells() {
    const shellSpeeds = [
      { x: -120, y: 400 }, // Left Cannon
      { x: 0, y: 450 }, // Center Cannon
      { x: 120, y: 400 }, // Right Cannon
    ];
    shellSpeeds.forEach((speed) => {
      // Create a 'Shell' using a Rectangle Shape
      // (x, y, width, height, color)
      const shell = this.scene.add.rectangle(
        this.x,
        this.y + 40,
        8,
        20,
        0x00ffff,
      );
      // Add a glow effect using a second rectangle (optional but looks cool)
      shell.setStrokeStyle(2, 0xffffff);
      // Enable Physics
      this.scene.physics.add.existing(shell);
      shell.body.setVelocity(speed.x, speed.y);
      // Collision with Player
      this.scene.physics.add.overlap(this.scene.player, shell, () => {
        shell.destroy();
        this.scene.takeDamage(10);
      });
      // Cleanup
      this.scene.time.delayedCall(2500, () => {
        if (shell.active) shell.destroy();
      });
    });
  }
  drawHealthBar() {
    this.hpBar.clear();
    const width = 300;
    const height = 15;
    const x = (this.scene.scale.width - width) / 2;
    const y = 50;
    // 1. Background (Shadow)
    this.hpBar.fillStyle(0x000000, 0.5);
    this.hpBar.fillRect(x, y, width, height);
    // 2. Health (Red)
    const healthPercentage = Math.max(0, this.hp / this.maxHp);
    this.hpBar.fillStyle(0xff0000, 1);
    this.hpBar.fillRect(x, y, width * healthPercentage, height);
  }
  die() {
    if (this.isDead) return;
    this.isDead = true;
    // 1. Stop all logic
    if (this.fireTimer) this.fireTimer.remove();
    if (this.hpBar) {
      this.hpBar.clear();
      this.hpBar.destroy();
    }
    this.scene.tweens.killTweensOf(this);
    this.body.velocity.set(0, 0);
    // 2. STAGE 1: Random small explosions on the hull
    const deathTimer = this.scene.time.addEvent({
      delay: 100,
      repeat: 10,
      callback: () => {
        const rx = this.x + Phaser.Math.Between(-50, 50);
        const ry = this.y + Phaser.Math.Between(-50, 50);
        const boom = this.scene.add
          .sprite(rx, ry, "flash")
          .setScale(Phaser.Math.FloatBetween(0.5, 1.2))
          .setTint(0xffaa00);
        this.scene.tweens.add({
          targets: boom,
          alpha: 0,
          duration: 200,
          onComplete: () => boom.destroy(),
        });
        // Camera shake for every small blast
        this.scene.cameras.main.shake(100, 0.005);
      },
    });
    // 3. STAGE 2: The Final Blow
    this.scene.time.delayedCall(1200, () => {
      // Large white flash
      const finalBlast = this.scene.add
        .sprite(this.x, this.y, "flash")
        .setScale(4)
        .setTint(0xffffff)
        .setDepth(100);
      this.scene.tweens.add({
        targets: finalBlast,
        alpha: 0,
        scale: 6,
        duration: 600,
        onComplete: () => finalBlast.destroy(),
      });
      // Drop some big gold/loot before disappearing
      this.scene.showGoldPopup(this.x, this.y, 500);
      // Notify the game the boss is gone
      this.scene.events.emit("BOSS_DEFEATED");
      this.destroy();
    });
  }
  update() {
    if (this.isDead || !this.active) return;
    // ONLY execute this logic once when the boss reaches y = 150
    if (this.isEntering && this.y >= 150) {
      this.isEntering = false;
      // Fix: Access velocity directly to avoid the 'setVelocity' error
      if (this.body) {
        this.body.velocity.x = 0;
        this.body.velocity.y = 0;
      }
      // 1. Fade in the HP bar (Now runs only ONCE)
      this.scene.tweens.add({
        targets: this.hpBar,
        alpha: 1,
        duration: 1000,
      });
      // 2. Start movement (Now runs only ONCE)
      this.startPattern();
      // 3. Start firing (Now runs only ONCE)
      this.fireTimer = this.scene.time.addEvent({
        delay: 4000,
        callback: this.fire,
        callbackScope: this,
        loop: true,
      });
    }
  }
}
