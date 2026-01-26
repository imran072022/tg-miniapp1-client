import Phaser from "phaser";

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, config) {
    super(scene, x, y, config.texture);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Dynamic stats from config
    this.hp = config.hp || 10;
    this.speed = config.speed || 200;
    this.points = config.points || 10;
    this.isBoss = config.isBoss || false;

    this.setVelocityY(this.speed);
  }

  takeDamage(amount) {
    this.hp -= amount;

    // Flash white when hit
    this.setTint(0xffffff);
    this.scene.time.delayedCall(50, () => this.clearTint());

    if (this.hp <= 0) {
      this.die();
    }
  }

  die() {
    // Drop gold or trigger explosion effects here later
    this.scene.events.emit("ENEMY_KILLED", this.points);
    this.destroy();
  }

  update() {
    // Logic for "Bomber Magnet" or "Projectile firing" goes here in the future
    if (this.y > this.scene.scale.height + 50) {
      this.destroy();
    }
  }
}
