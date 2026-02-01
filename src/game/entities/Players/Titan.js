import BasePlayer from "./BasePlayer";
import Projectile from "../../abilities/Projectiles";

export default class Titan extends BasePlayer {
  constructor(scene, x, y) {
    super(scene, x, y, "spaceship1", {
      hp: 1000,
      fireRate: 180,
      bVel: -800,
      bScale: 0.8,
      scale: 0.1,
    });
  }

  fire(time) {
    // 1. Core Glow: The ship flashes white-hot momentarily when discharging 4 bolts
    this.setTint(0xffffff);
    this.scene.time.delayedCall(40, () => {
      if (this.active) this.setTint(0xffcc66); // Return to Golden Armor
    });

    const spawnShot = (xOff, vXOff) => {
      const bullet = new Projectile(
        this.scene,
        this.x + xOff,
        this.y - 30,
        "energy_bullet",
        this,
      );
      this.scene.bullets.add(bullet);

      bullet.body.velocity.y = this.bulletVel;
      bullet.body.velocity.x = vXOff;

      // Bright Plasma Look
      bullet.setDisplaySize(14, 40);
      // Multi-tint: Top is White (Hot), Bottom is Orange (Cooling)
      bullet.setTint(0xffffff, 0xffffff, 0xffaa00, 0xffaa00);

      this.addTitanTrail(bullet);
    };

    // The 4-shot pattern
    const nozzles = [-20, -10, 10, 20];
    const angles = [-160, 0, 0, 160]; // Slightly wider spread

    nozzles.forEach((xPos, index) => {
      spawnShot(xPos, angles[index]);
      this.triggerMuzzleFlash(xPos);
    });
  }

  triggerMuzzleFlash(xOff) {
    // Brighter Sparkle: Using 'ADD' blend mode for a glowing effect
    const flash = this.scene.add
      .sprite(this.x + xOff, this.y - 35, "flash")
      .setDepth(11)
      .setScale(0.5)
      .setBlendMode("ADD")
      .setTint(0xffffff); // Pure white sparkle for maximum contrast

    this.scene.tweens.add({
      targets: flash,
      scale: 1.2,
      alpha: 0,
      duration: 50,
      onComplete: () => flash.destroy(),
    });
  }
  addTitanTrail(bullet) {
    // UPGRADE: "Heat Ribbon" trail instead of falling particles
    const emitter = this.scene.add.particles(0, 0, bullet.texture.key, {
      follow: bullet,
      scale: { start: 0.6, end: 0 },
      alpha: { start: 0.4, end: 0 },
      lifespan: 150,
      blendMode: "ADD",
      tint: 0xff5500,
      frequency: 10,
    });

    bullet.once("destroy", () => {
      emitter.stop();
      this.scene.time.delayedCall(150, () => emitter.destroy());
    });
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
  }
}
