import Phaser from "phaser";

export class ShopScene extends Phaser.Scene {
  constructor() {
    super("ShopScene");
  }

  async init(data) {
    this.userId = data.userId;
    this.currentGold = data.totalBalance;
  }

  create() {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x111111);
    this.add
      .text(width / 2, 50, "SPACE SHOP", { fontSize: "32px", fill: "#FFD700" })
      .setOrigin(0.5);
    this.add
      .text(width / 2, 90, `YOUR GOLD: ${this.currentGold}`, { fill: "#fff" })
      .setOrigin(0.5);

    // Example Item: Shield Upgrade
    this.createShopItem(width / 2, 200, "SHIELD BOOST", 500, () => {
      this.buyItem("shield_upgrade", 500);
    });

    // Back Button
    const backBtn = this.add
      .text(width / 2, height - 50, "BACK TO GAME", { fill: "#0f0" })
      .setOrigin(0.5)
      .setInteractive();
    backBtn.on("pointerdown", () => this.scene.start("MainGame"));
  }

  createShopItem(x, y, name, price, callback) {
    const btn = this.add.rectangle(x, y, 300, 60, 0x333333).setInteractive();
    this.add.text(x, y - 10, name, { fontSize: "18px" }).setOrigin(0.5);
    this.add
      .text(x, y + 15, `Price: ${price} Gold`, {
        fontSize: "14px",
        fill: "#FFD700",
      })
      .setOrigin(0.5);

    btn.on("pointerdown", callback);
  }

  async buyItem(itemId, price) {
    if (this.currentGold < price) {
      alert("Not enough gold!");
      return;
    }

    // Tell MongoDB to subtract gold
    try {
      const response = await fetch("http://localhost:3000/api/addGold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: this.userId, goldToAdd: -price }),
      });
      const result = await response.json();
      this.currentGold = result.newBalance;
      this.scene.restart({
        userId: this.userId,
        totalBalance: this.currentGold,
      });
    } catch (e) {
      console.error("Purchase failed");
    }
  }
}
