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
    const spawnShot = (xOff, vXOff) => {
      const bullet = new Projectile(
        this.scene,
        this.x + xOff,
        this.y - 30,
        "energy_bullet",
        this,
      );
      this.scene.bullets.add(bullet);
      // Control physics directly here so it never breaks
      bullet.body.velocity.y = this.bulletVel;
      bullet.body.velocity.x = vXOff;
      bullet.setTint(0xffaa00);
      this.addTitanTrail(bullet);
    };
    spawnShot(-15, 0);
    spawnShot(15, 0);
    spawnShot(-20, -150);
    spawnShot(20, 150);
    this.triggerMuzzleFlash(0);
  }

  addTitanTrail(bullet) {
    const emitter = this.scene.add.particles(0, 0, bullet.texture.key, {
      speed: { min: 10, max: 50 },
      scale: { start: 0.4, end: 0 },
      alpha: { start: 0.5, end: 0 },
      lifespan: 300,
      gravityY: 400,
      blendMode: "ADD",
      follow: bullet,
      tint: 0xffaa00,
    });
    bullet.once("destroy", () => {
      emitter.stop();
      this.scene.time.delayedCall(300, () => emitter.destroy());
    });
  }

  triggerMuzzleFlash(xOff) {
    const flash = this.scene.add
      .sprite(this.x + xOff, this.y - 45, "flash")
      .setDepth(11)
      .setScale(0.8);
    this.scene.tweens.add({
      targets: flash,
      scale: 1.2,
      alpha: 0,
      duration: 50,
      onComplete: () => flash.destroy(),
    });
  }
}
