import { motion } from "framer-motion";

const CrateSmoke = ({ x, y, drift, duration, onComplete }) => {
  // 10 particles per burst to match Phaser's density
  const particles = Array.from({ length: 10 });

  return (
    <div className="absolute pointer-events-none" style={{ left: x, top: y }}>
      {particles.map((_, i) => {
        // We calculate randoms here once per mini-particle to keep it stable
        const randomXSpread = (Math.random() - 0.5) * 180;
        const randomHeight = 500 + Math.random() * 200;
        const randomDelay = i * 0.08; // Staggered release for "stream" look

        return (
          <motion.div
            key={i}
            initial={{ x: 0, y: 0, opacity: 0, scale: 0.3 }}
            animate={{
              // Rapid vertical blast
              y: -randomHeight,
              // Wide turbulence
              x: [0, randomXSpread, randomXSpread + drift * 2],
              opacity: [0, 0.6, 0.3, 0],
              // Irregular scaling (Stretches the smoke)
              scaleX: [1, 3, 6],
              scaleY: [1, 2, 4],
              rotate: Math.random() * 180,
            }}
            transition={{
              duration: duration + Math.random(),
              ease: "easeOut",
              delay: randomDelay,
            }}
            // Only the last particle to finish triggers the cleanup
            onAnimationComplete={
              i === particles.length - 1 ? onComplete : undefined
            }
            className="absolute"
            style={{
              width: "40px",
              height: "30px", // Flatter initial shape looks more like gas
              background:
                "radial-gradient(circle, rgba(200,200,200,0.5) 0%, rgba(60,60,60,0) 80%)",
              borderRadius: "40%", // Less "perfect circle"
              filter: "blur(12px)",
              willChange: "transform, opacity",
            }}
          />
        );
      })}
    </div>
  );
};

export default CrateSmoke;
