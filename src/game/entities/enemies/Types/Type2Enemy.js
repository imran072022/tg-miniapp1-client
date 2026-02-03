import Phaser from "phaser";
import BaseEnemy from "../BaseEnemy/BaseEnemy";

export default class Type2Enemy extends BaseEnemy {
  constructor(scene, x, y) {
    super(scene, x, -50, "Type2Enemy", { hp: 500, goldValue: 150 });

    if (this.body) this.body.setVelocityY(30);
    this.setScale(1.4);
    this.bodyColor = 0x00ffff;
    this.setTint(this.bodyColor);
    this.body.setSize(this.width * 0.6, this.height * 0.3);
    this.body.setOffset(this.width * 0.1, 10);
    this.moveState = "MOVING";

    this.stopY = Phaser.Math.Between(100, 250); // Where the ship stays to fight
    this.isPositioned = false;

    this.moveTimer = scene.time.addEvent({
      delay: 4000,
      callback: this.handleMovementPattern,
      callbackScope: this,
      loop: true,
    });
    this.primaryTimer = scene.time.addEvent({
      delay: 1000,
      callback: this.firePrimary,
      callbackScope: this,
      loop: true,
    });
    this.multiTimer = scene.time.addEvent({
      delay: 3500,
      callback: this.fireMulti,
      callbackScope: this,
      loop: true,
    });
    this.missileTimer = scene.time.addEvent({
      delay: 4000,
      callback: this.fireMissiles,
      callbackScope: this,
      loop: true,
    });
  }

  handleMovementPattern() {
    if (!this.active || !this.body || this.isDead) return;
    this.moveState = this.moveState === "MOVING" ? "STOPPED" : "MOVING";
    const maxLowerBound = this.scene.scale.height * 0.75;

    // Check if there is an enemy DIRECTLY in front of us
    let pathBlocked = false;
    this.scene.enemies.getChildren().forEach((other) => {
      if (other !== this && other.active && other.x === this.x) {
        // If another enemy is below us within 150 pixels, don't move
        if (other.y > this.y && other.y - this.y < 150) {
          pathBlocked = true;
        }
      }
    });

    if (this.moveState === "MOVING" || pathBlocked) {
      this.moveState = "STOPPED";
      this.body.setVelocityY(0);
    } else if (this.y < maxLowerBound) {
      this.moveState = "MOVING";
      this.body.setVelocityY(30); // Very slow creep
    }
  }
  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    if (this.isDead || !this.active || !this.scene.player) return;

    // 1. ROTATION: Always track the player
    const angle = Phaser.Math.Angle.Between(
      this.x,
      this.y,
      this.scene.player.x,
      this.scene.player.y,
    );
    const targetRotation = angle + Math.PI / 2;
    this.rotation = Phaser.Math.Angle.RotateTo(
      this.rotation,
      targetRotation,
      0.02,
    );

    // 2. SMOOTH MOVEMENT:
    const maxLowerBound = this.scene.scale.height * 0.75;

    // Only move if we are in MOVING state and haven't hit the bottom limit
    if (this.moveState === "MOVING" && this.y < maxLowerBound) {
      // Check for enemies in front (Anti-Stacking)
      let pathBlocked = false;
      this.scene.enemies.getChildren().forEach((other) => {
        if (other !== this && other.active && Math.abs(other.x - this.x) < 50) {
          if (other.y > this.y && other.y - this.y < 120) {
            pathBlocked = true;
          }
        }
      });

      if (!pathBlocked) {
        this.body.setVelocityY(30); // Constant smooth creep
      } else {
        this.body.setVelocityY(0);
      }
    } else {
      // Stop if state is STOPPED or at the 75% line
      this.body.setVelocityY(0);
      if (this.y >= maxLowerBound) this.y = maxLowerBound;
    }
  }
  spawnProjectile(xOff, yOff, speed, type = "small") {
    if (!this.active || !this.scene || !this.scene.player) return;
    const proj = this.scene.enemyBullets.create(
      this.x + xOff,
      this.y + yOff,
      "base-rounded-bullet",
    );
    if (!proj) return;

    proj.body.allowGravity = false;
    const angle = Phaser.Math.Angle.Between(
      proj.x,
      proj.y,
      this.scene.player.x,
      this.scene.player.y,
    );
    proj.setRotation(angle + Math.PI / 2);
    this.scene.physics.velocityFromRotation(angle, speed, proj.body.velocity);

    // --- RESTORING YOUR REAL-WORLD DESIGNS ---

    if (type === "small") {
      // AK47 Style - Classic Brass/Copper
      proj.setDisplaySize(8, 20);
      proj.setTint(0xffd700, 0xffd700, 0xb87333, 0xb87333);
    } else if (type === "heavy") {
      proj.setDisplaySize(10, 26);
      proj.setTint(0xffffff, 0xffffff, 0xff0000, 0xff0000);
    } else if (type === "missile") {
      proj.setDisplaySize(10, 65);
      proj.setTint(0xffffff, 0xffffff, 0x00ffff, 0x0000ff);
      proj.setAlpha(1);
      proj.setBlendMode(Phaser.BlendModes.ADD);
    }
  }

  firePrimary() {
    this.spawnProjectile(-2, 25, 1200, "small");
    this.scene.time.delayedCall(100, () => {
      if (this.active) this.spawnProjectile(2, 25, 1200, "small");
    });
  }

  fireMulti() {
    for (let i = 0; i < 4; i++) {
      this.scene.time.delayedCall(i * 100, () => {
        if (this.active) {
          this.spawnProjectile(-25, 10, 1000, "heavy");
          this.spawnProjectile(25, 10, 1000, "heavy");
        }
      });
    }
  }

  fireMissiles() {
    if (!this.active || this.isDead) return;

    const originalState = this.moveState;
    this.moveState = "STOPPED"; // Force stop to fire
    this.body.setVelocity(0, 0);

    // Recoil
    this.body.setVelocityY(-40);
    this.scene.time.delayedCall(300, () => {
      if (this.active && this.body) this.body.setVelocityY(0);
    });

    // Launch Projectiles
    const launchPoints = [-30, 30];
    launchPoints.forEach((xOff) => {
      this.spawnProjectile(xOff, -50, 750, "missile");
    });

    // Recovery: Return to previous move state after 1.5 seconds
    this.scene.time.delayedCall(1500, () => {
      if (this.active && !this.isDead) {
        this.moveState = originalState;
      }
    });
  }

  // ... existing constructor and movement logic ...

  // FIX 2: Enhanced Explosion Logic
  createExplosion() {
    // We create a container-less image so it lives after 'this' is destroyed
    const boom = this.scene.add.image(this.x, this.y, "launch_glimpse");
    boom.setBlendMode(Phaser.BlendModes.ADD);
    boom.setTint(0xff6600);
    boom.setScale(0.8);
    boom.setDepth(15); // Ensure it's above other enemies

    this.scene.tweens.add({
      targets: boom,
      scale: 6,
      alpha: 0,
      duration: 600,
      ease: "Expo.easeOut",
      onComplete: () => boom.destroy(),
    });

    // White "Electric" center spark
    const flash = this.scene.add.circle(this.x, this.y, 15, 0xffffff);
    flash.setDepth(16);
    this.scene.tweens.add({
      targets: flash,
      scale: 10,
      alpha: 0,
      duration: 250,
      ease: "Cubic.easeOut",
      onComplete: () => flash.destroy(),
    });
  }

  die() {
    if (this.isDead) return;
    this.isDead = true;

    // 1. Clean up timers
    [
      this.moveTimer,
      this.primaryTimer,
      this.multiTimer,
      this.missileTimer,
    ].forEach((t) => t && t.remove());

    // 2. Hide the enemy immediately so the explosion is the focus
    this.setVisible(false);
    this.hpBar.setVisible(false);

    // 3. Trigger the explosion
    this.createExplosion();

    // 4. Wait for a tiny fraction of a second so the explosion starts
    // before the object is fully removed from memory
    this.scene.time.delayedCall(10, () => {
      super.die();
    });
  }

  // ... rest of the firing methods ...
}
