import Phaser from "phaser";
import Projectile from "../../abilities/Projectiles";
import BasePlayer from "./BasePlayer";

export default class CyberPulse808 extends BasePlayer {
  constructor(scene, x, y) {
    super(scene, x, y, "player4", {
      hp: 120000,
      fireRate: 800,
      bVel: -250,
      bScale: 0.5,
      scale: 1.8,
    });

    // Legendary Glow - Keeping it Yellow/Gold as requested
    this.setTint(0xffcc00);
  }

  fire(time) {
    const nozzles = [
      { xOff: -40, vx: -400 }, // Starts left, shoots toward LEFT wall
      { xOff: 40, vx: 400 }, // Starts right, shoots toward RIGHT wall
    ];

    nozzles.forEach((n) => {
      const bullet = new Projectile(
        this.scene,
        this.x + n.xOff,
        this.y - 30,
        "energy_bullet",
        this,
      );
      this.scene.bullets.add(bullet);

      // 1. ENABLE BOUNCING
      // This allows the bullet to hit the screen edge and reflect
      bullet.body.setCollideWorldBounds(true);
      bullet.body.setBounce(1, 0); // 100% bounce on X, 0% on Y

      // 2. VELOCITY
      bullet.body.setVelocity(n.vx, this.bulletVel);

      // 3. DYNAMIC ROTATION (Essential for Bouncing)
      // We update the rotation every frame so the capsule "turns" when it hits the wall
      bullet.update = () => {
        if (bullet.body.blocked.left || bullet.body.blocked.right) {
          // Squash effect: make it wide and short for one frame on impact
          bullet.setScale(2.0, 0.4);

          // Then snap it back to its diagonal capsule shape
          this.scene.tweens.add({
            targets: bullet,
            scaleX: 1.5,
            scaleY: 0.8,
            duration: 100,
          });
        }
      };

      // 4. CAPSULE VISUALS
      bullet.setScale(1.5, 0.8);
      bullet.setTint(0xff4400);
      bullet.setBlendMode(Phaser.BlendModes.ADD);
    });
  }
  // --- THE FIRST SUPER SYSTEM ---
  activateSuper() {
    let missileCount = 0;
    const totalMissiles = 6;

    this.scene.time.addEvent({
      delay: 150,
      repeat: totalMissiles - 1,
      callback: () => {
        const missile = new Projectile(
          this.scene,
          this.x,
          this.y,
          "missile_img",
          this,
        );
        this.scene.bullets.add(missile);

        // Missiles start with random horizontal drift
        missile.body.setVelocity(Phaser.Math.Between(-200, 200), -300);
        missile.setTint(0xffcc00); // Legendary Missiles

        // Add a "boost" after a short delay
        this.scene.time.delayedCall(300, () => {
          if (missile.active) missile.body.setVelocityY(-1200);
        });

        missileCount++;
      },
    });

    // Screen shake to feel the "Legendary" power
    this.scene.cameras.main.shake(500, 0.01);
  }
}
