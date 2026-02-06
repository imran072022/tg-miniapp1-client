import React from "react";
import { motion } from "framer-motion";
import { Swords, Map, Zap, Timer } from "lucide-react";
import { useGame } from "../../hooks/useGame";

const BattleTab = () => {
  const {
    equippedCard,
    setIsFighting,
    setGameMode,
    setSelectedLevel,
    slots,
    openChest,
  } = useGame();

  // For now, we'll map the ship ID to an image path
  const shipImage = `/assets/ships/${equippedCard.toLowerCase()}.png`;

  return (
    <div className="flex flex-col h-full items-center justify-between py-8 px-6">
      {/* 1. THE HANGAR (Ship Display) */}
      <div className="relative w-full flex flex-col items-center justify-center py-10">
        {/* Holographic Pedestal */}
        <div className="absolute w-64 h-32 bg-cyan-500/20 rounded-[100%] blur-xl" />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute w-64 h-32 border-2 border-dashed border-cyan-500/30 rounded-[100%] flex items-center justify-center"
          style={{ transformStyle: "preserve-3d", transform: "rotateX(75deg)" }}
        />

        {/* The Ship Sprite */}
        <motion.img
          key={equippedCard}
          src={shipImage}
          alt="Current Ship"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: [0, -15, 0], opacity: 1 }}
          transition={{
            y: { duration: 4, repeat: Infinity, ease: "easeInOut" },
            opacity: { duration: 0.5 },
          }}
          className="w-48 h-48 object-contain drop-shadow-[0_0_30px_rgba(6,182,212,0.6)] z-10"
        />

        {/* Ship Info Tag */}
        <div className="mt-8 text-center z-10">
          <h3 className="text-2xl font-black italic tracking-widest text-white uppercase drop-shadow-md">
            {equippedCard}
          </h3>
          <div className="flex gap-2 mt-2">
            <span className="text-[10px] bg-cyan-500/20 px-2 py-0.5 rounded border border-cyan-500/30 text-cyan-400 font-bold">
              MK-I
            </span>
            <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded border border-white/10 text-slate-400 font-bold">
              READY
            </span>
          </div>
        </div>
      </div>

      {/* 2. GAME MODE SELECTION */}
      <div className="w-full grid grid-cols-2 gap-4">
        {/* Campaign Button */}
        <button
          onClick={() => {
            /* This will open the level selection map */
          }}
          className="group relative overflow-hidden bg-slate-900 border border-white/10 p-4 rounded-3xl transition-all hover:border-cyan-500/50"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <Map className="w-6 h-6 text-cyan-400 mb-2" />
          <div className="text-sm font-black tracking-tighter">CAMPAIGN</div>
          <div className="text-[9px] text-slate-500 font-bold">
            SECTOR 01-04
          </div>
        </button>

        {/* Endless Button */}
        <button
          onClick={() => {
            setGameMode("ENDLESS");
            setIsFighting(true);
          }}
          className="group relative overflow-hidden bg-slate-900 border border-white/10 p-4 rounded-3xl transition-all hover:border-fuchsia-500/50"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <Timer className="w-6 h-6 text-fuchsia-400 mb-2" />
          <div className="text-sm font-black tracking-tighter">SURVIVAL</div>
          <div className="text-[9px] text-slate-500 font-bold">
            HIGH SCORE: 0
          </div>
        </button>
      </div>

      {/* 3. SUPPLY DROP SLOTS (The Chests) */}
      <div className="grid grid-cols-4 gap-3 w-full">
        {slots.map((slot, index) => (
          <div key={index} className="relative aspect-square">
            {slot ? (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => openChest(slot.id)}
                className={`w-full h-full rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all
            ${
              slot.status === "READY"
                ? "bg-cyan-500/10 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                : "bg-slate-800/40 border-white/5 opacity-80"
            }`}
              >
                {/* Box Icon (Replace with your Box Image) */}
                <div className="relative">
                  <div className="w-8 h-8 bg-gradient-to-br from-slate-400 to-slate-600 rounded-lg shadow-lg rotate-3" />
                  {slot.status === "READY" && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping" />
                  )}
                </div>

                <span className="text-[8px] font-black tracking-widest uppercase">
                  {slot.status}
                </span>
              </motion.button>
            ) : (
              /* Empty Slot */
              <div className="w-full h-full rounded-2xl border-2 border-dashed border-white/5 bg-black/20 flex items-center justify-center">
                <span className="text-[10px] text-white/5 font-black uppercase rotate-45">
                  EMPTY
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BattleTab;
