import Phaser from "phaser";
import { Projectile } from "../abilities/Projectiles";

export class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, cardType) {
    super(scene, x, y, "plane");
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.cardType = cardType;
    this.hp = 100;
    this.setScale(0.5);
    this.setCollideWorldBounds(true);
    this.setInteractive();

    this._lastFired = 0;
    this.fireRate = 100;

    // Mobile swipe movement
    scene.input.on("pointermove", (pointer) => {
      if (pointer.isDown && this.active) {
        this.x = pointer.x;
      }
    });
  }

  update(cursors) {
    if (!this.active || !this.body) return;

    const speed = 400;
    // Only use keyboard if the screen isn't being touched
    if (!this.scene.input.activePointer.isDown) {
      if (cursors.left.isDown) this.setVelocityX(-speed);
      else if (cursors.right.isDown) this.setVelocityX(speed);
      else this.setVelocityX(0);
    }

    if (this.scene.time.now - this._lastFired > this.fireRate) {
      this.fire();
      this._lastFired = this.scene.time.now;
    }
  }

  fire() {
    if (!this.active) return;
    const bullet = new Projectile(
      this.scene,
      this.x,
      this.y - 30,
      this.cardType,
    );
    this.scene.bullets.add(bullet);
  }

  takeDamage(amount) {
    this.hp -= amount;
    this.setTint(0xff0000);
    this.scene.time.delayedCall(80, () => {
      if (this.active) this.clearTint();
    });
    if (this.hp <= 0) {
      this.scene.events.emit("PLAYER_DIED");
      this.destroy();
    }
  }
}
