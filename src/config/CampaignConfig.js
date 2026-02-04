export const CAMPAIGN_DATA = [
  {
    id: 1,
    name: "NEBULA CORE",
    bg: "/assets/stage1.jpg",
    color: "text-cyan-400",
    levels: [
      { id: 1, type: "MOB", waves: [0, 1], unlocked: true },
      { id: 2, type: "MOB", waves: [1, 2], unlocked: false },
      { id: 3, type: "MOB", waves: [2, 0], unlocked: false },
      {
        id: 4,
        type: "BOSS",
        bossKey: "PhantomBoss",
        unlocked: false,
        isBoss: true,
      },
    ],
  },
  {
    id: 2,
    name: "SOLAR FLARE",
    bg: "/assets/stage2.jpg",
    color: "text-orange-400",
    levels: [
      { id: 5, type: "MOB", waves: [3, 4], unlocked: false },
      {
        id: 6,
        type: "BOSS",
        bossKey: "EnergyCoreBoss",
        unlocked: false,
        isBoss: true,
      },
    ],
  },
];
