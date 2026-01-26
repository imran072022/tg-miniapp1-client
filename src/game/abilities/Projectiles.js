// Projectile.js
import Phaser from "phaser";
export class Projectile extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, type) {
    super(scene, x, y, "neon_bullet");
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.body.setAllowGravity(false);
    this.setVelocityY(-600);
    this.setDepth(5);
    if (type === "TITAN") this.setTint(0xffaa00).setScale(1.2);
  }
  update() {
    if (this.y < -50) this.destroy();
  }
}
