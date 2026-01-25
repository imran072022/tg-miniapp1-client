import Phaser from "phaser";

export class MainGame extends Phaser.Scene {
  constructor() {
    super("MainGame");
  }

  // init receives data from PhaserGame.js wrapper
  init(data) {
    this.onEnd = data.onEnd;
    this.stats = data.stats;
    this.equippedCard = data.equippedCard || "STARTER";
    this.selectedLevel = data.selectedLevel;

    // Telegram / User Logic
    if (window.Telegram && window.Telegram.WebApp) {
      const webAppData = window.Telegram.WebApp.initDataUnsafe;
      this.userId = webAppData.user
        ? webAppData.user.id.toString()
        : "dev_user";
    } else {
      this.userId = "dev_user";
    }

    this.initStats();
  }

  initStats() {
    this.hp = 100;
    this.gold = 0;
    this.difficulty = 1;
    this.fireRate = 400;
    this.isGameOver = false;
    this.hasDoubleShot = false;
    this.ultimateEnergy = 0;
    this.isUltimateActive = false;
  }

  preload() {
    this.load.image("nebula", "assets/battlefieldBg.jpeg");
    this.load.image("plane", "assets/plane.png");
  }

  create() {
    const { width, height } = this.scale;

    // 1. Background & Groups
    this.bg = this.add.tileSprite(
      width / 2,
      height / 2,
      width,
      height,
      "nebula",
    );
    this.bullets = this.physics.add.group();
    this.enemies = this.physics.add.group();
    this.boosters = this.physics.add.group();

    // 2. Player setup
    this.player = this.physics.add.sprite(width / 2, height - 100, "plane");
    this.player.setScale(0.25).setDepth(10).setCollideWorldBounds(true);

    // SMOOTHNESS: Add friction/drag (call after player exists)
    this.player.setDragX(1500);
    this.player.setDamping(false); // Using velocity-based movement
    this.createTextures();

    // 3. UI
    this.goldText = this.add.text(20, 20, `GOLD: ${this.gold}`, {
      fontSize: "20px",
      fill: "#FFD700",
      fontStyle: "bold",
    });
    this.hpBar = this.add.graphics();
    this.ultBar = this.add.graphics();
    this.updateUI();

    // 4. Ultimate Button
    this.ultBtn = this.add.container(width - 60, height - 60).setDepth(20);
    const ultCircle = this.add
      .circle(0, 0, 35, 0x333333)
      .setStrokeStyle(2, 0xffffff);
    this.ultText = this.add
      .text(0, 0, "ULT", { fontSize: "18px" })
      .setOrigin(0.5);
    this.ultBtn.add([ultCircle, this.ultText]);
    this.ultBtn.setInteractive(
      new Phaser.Geom.Circle(0, 0, 35),
      Phaser.Geom.Circle.Contains,
    );
    this.ultBtn.on("pointerdown", () => this.fireIronBeam());

    // 5. Timers
    this.fireTimer = this.time.addEvent({
      delay: this.fireRate,
      callback: this.fire,
      callbackScope: this,
      loop: true,
    });
    this.spawnTimer = this.time.addEvent({
      delay: 1200,
      callback: this.spawnEnemyBatch,
      callbackScope: this,
      loop: true,
    });
    this.time.addEvent({
      delay: 8000,
      callback: this.spawnBooster,
      callbackScope: this,
      loop: true,
    });

    // 6. Input & Collisions
    this.cursors = this.input.keyboard.createCursorKeys(); // CRITICAL: Define cursors here

    this.physics.add.overlap(this.bullets, this.enemies, (b, e) =>
      this.hitEnemy(b, e),
    );
    this.physics.add.overlap(this.player, this.enemies, (p, e) =>
      this.playerHit(e),
    );
    this.physics.add.overlap(this.player, this.boosters, (p, b) =>
      this.collectBooster(b),
    );
  }

  update() {
    const { height } = this.scale; // Only take height since we need it for the bottom limit

    // 1. Pause Logic
    if (this.game.isPaused) {
      this.physics.pause();
      return;
    } else {
      this.physics.resume();
    }

    if (this.isGameOver) return;

    // 2. Scroll Background
    this.bg.tilePositionY -= 2;

    // 3. SMOOTH MOVEMENT
    // Reset velocity so keys don't get stuck
    this.player.setVelocityX(0);

    // KEYBOARD
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-450);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(450);
    }
    // TOUCH (Buttery Smooth Follow)
    else if (this.input.activePointer.isDown) {
      // Ignore pointer events that originate from DOM UI (buttons/modals)
      const pointer = this.input.activePointer;
      const target = pointer.event && pointer.event.target;
      const isCanvasTarget =
        target &&
        (target.tagName === "CANVAS" || target.id === "game-container");
      if (isCanvasTarget) {
        // We don't need 'width' here because we follow the pointer's exact X position
        // 0.15 is the "sweet spot" for smoothness.
        this.player.x = Phaser.Math.Linear(this.player.x, pointer.x, 0.15);
      }
    }

    // 4. PREVENT CUT-OFF
    // This keeps the plane at a fixed distance from the bottom regardless of screen size
    const paddingFromBottom = 120;
    this.player.y = height - paddingFromBottom;
  }

  // --- HELPER METHODS ---

  createTextures() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    // Neon Bullet
    g.fillStyle(0xffffff, 1).fillCircle(10, 10, 4);
    g.generateTexture("neon_bullet", 20, 20);
    g.clear();
    // Enemy
    g.fillStyle(0xff0000, 1).fillTriangle(0, 30, 30, 30, 15, 0);
    g.generateTexture("e_1", 30, 30);
    g.clear();
    // Booster
    g.fillStyle(0xffff00, 1).fillCircle(15, 15, 10);
    g.generateTexture("b_double", 30, 30);
    g.clear();
    // Ultimate Beam
    g.fillStyle(0xffffff, 0.8).fillRect(0, 0, 40, 800);
    g.generateTexture("iron_beam", 40, 800);
  }

  fire() {
    if (this.isGameOver || this.isUltimateActive || this.game.isPaused) return;
    if (this.hasDoubleShot) {
      this.createBullet(this.player.x - 15);
      this.createBullet(this.player.x + 15);
    } else {
      this.createBullet(this.player.x);
    }
  }

  createBullet(x) {
    const b = this.bullets.create(x, this.player.y - 20, "neon_bullet");
    b.body.setVelocityY(-600);
    if (this.equippedCard === "TITAN") b.setTint(0xffaa00).setScale(1.5);
    if (this.equippedCard === "PLASMA") b.setTint(0x00ffff);
  }

  spawnEnemyBatch() {
    if (this.isGameOver || this.game.isPaused) return;
    const e = this.enemies.create(
      Phaser.Math.Between(50, this.scale.width - 50),
      -50,
      "e_1",
    );
    e.body.setVelocityY(200 + this.difficulty * 2);
    this.difficulty += 0.1;
  }

  playerHit(enemy) {
    enemy.destroy();
    this.hp -= 25;
    this.cameras.main.shake(200, 0.01);
    this.updateUI();
    if (this.hp <= 0) this.triggerGameOver();
  }

  updateUI() {
    this.hpBar.clear().fillStyle(0x333333).fillRect(20, 50, 100, 8);
    this.hpBar.fillStyle(0x00ff00).fillRect(20, 50, this.hp, 8);

    this.ultBar.clear().fillStyle(0x333333).fillRect(20, 65, 100, 6);
    this.ultBar.fillStyle(0x00aaff).fillRect(20, 65, this.ultimateEnergy, 6);
  }

  async triggerGameOver() {
    this.isGameOver = true;
    this.physics.pause();

    // Call the React onEnd callback to show the Result Overlay in App.js
    if (this.onEnd) {
      this.onEnd(this.gold);
    }
  }

  fireIronBeam() {
    if (this.ultimateEnergy < 100 || this.isUltimateActive) return;
    this.isUltimateActive = true;
    this.ultimateEnergy = 0;
    this.updateUI();

    const beam = this.add
      .sprite(this.player.x, this.player.y, "iron_beam")
      .setOrigin(0.5, 1);
    this.tweens.add({
      targets: beam,
      alpha: 0,
      duration: 1000,
      onUpdate: () => {
        beam.x = this.player.x;
        this.enemies.children.each((e) => {
          if (e && Math.abs(e.x - beam.x) < 40) e.destroy();
        });
      },
      onComplete: () => {
        beam.destroy();
        this.isUltimateActive = false;
      },
    });
  }

  spawnBooster() {
    if (this.isGameOver || this.game.isPaused) return;
    const b = this.boosters.create(
      Phaser.Math.Between(50, this.scale.width - 50),
      -50,
      "b_double",
    );
    b.body.setVelocityY(150);
  }

  collectBooster(booster) {
    booster.destroy();
    this.hasDoubleShot = true;
    this.time.delayedCall(5000, () => (this.hasDoubleShot = false));
  }

  hitEnemy(bullet, enemy) {
    bullet.destroy();
    this.gold += 10;
    this.goldText.setText(`GOLD: ${this.gold}`);
    this.ultimateEnergy = Math.min(100, this.ultimateEnergy + 10);
    this.updateUI();
    enemy.destroy();
  }
}
