import React, { useState, useEffect, useRef } from "react";
import { useGame } from "../../../hooks/useGame";
import { Star } from "lucide-react";

const LevelNodes = ({ stage, nodeRefs }) => {
  const { isLevelUnlocked, setSelectedLevel, selectedLevel, levelProgress } =
    useGame();
  const containerRef = useRef(null);
  const [linePositions, setLinePositions] = useState({});

  // ✅ Read refs and update state in useEffect (allowed)
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver(() => {
      // rerun the same measurement logic
      const positions = {};
      const containerRect = containerRef.current.getBoundingClientRect();

      stage.levels.forEach((level, index) => {
        if (index === stage.levels.length - 1) return;

        const currentNode = nodeRefs.current[level.id];
        const nextNode = nodeRefs.current[stage.levels[index + 1].id];

        if (currentNode && nextNode) {
          const currentRect = currentNode.getBoundingClientRect();
          const nextRect = nextNode.getBoundingClientRect();

          positions[`${level.id}-${stage.levels[index + 1].id}`] = {
            currentX:
              currentRect.left + currentRect.width / 2 - containerRect.left,
            currentY:
              currentRect.top + currentRect.height / 2 - containerRect.top,
            nextX: nextRect.left + nextRect.width / 2 - containerRect.left,
            nextY: nextRect.top + nextRect.height / 2 - containerRect.top,
          };
        }
      });

      setLinePositions(positions);
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [stage.levels, nodeRefs]);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-2xl mx-auto"
      style={{ height: "85vh" }}
    >
      {/* SVG CONNECTION LINES - using linePositions from state */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {stage.levels.map((level, index) => {
          if (index === stage.levels.length - 1) return null;
          const nextLevel = stage.levels[index + 1];
          const posKey = `${level.id}-${nextLevel.id}`;
          const pos = linePositions[posKey];

          if (!pos) return null;

          const unlocked = isLevelUnlocked(level.id);
          const nextUnlocked = isLevelUnlocked(nextLevel.id);
          const isActive = unlocked && nextUnlocked;

          return (
            <g key={`line-group-${level.id}`}>
              <line
                x1={pos.currentX}
                y1={pos.currentY}
                x2={pos.nextX}
                y2={pos.nextY}
                stroke={isActive ? "#22d3ee" : "rgba(34,211,238,0.5)"}
                strokeWidth={isActive ? "3" : "2"}
                strokeLinecap="round"
                className="transition-all duration-700"
              />
              {isActive && (
                <circle r="4" fill="white" filter="url(#glow)">
                  <animateMotion
                    dur="3s"
                    repeatCount="indefinite"
                    path={`M${pos.currentX},${pos.currentY} L${pos.nextX},${pos.nextY}`}
                    rotate="auto"
                  />
                </circle>
              )}
            </g>
          );
        })}
      </svg>

      {/* Nodes */}
      {stage.levels.map((level) => {
        const unlocked = isLevelUnlocked(level.id);
        const isSelected = selectedLevel?.id === level.id;
        const stars = levelProgress.find((l) => l.id === level.id)?.stars || 0;
        const pos = level.pos || { x: 50, y: 50 };

        return (
          <div
            key={level.id}
            className="absolute"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <button
              ref={(el) => (nodeRefs.current[level.id] = el)}
              data-level-id={level.id}
              onClick={() => setSelectedLevel(isSelected ? null : level)}
              className="relative block outline-none group"
            >
              {/* ... (rest of your node button JSX remains exactly as you had it) ... */}
              {/* OUTER RING */}
              <div
                className={`
                  absolute inset-0 rounded-full transition-all
                  ${
                    unlocked
                      ? "ring-2 ring-white/80 shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                      : "ring-1 ring-white/40"
                  }
                  ${isSelected ? "ring-4 ring-white scale-110" : ""}
                `}
              />

              {/* INNER CORE */}
              <div
                className={`
                  relative m-1.5 rounded-full flex items-center justify-center font-black
                  transition-all
                  ${level.isBoss ? "w-12 h-12" : "w-11 h-11"}
                  ${!unlocked ? "bg-slate-700" : ""}
                `}
                style={{
                  background: unlocked
                    ? isSelected
                      ? "radial-gradient(circle at 30% 30%, #22d3ee, #0284c7)"
                      : stars > 0
                        ? "radial-gradient(circle at 30% 30%, #fb923c, #c2410c)"
                        : level.isBoss
                          ? "radial-gradient(circle at 30% 30%, #f87171, #991b1b)"
                          : "radial-gradient(circle at 30% 30%, #38bdf8, #1e3a8a)"
                    : "radial-gradient(circle at 10% 10%, rgba(255,255,255,0.2), rgba(255,255,255,0.3))",
                  boxShadow:
                    unlocked && isSelected
                      ? "0 0 20px #22d3ee"
                      : "0 4px 6px rgba(0,0,0,0.3)",
                }}
              >
                <span
                  className={`text-sm font-black drop-shadow-lg ${!unlocked ? "text-white/60" : "text-white"}`}
                >
                  {level.isBoss ? "☠" : level.id}
                </span>
              </div>

              {/* Stars */}
              {stars > 0 && unlocked && (
                <div className="absolute -top-9 left-1/2 transform -translate-x-1/2 flex gap-0">
                  {[1, 2, 3].map((s, index) => (
                    <Star
                      key={s}
                      className={`
                        drop-shadow-lg filter brightness-110
                        ${s <= stars ? "fill-amber-300" : "fill-gray-600"}
                        ${index === 1 ? "scale-110" : ""}
                      `}
                      stroke="none"
                      size={index === 1 ? 34 : 28}
                    />
                  ))}
                </div>
              )}

              {/* New node pulse */}
              {unlocked && stars === 0 && !isSelected && !level.isBoss && (
                <div className="absolute -top-1 -right-1">
                  <div className="w-3 h-3 bg-cyan-400 rounded-full animate-ping opacity-75" />
                  <div className="w-3 h-3 bg-cyan-400 rounded-full absolute inset-0 ring-1 ring-white" />
                </div>
              )}
            </button>

            {/* Level number */}
            {!level.isBoss && (
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-[10px] text-white/60 whitespace-nowrap font-mono">
                LVL {level.id}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default LevelNodes;
