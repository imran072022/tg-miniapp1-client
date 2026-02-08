import React, { useState } from "react";
import { Coins, Gem, Plus, ChevronDown, Package, User } from "lucide-react"; // Added Package for a "Resources" feel
import { motion, AnimatePresence } from "framer-motion";
import { useGame } from "../hooks/useGame";

const TopNav = () => {
  const { gold, diamonds, resources } = useGame();
  const [showResources, setShowResources] = useState(false);

  return (
    <div className="relative z-[100]">
      {/* Main Bar: Streamlined for all screen sizes. 
          Centered resources with even spacing.
      */}
      <div className="flex items-center justify-between px-3 py-3 bg-slate-900/80 backdrop-blur-xl border-b border-white/10">
        {/* Left Side: Just a clean Branding or "Menu" trigger if you want, 
            otherwise leave empty to give space to resources */}
        {/* Left Side: Compact Profile Trigger */}
        <div className="flex-1 flex items-center">
          <button
            onClick={() => console.log("Open Profile Modal")} // Future: openProfile()
            className="flex items-center gap-2 group active:scale-95 transition-transform"
          >
            {/* Minimalist Avatar */}
            <div className="relative">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 flex items-center justify-center group-hover:border-cyan-400 transition-colors">
                <User className="w-5 h-5 text-cyan-400" />
              </div>
            </div>

            {/* Identity Text - Stacked small to save horizontal space */}
            <div className="flex flex-col items-start leading-none">
              <span className="text-[10px] font-black text-white/90 tracking-tight group-hover:text-cyan-400 transition-colors">
                Nick Name
              </span>
              <span className="text-[7px] font-bold text-white/50 tracking-[0.2em] uppercase mt-1">
                XP
              </span>
            </div>
          </button>
        </div>

        {/* Center/Right: Resources - Grouped to stay together */}
        <div className="flex items-center gap-2">
          {/* Gold Widget */}
          <div className="flex items-center bg-black/50 pl-2 pr-0.5 py-0.5 rounded-full border border-white/5 shadow-inner">
            <Coins className="w-3 h-3 text-amber-400" />
            <span className="text-[11px] font-black tabular-nums mx-1.5 text-white/90">
              {gold.toLocaleString()}
            </span>
            <button className="w-5 h-5 flex items-center justify-center bg-amber-500/20 hover:bg-amber-500/40 rounded-full transition-colors text-amber-400">
              <Plus size={10} strokeWidth={4} />
            </button>
          </div>

          {/* Diamonds Widget */}
          <div className="flex items-center bg-black/50 pl-2 pr-0.5 py-0.5 rounded-full border border-white/5 shadow-inner">
            <Gem className="w-3 h-3 text-fuchsia-400" />
            <span className="text-[11px] font-black tabular-nums mx-1.5 text-white/90">
              {diamonds.toLocaleString()}
            </span>
            <button className="w-5 h-5 flex items-center justify-center bg-fuchsia-500/20 hover:bg-fuchsia-500/40 rounded-full transition-colors text-fuchsia-400">
              <Plus size={10} strokeWidth={4} />
            </button>
          </div>

          {/* Shard Dropdown Trigger - Minimalist Icon */}
          <button
            onClick={() => setShowResources(!showResources)}
            className={`flex items-center justify-center w-7 h-7 rounded-lg border transition-all ${
              showResources
                ? "bg-cyan-500 border-cyan-400 text-black shadow-[0_0_10px_#22d3ee]"
                : "bg-white/5 border-white/10 text-cyan-400"
            }`}
          >
            <Package size={14} />
          </button>
        </div>
      </div>

      {/* Dropdown Panel - Same as before but adjusted for new width */}
      <AnimatePresence>
        {showResources && (
          <>
            <div
              className="fixed inset-0 z-[-1]"
              onClick={() => setShowResources(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -5 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -5 }}
              className="absolute right-4 top-16 w-56 bg-slate-950/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
            >
              <div className="text-[8px] font-black text-cyan-500/50 tracking-[0.3em] uppercase mb-4 text-center">
                Material Stock
              </div>
              <div className="grid grid-cols-2 gap-2">
                <MiniShard
                  name="Armor"
                  count={resources.hullScraps}
                  img="hullScraps"
                />
                <MiniShard
                  name="Weapon"
                  count={resources.weaponTech}
                  img="weaponTech"
                />
                <MiniShard
                  name="Engine"
                  count={resources.thrusterParts}
                  img="thrusterParts"
                />
                <MiniShard
                  name="Core"
                  count={resources.logicChips}
                  img="logicChip"
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const MiniShard = ({ name, count, img }) => (
  <div className="bg-white/5 border border-white/5 p-2 rounded-xl flex flex-col items-center">
    <img
      src={`/assets/Shards/${img}.png`}
      alt={name}
      className="w-8 h-8 object-contain mb-1"
    />
    <div className="text-[10px] font-black text-white">
      {count.toLocaleString()}
    </div>
  </div>
);

export default TopNav;
