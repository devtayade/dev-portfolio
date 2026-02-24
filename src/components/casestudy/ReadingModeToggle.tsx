"use client";

import { motion } from "framer-motion";

export default function ReadingModeToggle({
  mode,
  onToggle,
}: {
  mode: "quick" | "full";
  onToggle: (mode: "quick" | "full") => void;
}) {
  return (
    <div className="sticky top-16 z-30 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-4xl items-center justify-center px-6 py-3">
        <div className="relative flex rounded-full bg-card border border-border p-1">
          <button
            onClick={() => onToggle("quick")}
            className={`relative z-10 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              mode === "quick" ? "text-white" : "text-muted hover:text-foreground"
            }`}
            data-cursor="pointer"
          >
            Quick Read
          </button>
          <button
            onClick={() => onToggle("full")}
            className={`relative z-10 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              mode === "full" ? "text-white" : "text-muted hover:text-foreground"
            }`}
            data-cursor="pointer"
          >
            Full Case Study
          </button>

          {/* Sliding indicator */}
          <motion.div
            className="absolute top-1 bottom-1 rounded-full bg-accent"
            layout
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            style={{
              left: mode === "quick" ? "4px" : "50%",
              width: "calc(50% - 4px)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
