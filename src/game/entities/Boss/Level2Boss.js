import Phaser from "phaser";
import BaseBoss from "./BaseBoss";

export default class StormBoss extends BaseBoss {
  constructor(scene, x, y) {
    // Level 2, 2000 HP (Scaled up)
    super(scene, x, y, "boss1", 2, 2000);

    this.hitColor = 0xaa00ff; // Purple sparkles for Level 2
    this.setScale(0.8);

    // --- Level 2 Specific: The Purple Aura ---
    this.aura = scene.add
      .image(this.x, this.y, "boss1")
      .setScale(this.scale * 1.1)
      .setTint(0xff00ff)
      .setAlpha(0.3)
      .setDepth(this.depth - 1);

    if (this.body) {
      this.body.setAllowGravity(false);
      this.body.setVelocityY(100);
    }
  }

  update(time, delta) {
    // 1. Aura Follow Logic
    if (this.active && this.aura) {
      this.aura.x = this.x;
      this.aura.y = this.y;
    }

    // 2. Entry Logic
    if (this.isEntering && this.y >= 150) {
      this.isEntering = false;
      this.body.setVelocity(0, 0);

      this.startMovementPattern(); // Using the move pattern from Base

      // Level 2 Firing Pattern: Shells + Sniper Shot
      this.fireTimer = this.scene.time.addEvent({
        delay: 4000,
        callback: () => this.executeAttackPattern(),
        loop: true,
      });
    }
  }

  executeAttackPattern() {
    if (this.isDead || !this.active) return;

    // Burst 1
    this.spawnShells();

    // Burst 2
    this.scene.time.delayedCall(300, () => {
      if (!this.isDead) this.spawnShells();
    });

    // --- Level 2 Specific: The Sniper Shot ---
    this.scene.time.delayedCall(800, () => {
      if (!this.isDead) this.fireSniperShot();
    });
  }
  fireSniperShot() {
    if (!this.scene || !this.scene.player || this.isDead) return;

    // 1. Create the charging visuals
    const charger = this.scene.add
      .circle(this.x, this.y + 40, 40, 0xff0000, 0.2)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(15);

    const core = this.scene.add
      .circle(this.x, this.y + 40, 5, 0xffffff)
      .setDepth(16);

    // 2. The Laser Targeting Line
    const targetLine = this.scene.add
      .line(
        0,
        0,
        this.x,
        this.y + 40,
        this.scene.player.x,
        this.scene.player.y,
        0xff0000,
        0.5,
      )
      .setOrigin(0, 0)
      .setDepth(5);

    // 3. The Animation
    this.scene.tweens.add({
      targets: charger,
      radius: 5,
      alpha: 1,
      duration: 800,
      ease: "Cubic.easeIn",
      onUpdate: () => {
        // Check if boss still exists during update
        if (!this.active || this.isDead) {
          charger.destroy();
          core.destroy();
          targetLine.destroy();
          return;
        }
        charger.x = this.x;
        charger.y = this.y + 40;
        core.x = this.x;
        core.y = this.y + 40;

        // Update line to follow player/boss movement
        targetLine.setTo(
          this.x,
          this.y + 40,
          this.scene.player.x,
          this.scene.player.y,
        );
      },
      onComplete: () => {
        charger.destroy();
        core.destroy();
        targetLine.destroy();

        if (!this.isDead && this.active) {
          this.createComet();
        }
      },
    });
  }
  createComet() {
    // 1. Capture the scene in a local variable so it stays accessible
    const currentScene = this.scene;
    if (!currentScene) return;

    const comet = currentScene.add
      .circle(this.x, this.y + 40, 12, 0xff0000)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(12);

    const brightCore = currentScene.add
      .circle(this.x, this.y + 40, 5, 0xffffff)
      .setDepth(13);

    currentScene.physics.add.existing(comet);

    const angle = Phaser.Math.Angle.Between(
      this.x,
      this.y,
      currentScene.player.x,
      currentScene.player.y,
    );
    const speed = 650;
    comet.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);

    // --- SAFETY FIX FOR syncCore ---
    const syncCore = () => {
      // Safety Gate: If scene is gone or objects are dead, KILL the listener immediately
      if (
        !currentScene ||
        !currentScene.events ||
        !comet.active ||
        !brightCore.active
      ) {
        if (currentScene && currentScene.events) {
          currentScene.events.off("update", syncCore);
        }
        if (brightCore.active) brightCore.destroy();
        return;
      }

      brightCore.x = comet.x;
      brightCore.y = comet.y;
    };
    currentScene.events.on("update", syncCore);

    // --- AUTO-CLEANUP ---
    currentScene.time.delayedCall(3000, () => {
      if (comet.active) {
        comet.destroy();
        if (brightCore.active) brightCore.destroy();
      }
    });

    // TRAIL LOGIC
    currentScene.time.addEvent({
      delay: 15,
      repeat: 40,
      callback: () => {
        if (!comet.active || !currentScene) return;
        const particle = currentScene.add
          .circle(comet.x, comet.y, Phaser.Math.Between(4, 10), 0xff4400, 0.6)
          .setBlendMode(Phaser.BlendModes.ADD);
        currentScene.tweens.add({
          targets: particle,
          alpha: 0,
          scale: 0,
          duration: 400,
          onComplete: () => particle.destroy(),
        });
      },
    });

    currentScene.physics.add.overlap(currentScene.player, comet, () => {
      if (currentScene.events) currentScene.events.off("update", syncCore);
      currentScene.takeDamage(50);
      currentScene.cameras.main.shake(400, 0.04);
      comet.destroy();
      brightCore.destroy();
    });
  }

  die() {
    // Overriding the BaseBoss die with the Level 2 Lightning Death
    if (this.aura) this.aura.destroy();

    // Call a specialized "Elite Death" sequence
    // (Include the shaking and purple lightning from your big file)
    super.die();
  }
}
