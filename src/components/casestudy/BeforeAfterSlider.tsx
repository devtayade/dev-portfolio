"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";

export default function BeforeAfterSlider({
  beforeColor = "#6366f1",
  afterColor = "#06b6d4",
}: {
  beforeColor?: string;
  afterColor?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setPosition(percent);
  };

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) handleMove(e.clientX);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    handleMove(e.touches[0].clientX);
  };

  return (
    <div
      ref={containerRef}
      className="relative my-8 aspect-video cursor-grab overflow-hidden rounded-xl border border-border active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onMouseMove={handleMouseMove}
      onTouchMove={handleTouchMove}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
    >
      {/* After (full width background) */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{ backgroundColor: `${afterColor}20` }}
      >
        <span className="text-lg font-medium text-foreground/30">After</span>
      </div>

      {/* Before (clipped) */}
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          backgroundColor: `${beforeColor}20`,
          clipPath: `inset(0 ${100 - position}% 0 0)`,
        }}
      >
        <span className="text-lg font-medium text-foreground/30">Before</span>
      </div>

      {/* Divider */}
      <motion.div
        className="absolute top-0 bottom-0 z-10 w-0.5 bg-card shadow-lg"
        style={{ left: `${position}%` }}
      >
        <div className="absolute top-1/2 left-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-card shadow-lg">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-foreground">
            <polyline points="15 18 9 12 15 6" />
            <polyline points="9 18 15 12 9 6" transform="translate(6, 0)" />
          </svg>
        </div>
      </motion.div>

      {/* Labels */}
      <span className="absolute top-3 left-3 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
        Before
      </span>
      <span className="absolute top-3 right-3 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
        After
      </span>
    </div>
  );
}
