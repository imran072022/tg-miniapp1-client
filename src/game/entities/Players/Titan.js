import BasePlayer from "./BasePlayer";

export default class Titan extends BasePlayer {
  constructor(scene, x, y) {
    super(scene, x, y, "spaceship1", {
      hp: 10000,
      fireRate: 180,
      bVel: -800,
      bScale: 0.8,
      scale: 0.1,
    });
  }

  fire(time) {
    this.setTint(0xffffff);
    this.scene.time.delayedCall(40, () => {
      if (this.active) this.setTint(0xffcc66);
    });

    const spawnShot = (xOff, vXOff) => {
      // 1. USE THE GROUP directly instead of the deleted file
      const bullet = this.scene.bullets.create(
        this.x + xOff,
        this.y - 30,
        "base-rounded-bullet",
      );

      if (bullet) {
        // 2. Setup Physics (replaces what Projectile.js used to do)
        bullet.body.allowGravity = false;
        bullet.setDepth(5);
        bullet.body.velocity.y = this.bulletVel;
        bullet.body.velocity.x = vXOff;

        // 3. Keep your exact design
        bullet.setDisplaySize(14, 40);
        bullet.setTint(0xffffff, 0xffffff, 0xffaa00, 0xffaa00);

        this.addTitanTrail(bullet);
      }
    };

    const nozzles = [-20, -10, 10, 20];
    const angles = [-160, 0, 0, 160];

    nozzles.forEach((xPos, index) => {
      spawnShot(xPos, angles[index]);
      this.triggerMuzzleFlash(xPos);
    });
  }

  // ... triggerMuzzleFlash remains the same ...
  triggerMuzzleFlash(xOff) {
    const flash = this.scene.add
      .sprite(this.x + xOff, this.y - 35, "flash")
      .setDepth(11)
      .setScale(0.5)
      .setBlendMode("ADD")
      .setTint(0xffffff);

    this.scene.tweens.add({
      targets: flash,
      scale: 1.2,
      alpha: 0,
      duration: 50,
      onComplete: () => flash.destroy(),
    });
  }

  // ... addTitanTrail remains the same ...
  addTitanTrail(bullet) {
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
