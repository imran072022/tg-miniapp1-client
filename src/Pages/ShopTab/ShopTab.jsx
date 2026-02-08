import React, { useState } from "react";
import Treasury from "./SubTabs/Treasury";
import HangarStore from "./SubTabs/HangarStore";
import DailyDeals from "./SubTabs/DailyDeals";

const ShopTab = () => {
  const [activeTab, setActiveTab] = useState("TREASURY");

  const renderContent = () => {
    switch (activeTab) {
      case "TREASURY":
        return <Treasury />;
      case "HANGAR":
        return <HangarStore />;
      case "DAILY":
        return <DailyDeals />;
      default:
        return <Treasury />;
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#0f172a]">
      {/* 1. Sub-tab Navigation (Smaller, tech-style buttons) */}
      <div className="flex justify-center gap-2 p-4 border-b border-white/5 bg-black/20">
        {["DAILY", "TREASURY", "HANGAR"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 text-[10px] font-black tracking-widest transition-all rounded-md ${
              activeTab === tab
                ? "bg-cyan-500 text-black shadow-[0_0_10px_#06b6d4]"
                : "text-white/40 hover:text-white/80 border border-white/10"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* 2. Content Area */}
      <div className="flex-grow overflow-hidden">{renderContent()}</div>
    </div>
  );
};

export default ShopTab;
