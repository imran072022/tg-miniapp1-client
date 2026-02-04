import React from "react";
import { useGame } from "../../hooks/useGame";
import { CAMPAIGN_DATA } from "../../config/CampaignConfig";

const Battle = () => {
  const {
    gameMode,
    setGameMode,
    selectedLevel,
    setSelectedLevel,
    setIsFighting,
    // We assume your hook handles "unlocked" state logic
    isLevelUnlocked,
    isStageUnlocked,
  } = useGame();

  return (
    <div className="h-full flex flex-col relative overflow-hidden">
      {!gameMode ? (
        /* MODE SELECTION - The "Entry" buttons */
        <div className="h-full flex flex-col justify-center gap-6 p-6 animate-in fade-in zoom-in duration-300">
          <button
            onClick={() => setGameMode("STORY")}
            className="group bg-gradient-to-br from-cyan-600 to-blue-800 p-8 rounded-[32px] border-b-4 border-blue-950 shadow-2xl active:scale-95 transition-all"
          >
            <div className="flex justify-between items-center">
              <div className="text-left">
                <h3 className="text-3xl font-black italic uppercase">
                  Campaign
                </h3>
                <p className="text-cyan-200 text-xs font-bold opacity-60">
                  STAGES 1-3
                </p>
              </div>
              <span className="text-5xl">🚀</span>
            </div>
          </button>

          <button
            onClick={() => {
              setGameMode("ENDLESS");
              setIsFighting(true); // Endless starts immediately
            }}
            className="group bg-gradient-to-br from-purple-600 to-indigo-800 p-8 rounded-[32px] border-b-4 border-indigo-950 shadow-2xl active:scale-95 transition-all"
          >
            <div className="flex justify-between items-center">
              <div className="text-left">
                <h3 className="text-3xl font-black italic uppercase">
                  Endless
                </h3>
                <p className="text-purple-200 text-xs font-bold opacity-60">
                  SURVIVAL
                </p>
              </div>
              <span className="text-5xl">♾️</span>
            </div>
          </button>
        </div>
      ) : (
        /* STAGE MAP SCROLLER */
        <div className="h-full relative flex flex-col">
          <button
            onClick={() => {
              setGameMode(null);
              setSelectedLevel(null);
            }}
            className="absolute top-4 left-4 z-[100] bg-black/50 backdrop-blur-md px-4 py-2 rounded-xl text-[10px] font-black border border-white/10 uppercase"
          >
            ← Exit
          </button>

          <div className="flex-grow overflow-y-scroll snap-y snap-mandatory scroll-smooth">
            {CAMPAIGN_DATA.map((stage) => {
              // Logic check: Stage is unlocked if Level 1 of that stage is unlocked
              const stageUnlocked = isStageUnlocked(stage.id);

              return (
                <div
                  key={stage.id}
                  className="relative h-full w-full snap-start shrink-0 flex flex-col pt-20"
                >
                  {/* BACKGROUND LAYER */}
                  <div className="absolute inset-0 -z-10">
                    <img
                      src={stage.bg}
                      className={`w-full h-full object-cover opacity-80 ${!stageUnlocked ? "grayscale" : ""}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-transparent to-slate-950" />
                  </div>

                  {/* STAGE HEADER */}
                  <div className="text-center mb-8">
                    <h2
                      className={`${stage.color} font-black italic tracking-widest text-sm`}
                    >
                      {stage.name}
                    </h2>
                    <p className="text-white/20 text-[10px] font-bold uppercase">
                      Section 0{stage.id}
                    </p>
                  </div>

                  {/* DYNAMIC LEVEL GRID */}
                  <div className="grid grid-cols-3 gap-y-10 gap-x-6 px-10 pb-40">
                    {stage.levels.map((level) => {
                      const unlocked = isLevelUnlocked(level.id);
                      const isSelected = selectedLevel?.id === level.id;

                      return (
                        <div
                          key={level.id}
                          className={`flex flex-col items-center ${level.isBoss ? "col-span-3 mt-4" : ""}`}
                        >
                          <button
                            disabled={!unlocked}
                            onClick={() => setSelectedLevel(level)}
                            className={`w-16 h-16 rounded-[20px] border-b-4 flex items-center justify-center font-black transition-all relative
                            ${
                              unlocked
                                ? isSelected
                                  ? "bg-yellow-400 border-yellow-600 text-slate-900 scale-110 shadow-[0_0_20px_rgba(234,179,8,0.5)]"
                                  : "bg-slate-800 border-slate-950 text-white"
                                : "bg-black/40 border-slate-900 text-slate-700"
                            }`}
                          >
                            {level.isBoss ? "BOSS" : level.id}
                            {unlocked && !isSelected && (
                              <div className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-500 rounded-full animate-pulse" />
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* LOCK OVERLAY */}
                  {!stageUnlocked && (
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md z-40 flex flex-col items-center justify-center">
                      <span className="text-5xl mb-4">🔒</span>
                      <p className="font-black text-white/40 tracking-widest uppercase text-sm">
                        Sector Locked
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* LAUNCH PANEL (Passes level data to Game) */}
          {selectedLevel && (
            <div className="absolute bottom-6 left-6 right-6 bg-slate-900/95 backdrop-blur-xl border border-white/10 p-5 rounded-[32px] shadow-2xl z-50 animate-in slide-in-from-bottom-10">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-cyan-400 font-black text-[10px] uppercase">
                    Level {selectedLevel.id}
                  </p>
                  <h4 className="text-white font-black text-xl italic leading-none">
                    {selectedLevel.isBoss ? "FINAL CHALLENGE" : "MISSION READY"}
                  </h4>
                </div>
                <button
                  onClick={() => setIsFighting(true)} // This triggers PhaserGame.jsx
                  className="bg-cyan-500 text-white font-black py-4 px-10 rounded-2xl text-lg shadow-lg active:scale-95 transition-all"
                >
                  LAUNCH
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Battle;
