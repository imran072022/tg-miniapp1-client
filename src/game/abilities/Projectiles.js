import Phaser from "phaser";

export default class Projectile extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, config) {
    super(scene, x, y, texture);

    // 1. Setup Physics
    scene.add.existing(this);
    scene.physics.add.existing(this);
    if (this.body) this.body.allowGravity = false;

    // 2. Apply Stats from Config
    this.setDepth(5);
    this.setBlendMode(Phaser.BlendModes.ADD);
    this.setScale(config.bScale);
    this.setVelocityY(config.bVel);

    // 3. Handle Special Titan Effects
    if (config.shotType === "QUAD") {
      this.setTint(0xffaa00); // Golden
      this.createTrail(scene);
    } else {
      this.setTint(0x00ffff); // Cyan
    }
  }

  createTrail(scene) {
    this.emitter = scene.add.particles(0, 0, this.texture.key, {
      speed: { min: 10, max: 50 },
      scale: { start: 0.4, end: 0 },
      alpha: { start: 0.5, end: 0 },
      lifespan: 300,
      gravityY: 400,
      blendMode: "ADD",
      follow: this,
      tint: 0xffaa00,
    });

    // Clean up emitter when bullet is destroyed
    this.once("destroy", () => {
      this.emitter.stop();
      scene.time.delayedCall(300, () => this.emitter.destroy());
    });
  }

  update() {
    if (this.y < -50) {
      this.destroy();
    }
  }
}
