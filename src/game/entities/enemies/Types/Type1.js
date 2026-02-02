import BaseEnemy from "../BaseEnemy/BaseEnemy";

export default class Type1Enemy extends BaseEnemy {
  constructor(scene, x, y) {
    // Spawn at y=10 so it's inside the world
    super(scene, x, 10, "enemyType2", { hp: 40, goldValue: 15 });
    this.setTint(0xffff00);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);
    // Force vertical movement if it ever hits a 'ghost' ceiling
    if (this.body && this.body.velocity.y < 160) {
      this.body.setVelocityY(160);
    }
  }
}
