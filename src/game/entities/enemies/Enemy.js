import Phaser from "phaser";

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, hp) {
    super(scene, x, y, texture);

    // 1. Add to scene and physics
    scene.add.existing(this);
    scene.physics.add.existing(this);
    // 2. Setup physics properties
    if (this.body) {
      this.body.allowGravity = false;
    }
    this.setDepth(5);
    this.setTint(0xff4444);
    // 3. Stats
    this.hp = hp || 20;
    this.maxHp = this.hp; // Store max HP for the bar percentage
    this.isDead = false;
    // Create the Graphics object for the health bar
    this.hpBar = scene.add.graphics();
    this.drawHealthBar();
  }

  drawHealthBar() {
    this.hpBar.clear();
    // Only draw if enemy is alive and has taken some damage (optional)
    if (this.isDead || !this.active) return;
    const x = this.x - 20; // Center the 40px bar
    const y = this.y - 35; // Position above the enemy
    // 1. Background (Black/Dark Red)
    this.hpBar.fillStyle(0x000000, 0.8);
    this.hpBar.fillRect(x, y, 40, 6);
    // 2. Health Level (Green or Red depending on health)
    const healthWidth = (this.hp / this.maxHp) * 40;
    const color = this.hp > this.maxHp * 0.3 ? 0x00ff00 : 0xff0000;
    this.hpBar.fillStyle(color, 1);
    this.hpBar.fillRect(x, y, healthWidth, 6);
  }
  takeDamage(amount) {
    if (this.isDead) return;
    this.hp -= amount;
    this.setTint(0xffffff); // Flash white when hit
    this.scene.time.delayedCall(50, () => {
      if (this.active) this.setTint(0xff4444);
    });
    if (this.hp <= 0) {
      this.die();
    }
  }

  die() {
    this.isDead = true;
    this.hpBar.destroy();
    // 1. Create an explosion of red squares (using the enemy texture)
    const explorer = this.scene.add.particles(this.x, this.y, "e_1", {
      speed: { min: -100, max: 100 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.2, end: 0 },
      lifespan: 500,
      gravityY: 200,
      quantity: 10, // Number of pieces
      emitting: false, // Don't start yet
    });
    // 2. Explode once
    explorer.explode();
    // 3. Clean up the particle manager after it's done
    this.scene.time.delayedCall(500, () => explorer.destroy());
    // 4. Remove the enemy
    this.destroy();
  }

  update() {
    // Move the bar with the enemy
    this.drawHealthBar();
    if (this.y > this.scene.scale.height + 50) {
      this.hpBar.destroy();
      this.destroy();
    }
  }
}
