import Phaser from "phaser";
import BaseEnemy from "../BaseEnemy/BaseEnemy";

export default class KamikazeDrone extends BaseEnemy {
  constructor(scene, x, y) {
    // Low HP (Tier 1), fast and cheap
    super(scene, x, -50, "kamikazeDrone", { hp: 40, goldValue: 50 });

    this.setScale(1.5); // Drones should be smaller than Type 2
    this.wobbleAmount = 0;
    this.isDashing = false;

    // Give it a subtle red tint for that "red light" look
    this.bodyColor = 0xff8888;
    this.setTint(this.bodyColor);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    if (this.isDead || !this.body || !this.scene.player) return;

    // 1. WOBBLE EFFECT: Move left/right slightly while falling
    if (!this.isDashing) {
      this.wobbleAmount += 0.1;
      this.body.setVelocityX(Math.sin(this.wobbleAmount) * 100);

      // 2. DETECTION: If player is close, start the Dash
      const dist = Phaser.Math.Distance.Between(
        this.x,
        this.y,
        this.scene.player.x,
        this.scene.player.y,
      );
      if (dist < 300) {
        this.startDash();
      }
    }
  }

  startDash() {
    if (this.isDashing) return;
    this.isDashing = true;

    // Point the drone toward the player
    const angle = Phaser.Math.Angle.Between(
      this.x,
      this.y,
      this.scene.player.x,
      this.scene.player.y,
    );
    this.rotation = angle + Math.PI / 2;

    // Flash bright red before dashing
    this.setTint(0xff0000);

    // DASH! Move fast toward player's position
    this.scene.physics.velocityFromRotation(angle, 450, this.body.velocity);
  }

  // Override die to add a specific explosion effect if you want later
  die() {
    if (this.isDead) return;
    // You can add a sound or a smaller explosion here
    super.die();
  }
}
