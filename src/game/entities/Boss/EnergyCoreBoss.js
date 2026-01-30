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
