import BasePlayer from "./BasePlayer";
import Projectile from "../../abilities/Projectiles";

export default class Vanguard extends BasePlayer {
  constructor(scene, x, y) {
    super(scene, x, y, "plane", {
      hp: 10000, // From your config
      fireRate: 250,
      bVel: -600,
      bScale: 0.6,
      scale: 0.15,
    });
  }

  fire(time) {
    const bullet = new Projectile(
      this.scene,
      this.x,
      this.y - 30,
      "energy_bullet",
      this,
    );

    this.scene.bullets.add(bullet);
    bullet.body.velocity.y = this.bulletVel;

    this.triggerMuzzleFlash(0);
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
