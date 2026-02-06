import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Coins, Gem, Zap, Shield, Rocket, Target, X } from "lucide-react";
import {
  LevelConfig,
  GEM_PRICES,
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
  const isEvo = LevelConfig.isEvolutionLevel(ship.level);
  const cost = LevelConfig.getUpgradeCost(ship.level, ship.rarity);
  const reqCards = LevelConfig.getRequiredCards(ship.level);

  // 1. Calculate Stats
  const currentStats = getStatsAtLevel(ship, ship.level);
  const nextStats = getStatsAtLevel(ship, ship.level + 1);

  // 2. Resource Logic
  const missingGold = Math.max(0, cost - goldBalance);
  const missingCards = isEvo ? 0 : Math.max(0, reqCards - ship.cards);

  // We'll handle missing shards later for Evo levels,
  // for now let's focus on Cards and Gold Gem conversion.
  const gemCost = calculateMissingGemCost(
    missingCards,
    ship.rarity,
    missingGold,
  );
  const canAffordWithGems = true; // Logic for checking player.diamonds >= gemCost

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className={`relative w-full max-w-md overflow-hidden rounded-[32px] border-2 shadow-2xl
          ${isEvo ? "bg-slate-950 border-amber-500/50" : "bg-[#001b2e] border-cyan-500/30"}`}
      >
        {/* Header Section */}
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
          <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest mt-1">
            Level {ship.level} <span className="mx-2 text-white/20">→</span>{" "}
            Level {ship.level + 1}
          </p>
        </div>

        {/* Stats Comparison Section */}
        <div className="p-6 space-y-3">
          {/* Change these labels to use the correct stats */}
          <StatRow
            icon={<Zap size={14} />}
            label="Attack Power"
            current={currentStats.hp}
            next={nextStats.hp}
            color="text-orange-400"
          />
          <StatRow
            icon={<Shield size={14} />}
            label="Hull Integrity"
            current={currentStats.hp}
            next={nextStats.hp}
            color="text-blue-400"
          />
          <StatRow
            icon={<Target size={14} />}
            label="Fire Rate"
            current={currentStats.fireRate}
            next={nextStats.fireRate}
            color="text-green-400"
            isLowerBetter={true}
          />

          {isEvo && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="pt-2 mt-2 border-t border-white/5"
            >
              <div className="flex justify-between items-center text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                <span>Evolution Bonus</span>
                <span>+15% Projectile Velocity</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Requirements & Action Section */}
        <div className="p-6 bg-black/40">
          <div className="flex items-center justify-between mb-6">
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
            className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all
              ${
                gemCost > 0
                  ? "bg-gradient-to-r from-fuchsia-600 to-purple-600 text-white shadow-[0_0_20px_rgba(192,38,211,0.4)]"
                  : "bg-cyan-500 text-black shadow-[0_0_20px_rgba(6,182,212,0.4)]"
              }`}
          >
            {gemCost > 0 ? (
              <>
                <Gem size={20} className="animate-pulse" />
                Buy & Upgrade ({gemCost})
              </>
            ) : (
              "Confirm Upgrade"
            )}
          </motion.button>

          <p className="text-center text-[9px] text-white/30 uppercase mt-4 font-bold tracking-widest">
            {gemCost > 0
              ? "Missing resources will be converted from gems"
              : "All systems authorized for integration"}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

// Sub-component for Stats
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

// Sub-component for Resources
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
        {current} <span className="text-white/20">/</span> {cost}
      </div>
    </div>
  );
};

export default UpgradeModal;
