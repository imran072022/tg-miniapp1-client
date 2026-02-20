import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SupplyUnboxingOverlay = ({ crateRewards, onClose, crateConfig }) => {
  const [isOpened, setIsOpened] = useState(false);
  const [currentStep, setCurrentStep] = useState(-1);
  const [showFlash, setShowFlash] = useState(false);
  const [isSummary, setIsSummary] = useState(false); // New state for final view

  useEffect(() => {
    const openTimer = setTimeout(() => {
      setShowFlash(true);
      setIsOpened(true);
      setCurrentStep(0);
      setTimeout(() => setShowFlash(false), 200);
    }, 1000);
    return () => clearTimeout(openTimer);
  }, []);

  const handleTap = () => {
    if (!isOpened) return;

    // If we are already looking at the summary, close everything
    if (isSummary) {
      onClose();
      return;
    }

    // Move to next reward OR trigger summary if it was the last reward
    if (currentStep < crateRewards?.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      setIsSummary(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleTap}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black/50 backdrop-blur-xl cursor-pointer overflow-hidden"
    >
      <AnimatePresence>
        {showFlash && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-white z-[110]"
          />
        )}
      </AnimatePresence>

      <div className="flex flex-col items-center justify-center">
        {/* REWARD SPAWN AREA - We place this ABOVE the crate in code */}
        <div className="relative w-full flex flex-col items-center justify-center h-40">
          <AnimatePresence mode="wait">
            {isOpened && !isSummary && (
              <motion.div
                key={`reward-${currentStep}`}
                initial={{ y: 120, opacity: 0, scale: 0 }} // Starts inside the box
                animate={{ y: 0, opacity: 1, scale: 1.2 }} // Jumps up
                exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.1 } }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className="flex flex-col items-center"
              >
                <img
                  src={crateRewards[currentStep]?.icon}
                  className="w-32 h-32 object-contain"
                />
                <span className="text-white font-black text-5xl mt-2 italic">
                  +{crateRewards[currentStep]?.amount}
                </span>
                <span className="text-cyan-400 font-bold text-xs uppercase tracking-[0.4em]">
                  {crateRewards[currentStep]?.type}
                </span>
              </motion.div>
            )}

            {isSummary && (
              <motion.div
                key="summary"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-wrap gap-4 items-center justify-center px-6"
              >
                {crateRewards.map((item, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex flex-col items-center bg-white/5 p-4 rounded-2xl border border-white/10 min-w-[90px]"
                  >
                    <img src={item.icon} className="w-12 h-12 object-contain" />
                    <span className="text-white font-black text-xl">
                      +{item.amount}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* CRATE AREA - Positioned below rewards */}
        <div className="w-52 h-52 relative mt-4">
          <AnimatePresence mode="wait">
            {!isOpened ? (
              <motion.img
                key="closed"
                src={crateConfig.closedImg}
                animate={{ x: [-2, 2, -2, 2, 0], rotate: [-1, 1, -1, 1, 0] }}
                transition={{ x: { repeat: Infinity, duration: 0.1 } }}
                className="w-full h-full object-contain"
              />
            ) : (
              <motion.img
                // Adding currentStep to the key is the secret—it forces a re-render/re-pulse
                key={`open-crate-${currentStep}`}
                src={crateConfig.openedImg}
                initial={{ scale: 0.95 }}
                animate={{
                  y: isSummary ? 20 : 0,
                  scale: [0.85, 1.25, 1], // The "spit" pulse
                }}
                transition={{
                  scale: { duration: 0.3, ease: "easeOut" },
                  y: { type: "spring", damping: 15 },
                }}
                className="w-full h-full object-contain"
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 3. INSTRUCTION TEXT */}
      <motion.p
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="absolute bottom-12 text-white/50 text-[10px] font-bold uppercase tracking-[0.6em]"
      >
        {isSummary ? "Tap to Collect and Return" : "Tap to Continue"}
      </motion.p>
    </motion.div>
  );
};
export default SupplyUnboxingOverlay;
