import Phaser from "phaser";
import BasePlayer from "./BasePlayer";

export default class Vanguard extends BasePlayer {
  constructor(scene, x, y) {
    super(scene, x, y, "vanguard", {
      hp: 60000,
      fireRate: 200,
      bVel: -750,
      bScale: 0.5,
      scale: 1.0,
    });
    this.ultCharge = 0;
    this.maxUltCharge = 100;
    this.isUltReady = false;
    this.ultGainRate = 1.5; // Default: each hit gives 1.5% charge
  }

  fire(time) {
    const muzzlePositions = [
      { x: -15, y: -5 },
      { x: 0, y: -47 },
      { x: 15, y: -5 },
    ];
    muzzlePositions.forEach((pos) => {
      // FIXED: Use bullets.create instead of new Projectile
      const bullet = this.scene.bullets.create(
        this.x + pos.x,
        this.y + pos.y,
        "base-rounded-bullet",
      );

      if (bullet) {
        // Re-adding essential physics settings previously in Projectile.js
        bullet.body.allowGravity = false;
        bullet.setDepth(5);

        bullet.body.velocity.y = this.bulletVel;
        // Visuals
        bullet.setDisplaySize(8, 45);
        bullet.setTint(0x00ffff, 0xffffff, 0x00aaff, 0xffffff);
        this.addVanguardTrail(bullet);
        // Trigger Muzzle Flash
        this.triggerMuzzleFlash(pos.x, pos.y);
      }
    });
  }

  addVanguardTrail(bullet) {
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

  triggerMuzzleFlash(xOff, yOff) {
    const flash = this.scene.add
      .sprite(this.x + xOff, this.y + yOff, "flash")
      .setDepth(11)
      .setScale(1.0)
      .setBlendMode("ADD")
      .setTint(0x00ffff);
    this.scene.tweens.add({
      targets: flash,
      scale: 1.4,
      alpha: 0,
      duration: 50,
      onComplete: () => flash.destroy(),
    });
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
  }

  //============ Super attack - Missile ===============
  launchSuper() {
    if (!this.isUltReady) return;
    const target = this.getNearestEnemy();
    if (target) this.createLockOn(target);
    const wingOffsets = [-60, -40, -20, 20, 40, 60];
    wingOffsets.forEach((xOff, index) => {
      this.scene.time.delayedCall(index * 120, () => {
        if (!this.active) return;
        // Re-scan for the nearest enemy for EACH missile launch
        const target = this.getNearestEnemy();
        if (target) this.createLockOn(target);

        // FIXED: Use bullets.create instead of new Projectile
        const missile = this.scene.bullets.create(
          this.x + xOff,
          this.y,
          "base-rounded-bullet",
        );

        if (missile) {
          // Re-adding essential physics settings previously in Projectile.js
          missile.body.allowGravity = false;
          missile.setDepth(5);

          missile.isMissile = true;
          missile.setTint(0xcccccc);
          missile.setDisplaySize(10, 30);
          missile.body.setVelocityY(-150);
          this.addRealMissileTrail(missile);
          this.runMissileAI(missile, target);
        }
      });
    });

    this.ultCharge = 0;
    this.isUltReady = false;
  }

  runMissileAI(missile, target) {
    let currentTarget = target; // Start with the assigned target

    this.scene.time.addEvent({
      delay: 16,
      repeat: 240, // Increased duration to 4s
      callback: () => {
        if (!missile.active) return;

        // 1. If current target is gone/dead, try to find a new one
        if (!currentTarget || !currentTarget.active || currentTarget.isDead) {
          currentTarget = this.getNearestEnemy();
          if (currentTarget) this.createLockOn(currentTarget);
        }

        if (missile.y < 50) {
          if (currentTarget) currentTarget.missileCount--;
          this.triggerMissileExplosion(missile.x, missile.y);
          missile.destroy();
          return;
        }

        // 3. Homing Physics
        if (currentTarget && currentTarget.active) {
          const angle = Phaser.Math.Angle.Between(
            missile.x,
            missile.y,
            currentTarget.x,
            currentTarget.y,
          );
          missile.rotation = Phaser.Math.Angle.RotateTo(
            missile.rotation,
            angle + Math.PI / 2,
            0.1,
          );

          // Speed boost
          const currentSpeed = Math.abs(missile.body.velocity.y) + 18;
          this.scene.physics.velocityFromRotation(
            missile.rotation - Math.PI / 2,
            Math.min(currentSpeed, 900),
            missile.body.velocity,
          );
        } else {
          // No enemies left? Just cruise up
          missile.body.setVelocityY(-600);
        }
      },
    });
  }

  getNearestEnemy() {
    const enemies = this.scene.enemies
      .getChildren()
      .filter(
        (e) => e.active && !e.isDead && e.y < this.scene.scale.height - 100,
      );

    if (enemies.length === 0) return null;

    let closest = null;
    let minDist = Infinity;

    enemies.forEach((enemy) => {
      const dist = Phaser.Math.Distance.Between(
        this.x,
        this.y,
        enemy.x,
        enemy.y,
      );
      if (dist < minDist) {
        minDist = dist;
        closest = enemy;
      }
    });
    return closest;
  }

  updateMissile(missile, target) {
    if (!missile.active) return;

    if (target && target.active) {
      const angle = Phaser.Math.Angle.Between(
        missile.x,
        missile.y,
        target.x,
        target.y,
      );
      missile.rotation = Phaser.Math.Angle.RotateTo(
        missile.rotation,
        angle + Math.PI / 2,
        0.1,
      );

      this.scene.physics.velocityFromRotation(
        missile.rotation - Math.PI / 2,
        800,
        missile.body.velocity,
      );
    } else if (missile.y < 100) {
      this.triggerMissileExplosion(missile.x, missile.y);
      missile.destroy();
    }
  }

  addRealMissileTrail(missile) {
    const smoke = this.scene.add.particles(0, 0, "flash", {
      follow: missile,
      scale: { start: 1.2, end: 0 },
      alpha: { start: 0.7, end: 0 },
      lifespan: 1500,
      frequency: 10,
      tint: 0x888888,
      blendMode: "NORMAL",
    });

    const fire = this.scene.add.particles(0, 0, "flash", {
      follow: missile,
      followOffset: { y: 20 },
      scale: { start: 0.6, end: 0 },
      alpha: { start: 1, end: 0 },
      lifespan: 200,
      frequency: 5,
      tint: 0xff4400,
      blendMode: "ADD",
    });

    missile.once("destroy", () => {
      smoke.stop();
      fire.stop();
      this.scene.time.delayedCall(1500, () => {
        smoke.destroy();
        fire.destroy();
      });
    });
  }

  triggerMissileExplosion(x, y) {
    this.scene.cameras.main.shake(200, 0.01);
    const exp = this.scene.add
      .sprite(x, y, "flash")
      .setTint(0xffaa00)
      .setAlpha(1)
      .setScale(0.1)
      .setDepth(3000);

    this.scene.tweens.add({
      targets: exp,
      scale: 6,
      alpha: 0,
      duration: 500,
      ease: "Cubic.easeOut",
      onComplete: () => exp.destroy(),
    });

    const ring = this.scene.add.graphics();
    ring.lineStyle(4, 0xffffff, 0.5);
    ring.strokeCircle(x, y, 10);

    this.scene.tweens.add({
      targets: ring,
      scale: 10,
      alpha: 0,
      duration: 600,
      onComplete: () => ring.destroy(),
    });
  }

  createLockOn(target) {
    if (!target) return;
    if (target.missileCount === undefined) target.missileCount = 0;
    target.missileCount++;

    if (target.lockGraphic) return;

    const lock = this.scene.add.graphics();
    lock.lineStyle(2, 0xff0000, 1);
    lock.strokeCircle(0, 0, 30);
    for (let i = 0; i < 4; i++) {
      const angle = Phaser.Math.DegToRad(i * 90);
      lock.lineBetween(
        Math.cos(angle) * 25,
        Math.sin(angle) * 25,
        Math.cos(angle) * 35,
        Math.sin(angle) * 35,
      );
    }
    lock.setDepth(2000);
    target.lockGraphic = lock;

    const updateEvent = this.scene.time.addEvent({
      delay: 16,
      loop: true,
      callback: () => {
        if (!target.active || target.isDead || target.missileCount <= 0) {
          if (target.lockGraphic) target.lockGraphic.destroy();
          target.lockGraphic = null;
          target.missileCount = 0;
          updateEvent.destroy();
        } else {
          target.lockGraphic.x = target.x;
          target.lockGraphic.y = target.y;
          target.lockGraphic.angle += 1;
        }
      },
    });
  }
}
