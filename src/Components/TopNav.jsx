import React from "react";
import { Coins, Gem, Settings, User } from "lucide-react";
import { useGame } from "../hooks/useGame";

const TopNav = () => {
  const { gold, diamonds } = useGame();

  return (
    <div className="flex items-center justify-between px-6 py-4 bg-slate-900/50 backdrop-blur-md border-b border-white/10">
      {/* Profile Section */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center border border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
          <User className="w-6 h-6 text-white" />
        </div>
        <div>
          <div className="text-[10px] text-cyan-400 font-bold tracking-widest leading-none mb-1">
            PILOT
          </div>
          <div className="text-sm font-black tracking-tight">LEVEL 01</div>
        </div>
      </div>

      {/* Resources Section */}
      <div className="flex items-center gap-3">
        {/* Gold Widget */}
        <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
          <Coins className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-bold">{gold}</span>
        </div>

        {/* Diamonds Widget */}
        <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
          <Gem className="w-4 h-4 text-fuchsia-400" />
          <span className="text-sm font-bold">{diamonds}</span>
        </div>

        {/* Settings Button */}
        <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
          <Settings className="w-5 h-5 text-slate-400" />
        </button>
      </div>
    </div>
  );
};

export default TopNav;
