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
    // Hp bar
    this.hpBar = this.scene.add.graphics();
    this.hpBar.setScrollFactor(0).setDepth(1000);
    this.updateHPBar(); // Initial draw
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
  updateHPBar() {
    this.hpBar.clear();
    const x = 20,
      y = 55,
      w = 110,
      h = 9;

    // 1. Background
    this.hpBar.fillStyle(0x000000, 0.5).fillRect(x, y, w, h);

    const percent = Math.max(0, this.hp / this.maxHp);

    // 2. Improved Color Transition (Green -> Yellow -> Red)
    let r = percent < 0.5 ? 255 : Math.floor(255 * (1 - percent) * 2);
    let g = percent > 0.5 ? 255 : Math.floor(255 * percent * 2);
    let color = Phaser.Display.Color.GetColor(r, g, 0);

    // 3. Pulse Logic (Only if health is low)
    if (percent > 0 && percent < 0.25) {
      // Use a Sine wave based on time to create a smooth blink
      const t = this.scene.time.now;
      const pulse = Math.abs(Math.sin(t / 150));

      // Instead of pure white, we interpolate between Red and a brighter Warning color
      if (pulse > 0.5) {
        color = 0xff3333; // Brighter red/pinkish instead of pure white
      }
    }

    // 4. Draw the Fill
    if (percent > 0) {
      this.hpBar.fillStyle(color, 1).fillRect(x, y, w * percent, h);
    }

    // 5. Border
    this.hpBar.lineStyle(2, 0xffffff, 0.3).strokeRect(x, y, w, h);
  }
  takeDamage(amount) {
    this.hp -= amount;
    this.updateHPBar();
    this.setTint(0xff0000);
    this.scene.time.delayedCall(100, () => {
      if (this.active) this.clearTint();
    });
    this.scene.game.events.emit("UPDATE_HP", this.hp);
    if (this.hp <= 0) {
      this.hpBar.clear();
      this.scene.game.events.emit("GAME_OVER", this.scene.gold);
      this.destroy();
    }
  }
  fire(time) {
    // Child classes will put their specific bullet patterns here
  }
  update(time, delta) {
    if (!this.active) return;
    if (this.hp / this.maxHp < 0.25) {
      this.updateHPBar();
    }
    this.handleMovement();
    if (time - this._lastFired > this.fireRate) {
      this.fire(time);
      this._lastFired = time;
    }
  }
}
