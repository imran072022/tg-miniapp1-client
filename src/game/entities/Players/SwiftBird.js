import Phaser from "phaser";
import Projectile from "../../abilities/Projectiles";
import BasePlayer from "./BasePlayer";

export default class SwiftBird extends BasePlayer {
  constructor(scene, x, y) {
    super(scene, x, y, "player3", {
      hp: 800,
      fireRate: 120,
      bVel: -900,
      bScale: 0.4,
      scale: 1.5,
    });

    // 1. IMPROVED PLANE COLOR: High brightness pink to prevent "blacking out"
    // Using 0xffd9ff for a very pale, clear pink.
    this.setTint(0xffd9ff);
    this.setBlendMode(Phaser.BlendModes.NORMAL);

    // 2. DUAL THRUSTERS: Moved to match wing positions
    this.createThruster(scene, -22, 25);
    this.createThruster(scene, 22, 25);
  }

  createThruster(scene, xOff, yOff) {
    scene.add.particles(0, 0, "energy_bullet", {
      follow: this,
      followOffset: { x: xOff, y: yOff },
      speedY: { min: 120, max: 220 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 0.7, end: 0 },
      lifespan: 350,
      blendMode: "ADD",
      tint: 0xff00ff, // Pink fire to match the bullets
      frequency: 12,
    });
  }

  fire(time) {
    const nozzles = [-20, -10, 10, 20];

    nozzles.forEach((xOff) => {
      const bullet = new Projectile(
        this.scene,
        this.x + xOff,
        this.y - 10,
        "energy_bullet",
        this,
      );
      this.scene.bullets.add(bullet);
      bullet.body.velocity.y = this.bulletVel;

      // --- WHITE CORE EFFECT ---
      // Top-left/bottom-right are White (0xffffff), others are Pink
      bullet.setTint(0xffffff, 0xff00ff, 0xff00ff, 0xffffff);
      bullet.setBlendMode(Phaser.BlendModes.ADD);

      const randomLength = Phaser.Math.FloatBetween(1.6, 2.4);
      bullet.setScale(0.3, randomLength);

      this.applyPinkGlow(bullet);

      // --- RANDOMIZED MUZZLE FLASH ---
      this.triggerMuzzleFlash(xOff);
    });

    // --- SCREEN SHAKE (Light shake for SwiftBird) ---
    this.scene.cameras.main.shake(50, 0.002);
  }

  triggerMuzzleFlash(xOff) {
    const flash = this.scene.add
      .sprite(this.x + xOff, this.y - 30, "flash")
      .setDepth(11)
      .setTint(0xffffff) // White flash for intensity
      .setScale(Phaser.Math.FloatBetween(0.4, 0.7))
      .setAngle(Phaser.Math.Between(0, 360)); // RANDOM ROTATION

    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 40,
      onComplete: () => flash.destroy(),
    });
  }

  applyPinkGlow(bullet) {
    const emitter = this.scene.add.particles(0, 0, bullet.texture.key, {
      follow: bullet,
      scale: { start: 0.8, end: 0 },
      alpha: { start: 0.6, end: 0 },
      lifespan: 150, // Shorter lifespan for a sharper laser look
      blendMode: "ADD",
      tint: 0xff00ff,
      frequency: 10,
      emitCallback: (p) => {
        p.angle = Math.random() * 360;
      },
    });

    bullet.once("destroy", () => {
      emitter.stop();
      this.scene.time.delayedCall(150, () => emitter.destroy());
    });
  }
}
