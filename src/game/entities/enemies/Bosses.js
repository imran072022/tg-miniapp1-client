import Phaser from "phaser";

export default class Boss extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, hp) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.hp = hp;
    this.maxHp = hp;
    this.isEntering = true;
    this.isDead = false;

    this.setDepth(15);
    this.setScale(0.5); // Bosses are usually big!
    // Inside Boss.js constructor
    this.hpBar = scene.add.graphics();
    this.hpBar.setScrollFactor(0); // Fixes it to the screen camera
    this.drawHealthBar();

    if (this.body instanceof Phaser.Physics.Arcade.Body) {
      this.body.setAllowGravity(false);
      // The Boss flies down to y=150 and then starts its pattern
      this.body.setVelocityY(100);
    }
  }

  update() {
    if (this.isDead || !this.active) return;

    // Check if we reached the stopping point
    if (this.isEntering && this.y >= 150) {
      this.isEntering = false;
      this.body.setVelocityY(0); // Stop moving down
      this.startPattern(); // Start moving side-to-side
    }
  }

  startPattern() {
    // Move Left and Right across the top
    this.scene.tweens.add({
      targets: this,
      x: { from: 50, to: this.scene.scale.width - 50 },
      duration: 3000,
      yoyo: true,
      loop: -1,
      ease: "Sine.easeInOut",
    });
  }

  takeDamage(amount) {
    if (this.isDead) return;
    this.hp -= amount;
    this.setTint(0xffffff);
    this.scene.time.delayedCall(50, () => this.clearTint());

    if (this.hp <= 0) this.die();
  }
  drawHealthBar() {
    this.hpBar.clear();
    const width = 300;
    const height = 20;
    const x = (this.scene.scale.width - width) / 2;
    const y = 50;
    // Background
    this.hpBar.fillStyle(0x000000, 0.8);
    this.hpBar.fillRect(x, y, width, height);
    // Health
    const healthWidth = (this.hp / this.maxHp) * width;
    this.hpBar.fillStyle(0xff0000, 1);
    this.hpBar.fillRect(x, y, healthWidth, height);
  }
  die() {
    this.isDead = true;
    this.scene.time.delayedCall(100, () => this.destroy());
  }
}
