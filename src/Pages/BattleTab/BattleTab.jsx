import React from "react";
import PilotHUD from "./PilotHUD";
import BattleActions from "./BattleActions";
import StrategicSupply from "./StrategicSupply";

const BattleTab = () => {
  return (
    <div className="flex flex-col w-full h-full overflow-hidden relative">
      {/* ============ BACKGROUND ============ */}
      {/* Base gradient - tactical gray/blue */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-slate-900 to-gray-950" />

      {/* Tactical hexagonal grid */}
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='57' viewBox='0 0 100 57' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M50 0L93.3 14.25V42.75L50 57L6.7 42.75V14.25L50 0Z' fill='none' stroke='%2366b2ff' stroke-width='0.5' stroke-opacity='0.3'/%3E%3C/svg%3E")`,
          backgroundSize: "120px 68px",
        }}
      />

      {/* Command center ambient lighting */}
      <div className="absolute top-0 left-0 w-1/3 h-full bg-gradient-to-r from-cyan-900/10 via-transparent to-transparent" />
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-900/10 via-transparent to-transparent" />

      {/* Subtle radar sweep */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute top-0 left-0 w-full h-full"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0%, rgba(59, 130, 246, 0.1) 5%, transparent 10%)",
            animation: "radar-sweep 20s linear infinite",
          }}
        />
      </div>

      {/* Strategic grid lines */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(to right, #3b82f6 1px, transparent 1px),
            linear-gradient(to bottom, #3b82f6 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />

      {/* ============ ORIGINAL CONTENT ============ */}
      <section className="flex-1 min-h-0 flex items-center justify-center overflow-hidden relative z-10">
        <PilotHUD />
      </section>

      <section className="shrink-0 px-2 pt-4 pb-2 z-20 relative">
        <BattleActions />
      </section>

      <section className="shrink-0 z-21 relative py-6">
        <StrategicSupply />
      </section>

      {/* Add these keyframes to your global CSS */}
      <style jsx>{`
        @keyframes radar-sweep {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};

export default BattleTab;
