import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import SupplyUnboxingOverlay from "../../Components/SupplyUnboxingOverlay";

const StrategicSupply = () => {
  // --- STATES ---
  const [unlocksAt, setUnlocksAt] = useState(Date.now() + 10000);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isGhost, setIsGhost] = useState(true);
  const [shouldShake, setShouldShake] = useState(false);
  const [canSmoke, setCanSmoke] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [isClaimed, setIsClaimed] = useState(false);
  const canvasRef = useRef(null);
  const particles = useRef([]);
  const crateImage = "/assets/Chests/epicClosed.png";
  const crateOpenedImg = "/assets/Chests/epicOpened.png";
  const rarityColor = "cyan";
  const glowStyles = {
    cyan: "shadow-[0_0_50px_rgba(6,182,212,0.3)] bg-cyan-500/10",
    purple: "shadow-[0_0_50px_rgba(168,85,247,0.3)] bg-purple-500/10",
    amber: "shadow-[0_0_50px_rgba(245,158,11,0.3)] bg-amber-500/10",
  };
  // Crate unboxing rewards
  const currentRewards = [
    { type: "gold", amount: 500, icon: "/assets/recourses/goldForNav.png" },
    { type: "diamond", amount: 10, icon: "/assets/recourses/handOfGems.png" },
    { type: "shard", amount: 5, icon: "/assets/Shards/weaponTech.png" },
  ];
  // Countdown time
  const COOLDOWN_TIME = 20000; // 2 Hours in ms
  // --- TIME FORMATTER ---
  const formatTime = (ms) => {
    if (!ms || ms <= 0) return "00:00:00";
    const h = Math.floor(ms / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    const s = Math.floor((ms % 60000) / 1000);
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  // --- LOGIC ---
  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const distance = unlocksAt - now;

      if (distance <= 0) {
        clearInterval(timer);
        setTimeLeft(0);
        setIsGhost(false);
        // Sync: Drop starts -> 600ms later it hits -> Shake & Smoke
        setTimeout(() => setShouldShake(true), 600);
        setTimeout(() => setShouldShake(false), 900);
        setTimeout(() => setCanSmoke(true), 700);
      } else {
        setTimeLeft(distance);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [unlocksAt]);

  // --- SMOKE ENGINE ---
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrame;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (canSmoke && Math.random() > 0.7 && particles.current.length < 50) {
        particles.current.push({
          x: 100 + (Math.random() - 0.5) * 10,
          y: 450,
          size: Math.random() * 5 + 6,
          speedY: Math.random() * 1.5 + 1,
          speedX: (Math.random() - 0.5) * 1,
          opacity: 0.6,
          scale: 1,
        });
      }

      for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i];
        p.y -= p.speedY;
        p.x += p.speedX;
        p.scale += 0.04;
        p.opacity -= 0.003;
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = "#666";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.scale, 0, Math.PI * 2);
        ctx.fill();
        if (p.opacity <= 0 || p.y < -50) particles.current.splice(i, 1);
      }
      animationFrame = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationFrame);
  }, [canSmoke]);

  return (
    <>
      <motion.div
        animate={
          shouldShake ? { x: [-2, 2, -2, 2, 0], y: [-1, 1, -1, 1, 0] } : {}
        }
        transition={{ duration: 0.3 }}
        className="relative w-full h-full flex items-end justify-center pointer-events-none"
        style={{ zIndex: 10 }} // Lower than PilotHUD/Buttons
      >
        {/* AMBIENT BACKGROUND GLOW */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute left-1/2 -translate-x-1/2 bottom-12 w-64 h-24 rounded-[100%] blur-3xl ${glowStyles[rarityColor]}`}
        />

        <div className="relative flex items-center gap-6 pointer-events-auto mb-2">
          {/* CRATE SLOT - RESTORED DIMENSIONS */}
          <div className="relative w-32 h-32 flex items-center justify-center">
            {/* 1. GHOST CRATE (Stays in place) */}
            <AnimatePresence>
              {isGhost && (
                <motion.div
                  key="ghost"
                  exit={{ opacity: 0 }}
                  className="relative z-10"
                >
                  <motion.img
                    src={crateImage}
                    style={{
                      filter:
                        "brightness(0.5) sepia(1) hue-rotate(140deg) saturate(3) blur(1px)",
                      opacity: 0.4,
                    }}
                    animate={{ opacity: [0.2, 0.4, 0.25, 0.4] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-32 h-32 object-contain"
                  />
                  <motion.div
                    animate={{
                      top: ["10%", "90%", "10%"],
                      opacity: [0, 0.8, 0],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="absolute left-1/2 -translate-x-1/2 w-[110%] h-[1px] bg-cyan-300/50 shadow-[0_0_10px_#06b6d4] z-20 pointer-events-none"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* 2. MAIN CRATE (The one that falls) */}
            <AnimatePresence>
              {!isGhost && (
                <motion.div
                  onClick={() => setIsOpening(true)}
                  key="physical"
                  initial={{ y: -1200, opacity: 0 }} // Far above for landing effect
                  animate={{
                    y: 0,
                    opacity: 1,
                    scaleY: [1.3, 0.8, 1.1, 1],
                  }}
                  transition={{
                    duration: 0.7,
                    times: [0, 0.7, 0.85, 1],
                    ease: "easeIn",
                  }}
                  className="absolute inset-0 z-30 flex items-center justify-center"
                >
                  <img
                    src={crateImage}
                    className="w-32 h-32 object-contain drop-shadow-2xl"
                  />
                  <canvas
                    ref={canvasRef}
                    width={200}
                    height={466}
                    className="absolute bottom-16 -left-20 pointer-events-none"
                    style={{
                      filter: "blur(5px)",
                      width: "300px",
                      height: "700px",
                      opacity: 0.7,
                      zIndex: -1, // Smoke stays behind the crate image
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
            {/* Claim text */}
            <AnimatePresence>
              {canSmoke && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50"
                >
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => console.log("Claiming Rewards...")}
                    className="group relative px-4 py-1.5 bg-cyan-500 rounded-md overflow-hidden"
                  >
                    {/* Button Glitch/Shine Effect */}
                    <motion.div
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
                    />

                    <span className="relative text-[10px] font-black text-black tracking-tighter">
                      Claim
                    </span>

                    {/* Ornamental Corners */}
                    <div className="absolute top-0 left-0 w-1 h-1 border-t border-l border-white" />
                    <div className="absolute bottom-0 right-0 w-1 h-1 border-b border-r border-white" />
                  </motion.button>

                  {/* Pulsing Ring behind button */}
                  <motion.div
                    animate={{ scale: [1, 1.4], opacity: [0.5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="absolute inset-0 bg-cyan-400 rounded-md -z-10"
                  />
                </motion.div>
              )}
            </AnimatePresence>
            <div className="absolute inset-0 bg-cyan-400/20 blur-xl rounded-full animate-pulse -z-10" />
          </div>

          {/* UI INFO PANEL - RESTORED POSITIONING */}
          <div className="flex flex-col gap-1 mb-2">
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${isGhost ? "bg-cyan-500 animate-ping" : "bg-green-400"}`}
              />
              <h4 className="text-xs font-black text-white tracking-[0.2em] uppercase">
                {isGhost ? "Supply Drop" : "Verified Supply"}
              </h4>
            </div>

            <div className="bg-black/40 border border-white/10 backdrop-blur-md px-3 py-1 rounded-lg min-w-[180px]">
              <div className="flex items-center gap-3">
                <span className="text-[14px] font-black text-white tabular-nums tracking-tighter">
                  {formatTime(timeLeft)}
                </span>
                <div className="w-[1px] h-3 bg-white/20" />
                <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest">
                  {isGhost ? "Decrypting" : "Ready"}
                </span>
              </div>
              {/* Progress Bar */}
              <div className="w-full h-[2px] bg-white/5 mt-1.5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: "0%" }}
                  animate={{
                    width: isGhost
                      ? `${((10000 - (timeLeft || 0)) / 10000) * 100}%`
                      : "100%",
                  }}
                  className="h-full bg-cyan-500 shadow-[0_0_50px_#06b6d4]"
                />
              </div>
            </div>

            <p className="text-[8px] text-white/30 font-black uppercase tracking-[0.3em] ml-1 mt-1">
              Sector Rewards: High
            </p>
          </div>
        </div>
      </motion.div>
      <AnimatePresence>
        {isOpening && (
          <SupplyUnboxingOverlay
            rewards={currentRewards}
            crateClosedImg={crateImage} // Using your existing variable
            crateOpenImg={crateOpenedImg} // Path to your open version
            onClose={() => {
              setIsOpening(false);
              setIsClaimed(true); // Hide the crate/smoke
              setIsGhost(true); // Reset to ghost mode for next time
              setCanSmoke(false); // Stop smoke particles

              // Set the next unlock time to 2 hours from now
              const nextUnlock = Date.now() + COOLDOWN_TIME;
              setUnlocksAt(nextUnlock);
              // Note: You'll need to update 'unlocksAt' state here
              // if you want the countdown to start immediately.
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
};
export default StrategicSupply;
