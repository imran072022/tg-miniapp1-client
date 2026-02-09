import React from "react";
import TopNav from "../Components/TopNav";
import BottomNav from "../Components/BottomNav";

const HomeLayout = ({ children }) => {
  return (
    <div
      className="fixed inset-0 bg-slate-950 font-orbitron text-white overflow-hidden flex flex-col"
      style={{ height: "100dvh" }} // ✅ dynamic mobile viewport
    >
      {/* Background */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />
      </div>

      {/* TOP NAV */}
      <header
        className="relative z-50"
        style={{
          paddingTop: "env(safe-area-inset-top)", // ✅ iOS safe area
        }}
      >
        <TopNav />
      </header>

      {/* MAIN CONTENT — THIS IS THE FIX */}
      <main className="relative z-10 flex-1 min-h-0 overflow-hidden">
        {children}
      </main>

      {/* BOTTOM NAV */}
      <footer
        className="relative z-50"
        style={{
          paddingBottom: "env(safe-area-inset-bottom)", // ✅ iOS bottom safe
        }}
      >
        <BottomNav />
      </footer>
    </div>
  );
};

export default HomeLayout;
