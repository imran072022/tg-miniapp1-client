export const CAMPAIGN_DATA = [
  {
    id: 1,
    name: "NEBULA CORE",
    bg: "/assets/backgrounds/stage1.jpeg",
    color: "text-cyan-400",
    levels: [
      // TOP ROW - Entrance to nebula
      { id: 1, type: "MOB", waves: [0], unlocked: true, pos: { x: 20, y: 20 } }, // Entry point
      {
        id: 2,
        type: "MOB",
        waves: [1],
        unlocked: false,
        pos: { x: 50, y: 15 },
      }, // Peak of arch
      {
        id: 3,
        type: "MOB",
        waves: [1, 0],
        unlocked: false,
        pos: { x: 80, y: 20 },
      }, // Far right

      // MIDDLE ROW - Deeper into core
      {
        id: 4,
        type: "MOB",
        waves: [1, 2],
        unlocked: false,
        pos: { x: 30, y: 40 },
      }, // Left cluster
      {
        id: 5,
        type: "MOB",
        waves: [2, 0],
        unlocked: false,
        pos: { x: 70, y: 40 },
      }, // Right cluster

      // LOWER MID - Approaching density
      {
        id: 6,
        type: "MOB",
        waves: [0, 1],
        unlocked: false,
        pos: { x: 20, y: 60 },
      }, // Left anchor
      {
        id: 7,
        type: "MOB",
        waves: [1, 2],
        unlocked: false,
        pos: { x: 50, y: 55 },
      }, // Center
      {
        id: 8,
        type: "MOB",
        waves: [2, 0],
        unlocked: false,
        pos: { x: 80, y: 60 },
      }, // Right anchor

      // BOTTOM - Boss approach
      {
        id: 9,
        type: "MOB",
        waves: [2, 0],
        unlocked: false,
        pos: { x: 40, y: 75 },
      }, // Final challenge
      {
        id: 10,
        type: "BOSS",
        bossKey: "PhantomBoss",
        unlocked: false,
        isBoss: true,
        pos: { x: 50, y: 85 },
      }, // Boss at bottom center
    ],
  },
  {
    id: 2,
    name: "SOLAR FLARE",
    bg: "/assets/backgrounds/stage2.jpeg",
    color: "text-orange-400",
    levels: [
      {
        id: 11,
        type: "MOB",
        waves: [3, 4],
        unlocked: false,
        pos: { x: 30, y: 30 },
      },
      {
        id: 12,
        type: "MOB",
        waves: [4, 5],
        unlocked: false,
        pos: { x: 70, y: 30 },
      },
      {
        id: 13,
        type: "MOB",
        waves: [5, 3],
        unlocked: false,
        pos: { x: 30, y: 55 },
      },
      {
        id: 14,
        type: "MOB",
        waves: [3, 4],
        unlocked: false,
        pos: { x: 70, y: 55 },
      },
      {
        id: 15,
        type: "BOSS",
        bossKey: "EnergyCoreBoss",
        unlocked: false,
        isBoss: true,
        pos: { x: 50, y: 80 },
      },
    ],
  },
];
