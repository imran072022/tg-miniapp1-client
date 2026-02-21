import React, { useState } from "react";
import Layout from "./Layout/Layout";
import TopNav from "./Components/TopNav";
import PhaserGame from "./game/Phasergame";
import BottomNav from "./Components/BottomNav";
import PauseOverlay from "./Components/PauseOverlay";
import { useGame } from "./hooks/useGame";

import VictoryOverlay from "./Components/VictoryOverlay";
import DefeatOverlay from "./Components/DefeatOverlay";
import HomeLayout from "./Layout/HomeLayout";
import { Pause } from "lucide-react";
import BattleTab from "./Pages/BattleTab/BattleTab";
import CampaignMap from "./Pages/BattleTab/MIssionControl/CampaignMap";
import ShopTab from "./Pages/ShopTab/ShopTab";
import CardsTab from "./Pages/CardsTab/CardsTab";

function App() {
  const {
    isFighting,
    currentTab,
    showResult,
    isVictory,
    showPauseMenu,
    setShowPauseMenu,
  } = useGame();
  const [inMap, setInMap] = useState(false);

  // 1. Battle Scene (Phaser) takes absolute priority
  if (isFighting) {
    return (
      <>
        <PhaserGame />
        {/* Overlay logic (Result screens, Pause, etc.) */}
        {showResult && (isVictory ? <VictoryOverlay /> : <DefeatOverlay />)}
        {showPauseMenu && <PauseOverlay />}
        {/* Floating Pause Button (hidden if overlay is open) */}
        {!showResult && !showPauseMenu && (
          <button
            onClick={() => setShowPauseMenu(true)}
            className="fixed top-6 right-6 z-[200] bg-cyan-500/90 hover:bg-cyan-400 text-slate-900 rounded-full shadow-lg p-4 flex items-center justify-center border-2 border-cyan-300/60 transition-all active:scale-95"
            aria-label="Pause"
          >
            <Pause size={28} className="drop-shadow-lg" />
          </button>
        )}
      </>
    );
  }

  // 2. Campaign Map Overlay
  // We show this if we are on the BATTLE tab AND the user clicked Campaign
  if (currentTab === "BATTLE" && inMap) {
    return <CampaignMap onBack={() => setInMap(false)} />;
  }

  // 3. Standard Dashboard UI
  return (
    <HomeLayout>
      {currentTab === "BATTLE" && (
        <BattleTab onOpenCampaign={() => setInMap(true)} />
      )}
      {currentTab === "CARDS" && <CardsTab />}
      {currentTab === "SHOP" && <ShopTab />}
    </HomeLayout>
  );
}

export default App;
