export const Endless_Waves = [
  {
    wave: 1, // THE MOBILITY TEST
    phases: [
      {
        name: "Scout Arrival",
        duration: 8000,
        spawnDelay: 2000,
        enemyType: "kamikazeDrone",
        pattern: "SOLO",
      },
      {
        name: "Drone Formation",
        duration: 12000,
        spawnDelay: 4500,
        enemyType: "kamikazeDrone",
        pattern: "SWARM",
      },
      {
        name: "The Blitz",
        duration: 10000,
        spawnDelay: 1000,
        enemyType: "kamikazeDrone",
        pattern: "SOLO",
      },
    ],
  },
  {
    wave: 2, // THE TRAJECTORY TEST
    phases: [
      {
        name: "Traffic",
        duration: 15000,
        spawnDelay: 2500,
        enemyType: "Type1",
        pattern: "SOLO",
      },
      {
        name: "Chaos Drive", // Type 1 + Random Drones to disturb the player
        duration: 15000,
        spawnDelay: 2000,
        enemyType: "Type1",
        supportType: "kamikazeDrone", // <--- THE DISTURBANCE
        pattern: "SOLO",
      },
    ],
  },
  {
    wave: 3, // THE FIREFIGHT (Final Test)
    phases: [
      {
        name: "Heavy Entrance",
        duration: 20000,
        spawnDelay: 6000, // Type 2 should spawn slower because they are big
        enemyType: "Type2",
        pattern: "SOLO", // Your Director already spawns them in pairs for Type2!
      },
      {
        name: "Aerial Siege", // Type 2 + Constant Drones (High Pressure)
        duration: 15000,
        spawnDelay: 5000,
        enemyType: "Type2",
        supportType: "kamikazeDrone", // <--- THE DISTURBANCE
        pattern: "SOLO",
      },
    ],
  },
];
