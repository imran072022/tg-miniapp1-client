import React from "react";
import { motion } from "framer-motion";
import { ChevronUp, Coins } from "lucide-react";

// Assets
import weaponTechImg from "../../../../public/assets/Shards/weaponTech.png";
import thrusterPartsImg from "../../../../public/assets/shards/thrusterParts.png";
import hullScrapsImg from "../../../../public/assets/shards/hullScraps.png";
import logicChipsImg from "../../../../public/assets/shards/logicChip.png";

// Config
import { LevelConfig } from "../../../config/LevelConfig";

const FusionInterface = ({ ship, resources, goldBalance, onUpgradeClick }) => {
  // 1. Extract dynamic data from the ship object
  const level = ship?.level || 1;
  const rank = ship?.rank || 0; // NEW: Get the ship's rank
  const rarity = ship?.rarity || "COMMON";
  const currentCards = ship?.cards || 0;

  // 1.1 Updated Logic to use the Rank-based Gate
  const isEvolutionLevel = LevelConfig.isEvolutionGate(level, rank);
  const upgradeCost = LevelConfig.getUpgradeCost(level, rank, rarity);
  const requiredCards = LevelConfig.getRequiredCards(level, rank);
  const requiredShards = LevelConfig.getRequiredShards(level);

  // 2. Readiness Checks
  const hasShards =
    resources.weaponTech >= requiredShards &&
    resources.thrusterParts >= requiredShards &&
    resources.hullScraps >= requiredShards &&
    resources.logicChips >= requiredShards;

  const hasCards = currentCards >= requiredCards;
  const hasGold = goldBalance >= upgradeCost;

  // 3. Status Flags for UI
  const isMissingGold = !hasGold;
  const isMissingShards = isEvolutionLevel && !hasShards;
  const isMissingCards = !isEvolutionLevel && !hasCards;
  const isMissingAnything =
    isMissingGold || (isEvolutionLevel ? !hasShards : !hasCards);

  return (
    <div className="flex-1 bg-[#001b2e] border-t-2 border-cyan-400/30 rounded-t-[45px] relative z-20 shadow-[0_-20px_40px_rgba(0,0,0,0.6)] flex flex-col justify-between p-6 pb-28">
      {/* 1. SECTION TITLE */}
      <div className="text-center">
        <h3 className="text-xs font-black text-cyan-400 tracking-[0.3em] uppercase">
          {isEvolutionLevel
            ? isMissingShards
              ? "Collect Required Shards"
              : "Ready for Evolution"
            : isMissingCards
              ? "Gather Ship Cards"
              : isMissingGold
                ? "Insufficient Gold"
                : "System Optimized"}
        </h3>
        <p className="text-[8px] text-white/70 tracking-[0.1em] mt-1 uppercase italic font-bold">
          {isMissingAnything
            ? "Evolution protocol offline"
            : "Evolution protocol standby"}
        </p>
        <div className="h-[1px] w-24 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent mx-auto mt-2 shadow-[0_0_10px_#06b6d4]" />
      </div>

      {/* 2. PROGRESS AREA (Toggle between Bar and Shards) */}
      {!isEvolutionLevel ? (
        <div className="flex flex-col items-center w-full px-8 py-10">
          <div className="flex justify-between w-full mb-2 px-1">
            <span className="text-[10px] text-cyan-400 font-black tracking-widest uppercase">
              Card Progress
            </span>
            <span className="text-[10px] text-white font-black tracking-widest">
              {currentCards} / {requiredCards}
            </span>
          </div>

          <div className="w-full h-3 bg-black/40 rounded-full border border-cyan-500/30 overflow-hidden p-[2px]">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${Math.min((currentCards / requiredCards) * 100, 100)}%`,
              }}
              className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full shadow-[0_0_10px_#06b6d4]"
            />
          </div>

          <p className="mt-3 text-[8px] text-white/40 uppercase tracking-tight italic">
            {isMissingCards
              ? `Collect ${requiredCards - currentCards} more cards to authorize upgrade`
              : "Requirements met for standard upgrade"}
          </p>
        </div>
      ) : (
        <div className="flex justify-between items-center px-2 py-8">
          <HorizontalShard
            img={weaponTechImg}
            count={resources.weaponTech}
            required={requiredShards}
            label="WEAPON"
            delay={0}
          />
          <HorizontalShard
            img={thrusterPartsImg}
            count={resources.thrusterParts}
            required={requiredShards}
            label="ENGINE"
            delay={0.1}
          />
          <HorizontalShard
            img={hullScrapsImg}
            count={resources.hullScraps}
            required={requiredShards}
            label="ARMOR"
            delay={0.2}
          />
          <HorizontalShard
            img={logicChipsImg}
            count={resources.logicChips}
            required={requiredShards}
            label="CORE"
            delay={0.3}
          />
        </div>
      )}

      {/* 3. THE UPGRADE BUTTON */}
      <div className="w-full px-4">
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onUpgradeClick}
          className={`relative w-full py-4 rounded-2xl font-black transition-all duration-500 border-2 flex items-center justify-center overflow-hidden
            ${
              isMissingAnything
                ? "bg-transparent border-cyan-500/50 text-cyan-400 shadow-none"
                : "bg-cyan-500 border-cyan-300 text-black shadow-[0_0_25px_rgba(6,182,212,0.5)]"
            }`}
        >
          <div className="relative z-10 flex flex-col items-center">
            <div className="flex items-center gap-3">
              <span className="text-xl italic uppercase tracking-tighter">
                {isEvolutionLevel ? "Evolve" : "Upgrade"}
              </span>

              <div
                className={`flex items-center gap-1 px-2 py-0.5 rounded-md ${isMissingAnything ? "bg-cyan-500/10" : "bg-black/10"}`}
              >
                <Coins className="w-4 h-4" />
                <span className="text-sm font-black">
                  {upgradeCost.toLocaleString()}
                </span>
                {isMissingGold && (
                  <span className="ml-1 text-xs animate-pulse">+</span>
                )}
              </div>

              {!isMissingAnything && (
                <ChevronUp className="w-5 h-5 animate-bounce" />
              )}
            </div>
          </div>

          {!isMissingAnything && (
            <motion.div
              animate={{ x: ["-100%", "250%"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg]"
            />
          )}
        </motion.button>
      </div>
    </div>
  );
};

const HorizontalShard = ({ img, count, required, label, delay }) => {
  const isReady = count >= required;

  return (
    <div className="flex flex-col items-center">
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{
          duration: 4,
          repeat: Infinity,
          delay: delay,
          ease: "easeInOut",
        }}
        className="relative flex items-center justify-center w-14 h-14"
      >
        <div
          className={`absolute bottom-0 w-10 h-10 rounded-full blur-xl transition-all duration-1000
            ${isReady ? "bg-cyan-400/40 opacity-100" : "opacity-0"}`}
        />

        <img
          src={img}
          alt={label}
          className={`w-12 h-12 object-contain relative z-10 transition-all duration-700
            ${!isReady ? "grayscale opacity-20 brightness-50" : "drop-shadow-[0_0_10px_rgba(34,211,238,0.6)]"}`}
        />
      </motion.div>

      <div className="mt-1 flex flex-col items-center">
        <span
          className={`text-[6px] font-bold tracking-widest transition-opacity ${isReady ? "text-cyan-400 opacity-100" : "opacity-30"}`}
        >
          {label}
        </span>
        <div
          className={`mt-0.5 px-2 py-0 rounded-full text-[10px] font-black
          ${isReady ? "bg-cyan-500 text-black shadow-[0_0_10px_rgba(34,211,238,0.4)]" : "bg-white/5 text-slate-500"}`}
        >
          {count}/{required}
        </div>
      </div>
    </div>
  );
};

export default FusionInterface;
