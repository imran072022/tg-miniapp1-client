import React, { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Info } from "lucide-react";
import { getStatsAtLevel } from "../../../config/LevelConfig";

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
    // Using a very dark charcoal/gold mix for the core to make the bright yellow pop
    core: "radial-gradient(circle at 50% 45%, #2a2805 0%, #000000 90%)",

    // Your requested bright yellow (#FEF01C is the most "high-energy")
    energy: "#FEF01C",

    // Stronger opacity for the glow because this yellow is very bright
    glow: "from-[#FEF01C]/40",
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
    <div className="relative h-[48vh] w-full overflow-hidden bg-black ">
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
            {/* TIER INDICATOR (Fixed Logic) */}
            <span className="text-[10px] font-black tracking-[0.4em] text-cyan-400 uppercase mb-1 drop-shadow-[0_0_8px_rgba(34,211,238,0.4)]">
              {/* If rank is 0, show I. If rank is 1, show II. If rank is 2+, show III */}
              {!ship.rank || ship.rank === 0
                ? "Tier I"
                : ship.rank === 1
                  ? "Tier II"
                  : "Tier III"}
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
                {ship.level || 1}
              </span>
            </div>
          </div>

          <h2 className="text-3xl font-black italic tracking-tighter text-white uppercase leading-none mt-2">
            {ship.name || ship.id}
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
        {/* ENHANCED WIDE HOLOGRAPHIC PROJECTOR */}
        <div className="absolute bottom-[8%] w-[600px] h-52 flex items-center justify-center pointer-events-none">
          {/* 1. WIDE ENERGY FIELD BACKGROUND */}
          <motion.div
            animate={{
              opacity: [0.1, 0.2, 0.1],
              scale: [0.95, 1.05, 0.95],
            }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute w-[110%] h-32 rounded-full blur-3xl"
            style={{
              background: `radial-gradient(ellipse at center, ${theme.energy}30, transparent 70%)`,
            }}
          />

          {/* 2. OUTER CONTAINMENT RING (Wider, Colored) */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute w-[500px] h-[500px] border-[3px] rounded-full scale-y-[0.25]"
            style={{
              borderColor: `${theme.energy}80`,
              borderTopColor: theme.energy,
              borderRightColor: `${theme.energy}40`,
              filter: `drop-shadow(0 0 25px ${theme.energy})`,
            }}
          />

          {/* 3. PRIMARY DATA RING (Your original, enhanced) */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute w-96 h-96 border-[2px] rounded-full scale-y-[0.3]"
            style={{
              borderColor: theme.energy,
              borderStyle: "dashed",
              opacity: 0.7,
              filter: `drop-shadow(0 0 20px ${theme.energy}) blur(0.5px)`,
            }}
          />

          {/* 4. FAST SCANNING RIM (Enhanced) */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            className="absolute w-80 h-80 rounded-full scale-y-[0.3]"
            style={{
              borderTop: `4px solid ${theme.energy}`,
              borderRight: `2px solid ${theme.energy}80`,
              borderBottom: `1px solid ${theme.energy}40`,
              filter: `drop-shadow(0 0 18px ${theme.energy})`,
            }}
          />

          {/* 5. DATA PARTICLES (Orbiting the rings) */}
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={`particle-${i}`}
              animate={{
                rotate: 360,
                scale: [0.5, 1, 0.5],
              }}
              transition={{
                rotate: {
                  duration: 8,
                  repeat: Infinity,
                  ease: "linear",
                  delay: i * 0.1,
                },
                scale: { duration: 2, repeat: Infinity },
              }}
              className="absolute w-2 h-2 rounded-full"
              style={{
                backgroundColor: theme.energy,
                left: "50%",
                top: "50%",
                marginLeft: -1,
                marginTop: -1,
                transformOrigin: `${i % 2 === 0 ? "240px" : "200px"} center`,
                filter: `drop-shadow(0 0 8px ${theme.energy})`,
              }}
            />
          ))}

          {/* 6. CENTRAL PROJECTOR CORE (Enhanced) */}
          <motion.div
            animate={{
              opacity: [0.4, 0.8, 0.4],
              scale: [0.9, 1.1, 0.9],
              rotate: [0, 180, 360],
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute w-48 h-16 rounded-full blur-xl scale-y-[0.25]"
            style={{
              background: `radial-gradient(ellipse at center, ${theme.energy}60, transparent 70%)`,
              filter: `drop-shadow(0 0 30px ${theme.energy})`,
            }}
          />

          {/* 7. MULTI-DIRECTIONAL SCAN LINES */}
          {/* Horizontal */}
          <motion.div
            animate={{ y: [-30, 30, -30] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="absolute w-64 h-[2px] blur-sm"
            style={{
              background: `linear-gradient(90deg, transparent, ${theme.energy}, transparent)`,
            }}
          />

          {/* Vertical */}
          <motion.div
            animate={{ x: [-30, 30, -30] }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            className="absolute w-[2px] h-32 blur-sm"
            style={{
              background: `linear-gradient(180deg, transparent, ${theme.energy}, transparent)`,
            }}
          />

          {/* Diagonal 1 */}
          <motion.div
            animate={{
              x: [-40, 40, -40],
              y: [-20, 20, -20],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            className="absolute w-48 h-[1px] rotate-45 blur-sm"
            style={{
              background: `linear-gradient(90deg, transparent, ${theme.energy}80, transparent)`,
            }}
          />

          {/* Diagonal 2 */}
          <motion.div
            animate={{
              x: [40, -40, 40],
              y: [-20, 20, -20],
            }}
            transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
            className="absolute w-48 h-[1px] -rotate-45 blur-sm"
            style={{
              background: `linear-gradient(90deg, transparent, ${theme.energy}80, transparent)`,
            }}
          />

          {/* 8. RADIAL ENERGY SPIKES */}
          {[...Array(6)].map((_, i) => {
            const angle = (i / 6) * 360;
            return (
              <motion.div
                key={`spike-${i}`}
                animate={{
                  scale: [0.3, 1, 0.3],
                  opacity: [0.2, 0.8, 0.2],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
                className="absolute w-1 h-20 origin-bottom"
                style={{
                  background: `linear-gradient(to top, transparent, ${theme.energy})`,
                  transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                  top: "50%",
                  left: "50%",
                  filter: `drop-shadow(0 0 10px ${theme.energy})`,
                }}
              />
            );
          })}

          {/* 9. FLOATING DATA POINTS (Static positions) */}
          {[
            { x: "30%", y: "20%" },
            { x: "70%", y: "20%" },
            { x: "20%", y: "50%" },
            { x: "80%", y: "50%" },
            { x: "30%", y: "80%" },
            { x: "70%", y: "80%" },
          ].map((pos, i) => (
            <motion.div
              key={`datapoint-${i}`}
              animate={{
                scale: [0.5, 1, 0.5],
                opacity: [0.3, 0.9, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
              }}
              className="absolute w-3 h-3 rounded-full"
              style={{
                backgroundColor: theme.energy,
                left: pos.x,
                top: pos.y,
                filter: `drop-shadow(0 0 12px ${theme.energy})`,
              }}
            />
          ))}

          {/* 10. HOLOGRAM GLITCH OVERLAY (Occasional) */}
          <motion.div
            animate={{
              opacity: [0, 0.15, 0],
              y: [0, -5, 0],
            }}
            transition={{
              duration: 0.3,
              repeat: Infinity,
              repeatDelay: Math.random() * 5 + 2,
            }}
            className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent mix-blend-overlay"
          />
        </div>

        {/* ENHANCED ENERGY COLUMN (Wider) */}
        <motion.div
          animate={{
            opacity: [0.1, 0.25, 0.1],
            scaleY: [1, 1.15, 1],
          }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute bottom-[15%] w-80 h-[500px] pointer-events-none"
          style={{
            background: `linear-gradient(to top, ${theme.energy}30, transparent)`,
            filter: "blur(40px)",
            clipPath: "polygon(20% 100%, 80% 100%, 100% 0%, 0% 0%)",
          }}
        />

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
            src={`/assets/shipDetail/${ship.id.toLowerCase()}.png`}
            alt={ship.name}
            className="w-52 h-52 object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.8)]"
          />
        </motion.div>
        {/* REPLACE THE ENTIRE MINIMALIST TACTICAL HUD SECTION (lines 160-205) WITH THIS: */}

        {/* 5. STANDARD INFO DROPDOWN */}
        <AnimatePresence>
          {showInfo && (
            <>
              {/* Invisible backdrop for auto-close */}
              <div
                className="absolute inset-0 z-40"
                onClick={() => setShowInfo(false)}
              />

              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="absolute top-16 left-6 z-50 w-72 bg-gradient-to-b from-slate-900/95 to-black/95 border border-slate-700/50 rounded-xl shadow-2xl backdrop-blur-sm"
              >
                {/* ADD THIS COLORED ACCENT BORDER - MOVED TO TOP */}
                <div
                  className="absolute top-0 left-0 h-1 w-full rounded-t-lg"
                  style={{ background: theme.energy }}
                />

                {/* Arrow pointing to info button - NOW COLORED */}
                <div className="absolute -right-2 top-8 w-4 h-4">
                  <div
                    className="w-4 h-4 rotate-45 border-l border-t"
                    style={{
                      background: theme.energy,
                      borderColor: `${theme.energy}80` /* 80 = 50% opacity */,
                    }}
                  />
                </div>

                {/* Header - ADDED pt-5 TO PUSH CONTENT DOWN */}
                <div className="p-4 pt-5 border-b border-slate-800">
                  <h3 className="text-lg font-bold text-white">{ship.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-sm text-slate-300 capitalize">
                      {ship.rarity}
                    </span>
                    <span className="text-slate-500">•</span>
                    <span className="text-sm text-slate-300">
                      Level {ship.level}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="p-4 space-y-3">
                  {(() => {
                    const stats = getStatsAtLevel(ship, ship.level);
                    return (
                      <>
                        <StatRow label="Health" value={stats.hp} />
                        {stats.damage && (
                          <StatRow label="DPS" value={stats.damage} />
                        )}
                        <StatRow label="Fire Rate" value={stats.fireRate} />
                        <StatRow
                          label="Bullet speed"
                          value={Math.abs(stats.bVel).toFixed(1)}
                        />
                        <StatRow label="Bullet size" value={stats.bScale} />
                      </>
                    );
                  })()}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
{
  /* Update the StatRow component */
}
const StatRow = ({ label, value }) => {
  const icons = {
    Health: "❤️",
    DPS: "💥",
    "Fire Rate": "⚡",
    "Bullet speed": "➤",
    "Bullet size": "⬤",
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-sm">{icons[label] || "📊"}</span>
        <span className="text-slate-300">{label}</span>
      </div>
      <span className="font-bold text-white">{value}</span>
    </div>
  );
};

export default HangarDisplay;
