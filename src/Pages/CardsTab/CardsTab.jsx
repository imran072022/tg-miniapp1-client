import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Zap, Rocket, Cpu } from "lucide-react";
import { useGame } from "../../hooks/useGame";
import ShipDetail from "./ShipDetail/ShipDetail";
import { LevelConfig } from "../../config/LevelConfig";

const CardsTab = () => {
  const [subTab, setSubTab] = useState("SHIPS");
  const [selectedShip, setSelectedShip] = useState(null);
  const { resources, playerShips } = useGame();

  const RARITY_STYLES = {
    COMMON: {
      border: "border-white/40 shadow-[0_0_10px_rgba(255,255,255,0.1)]",
      badge: "bg-slate-600",
    },
    RARE: {
      border: "border-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.3)]",
      badge: "bg-blue-600",
    },
    EPIC: {
      border: "border-fuchsia-400 shadow-[0_0_15px_rgba(192,38,211,0.3)]",
      badge: "bg-purple-600",
    },
    LEGENDARY: {
      border: "border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.4)]",
      badge: "bg-amber-500",
    },
  };

  return (
    <div className="relative flex flex-col h-full bg-[#0f172a] font-sans pt-4 overflow-hidden">
      {/* --- DESIGN #1: THE ARCHITECT HANGAR (ART LAYER) --- */}
      <div className="absolute inset-0 pointer-events-none z-0">
        {/* 1. THE HORIZON (Your Base) */}
        <div className="absolute bottom-0 w-full h-1/2 bg-gradient-to-t from-blue-900/40 to-transparent" />
        {/* 2. STRUCTURAL PILLARS (Your Base) */}
        <div className="absolute inset-0 flex justify-around">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="w-px h-full bg-gradient-to-b from-transparent via-cyan-500/20 to-transparent shadow-[0_0_15px_rgba(6,182,212,0.2)]"
            />
          ))}
        </div>
        {/* 3. THE FLOOR PLATE (Your Base) */}
        <div
          className="absolute bottom-0 w-full h-[60%] opacity-30"
          style={{
            backgroundImage: `linear-gradient(0deg, #38bdf8 2px, transparent 2px), linear-gradient(90deg, #38bdf8 2px, transparent 2px)`,
            backgroundSize: "100px 100px",
            transform: "perspective(500px) rotateX(60deg)",
            transformOrigin: "bottom",
          }}
        />
        {/*4. This is the single "Blade" that adds the cinematic finish */}
        <div className="absolute bottom-[40.2%] w-full h-[1px] bg-cyan-400 shadow-[0_0_20px_#22d3ee] z-10 opacity-70" />
        <div className="absolute bottom-[40.2%] w-full h-12 bg-gradient-to-t from-cyan-500/10 to-transparent blur-md" />
      </div>

      {/* --- UI CONTENT LAYER --- */}
      <div className="relative z-10 flex flex-col h-full">
        {/* --- UNIFIED TECH-FRAME TABS --- */}
        <div className="flex justify-center mt-2 mb-10">
          <div
            className="flex bg-black/60 p-1 border border-white/20 backdrop-blur-md relative"
            style={{
              clipPath: "polygon(5% 0, 100% 0, 95% 100%, 0 100%)",
              padding: "4px 20px", // Extra horizontal padding to account for the slant
            }}
          >
            {["SHIPS", "INVENTORY"].map((t) => (
              <button
                key={t}
                onClick={() => setSubTab(t)}
                className={`relative px-12 py-2 text-[10px] font-black tracking-[0.2em] transition-all duration-300 z-10 ${
                  subTab === t
                    ? "text-white"
                    : "text-slate-500 hover:text-cyan-400"
                }`}
                style={{
                  clipPath: "polygon(12% 0, 100% 0, 88% 100%, 0 100%)",
                }}
              >
                {/* Sliding Background Glow */}
                {subTab === t && (
                  <motion.div
                    layoutId="activeTabGlow"
                    className="absolute inset-0 bg-gradient-to-r from-cyan-600/60 to-blue-600/60 shadow-[inset_0_0_15px_rgba(34,211,238,0.5)]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}

                <span className="relative z-10 italic">{t}</span>

                {/* Bottom Energy Line */}
                {subTab === t && (
                  <motion.div
                    layoutId="activeTabLine"
                    className="absolute bottom-0 left-0 w-full h-[2px] bg-cyan-400 shadow-[0_0_10px_#22d3ee] z-20"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Grid Scroll */}
        <div className="px-6 flex-grow overflow-y-auto pb-32 scrollbar-hide pt-6">
          <AnimatePresence mode="wait">
            {subTab === "SHIPS" ? (
              <motion.div
                key="ships"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-3 gap-x-8 gap-y-8"
              >
                {playerShips.map((ship) => {
                  const style =
                    RARITY_STYLES[ship.rarity] || RARITY_STYLES.COMMON;
                  const canUpgrade =
                    ship.cards >= LevelConfig.getRequiredCards(ship.level);
                  return (
                    <motion.button
                      key={ship.id}
                      whileTap={{ scale: 0.96 }}
                      onClick={() => setSelectedShip(ship)}
                      className={`relative aspect-[3/4] overflow-hidden rounded-2xl border-2 ${style.border} group transition-all`}
                      style={{
                        background: "rgba(255, 255, 255, 0.08)",
                        backdropFilter: "blur(20px)",
                      }}
                    >
                      {/* ENERGY NOTCH BADGE */}
                      <div className="absolute top-1 left-1 z-30 flex items-start">
                        <div className="flex items-center gap-1 pl-1  font-bold">
                          <span
                            className="text-[11px] font-bold  text-cyan-300 tracking-[0.2em] italic"
                            style={{
                              textShadow:
                                "1px 1px 2px rgba(0,0,0,0.8), 0 0 5px rgba(34,211,238,0.4)",
                            }}
                          >
                            Lv.
                            <span className="">{ship.level || 1}</span>
                          </span>
                        </div>
                      </div>

                      {/* SHIP IMAGE - Central Focus */}
                      <div className="absolute top-0 left-0 right-0 h-[85%] flex items-center justify-center">
                        <img
                          src={`/assets/cardsTab/${ship.id.toLowerCase()}.png`}
                          className="w-full h-full object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)] group-hover:scale-110 transition-transform duration-700"
                        />
                      </div>

                      {/* DATA STRIP - Bottom 15% */}
                      {/* DATA STRIP - Bottom 15% */}
                      <div className="absolute bottom-2 left-0 right-0 px-1 flex flex-col gap-1">
                        <div className="flex justify-between items-center px-1">
                          {/* DYNAMIC LABEL */}
                          {canUpgrade ? (
                            <motion.span
                              animate={{ opacity: [1, 0.5, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                              className="text-[8px] font-black text-yellow-400 tracking-widest uppercase italic"
                            >
                              UPGRADE READY
                            </motion.span>
                          ) : (
                            <span className="text-[8px] font-black text-cyan tracking-widest uppercase">
                              Cards
                            </span>
                          )}

                          {/* CARD COUNT */}
                          <span
                            className={`text-[8px] font-bold italic ${canUpgrade ? "text-yellow-400" : "text-white"}`}
                          >
                            {ship.cards}/
                            {LevelConfig.getRequiredCards(ship.level)}
                          </span>
                        </div>

                        {/* Progress Bar (using the gold pulse logic from before) */}
                        <div
                          className={`h-[2px] w-full rounded-full overflow-hidden ${canUpgrade ? "bg-yellow-900/40" : "bg-white/10"}`}
                        >
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{
                              width: `${Math.min((ship.cards / LevelConfig.getRequiredCards(ship.level)) * 100, 100)}%`,
                            }}
                            className={`h-full ${
                              canUpgrade
                                ? "bg-yellow-400 shadow-[0_0_8px_#fbbf24]"
                                : "bg-cyan-400 shadow-[0_0_8px_#22d3ee]"
                            }`}
                          />
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                key="inventory"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-2 gap-6 p-4"
              >
                {[
                  {
                    id: "weaponTech",
                    name: "WEAPON TECH",
                    count: resources.weaponTech,
                  },
                  {
                    id: "thrusterParts",
                    name: "THRUSTER PARTS",
                    count: resources.thrusterParts,
                  },
                  {
                    id: "hullScraps",
                    name: "HULL SCRAPS",
                    count: resources.hullScraps,
                  },
                  {
                    id: "logicChip",
                    name: "LOGIC CHIPS",
                    count: resources.logicChips,
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    className="relative flex flex-col items-center p-4 rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.05] to-transparent backdrop-blur-md group hover:border-cyan-500/30 transition-all duration-300"
                  >
                    {/* 1. IMAGE CONTAINER - Fixed Size to prevent layout shifts */}
                    <div className="w-24 h-24 flex items-center justify-center mb-3">
                      <img
                        src={`/assets/Shards/${item.id}.png`}
                        alt={item.name}
                        className="w-full h-full object-contain drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)] group-hover:scale-110 group-hover:-translate-y-1 transition-transform duration-500"
                      />
                    </div>

                    {/* 2. TEXT CONTENT - Centered and constrained */}
                    <div className="w-full text-center flex flex-col items-center border-t border-white/5 pt-3">
                      {/* Label with better letter spacing */}
                      <span className="text-[9px] font-black text-cyan-400/50 tracking-[0.25em] leading-tight mb-1 uppercase break-words w-full px-1">
                        {item.name}
                      </span>

                      {/* Count with clear contrast */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-xl font-black text-white tabular-nums tracking-tight">
                          {item.count.toLocaleString()}
                        </span>
                        <span className="text-[7px] text-white/30 font-bold uppercase tracking-widest mt-1">
                          Units
                        </span>
                      </div>
                    </div>

                    {/* 3. ARCHITECT DECORATION - Glowing Corner Accents */}
                    <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-white/10 rounded-tl-xl group-hover:border-cyan-500/50 transition-colors" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-white/10 rounded-br-xl group-hover:border-cyan-500/50 transition-colors" />

                    {/* Sublte bottom glow on hover */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-cyan-500/0 group-hover:via-cyan-500/40 to-transparent transition-all duration-500" />
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {selectedShip && (
          <ShipDetail
            ship={selectedShip}
            onClose={() => setSelectedShip(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CardsTab;
