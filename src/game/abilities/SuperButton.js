import Phaser from "phaser";

export default class SuperButton extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    super(scene, x, y);
    this.scene = scene;
    this.charge = 0;
    this.maxCharge = 100;
    this.isReady = false;

    // 1. Base Button Circle (Dark Background)
    this.bg = scene.add.circle(0, 0, 40, 0x000000, 0.6);
    this.bg.setStrokeStyle(2, 0xffffff, 0.5);

    // 2. The Icon (A small missile or star icon)
    this.icon = scene.add
      .image(0, 0, "energy_bullet")
      .setScale(0.8)
      .setAlpha(0.5);

    // 3. The Filling Ring (Graphics)
    this.ring = scene.add.graphics();

    this.add([this.bg, this.icon, this.ring]);
    scene.add.existing(this);

    // Fix to camera
    this.setScrollFactor(0);
    this.setDepth(2000); // Top of everything

    // Single, clean listener
    // 1. Make ONLY the container interactive
    this.setInteractive(
      new Phaser.Geom.Circle(0, 0, 40),
      Phaser.Geom.Circle.Contains,
    );

    this.on("pointerdown", (pointer, localX, localY, event) => {
      // Stop the event here so the plane NEVER moves when clicking this area
      event.stopPropagation();
      this.scene.isTouchingUI = true;
      if (this.isReady) {
        this.onPressed();
      } else {
        // Optional: Add a tiny "shake" to show the button is clicked but not ready
        this.scene.tweens.add({
          targets: this,
          x: this.x + 2,
          duration: 50,
          yoyo: true,
          repeat: 2,
        });
      }
    });

    // Final cleanup: Remove this line once you see the green circle is in the right place
    // this.scene.input.enableDebug(this);

    // To see the new correct hit area (it should now overlap your button perfectly)
    this.scene.input.enableDebug(this);
    // Add this temporarily to see where the button 'thinks' it is
    this.scene.input.enableDebug(this.bg);
  }

  updateCharge(currentCharge) {
    this.charge = currentCharge;
    this.drawRing();

    if (this.charge >= this.maxCharge && !this.isReady) {
      this.setReady(true);
    }
  }

  drawRing() {
    this.ring.clear();
    const radius = 38;
    const progress = this.charge / this.maxCharge;

    // Draw the yellow progress arc
    this.ring.lineStyle(6, 0xffd700, 1);
    // Starting from top (-90 degrees)
    this.ring.beginPath();
    this.ring.arc(
      0,
      0,
      radius,
      Phaser.Math.DegToRad(-90),
      Phaser.Math.DegToRad(-90 + progress * 360),
      false,
    );
    this.ring.strokePath();
  }

  setReady(ready) {
    this.isReady = ready;
    if (ready) {
      this.icon.setAlpha(1).setTint(0xffffff);
      // Add the "Glow" animation
      this.scene.tweens.add({
        targets: this.bg,
        scale: 1.1,
        alpha: 0.8,
        duration: 400,
        yoyo: true,
        repeat: -1,
      });
    } else {
      this.scene.tweens.killTweensOf(this.bg);
      this.bg.setScale(1);
      this.icon.setAlpha(0.5).clearTint();
    }
  }

  onPressed() {
    if (this.isReady) {
      this.scene.player.launchSuper();
      this.charge = 0;
      this.updateCharge(0);
      this.setReady(false);
      this.scene.tweens.add({
        targets: this.bg,
        scale: 0.8,
        duration: 50,
        yoyo: true,
      });
    }
  }
}
