import BaseBoss from "./BaseBoss.js";

export default class GuardianBoss extends BaseBoss {
  constructor(scene, x, y) {
    // 1. Initialize the BaseBoss first
    super(scene, x, y, "boss1", 1, 1000);

    // 2. Setup our custom variables
    this.fireAngle = 0;
    this.rotationSpeed = 0.04;
    this.radiusX = 140;
    this.radiusY = 55;
    this.setOrigin(0.5, 0.5);
    // 3. FORCE START: Make sure it has velocity immediately
    if (this.body) {
      this.body.setVelocityY(100);
    }
  }

  update(time, delta) {
    if (!this.active || !this.body) return;

    // 1. Entrance Logic
    if (this.isEntering) {
      if (this.y < 150) {
        this.body.setVelocityY(100);
      } else {
        this.body.setVelocityY(0);
        this.y = 150;
        this.isEntering = false;
        this.startAttackTimer();
      }
    }

    // 2. THE LATIM SPIN (Faking 3D rotation)
    if (!this.isEntering && !this.isDead) {
      // Increase our internal timer
      this.fireAngle += 0.1;

      // This makes the ship "flip" side to side like a spinning top
      // Math.cos makes it go from 1 to 0 to -1 and back
      this.scaleX = Math.cos(this.fireAngle);
    }
  }
  startAttackTimer() {
    this.fireTimer = this.scene.time.addEvent({
      delay: 150, // Change from 1800 to 150 just for this test!
      callback: () => this.firePerspectiveBurst(),
      loop: true,
    });
  }
  firePerspectiveBurst() {
    for (let i = 0; i < 6; i++) {
      const nozzleAngle = this.fireAngle + (i * (Math.PI * 2)) / 6;
      const bx = this.x + Math.cos(nozzleAngle) * this.radiusX;
      const by = this.y + Math.sin(nozzleAngle) * this.radiusY;
      const isBehind = Math.sin(nozzleAngle) < 0;

      this.spawn3DBullet(bx, by, nozzleAngle, isBehind);
    }
  }

  spawn3DBullet(x, y, angle, isBehind) {
    // 1. Create a "Muzzle Flash" at the nozzle point
    const flash = this.scene.add.circle(x, y, 15, 0xffffff, 0.8);
    this.scene.tweens.add({
      targets: flash,
      scale: 0,
      alpha: 0,
      duration: 200,
      onComplete: () => flash.destroy(),
    });

    // 2. Create the fireball
    const bullet = this.scene.add.circle(x, y, 7, 0xff7700);
    this.scene.physics.add.existing(bullet);

    // Set Depth and Scale
    bullet.setDepth(isBehind ? this.depth - 1 : this.depth + 1);
    bullet.setScale(isBehind ? 0.7 : 1.3);

    // 3. Increase bullet speed so the "rounding" looks sharper
    const speed = 350;
    bullet.body.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
  }
}
