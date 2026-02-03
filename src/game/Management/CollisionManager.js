import Phaser from "phaser";

export default class CollisionManager {
  constructor(scene) {
    this.scene = scene;
  }

  init(player, enemies, bullets, enemyBullets) {
    if (!player || !enemies || !bullets || !enemyBullets) {
      console.error(
        "CollisionManager: One or more physics groups are undefined!",
      );
      return;
    }
    // Collision A: Player bullets hit enemy
    this.scene.physics.add.overlap(bullets, enemies, (bullet, enemy) => {
      this.handlePlayerBulletHit(bullet, enemy);
    });
    // Collision B: Player vs Enemy
    this.scene.physics.add.overlap(player, enemies, (p, enemy) => {
      this.handlePlayerCrash(p, enemy);
    });
    // Collision C: Enemy Bullets vs Player
    this.scene.physics.add.overlap(player, enemyBullets, (p, bullet) => {
      this.handleEnemyBulletHit(p, bullet);
    });
  }
  // Proper method to be called when a boss spawns
  setupBossCollision(bullets, boss) {
    this.scene.physics.add.overlap(
      bullets,
      boss,
      (bossObj, bulletObj) => {
        this.handleBossHit(bossObj, bulletObj);
      },
      null,
      this,
    );
  }

  handlePlayerBulletHit(bullet, enemy) {
    const player = this.scene.player;
    if (!bullet.active || !enemy.active) return;
    // Use the ENEMY's position so effects are always centered on the target
    const targetX = enemy.x;
    const targetY = enemy.y;
    // 1. Vanguard Missile Logic
    if (bullet.isMissile) {
      player.triggerMissileExplosion(targetX, targetY);
      bullet.destroy();
      return;
    }
    // 2. StormSilver / General Impact FX
    if (player.triggerImpactFX) {
      const hitColor = bullet.tintTopLeft || 0x00ffff;
      player.triggerImpactFX(targetX, targetY, hitColor);
    }
    // 3. Sparking Logic
    const sparkColor = bullet.tintTopLeft || 0xff00ff;
    const isBoss = enemy.maxHP > 1000 || enemy.isBoss;
    this.scene.createImpactSparks(targetX, targetY, sparkColor, isBoss);
    // 4. Damage & Super Charge Logic
    if (enemy.active && !enemy.isDead) {
      enemy.takeDamage(10);
      // If enemy dies, show gold popup at their last position
      if (enemy.hp <= 0) {
        this.scene.showGoldPopup(targetX, targetY, 10);
      }

      bullet.destroy();

      // Super Charge Logic
      player.ultCharge = Math.min(player.ultCharge + player.ultGainRate, 100);
      this.scene.superBtn.updateCharge(player.ultCharge);

      if (player.ultCharge >= 100) {
        player.isUltReady = true;
        this.scene.superBtn.setReady(true);
      }
    }
  }

  handlePlayerCrash(player, enemy) {
    if (enemy.active && !enemy.isDead) {
      const ex = enemy.x;
      const ey = enemy.y;
      // Check if it's the kamikaze drone to trigger a special effect
      if (enemy.texture.key === "kamikazeDrone") {
        this.scene.cameras.main.shake(200, 0.02);
        // 2. Trigger the explosion effect you already have for projectiles
        this.scene.createImpactSparks(ex, ey, 0xff0000, true);
        // 3. Higher damage for the drone crash
        player.takeDamage(30);
      } else {
        // Normal crash damage
        player.takeDamage(20);
      }

      enemy.die();
      this.scene.showGoldPopup(ex, ey, 10);
    }
  }
  handleEnemyBulletHit(player, bullet) {
    if (this.scene.isGameOver) return;
    bullet.destroy();
    player.takeDamage(10);
  }
  handleBossHit(boss, bullet) {
    if (!bullet.active || !boss.active) return;
    // 1. Floating Damage Text
    const damageAmount = 10;
    const damageText = this.scene.add
      .text(bullet.x, bullet.y, `-${damageAmount}`, {
        fontSize: "20px",
        fill: "#ffffff",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 3,
      })
      .setOrigin(0.5)
      .setDepth(200);
    this.scene.tweens.add({
      targets: damageText,
      y: bullet.y - 60,
      x: bullet.x + Phaser.Math.Between(-25, 25),
      alpha: 0,
      duration: 800,
      onComplete: () => damageText.destroy(),
    });
    // 2. StormSilver/Vanguard specific FX
    if (this.scene.player.triggerImpactFX) {
      const hitColor = bullet.tintTopLeft || 0x00ffff;
      this.scene.player.triggerImpactFX(bullet.x, bullet.y, hitColor);
    }
    // 3. Cleanup and Damage
    bullet.destroy();
    boss.takeDamage(damageAmount);
    // 4. Boss Hit Shake
    this.scene.cameras.main.shake(100, 0.008);
  }
}
