import Phaser from "phaser";
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
    this.ultGainRate = 1.5; // Default: each hit gives 1.5% charge
  }

  fire(time) {
    const muzzlePositions = [
      { x: -15, y: -5 },
      { x: 0, y: -47 },
      { x: 15, y: -5 },
    ];
    muzzlePositions.forEach((pos) => {
      // 1. Create the Bullet at the specific x and y
      const bullet = new Projectile(
        this.scene,
        this.x + pos.x,
        this.y + pos.y,
        "energy_bullet",
        this,
      );
      this.scene.bullets.add(bullet);
      bullet.body.velocity.y = this.bulletVel;
      // 2. Visuals
      bullet.setDisplaySize(8, 45);
      bullet.setTint(0x00ffff, 0xffffff, 0x00aaff, 0xffffff);
      this.addVanguardTrail(bullet);
      // 3. Trigger Muzzle Flash at that EXACT same spot
      this.triggerMuzzleFlash(pos.x, pos.y);
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
        const missile = new Projectile(
          this.scene,
          this.x + xOff,
          this.y,
          "energy_bullet",
          this,
        );
        this.scene.bullets.add(missile);
        missile.isMissile = true;
        missile.setTint(0xcccccc);
        missile.setDisplaySize(10, 30);
        missile.body.setVelocityY(-150);
        this.addRealMissileTrail(missile);
        this.runMissileAI(missile, target);
      });
    });

    this.ultCharge = 0;
    this.isUltReady = false;
  }
  runMissileAI(missile, target) {
    let currentTarget = target; // Start with the assigned target

    this.scene.time.addEvent({
      delay: 16,
      repeat: 240, // Increased duration to 4s to give it time to find new targets
      callback: () => {
        if (!missile.active) return;

        // 1. If current target is gone/dead, try to find a new one
        if (!currentTarget || !currentTarget.active || currentTarget.isDead) {
          currentTarget = this.getNearestEnemy();
          if (currentTarget) this.createLockOn(currentTarget); // Show new lock-on
        }

        if (missile.y < 50) {
          if (currentTarget) currentTarget.missileCount--; // Target is safe from THIS missile
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
          // No enemies left at all? Just cruise up
          missile.body.setVelocityY(-600);
        }
      },
    });
  }
  getNearestEnemy() {
    const enemies = this.scene.enemies.getChildren().filter(
      (e) => e.active && !e.isDead && e.y < this.scene.scale.height - 100, // Don't target enemies about to leave the bottom
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

    // 1. If we have a target, curve toward it
    if (target && target.active) {
      const angle = Phaser.Math.Angle.Between(
        missile.x,
        missile.y,
        target.x,
        target.y,
      );
      // Gradually rotate missile toward target (Homing effect)
      missile.rotation = Phaser.Math.Angle.RotateTo(
        missile.rotation,
        angle + Math.PI / 2,
        0.1,
      );

      // Move in the direction of the rotation
      this.scene.physics.velocityFromRotation(
        missile.rotation - Math.PI / 2,
        800,
        missile.body.velocity,
      );
    }
    // 2. Airburst Logic: If missile gets too close to the top, explode!
    else if (missile.y < 100) {
      this.triggerMissileExplosion(missile.x, missile.y);
      missile.destroy();
    }
  }
  addRealMissileTrail(missile) {
    // 1. DENSE LINGERING SMOKE (Stays for 1.5s)
    const smoke = this.scene.add.particles(0, 0, "flash", {
      follow: missile,
      scale: { start: 1.2, end: 0 }, // Wider smoke
      alpha: { start: 0.7, end: 0 },
      lifespan: 1500, // Stay for 1.5 seconds
      frequency: 10, // High density
      tint: 0x888888,
      blendMode: "NORMAL",
    });

    // 2. ENGINE FIRE (Brighter)
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

    // 1. Create the Visual "Blast"
    const exp = this.scene.add
      .sprite(x, y, "flash")
      .setTint(0xffaa00) // Orange-Yellow for visibility
      .setAlpha(1)
      .setScale(0.1)
      .setDepth(3000); // Ensure it is on top of everything

    this.scene.tweens.add({
      targets: exp,
      scale: 6, // Made it much larger
      alpha: 0, // Fade out
      duration: 500, // Lasts exactly 0.5 seconds
      ease: "Cubic.easeOut",
      onComplete: () => exp.destroy(),
    });

    // 2. Add an optional "Shockwave" ring
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
    // If the enemy doesn't have a tracker yet, give it one
    if (target.missileCount === undefined) target.missileCount = 0;
    target.missileCount++;

    // Only create the visual circle if it's the FIRST missile locking on
    if (target.lockGraphic) return;

    const lock = this.scene.add.graphics();
    lock.lineStyle(2, 0xff0000, 1);
    lock.strokeCircle(0, 0, 30);
    // Draw crosshairs
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
    target.lockGraphic = lock; // Attach the visual to the enemy object

    // Follow logic
    const updateEvent = this.scene.time.addEvent({
      delay: 16,
      loop: true,
      callback: () => {
        // Destroy the circle if:
        // 1. The enemy is dead/inactive
        // 2. OR no more missiles are chasing it (missileCount <= 0)
        if (!target.active || target.isDead || target.missileCount <= 0) {
          if (target.lockGraphic) target.lockGraphic.destroy();
          target.lockGraphic = null;
          target.missileCount = 0;
          updateEvent.destroy();
        } else {
          target.lockGraphic.x = target.x;
          target.lockGraphic.y = target.y;
          target.lockGraphic.angle += 1; // slow rotation
        }
      },
    });
  }
}
