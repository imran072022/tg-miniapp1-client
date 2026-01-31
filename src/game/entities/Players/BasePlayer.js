import Phaser from "phaser";

export default class BasePlayer extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, config) {
    super(scene, x, y, texture);
    // Setup physics
    scene.add.existing(this);
    scene.physics.add.existing(this);
    // Stats from config
    this.hp = config.hp || 100;
    this.maxHp = this.hp;
    this.fireRate = config.fireRate || 250;
    this.bulletVel = config.bVel || -600;
    this.bulletScale = config.bScale || 0.6;
    this.setScale(config.scale || 1);
    this.setCollideWorldBounds(true);
    this.setDepth(10);
    this.body.setAllowGravity(false);
    this._lastFired = 0;
  }

  update(time, delta) {
    if (!this.active) return;
    this.handleMovement();
    // Automatic Firing Logic
    if (time - this._lastFired > this.fireRate) {
      this.fire(time);
      this._lastFired = time;
    }
  }

  handleMovement() {
    const pointer = this.scene.input.activePointer;
    if (pointer.isDown) {
      this.x = Phaser.Math.Linear(this.x, pointer.x, 0.2);
      const targetY = Phaser.Math.Clamp(
        pointer.y - 50,
        100,
        this.scene.scale.height - 50,
      );
      this.y = Phaser.Math.Linear(this.y, targetY, 0.2);
    }
  }

  takeDamage(amount) {
    this.hp -= amount;
    this.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
      if (this.active) this.clearTint();
    });
    // Tell the UI to update
    this.scene.game.events.emit("UPDATE_HP", this.hp);
    if (this.hp <= 0) {
      this.scene.game.events.emit("GAME_OVER", this.scene.gold);
      this.destroy();
    }
  }

  fire(time) {
    // Child classes will put their specific bullet patterns here
  }
}
