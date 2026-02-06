// ============ Required cards, shards, upgrade costs ==============
export const RARITY_TYPES = {
  COMMON: "COMMON",
  RARE: "RARE",
  EPIC: "EPIC",
  LEGENDARY: "LEGENDARY",
};
const RARITY_MULTIPLIERS = {
  [RARITY_TYPES.COMMON]: 1,
  [RARITY_TYPES.RARE]: 2.5,
  [RARITY_TYPES.EPIC]: 6,
  [RARITY_TYPES.LEGENDARY]: 15,
};
export const LevelConfig = {
  // 1. How many cards are needed for the next level?
  // We use a clean step-up: 10, 20, 30, 40...
  getRequiredCards: (level) => {
    if (level >= 30) return 0; // Max Level
    return (Math.floor(level / 1) + 1) * 10;
  },
  // 2. How much Gold does the upgrade cost?
  // Formula: (Base Cost * Level) * Rarity Multiplier
  getUpgradeCost: (level, rarity) => {
    const baseCost = 500;
    const multiplier = RARITY_MULTIPLIERS[rarity] || 1;
    // Evolution levels (10, 20) are 5x more expensive
    const isEvolution = level > 0 && level % 10 === 0;
    const evolutionSurcharge = isEvolution ? 5 : 1;
    return baseCost * level * multiplier * evolutionSurcharge;
  },
  // 3. Is this an Evolution Gate?
  isEvolutionLevel: (level) => {
    return level > 0 && level % 10 === 0;
  },
  // 4. Shard Requirements (Only for Evolution levels)
  // Since you have 4 universal shards, we keep this simple.
  getRequiredShards: (level) => {
    if (level === 10) return 2; // Need 2 of each shard
    if (level === 20) return 5; // Need 5 of each shard
    if (level === 30) return 10; // Need 10 of each shard
    return 0;
  },
};
// ================= Growth on level upgrades =====================
export const GROWTH_MODIFIERS = {
  HP: { standard: 0.02, evolution: 0.1 },
  FIRE_RATE: { standard: 0.01, evolution: 0.05 },
  B_VEL: { evolution: 0.15 }, // Only on Evolve
  B_SCALE: { evolution: 0.1 }, // Only on Evolve
};
// Example function to calculate stats for the Modal
export const getStatsAtLevel = (ship, level) => {
  // Use defaults if stats are missing in the ship object
  let hp = ship.hp || 100;
  let fireRate = ship.fireRate || 250;
  let bVel = ship.bVel || -600;
  let bScale = ship.bScale || 0.6;

  // Loop from level 1 up to the target level
  for (let i = 1; i < level; i++) {
    const isEvo = LevelConfig.isEvolutionLevel(i);

    // Growth Math
    hp *=
      1 +
      (isEvo ? GROWTH_MODIFIERS.HP.evolution : GROWTH_MODIFIERS.HP.standard);
    fireRate /=
      1 +
      (isEvo
        ? GROWTH_MODIFIERS.FIRE_RATE.evolution
        : GROWTH_MODIFIERS.FIRE_RATE.standard);

    if (isEvo) {
      bVel *= 1 + GROWTH_MODIFIERS.B_VEL.evolution;
      bScale *= 1 + GROWTH_MODIFIERS.B_SCALE.evolution;
    }
  }

  return {
    hp: Math.round(hp),
    fireRate: Math.round(fireRate),
    bVel: Math.round(bVel),
    // Fix: Default to 0 before calling toFixed to prevent crash
    bScale: Number((bScale || 0).toFixed(2)),
  };
};
// ================ GEM PRICE CALC ====================
export const GEM_PRICES = {
  CARD_COST: {
    COMMON: 2,
    RARE: 5,
    EPIC: 15,
    LEGENDARY: 50,
  },
  GOLD_TO_GEM_RATIO: 100, // 1 Gem per 100 Gold
};
export const calculateMissingGemCost = (missingCards, rarity, missingGold) => {
  const cardGemCost = missingCards * (GEM_PRICES.CARD_COST[rarity] || 2);
  const goldGemCost = Math.ceil(missingGold / GEM_PRICES.GOLD_TO_GEM_RATIO);
  return cardGemCost + goldGemCost;
};
