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
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-gradient-to-br from-slate-950/80 via-cyan-900/40 to-slate-900/80 backdrop-blur-[4px] p-4">
      {/* Frosted glass card with neon border and glow */}
      <div className="relative w-full max-w-md bg-slate-900/90 border-2 border-cyan-400/40 rounded-3xl shadow-[0_0_60px_rgba(6,182,212,0.25)] p-10 flex flex-col items-center animate-in fade-in slide-in-from-top-10 duration-300">
        {/* Neon Pause Icon */}
        <div className="mb-6 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-cyan-500/10 flex items-center justify-center shadow-[0_0_40px_10px_rgba(6,182,212,0.15)]">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <rect x="10" y="8" width="6" height="24" rx="3" fill="#22d3ee" />
              <rect x="24" y="8" width="6" height="24" rx="3" fill="#22d3ee" />
            </svg>
          </div>
        </div>
        <h2 className="text-3xl font-black text-cyan-300 italic mb-2 tracking-tight drop-shadow-lg">
          Paused
        </h2>
        <p className="text-slate-300 text-sm mb-8 text-center max-w-xs">
          Take a breather, pilot. The action will resume when you're ready.
        </p>
        <div className="flex gap-6 w-full justify-center">
          <button
            onClick={() => setShowPauseMenu(false)}
            className="flex-1 px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-black text-base rounded-2xl shadow-lg transition-all active:scale-95 uppercase border-b-4 border-cyan-700"
          >
            Continue
          </button>
          <button
            onClick={handleExit}
            className="flex-1 px-8 py-3 bg-slate-800 hover:bg-red-600/80 text-white font-black text-base rounded-2xl shadow-lg transition-all active:scale-95 uppercase border-b-4 border-red-900"
          >
            Exit
          </button>
        </div>
      </div>
    </div>
  );
};

export default PauseOverlay;
