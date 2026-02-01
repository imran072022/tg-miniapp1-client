import BasePlayer from "./BasePlayer";
import Projectile from "../../abilities/Projectiles";

export default class Vanguard extends BasePlayer {
  constructor(scene, x, y) {
    super(scene, x, y, "vanguard", {
      // Your default ship sprite
      hp: 600,
      fireRate: 200,
      bVel: -750,
      bScale: 0.5,
      scale: 1.0,
    });
    this.ultCharge = 0;
    this.maxUltCharge = 100;
    this.isUltReady = false;
  }

  fire(time) {
    // Triple Straight Stream: High precision
    const offsets = [-15, 0, 15];

    offsets.forEach((xOff) => {
      const bullet = new Projectile(
        this.scene,
        this.x + xOff,
        this.y - 25,
        "energy_bullet",
        this,
      );
      this.scene.bullets.add(bullet);

      bullet.body.velocity.y = this.bulletVel;

      // Visuals: Electric Blue/Cyan theme
      bullet.setDisplaySize(8, 45);
      bullet.setTint(0x00ffff, 0xffffff, 0x00aaff, 0xffffff);

      this.addVanguardTrail(bullet);
    });

    // Single bright center flash
    this.triggerMuzzleFlash(0);
  }

  addVanguardTrail(bullet) {
    // Clean, "Digital" looking trail
    const emitter = this.scene.add.particles(0, 0, bullet.texture.key, {
      follow: bullet,
      scale: { start: 0.4, end: 0 },
      alpha: { start: 0.6, end: 0 },
      lifespan: 100,
      blendMode: "ADD",
      tint: 0x00ffff,
      frequency: 15,
    });

    bullet.once("destroy", () => {
      emitter.stop();
      this.scene.time.delayedCall(100, () => emitter.destroy());
    });
  }

  triggerMuzzleFlash(xOff) {
    const flash = this.scene.add
      .sprite(this.x + xOff, this.y - 30, "flash")
      .setDepth(11)
      .setScale(1.2)
      .setBlendMode("ADD")
      .setTint(0x00ffff);

    this.scene.tweens.add({
      targets: flash,
      scale: 1.5,
      alpha: 0,
      duration: 50,
      onComplete: () => flash.destroy(),
    });
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
  }
  launchSuper() {
    if (!this.isUltReady) return;

    // Camera Shake: High frequency, short duration
    this.scene.cameras.main.shake(200, 0.01);

    const missilePositions = [-40, 40];
    missilePositions.forEach((xOff) => {
      const missile = new Projectile(
        this.scene,
        this.x + xOff,
        this.y,
        "energy_bullet",
        this,
      );
      this.scene.bullets.add(missile);

      missile.setDisplaySize(20, 50);
      missile.setTint(0xffffff, 0xffff00, 0xffffff, 0xffff00);
      missile.body.setVelocityY(-1200);

      this.addMissileTrail(missile);
    });

    // Reset the logic inside the player class
    this.ultCharge = 0;
    this.isUltReady = false;
  }

  addMissileTrail(missile) {
    const emitter = this.scene.add.particles(0, 0, "flash", {
      follow: missile,
      scale: { start: 0.5, end: 0 },
      alpha: { start: 0.8, end: 0 },
      lifespan: 500,
      blendMode: "SCREEN",
      frequency: 5,
    });
    missile.once("destroy", () => {
      emitter.stop();
      this.scene.time.delayedCall(500, () => emitter.destroy());
    });
  }
}
