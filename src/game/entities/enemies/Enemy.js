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
    this.hp = hp || 10;
    this.isDead = false;
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
    // Auto-destroy if it leaves the screen
    if (this.y > this.scene.scale.height + 50) {
      this.destroy();
    }
  }
}
