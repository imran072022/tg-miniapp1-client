import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { X, Info } from "lucide-react";

const RARITY_CONFIG = {
  common: {
    core: "radial-gradient(circle at 50% 40%, #1e293b 0%, #000000 80%)",
    energy: "#94a3b8",
    glow: "from-slate-400/20",
  },
  rare: {
    core: "radial-gradient(circle at 50% 40%, #1e3a8a 0%, #000000 80%)",
    energy: "#3b82f6",
    glow: "from-blue-500/20",
  },
  epic: {
    core: "radial-gradient(circle at 50% 40%, #4c1d95 0%, #000000 80%)",
    energy: "#a855f7",
    glow: "from-purple-500/20",
  },
  legendary: {
    core: "radial-gradient(circle at 50% 40%, #78350f 0%, #000000 80%)",
    energy: "#f59e0b",
    glow: "from-amber-500/20",
  },
};

const HangarDisplay = ({ ship, onClose, showInfo, setShowInfo }) => {
  const rarity = ship.rarity?.toLowerCase() || "common";
  const theme = RARITY_CONFIG[rarity];

  // Fix for "Impure function" error: Memoize the sparkle data
  const sparkles = useMemo(
    () =>
      [...Array(15)].map((_, i) => ({
        id: i,
        x: (i - 7) * 25,
        duration: 2 + Math.random() * 2,
        delay: Math.random() * 3,
      })),
    [],
  );

  return (
    <div className="relative h-[48vh] w-full overflow-hidden bg-black font-['Rajdhani']">
      {/* 1. BACKGROUND */}
      <div className="absolute inset-0" style={{ background: theme.core }} />

      {/* 2. TOP UI */}
      <div className="relative flex justify-between items-start px-6 pt-10 z-30">
        <button
          onClick={() => setShowInfo(!showInfo)}
          className="p-3 rounded-2xl bg-black/40 border border-white/20 backdrop-blur-md"
        >
          <Info
            className={`w-5 h-5 ${showInfo ? "text-white" : "text-white/40"}`}
          />
        </button>

        <div className="flex flex-col items-center">
          <div className="flex flex-col items-center mb-1">
            <span className="text-[9px] font-black tracking-[0.3em] text-white/30 uppercase mb-1">
              Level
            </span>
            <div className="relative w-10 h-10 flex items-center justify-center">
              <div
                className="absolute inset-0 bg-white"
                style={{
                  clipPath:
                    "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                }}
              />
              <div
                className="absolute inset-[2px] bg-black"
                style={{
                  clipPath:
                    "polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)",
                }}
              />
              <span className="relative z-10 text-xl font-black text-white italic leading-none">
                5
              </span>
            </div>
          </div>
          <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase leading-none">
            {ship.name}
          </h2>
        </div>

        <button
          onClick={onClose}
          className="p-3 rounded-2xl bg-black/40 border border-white/20 backdrop-blur-md"
        >
          <X className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* 3. THE POWER STAGE (Shifted up to -mt-24) */}
      <div className="relative h-full w-full flex flex-col items-center justify-center -mt-24">
        {/* ELEMENT 1: RISING SPARKLES */}
        <div className="absolute inset-0 pointer-events-none">
          {sparkles.map((s) => (
            <motion.div
              key={s.id}
              initial={{ y: 200, x: s.x, opacity: 0 }}
              animate={{ y: -200, opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
              transition={{
                duration: s.duration,
                repeat: Infinity,
                delay: s.delay,
              }}
              className="absolute bottom-1/4 left-1/2 w-1 h-1 rounded-full shadow-lg"
              style={{
                backgroundColor: theme.energy,
                boxShadow: `0 0 10px ${theme.energy}`,
              }}
            />
          ))}
        </div>

        {/* ELEMENT 2: HOLOGRAPHIC PLATE (Rotating Rings) */}
        {/* ELEMENT 2: REAL CYAN HOLOGRAPHIC RINGS */}
        <div className="absolute bottom-[12%] w-80 h-40 flex items-center justify-center pointer-events-none">
          {/* Primary Rotating Data Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute w-64 h-64 border-[2px] border-cyan-400 border-dashed rounded-full scale-y-[0.3] opacity-60"
            style={{ filter: "drop-shadow(0 0 12px #22d3ee)" }}
          />
          {/* Fast-Rotating Scanning Rim */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute w-56 h-56 border-t-[3px] border-cyan-200 rounded-full scale-y-[0.3] opacity-80"
            style={{ filter: "drop-shadow(0 0 15px #06b6d4)" }}
          />
          {/* Inner Core "Projector" Pulse */}
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3], scale: [0.8, 1, 0.8] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute w-32 h-10 bg-cyan-500/40 rounded-full blur-xl scale-y-[0.2]"
          />
          {/* Horizontal Scanning Glitch Line */}
          <motion.div
            animate={{ y: [-20, 20, -20] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute w-48 h-[1px] bg-cyan-300/50 blur-[1px]"
          />
        </div>

        {/* ELEMENT 3: WIDE LIGHT BEAM */}
        <motion.div
          animate={{ opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 3, repeat: Infinity }}
          className={`absolute bottom-[18%] w-56 h-[400px] bg-gradient-to-t ${theme.glow} to-transparent blur-3xl pointer-events-none`}
          style={{ clipPath: "polygon(15% 100%, 85% 100%, 100% 0%, 0% 0%)" }}
        />

        {/* SHIP IMAGE */}
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="relative z-10"
        >
          {/* ELEMENT 4: PULSING LIGHT BELOW SHIP */}
          <div
            className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-32 h-10 rounded-full blur-2xl animate-pulse"
            style={{ backgroundColor: theme.energy, opacity: 0.5 }}
          />

          <img
            src={`/assets/ships/${ship.id.toLowerCase()}.png`}
            alt={ship.name}
            className="w-48 h-48 object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]"
          />
        </motion.div>
      </div>
    </div>
  );
};

export default HangarDisplay;
