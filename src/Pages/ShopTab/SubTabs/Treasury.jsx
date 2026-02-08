import React from "react";
import { useGame } from "../../../hooks/useGame";
import { motion } from "framer-motion";
import { Gem, Zap, TrendingUp, Crown } from "lucide-react";
const Treasury = () => {
  const { setDiamonds } = useGame();

  const GEM_PACKS = [
    {
      id: "handOfGems",
      name: "GEM HANDFUL",
      amount: 80,
      price: "$0.99",
      img: "handOfGems.png",
      color: "from-cyan-500/10",
      badge: null,
    },
    {
      id: "bagOfGems",
      name: "SURPLUS BAG",
      amount: 500,
      price: "$4.99",
      img: "bagOfGems.png",
      color: "from-cyan-500/20",
      badge: "POPULAR",
    },
    {
      id: "crateOfGems",
      name: "SUPPLY CRATE",
      amount: 1200,
      price: "$9.99",
      img: "crateOfGems.png",
      color: "from-purple-500/20",
      badge: "+15% BONUS",
    },
    {
      id: "vaultOfGems",
      name: "SECURITY VAULT",
      amount: 2500,
      price: "$19.99",
      img: "vaultOfGems.png",
      color: "from-purple-600/30",
      badge: "BEST VALUE",
    },
    {
      id: "hoardsOfGems",
      name: "GALACTIC HOARD",
      amount: 6500,
      price: "$49.99",
      img: "hoardsOfGems.png",
      color: "from-fuchsia-600/40",
      badge: "ULTIMATE",
    },
  ];

  const handlePurchase = (pack) => {
    // Placeholder for purchase logic
    console.log(`Processing ${pack.name}...`);
    setDiamonds((prev) => prev + pack.amount);
    alert(`Authorized: ${pack.amount} Diamonds synced to your account.`);
  };
  return (
    <div className="h-full w-full bg-[#0f172a] overflow-y-auto pb-32 pt-6 scrollbar-hide">
      {/* HEADER SECTION */}
      <div className="px-6 mb-8 text-left">
        <h2 className="text-4xl font-black italic text-white leading-none uppercase tracking-tighter">
          Procurement <br />
          <span className="text-cyan-400">Terminal</span>
        </h2>
        <p className="text-[10px] text-white/30 font-bold uppercase tracking-[0.3em] mt-2">
          Secure Diamond Exchange
        </p>
      </div>

      {/* GEM PACKS LIST */}
      <div className="px-6 space-y-4">
        {GEM_PACKS.map((pack) => (
          <motion.div
            key={pack.id}
            whileTap={{ scale: 0.98 }}
            className="relative group cursor-pointer"
            onClick={() => handlePurchase(pack)}
          >
            {/* Card Body */}
            <div
              className={`relative flex items-center justify-between p-4 rounded-3xl border border-white/5 bg-gradient-to-r ${pack.color} to-transparent backdrop-blur-md overflow-hidden transition-all group-hover:border-cyan-500/30`}
            >
              {/* Pack Image */}
              <div className="relative w-24 h-24 z-10">
                <img
                  src={`/assets/recourses/${pack.img}`}
                  alt={pack.name}
                  className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(34,211,238,0.4)] group-hover:scale-110 transition-transform duration-500"
                />
              </div>

              {/* Pack Info */}
              <div className="flex-grow px-4 z-10">
                {pack.badge && (
                  <span className="text-[8px] font-black bg-cyan-500 text-black px-2 py-0.5 rounded-full tracking-widest uppercase mb-1 inline-block shadow-[0_0_10px_#06b6d4]">
                    {pack.badge}
                  </span>
                )}
                <h3 className="text-sm font-black text-white italic tracking-tight">
                  {pack.name}
                </h3>
                <div className="flex items-center gap-1.5 mt-1">
                  <Gem size={14} className="text-fuchsia-400" />
                  <span className="text-xl font-black text-white tabular-nums">
                    {pack.amount.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Price Button (Simulated) */}
              <div className="z-10 bg-white/10 px-4 py-2 rounded-2xl border border-white/10 group-hover:bg-cyan-500 group-hover:text-black transition-colors">
                <span className="text-xs font-black tracking-tighter">
                  {pack.price}
                </span>
              </div>

              {/* Decorative Tech Grid Overlay */}
              <div
                className="absolute inset-0 opacity-5 pointer-events-none"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, #fff 1px, transparent 1px)",
                  backgroundSize: "10px 10px",
                }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* FOOTER MESSAGE */}
      <div className="mt-12 text-center px-10">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-4" />
        <p className="text-[9px] text-white/20 font-bold uppercase tracking-[0.4em] leading-relaxed">
          Daily Ration resets in{" "}
          <span className="text-cyan-500/50">04:22:10</span>
        </p>
      </div>
    </div>
  );
};

export default Treasury;
