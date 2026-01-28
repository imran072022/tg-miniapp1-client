import Phaser from "phaser";

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, hp, type = "STRAIGHT") {
    super(scene, x, y, texture);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    if (this.body instanceof Phaser.Physics.Arcade.Body) {
      this.body.allowGravity = false;
      this.setCollideWorldBounds(true);
      this.setBounce(1, 0);
    }

    this.setDepth(5);
    this.hp = hp || 20;
    this.maxHp = this.hp;
    this.isDead = false;
    this.enemyType = type;
    this.startX = x;
    this.randomOffset = Math.random() * 1000;

    // --- Helicopter Specific Setup ---
    if (this.enemyType === "HELI") {
      this.fan = scene.add.sprite(this.x, this.y, "heliFan");
      this.fan.setDepth(6);
      this.stopY = Phaser.Math.Between(100, 250);
      this.isStationary = false;

      // Helicopter Firing Timer
      this.fireTimer = scene.time.addEvent({
        delay: 2000,
        callback: this.shootAtPlayer,
        callbackScope: this,
        loop: true,
      });
    }

    this.hpBar = scene.add.graphics();
    this.drawHealthBar();
  }

  drawHealthBar() {
    this.hpBar.clear();
    if (this.isDead || !this.active) return;
    const x = this.x - 20;
    const y = this.y - 35;
    this.hpBar.fillStyle(0x000000, 0.8);
    this.hpBar.fillRect(x, y, 40, 6);
    const healthWidth = (this.hp / this.maxHp) * 40;
    const color = this.hp > this.maxHp * 0.3 ? 0x00ff00 : 0xff0000;
    this.hpBar.fillStyle(color, 1);
    this.hpBar.fillRect(x, y, healthWidth, 6);
  }

  shootAtPlayer() {
    if (this.isDead || !this.active || !this.isStationary) return;

    // 1. Create muzzle flash spark
    const spark = this.scene.add.sprite(this.x, this.y + 25, "flash");
    spark.setScale(0.4).setAlpha(0.8).setDepth(7);
    this.scene.tweens.add({
      targets: spark,
      scale: 0.6,
      alpha: 0,
      duration: 100,
      onComplete: () => spark.destroy(),
    });

    // 2. Create the bullet
    const bullet = this.scene.physics.add.sprite(
      this.x,
      this.y + 20,
      "energy_bullet",
    );

    // 3. Add to the group in MainGame (so collisions work)
    if (this.scene.enemyBullets) {
      this.scene.enemyBullets.add(bullet);
    }

    // 4. Set Physics Properties
    bullet.setScale(0.5).setTint(0xffaa00).setDepth(4);
    if (bullet.body) {
      bullet.body.allowGravity = false;
      bullet.body.setVelocityY(150); // The slow speed you wanted
    }

    // 5. Cleanup (Destroy if it leaves screen)
    // Using a simple check in the scene's update is better,
    // but this delayed call is a safe backup.
    this.scene.time.delayedCall(4000, () => {
      if (bullet && bullet.active) bullet.destroy();
    });
  }

  takeDamage(amount) {
    if (this.isDead) return;
    this.hp -= amount;
    this.setTint(0xffffff);
    this.scene.time.delayedCall(50, () => {
      if (this.active) {
        if (this.scene.currentLevel > 1) {
          this.setTint(0xff00ff); // Stay Purple!
        } else if (this.enemyType === "ZIGZAG") {
          this.setTint(0x00ff00); // Stay Green!
        } else {
          this.clearTint();
        }
      }
    });
    if (this.hp <= 0) this.die();
  }

  die() {
    this.isDead = true;
    if (this.hpBar) this.hpBar.destroy();
    if (this.fan) this.fan.destroy();
    if (this.fireTimer) this.fireTimer.remove();

    const explorer = this.scene.add.particles(this.x, this.y, "e_1", {
      speed: { min: -100, max: 100 },
      angle: { min: 0, max: 360 },
      scale: { start: 0.2, end: 0 },
      lifespan: 500,
      gravityY: 200,
      quantity: 10,
      emitting: false,
    });
    explorer.explode();
    this.scene.time.delayedCall(500, () => explorer.destroy());
    this.destroy();
  }

  update(time) {
    if (this.isDead || !this.active) return;
    this.drawHealthBar();

    // Helicopter Behavior
    if (this.enemyType === "HELI") {
      if (this.fan) {
        this.fan.x = this.x;
        this.fan.y = this.y;
        this.fan.angle += 15;
      }
      if (!this.isStationary && this.y >= this.stopY) {
        this.isStationary = true;
        if (this.body) this.body.setVelocityY(0);
      }
    }

    // Cleanup off-screen
    if (this.y > this.scene.scale.height + 50) {
      if (this.fan) this.fan.destroy();
      if (this.fireTimer) this.fireTimer.remove();
      this.hpBar.destroy();
      this.destroy();
    }
  }
}
