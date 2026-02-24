"use client";

import { motion } from "framer-motion";

export default function PaperPlane({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center">
      <motion.div
        initial={{ x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }}
        animate={{
          x: [0, 100, 300, 600],
          y: [0, -80, -160, -300],
          rotate: [0, -10, -20, -45],
          scale: [1, 1.2, 1, 0.5],
          opacity: [1, 1, 0.8, 0],
        }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      >
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="22" y1="2" x2="11" y2="13" />
          <polygon points="22 2 15 22 11 13 2 9 22 2" />
        </svg>
      </motion.div>
    </div>
  );
}
