export const SUPPLY_CONFIG = {
  common: {
    label: "Common Supply",
    chance: 70, // 70% drop rate
    cooldown: 3000, // 1 Hour
    color: "cyan",
    closedImg: "/assets/Chests/commonClosed.png",
    openedImg: "/assets/Chests/commonOpened.png",
    rewardMultiplier: 1,
    slots: ["gold", "diamond", ["weaponTech", "thrusterParts"]],
  },
  epic: {
    label: "Epic Supply",
    chance: 25, // 25% drop rate
    cooldown: 4000, // 4 Hours
    color: "purple",
    closedImg: "/assets/Chests/epicClosed.png",
    openedImg: "/assets/Chests/epicOpened.png",
    rewardMultiplier: 2.5,
    slots: ["gold", "diamond", "weaponTech", "hullScraps"],
  },
  legendary: {
    label: "Legendary Supply",
    chance: 5, // 5% drop rate
    cooldown: 5000, // 8 Hours
    color: "amber",
    closedImg: "/assets/Chests/legendaryClosed.png",
    openedImg: "/assets/Chests/legendaryOpened.png",
    rewardMultiplier: 5,
    slots: [
      "gold",
      "diamond",
      "weaponTech",
      "hullScraps",
      "thrusterParts",
      "logicChip",
    ],
  },
};

export const REWARD_POOL = {
  gold: {
    type: "gold",
    icon: "/assets/recourses/goldForNav.png",
    baseAmount: 500,
  },
  diamond: {
    type: "diamond",
    icon: "/assets/recourses/handOfGems.png",
    baseAmount: 10,
  },
  weaponTech: {
    type: "shard",
    icon: "/assets/Shards/weaponTech.png",
    baseAmount: 5,
  },
  thrusterParts: {
    type: "shard",
    icon: "/assets/Shards/thrusterParts.png",
    baseAmount: 5,
  }, // Example
  logicChip: {
    type: "shard",
    icon: "/assets/Shards/logicChip.png",
    baseAmount: 5,
  }, // Example
  hullScraps: {
    type: "shard",
    icon: "/assets/Shards/hullScraps.png",
    baseAmount: 5,
  }, // Example
};
