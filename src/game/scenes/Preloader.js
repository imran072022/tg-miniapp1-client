import Phaser from "phaser";

export class Preloader extends Phaser.Scene {
  constructor() {
    super("Preloader");
  }

  init(data) {
    this.initData = data || {};
  }

  preload() {
    this.load.path = "/assets/";
    // Background images
    this.load.image("nebula", "battlefieldBg.jpeg");
    this.load.image("stage1Entry", "stage1Entry.jpg");
    this.load.image("stage1Mid", "stage1Mid.jpg");
    this.load.image("stage1Exit", "stage1Exit.jpg");
    this.load.image("stage2Entry", "stage2Entry.jpg");
    this.load.image("stage2Mid", "stage2Mid.jpg");
    this.load.image("stage2Exit", "stage2Exit.jpg");
    this.load.image("temporaryBG", "temporaryBG.jpg");
    this.load.image("desertBG", "desertBG.jpg");
    // Player images
    this.load.image("vanguard", "vanguard.png");
    this.load.image("spaceship1", "spaceShip1.png");
    this.load.image("player3", "player3.png");
    this.load.image("player4", "player4.png");
    // Boss images
    this.load.image("boss1", "boss1.png");
    this.load.image("boss3", "boss3.png");
    this.load.image("boss4", "boss4.png");
    this.load.image("turret", "turret.png");
    // Enemy images
    this.load.image("enemyType1", "enemyType1.png");
    this.load.image("enemyType2", "enemyType2.png");
    this.load.image("helicopter", "helicopter.png");
    this.load.image("heliFan", "heliFan.png");
    this.load.image("flash", "muzzleFlash.png");

    // We still call this here or in create.
    // Usually, createTextures is best in create() to ensure the renderer is ready.
  }

  createTextures() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    // 1. NEW: ENERGY CAPSULE BULLET (Replaces the old neon_bullet)
    // Outer Glow Layer
    g.fillStyle(0xffffff, 0.3); // Semi-transparent white/cyan
    g.fillRoundedRect(0, 0, 10, 30, 5);
    // Inner Bright Core
    g.fillStyle(0xffffff, 1); // Solid white core
    g.fillRoundedRect(2, 4, 6, 22, 3);

    // We name it "energy_bullet" to distinguish it
    g.generateTexture("energy_bullet", 10, 30);
    g.clear();

    // 2. Fallback for enemy (Keeping your existing logic)
    g.fillStyle(0xff0000).fillRect(0, 0, 32, 32);
    g.generateTexture("e_1", 32, 32);
  }

  create() {
    // Generate the textures right before starting the game
    this.createTextures();

    // Start MainGame with the passed data
    this.scene.start("MainGame", this.initData);
  }
}
