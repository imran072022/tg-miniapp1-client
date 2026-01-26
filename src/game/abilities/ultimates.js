import Phaser from "phaser"; // Fixes 'Phaser' is not defined

export const UltimateAbilities = {
  // 1. THE BEAM
  IRON_BEAM: (scene, player) => {
    const beam = scene.add
      .sprite(player.x, player.y, "iron_beam")
      .setOrigin(0.5, 1);
    scene.tweens.add({
      targets: beam,
      alpha: 0,
      duration: 1000,
      onUpdate: () => {
        beam.x = player.x;
        scene.enemies.children.each((e) => {
          if (e && e.active && Math.abs(e.x - beam.x) < 40) e.takeDamage(100);
        });
      },
      onComplete: () => beam.destroy(),
    });
  },

  // 2. FIRE BARRIER (Fixed 'shield' error)
  FIRE_BARRIER: (scene, player) => {
    const shield = scene.add.circle(player.x, player.y, 60, 0xff0000, 0.3);
    scene.physics.add.existing(shield); // Make it physical

    // Logic: Keep shield on player
    scene.events.on("update", () => {
      if (shield.active) {
        shield.x = player.x;
        shield.y = player.y;
      }
    });

    // Destroy after 5 seconds
    scene.time.delayedCall(5000, () => shield.destroy());
  },
};
