import React from "react";
import { useGame } from "../../hooks/useGame";

const ShopTab = () => {
  const { gold, setGold } = useGame();

  // This is a sample function to show how the shop will work later
  const buyCrate = (cost) => {
    if (gold >= cost) {
      setGold((prev) => prev - cost);
      alert("Crate purchased!");
    } else {
      alert("Not enough gold!");
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-6 text-white bg-slate-950/20">
      {/* HEADER SECTION */}
      <div className="text-center mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
        <h2 className="text-5xl font-black italic text-white/20 uppercase tracking-tighter leading-none">
          Supply <br /> Crates
        </h2>
        <div className="h-1 w-12 bg-cyan-500 mx-auto mt-4 rounded-full shadow-[0_0_10px_#06b6d4]"></div>
      </div>

      {/* SHOP ITEMS (Placeholders for now) */}
      <div className="grid grid-cols-1 gap-4 w-full max-w-xs">
        <div className="bg-slate-800/50 border border-white/5 p-6 rounded-[32px] text-center backdrop-blur-sm">
          <span className="text-4xl mb-4 block">📦</span>
          <h3 className="font-black uppercase text-sm mb-1">Common Cache</h3>
          <p className="text-[10px] text-slate-400 mb-4 font-bold uppercase tracking-widest">
            Random Parts & Scrap
          </p>
          <button
            onClick={() => buyCrate(100)}
            className="w-full bg-slate-700 py-3 rounded-2xl font-black text-xs hover:bg-slate-600 transition-colors"
          >
            100 GOLD
          </button>
        </div>

        <p className="text-center text-[10px] tracking-[0.4em] uppercase opacity-30 mt-4 animate-pulse">
          New stock arriving soon
        </p>
      </div>

      {/* BACKGROUND DECORATION */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-500/5 blur-[100px] rounded-full"></div>
      </div>
    </div>
  );
};

export default ShopTab;
