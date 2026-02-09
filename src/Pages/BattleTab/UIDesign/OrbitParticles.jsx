import React from "react";
import { motion } from "framer-motion";

const OrbitParticles = () => {
  // Pre-defined particles (no scaling, just orbit)
  const particles = React.useMemo(() => {
    const colors = ["#22d3ee", "#a855f7", "#22d3ee", "#a855f7"];
    return [
      // Inner ring: 6 particles
      ...Array.from({ length: 6 }, (_, i) => ({
        id: `inner-${i}`,
        size: 1.5 + (i % 2) * 0.5, // 1.5px or 2px
        distance: 65 + i * 5,
        color: colors[i % 2],
        duration: 8 + i * 0.5,
        delay: i * 0.15,
      })),
      // Outer ring: 6 particles
      ...Array.from({ length: 6 }, (_, i) => ({
        id: `outer-${i}`,
        size: 2 + (i % 2), // 2px or 3px
        distance: 95 + i * 8,
        color: colors[(i + 1) % 2],
        duration: 12 + i * 1,
        delay: i * 0.2,
      })),
    ];
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-25">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          animate={{ rotate: 360 }}
          transition={{
            rotate: {
              duration: p.duration,
              repeat: Infinity,
              ease: "linear",
              delay: p.delay,
            },
          }}
          className="absolute rounded-full"
          style={{
            width: p.size,
            height: p.size,
            top: "50%",
            left: "50%",
            marginLeft: -p.size / 2,
            marginTop: -p.size / 2,
            backgroundColor: p.color,
            transformOrigin: `${p.distance}px center`,
            filter: `drop-shadow(0 0 ${p.size}px ${p.color})`,
            opacity: 0.6,
          }}
        />
      ))}
    </div>
  );
};

export default OrbitParticles;
