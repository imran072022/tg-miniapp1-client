import Phaser from "phaser";
import BaseBoss from "./BaseBoss.js";

export default class EnergyCoreBoss extends BaseBoss {
  constructor(scene, x, y) {
    // Level 4, HP 800 (or whatever you prefer)
    super(scene, x, -250, "boss4", 4, 800);

    this.setTint(0xffffff); // Core is white/energy themed
    this.setScale(1.4);
    this.hpBarOffset = -120; // boss4 is taller (237px), so move bar up
    this.hitColor = 0x00ffff; // Cyan sparkles for energy hits
    // Add this in your constructor
    // Adjust these numbers (60, 40) so they align with your "X" pipes
    this.pipeTopLeft = { x: -60, y: -40 };
    this.pipeTopRight = { x: 60, y: -40 };
    this.pipeBotLeft = { x: -60, y: 40 };
    this.pipeBotRight = { x: 60, y: 40 };
    // 1. Entrance Tween (Matches your Level 3 style)
    scene.tweens.add({
      targets: this,
      y: 150, // Move down to visible screen
      duration: 2000,
      ease: "Cubic.out",
      onComplete: () => {
        this.isEntering = false;
        this.startAttackPatterns();
      },
    });

    // 2. Physics Body alignment (Tailored for boss4: 190x237)
    if (this.body) {
      // We want the hit zone to be the central core
      this.body.setSize(this.width * 0.7, this.height * 0.7);
      this.body.setOffset(this.width * 0.15, this.height * 0.15);
      this.body.setImmovable(true);
      this.body.setAllowGravity(false);
    }

    this.initEnergyFires();
    this.initCore();
  }

  startAttackPatterns() {
    console.log("Energy Core Active - Pattern Start");
    this.startInfernoCycle(); // <--- Add this to start the 8s timer!
  }
  initCore() {
    // Create the sprites at the boss's current position
    this.coreBall = this.scene.add.sprite(this.x, this.y, "fire_particle");
    this.coreBall
      .setTint(0xffffff)
      .setScale(2.5)
      .setDepth(150)
      .setBlendMode("ADD");

    this.coreGlow = this.scene.add.sprite(this.x, this.y, "fire_particle");
    this.coreGlow
      .setTint(0xffffff)
      .setScale(4.5)
      .setAlpha(0.6)
      .setDepth(149)
      .setBlendMode("ADD");

    // This is the "Idle" pulse - keep it subtle
    this.coreTween = this.scene.tweens.add({
      targets: [this.coreBall, this.coreGlow],
      scale: "*=1.1",
      duration: 1000,
      yoyo: true,
      repeat: -1,
    });
  }
  fireInfernoBeam() {
    const player = this.scene.player;
    if (!player) return;

    // 1. Calculate the angle to the player
    // This "locks" the direction at the moment of firing
    const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
    const beamLength = 1500;
    const beamWidth = 80;

    // 2. Create the Purple Outer Beam (using a Rectangle)
    // We rotate it to face the player
    const beam = this.scene.add.rectangle(
      this.x,
      this.y,
      beamWidth,
      beamLength,
      0xbf00ff,
      0.8,
    );
    beam.setOrigin(0.5, 0); // Origin at the top center so it grows FROM the boss
    beam.setRotation(angle - Math.PI / 2); // Adjust rotation because rectangles are vertical by default
    beam.setDepth(140);
    beam.setBlendMode("ADD");

    // 3. The White Inner Core
    const core = this.scene.add.rectangle(
      this.x,
      this.y,
      beamWidth * 0.4,
      beamLength,
      0xffffff,
      0.9,
    );
    core.setOrigin(0.5, 0);
    core.setRotation(angle - Math.PI / 2);
    core.setDepth(141);
    core.setBlendMode("ADD");

    // 4. Impact Effects
    this.scene.cameras.main.shake(400, 0.01);

    // 5. Animation (The beam "punches" out and fades)
    this.scene.tweens.add({
      targets: [beam, core],
      width: 0,
      alpha: 0,
      duration: 1000,
      ease: "Expo.out",
      onComplete: () => {
        beam.destroy();
        core.destroy();
      },
    });

    // 6. Targeted Collision Logic
    // We check if the player's current position is within the beam's "slice" of the circle
    const playerAngle = Phaser.Math.Angle.Between(
      this.x,
      this.y,
      player.x,
      player.y,
    );
    const angleDiff = Math.abs(Phaser.Math.Angle.Wrap(angle - playerAngle));

    if (angleDiff < 0.1) {
      // 0.1 radians is roughly the width of the beam
      if (player.takeDamage) player.takeDamage(50);
    }
  }
  startInfernoCycle() {
    this.coreGlow.setTint(0xffffff);
    this.isCharging = true;
    this.deployTurrets(); // deploy turrets
    this.scene.tweens.addCounter({
      from: 0,
      to: 100,
      duration: 8000,
      onUpdate: (tween) => {
        const v = tween.getValue();

        // Color transition
        const color = Phaser.Display.Color.Interpolate.ColorWithColor(
          Phaser.Display.Color.ValueToColor(0xffffff),
          Phaser.Display.Color.ValueToColor(0xbf00ff),
          100,
          v,
        );
        this.coreGlow.setTint(
          Phaser.Display.Color.GetColor(color.r, color.g, color.b),
        );

        // Start Swarm at 75% charge (6 seconds in)
        if (v > 75) {
          this.isShaking = true;
          this.coreGlow.setScale(4.5 + Math.random() * 1.5);

          if (!this.swarmEmitter) {
            this.swarmEmitter = this.scene.add.particles(
              0,
              0,
              "fire_particle",
              {
                scale: { start: 0.5, end: 0 },
                alpha: { start: 0.8, end: 0 },
                lifespan: 600,
                blendMode: "ADD",
                tint: 0x9400d3, // Match your Purple engine color
                frequency: 50, // Drops a spark every 50ms
              },
            );
            this.swarmEmitter.setDepth(2000);
          }

          // SWARM LOGIC: Particles spawn in a circle around the player and move IN
          const px = this.scene.player.x;
          const py = this.scene.player.y;
          const angle = Math.random() * Math.PI * 2;
          const distance = 80; // Spawn distance from player

          const spawnX = px + Math.cos(angle) * distance;
          const spawnY = py + Math.sin(angle) * distance;

          this.swarmEmitter.emitParticleAt(spawnX, spawnY);
        }
      },
      onComplete: () => {
        this.isShaking = false;
        this.isCharging = false;

        if (this.swarmEmitter) {
          this.swarmEmitter.destroy();
          this.swarmEmitter = null;
        }

        this.fireInfernoBeam();
        this.scene.time.delayedCall(2000, () => this.startInfernoCycle());
      },
    });
  }
  initEnergyFires() {
    if (!this.scene.textures.exists("fire_particle")) {
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 32;
      const ctx = canvas.getContext("2d");
      const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
      gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 32, 32);
      this.scene.textures.addCanvas("fire_particle", canvas);
    }
    this.engineFires = [];

    const engines = [
      { x: 0, y: -62, angle: 270, life: 700, col: 0xdc143c, scale: 1.0 },
      { x: 2, y: 52, angle: 90, life: 700, col: 0xdc143c, scale: 1.0 },
      { x: -70, y: -5, angle: 180, life: 300, col: 0x9400d3, scale: 1.0 },
      { x: 72, y: -5, angle: 0, life: 300, col: 0xff00ff, scale: 1.0 },
    ];

    engines.forEach((config) => {
      // Outer Glow - Increased start scale by 20% (0.8 -> 1.0)
      this.scene.add.particles(0, 0, "fire_particle", {
        speed: { min: 100, max: 200 },
        angle: config.angle,
        scale: { start: config.scale, end: 0.2 },
        alpha: { start: 0.5, end: 0 },
        lifespan: config.life,
        blendMode: "ADD",
        tint: config.col,
        follow: this,
        followOffset: { x: config.x, y: config.y },
      });

      // 2. Create the White-Hot Internal Core
      this.scene.add.particles(0, 0, "fire_particle", {
        speed: { min: 250, max: 350 },
        angle: config.angle,
        scale: { start: config.scale * 0.5, end: 0 },
        lifespan: config.life * 0.5,
        blendMode: "ADD",
        tint: 0xffffff,
        follow: this,
        followOffset: { x: config.x, y: config.y },
      });
    });
  }
  drawLightning() {
    if (!this.lightningGraphics) {
      this.lightningGraphics = this.scene.add.graphics();
      this.lightningGraphics.setDepth(160);
    }

    this.lightningGraphics.clear();
    this.lightningGraphics.lineStyle(2, 0xffffff, 0.8);

    // 4 points for the 4 engines (approximate based on your offsets)
    const engineOffsets = [
      { x: 0, y: -62 },
      { x: 2, y: 52 },
      { x: -70, y: -5 },
      { x: 72, y: -5 },
    ];

    engineOffsets.forEach((offset) => {
      if (Math.random() > 0.5) {
        // Only draw sometimes for "flicker"
        this.lightningGraphics.beginPath();
        this.lightningGraphics.moveTo(this.x + offset.x, this.y + offset.y);

        // Create a jagged path to the center core
        let curX = this.x + offset.x;
        let curY = this.y + offset.y;
        const targetX = this.x;
        const targetY = this.y - 10;

        for (let i = 0; i < 3; i++) {
          curX += (targetX - curX) * 0.3 + (Math.random() * 20 - 10);
          curY += (targetY - curY) * 0.3 + (Math.random() * 20 - 10);
          this.lightningGraphics.lineTo(curX, curY);
        }

        this.lightningGraphics.lineTo(targetX, targetY);
        this.lightningGraphics.strokePath();
      }
    });
  }
  //============= Turrets ==================
  deployTurrets() {
    this.createExhaust(this.pipeTopLeft);
    this.createExhaust(this.pipeTopRight);

    const turretL = this.scene.add.sprite(
      this.x + this.pipeBotLeft.x,
      this.y + this.pipeBotLeft.y,
      "turret",
    );
    const turretR = this.scene.add.sprite(
      this.x + this.pipeBotRight.x,
      this.y + this.pipeBotRight.y,
      "turret",
    );
    // ENABLE PHYSICS
    this.scene.physics.add.existing(turretL);
    this.scene.physics.add.existing(turretR);
    turretL.hp = 50; // Give them some health
    turretR.hp = 50;
    this.turretL = turretL; // Save reference to the boss class
    this.turretR = turretR;
    // --- Inside deployTurrets() ---

    // Do this for BOTH turretL and turretR
    this.scene.physics.add.overlap(
      this.scene.bullets, // Use your scene's bullet group
      turretL,
      (t, bullet) => {
        // If bullet or turret is already processed, exit
        if (!bullet.active || !t.active || t.isdying) return;

        // Kill bullet immediately
        bullet.setActive(false).setVisible(false);
        bullet.body.enable = false;

        this.damageTurret(t);

        // Destroy bullet at end of frame
        this.scene.time.delayedCall(0, () => bullet.destroy());
      },
      null,
      this,
    );
    this.scene.physics.add.overlap(
      this.scene.bullets, // Use your scene's bullet group
      turretR,
      (t, bullet) => {
        // If bullet or turret is already processed, exit
        if (!bullet.active || !t.active || t.isdying) return;

        // Kill bullet immediately
        bullet.setActive(false).setVisible(false);
        bullet.body.enable = false;

        this.damageTurret(t);

        // Destroy bullet at end of frame
        this.scene.time.delayedCall(0, () => bullet.destroy());
      },
      null,
      this,
    );
    // Start them behind the boss
    [turretL, turretR].forEach((t) => t.setDepth(this.depth - 1).setScale(1.5));
    // Slow U-Shape Entry (2 seconds instead of 1)
    this.scene.tweens.add({
      targets: turretL,
      x: this.x - 140,
      y: this.y + 100, // Moves down first
      duration: 2000,
      ease: "Cubic.easeInOut",
      onComplete: () => this.startFreeFlight(turretL),
    });

    this.scene.tweens.add({
      targets: turretR,
      x: this.x + 140,
      y: this.y + 100,
      duration: 2000,
      ease: "Cubic.easeInOut",
      onComplete: () => this.startFreeFlight(turretR),
    });
  }
  createExhaust(pipe) {
    const smoke = this.scene.add.particles(
      this.x + pipe.x,
      this.y + pipe.y,
      "fire_particle",
      {
        speed: { min: 20, max: 80 },
        angle: { min: 240, max: 300 }, // Shooting UP
        scale: { start: 0.8, end: 2 }, // Smoke gets BIGGER as it dissipates
        alpha: { start: 0.6, end: 0 },
        lifespan: { min: 1000, max: 3000 }, // Stays for 1-3 seconds as requested
        blendMode: "NORMAL", // 'NORMAL' looks more like thick smoke than 'ADD'
        tint: 0xcccccc, // Light grey smoke
        quantity: 20,
        stopAfter: 30,
      },
    );
    smoke.setDepth(this.depth + 1);
  }
  startFreeFlight(turret) {
    if (!this.active || !turret || !turret.active) return;

    // 1. Initialize the firing timer ONLY ONCE per turret
    if (!turret.fireTimer) {
      turret.fireTimer = this.scene.time.addEvent({
        delay: 2000, // Fires every 2 seconds
        callback: () => this.fireTurretGuns(turret),
        loop: true,
      });

      // Cleanup: Stop firing if the turret is destroyed
      turret.on("destroy", () => {
        if (turret.fireTimer) turret.fireTimer.remove();
      });
    }

    // 2. Pick a truly random spot on the screen
    const screenW = this.scene.scale.width;
    const screenH = this.scene.scale.height;

    // Turrets can now go anywhere (50px padding from edges)
    const targetX = Phaser.Math.Between(50, screenW - 50);
    const targetY = Phaser.Math.Between(50, screenH - 100);

    // 3. Move slowly to the new spot
    this.scene.tweens.add({
      targets: turret,
      x: targetX,
      y: targetY,
      duration: Phaser.Math.Between(3000, 6000), // Very slow, organic flight
      ease: "Sine.easeInOut",
      onUpdate: () => {
        // SAFETY CHECK: Only run if the scene and player still exist
        if (this.scene && this.scene.player && turret.active) {
          const angle = Phaser.Math.Angle.Between(
            turret.x,
            turret.y,
            this.scene.player.x,
            this.scene.player.y,
          );
          turret.setRotation(angle + Math.PI / 2);
        }
      },
      onComplete: () => {
        // When it arrives, hover for a moment, then fly again
        if (this.active && turret.active) {
          this.scene.time.delayedCall(Phaser.Math.Between(500, 1500), () => {
            this.startFreeFlight(turret);
          });
        }
      },
    });
  }
  fireTurretGuns(turret) {
    // Only fire if the boss, turret, and player are all alive
    if (
      !this.active ||
      !turret.active ||
      !this.scene.player ||
      !this.scene.player.active
    )
      return;

    const angle = Phaser.Math.Angle.Between(
      turret.x,
      turret.y,
      this.scene.player.x,
      this.scene.player.y,
    );

    // Twin-Linked Firing (2 bullets side-by-side)
    for (let i = -1; i <= 1; i += 2) {
      // Calculate offset so bullets come from the left/right "wing" of the turret
      const offsetX = Math.cos(angle + Math.PI / 2) * (i * 12);
      const offsetY = Math.sin(angle + Math.PI / 2) * (i * 12);

      const bullet = this.scene.physics.add.sprite(
        turret.x + offsetX,
        turret.y + offsetY,
        "fire_particle",
      );

      bullet.setTint(0xbf00ff); // Purple matching your boss theme
      bullet.setScale(0.7);
      bullet.setDepth(190);

      // Slow, steady projectiles
      const speed = 250;
      this.scene.physics.velocityFromRotation(
        angle,
        speed,
        bullet.body.velocity,
      );

      // Collision with player
      this.scene.physics.add.overlap(this.scene.player, bullet, () => {
        if (this.scene.player.takeDamage) this.scene.player.takeDamage(10);
        bullet.destroy();
      });

      // Cleanup bullet after 4 seconds
      this.scene.time.delayedCall(4000, () => {
        if (bullet.active) bullet.destroy();
      });
    }

    // Visual Muzzle Flash: Turret flashes white for a split second
    turret.setTint(0xffffff);
    this.scene.time.delayedCall(60, () => {
      if (turret.active) turret.clearTint();
    });
  }
  damageTurret(turret) {
    if (!turret || !turret.active || !turret.body) return;

    turret.hp -= 10;

    // Flash Red
    turret.setTint(0xff0000);
    this.scene.time.delayedCall(50, () => {
      if (turret && turret.active) turret.clearTint();
    });

    if (turret.hp <= 0) {
      // IMPORTANT: Disable body before calling any logic that destroys it
      turret.body.enable = false;
      this.explodeTurret(turret);
    }
  }
  explodeTurret(turret) {
    if (!turret || !turret.active || turret.isdying) return;
    turret.isdying = true; // Custom flag to prevent double-logic

    // 1. Disable Physics IMMEDIATELY
    if (turret.body) {
      turret.body.enable = false;
      this.scene.physics.world.disable(turret);
    }

    // 2. Stop logic
    if (turret.fireTimer) turret.fireTimer.remove();
    this.scene.tweens.killTweensOf(turret);

    // 3. Explosion
    this.scene.add
      .particles(turret.x, turret.y, "fire_particle", {
        speed: { min: 20, max: 100 },
        scale: { start: 1, end: 0 },
        lifespan: 500,
        quantity: 15,
        stopAfter: 15,
      })
      .setDepth(200);

    // 4. THE FIX: Wait until the physics step is TOTALLY finished before destroying
    this.scene.time.delayedCall(0, () => {
      if (turret.active) turret.destroy();
    });
  }
  // Destroy everything after boss death
  die() {
    // 1. STOP ALL TWEENS IMMEDIATELY
    // This stops the "Free Flight" and prevents the 'player' undefined error
    if (this.scene) {
      this.scene.tweens.killTweensOf([this, this.turretL, this.turretR]);
    }
    // 2. EXPLODE THE TURRETS
    [this.turretL, this.turretR].forEach((t) => {
      if (t && t.active) {
        if (t.fireTimer) t.fireTimer.remove();
        // --- THE FIX: Disable physics body immediately ---
        if (t.body) {
          t.body.enable = false;
        }
        const tExplosion = this.scene.add.particles(t.x, t.y, "fire_particle", {
          speed: { min: 50, max: 200 },
          angle: { min: 0, max: 360 },
          scale: { start: 1, end: 0 },
          alpha: { start: 1, end: 0 },
          lifespan: 800,
          tint: [0xffffff, 0xbf00ff, 0x333333],
          quantity: 30,
          stopAfter: 30,
        });
        tExplosion.setDepth(200);
        t.destroy();
      }
    });
    // 3. BOSS FINAL CORE OVERLOAD
    this.isCharging = false;
    this.coreGlow.setTint(0xffffff); // Flash core white
    this.coreGlow.setScale(10); // Expand the glow
    // 4. BIG SCREEN SHAKE
    this.scene.cameras.main.shake(800, 0.03);
    // 5. CLEANUP REMAINING VISUALS
    if (this.swarmEmitter) this.swarmEmitter.destroy();
    // Delay the final boss removal slightly so the player sees the "Core Overload"
    this.scene.time.delayedCall(200, () => {
      if (this.coreBall) this.coreBall.destroy();
      if (this.coreGlow) this.coreGlow.destroy();
      // Final Boss Explosion (Add your massive smoke here)
      this.createBigBossExplosion();
      this.destroy(); // Finally remove the boss sprite
    });
  }

  createBigBossExplosion() {
    // Massive lingering smoke clouds
    this.scene.add
      .particles(this.x, this.y, "fire_particle", {
        speed: { min: 20, max: 150 },
        scale: { start: 2, end: 4 },
        alpha: { start: 0.7, end: 0 },
        lifespan: 2000,
        tint: 0x444444, // Dark heavy smoke
        quantity: 50,
        stopAfter: 50,
      })
      .setDepth(200);
  }
  update(time, delta) {
    super.update(time, delta);

    if (this.coreBall && this.coreGlow) {
      let offsetX = 0;
      let offsetY = 0;

      if (this.isShaking) {
        offsetX = Math.random() * 6 - 3;
        offsetY = Math.random() * 6 - 3;
      }

      this.coreBall.setPosition(this.x + offsetX, this.y - 10 + offsetY);
      this.coreGlow.setPosition(this.x + offsetX, this.y - 10 + offsetY);
    }

    // DRAW LIGHTNING ONLY WHEN CHARGING
    if (this.isCharging) {
      this.drawLightning();
    } else if (this.lightningGraphics) {
      this.lightningGraphics.clear();
    }
  }
}
