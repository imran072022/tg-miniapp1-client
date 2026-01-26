import React from "react";
import { useGame } from "../hooks/useGame";

const BottomNav = () => {
  const { currentTab, setCurrentTab } = useGame();

  const tabs = [
    { id: "CARDS", label: "CARDS" },
    { id: "BATTLE", label: "BATTLE" },
    { id: "SHOP", label: "SHOP" },
  ];

  return (
    <div className="shrink-0 bg-slate-900 border-t border-white/5 p-4 pb-8 flex justify-around items-center z-50">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setCurrentTab(tab.id)}
          className={`font-black text-[10px] tracking-widest transition-all ${
            tab.id === "BATTLE" && currentTab === "BATTLE"
              ? "px-8 py-2 rounded-xl border-2 border-cyan-400 text-cyan-400 bg-cyan-400/5 shadow-[0_0_15px_rgba(34,211,238,0.2)]"
              : tab.id === "BATTLE"
                ? "px-8 py-2 rounded-xl border-2 border-slate-700 text-slate-500"
                : currentTab === tab.id
                  ? "text-cyan-400"
                  : "text-slate-500"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default BottomNav;
