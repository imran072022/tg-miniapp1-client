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
    this.load.image("nebula", "battlefieldBg.jpeg");
    this.load.image("plane", "plane.png");
    this.load.image("spaceship1", "spaceShip1.png");
    this.load.image("flash", "muzzleFlash.png");
    this.load.image("enemyType1", "enemyType1.png");
    this.load.image("enemyType2", "enemyType2.png");
    this.load.image("boss1", "boss1.png");
    this.load.image("helicopter", "helicopter.png");
    this.load.image("heliFan", "heliFan.png");
    this.load.image("boss3", "boss3.png");

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
