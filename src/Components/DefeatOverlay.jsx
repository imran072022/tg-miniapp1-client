import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Skull, RotateCcw, XCircle, AlertTriangle, Home } from "lucide-react";
import { useGame } from "../hooks/useGame";

const DefeatOverlay = () => {
  const { lastScore, setIsFighting, setShowResult, setSelectedLevel } =
    useGame();
  const [displayGold, setDisplayGold] = useState(0);

  useEffect(() => {
    // Ticking gold for the "scavenged" loot
    if (lastScore > 0) {
      let start = 0;
      const timer = setInterval(() => {
        start += Math.ceil(lastScore / 20);
        if (start >= lastScore) {
          setDisplayGold(lastScore);
          clearInterval(timer);
        } else {
          setDisplayGold(start);
        }
      }, 30);
      return () => clearInterval(timer);
    }
  }, [lastScore]);

  const handleRetry = () => {
    setShowResult(false);
    setIsFighting(false);
    setTimeout(() => setIsFighting(true), 50);
  };

  const handleExit = () => {
    setShowResult(false);
    setIsFighting(false);
    setSelectedLevel(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-xl bg-red-950/20"
    >
      {/* Glitchy Red Background Glow */}
      <div className="absolute w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[120px] animate-pulse" />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-md bg-slate-900/90 border border-red-500/40 rounded-[40px] p-8 shadow-[0_0_50px_rgba(239,68,68,0.2)] font-orbitron"
      >
        {/* Warning Header */}
        <div className="text-center mb-8">
          <motion.div
            animate={{ rotate: [0, -5, 5, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="inline-block p-4 bg-red-500/10 rounded-2xl mb-4"
          >
            <Skull className="w-12 h-12 text-red-500" />
          </motion.div>
          <h2 className="text-4xl font-black italic text-white tracking-tighter">
            SHIP <span className="text-red-500">DESTROYED</span>
          </h2>
          <p className="text-red-400/60 text-[10px] tracking-[0.3em] uppercase mt-2">
            Critical System Failure
          </p>
        </div>

        {/* Failure Stats */}
        <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-6 mb-8 text-center">
          <p className="text-slate-400 text-xs uppercase mb-1">
            Scavenged Credits
          </p>
          <div className="text-3xl font-black text-white flex items-center justify-center gap-2">
            <span className="text-red-500 text-sm">$</span>
            {displayGold}
          </div>
        </div>

        {/* Action Grid */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleExit}
            className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-slate-800 text-white font-bold hover:bg-slate-700 transition-colors border border-white/5"
          >
            <Home className="w-5 h-5" /> EXIT
          </button>
          <button
            onClick={handleRetry}
            className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-red-600 text-white font-black hover:bg-red-500 transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)]"
          >
            <RotateCcw className="w-5 h-5" /> RETRY
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DefeatOverlay;
