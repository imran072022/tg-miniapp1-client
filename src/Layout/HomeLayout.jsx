import React from "react";
import TopNav from "../Components/TopNav";
import BottomNav from "../Components/BottomNav";

const HomeLayout = ({ children }) => {
  return (
    <div className="fixed inset-0 bg-slate-950 font-orbitron text-white overflow-hidden flex flex-col">
      {/* Background Layer: Low opacity grid/stars */}
      <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-900/20 via-transparent to-transparent" />
        {/* You can add a CSS grid pattern here later */}
      </div>

      {/* 1. TOP NAVIGATION (Currencies & Settings) */}
      <header className="relative z-50">
        <TopNav />
      </header>

      {/* 2. MAIN CONTENT (The active tab: Battle, Cards, etc.) */}
      <main className="relative z-10 flex-grow overflow-y-auto">
        {children}
      </main>

      {/* 3. BOTTOM NAVIGATION (Tab Switcher) */}
      <footer className="relative z-50">
        <BottomNav />
      </footer>
    </div>
  );
};

export default HomeLayout;
