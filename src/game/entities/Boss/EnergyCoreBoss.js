import Phaser from "phaser";
import BaseBoss from "./BaseBoss.js";

export default class EnergyCoreBoss extends BaseBoss {
  constructor(scene, x, y) {
    super(scene, x, -250, "boss4", 4, 500);
    this.setTint(0x00ffff);
    this.setScale(1.4);
    this.hpBarOffset = -120; // boss4 is taller (237px), so move bar up
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
    if (this.body) {
      // We want the hit zone to be the central core
      this.body.setSize(this.width * 0.7, this.height * 0.4);
      this.body.setOffset(this.width * 0.15, this.height * 0.15);
      this.body.immovable = true;
      this.body.allowGravity = false;
    }

    this.initEnergyFires();
    this.initCore();
    // Value shared with enraged mode
    this.infernoCoolDown = 8000;
    this.turretScale = 1.5;
    this.turretFireDelay = 2000;
    this.turretMoveSpeedMin = 3000;
    this.turretMoveSpeedMax = 6000;
    this.turretDamage = 10;
    this.turretMaxHP = 50;
  }

  startAttackPatterns() {
    console.log("Energy Core Active - Pattern Start");
    this.startInfernoCycle(); // <--- Add this to start the 8s timer!
  }
  initCore() {
    if (this.isDead || !this.scene) return;
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
    if (this.isDead || !this.scene) return;
    const player = this.scene.player;
    if (!player) return;
    // --- ADJUST THIS FOR CENTERING ---
    const beamXOffset = 12; // Positive moves right, negative moves left
    const startX = this.x + beamXOffset;
    const startY = this.y;
    // 1. Calculate the angle FROM the new offset position
    const angle = Phaser.Math.Angle.Between(startX, startY, player.x, player.y);
    const beamLength = 1500;
    const beamWidth = 80;
    // 2. Create the Purple Outer Beam at startX
    const beam = this.scene.add.rectangle(
      startX,
      startY,
      beamWidth,
      beamLength,
      0xbf00ff,
      0.8,
    );
    beam.setOrigin(0.5, 0);
    beam.setRotation(angle - Math.PI / 2);
    beam.setDepth(140);
    beam.setBlendMode("ADD");
    // 3. The White Inner Core at startX
    const core = this.scene.add.rectangle(
      startX,
      startY,
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
    // 5. Animation
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
    // 6. Targeted Collision Logic (using startX)
    const playerAngle = Phaser.Math.Angle.Between(
      startX,
      startY,
      player.x,
      player.y,
    );
    const angleDiff = Math.abs(Phaser.Math.Angle.Wrap(angle - playerAngle));
    if (angleDiff < 0.1) {
      if (player.takeDamage) player.takeDamage(50);
    }
  }
  startInfernoCycle() {
    if (this.isDead || !this.scene) return;
    this.coreGlow.setTint(0xffffff);
    this.isCharging = true;
    this.deployTurrets(); // deploy turrets
    this.chargeTween = this.scene.tweens.addCounter({
      from: 0,
      to: 100,
      duration: this.infernoCoolDown,
      onUpdate: (tween) => {
        // SAFETY CHECK: If boss is dead or scene is gone, stop immediately
        if (this.isDead || !this.scene || !this.scene.add) {
          tween.stop();
          return;
        }
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
    this.engineEmitters = [];

    const engines = [
      { x: 0, y: -62, angle: 270, life: 700, col: 0xdc143c, scale: 1.0 },
      { x: 2, y: 52, angle: 90, life: 700, col: 0xdc143c, scale: 1.0 },
      { x: -70, y: -5, angle: 180, life: 300, col: 0x9400d3, scale: 1.0 },
      { x: 72, y: -5, angle: 0, life: 300, col: 0xff00ff, scale: 1.0 },
    ];

    engines.forEach((config) => {
      // Outer Glow - Increased start scale by 20% (0.8 -> 1.0)
      const emitter1 = this.scene.add.particles(0, 0, "fire_particle", {
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
      this.engineEmitters.push(emitter1);

      // 2. Create the White-Hot Internal Core
      const emitter2 = this.scene.add.particles(0, 0, "fire_particle", {
        speed: { min: 250, max: 350 },
        angle: config.angle,
        scale: { start: config.scale * 0.5, end: 0 },
        lifespan: config.life * 0.5,
        blendMode: "ADD",
        tint: 0xffffff,
        follow: this,
        followOffset: { x: config.x, y: config.y },
      });
      this.engineEmitters.push(emitter2);
    });
  }
  drawLightning() {
    if (this.isDead || !this.scene) {
      if (this.lightningGraphics) this.lightningGraphics.clear();
      return;
    }
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
    if (this.isDead || !this.scene) return;
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
    turretL.hp = this.turretMaxHP;
    turretR.hp = this.turretMaxHP;
    this.turretL = turretL; // Save reference to the boss class
    this.turretR = turretR;
    // Do this for BOTH turretL and turretR
    this.scene.physics.add.overlap(
      this.scene.bullets, // Use your scene's bullet group
      turretL,
      (t, bullet) => {
        if (this.isDead || !this.scene) return;
        if (!bullet.active || !t.active || t.isDying) return;
        bullet.setActive(false).setVisible(false);
        bullet.body.enable = false;
        this.damageTurret(t);
        bullet.destroy();
      },
      null,
      this,
    );
    this.scene.physics.add.overlap(
      this.scene.bullets, // Use your scene's bullet group
      turretR,
      (t, bullet) => {
        // 1. SAFETY: If the boss is already dead, ignore this collision
        if (this.isDead || !this.scene) return;
        if (!bullet.active || !t.active || t.isDying) return;
        // 2. Hide it and stop physics
        bullet.setActive(false).setVisible(false);
        bullet.body.enable = false;
        // 3. Process the damage
        this.damageTurret(t);
        // 4. DESTROY IMMEDIATELY (No delayedCall)
        bullet.destroy();
      },
      null,
      this,
    );
    // Start them behind the boss
    [turretL, turretR].forEach((t) =>
      t.setDepth(this.depth - 1).setScale(this.turretScale),
    );
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
    if (this.isDead || !this.scene) return;
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
        delay: this.turretFireDelay,
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
    // 3. Movement speed to the new spot
    this.scene.tweens.add({
      targets: turret,
      x: targetX,
      y: targetY,
      duration: Phaser.Math.Between(
        this.turretMoveSpeedMin,
        this.turretMoveSpeedMax,
      ),
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
    // 1. Initial Safety Gate
    if (!this.scene || !this.scene.player || !this.active || !turret.active)
      return;
    const angle = Phaser.Math.Angle.Between(
      turret.x,
      turret.y,
      this.scene.player.x,
      this.scene.player.y,
    );
    for (let i = -1; i <= 1; i += 2) {
      const offsetX = Math.cos(angle + Math.PI / 2) * (i * 12);
      const offsetY = Math.sin(angle + Math.PI / 2) * (i * 12);
      const bullet = this.scene.add.rectangle(
        turret.x + offsetX,
        turret.y + offsetY,
        4,
        20,
        0xffffff,
      );
      this.scene.physics.add.existing(bullet);
      bullet.setRotation(angle + Math.PI / 2);
      bullet.setStrokeStyle(2, 0xbf00ff);
      const speed = 350;
      this.scene.physics.velocityFromRotation(
        angle,
        speed,
        bullet.body.velocity,
      );
      this.scene.physics.add.overlap(this.scene.player, bullet, () => {
        // Check if scene exists BEFORE calling takeDamage
        if (this.scene && this.scene.player && this.scene.player.takeDamage) {
          this.scene.player.takeDamage(this.turretDamage);
        }
        bullet.destroy();
      });
      // --- FIX: Cleanup bullet after 4 seconds ---
      this.scene.time.delayedCall(4000, () => {
        if (this.scene && bullet.active) {
          bullet.destroy();
        }
      });
    }
    // --- FIX: Visual Muzzle Flash ---
    turret.setTint(0xffffff);
    this.scene.time.delayedCall(60, () => {
      // Check if scene exists before clearing tint
      if (this.scene && turret.active) {
        turret.clearTint();
      }
    });
  }
  damageTurret(turret) {
    if (this.isDead || !this.scene) return;
    if (!turret || !turret.active || !turret.body) return;
    turret.hp -= 10;
    // Flash Red
    turret.setTint(0xff0000);
    // Safety check inside the delayed call too
    this.scene.time.delayedCall(50, () => {
      if (this.scene && turret && turret.active) turret.clearTint();
    });
    if (turret.hp <= 0) {
      turret.body.enable = false;
      this.explodeTurret(turret);
    }
  }
  explodeTurret(turret) {
    if (!turret || !turret.active || turret.isDying) return;
    turret.isDying = true; // Custom flag to prevent double-logic
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
    if (this.isDead) return;
    this.isDead = true;

    // 1. LOCK the scene reference immediately
    const scene = this.scene;

    // ... (Your existing cleanup: lightning, engineEmitters, tweens, timers) ...
    if (this.lightningGraphics) this.lightningGraphics.destroy();
    if (this.engineEmitters) this.engineEmitters.forEach((e) => e.stop());
    if (this.chargeTween) this.chargeTween.stop();
    if (this.swarmEmitter) {
      this.swarmEmitter.destroy();
      this.swarmEmitter = null;
    }
    if (this.infernoTimer) this.infernoTimer.destroy();
    if (this.turretTimer) this.turretTimer.destroy();
    if (this.exhaustTimer) this.exhaustTimer.destroy();

    const activeTurrets = [this.turretL, this.turretR];
    activeTurrets.forEach((t) => {
      if (t && t.active) this.explodeTurret(t);
    });

    if (this.body) this.body.enable = false;
    this.setTint(0x333333);
    if (this.coreBall) this.coreBall.setVisible(false);
    if (this.coreGlow) this.coreGlow.setVisible(false);
    if (this.hpBar) {
      this.hpBar.destroy();
      this.hpBar = null;
    }

    // 2. The Death Animation
    scene.tweens.add({
      targets: this,
      angle: { from: -3, to: 3 },
      x: this.x + 2,
      yoyo: true,
      duration: 80,
      repeat: 20,
      onUpdate: () => {
        if (scene && scene.add) this.releaseDeathSmoke();
      },
      onComplete: () => {
        // --- THE CRITICAL FIX ---
        if (scene && scene.events) {
          // 1. Show the explosion visuals
          this.finalCosmicExplosion();

          // 2. TELL THE GAME THE BOSS IS DEFEATED
          scene.events.emit("BOSS_DEFEATED");

          // 3. NOW destroy the boss object
          this.destroy();
        }
      },
    });
  }
  releaseDeathSmoke() {
    const positions = [
      { x: -55, y: -50 },
      { x: 55, y: -50 },
      { x: -50, y: 70 },
      { x: 50, y: 70 },
    ];
    positions.forEach((pos) => {
      const smoke = this.scene.add.circle(
        this.x + pos.x,
        this.y + pos.y,
        5,
        0x666666,
        0.5,
      );
      this.scene.tweens.add({
        targets: smoke,
        y: "-=100",
        x: `+=${Phaser.Math.Between(-20, 20)}`,
        alpha: 0,
        scale: 4,
        duration: 1000,
        onComplete: () => smoke.destroy(),
      });
    });
  }

  finalCosmicExplosion() {
    const scene = this.scene;
    if (!scene) return;

    const colors = [0x00ffff, 0xbf00ff, 0xffffff];
    for (let i = 0; i < 40; i++) {
      const color = Phaser.Math.RND.pick(colors);
      const streak = scene.add.rectangle(this.x, this.y, 2, 100, color);
      streak.setRotation(Phaser.Math.FloatBetween(0, Math.PI * 2));
      streak.setBlendMode("ADD");
      scene.tweens.add({
        targets: streak,
        width: 20,
        height: 600,
        alpha: 0,
        duration: 1500,
        ease: "Expo.out",
        onComplete: () => streak.destroy(),
      });
    }

    scene.add
      .particles(this.x, this.y, "fire_particle", {
        speed: { min: 50, max: 200 },
        scale: { start: 1, end: 5 },
        alpha: { start: 0.6, end: 0 },
        lifespan: 2500,
        tint: [0x444444, 0x220044, 0x002244],
        quantity: 40,
        stopAfter: 40,
        blendMode: "NORMAL",
      })
      .setDepth(200);

    scene.cameras.main.flash(1000, 255, 255, 255);
    scene.cameras.main.shake(500, 0.05);

    // REMOVED this.destroy() from here! It's handled in die() now.
  }
  update(time, delta) {
    if (this.isDead) return;
    // Call the BaseBoss update for HP bar positioning
    super.update(time, delta);
    // Keep the core visual centered on the boss
    if (this.coreBall && this.coreGlow) {
      this.coreBall.setPosition(this.x, this.y - 10);
      this.coreGlow.setPosition(this.x, this.y - 10);
    }
    // DRAW LIGHTNING ONLY WHEN CHARGING OR ENRAGED
    if (this.isCharging || this.isEnraged) {
      this.drawLightning();
    } else if (this.lightningGraphics) {
      this.lightningGraphics.clear();
    }
  }
  // stop jumping colors when getting hit
  takeDamage(amount) {
    if (this.isDead) return;
    this.hp -= amount;
    if (this.updateHPBar) this.updateHPBar();
    if (this.hp <= this.maxHp * 0.4 && !this.isEnraged) {
      this.triggerEnragedMode();
    }
    if (this.hp <= 0) {
      this.die();
    }
  }
  // ========== Enraged boss ==========
  triggerEnragedMode() {
    if (this.isEnraged) return; // Safety lock
    this.isEnraged = true;
    // 1. Inferno Cycle (Set to 6000 for 6 seconds)
    this.infernoCoolDown = 5000;
    this.setTint(0xbf00ff);
    // Update Global Turret Stats for FUTURE spawns
    this.turretScale = 2.25;
    this.turretFireDelay = 1333;
    this.turretMoveSpeedMin = 1500;
    this.turretMoveSpeedMax = 3000;
    this.turretDamage = 20;
    this.turretMaxHP = 75;
    // Apply to EXISTING turrets
    const turrets = [this.turretL, this.turretR];
    turrets.forEach((t) => {
      if (!t || !t.active) return;
      t.setScale(this.turretScale);
      t.hp = this.turretMaxHP; // This now only runs ONCE when mode starts
      this.applyFireflyEffect(t);
      if (t.fireTimer) {
        t.fireTimer.reset({
          delay: this.turretFireDelay,
          callback: () => this.fireTurretGuns(t),
          loop: true,
        });
      }
    });
    this.scene.cameras.main.shake(300, 0.01);
  }
  applyFireflyEffect(turret) {
    this.scene.tweens.add({
      targets: turret,
      tint: { from: 0xffffff, to: 0xbf00ff }, // Rapid color flashing
      duration: 200,
      yoyo: true,
      repeat: -1,
    });
  }
}
