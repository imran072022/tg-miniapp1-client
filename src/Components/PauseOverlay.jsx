import React from "react";
import { useGame } from "../hooks/useGame";

const PauseOverlay = () => {
  const { setShowPauseMenu, setIsFighting, setGameMode, setSelectedLevel } =
    useGame();

  const handleExit = () => {
    setShowPauseMenu(false);
    setIsFighting(false);
    setGameMode(null);
    setSelectedLevel(null);
    // Gold logic will be added here in the future
  };

  return (
    <div className="absolute inset-0 z-[150] bg-slate-950/60 backdrop-blur-[2px] flex items-center justify-center p-4">
      {/* Rectangular Dropdown Skin */}
      <div className="bg-slate-900 border-2 border-cyan-500/30 p-2 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] animate-in slide-in-from-top-10 duration-300">
        <div className="flex flex-row items-center gap-2">
          {/* RESUME BUTTON */}
          <button
            onClick={() => setShowPauseMenu(false)}
            className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xs tracking-widest rounded-xl transition-all active:scale-95 uppercase"
          >
            Continue
          </button>

          {/* DIVIDER LINE */}
          <div className="w-[1px] h-8 bg-white/10 mx-1"></div>

          {/* EXIT BUTTON */}
          <button
            onClick={handleExit}
            className="px-6 py-3 bg-slate-800 hover:bg-red-900/40 text-slate-400 hover:text-white font-black text-xs tracking-widest rounded-xl transition-all active:scale-95 uppercase"
          >
            Exit
          </button>
        </div>
      </div>
    </div>
  );
};

export default PauseOverlay;
