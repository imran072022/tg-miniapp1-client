import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Star, ArrowRight, RotateCcw, Coins } from "lucide-react";
import { useGame } from "../hooks/useGame";

const VictoryOverlay = () => {
  const {
    goldCollected,
    setIsFighting,
    setShowResult,
    setSelectedLevel,
    starsEarned,
  } = useGame();
  const [displayGold, setDisplayGold] = useState(0);
  // Mock stars for now - later we can calculate this from HP
  const stars = [1, 2, 3];
  useEffect(() => {
    if (goldCollected > 0) {
      let start = 0;
      const end = goldCollected;
      const duration = 1000; // 1 second animation
      const increment = end / (duration / 16); // 60fps
      const timer = setInterval(() => {
        start += increment;
        if (start >= end) {
          setDisplayGold(end);
          clearInterval(timer);
        } else {
          setDisplayGold(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(timer);
    }
  }, [goldCollected]);

  const handleContinue = () => {
    setShowResult(false);
    setIsFighting(false);
    setSelectedLevel(null);
  };
  const handleReplay = () => {
    setShowResult(false);
    // Briefly toggle off and on to force Phaser to restart with same level
    setIsFighting(false);
    setTimeout(() => setIsFighting(true), 50);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-slate-950/80"
    >
      {/* Background Glow */}
      <div className="absolute w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse" />

      <motion.div
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="relative w-full max-w-md bg-slate-900/90 border border-cyan-500/30 rounded-[40px] p-8 shadow-[0_0_50px_rgba(6,182,212,0.2)] overflow-hidden"
      >
        {/* Top Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            className="inline-block p-4 bg-cyan-500/10 rounded-2xl mb-4"
          >
            <Trophy className="w-12 h-12 text-cyan-400" />
          </motion.div>
          <h2 className="text-4xl font-black italic text-white tracking-tighter ">
            VICTORY
          </h2>
        </div>

        {/* Stars Section */}
        <div className="flex justify-center gap-4 mb-10">
          {stars.map((s) => (
            <motion.div
              key={s}
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.5 + s * 0.2, type: "spring" }}
            >
              <Star
                className={`w-12 h-12 filter drop-shadow-[0_0_10px_rgba(251,191,36,0.5)] ${
                  s <= starsEarned
                    ? "fill-amber-400 text-amber-400"
                    : "fill-slate-800 text-slate-800"
                }`}
              />
            </motion.div>
          ))}
        </div>

        {/* Stats Card */}
        <div className="bg-white/5 border border-white/10 rounded-3xl p-6 mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-slate-400 font-bold uppercase text-xs tracking-widest">
              Gold Collected
            </span>
            <div className="flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-400" />
              <span className="text-2xl font-black text-white font-rajdhani">
                {displayGold}
              </span>
            </div>
          </div>
          <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1, delay: 1 }}
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={handleReplay} // Just pass the function directly
            className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-slate-800 text-white font-bold hover:bg-slate-700 transition-colors"
          >
            <RotateCcw className="w-5 h-5" /> REPLAY
          </button>
          <button
            onClick={handleContinue}
            className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-cyan-500 text-white font-black hover:bg-cyan-400 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)]"
          >
            CONTINUE <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default VictoryOverlay;
