import React from "react";
import { motion } from "framer-motion";
import { useGame } from "../../hooks/useGame";
import OrbitParticles from "./UIDesign/OrbitParticles";

/* -------------------- STAT LINE -------------------- */
/* -------------------- VERTICAL STAT BAR -------------------- */
const VerticalStatBar = ({ label, value, color }) => (
  <div className="flex flex-col items-center">
    <span className="text-[8px] font-black text-white/60 uppercase tracking-widest mb-1">
      {label}
    </span>
    <div className="relative w-2 h-20 bg-white/5 rounded-full overflow-hidden border border-white/10">
      <motion.div
        initial={{ height: 0 }}
        animate={{ height: `${value}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className={`absolute bottom-0 w-full ${color} rounded-full`}
      />
    </div>
    <span className="text-[9px] font-black text-white mt-1">{value}%</span>
  </div>
);

/* -------------------- PILOT HUD -------------------- */
const PilotHUD = () => {
  const { equippedCard, playerShips } = useGame();
  const shipData = playerShips.find((s) => s.id === equippedCard) || {};
  const shipImage = `/assets/cardsTab/${equippedCard}.png`;

  return (
    <div className="w-full h-full flex flex-col items-center justify-start pt-4 overflow-hidden relative">
      {/* ================= (1) CINEMATIC BRIGHT REACTOR - toned down ================= */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        {/* 1. CENTRAL CORE - ENHANCED PLASMA CORE */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute w-44 h-44 rounded-full"
          style={{
            background: `radial-gradient(
      circle at center,
      rgba(34, 211, 238, 0.8) 0%,
      rgba(34, 211, 238, 0.5) 20%,
      rgba(168, 85, 247, 0.3) 40%,
      transparent 70%
    )`,
            filter: `
      blur(40px)
      drop-shadow(0 0 50px rgba(34, 211, 238, 0.6))
      drop-shadow(0 0 80px rgba(168, 85, 247, 0.3))
    `,
            transform: "translate3d(0, 0, 0)", // GPU acceleration
            willChange: "transform, opacity", // Performance hint
          }}
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0, 0.4, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeOut",
          }}
          className="absolute w-32 h-32 rounded-full blur-2xl"
          style={{
            background: `radial-gradient(
      circle,
      rgba(255, 255, 255, 0.9) 0%,
      rgba(34, 211, 238, 0.6) 30%,
      transparent 70%
    )`,
            transform: "translate3d(0, 0, 0)",
          }}
        />
        {/* 2. OUTER ENERGY GLOW RING - ENHANCED */}
        <motion.div
          animate={{
            scale: [1, 1.08, 1],
            opacity: [0.25, 0.5, 0.25],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute w-[340px] h-[340px] rounded-full"
          style={{
            background: `radial-gradient(
      circle,
      rgba(34, 211, 238, 0.15) 0%,
      rgba(168, 85, 247, 0.1) 30%,
      transparent 80%
    )`,
            boxShadow: `
      inset 0 0 60px rgba(34, 211, 238, 0.3),
      0 0 80px rgba(34, 211, 238, 0.2),
      0 0 120px rgba(168, 85, 247, 0.15)
    `,
            transform: "rotateX(65deg) translate3d(0, 0, 0)",
            filter: "blur(1px)",
            willChange: "transform, opacity",
          }}
        />
        {/* 3. INNER ENERGY RING - ENHANCED */}
        <motion.div
          animate={{
            rotate: 360,
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            rotate: {
              duration: 20,
              repeat: Infinity,
              ease: "linear",
            },
            opacity: {
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
          className="absolute w-72 h-72 rounded-full"
          style={{
            border: "2px dashed",
            borderImage: `linear-gradient(
      90deg,
      rgba(34,211,238,0) 0%,
      rgba(34,211,238,0.7) 25%,
      rgba(168,85,247,0.7) 50%,
      rgba(34,211,238,0.7) 75%,
      rgba(34,211,238,0) 100%
    ) 1`,
            filter: `
      drop-shadow(0 0 25px rgba(34,211,238,0.5))
      drop-shadow(0 0 15px rgba(168,85,247,0.4))
      blur(0.5px)
    `,
            transform: "rotateX(60deg) translate3d(0, 0, 0)",
            willChange: "transform, opacity",
          }}
        />
        {/* 4. FAST ENERGY RIM - ENHANCED */}
        <motion.div
          animate={{
            rotate: -360,
            scale: [1, 1.05, 1],
          }}
          transition={{
            rotate: {
              duration: 6,
              repeat: Infinity,
              ease: "linear",
            },
            scale: {
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
          className="absolute w-56 h-56 rounded-full"
          style={{
            borderTop: "3px solid rgba(34,211,238,0.8)",
            borderRight: "2px solid rgba(168,85,247,0.6)",
            borderBottom: "1px solid rgba(34,211,238,0.4)",
            borderLeft: "2px solid rgba(168,85,247,0.6)",
            filter: `
      drop-shadow(0 0 15px rgba(34,211,238,0.6))
      drop-shadow(0 0 10px rgba(168,85,247,0.4))
      blur(0.8px)
    `,
            transform: "rotateX(55deg) translate3d(0, 0, 0)",
            willChange: "transform",
          }}
        />
        {/* 5. FAST LIGHT FLAIRS - ENHANCED */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={`flare-${i}`}
            animate={{
              rotate: 360,
              scale: [1, 1.2, 1],
            }}
            transition={{
              rotate: {
                duration: 4 + i * 0.3,
                repeat: Infinity,
                ease: "linear",
              },
              scale: {
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: i * 0.1,
              },
            }}
            className="absolute w-[1px] h-28 blur-sm rounded-full"
            style={{
              background: `linear-gradient(
        to top,
        transparent 0%,
        ${i % 2 === 0 ? "rgba(34,211,238,0.7)" : "rgba(168,85,247,0.7)"} 30%,
        ${i % 2 === 0 ? "rgba(34,211,238,0.9)" : "rgba(168,85,247,0.9)"} 50%,
        transparent 100%
      )`,
              transformOrigin: "50% 100%",
              top: "50%",
              left: "50%",
              marginLeft: "-0.5px",
              filter: `drop-shadow(0 0 10px ${i % 2 === 0 ? "#22d3ee" : "#a855f7"})`,
              transform: `rotate(${i * 60}deg) translate3d(0, 0, 0)`,
              willChange: "transform",
            }}
          />
        ))}
      </div>
      {/* =============== (2) Combat Rating (top-right corner) ==============*/}
      <div className="absolute top-4 right-6 text-right z-30">
        {/* Label with glow effect */}
        <div className="text-[8px] font-black uppercase tracking-[0.2em] mb-1">
          <span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent">
            Combat Rating
          </span>
          {/* Tiny animated underline */}
          <motion.div
            animate={{ scaleX: [0.8, 1.2, 0.8] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="h-[1px] mt-0.5 bg-gradient-to-r from-transparent via-cyan-500/70 to-transparent"
          />
        </div>
        {/* Rating number with pulse effect */}
        <motion.div
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="text-2xl font-black italic"
        >
          <span className="bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
            {(
              (shipData.level || 1) * 125 +
              (shipData.rank || 0) * 600
            ).toLocaleString()}
          </span>
          {/* Small rating badge */}
          <div className="inline-flex items-center ml-2">
            <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 mr-1" />
            <span className="text-[9px] font-bold text-cyan-400/70">
              {(shipData.rank || 0) > 2 ? "ELITE" : "STANDARD"}
            </span>
          </div>
        </motion.div>
      </div>

      {/* =================== (3) SHIP AREA ====================*/}
      <div className="relative flex-1 min-h-0 w-full flex items-center justify-center z-10">
        {/* -------------------- Reactor Ring Base -------------------- */}
        <motion.div
          animate={{ rotateZ: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute w-80 h-80 rounded-full pointer-events-none"
          style={{ transform: "rotateX(65deg)" }}
        >
          {/* Outer ring - toned down */}
          <div className="absolute inset-0 rounded-full border border-cyan-400/10" />
          {/* Inner energy ring - softer */}
          <motion.div
            animate={{ opacity: [0.15, 0.35, 0.15] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-6 rounded-full border border-cyan-300/20 blur-[0.8px]"
          />
          {/* Core glow - softer */}
          <div className="absolute inset-12 rounded-full bg-cyan-400/05 blur-xl" />
        </motion.div>

        {/* -------------------- Ship + Energy Reactor Glow -------------------- */}
        <div className="relative z-20 flex items-center justify-center">
          {/* 1. Core Glow Spill - reduced intensity */}
          <motion.div
            animate={{
              opacity: [0.15, 0.4, 0.15],
              scale: [0.95, 1.05, 0.95],
              rotate: [0, 2, 0],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-72 h-72 rounded-full blur-2xl"
            style={{
              background: `radial-gradient(circle, rgba(255,255,220,0.3) 0%, rgba(255,245,200,0.15) 40%, rgba(0,200,255,0.1) 80%, transparent 100%)`,
              filter:
                "drop-shadow(0 0 15px rgba(255,255,220,0.35)) drop-shadow(0 0 12px rgba(0,200,255,0.2))",
            }}
          />

          {/* 2. Reactor Rim Overlay - softened */}
          <motion.div
            animate={{ opacity: [0.1, 0.3, 0.1], rotate: [0, -2, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute w-64 h-64 rounded-full pointer-events-none mix-blend-screen"
            style={{
              background: `conic-gradient(
          from 0deg,
          rgba(255,255,220,0.3),
          rgba(0,200,255,0.25),
          rgba(0,255,180,0.15),
          rgba(255,245,200,0.3)
        )`,
              filter: "blur(8px) drop-shadow(0 0 12px rgba(0,200,255,0.2))",
            }}
          />

          {/* 3. Subtle Energy Lines - softer */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={`energy-line-${i}`}
              animate={{
                rotate: [0, 360],
                scale: [0.75, 0.95, 0.75],
                opacity: [0.1, 0.4, 0.1],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "linear",
              }}
              className="absolute w-[2px] h-24 rounded-full"
              style={{
                background: `linear-gradient(to top, transparent, rgba(0,255,200,0.25), transparent)`,
                transformOrigin: "50% 100%",
              }}
            />
          ))}

          {/* 4. Original Ship */}
          <motion.img
            src={shipImage}
            alt={equippedCard}
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-64 h-64 max-h-[38vh] object-contain z-30"
            onError={(e) => {
              e.target.src = "/assets/ships/vanguard.png";
            }}
          />
        </div>

        {/* 5. ---------------- Stats ----------------- */}
        {/* 5. ================= (3A) RESPONSIVE VERTICAL STATS PANEL ================= */}
        <div className="absolute top-4 left-4 z-30 flex flex-col gap-2">
          {/* Attack Stat */}
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-center">
              <span className="text-[7px] font-black text-orange-500/80 uppercase tracking-widest mb-1">
                ATK
              </span>
              <div className="relative w-1.5 h-16 bg-white/5 rounded-full overflow-hidden border border-white/10">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "75%" }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="absolute bottom-0 w-full bg-gradient-to-t from-orange-500 to-orange-300 rounded-full"
                />
                {/* Glow effect */}
                <div className="absolute inset-0 bg-orange-500/20 blur-sm" />
              </div>
              <span className="text-[8px] font-black text-white mt-0.5">
                75%
              </span>
            </div>
          </div>

          {/* Engine Stat */}
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-center">
              <span className="text-[7px] font-black text-cyan-500/80 uppercase tracking-widest mb-1">
                ENG
              </span>
              <div className="relative w-1.5 h-16 bg-white/5 rounded-full overflow-hidden border border-white/10">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "90%" }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                  className="absolute bottom-0 w-full bg-gradient-to-t from-cyan-500 to-cyan-300 rounded-full"
                />
                {/* Glow effect */}
                <div className="absolute inset-0 bg-cyan-500/20 blur-sm" />
              </div>
              <span className="text-[8px] font-black text-white mt-0.5">
                90%
              </span>
            </div>
          </div>

          {/* Hull Stat */}
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-center">
              <span className="text-[7px] font-black text-purple-500/80 uppercase tracking-widest mb-1">
                HULL
              </span>
              <div className="relative w-1.5 h-16 bg-white/5 rounded-full overflow-hidden border border-white/10">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "45%" }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
                  className="absolute bottom-0 w-full bg-gradient-to-t from-purple-500 to-purple-300 rounded-full"
                />
                {/* Glow effect */}
                <div className="absolute inset-0 bg-purple-500/20 blur-sm" />
              </div>
              <span className="text-[8px] font-black text-white mt-0.5">
                45%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ================ (4) SYMMETRICAL ENERGY FLARE BURSTS =============== */}
      <div className="absolute inset-0 pointer-events-none z-20">
        {/* NORTH Flare */}
        <motion.div
          animate={{
            y: [0, -80, -60, 0],
            scale: [0.5, 1.3, 0.9, 0.5],
            opacity: [0, 0.9, 0.7, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute w-2 h-16 rounded-full blur-md"
          style={{
            background:
              "linear-gradient(to top, transparent, #22d3ee, transparent)",
            top: "50%",
            left: "50%",
            marginLeft: -1,
            marginTop: -8,
            filter: "drop-shadow(0 0 12px #22d3ee)",
            transformOrigin: "50% 100%",
          }}
        />

        {/* EAST Flare */}
        <motion.div
          animate={{
            x: [0, 80, 60, 0],
            scale: [0.5, 1.3, 0.9, 0.5],
            opacity: [0, 0.9, 0.7, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 0.6,
          }}
          className="absolute w-2 h-16 rounded-full blur-md"
          style={{
            background:
              "linear-gradient(to top, transparent, #a855f7, transparent)",
            top: "50%",
            left: "50%",
            marginLeft: -1,
            marginTop: -8,
            filter: "drop-shadow(0 0 12px #a855f7)",
            transformOrigin: "50% 100%",
            transform: "rotate(90deg)",
          }}
        />

        {/* SOUTH Flare */}
        <motion.div
          animate={{
            y: [0, 80, 60, 0],
            scale: [0.5, 1.3, 0.9, 0.5],
            opacity: [0, 0.9, 0.7, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.2,
          }}
          className="absolute w-2 h-16 rounded-full blur-md"
          style={{
            background:
              "linear-gradient(to top, transparent, #22d3ee, transparent)",
            top: "50%",
            left: "50%",
            marginLeft: -1,
            marginTop: -8,
            filter: "drop-shadow(0 0 12px #22d3ee)",
            transformOrigin: "50% 100%",
            transform: "rotate(180deg)",
          }}
        />

        {/* WEST Flare */}
        <motion.div
          animate={{
            x: [0, -80, -60, 0],
            scale: [0.5, 1.3, 0.9, 0.5],
            opacity: [0, 0.9, 0.7, 0],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1.8,
          }}
          className="absolute w-2 h-16 rounded-full blur-md"
          style={{
            background:
              "linear-gradient(to top, transparent, #a855f7, transparent)",
            top: "50%",
            left: "50%",
            marginLeft: -1,
            marginTop: -8,
            filter: "drop-shadow(0 0 12px #a855f7)",
            transformOrigin: "50% 100%",
            transform: "rotate(270deg)",
          }}
        />
      </div>

      {/* ================ (5) SHIP IDENTITY ================*/}
      <div className="shrink-0 text-center mt-1 mb-2 z-20 orbitron">
        <div className="inline-flex items-center gap-2 bg-black/40 border border-white/10 px-3 py-0.5 rounded-full mb-1">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
          <span className="text-[10px] font-black text-cyan-400 tracking-widest uppercase ">
            {equippedCard === "Vanguard" ? "RECON" : "HEAVY"} UNIT MK-
            {shipData.rank + 1 || 1}
          </span>
        </div>

        <h2 className="text-2xl font-black uppercase leading-none">
          <span className="bg-gradient-to-r from-cyan-300 via-white to-cyan-300 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
            {equippedCard}
          </span>
        </h2>
      </div>

      <OrbitParticles />
    </div>
  );
};

export default PilotHUD;
