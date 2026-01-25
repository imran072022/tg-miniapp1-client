import React, { useState, useCallback } from "react";
import Layout from "../src/Layout/Layout";
import PhaserGame from "./game/PhaserGame";

function App() {
  const [currentTab, setCurrentTab] = useState("BATTLE");
  const [isFighting, setIsFighting] = useState(false);
  const [inventory] = useState({ fireRateCard: 1, damageCard: 1 });
  const [equippedCard, setEquippedCard] = useState("STARTER");
  const [selectedCardInfo, setSelectedCardInfo] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [gameMode, setGameMode] = useState(null);
  const [showPauseMenu, setShowPauseMenu] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [lastScore, setLastScore] = useState(0);
  const handleGameOver = useCallback((score = 0) => {
    setLastScore(score);
    setShowResult(true); // Show the result screen instead of just closing
  }, []);

  const closeResult = () => {
    setShowResult(false);
    setIsFighting(false);
    setGameMode(null);
    setSelectedLevel(null);
  };
  const cards = [
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

  const [levelData, setLevelData] = useState([
    { id: 1, stage: 1, unlocked: true, stars: 0, difficulty: 1 },
    { id: 2, stage: 1, unlocked: false, stars: 0, difficulty: 1.5 },
    { id: 3, stage: 1, unlocked: false, stars: 0, difficulty: 2 },
    { id: 4, stage: 1, unlocked: false, stars: 0, difficulty: 2.5 },
    { id: 5, stage: 1, unlocked: false, stars: 0, difficulty: 3 },
    { id: 6, stage: 1, unlocked: false, stars: 0, difficulty: 3.5 },
    { id: 7, stage: 1, unlocked: false, stars: 0, difficulty: 4 },
    { id: 8, stage: 1, unlocked: false, stars: 0, difficulty: 4.5 },
    { id: 9, stage: 1, unlocked: false, stars: 0, difficulty: 5 },
    { id: 10, stage: 1, unlocked: false, stars: 0, difficulty: 6 },
  ]);

  return (
    <Layout>
      <div className="flex flex-col h-screen w-full bg-slate-900 text-white overflow-hidden">
        {/* Fixed Top Navbar */}
        <nav className="shrink-0 p-4 bg-slate-800 flex justify-between items-center shadow-lg border-b border-slate-700 z-50">
          <h1 className="font-black tracking-tighter text-xl italic">
            VOID <span className="text-cyan-400">STRIKER</span>
          </h1>
          <div className="bg-slate-900 px-3 py-1 rounded font-mono text-yellow-500 border border-yellow-500/30">
            💰 500
          </div>
        </nav>

        {/* Main Content Area - This fills the space between navs */}
        <main className="flex-grow relative overflow-hidden flex flex-col">
          {/* Phaser Game Overlay */}
          {isFighting && (
            <div className="absolute inset-0 z-[60] bg-black">
              <PhaserGame
                onEnd={handleGameOver}
                stats={inventory}
                equippedCard={equippedCard}
                isFighting={isFighting}
                selectedLevel={selectedLevel}
                isPaused={showPauseMenu}
              />

              {/* Minimalist Pause Button */}
              <button
                onClick={() => setShowPauseMenu(true)}
                className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-3 rounded-2xl backdrop-blur-md z-[70] transition-colors"
              >
                <div className="w-5 h-5 flex justify-between">
                  <div className="w-1.5 h-full bg-white rounded-full"></div>
                  <div className="w-1.5 h-full bg-white rounded-full"></div>
                </div>
              </button>

              {/* Pause/Quit Confirmation Modal */}
              {showPauseMenu && (
                <div className="absolute inset-0 z-[80] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-6">
                  <div className="bg-slate-800 border-2 border-slate-700 p-8 rounded-[40px] w-full max-w-xs text-center shadow-2xl animate-in zoom-in duration-200">
                    <h2 className="text-3xl font-black text-white italic mb-8 uppercase tracking-tighter">
                      Mission Paused
                    </h2>
                    <div className="space-y-4">
                      <button
                        onClick={() => setShowPauseMenu(false)}
                        className="w-full bg-cyan-500 text-white font-black py-4 rounded-2xl text-lg shadow-lg active:scale-95"
                      >
                        RESUME
                      </button>
                      <button
                        onClick={() => {
                          setShowPauseMenu(false);
                          handleGameOver();
                        }}
                        className="w-full bg-slate-700 text-slate-400 font-black py-4 rounded-2xl text-lg hover:bg-red-600 hover:text-white transition-all active:scale-95"
                      >
                        ABANDON MISSION
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {/* GAME OVER / RESULT OVERLAY */}
              {showResult && (
                <div className="absolute inset-0 z-[100] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-6 text-center">
                  <div className="animate-in zoom-in duration-300">
                    <h2 className="text-5xl font-black text-red-500 italic mb-2">
                      MISSION ENDED
                    </h2>
                    <p className="text-cyan-400 font-mono text-xl mb-8">
                      GOLD EARNED: +{lastScore}
                    </p>

                    <div className="space-y-4 w-64 mx-auto">
                      <button
                        onClick={() => {
                          setShowResult(
                            false,
                          ); /* Logic to restart current level */
                        }}
                        className="w-full bg-white text-black font-black py-4 rounded-2xl text-lg active:scale-95 transition-all"
                      >
                        RETRY
                      </button>
                      <button
                        onClick={closeResult}
                        className="w-full bg-slate-800 text-white font-black py-4 rounded-2xl text-lg border border-slate-700 active:scale-95 transition-all"
                      >
                        BACK TO MENU
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* BACKGROUND IMAGE - Only on main UI */}
          {!isFighting && (
            <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
              <img
                src="/assets/bg.jpg"
                alt="bg"
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* SCROLLABLE TAB CONTENT */}
          <div className="flex-grow relative z-10 overflow-hidden h-full">
            {currentTab === "CARDS" && (
              <div className="h-full p-4 overflow-y-auto pb-10">
                <div className="grid grid-cols-2 gap-3">
                  {cards.map((card) => (
                    <div
                      key={card.id}
                      className={`flex flex-col bg-slate-800 rounded-xl border-2 transition-all ${card.id === equippedCard ? card.border : "border-slate-700"}`}
                    >
                      <div
                        onClick={() => setEquippedCard(card.id)}
                        className="w-full aspect-square bg-slate-700 rounded-t-lg flex items-center justify-center cursor-pointer"
                      >
                        <span
                          className={`text-4xl ${card.id === equippedCard ? "opacity-100" : "opacity-40"}`}
                        >
                          🚀
                        </span>
                      </div>
                      <div className="p-2">
                        <h3 className="text-sm font-bold text-white truncate">
                          {card.name}
                        </h3>
                        <p
                          className={`text-[9px] uppercase font-black ${card.color}`}
                        >
                          {card.rarity}
                        </p>
                        <div className="mt-2 flex gap-1">
                          <button
                            onClick={() => setSelectedCardInfo(card)}
                            className="flex-1 bg-slate-700 text-[10px] py-1 rounded font-bold text-white"
                          >
                            INFO
                          </button>
                          <button className="flex-1 bg-cyan-600 text-[10px] py-1 rounded font-bold text-white">
                            UPGRADE
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentTab === "BATTLE" && (
              <div className="h-full flex flex-col relative overflow-hidden bg-slate-900/50">
                {/* MODE SELECTION VIEW */}
                {!gameMode && (
                  <div className="h-full flex flex-col justify-center gap-6 p-6 animate-in fade-in zoom-in duration-300">
                    <button
                      onClick={() => setGameMode("STORY")}
                      className="group relative overflow-hidden bg-gradient-to-br from-cyan-600 to-blue-800 p-8 rounded-3xl border-b-4 border-blue-900 shadow-2xl active:scale-95 transition-all"
                    >
                      <div className="flex justify-between items-center relative z-10">
                        <div className="text-left">
                          <h3 className="text-3xl font-black italic tracking-tighter text-white uppercase">
                            Campaign
                          </h3>
                          <p className="text-cyan-200 text-xs font-bold opacity-80 uppercase tracking-widest">
                            Levels 1-10
                          </p>
                        </div>
                        <span className="text-5xl group-hover:scale-110 transition-transform">
                          🚀
                        </span>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setGameMode("ENDLESS");
                        setIsFighting(true);
                      }}
                      className="group relative overflow-hidden bg-gradient-to-br from-purple-600 to-indigo-800 p-8 rounded-3xl border-b-4 border-indigo-900 shadow-2xl active:scale-95 transition-all"
                    >
                      <div className="flex justify-between items-center relative z-10">
                        <div className="text-left">
                          <h3 className="text-3xl font-black italic tracking-tighter text-white uppercase">
                            Endless
                          </h3>
                          <p className="text-purple-200 text-xs font-bold opacity-80 uppercase tracking-widest">
                            Survival Mode
                          </p>
                        </div>
                        <span className="text-5xl group-hover:scale-110 transition-transform">
                          ♾️
                        </span>
                      </div>
                    </button>
                  </div>
                )}

                {/* STORY MAP VIEW (Compact Grid) */}
                {gameMode === "STORY" && (
                  <div className="h-full flex flex-col relative animate-in slide-in-from-right duration-300">
                    <button
                      onClick={() => {
                        setGameMode(null);
                        setSelectedLevel(null);
                      }}
                      className="absolute top-4 left-4 z-40 bg-slate-800 p-2 px-4 rounded-xl border border-slate-700 text-white text-[10px] font-black uppercase"
                    >
                      ← EXIT
                    </button>

                    <div className="shrink-0 pt-16 pb-4 text-center">
                      <h2 className="text-cyan-400 font-black italic tracking-[0.3em] uppercase text-xs">
                        Nebula Core: Stage 1
                      </h2>
                    </div>

                    {/* COMPACT GRID MAP */}
                    <div className="flex-grow overflow-y-auto p-6 pb-40">
                      <div className="grid grid-cols-3 gap-y-12 gap-x-4 max-w-xs mx-auto pt-4">
                        {levelData.map((level) => {
                          const isSelected = selectedLevel?.id === level.id;
                          // Specific layout positioning
                          const isBoss = level.id === 10;

                          return (
                            <div
                              key={level.id}
                              className={`flex flex-col items-center ${isBoss ? "col-span-3 mt-4" : ""}`}
                            >
                              <button
                                disabled={!level.unlocked}
                                onClick={() => setSelectedLevel(level)}
                                className={`w-16 h-16 rounded-2xl border-b-4 flex items-center justify-center font-black transition-all relative
                      ${
                        level.unlocked
                          ? isSelected
                            ? "bg-yellow-400 border-yellow-600 text-slate-900 scale-110 z-10 shadow-[0_0_20px_rgba(234,179,8,0.5)]"
                            : "bg-slate-700 border-slate-900 text-white hover:bg-slate-600"
                          : "bg-slate-800/50 border-slate-900 text-slate-600 opacity-40"
                      }`}
                              >
                                {isBoss ? "BOSS" : level.id}
                                {level.unlocked && !isSelected && (
                                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-500 rounded-full animate-pulse"></div>
                                )}
                              </button>

                              <div className="flex gap-0.5 mt-2">
                                {[1, 2, 3].map((s) => (
                                  <span
                                    key={s}
                                    className={`text-[10px] ${level.stars >= s ? "text-yellow-400" : "text-slate-700"}`}
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Launch Panel */}
                    {selectedLevel && (
                      <div className="absolute bottom-4 left-4 right-4 bg-slate-800 border-2 border-cyan-500/50 p-5 rounded-3xl shadow-2xl z-30 animate-in fade-in slide-in-from-bottom-5">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-cyan-400 font-black text-xs italic uppercase tracking-widest">
                              Selected Mission
                            </p>
                            <h4 className="text-white font-black text-2xl uppercase italic">
                              Level {selectedLevel.id}
                            </h4>
                          </div>
                          <button
                            onClick={() => setIsFighting(true)}
                            className="bg-cyan-500 hover:bg-cyan-400 text-white font-black py-3 px-10 rounded-2xl text-xl shadow-lg active:scale-95 transition-all"
                          >
                            PLAY
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {currentTab === "SHOP" && (
              <div className="h-full flex flex-col items-center justify-center text-white bg-black/20">
                <h2 className="text-4xl font-black italic opacity-20">
                  SUPPLY CRATES
                </h2>
                <p className="text-xs tracking-[0.3em] uppercase opacity-40">
                  Coming Soon
                </p>
              </div>
            )}
          </div>

          {/* Fixed Bottom Navigation */}
          {!isFighting && (
            <div className="shrink-0 bg-slate-800/95 border-t border-slate-700 p-4 pb-8 flex justify-around items-center z-50">
              <button
                onClick={() => setCurrentTab("CARDS")}
                className={`font-black text-xs tracking-widest ${currentTab === "CARDS" ? "text-cyan-400" : "text-slate-400"}`}
              >
                CARDS
              </button>
              <button
                onClick={() => setCurrentTab("BATTLE")}
                className={`font-black text-xs tracking-widest px-8 py-2 rounded-xl border-2 ${currentTab === "BATTLE" ? "border-cyan-400 text-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.2)]" : "border-slate-600 text-slate-400"}`}
              >
                BATTLE
              </button>
              <button
                onClick={() => setCurrentTab("SHOP")}
                className={`font-black text-xs tracking-widest ${currentTab === "SHOP" ? "text-cyan-400" : "text-slate-400"}`}
              >
                SHOP
              </button>
            </div>
          )}
        </main>

        {/* Info Modal */}
        {selectedCardInfo && (
          <div className="absolute inset-0 z-[150] bg-black/90 p-8 flex items-center justify-center">
            <div className="bg-slate-800 border-2 border-slate-600 p-6 rounded-3xl w-full max-w-xs text-center shadow-2xl">
              <div className="w-20 h-20 bg-slate-700 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl">
                🚀
              </div>
              <h2 className="text-2xl font-black text-white">
                {selectedCardInfo.name}
              </h2>
              <p
                className={`${selectedCardInfo.color} text-xs font-bold mb-4 uppercase`}
              >
                {selectedCardInfo.rarity}
              </p>
              <div className="text-left text-slate-300 text-sm space-y-2 mb-6 bg-slate-900/50 p-4 rounded-xl">
                <p>🛡️ ARMOR: 100%</p>
                <p>
                  ⚔️ DPS:{" "}
                  {selectedCardInfo.id === "PLASMA"
                    ? "145"
                    : selectedCardInfo.id === "TITAN"
                      ? "400"
                      : "50"}
                </p>
                <p className="italic text-slate-500 text-xs pt-2">
                  Specialized deep-space interception craft.
                </p>
              </div>
              <button
                onClick={() => setSelectedCardInfo(null)}
                className="w-full bg-slate-700 text-white font-bold py-3 rounded-xl hover:bg-slate-600 transition-colors"
              >
                BACK
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default App;
