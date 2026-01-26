import React from "react";
import { useGame } from "../hooks/useGame";

const ResultOverlay = () => {
  const {
    lastScore,
    setIsFighting,
    setShowResult,
    setGameMode,
    setSelectedLevel,
  } = useGame();

  const handleContinue = () => {
    setShowResult(false);
    setIsFighting(false);
    setGameMode(null);
    setSelectedLevel(null);
  };

  return (
    <div className="absolute inset-0 z-[200] bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-6 text-center animate-in fade-in duration-300">
      <div className="animate-in zoom-in duration-300">
        <h2 className="text-5xl font-black text-yellow-500 italic mb-2 uppercase tracking-tighter">
          Victory
        </h2>
        <p className="text-cyan-400 font-mono text-xl mb-8 tracking-widest">
          REWARDS: +{lastScore} GOLD
        </p>
        <button
          onClick={handleContinue}
          className="bg-white text-black font-black py-4 px-12 rounded-2xl text-lg hover:scale-105 transition-transform shadow-xl"
        >
          CONTINUE
        </button>
      </div>
    </div>
  );
};

export default ResultOverlay;
