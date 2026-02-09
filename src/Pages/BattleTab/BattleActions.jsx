import React from "react";
import { motion } from "framer-motion";
import { Swords, Zap, Map } from "lucide-react";
import { useGame } from "../../hooks/useGame";

const BattleActions = () => {
  const { setGameMode, setIsFighting, selectedLevel } = useGame();

  const handleStart = (mode) => {
    setGameMode(mode);
    setIsFighting(true);
  };

  return (
    <div className="w-full flex gap-4 mt-7">
      {/* Action Buttons Row */}
      <div className="grid grid-cols-2 gap-4 w-full">
        {/* 1. CAMPAIGN BUTTON */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => handleStart("CAMPAIGN")}
          className="relative group h-20 bg-slate-900/50 border border-cyan-500/20 rounded-2xl overflow-hidden flex items-center p-4 transition-all hover:border-cyan-500/50"
        >
          {/* Subtle Scanning Line Animation */}
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 to-transparent opacity-20 group-hover:opacity-40" />

          <div className="bg-cyan-500/10 p-2 rounded-xl border border-cyan-500/20 mr-3">
            <Map size={20} className="text-cyan-400" />
          </div>

          <div className="text-left">
            <div className="text-[8px] font-black text-cyan-400 tracking-[0.2em] mb-0.5">
              MISSION
            </div>
            <div className="text-sm font-black text-white italic tracking-tighter">
              CAMPAIGN
            </div>
            <div className="text-[7px] font-bold text-white/30 tracking-widest uppercase">
              SECTOR {selectedLevel || "01"}
            </div>
          </div>
        </motion.button>

        {/* 2. SURVIVAL BUTTON */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => handleStart("ENDLESS")}
          className="relative group h-20 bg-slate-900/50 border border-fuchsia-500/20 rounded-2xl overflow-hidden flex items-center p-4 transition-all hover:border-fuchsia-500/50"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-fuchsia-500/5 to-transparent opacity-20 group-hover:opacity-40" />

          <div className="bg-fuchsia-500/10 p-2 rounded-xl border border-fuchsia-500/20 mr-3">
            <Zap size={20} className="text-fuchsia-400" />
          </div>

          <div className="text-left">
            <div className="text-[8px] font-black text-fuchsia-400 tracking-[0.2em] mb-0.5">
              CHALLENGE
            </div>
            <div className="text-sm font-black text-white italic tracking-tighter">
              SURVIVAL
            </div>
            <div className="text-[7px] font-bold text-white/30 tracking-widest uppercase">
              RECORD: 0.0s
            </div>
          </div>
        </motion.button>
      </div>
    </div>
  );
};

export default BattleActions;
