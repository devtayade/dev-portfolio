"use client";

import { useEffect, useState, useRef } from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  useScroll,
} from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export default function FloatingShapes() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasMounted, setHasMounted] = useState(false);
  const prefersReduced = useReducedMotion();

  const { scrollYProgress } = useScroll();
  const gridY = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const orbScale = useTransform(scrollYProgress, [0, 0.3], [1, 0.8]);
  const orbOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  useEffect(() => {
    setHasMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth - 0.5);
      mouseY.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  // Parallax transforms for orbs (different speeds per layer)
  const orbX1 = useTransform(mouseX, [-0.5, 0.5], [-40, 40]);
  const orbY1 = useTransform(mouseY, [-0.5, 0.5], [-40, 40]);
  const orbX2 = useTransform(mouseX, [-0.5, 0.5], [30, -30]);
  const orbY2 = useTransform(mouseY, [-0.5, 0.5], [20, -20]);
  const orbX3 = useTransform(mouseX, [-0.5, 0.5], [-20, 20]);
  const orbY3 = useTransform(mouseY, [-0.5, 0.5], [-50, 50]);

  if (!hasMounted) return null;

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Dot grid pattern */}
      <motion.div
        className="absolute inset-0"
        style={{ y: gridY }}
      >
        <div
          className="absolute inset-0 opacity-[0.4]"
          style={{
            backgroundImage:
              "radial-gradient(circle, var(--border) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      </motion.div>

      {/* Gradient mesh orbs */}
      <motion.div
        className="absolute inset-0"
        style={{ scale: orbScale, opacity: orbOpacity }}
      >
        {/* Primary orb - large, top-right */}
        <motion.div
          className="absolute -right-20 -top-20 h-[600px] w-[600px] rounded-full md:h-[800px] md:w-[800px]"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, rgba(99, 102, 241, 0.15), rgba(139, 92, 246, 0.08), transparent 70%)",
            x: prefersReduced ? 0 : orbX1,
            y: prefersReduced ? 0 : orbY1,
          }}
          animate={
            prefersReduced
              ? {}
              : {
                  scale: [1, 1.05, 1, 0.98, 1],
                  rotate: [0, 3, 0, -3, 0],
                }
          }
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Secondary orb - medium, bottom-left */}
        <motion.div
          className="absolute -bottom-32 -left-32 h-[500px] w-[500px] rounded-full md:h-[700px] md:w-[700px]"
          style={{
            background:
              "radial-gradient(circle at 70% 70%, rgba(6, 182, 212, 0.12), rgba(59, 130, 246, 0.06), transparent 70%)",
            x: prefersReduced ? 0 : orbX2,
            y: prefersReduced ? 0 : orbY2,
          }}
          animate={
            prefersReduced
              ? {}
              : {
                  scale: [1, 0.97, 1, 1.03, 1],
                  rotate: [0, -2, 0, 2, 0],
                }
          }
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />

        {/* Accent orb - small, center */}
        <motion.div
          className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full md:h-[400px] md:w-[400px]"
          style={{
            background:
              "radial-gradient(circle, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.05), transparent 70%)",
            x: prefersReduced ? 0 : orbX3,
            y: prefersReduced ? 0 : orbY3,
          }}
          animate={
            prefersReduced
              ? {}
              : {
                  scale: [1, 1.08, 1, 0.95, 1],
                }
          }
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </motion.div>

      {/* Animated gradient line - horizontal sweep */}
      <motion.div
        className="absolute left-0 right-0 top-[40%] h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, var(--accent) 20%, transparent 40%, transparent 60%, var(--accent) 80%, transparent)",
          opacity: 0.1,
        }}
        animate={
          prefersReduced
            ? {}
            : {
                x: ["-100%", "100%"],
              }
        }
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Vignette - subtle darkening at edges */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 50%, var(--background) 100%)",
          opacity: 0.6,
        }}
      />
    </div>
  );
}
