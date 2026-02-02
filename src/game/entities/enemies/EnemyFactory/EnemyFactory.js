import Type1Enemy from "../Types/Type1";

export const EnemyTypes = {
  // Now this matches your spawnEnemy default parameter exactly
  Type1Enemy: Type1Enemy,
  Type1: Type1Enemy, // Keeping this for WaveConfig compatibility
};

// entities/enemies/EnemyFactory/EnemyFactory.js
export class EnemyFactory {
  static spawn(scene, type, x, y) {
    const EnemyClass = EnemyTypes[type] || Type1Enemy;
    const enemy = new EnemyClass(scene, x, y);

    // 1. Add to group FIRST
    scene.enemies.add(enemy);

    // 2. RE-APPLY physics immediately after joining the group
    // This is the only way to stop the group from "breaking" the bounce
    if (enemy.body) {
      // Only Type1 (ZigZag) needs these specific settings
      if (type === "Type1" || type === "Type1Enemy") {
        enemy.body.setCollideWorldBounds(true);
        enemy.body.setBounce(1, 0);

        const centerX = scene.scale.width / 2;
        const speedX = x < centerX ? 150 : -150;
        enemy.body.setVelocity(speedX, 160);
      } else {
        // Future enemies (Type 2, 3) might just go straight
        enemy.body.setVelocityY(150);
      }
    }

    return enemy;
  }
}
