import Phaser from "phaser";

export default class BaseEnemy extends Phaser.GameObjects.Sprite {
  constructor(scene, x, y, texture, config) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setAllowGravity(false);
    this.setDepth(10); // Ensure it is above the background
    // Stats from config or defaults
    this.hp = config.hp || 20;
    this.maxHP = this.hp;
    this.goldValue = config.goldValue || 10;
    this.isDead = false;

    // Health Bar setup
    this.hpBar = scene.add.graphics();
    this.updateHealthBar();
  }

  updateHealthBar() {
    this.hpBar.clear();
    if (this.hp <= 0) return;

    const width = 40;
    const height = 5;
    const x = this.x - width / 2;
    const y = this.y - this.displayHeight / 2 - 10;

    this.hpBar.fillStyle(0x000000, 0.5);
    this.hpBar.fillRect(x, y, width, height);

    const healthPercentage = this.hp / this.maxHP;
    const barColor = healthPercentage > 0.5 ? 0x00ff00 : 0xff0000;
    this.hpBar.fillStyle(barColor, 1);
    this.hpBar.fillRect(x, y, width * healthPercentage, height);
  }

  // game/entities/enemies/BaseEnemy.js

  takeDamage(amount) {
    if (this.isDead) return;
    this.hp -= amount;

    // --- THE FIX ---
    // 1. Flash pure white (0xffffff)
    this.setTint(0xffffff);

    // 2. Wait 60ms then restore the correct color
    this.scene.time.delayedCall(60, () => {
      if (this.active && !this.isDead) {
        // If we defined a bodyColor (like Yellow or Blue), return to it.
        // Otherwise, clear it to the original sprite texture.
        if (this.bodyColor !== undefined) {
          this.setTint(this.bodyColor);
        } else {
          this.clearTint();
        }
      }
    });

    this.updateHealthBar();

    if (this.hp <= 0) {
      this.die();
    }
  }

  die() {
    this.isDead = true;
    this.hpBar.destroy();
    // We will trigger the gold popup via the CollisionManager logic usually
    this.destroy();
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta); // Crucial for animations/physics

    if (this.isDead || !this.active) return;

    // This replaces your old drawHealthBar() call from Enemy.js
    this.updateHealthBar();

    // Cleanup off-screen (bottom only, unless retreating)
    if (this.y > this.scene.scale.height + 50) {
      this.die(); // Or this.destroy()
    }
  }
}
