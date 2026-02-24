"use client";

import { motion, useScroll, useTransform } from "framer-motion";

export default function ScrollIndicator() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);

  return (
    <motion.div
      className="absolute bottom-8 left-1/2 flex -translate-x-1/2 flex-col items-center gap-2"
      style={{ opacity }}
    >
      <span className="text-xs font-medium tracking-widest uppercase text-muted">
        Scroll
      </span>
      <motion.div
        className="flex h-8 w-5 items-start justify-center rounded-full border-2 border-muted/50 p-1"
      >
        <motion.div
          className="h-1.5 w-1.5 rounded-full bg-accent"
          animate={{ y: [0, 8, 0] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>
    </motion.div>
  );
}
