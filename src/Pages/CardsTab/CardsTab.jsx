import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Zap, Rocket, Cpu } from "lucide-react";

import { useGame } from "../../hooks/useGame";
import ShipDetail from "./ShipDetail/ShipDetail";
import { LevelConfig } from "../../config/LevelConfig";

const CardsTab = () => {
  const [subTab, setSubTab] = useState("SHIPS");
  const [selectedShip, setSelectedShip] = useState(null);

  // Get data from your hook
  const { resources, playerShips } = useGame();

  return (
    <div className="relative flex flex-col h-full bg-slate-950 font-orbitron pt-4">
      {/* 1. Sub-Tab Toggle */}
      <div className="flex justify-center mb-6">
        <div className="flex bg-black/40 p-1 rounded-2xl border border-white/10">
          {["SHIPS", "INVENTORY"].map((t) => (
            <button
              key={t}
              onClick={() => setSubTab(t)}
              className={`px-8 py-2 rounded-xl text-xs font-black transition-all ${
                subTab === t
                  ? "bg-cyan-500 text-white shadow-lg"
                  : "text-slate-500"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Main Content Area */}
      <div className="px-6 flex-grow overflow-y-auto pb-24">
        <AnimatePresence mode="wait">
          {subTab === "SHIPS" ? (
            <motion.div
              key="ships"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid grid-cols-3 gap-4"
            >
              {playerShips.map((ship) => {
                // Calculation Logic
                const required = LevelConfig.getRequiredCards(ship.level || 1);
                const current = ship.cards || 0;
                const progress = Math.min((current / required) * 100, 100);
                const isEvolution = LevelConfig.isEvolutionLevel(
                  ship.level || 1,
                );

                return (
                  <button
                    key={ship.id}
                    onClick={() => setSelectedShip(ship)}
                    className="bg-slate-900/50 border border-white/5 rounded-2xl p-3 flex flex-col items-center group active:scale-95 transition-transform relative overflow-hidden"
                  >
                    {/* Level Badge */}
                    <div className="absolute top-1 right-2">
                      <span className="text-[7px] text-cyan-400 font-black tracking-tighter uppercase">
                        LV.{ship.level || 1}
                      </span>
                    </div>

                    <div className="w-full aspect-square bg-gradient-to-b from-white/5 to-transparent rounded-xl mb-2 flex items-center justify-center relative overflow-hidden">
                      <img
                        src={`/assets/ships/${ship.id.toLowerCase()}.png`}
                        alt={ship.name}
                        className="w-12 h-12 object-contain group-hover:scale-110 transition-transform"
                      />
                    </div>

                    <span className="text-[9px] font-black text-white truncate w-full text-center uppercase tracking-tighter">
                      {ship.name}
                    </span>

                    {/* Mini Progress Bar */}
                    <div className="w-full h-1 bg-black/40 rounded-full mt-2 overflow-hidden border border-white/5">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className={`h-full ${isEvolution ? "bg-amber-400 shadow-[0_0_5px_#fbbf24]" : "bg-cyan-500 shadow-[0_0_5px_#06b6d4]"}`}
                      />
                    </div>
                    <span className="text-[7px] text-white/40 mt-1 font-bold">
                      {current}/{required}
                    </span>
                  </button>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="inventory"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 gap-4"
            >
              <InventoryCard
                icon={<Shield className="text-blue-400 w-5 h-5" />}
                label="Hull Scraps"
                count={resources.hullScraps}
              />
              <InventoryCard
                icon={<Zap className="text-amber-400 w-5 h-5" />}
                label="Weapon Tech"
                count={resources.weaponTech}
              />
              <InventoryCard
                icon={<Rocket className="text-green-400 w-5 h-5" />}
                label="Thruster Parts"
                count={resources.thrusterParts}
              />
              <InventoryCard
                icon={<Cpu className="text-fuchsia-400 w-5 h-5" />}
                label="Logic Chips"
                count={resources.logicChips}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 3. DETAIL OVERLAY LAYER */}
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

// Helper Component for Inventory
const InventoryCard = ({ icon, label, count }) => (
  <div className="bg-slate-900/80 border border-white/10 rounded-3xl p-5 flex flex-col items-center text-center">
    <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-3">
      {icon}
    </div>
    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
      {label}
    </span>
    <span className="text-xl font-black text-white mt-1">{count}</span>
  </div>
);

export default CardsTab;
