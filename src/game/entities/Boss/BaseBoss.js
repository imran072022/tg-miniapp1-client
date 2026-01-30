import Phaser from "phaser";
export default class BaseBoss extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, level, hp) {
    super(scene, x, y, texture);
    // Add to scene and physics
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.bossLevel = level;
    this.hp = hp;
    this.maxHp = hp;
    this.isDead = false;
    // Setup physics
    this.setCollideWorldBounds(true);
    this.setDepth(100);
    // Create HP Bar
    this.hpBar = scene.add.graphics();
    this.updateHPBar();
    this.hpBarOffset = -60;
    // Default hit color for sparkle
    this.hitColor = 0xffff00;
    this.isEntering = true;
    // boss enraging
    this.ragePercent = 0.5;
    this.isRaged = false;
  }

  updateHPBar() {
    if (!this.hpBar || !this.active) return;
    this.hpBar.clear();

    // Use the property instead of a hardcoded number
    const barY = this.y + this.hpBarOffset;
    const barX = this.x - 50;
    this.hpBar.fillStyle(0x000000, 0.8);
    this.hpBar.fillRect(barX, barY, 100, 8);
    const healthWidth = Math.max(0, (this.hp / this.maxHp) * 100);
    const color = this.hp > this.maxHp * 0.3 ? 0x00ff00 : 0xff0000;
    this.hpBar.fillStyle(color, 1);
    this.hpBar.fillRect(barX, barY, healthWidth, 8);
  }
  takeDamage(amount) {
    if (this.isDead) return;
    this.hp -= amount;
    this.updateHPBar();

    // ADD THIS LINE HERE:
    this.checkRage();

    // Flash effect
    this.scene.tweens.add({
      targets: this,
      alpha: 0.5,
      duration: 50,
      yoyo: true,
    });

    if (this.hp <= 0) this.die();
  }

  checkRage() {
    if (!this.isRaged && this.hp < this.maxHp * this.ragePercent) {
      this.isRaged = true;
      this.onRage();
    }
  }
  onRage() {
    this.setTint(this.rageColor || 0xff00ff);
    if (this.upgradeAttacks) this.upgradeAttacks();
  }

  die() {
    if (this.isDead) return;
    this.isDead = true;
    // 1. Kill the HP bar and ALL tweens
    if (this.hpBar) this.hpBar.destroy();
    this.scene.tweens.killTweensOf(this);
    // 2. Kill the Fire Timer (Added this check)
    if (this.fireTimer) this.fireTimer.remove();
    // 3. Keep your existing timer removals
    if (this.novaTimer) this.novaTimer.remove();
    if (this.dashTimer) this.dashTimer.remove();
    // 4. Disable physics so bullets pass through the "corpse"
    if (this.body) this.body.enable = false;
    const deathScene = this.scene;

    // Explosion logic (simplified for the base)
    deathScene.time.addEvent({
      delay: 100,
      repeat: 10,
      callback: () => {
        const boom = deathScene.add
          .sprite(
            this.x + Phaser.Math.Between(-50, 50),
            this.y + Phaser.Math.Between(-50, 50),
            "flash",
          )
          .setTint(0x00ffff);
        deathScene.tweens.add({
          targets: boom,
          alpha: 0,
          duration: 200,
          onComplete: () => boom.destroy(),
        });
      },
    });

    deathScene.time.delayedCall(1200, () => {
      deathScene.events.emit("BOSS_DEFEATED");
      this.destroy();
    });
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    this.updateHPBar();
  }

  // ===============for Level 1-2 ===================
  // ADD THESE TO THE BOTTOM OF YOUR BaseBoss CLASS (Inside the class braces)

  // 1. Common Entry and Movement
  startMovementPattern() {
    const { width } = this.scene.scale;
    this.scene.tweens.add({
      targets: this,
      x: width - 100,
      duration: 1500,
      ease: "Sine.easeInOut",
      onComplete: () => {
        if (!this.active || this.isDead) return;
        this.scene.tweens.add({
          targets: this,
          x: { from: width - 100, to: 100 },
          duration: 3000,
          yoyo: true,
          loop: -1,
          ease: "Sine.easeInOut",
        });
      },
    });
  }

  // 2. Common Attack: The 3-way Shell Burst
  spawnShells() {
    if (this.isDead || !this.active) return;
    const shellSpeeds = [
      { x: -120, y: 400 },
      { x: 0, y: 450 },
      { x: 120, y: 400 },
    ];
    shellSpeeds.forEach((speed) => {
      // Glow and Core visuals from your original code
      const glow = this.scene.add.circle(
        this.x,
        this.y + 40,
        10,
        0x00ffff,
        0.3,
      );
      const core = this.scene.add.circle(this.x, this.y + 40, 6, 0xffffff, 1);
      this.scene.physics.add.existing(core);
      core.body.setVelocity(speed.x, speed.y);
      // Trail/Update Logic
      const handleUpdate = () => {
        if (!this.scene || !core.active || !glow.active) {
          if (this.scene) this.scene.events.off("update", handleUpdate);
          return;
        }
        glow.x = core.x;
        glow.y = core.y;
      };
      this.scene.events.on("update", handleUpdate);
      // Collision
      this.scene.physics.add.overlap(this.scene.player, core, () => {
        this.scene.events.off("update", handleUpdate);
        core.destroy();
        glow.destroy();
        this.scene.takeDamage(10);
      });
      // Cleanup
      this.scene.time.delayedCall(2500, () => {
        if (core.active) {
          if (this.scene) this.scene.events.off("update", handleUpdate);
          core.destroy();
          glow.destroy();
        }
      });
    });
  }
}
