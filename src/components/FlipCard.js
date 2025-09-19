"use client";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function FlipCard({
  frontContent,
  backContent,
  isFlipped,
  delay = 0,
  className = ""
}) {
  const [hasFlipped, setHasFlipped] = useState(false);

  useEffect(() => {
    if (isFlipped && !hasFlipped) {
      setHasFlipped(true);
    }
  }, [isFlipped, hasFlipped]);

  return (
    <div className={`relative w-full ${className}`} style={{ perspective: "1000px" }}>
      <motion.div
        className="relative w-full h-full"
        style={{ transformStyle: "preserve-3d" }}
        initial={{ rotateY: 0 }}
        animate={{ rotateY: hasFlipped ? 180 : 0 }}
        transition={{
          duration: 0.6,
          delay,
          ease: "easeInOut",
          type: "spring",
          stiffness: 200,
          damping: 20
        }}
      >
        {/* 앞면 */}
        <motion.div
          className="absolute inset-0 backface-hidden bg-card rounded-lg border border-border flex items-center justify-center"
          style={{ backfaceVisibility: "hidden" }}
          whileHover={{ scale: 1.01 }}
        >
          <div className="w-full">
            {frontContent}
          </div>
        </motion.div>

        {/* 뒷면 */}
        <motion.div
          className="absolute inset-0 backface-hidden bg-card rounded-lg border border-primary/20 flex items-center justify-center"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            boxShadow: hasFlipped ? "0 0 20px rgba(254, 72, 71, 0.2)" : "none"
          }}
          initial={{ scale: 0.98 }}
          animate={{ scale: hasFlipped ? 1.02 : 0.98 }}
          transition={{ duration: 0.3, delay: delay + 0.4 }}
        >
          <motion.div
            className="w-full"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: hasFlipped ? 1 : 0, y: hasFlipped ? 0 : 10 }}
            transition={{ duration: 0.4, delay: delay + 0.5 }}
          >
            {backContent}
          </motion.div>
        </motion.div>

        {/* 빛나는 효과 */}
        {hasFlipped && (
          <motion.div
            className="absolute inset-0 rounded-lg pointer-events-none overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 0.8, delay: delay + 0.3 }}
          >
            <motion.div
              className="w-full h-full"
              style={{
                background: `linear-gradient(90deg, transparent 0%, rgba(254, 72, 71, 0.3) 50%, transparent 100%)`,
              }}
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 0.8, delay: delay + 0.3 }}
            />
          </motion.div>
        )}
      </motion.div>

      <style jsx>{`
        .backface-hidden {
          backface-visibility: hidden;
        }
      `}</style>
    </div>
  );
}