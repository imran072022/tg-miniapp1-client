import React from "react";
import { useGame } from "../hooks/useGame";

const TopNav = () => {
  const { gold, isFighting } = useGame();

  // If the game is running, we hide the nav to save screen space
  if (isFighting) return null;

  return (
    <nav className="shrink-0 p-4 bg-slate-900/90 backdrop-blur-md flex justify-between items-center z-50 border-b border-white/10">
      <div className="flex flex-col">
        <h1 className="font-black tracking-tighter text-xl italic uppercase leading-none">
          VOID <span className="text-cyan-400">STRIKER</span>
        </h1>
        <span className="text-[8px] text-slate-500 font-bold tracking-[0.3em]">
          ALPHA v0.1
        </span>
      </div>

      <div className="flex items-center gap-3">
        {/* Future Profile Button will go here */}
        <div className="bg-slate-800 px-3 py-1 rounded-full font-mono text-yellow-500 border border-yellow-500/30 text-sm shadow-[0_0_10px_rgba(234,179,8,0.1)]">
          💰 {gold}
        </div>
      </div>
    </nav>
  );
};

export default TopNav;
