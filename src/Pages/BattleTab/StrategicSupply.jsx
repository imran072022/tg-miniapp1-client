import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const StrategicSupply = () => {
  const [isReady, setIsReady] = useState(false);
  const crateImg = "/assets/Chests/crate1.png";

  return (
    /* px-6 and items-end keeps everything visible above the BottomNav */
    <div className="w-full flex items-end justify-between px-6 pb-2">
      {/* 1. LEFT HALF: BIG ACTIVE SLOT */}
      <div className="flex flex-col items-center">
        <div className="relative w-32 h-32 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {!isReady ? (
              <motion.div
                key="hologram"
                animate={{ opacity: 0.4 }}
                className="relative"
              >
                <img
                  src={crateImg}
                  className="w-28 h-28 object-contain invert sepia saturate-[5] hue-rotate-[180deg] blur-[0.5px]"
                />
                {/* Your Phaser Smoke will target this base */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-16 h-2 bg-cyan-400/20 blur-lg" />
              </motion.div>
            ) : (
              <motion.div
                key="physical"
                initial={{ y: -300, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ type: "spring", damping: 12 }}
              >
                <img
                  src={crateImg}
                  className="w-32 h-32 object-contain drop-shadow-2xl"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Labels Below the Box */}
        <div className="text-center mt-1">
          <p className="text-[8px] font-black text-cyan-400/50 tracking-widest uppercase">
            {isReady ? "Ready" : "Decrypting"}
          </p>
          <p className="text-lg font-black text-white italic leading-none">
            {isReady ? "OPEN" : "02:54:12"}
          </p>
        </div>
      </div>

      {/* 2. RIGHT HALF: THE QUEUE (2nd & 3rd Boxes) */}
      <div className="flex gap-2 mb-4">
        {/* Next Box */}
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center grayscale opacity-40">
            <img src={crateImg} className="w-8 h-8 object-contain" />
          </div>
          <span className="text-[7px] font-bold text-white/30 mt-1 uppercase">
            Next
          </span>
        </div>

        {/* Third Box */}
        <div className="flex flex-col items-center">
          <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center grayscale opacity-20">
            <img src={crateImg} className="w-8 h-8 object-contain" />
          </div>
          <span className="text-[7px] font-bold text-white/30 mt-1 uppercase">
            Queue
          </span>
        </div>
      </div>
    </div>
  );
};

export default StrategicSupply;
