import React from "react";
import Layout from "./Layout/Layout";
import TopNav from "./Components/TopNav";
import PhaserGame from "./game/Phasergame";
import BottomNav from "./Components/BottomNav";
import PauseOverlay from "./Components/PauseOverlay";
import ResultOverlay from "./Components/ResultOverlay";
import { useGame } from "./hooks/useGame";
import Battle from "./Pages/Battle/Battle";
import Shop from "./Pages/Shop/Shop";
import Cards from "./Pages/Cards/Cards";

function App() {
  const {
    currentTab,
    isFighting,
    showPauseMenu,
    setShowPauseMenu,
    showResult,
  } = useGame();

  return (
    <Layout>
      <div className="flex flex-col h-screen w-full bg-slate-950 text-white overflow-hidden">
        <TopNav />

        {/* This container will hold everything between Top and Bottom nav */}
        <main className="flex-grow relative overflow-hidden">
          {/* PHASER LAYER (Stays Absolute) */}
          {isFighting && (
            <div className="absolute inset-0 z-[60] bg-black">
              <PhaserGame />
              <button
                onClick={() => setShowPauseMenu(true)}
                className="absolute top-4 right-4 bg-white/10 p-3 rounded-2xl backdrop-blur-md z-[70] active:scale-90 transition-transform"
              >
                <div className="w-5 h-5 flex justify-between">
                  <div className="w-1.5 h-full bg-white rounded-full"></div>
                  <div className="w-1.5 h-full bg-white rounded-full"></div>
                </div>
              </button>
            </div>
          )}

          {/* PAGE CONTENT (This part scrolls internally) */}
          <div className="h-full w-full overflow-hidden">
            {currentTab === "BATTLE" && <Battle />}
            {currentTab === "CARDS" && <Cards />}
            {currentTab === "SHOP" && <Shop />}
          </div>
        </main>

        {/* BOTTOM NAV (Outside main, so it's always visible at the very bottom) */}
        {!isFighting && <BottomNav />}

        {/* OVERLAYS */}
        {showPauseMenu && <PauseOverlay />}
        {showResult && <ResultOverlay />}
      </div>
    </Layout>
  );
}

export default App;
