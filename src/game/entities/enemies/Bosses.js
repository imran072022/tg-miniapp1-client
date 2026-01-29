import Phaser from "phaser";

export default class Boss extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, hp, level = 1) {
    // Added 'level' here
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    // --- NEW: LEVEL SCALING ---
    this.bossLevel = level;
    this.hp = hp * level; // HP grows per minute
    this.maxHp = this.hp;
    // --- NEW: SUPERIOR TINTS ---
    if (this.bossLevel >= 2) {
      const aura = scene.add
        .image(this.x, this.y, texture)
        .setScale(this.scale * 1.1)
        .setTint(0xff00ff)
        .setAlpha(0.3)
        .setDepth(this.depth - 1); // Stay just behind the boss

      // Make the aura follow the boss
      scene.events.on("update", () => {
        if (this.active && aura.active) {
          aura.x = this.x;
          aura.y = this.y;
        } else if (aura.active) {
          aura.destroy();
        }
      });
    } else if (this.bossLevel >= 3) {
      this.setTint(0x00ffff); // Cyan
      this.setAlpha(1);
    }
    // --------------------------
    this.isEntering = true;
    this.isDead = false;
    this.setDepth(11);
    this.setScale(0.7);
    this.hpBar = scene.add.graphics();
    this.hpBar.setScrollFactor(0);
    this.hpBar.setAlpha(0);
    this.hpBar.setDepth(100);
    this.drawHealthBar();

    if (this.body) {
      this.body.setSize(this.width * 0.8, this.height * 0.6);
      this.body.setOffset(this.width * 0.1, 0);
    }

    if (this.body instanceof Phaser.Physics.Arcade.Body) {
      this.body.setAllowGravity(false);
      this.body.setVelocityY(100);
    }
  }

  startPattern() {
    const { width } = this.scene.scale;
    this.scene.tweens.add({
      targets: this,
      x: width - 100,
      duration: 1500,
      ease: "Sine.easeInOut",
      overwrite: true,
      onComplete: () => {
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

  takeDamage(amount) {
    if (this.isDead) return;
    // Stop ALL movement immediately

    this.hp -= amount;
    this.drawHealthBar();
    // --- NEW: Damage Number Pop-up ---
    const damageText = this.scene.add
      .text(
        this.x + Phaser.Math.Between(-30, 30), // Randomize X slightly
        this.y + Phaser.Math.Between(-20, 20), // Randomize Y slightly
        `-${amount}`,
        {
          fontSize: "18px",
          fill: "#ffffff",
          fontWeight: "bold",
          stroke: "#ff0000",
          strokeThickness: 2,
        },
      )
      .setDepth(100);
    // Animate the text (Float up and fade)
    this.scene.tweens.add({
      targets: damageText,
      y: damageText.y - 40,
      alpha: 0,
      duration: 600,
      onComplete: () => damageText.destroy(),
    });
    // --------------------------------
    this.setTint(0xffff00);
    this.scene.time.delayedCall(50, () => {
      if (this.active) this.clearTint();
    });
    if (this.hp <= 0) this.die();
  }

  fire() {
    if (this.isDead || !this.active || this.isEntering) return;
    // 1. Your Existing First Burst (6 shells total across 2 bursts)
    console.log("Boss Level:", this.bossLevel);
    this.spawnShells();
    // 2. Second Burst (0.3s later)
    this.scene.time.delayedCall(300, () => {
      if (!this.isDead && this.active) {
        this.spawnShells();
      }
    });
    // 3. NEW: Minute 2+ Sniper Shot (0.8s later)
    if (this.bossLevel >= 2) {
      this.scene.time.delayedCall(800, () => {
        if (!this.isDead && this.active) {
          this.fireSniperShot();
        }
      });
    }
  }
  spawnShells() {
    const shellSpeeds = [
      { x: -120, y: 400 },
      { x: 0, y: 450 },
      { x: 120, y: 400 },
    ];

    shellSpeeds.forEach((speed) => {
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

      // --- THE FIX: Define the update function separately ---
      const handleUpdate = () => {
        // Check if scene AND objects still exist before doing anything
        if (!this.scene || !core.active || !glow.active) {
          // If the bullet is gone, REMOVE this listener so it stops forever
          if (this.scene) this.scene.events.off("update", handleUpdate);
          return;
        }

        glow.x = core.x;
        glow.y = core.y;
        glow.scale = 1 + Math.sin(this.scene.time.now / 100) * 0.2;
      };

      // Start listening
      this.scene.events.on("update", handleUpdate);

      // Collision
      this.scene.physics.add.overlap(this.scene.player, core, () => {
        this.scene.events.off("update", handleUpdate); // STOP listener
        core.destroy();
        glow.destroy();
        this.scene.takeDamage(10);
      });

      // Cleanup timer
      this.scene.time.delayedCall(2500, () => {
        if (core.active) {
          if (this.scene) this.scene.events.off("update", handleUpdate); // STOP listener
          core.destroy();
          glow.destroy();
        }
      });
    });
  }
  drawHealthBar() {
    this.hpBar.clear();
    const width = 300;
    const height = 15;
    const x = (this.scene.scale.width - width) / 2;
    const y = 50;
    // 1. Background (Shadow)
    this.hpBar.fillStyle(0x000000, 0.5);
    this.hpBar.fillRect(x, y, width, height);
    // 2. Health (Red)
    const healthPercentage = Math.max(0, this.hp / this.maxHp);
    this.hpBar.fillStyle(0xff0000, 1);
    this.hpBar.fillRect(x, y, width * healthPercentage, height);
  }
  die() {
    if (this.isDead) return;
    this.isDead = true;

    // 1. SHUT DOWN LOGIC
    if (this.fireTimer) this.fireTimer.remove();
    this.scene.tweens.killTweensOf(this);
    if (this.body) {
      this.body.setVelocity(0, 0);
      this.body.enable = false;
    }
    if (this.hpBar) {
      this.hpBar.clear();
      this.hpBar.destroy();
    }

    const deathScene = this.scene;

    // 2. ELITE STAGE: Internal Failures (Lightning & Shake)
    if (this.bossLevel >= 2) {
      // Shaking the craft itself like it's about to blow
      deathScene.tweens.add({
        targets: this,
        x: this.x + Phaser.Math.Between(-10, 10),
        duration: 50,
        yoyo: true,
        repeat: 20,
      });

      // Purple Lightning Arcs
      for (let i = 0; i < 8; i++) {
        deathScene.time.delayedCall(i * 150, () => {
          if (!this.active) return;
          const x1 = this.x + Phaser.Math.Between(-60, 60);
          const y1 = this.y + Phaser.Math.Between(-40, 40);
          const x2 = x1 + Phaser.Math.Between(-40, 40);
          const y2 = y1 + Phaser.Math.Between(-40, 40);

          const bolt = deathScene.add
            .line(0, 0, x1, y1, x2, y2, 0xff00ff, 1)
            .setOrigin(0, 0);
          deathScene.tweens.add({
            targets: bolt,
            alpha: 0,
            duration: 100,
            onComplete: () => bolt.destroy(),
          });
        });
      }
    }

    // 3. EXPLOSION CASCADE
    deathScene.time.addEvent({
      delay: 100,
      repeat: 12,
      callback: () => {
        const rx = this.x + Phaser.Math.Between(-60, 60);
        const ry = this.y + Phaser.Math.Between(-60, 60);
        const boom = deathScene.add
          .sprite(rx, ry, "flash")
          .setScale(Phaser.Math.FloatBetween(0.8, 1.5))
          .setTint(this.bossLevel >= 2 ? 0xff00ff : 0xffaa00); // Purple explosions for Elite
        deathScene.tweens.add({
          targets: boom,
          alpha: 0,
          duration: 250,
          onComplete: () => boom.destroy(),
        });
        deathScene.cameras.main.shake(150, 0.007);
      },
    });
    // 4. THE FINAL SHOCKWAVE (Level 2+ Only)
    deathScene.time.delayedCall(1300, () => {
      if (this.bossLevel >= 2) {
        const ring = deathScene.add.circle(this.x, this.y, 10, 0xffffff, 0.5);
        ring.setStrokeStyle(4, 0xff00ff);
        deathScene.tweens.add({
          targets: ring,
          radius: 400,
          alpha: 0,
          duration: 600,
          onComplete: () => ring.destroy(),
        });
      }
      // Final White Flash
      const finalBlast = deathScene.add
        .sprite(this.x, this.y, "flash")
        .setScale(6)
        .setDepth(100);
      deathScene.tweens.add({
        targets: finalBlast,
        alpha: 0,
        scale: 8,
        duration: 600,
        onComplete: () => finalBlast.destroy(),
      });
      deathScene.showGoldPopup(this.x, this.y, 500 * this.bossLevel);
      deathScene.events.emit("BOSS_DEFEATED");
      this.destroy();
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
  update() {
    if (this.isDead || !this.active) return;
    // ONLY execute this logic once when the boss reaches y = 150
    if (this.isEntering && this.y >= 150) {
      this.isEntering = false;
      // Fix: Access velocity directly to avoid the 'setVelocity' error
      if (this.body) {
        this.body.velocity.x = 0;
        this.body.velocity.y = 0;
      }
      // 1. Fade in the HP bar (Now runs only ONCE)
      this.scene.tweens.add({
        targets: this.hpBar,
        alpha: 1,
        duration: 1000,
      });
      // 2. Start movement (Now runs only ONCE)
      this.startPattern();
      // 3. Start firing (Now runs only ONCE)
      this.fireTimer = this.scene.time.addEvent({
        delay: 4000,
        callback: this.fire,
        callbackScope: this,
        loop: true,
      });
    }
  }
}
