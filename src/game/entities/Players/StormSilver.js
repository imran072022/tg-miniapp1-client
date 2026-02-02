import Phaser from "phaser";
import BasePlayer from "./BasePlayer";
import Projectile from "../../abilities/Projectiles";

export default class StormSilver extends BasePlayer {
  constructor(scene, x, y) {
    super(scene, x, y, "player4", {
      hp: 800,
      fireRate: 140,
      bVel: -850,
      bScale: 0.6,
      scale: 0.9,
    });
    this.ultCharge = 0;
    this.maxUltCharge = 100;
    this.isUltReady = false;
    this.ultGainRate = 1.2;
    this.podOffsets = [
      -50, -42, -34, -26, -18, -10, -2, 2, 10, 18, 26, 34, 42, 50,
    ];
    this.body.setSize(this.width * 0.6, this.height * 0.7);
    // Track current lane color for global effects (like particles)
    this.currentLaneColor = 0x00ffff;
  }

  update(time, delta) {
    super.update(time, delta);
    // 1. PHANTOM AFTER-IMAGE (Speed Ghost)
    // Only leaves a trail when moving significantly
    if (Math.abs(this.body.velocity.x) > 120) {
      this.createSpeedGhost();
    }
  }

  createSpeedGhost() {
    const ghost = this.scene.add
      .sprite(this.x, this.y, this.texture.key)
      .setTint(this.currentLaneColor)
      .setAlpha(0.25)
      .setDepth(this.depth - 1);
    this.scene.tweens.add({
      targets: ghost,
      alpha: 0,
      scale: 0.8,
      duration: 200,
      onComplete: () => ghost.destroy(),
    });
  }

  fire(time) {
    // Current Color Calculation once per fire cycle
    const hue = (this.scene.time.now * 0.05) % 360;
    this.currentLaneColor = Phaser.Display.Color.HSLToColor(
      hue / 360,
      0.8,
      0.5,
    ).color;
    const lanes = [{ xOff: this.podOffsets[2] }, { xOff: this.podOffsets[11] }];
    lanes.forEach((config) => {
      this.createHolographicLane(config.xOff, this.currentLaneColor);
    });
  }

  createHolographicLane(xOff, currentColor) {
    const lane = new Projectile(
      this.scene,
      this.x + xOff,
      this.y - 170,
      "energy_bullet",
      this,
    );
    this.scene.bullets.add(lane);
    lane.body.velocity.y = this.bulletVel - 150;
    lane.setDisplaySize(60, 400);
    lane.setAlpha(0.2).setBlendMode("ADD");
    // Super-Style Grid
    const grid = this.scene.add
      .grid(0, 0, 60, 400, 20, 40, 0x000000, 0.5, 0xffffff, 0.4)
      .setBlendMode("ADD");
    const stripL = this.scene.add
      .sprite(-24, 0, "energy_bullet")
      .setAlpha(0.3)
      .setDisplaySize(3, 400);
    const stripR = this.scene.add
      .sprite(24, 0, "energy_bullet")
      .setAlpha(0.3)
      .setDisplaySize(3, 400);
    const hA = this.scene.add
      .sprite(0, 0, "flash")
      .setAlpha(0.8)
      .setDisplaySize(12, 12);
    const hB = this.scene.add
      .sprite(0, 0, "flash")
      .setAlpha(0.8)
      .setDisplaySize(12, 12);
    const container = this.scene.add.container(lane.x, lane.y, [
      grid,
      stripL,
      stripR,
      hA,
      hB,
    ]);
    const updateFX = () => {
      if (!lane.active) {
        container.destroy();
        this.scene.events.off("update", updateFX);
        return;
      }
      const time = this.scene.time.now;
      lane.setTint(this.currentLaneColor);
      grid.setOutlineStyle(this.currentLaneColor, 0.4);
      hA.setTint(this.currentLaneColor);
      hB.setTint(this.currentLaneColor);
      const scrollY = ((time * 0.5) % 400) - 200;
      hA.x = Math.sin(time * 0.008) * 20;
      hB.x = -hA.x;
      hA.y = hB.y = scrollY;
      container.setPosition(lane.x, lane.y);
      container.rotation = this.body.velocity.x * 0.0003;
      const wave = Math.sin(time / 150);
      container.scaleX = 1 + wave * 0.05;
      container.setAlpha(0.85 + wave * 0.15);
    };
    this.scene.events.on("update", updateFX);
    // 2. ENEMY IMPACT PARTICLES (Linked to this lane)
    lane.onHit = (enemy) => {
      this.triggerImpactFX(enemy.x, enemy.y);
    };
  }

  triggerImpactFX(x, y) {
    const emitter = this.scene.add.particles(x, y, "energy_bullet", {
      speed: { min: 50, max: 150 },
      scale: { start: 0.2, end: 0 },
      tint: this.currentLaneColor,
      lifespan: 300,
      quantity: 8,
      blendMode: "ADD",
    });
    this.scene.time.delayedCall(300, () => emitter.destroy());
  }

  launchSuper() {
    if (!this.isUltReady) return;
    this.isFullBurst = true;
    this.scene.cameras.main.shake(200, 0.01);
    const chargeOrb = this.scene.add
      .circle(this.x, this.y - 20, 10, 0xffffff, 0.9)
      .setBlendMode("ADD");
    this.scene.tweens.add({
      targets: chargeOrb,
      scale: 4,
      alpha: 0,
      duration: 200,
      onComplete: () => {
        chargeOrb.destroy();
        this.executeMonolithBeam();
      },
    });
  }

  executeMonolithBeam() {
    const shakeEvent = this.scene.time.addEvent({
      delay: 100,
      callback: () => this.scene.cameras.main.shake(100, 0.005),
      loop: true,
    });
    const beamWidth = 220;
    const grid = this.scene.add
      .grid(0, 0, beamWidth, 800, 20, 40, 0x00ffff, 0.15, 0xffffff, 0.4)
      .setBlendMode("ADD");
    const strips = [];
    [0x00ffff, 0xff00ff, 0x00ffff].forEach((col, i) => {
      const s = this.scene.add
        .tileSprite((i - 1) * 70, 0, 20, 800, "energy_bullet")
        .setTint(col)
        .setAlpha(0.7)
        .setBlendMode("ADD");
      strips.push(s);
    });
    const superContainer = this.scene.add.container(this.x, this.y - 400, [
      grid,
      ...strips,
    ]);
    superContainer.setDepth(10);
    const damageTimer = this.scene.time.addEvent({
      delay: 40,
      loop: true,
      callback: () => {
        for (let i = 0; i < 5; i++) {
          this.createGhostLaser(this.x + (i - 2) * 45, this.y - 10);
        }
      },
    });
    const updateSuper = () => {
      if (!this.isFullBurst) {
        superContainer.destroy();
        damageTimer.remove();
        shakeEvent.remove();
        this.scene.events.off("update", updateSuper);
        return;
      }
      superContainer.x = this.x;
      superContainer.y = this.y - 400;
      strips.forEach((s, i) => (s.tilePositionY += 20 + i * 10));
    };
    this.scene.events.on("update", updateSuper);
    this.scene.time.delayedCall(6000, () => {
      this.isFullBurst = false;
      this.ultCharge = 0;
      this.isUltReady = false;
      if (this.superBtn) this.superBtn.setReady(false);
    });
  }

  createGhostLaser(x, y) {
    const laser = this.scene.bullets.get(x, y, "energy_bullet");
    if (laser) {
      laser.setActive(true).setVisible(true);
      laser.body.velocity.y = -1200;
      laser.setDisplaySize(4, 80);
      laser.setTint(0x00ffff);
      laser.setAlpha(0.8).setBlendMode("ADD");
    }
  }
}
