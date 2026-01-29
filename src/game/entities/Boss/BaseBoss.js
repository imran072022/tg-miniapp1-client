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
  // Call this whenever the boss takes damage
  checkRage() {
    if (!this.isRaged && this.hp < this.maxHp * 0.5) {
      this.isRaged = true;
      this.onRage(); // This calls the specific boss's changes
    }
  }

  // This is the visual stuff that happens for EVERY boss
  onRage() {
    this.setTint(0xff00ff); // Turn Magenta
    this.scene.cameras.main.flash(300, 255, 0, 0); // Red Flash

    // Call the specific attack changes for the Phantom
    if (this.upgradeAttacks) this.upgradeAttacks();
  }
  // This handles the Level 2/3 Elite Death we built
  die() {
    if (this.isDead) return;
    this.isDead = true;

    if (this.hpBar) this.hpBar.destroy();
    if (this.novaTimer) this.novaTimer.remove();
    if (this.dashTimer) this.dashTimer.remove();
    this.scene.tweens.killTweensOf(this);
    this.body.enable = false;

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
}
