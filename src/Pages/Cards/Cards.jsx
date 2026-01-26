import React, { useState } from "react";
import { useGame } from "../../hooks/useGame";

// Static data for now - later this can move to a separate config file
const CARDS_DATA = [
  {
    id: "STARTER",
    name: "VOID PULSE",
    rarity: "Common",
    color: "text-cyan-400",
    border: "border-cyan-500/50",
  },
  {
    id: "PLASMA",
    name: "NEON STRIKER",
    rarity: "Rare",
    color: "text-purple-400",
    border: "border-purple-500/50",
  },
  {
    id: "TITAN",
    name: "IRON BEAMER",
    rarity: "Legendary",
    color: "text-yellow-400",
    border: "border-yellow-500/80 shadow-[0_0_15px_rgba(234,179,8,0.3)]",
  },
];

const Cards = () => {
  const { equippedCard, setEquippedCard } = useGame();
  const [selectedCardInfo, setSelectedCardInfo] = useState(null);

  return (
    <div className="h-full p-4 overflow-y-auto pb-24">
      {/* GRID CONTAINER */}
      <div className="grid grid-cols-2 gap-3">
        {CARDS_DATA.map((card) => (
          <div
            key={card.id}
            className={`flex flex-col bg-slate-800 rounded-xl border-2 transition-all duration-300 ${
              card.id === equippedCard ? card.border : "border-slate-700"
            }`}
          >
            {/* CARD IMAGE AREA */}
            <div
              onClick={() => setEquippedCard(card.id)}
              className="w-full aspect-square bg-slate-700 rounded-t-lg flex items-center justify-center cursor-pointer relative overflow-hidden"
            >
              <span
                className={`text-4xl transition-transform ${
                  card.id === equippedCard ? "scale-125" : "opacity-40"
                }`}
              >
                🚀
              </span>
              {card.id === equippedCard && (
                <div className="absolute top-2 right-2 bg-cyan-500 text-[8px] font-black px-2 py-1 rounded-full animate-pulse">
                  EQUIPPED
                </div>
              )}
            </div>

            {/* CARD DETAILS */}
            <div className="p-2">
              <h3 className="text-sm font-bold truncate uppercase">
                {card.name}
              </h3>
              <p className={`text-[9px] uppercase font-black ${card.color}`}>
                {card.rarity}
              </p>

              <div className="mt-2 flex gap-1">
                <button
                  onClick={() => setSelectedCardInfo(card)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-[10px] py-2 rounded font-bold transition-colors"
                >
                  INFO
                </button>
                <button className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-[10px] py-2 rounded font-bold transition-colors">
                  UPGRADE
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* INFO MODAL */}
      {selectedCardInfo && (
        <div className="absolute inset-0 z-[150] bg-black/90 p-8 flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-800 border border-white/10 p-6 rounded-[32px] w-full max-w-xs text-center shadow-2xl animate-in zoom-in duration-300">
            <div className="w-20 h-20 bg-slate-700 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl shadow-inner border border-white/5">
              🚀
            </div>
            <h2 className="text-2xl font-black">{selectedCardInfo.name}</h2>
            <p
              className={`${selectedCardInfo.color} text-[10px] font-bold mb-4 uppercase tracking-widest`}
            >
              {selectedCardInfo.rarity}
            </p>

            <div className="text-left text-slate-300 text-xs space-y-2 mb-6 bg-black/40 p-4 rounded-2xl border border-white/5 font-mono">
              <p className="flex justify-between">
                <span>🛡️ ARMOR</span> <span className="text-white">100%</span>
              </p>
              <p className="flex justify-between">
                <span>⚔️ DPS</span>
                <span className="text-white">
                  {selectedCardInfo.id === "PLASMA"
                    ? "145"
                    : selectedCardInfo.id === "TITAN"
                      ? "400"
                      : "50"}
                </span>
              </p>
            </div>

            <button
              onClick={() => setSelectedCardInfo(null)}
              className="w-full bg-slate-700 hover:bg-slate-600 py-4 rounded-2xl font-black uppercase text-sm transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cards;
