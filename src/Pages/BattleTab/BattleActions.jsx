import React from "react";
import { motion } from "framer-motion";
import { Map, Zap } from "lucide-react";
import { useGame } from "../../hooks/useGame";

const BattleActions = ({ onOpenCampaign }) => {
  const { setGameMode, setIsFighting, selectedLevel } = useGame();

  const handleStart = (mode) => {
    setGameMode(mode);
    setIsFighting(true);
  };

  return (
    <div className="w-full flex justify-center px-4">
      {/* Progress Labels Above */}
      <div className="w-full max-w-xl">
        <div className="flex justify-between mb-1">
          <div className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider">
            Campaign Progress: <span className="text-white">45%</span>
          </div>
          <div className="text-[11px] font-bold text-fuchsia-400 uppercase tracking-wider">
            Best: <span className="text-white">00:00:00</span>
          </div>
        </div>

        {/* Buttons in Same Row */}
        <div className="flex gap-3 w-full">
          {/* CAMPAIGN BUTTON */}
          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onOpenCampaign?.()}
            className="flex-1 relative h-20 rounded-xl overflow-hidden group"
          >
            {/* Glowing Border */}
            <motion.div
              animate={{ opacity: [0.4, 0.7, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-xl border-2 border-cyan-500/50"
            />

            {/* Base Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 to-gray-900" />

            {/* Energy Core */}
            <motion.div
              animate={{ opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-2 rounded-lg bg-gradient-to-br from-cyan-900/30 to-blue-900/20"
            />

            {/* Content */}
            <div className="relative h-full flex items-center justify-center px-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-cyan-500/20 blur-sm rounded-lg" />
                  <div className="bg-cyan-900/40 p-2 rounded-lg border border-cyan-500/30 relative">
                    <Map size={20} className="text-cyan-300" />
                  </div>
                </div>
                <div className="text-left">
                  <div className="text-base font-black text-white tracking-tight">
                    CAMPAIGN
                  </div>
                  <div className="text-xs font-bold text-cyan-300">
                    Sector {selectedLevel || "01"}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Pulse */}
            <motion.div
              animate={{ scaleX: [0.8, 1.2, 0.8] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"
            />
          </motion.button>

          {/* SURVIVAL BUTTON */}
          <motion.button
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleStart("ENDLESS")}
            className="flex-1 relative h-20 rounded-xl overflow-hidden group"
          >
            {/* Glowing Border */}
            <motion.div
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute inset-0 rounded-xl border-2 border-fuchsia-500/50"
            />

            {/* Base Gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/90 to-gray-900" />

            {/* Energy Core */}
            <motion.div
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-2 rounded-lg bg-gradient-to-br from-fuchsia-900/30 to-orange-900/20"
            />

            {/* Content */}
            <div className="relative h-full flex items-center justify-center px-4">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-fuchsia-500/20 blur-sm rounded-lg" />
                  <div className="bg-fuchsia-900/40 p-2 rounded-lg border border-fuchsia-500/30 relative">
                    <Zap size={20} className="text-fuchsia-300" />
                  </div>
                </div>
                <div className="text-left">
                  <div className="text-base font-black text-white tracking-tight">
                    SURVIVAL
                  </div>
                  <div className="text-xs font-bold text-fuchsia-300">
                    Endless
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Pulse */}
            <motion.div
              animate={{ scaleX: [0.8, 1.3, 0.8] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-0.5 bg-gradient-to-r from-transparent via-fuchsia-500 to-transparent"
            />

            {/* Danger Indicator */}
            <div className="absolute top-2 right-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-red-500 blur-[1px]"
              />
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default BattleActions;
