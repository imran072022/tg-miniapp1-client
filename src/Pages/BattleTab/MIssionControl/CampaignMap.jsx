import React, { useCallback, useEffect, useRef, useState } from "react";
import { useGame } from "../../../hooks/useGame";
import { CAMPAIGN_DATA } from "../../../config/CampaignConfig";
import { AnimatePresence, motion } from "framer-motion";
import LevelNodes from "./LevelNodes";

const CampaignMap = ({ onBack }) => {
  const {
    selectedLevel,
    setSelectedLevel,
    setIsFighting,
    isLevelUnlocked,
    isStageUnlocked,
    setGameMode,
  } = useGame();

  const dropdownRef = useRef(null);
  const nodeRefs = useRef({}); // ← Store all node refs here
  const scrollRef = useRef(null);
  const [dropdownPosition, setDropdownPosition] = useState(false);
  const [ready, setReady] = useState(false);
  const [dropdownReady, setDropdownReady] = useState(false);

  const updateDropdownPosition = useCallback(() => {
    if (!selectedLevel) return;

    const node = nodeRefs.current[selectedLevel.id];
    if (!node) return;

    const rect = node.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;
    const bottomY = rect.bottom;

    // Position dropdown
    setDropdownPosition({
      left: centerX,
      top: bottomY + 10,
    });

    // 🔥 THIS is what your deleted effect used to do
    setDropdownReady(true);
  }, [selectedLevel, nodeRefs]);
  useEffect(() => {
    if (!selectedLevel) return;

    setDropdownReady(false);

    // run measurement on next frame (ensures DOM is ready)
    requestAnimationFrame(() => {
      updateDropdownPosition();
    });
  }, [selectedLevel, updateDropdownPosition]);
  useEffect(() => {
    if (!selectedLevel) return;

    const scrollEl = scrollRef.current;

    if (!scrollEl) return;

    scrollEl.addEventListener("scroll", updateDropdownPosition);
    window.addEventListener("resize", updateDropdownPosition);

    // run once immediately
    updateDropdownPosition();

    return () => {
      scrollEl.removeEventListener("scroll", updateDropdownPosition);
      window.removeEventListener("resize", updateDropdownPosition);
    };
  }, [selectedLevel, updateDropdownPosition]);
  useEffect(() => {
    let loaded = 0;
    const total = CAMPAIGN_DATA.length;

    CAMPAIGN_DATA.forEach((stage) => {
      const img = new Image();
      img.onload = () => {
        loaded++;
        if (loaded === total) setReady(true);
      };
      img.src = stage.bg;
    });
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!selectedLevel) return;
      const isNode = e.target.closest("[data-level-id]");
      const isDropdown = dropdownRef.current?.contains(e.target);
      if (!isNode && !isDropdown) {
        setSelectedLevel(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [selectedLevel, setSelectedLevel]);

  // Clear on mount
  useEffect(() => {
    setSelectedLevel(null);
  }, [setSelectedLevel]);

  if (!ready) return <div className="fixed inset-0 bg-black" />;

  return (
    <div className="fixed inset-0 text-white font-orbitron z-[100] flex flex-col overflow-hidden orbitron">
      {/* STAGE SCROLLER */}
      <div
        className="flex-grow overflow-y-scroll snap-y snap-mandatory"
        ref={scrollRef}
      >
        {CAMPAIGN_DATA.map((stage) => (
          <div
            key={stage.id}
            className="relative h-full w-full snap-start flex flex-col items-center justify-center"
          >
            {/* BACKGROUND */}
            <div className="absolute inset-0 -z-10">
              <img
                src={stage.bg}
                alt=""
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/30" />
            </div>

            {/* HEADER */}
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between p-6 z-10">
              {/* BACK BUTTON */}
              <button
                onClick={onBack}
                className="group flex items-center gap-3 bg-black/30 backdrop-blur-md px-5 py-2.5 rounded-2xl border border-white/10 hover:border-white/30 transition-all hover:scale-105 active:scale-95"
              >
                <div className="relative w-5 h-5">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 border-t-2 border-l-2 border-white rotate-[-45deg] group-hover:-translate-x-0.5 transition-transform" />
                  </div>
                </div>
                <span className="text-xs font-black tracking-widest">EXIT</span>
                <div className="absolute inset-0 rounded-2xl bg-white/0 group-hover:bg-white/5 transition-all" />
              </button>

              {/* STAGE BADGE */}
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-[1px] bg-cyan-500/50" />
                  <span className="text-[10px] font-black text-cyan-400/70 tracking-[0.3em]">
                    SECTOR 0{stage.id}
                  </span>
                </div>
                <h2
                  className={`text-3xl font-black italic tracking-tight relative ${stage.color}`}
                >
                  {stage.name}
                  <div className="absolute -bottom-1 left-0 right-0 h-[2px]">
                    <div className="w-full h-full bg-gradient-to-r from-transparent via-current to-transparent opacity-50" />
                  </div>
                </h2>
                <div className="flex items-center gap-1 mt-1">
                  <div className="w-1 h-1 rounded-full bg-cyan-500/50" />
                  <span className="text-[8px] text-white/40">
                    {stage.levels.length} MISSIONS
                  </span>
                </div>
              </div>
            </div>

            {/* LEVEL NODES - Pass nodeRefs */}
            <LevelNodes stage={stage} nodeRefs={nodeRefs} />

            {/* LOCKED STAGE */}
            {!isStageUnlocked(stage.id) && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-4xl opacity-50">🔒</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* DROPDOWN */}
      {selectedLevel && dropdownReady && (
        <div
          ref={dropdownRef}
          className="fixed z-50 animate-in fade-in zoom-in-95 duration-150"
          style={{
            left: dropdownPosition.left,
            top: dropdownPosition.top,
            transform: "translateX(-50%)",
          }}
        >
          <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-4 w-48">
            <div className="text-center mb-3">
              <div className="text-cyan-400 font-black text-xs">
                MISSION {selectedLevel.id}
              </div>
              <div className="text-white text-sm">
                {selectedLevel.difficulty || "NORMAL"}
              </div>
            </div>
            <button
              disabled={!isLevelUnlocked(selectedLevel.id)}
              onClick={() => {
                if (!isLevelUnlocked(selectedLevel.id)) return;
                setGameMode("STORY");
                setIsFighting(true);
              }}
              className={`w-full py-2 rounded-xl text-sm font-black
                ${
                  isLevelUnlocked(selectedLevel.id)
                    ? "bg-cyan-500 text-slate-900 hover:bg-cyan-400"
                    : "bg-slate-700 text-slate-400 cursor-not-allowed"
                }`}
            >
              {isLevelUnlocked(selectedLevel.id) ? "LAUNCH" : "LOCKED"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampaignMap;
