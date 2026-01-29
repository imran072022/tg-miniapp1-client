import Phaser from "phaser";
import BaseBoss from "./BaseBoss";

export default class PhantomBoss extends BaseBoss {
  constructor(scene, x, y) {
    super(scene, x, y, "boss3", 3, 500);
    this.setTint(0x00ffff);
    this.setScale(1.2);
    this.isRaged = false;
    this.hpBarOffset = -90; // hp bar position
    this.hitColor = 0xff4500; // sparkle color
    if (this.body) this.body.collideWorldBounds = false;
    // first fire+dash+sniper shot after reaching it's position
    scene.tweens.add({
      targets: this,
      y: 150,
      duration: 1200,
      ease: "Back.out",
      onComplete: () => {
        this.fireNova();
        this.startAttackPatterns();
        this.phantomDash();
      },
    });
    // the hitbox/sparkle alignment
    if (this.body) {
      this.body.setSize(this.width * 0.8, this.height * 0.3);
      this.body.setOffset(this.width * 0.1, 10);
      this.body.collideWorldBounds = false;
    }
  }

  upgradeAttacks() {
    // Check if novaTimer exists before resetting
    if (this.novaTimer) {
      this.novaTimer.reset({
        delay: 1500,
        callback: () => this.fireNova(),
        loop: true,
      });
    }

    // Check if dashTimer exists before resetting
    if (this.dashTimer) {
      this.dashTimer.reset({
        delay: 3000,
        callback: () => this.phantomDash(),
        loop: true,
      });
    }
  }

  startAttackPatterns() {
    this.novaTimer = this.scene.time.addEvent({
      delay: 2500,
      callback: () => this.fireNova(),
      loop: true,
    });
    this.dashTimer = this.scene.time.addEvent({
      delay: 5000,
      callback: () => this.phantomDash(),
      loop: true,
    });
  }

  fireNova() {
    if (!this.active || this.isDead) return;
    const executeWave = (angleOffset = 0) => {
      const bulletCount = 12;
      const spreadAngle = Math.PI * 0.45;
      const angleToPlayer =
        Phaser.Math.Angle.Between(
          this.x,
          this.y,
          this.scene.player.x,
          this.scene.player.y,
        ) + angleOffset;
      const startAngle = angleToPlayer - spreadAngle / 2;
      for (let i = 0; i < bulletCount; i++) {
        const t = i / (bulletCount - 1);
        const angle = startAngle + spreadAngle * t;
        const speed = Phaser.Math.Linear(260, 320, Math.abs(t - 0.5) * 2);
        this.createPlasmaShell(angle, speed);
      }
    };

    executeWave();
    if (this.isRaged) {
      this.scene.time.delayedCall(250, () => executeWave(0.15));
    }
  }

  createPlasmaShell(angle, speed) {
    const scene = this.scene; // Local reference to prevent 'undefined' errors
    const vx = Math.cos(angle) * speed;
    const vy = Math.sin(angle) * speed;

    const core = scene.add.circle(this.x, this.y, 6, 0xffffff).setDepth(15);
    scene.physics.add.existing(core);
    core.body.setVelocity(vx, vy);

    const shell = scene.add
      .circle(this.x, this.y, 11, 0x8f3cff, 0.35)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(14);

    const streak = scene.add
      .rectangle(this.x, this.y, 26, 3, 0xb084ff, 0.6)
      .setOrigin(1, 0.5)
      .setRotation(angle)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(13);

    const sync = () => {
      // Check if core is destroyed OR if the scene reference is lost
      if (!core.active || !scene) {
        scene.events.off("update", sync); // Safely remove the listener

        // Only run decay tween if the scene still exists
        if (scene) {
          scene.tweens.add({
            targets: [shell, streak],
            alpha: 0,
            duration: 180,
            onComplete: () => {
              shell.destroy();
              streak.destroy();
            },
          });
        }
        return;
      }
      shell.x = streak.x = core.x;
      shell.y = streak.y = core.y;
    };

    scene.events.on("update", sync);

    scene.physics.add.overlap(scene.player, core, () => {
      // Safe check: Only apply damage if the boss hasn't been destroyed
      if (this && this.active && !this.isDead) {
        core.destroy();
        scene.takeDamage(15);
      } else {
        core.destroy();
      }
    });

    scene.time.delayedCall(4000, () => {
      if (core.active) core.destroy();
    });
  }
  phantomDash() {
    if (this.isDead) return;
    const gameWidth = this.scene.scale.width;
    const minX = 125,
      maxX = gameWidth - 125;
    if (this.body) this.body.enable = false;
    this.scene.tweens.add({
      targets: this,
      alpha: 0.3,
      x: Phaser.Math.Between(minX, maxX),
      duration: 500,
      ease: "Sine.easeInOut",
      onComplete: () => {
        this.alpha = 1;
        if (this.body) {
          this.body.enable = true;
          this.body.reset(this.x, this.y);
        }
        this.chargeSniperEffect();
      },
    });
  }

  chargeSniperEffect() {
    const anchorX = this.x;
    const anchorY = this.y;
    const wingOffset = 90;
    const laserGfx = this.scene.add.graphics();

    const updateLasers = () => {
      if (!this.active || this.isDead) {
        laserGfx.destroy();
        this.scene.events.off("update", updateLasers);
        return;
      }

      // Laser turns Red if Raged, otherwise Cyan
      const laserColor = this.isRaged ? 0xff0000 : 0x00ffff;
      laserGfx.clear().lineStyle(2, laserColor, 0.5);

      laserGfx.lineBetween(
        this.x - wingOffset,
        this.y + 20,
        this.scene.player.x,
        this.scene.player.y,
      );
      laserGfx.lineBetween(
        this.x + wingOffset,
        this.y + 20,
        this.scene.player.x,
        this.scene.player.y,
      );

      if (this.isRaged) {
        laserGfx.lineBetween(
          this.x,
          this.y + 40,
          this.scene.player.x,
          this.scene.player.y,
        );
      }
    };

    this.scene.events.on("update", updateLasers);
    this.scene.time.delayedCall(800, () => {
      laserGfx.destroy();
      this.scene.events.off("update", updateLasers);
      this.fireTripleSniper(anchorX, anchorY, wingOffset);
    });
  }
  fireTripleSniper(x, y, offset) {
    if (!this.active || this.isDead) return;
    this.createSniperBeam(x - offset, y + 20);
    this.createSniperBeam(x + offset, y + 20);
    if (this.isRaged) this.createSniperBeam(x, y + 40); // RAGED: Center shot
  }
  createSniperBeam(startX, startY) {
    const scene = this.scene;
    const beamColor = this.isRaged ? 0xff0000 : 0x00ffff;

    const core = scene.add
      .circle(startX, startY, 7, 0xffffff)
      .setDepth(15)
      .setBlendMode(Phaser.BlendModes.ADD);
    scene.physics.add.existing(core);

    const coreGlow = scene.add
      .circle(startX, startY, 15, beamColor, 0.4)
      .setDepth(14)
      .setBlendMode(Phaser.BlendModes.ADD);

    const angle = Phaser.Math.Angle.Between(
      startX,
      startY,
      scene.player.x,
      scene.player.y,
    );
    core.body.setVelocity(Math.cos(angle) * 1200, Math.sin(angle) * 1200);

    const sync = () => {
      if (!core.active || !scene) {
        scene.events.off("update", sync);
        if (scene) coreGlow.destroy();
        return;
      }
      coreGlow.x = core.x;
      coreGlow.y = core.y;

      // Smoky Effect: Spawn small fading particles
      const particle = scene.add
        .circle(core.x, core.y, 6, beamColor, 0.3)
        .setDepth(13);
      scene.tweens.add({
        targets: particle,
        scale: 2,
        alpha: 0,
        duration: 400,
        onComplete: () => particle.destroy(),
      });
    };

    scene.events.on("update", sync);

    scene.physics.add.overlap(scene.player, core, () => {
      if (this && this.active && !this.isDead) {
        core.destroy();
        // Damage logic: 25 base, 50 if Raged
        scene.takeDamage(this.isRaged ? 50 : 25);
      } else {
        core.destroy();
      }
    });

    scene.time.delayedCall(1500, () => {
      if (core.active) core.destroy();
    });
  }
  onRage() {
    // turn sparkle color into magenta
    this.setTint(0xff00ff);
    // 2. Boss-only Effect: Scaling Pulse
    this.scene.tweens.add({
      targets: this,
      scale: 1.4, // Get slightly bigger
      duration: 200,
      yoyo: true,
      repeat: 2, // "Heartbeat" pulse
      ease: "Quad.easeInOut",
    });

    // 3. Boss-only Effect: Permanent Glow/Blink
    this.scene.tweens.add({
      targets: this,
      alpha: 0.6,
      duration: 100,
      yoyo: true,
      repeat: -1, // Constant blinking indicates danger
    });

    // Show the text once (from previous step)
    const warning = this.scene.add
      .text(this.x, this.y - 100, "WARNING: SNIPER DAMAGE x2", {
        fontSize: "24px",
        fill: "#ff0000",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 6,
      })
      .setOrigin(0.5)
      .setDepth(200);

    this.scene.tweens.add({
      targets: warning,
      y: this.y - 200,
      alpha: 0,
      duration: 2000,
      onComplete: () => warning.destroy(),
    });

    if (this.upgradeAttacks) this.upgradeAttacks();
  }
  die() {
    if (this.isDead) return;
    this.isDead = true;

    // 1. INSTANT DISAPPEARANCE
    this.setVisible(false); // Makes the sprite invisible instantly
    this.setAlpha(0); // Extra safety
    if (this.body) {
      this.body.enable = false; // Stops all physics/collisions immediately
    }

    // 2. Stop UI & Timers
    if (this.hpBar) this.hpBar.destroy();
    if (this.novaTimer) this.novaTimer.remove();
    if (this.dashTimer) this.dashTimer.remove();

    // 3. Trigger the shatter now that the body is gone
    this.createShatterEffect();

    // 4. Cleanup
    this.scene.time.delayedCall(1500, () => {
      this.scene.events.emit("BOSS_DEFEATED");
      this.destroy();
    });
  }

  createShatterEffect() {
    const shardCount = 15;
    const color = this.isRaged ? 0xff00ff : 0x00ffff;
    const scene = this.scene;
    scene.physics.world.timeScale = 2.0; // Slow down physics
    scene.time.delayedCall(500, () => {
      if (scene.physics.world) scene.physics.world.timeScale = 1.0; // Return to normal
    });
    for (let i = 0; i < shardCount; i++) {
      const shard = scene.add
        .rectangle(this.x, this.y, 10, 10, color)
        .setDepth(100)
        .setRotation(Phaser.Math.FloatBetween(0, Math.PI * 2));

      scene.physics.add.existing(shard);

      const angle = ((Math.PI * 2) / shardCount) * i;
      const speed = Phaser.Math.Between(400, 700);

      shard.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
      shard.body.setAngularVelocity(Phaser.Math.Between(-300, 300));
      shard.body.setCollideWorldBounds(true);
      shard.body.setBounce(0.8);

      // Trail logic: leave "smoke" behind
      const trailSync = () => {
        if (!shard.active || !scene) {
          scene.events.off("update", trailSync);
          return;
        }

        const smoke = scene.add
          .circle(shard.x, shard.y, 4, color, 0.4)
          .setDepth(99);
        scene.tweens.add({
          targets: smoke,
          alpha: 0,
          scale: 0.2,
          duration: 300,
          onComplete: () => smoke.destroy(),
        });
      };
      scene.events.on("update", trailSync);

      scene.physics.add.overlap(scene.player, shard, () => {
        scene.takeDamage(10);
        shard.destroy();
      });

      scene.tweens.add({
        targets: shard,
        alpha: 0,
        scale: 0.1,
        delay: 800,
        duration: 600,
        onComplete: () => {
          shard.destroy();
          scene.events.off("update", trailSync); // Cleanup the specific listener
        },
      });
    }

    scene.cameras.main.shake(300, 0.04);
  }
}
