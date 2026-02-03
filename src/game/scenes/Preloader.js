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

    this.load.image("flash", "muzzleFlash.png");
    this.load.image("Type2Enemy", "Enemy/Type2Enemy.png");
    this.load.image("enemy2", "Enemy/enemy2.png");
  }

  createTextures() {
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    // Outer Layer
    g.fillStyle(0xffffff, 0.3);
    g.fillRoundedRect(0, 0, 10, 30, 5);
    // Inner Core
    g.fillStyle(0xffffff, 1);
    g.fillRoundedRect(2, 4, 6, 22, 3);
    g.generateTexture("base-rounded-bullet", 10, 30);
    g.clear();

    // A realistic radial glow: multiple layers of fading circles
    // 1. Outer cyan halo
    g.fillStyle(0x00ffff, 0.2);
    g.fillCircle(20, 20, 20);
    // 2. Middle "Hot" blue
    g.fillStyle(0x88ffff, 0.5);
    g.fillCircle(20, 20, 12);
    // 3. Pure White Core (This provides the "Whitish" look)
    g.fillStyle(0xffffff, 1);
    g.fillCircle(20, 20, 6);

    g.generateTexture("launch_glimpse", 40, 40);
  }

  create() {
    // Generate the textures right before starting the game
    this.createTextures();
    // Start MainGame with the passed data
    this.scene.start("MainGame", this.initData);
  }
}
