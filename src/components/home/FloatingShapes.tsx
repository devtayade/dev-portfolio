"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const shapes = [
  { size: 300, mobileSize: 150, x: "10%", y: "20%", gradient: "from-indigo-500/20 to-purple-500/20", delay: 0 },
  { size: 200, mobileSize: 100, x: "70%", y: "10%", gradient: "from-blue-500/15 to-cyan-500/15", delay: 1 },
  { size: 250, mobileSize: 120, x: "80%", y: "60%", gradient: "from-violet-500/20 to-pink-500/20", delay: 2 },
  { size: 180, mobileSize: 90, x: "20%", y: "70%", gradient: "from-cyan-500/15 to-blue-500/15", delay: 0.5 },
  { size: 150, mobileSize: 80, x: "50%", y: "40%", gradient: "from-purple-500/10 to-indigo-500/10", delay: 1.5 },
  { size: 120, mobileSize: 60, x: "40%", y: "80%", gradient: "from-pink-500/15 to-rose-500/15", delay: 2.5 },
];

export default function FloatingShapes() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [hasMounted, setHasMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    setHasMounted(true);
    setIsMobile(window.innerWidth < 768);

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth - 0.5);
      mouseY.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  if (!hasMounted) return null;

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {shapes.map((shape, i) => (
        <FloatingShape
          key={i}
          shape={shape}
          mouseX={mouseX}
          mouseY={mouseY}
          isMobile={isMobile}
          prefersReduced={prefersReduced}
        />
      ))}
    </div>
  );
}

function FloatingShape({
  shape,
  mouseX,
  mouseY,
  isMobile,
  prefersReduced,
}: {
  shape: (typeof shapes)[number];
  mouseX: ReturnType<typeof useMotionValue<number>>;
  mouseY: ReturnType<typeof useMotionValue<number>>;
  isMobile: boolean;
  prefersReduced: boolean;
}) {
  const parallaxX = useTransform(mouseX, [-0.5, 0.5], [-30, 30]);
  const parallaxY = useTransform(mouseY, [-0.5, 0.5], [-30, 30]);
  const size = isMobile ? shape.mobileSize : shape.size;

  return (
    <motion.div
      className={`absolute rounded-full bg-gradient-to-br ${shape.gradient} blur-3xl`}
      style={{
        width: size,
        height: size,
        left: shape.x,
        top: shape.y,
        x: isMobile ? 0 : parallaxX,
        y: isMobile ? 0 : parallaxY,
      }}
      animate={
        prefersReduced
          ? {}
          : {
              y: [0, -20, 0, 20, 0],
              x: [0, 10, 0, -10, 0],
            }
      }
      transition={{
        duration: 10 + shape.delay * 2,
        repeat: Infinity,
        ease: "easeInOut",
        delay: shape.delay,
      }}
    />
  );
}
