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
// Add Shard Rarity Multipliers (Can match your existing ones or be unique)
const SHARD_RARITY_MULTIPLIERS = {
  [RARITY_TYPES.COMMON]: 1,
  [RARITY_TYPES.RARE]: 2,
  [RARITY_TYPES.EPIC]: 4,
  [RARITY_TYPES.LEGENDARY]: 8,
};
export const LevelConfig = {
  // 1. Cards needed (0 if we are at an Evolution Gate)
  getRequiredCards: (level, rank = 0) => {
    if (LevelConfig.isEvolutionGate(level, rank)) return 0;
    if (level >= 30) return 0;
    return (Math.floor(level / 1) + 1) * 10;
  },

  // 2. Gold Cost
  getUpgradeCost: (level, rank = 0, rarity) => {
    const baseCost = 500;
    const multiplier = RARITY_MULTIPLIERS[rarity] || 1;
    // Check if we are currently stuck at a level cap
    const isEvo = LevelConfig.isEvolutionGate(level, rank);
    // Evolution is 10x base, normal levels use your level multiplier
    const costMultiplier = isEvo ? 10 : level;
    return baseCost * costMultiplier * multiplier;
  },

  // 3. The "Gate" check
  // Returns TRUE if the player MUST evolve to go higher
  isEvolutionGate: (level, rank = 0) => {
    const maxLevelForCurrentRank = (rank + 1) * 10;
    return level >= maxLevelForCurrentRank;
  },

  // 4. Shard Requirements logic
  getRequiredShards: (level, rarity = "COMMON") => {
    let baseAmount = 0;
    if (level === 10) baseAmount = 5;
    if (level === 20) baseAmount = 15;
    const multiplier = SHARD_RARITY_MULTIPLIERS[rarity] || 1;
    return baseAmount * multiplier;
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
  let hp = ship.hp || 100;
  let fireRate = ship.fireRate || 250;
  let bVel = ship.bVel || -600;
  let bScale = ship.bScale || 0.6;
  let dps = ship.dps || 50;

  for (let i = 1; i < level; i++) {
    // Logic: Every 10th level is an evolution for stat purposes
    const isEvo = i % 10 === 0;

    hp *=
      1 +
      (isEvo ? GROWTH_MODIFIERS.HP.evolution : GROWTH_MODIFIERS.HP.standard);

    // Fire rate gets faster (smaller number), so we divide
    fireRate /=
      1 +
      (isEvo
        ? GROWTH_MODIFIERS.FIRE_RATE.evolution
        : GROWTH_MODIFIERS.FIRE_RATE.standard);

    if (isEvo) {
      bVel *= 1 + GROWTH_MODIFIERS.B_VEL.evolution;
      bScale *= 1 + GROWTH_MODIFIERS.B_SCALE.evolution;
      dps *= 1.1; // 10% jump
    } else {
      dps *= 1.02; // 2% jump
    }
  }

  return {
    hp: Math.round(hp),
    fireRate: Math.round(fireRate),
    bVel: Math.round(bVel),
    bScale: Number(bScale.toFixed(2)),
    damage: Math.round(dps),
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
// Update Gem Cost logic to include Shards
export const calculateMissingGemCost = (
  missingCards,
  rarity,
  missingGold,
  missingShards = 0,
) => {
  const cardGemCost = missingCards * (GEM_PRICES.CARD_COST[rarity] || 2);
  const goldGemCost = Math.ceil(missingGold / GEM_PRICES.GOLD_TO_GEM_RATIO);
  // Shard Pricing: 15 Gems per shard (constant value for premium feel)
  const shardGemCost = missingShards * 15;

  return cardGemCost + goldGemCost + shardGemCost;
};
