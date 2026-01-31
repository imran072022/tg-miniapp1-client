import Phaser from "phaser";

export default class Projectile extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, owner) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    if (this.body) this.body.allowGravity = false;
    this.setDepth(5);

    // We only set the scale here; let the ship handle the rest.
    this.setScale(owner.bulletScale);
  }

  update() {
    if (this.y < -50 || this.y > 1000) this.destroy();
  }
}
