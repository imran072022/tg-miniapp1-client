import React, { useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Coins,
  Gem,
  Zap,
  Shield,
  Rocket,
  Target,
  X,
  Heart,
  Settings,
} from "lucide-react";
import {
  LevelConfig,
  calculateMissingGemCost,
  getStatsAtLevel,
} from "../../../config/LevelConfig";

const UpgradeModal = ({
  ship,
  goldBalance,
  currentResources,
  onClose,
  onConfirm,
}) => {
  const isEvo = LevelConfig.isEvolutionGate(ship.level, ship.rank || 0);
  const rarity = ship.rarity || "COMMON";

  // FIX: Passing correct arguments (level, rank, rarity)
  const cost = LevelConfig.getUpgradeCost(ship.level, ship.rank || 0, rarity);
  const reqCards = LevelConfig.getRequiredCards(ship.level, ship.rank || 0);
  const reqShards = LevelConfig.getRequiredShards(ship.level, rarity);

  // 1. Calculate Stats
  const currentStats = getStatsAtLevel(ship, ship.level);
  const nextStats = getStatsAtLevel(ship, ship.level + 1);

  // 2. Resource Logic (Shards)
  const shardDeficit = useMemo(() => {
    if (!isEvo) return 0;
    return (
      Math.max(0, reqShards - currentResources.hullScraps) +
      Math.max(0, reqShards - currentResources.weaponTech) +
      Math.max(0, reqShards - currentResources.thrusterParts) +
      Math.max(0, reqShards - currentResources.logicChips)
    );
  }, [isEvo, reqShards, currentResources]);

  const missingGold = Math.max(0, cost - goldBalance);
  const missingCards = isEvo ? 0 : Math.max(0, reqCards - (ship.cards || 0));

  const gemCost = calculateMissingGemCost(
    missingCards,
    rarity,
    missingGold,
    shardDeficit,
  );

  // 3. Dynamic Status Message
  const getStatusMessage = () => {
    const missing = [];
    if (missingGold > 0) missing.push("Gold");
    if (!isEvo && missingCards > 0) missing.push("Cards");
    if (isEvo) {
      if (currentResources.hullScraps < reqShards) missing.push("Armor");
      if (currentResources.weaponTech < reqShards) missing.push("Weapon");
      if (currentResources.thrusterParts < reqShards) missing.push("Engine");
      if (currentResources.logicChips < reqShards) missing.push("Core");
    }
    return missing.length === 0
      ? "All systems authorized"
      : `Incomplete: ${missing.join(", ")}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className={`relative w-full max-w-md overflow-hidden rounded-[32px] border-2 shadow-2xl
          ${isEvo ? "bg-slate-950 border-amber-500/50" : "bg-[#001b2e] border-cyan-500/30"}`}
      >
        {/* Header */}
        <div
          className={`p-6 text-center ${isEvo ? "bg-amber-500/10" : "bg-cyan-500/10"}`}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/50 hover:text-white"
          >
            <X size={24} />
          </button>
          <h2
            className={`text-2xl font-black uppercase tracking-tighter ${isEvo ? "text-amber-400" : "text-cyan-400"}`}
          >
            {isEvo ? "System Evolution" : "Unit Upgrade"}
          </h2>
          <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest mt-1 italic">
            Rank {ship.rank} Phase <span className="mx-2">→</span> Rank{" "}
            {isEvo ? ship.rank + 1 : ship.rank}
          </p>
        </div>

        {/* Stats Section */}
        <div className="p-6 space-y-2">
          <StatRow
            icon={<Heart size={14} />}
            label="Health"
            current={currentStats.hp}
            next={nextStats.hp}
            color="text-red-500"
          />
          <StatRow
            icon={<Zap size={14} />}
            label="Firepower"
            current={currentStats.damage}
            next={nextStats.damage}
            color="text-orange-400"
          />
          <StatRow
            icon={<Target size={14} />}
            label="Fire Rate"
            current={currentStats.fireRate}
            next={nextStats.fireRate}
            color="text-green-400"
            isLowerBetter={true}
          />
        </div>

        {/* Evolution Requirements Grid */}
        {isEvo && (
          <div className="px-6 py-4 grid grid-cols-4 gap-2 bg-white/5 mx-6 rounded-2xl border border-white/5">
            <MiniShard
              icon="ARMOR"
              current={currentResources.hullScraps}
              req={reqShards}
            />
            <MiniShard
              icon="WEAPON"
              current={currentResources.weaponTech}
              req={reqShards}
            />
            <MiniShard
              icon="ENGINE"
              current={currentResources.thrusterParts}
              req={reqShards}
            />
            <MiniShard
              icon="CORE"
              current={currentResources.logicChips}
              req={reqShards}
            />
          </div>
        )}

        {/* Action Area */}
        <div className="p-6 mt-2">
          <div className="flex items-center justify-around mb-6">
            <ResourceChip
              icon={<Coins size={14} />}
              label="Gold"
              current={goldBalance}
              cost={cost}
            />
            {!isEvo && (
              <ResourceChip
                icon={<Rocket size={14} />}
                label="Cards"
                current={ship.cards}
                cost={reqCards}
              />
            )}
          </div>

          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => onConfirm(gemCost > 0)}
            className={`w-full py-4 rounded-2xl font-black text-lg flex flex-col items-center justify-center transition-all
              ${
                gemCost > 0
                  ? "bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white shadow-[0_0_20px_rgba(192,38,211,0.4)]"
                  : "bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.4)]"
              }`}
          >
            <div className="flex items-center gap-2">
              {gemCost > 0 && <Gem size={18} className="animate-pulse" />}
              <span>
                {gemCost > 0
                  ? `Buy & ${isEvo ? "Evolve" : "Upgrade"}`
                  : `Confirm ${isEvo ? "Evolution" : "Upgrade"}`}
              </span>
            </div>
            {gemCost > 0 && (
              <span className="text-[10px] opacity-80 mt-[-2px]">
                {gemCost} Diamonds
              </span>
            )}
          </motion.button>

          <p
            className={`text-center text-[9px] uppercase mt-4 font-bold tracking-[0.2em] italic 
            ${gemCost > 0 ? "text-fuchsia-400" : "text-cyan-400/50"}`}
          >
            {getStatusMessage()}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Helper: Mini Shard View for Modal
const MiniShard = ({ icon, current, req }) => (
  <div className="flex flex-col items-center">
    <div
      className={`text-[8px] font-bold mb-1 ${current < req ? "text-white/20" : "text-amber-500"}`}
    >
      {icon}
    </div>
    <div
      className={`text-[10px] font-black ${current < req ? "text-red-400" : "text-white"}`}
    >
      {current}
      <span className="text-white/20">/</span>
      {req}
    </div>
  </div>
);

// StatRow & ResourceChip remain same as your previous design...
const StatRow = ({
  icon,
  label,
  current,
  next,
  color,
  isLowerBetter = false,
}) => {
  const isImproved = isLowerBetter ? next < current : next > current;
  return (
    <div className="flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5">
      <div className="flex items-center gap-3">
        <div className={`${color} opacity-80`}>{icon}</div>
        <span className="text-[10px] font-bold text-white/60 uppercase tracking-tighter">
          {label}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold text-white/40">{current}</span>
        <span className="text-white/20">→</span>
        <span
          className={`text-sm font-black ${isImproved ? "text-green-400" : "text-white"}`}
        >
          {next}
        </span>
      </div>
    </div>
  );
};

const ResourceChip = ({ icon, label, current, cost }) => {
  const isMissing = current < cost;
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center gap-1 mb-1">
        <span className="text-white/40">{icon}</span>
        <span className="text-[9px] font-bold text-white/40 uppercase">
          {label}
        </span>
      </div>
      <div
        className={`text-xs font-black ${isMissing ? "text-red-400" : "text-white"}`}
      >
        {current.toLocaleString()} <span className="text-white/20">/</span>{" "}
        {cost.toLocaleString()}
      </div>
    </div>
  );
};
export default UpgradeModal;
