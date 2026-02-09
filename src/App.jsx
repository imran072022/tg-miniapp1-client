import React from "react";
import Layout from "./Layout/Layout";
import TopNav from "./Components/TopNav";
import PhaserGame from "./game/Phasergame";
import BottomNav from "./Components/BottomNav";
import PauseOverlay from "./Components/PauseOverlay";
import { useGame } from "./hooks/useGame";
import VictoryOverlay from "./Components/VictoryOverlay";
import DefeatOverlay from "./Components/DefeatOverlay";
import HomeLayout from "./Layout/HomeLayout";

import CardsTab from "./Pages/CardsTab/CardsTab";
import BattleTab from "./Pages/BattleTab/BattleTab";
import ShopTab from "./Pages/ShopTab/ShopTab";

function App() {
  const { isFighting, currentTab } = useGame();

  // If in battle, only show Phaser
  if (isFighting) {
    return (
      <>
        <PhaserGame />
        {/* Overlay logic (Result screens, Pause, etc.) */}
      </>
    );
  }

  // If at home, wrap everything in HomeLayout
  return (
    <HomeLayout>
      {currentTab === "BATTLE" && <BattleTab></BattleTab>}
      {currentTab === "CARDS" && <CardsTab></CardsTab>}
      {currentTab === "SHOP" && <ShopTab></ShopTab>}
    </HomeLayout>
  );
}

export default App;
