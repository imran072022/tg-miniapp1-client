// Enemy.js
import Phaser from "phaser";
export class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, config) {
    super(scene, x, y, config.texture || "e_1");
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.hp = config.hp || 10;
    this.body.setAllowGravity(false);
    this.setVelocityY(config.speed || 200);
    this.setDepth(5);
  }
  takeDamage(amount) {
    this.hp -= amount;
    this.setTint(0xffffff);
    this.scene.time.delayedCall(50, () => {
      if (this.active) this.clearTint();
    });
    if (this.hp <= 0) this.destroy();
  }
  update() {
    if (this.y > this.scene.scale.height + 50) this.destroy();
  }
}
