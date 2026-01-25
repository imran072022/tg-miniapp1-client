import Phaser from "phaser";

export class HomeScene extends Phaser.Scene {
  constructor() {
    super("HomeScene");
  }

  create() {
    const { width, height } = this.scale;

    // 1. BACKGROUND
    this.add
      .image(width / 2, height / 2, "nebula")
      .setDisplaySize(width, height);

    // 2. MAIN "START" AREA (Center)
    const startCircle = this.add
      .circle(width / 2, height / 2 - 50, 80, 0x00ffff, 0.2)
      .setStrokeStyle(3, 0x00ffff);
    this.add
      .text(width / 2, height / 2 - 50, "BATTLE", {
        fontSize: "28px",
        fontStyle: "bold",
      })
      .setOrigin(0.5);
    startCircle
      .setInteractive()
      .on("pointerdown", () => this.scene.start("MainGame"));

    // 3. BOTTOM NAVIGATION BAR
    const navY = height - 60;
    const navBg = this.add
      .rectangle(width / 2, navY, width, 80, 0x000000, 0.8)
      .setDepth(100);

    // Create 3 Sections
    const sectionWidth = width / 3;

    // CARDS (Left)
    this.createNavButton(sectionWidth * 0.5, navY, "CARDS", "CardsScene");

    // HOME (Center) - Highlighted
    this.createNavButton(sectionWidth * 1.5, navY, "HOME", "HomeScene", true);

    // SHOP (Right)
    this.createNavButton(sectionWidth * 2.5, navY, "SHOP", "ShopScene");
  }

  createNavButton(x, y, label, sceneKey, isActive = false) {
    const text = this.add
      .text(x, y, label, {
        fontSize: "16px",
        fill: isActive ? "#00ffff" : "#ffffff",
        fontStyle: isActive ? "bold" : "normal",
      })
      .setOrigin(0.5)
      .setDepth(101)
      .setInteractive();

    text.on("pointerdown", () => {
      if (!isActive) this.scene.start(sceneKey);
    });
  }
}
