"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";

export default function VideoWalkthrough({ color }: { color: string }) {
  const videoRef = useRef<HTMLDivElement>(null);
  const [isMuted, setIsMuted] = useState(true);

  return (
    <motion.div
      ref={videoRef}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.6 }}
      className="mx-auto -mt-16 max-w-4xl px-6"
    >
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        {/* Video placeholder */}
        <div
          className="relative flex aspect-video items-center justify-center"
          style={{ backgroundColor: `${color}15` }}
        >
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent text-white transition-transform hover:scale-110"
              data-cursor="pointer"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
            </div>
            <p className="text-sm font-medium text-muted">
              Watch the 3-min walkthrough
            </p>
          </div>

          {/* Mute toggle */}
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="absolute bottom-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
            data-cursor="pointer"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <line x1="23" y1="9" x2="17" y2="15" />
                <line x1="17" y1="9" x2="23" y2="15" />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
              </svg>
            )}
          </button>
        </div>

        <div className="border-t border-border px-4 py-3 text-center">
          <p className="text-sm text-muted">
            Or{" "}
            <button
              onClick={() => {
                document
                  .getElementById("case-study-content")
                  ?.scrollIntoView({ behavior: "smooth" });
              }}
              className="font-medium text-accent underline-offset-4 hover:underline"
              data-cursor="pointer"
            >
              read the full case study
            </button>{" "}
            below
          </p>
        </div>
      </div>
    </motion.div>
  );
}
