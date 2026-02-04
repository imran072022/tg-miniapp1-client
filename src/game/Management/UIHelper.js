import Phaser from "phaser";
export default class UIHelper {
  constructor(scene) {
    this.scene = scene;
  }

  /**
   * Displays a cinematic banner across the center of the screen
   * @param {string} title - Large main text (e.g., "WAVE 3")
   * @param {string} subtitle - Smaller descriptive text (e.g., "THE FIREFIGHT")
   * @param {number} color - Hex color for the text
   */
  showWaveBanner(title, subtitle, color = 0x00ffff) {
    const { width, height } = this.scene.scale;
    const centerY = height / 2;

    // 1. Create the Black Bar
    const bar = this.scene.add
      .rectangle(0, centerY, width, 120, 0x000000, 0.7)
      .setOrigin(0, 0.5)
      .setDepth(1000)
      .setScale(0, 1); // Start thin

    // 2. Create Text
    const titleText = this.scene.add
      .text(width / 2, centerY - 20, title, {
        fontSize: "52px",
        fontWeight: "bold",
        fill: "#ffffff",
        fontFamily: "Arial",
      })
      .setOrigin(0.5)
      .setDepth(1001)
      .setAlpha(0);

    const subText = this.scene.add
      .text(width / 2, centerY + 30, subtitle, {
        fontSize: "22px",
        fill: "#00ffff",
        fontFamily: "Arial",
      })
      .setOrigin(0.5)
      .setDepth(1001)
      .setAlpha(0);

    // 3. New Timeline Syntax (Phaser 3.60+)
    const timeline = this.scene.add.timeline([
      {
        at: 0,
        tween: {
          targets: bar,
          scaleX: 1,
          duration: 400,
          ease: "Cubic.easeOut",
        },
      },
      {
        at: 200,
        tween: {
          targets: [titleText, subText],
          alpha: 1,
          y: "-=10",
          duration: 500,
        },
      },
      {
        at: 2500, // Hold and then fade everything
        tween: {
          targets: [bar, titleText, subText],
          alpha: 0,
          duration: 800,
          onComplete: () => {
            bar.destroy();
            titleText.destroy();
            subText.destroy();
          },
        },
      },
    ]);

    timeline.play();
  }
}
