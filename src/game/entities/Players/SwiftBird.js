import Phaser from "phaser";
import Projectile from "../../abilities/Projectiles";
import BasePlayer from "./BasePlayer";

export default class SwiftBird extends BasePlayer {
  constructor(scene, x, y) {
    super(scene, x, y, "player3", {
      hp: 200,
      fireRate: 120,
      bVel: -900,
      bScale: 0.4,
      scale: 1.5,
    });

    // Match BasePlayer's stats
    this.isDamaged = false;
    // Setup Flash Pool
    this.flashPool = this.scene.add.group({
      defaultKey: "flash",
      maxSize: 30,
    });

    // Visual Styling
    this.setTint(0xffd9ff);

    // Initial Visuals
    this.createThruster(scene, -22, 25);
    this.createThruster(scene, 22, 25);
  }

  // Helper: Create Thruster Particles
  createThruster(scene, xOff, yOff) {
    scene.add.particles(0, 0, "energy_bullet", {
      follow: this,
      followOffset: { x: xOff, y: yOff },
      speedY: { min: 120, max: 220 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 0.7, end: 0 },
      lifespan: 350,
      blendMode: "ADD",
      tint: 0xff00ff,
      frequency: 12,
    });
  }

  fire(time) {
    if (!this.active) return;

    const actualNozzles = [-22, 22];
    actualNozzles.forEach((nozzleX) => {
      // 1. Charge Effect
      const charge = this.scene.add
        .sprite(this.x + nozzleX, this.y - 15, "energy_bullet")
        .setTint(0xffffff)
        .setBlendMode("ADD")
        .setScale(0.8);

      this.scene.tweens.add({
        targets: charge,
        scale: 0,
        alpha: 0,
        duration: 60,
        onComplete: () => charge.destroy(),
      });

      // 2. Dual Bullets
      [-4, 4].forEach((subOff) => {
        const bullet = new Projectile(
          this.scene,
          this.x + nozzleX + subOff,
          this.y - 10,
          "energy_bullet",
          this,
        );
        this.scene.bullets.add(bullet);
        bullet.body.velocity.y = this.bulletVel;
        bullet
          .setTint(0xffffff, 0xff00ff, 0xff00ff, 0xffffff)
          .setBlendMode("ADD");
        bullet.setScale(0.3, 2);
        this.applyPinkGlow(bullet);
      });

      this.triggerMuzzleFlash(nozzleX);
    });

    // 3. Subtle Recoil & Camera Shake
    this.scene.tweens.killTweensOf(this);
    const originalY = this.y;
    this.y += 2;
    this.scene.tweens.add({
      targets: this,
      y: originalY,
      duration: 80,
      ease: "Cubic.easeOut",
    });

    this.scene.cameras.main.shake(30, 0.0007);
  }

  triggerMuzzleFlash(xOff) {
    const flash = this.flashPool.get(this.x + xOff, this.y - 30);
    if (!flash) return;
    flash
      .setActive(true)
      .setVisible(true)
      .setAlpha(1)
      .setDepth(11)
      .setTint(0xffffff);
    flash
      .setScale(Phaser.Math.FloatBetween(0.4, 0.7))
      .setAngle(Phaser.Math.Between(0, 360));
    this.scene.tweens.add({
      targets: flash,
      alpha: 0,
      duration: 40,
      onComplete: () => this.flashPool.killAndHide(flash),
    });
  }

  applyPinkGlow(bullet) {
    const emitter = this.scene.add.particles(0, 0, bullet.texture.key, {
      follow: bullet,
      scale: { start: 0.8, end: 0 },
      alpha: { start: 0.6, end: 0 },
      lifespan: 150,
      blendMode: "ADD",
      tint: 0xff00ff,
      frequency: 10,
    });
    bullet.once("destroy", () => {
      emitter.stop();
      this.scene.time.delayedCall(150, () => emitter.destroy());
    });
  }

  // Updated takeDamage in SwiftBird.js
  takeDamage(amount) {
    // 1. Call the BasePlayer logic to update the Top-Left bar and check for death
    super.takeDamage(amount);

    // 2. Keep SwiftBird's unique visual effects
    this.setTint(0xffffff);
    this.scene.time.delayedCall(50, () => {
      if (this.active) this.setTint(0xffd9ff);
    });

    // 3. Keep the smoking effect logic
    if (this.hp <= 240 && !this.isDamaged) {
      this.isDamaged = true;
      this.startDamageEffects();
    }
  }

  // Updated preUpdate in SwiftBird.js
  preUpdate(time, delta) {
    super.preUpdate(time, delta); // BasePlayer now handles updateHPBar()
  }

  startDamageEffects() {
    this.damageEmitter = this.scene.add.particles(0, 0, "energy_bullet", {
      follow: this,
      followOffset: { x: 0, y: 20 },
      scale: { start: 0.5, end: 1.2 },
      alpha: { start: 0.5, end: 0 },
      lifespan: 800,
      speedY: { min: 50, max: 100 },
      rotate: { min: 0, max: 360 },
      tint: 0x222222,
      blendMode: "NORMAL",
      frequency: 40,
    });
  }

  die() {
    this.hpBar.clear();
    this.body.enable = false;
    if (this.damageEmitter) this.damageEmitter.stop();
    this.scene.tweens.add({
      targets: this,
      angle: 720,
      scale: 0,
      alpha: 0,
      duration: 800,
      onStart: () => this.createFinalExplosion(),
      onComplete: () => this.destroy(),
    });
  }

  createFinalExplosion() {
    this.scene.add.particles(this.x, this.y, "flash", {
      speed: { min: -100, max: 100 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      blendMode: "ADD",
      lifespan: 600,
      gravityY: 200,
      quantity: 30,
    });
  }
}
