import Type1Enemy from "../Types/Type1";
import Type2Enemy from "../Types/Type2Enemy"; // Import the new class

export const EnemyTypes = {
  Type1: Type1Enemy,
  Type2: Type2Enemy,
};

export class EnemyFactory {
  static spawn(scene, type, x, y) {
    const EnemyClass = EnemyTypes[type] || Type1Enemy;
    const enemy = new EnemyClass(scene, x, y);
    scene.enemies.add(enemy);

    // Movement for Type 2 (Heavy) - Slow descent, no bounce
    if (type === "Type2" || type === "Type2Enemy") {
      enemy.body.setVelocityY(40);
      enemy.body.setCollideWorldBounds(false);
    }
    // Keep your existing Type1 logic here...
    else if (enemy.body && (type === "Type1" || type === "Type1Enemy")) {
      enemy.body.setCollideWorldBounds(true);
      enemy.body.setBounce(1, 0);
      const speedX = x < scene.scale.width / 2 ? 150 : -150;
      enemy.body.setVelocity(speedX, 160);
    }

    return enemy;
  }
}
