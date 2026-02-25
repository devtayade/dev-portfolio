"use client";

import { useState, useRef, useCallback } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import AuroraBackground from "./AuroraBackground";
import ScrollIndicator from "./ScrollIndicator";

const word = {
  hidden: { opacity: 0, y: 20, filter: "blur(8px)" },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.6,
      delay: 0.8 + i * 0.12,
      ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number],
    },
  }),
};

const subtitle = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      delay: 2.2,
      ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number],
    },
  },
};

const cta = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: 2.6,
      ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number],
    },
  },
};

const headlineWords = [
  "Designing",
  "at",
  "the",
  "intersection",
  "of",
  "AI",
  "&",
  "human",
  "experience",
];

// Smaller polaroids with tighter scatter
const polaroids = [
  { src: "/photos/hero-1.svg", caption: "Designing", x: 20, y: 15, rotate: -4, z: 3 },
  { src: "/photos/hero-2.svg", caption: "Building", x: 190, y: 5, rotate: 5, z: 5 },
  { src: "/photos/hero-3.svg", caption: "Exploring", x: 50, y: 180, rotate: 3, z: 2 },
  { src: "/photos/hero-4.svg", caption: "Creating", x: 220, y: 160, rotate: -5, z: 4 },
  { src: "/photos/hero-5.svg", caption: "Thinking", x: 10, y: 340, rotate: 4, z: 1 },
  { src: "/photos/hero-6.svg", caption: "Living", x: 200, y: 320, rotate: -3, z: 6 },
];

const CARD_W = 140;
const CARD_H = 175;

// Push pin SVG component
function PushPin({ pinned, isDragging }: { pinned: boolean; isDragging: boolean }) {
  return (
    <motion.div
      className="absolute -top-3 left-1/2 -translate-x-1/2"
      style={{ zIndex: 10 }}
      animate={{
        rotate: pinned ? 0 : 45,
        y: pinned ? 0 : -8,
        scale: pinned ? 1 : 1.15,
      }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
    >
      <svg
        width="18"
        height="22"
        viewBox="0 0 18 22"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Pin needle */}
        <motion.line
          x1="9"
          y1="14"
          x2="9"
          y2="22"
          stroke="#999"
          strokeWidth="1.2"
          animate={{ opacity: pinned ? 1 : 0.3 }}
        />
        {/* Pin head - circle */}
        <motion.circle
          cx="9"
          cy="8"
          r="7"
          animate={{
            fill: isDragging ? "#ef4444" : pinned ? "#dc2626" : "#f87171",
          }}
          transition={{ duration: 0.2 }}
        />
        {/* Pin head highlight */}
        <circle cx="7" cy="6" r="2.5" fill="white" opacity="0.35" />
        {/* Pin head shadow */}
        <motion.circle
          cx="9"
          cy="8"
          r="7"
          fill="none"
          stroke="rgba(0,0,0,0.15)"
          strokeWidth="0.5"
        />
      </svg>
      {/* Pin shadow on card */}
      {pinned && (
        <motion.div
          className="absolute top-4 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-black/10 blur-[2px]"
          animate={{ opacity: pinned ? 1 : 0 }}
        />
      )}
    </motion.div>
  );
}

function PolaroidCard({
  card,
  index,
  onDragStart,
  topZ,
}: {
  card: (typeof polaroids)[number];
  index: number;
  onDragStart: () => number;
  topZ: number;
}) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPinned, setIsPinned] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [myZ, setMyZ] = useState(card.z);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
    setIsPinned(false);
    setMyZ(onDragStart());
  }, [onDragStart]);

  const handleDragEnd = () => {
    setIsDragging(false);
    // Re-pin after dropping
    setTimeout(() => setIsPinned(true), 400);
  };

  const handleTap = () => {
    if (!isDragging) {
      setIsFlipped((f) => !f);
    }
  };

  // When pinned + hovered: subtle swing like a pinned card being nudged
  const hoverRotate = isHovered && isPinned && !isDragging;

  return (
    <motion.div
      className="absolute"
      style={{
        left: card.x,
        top: card.y,
        zIndex: isDragging ? topZ + 1 : myZ,
        perspective: "900px",
      }}
      drag
      dragConstraints={{
        top: -card.y - 20,
        left: -card.x - 60,
        right: 420 - card.x,
        bottom: 520 - card.y - CARD_H,
      }}
      dragElastic={0.08}
      dragMomentum={false}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onTap={handleTap}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      initial={{ opacity: 0, scale: 0.85, rotate: card.rotate }}
      animate={{
        opacity: 1,
        scale: isDragging ? 1.06 : 1,
        rotate: isDragging ? 0 : hoverRotate
          ? [card.rotate, card.rotate + 2, card.rotate - 1.5, card.rotate + 0.5, card.rotate]
          : card.rotate,
      }}
      transition={
        hoverRotate
          ? {
              rotate: {
                duration: 0.8,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "mirror" as const,
              },
              default: {
                duration: 0.5,
                delay: 2.2 + index * 0.12,
                ease: [0.25, 0.4, 0.25, 1],
              },
            }
          : {
              duration: 0.5,
              delay: 2.2 + index * 0.12,
              ease: [0.25, 0.4, 0.25, 1],
            }
      }
      data-cursor="pointer"
    >
      {/* Push pin */}
      <PushPin pinned={isPinned} isDragging={isDragging} />

      <motion.div
        className="relative"
        style={{
          width: CARD_W,
          height: CARD_H,
          transformStyle: "preserve-3d",
        }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.4, 0.25, 1] }}
      >
        {/* Front — polaroid with photo */}
        <div
          className="absolute inset-0 rounded border border-gray-200/80 bg-white p-1.5 pb-8 dark:border-zinc-700/50 dark:bg-zinc-100"
          style={{
            backfaceVisibility: "hidden",
            boxShadow: isDragging
              ? "0 20px 40px rgba(0,0,0,0.18), 0 8px 16px rgba(0,0,0,0.12)"
              : isHovered
                ? "0 12px 28px rgba(0,0,0,0.14), 0 4px 10px rgba(0,0,0,0.08)"
                : "0 4px 14px rgba(0,0,0,0.1), 0 2px 6px rgba(0,0,0,0.06)",
            transition: "box-shadow 0.3s ease",
          }}
        >
          <div className="relative h-[calc(100%-1.5rem)] w-full overflow-hidden bg-gray-100 dark:bg-gray-200">
            <Image
              src={card.src}
              alt={card.caption}
              fill
              className="object-cover"
              sizes="140px"
            />
          </div>
          <p
            className="mt-1.5 text-center text-[10px] italic text-gray-500 dark:text-gray-400"
            style={{ fontFamily: "Georgia, serif" }}
          >
            {card.caption}
          </p>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 rounded border border-gray-200/80 bg-gray-50 dark:border-zinc-700/50 dark:bg-zinc-200"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            boxShadow: isDragging
              ? "0 20px 40px rgba(0,0,0,0.18), 0 8px 16px rgba(0,0,0,0.12)"
              : "0 4px 14px rgba(0,0,0,0.1), 0 2px 6px rgba(0,0,0,0.06)",
            transition: "box-shadow 0.3s ease",
          }}
        >
          <div className="flex h-full w-full flex-col items-center justify-center">
            <div className="mb-2 h-px w-8 bg-gray-300" />
            <p
              className="text-xs italic text-gray-400"
              style={{ fontFamily: "Georgia, serif" }}
            >
              {card.caption}
            </p>
            <div className="mt-2 h-px w-8 bg-gray-300" />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function Hero() {
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.97]);
  const zCounterRef = useRef(10);

  const getNextZ = useCallback(() => {
    zCounterRef.current += 1;
    return zCounterRef.current;
  }, []);

  const scrollToWork = () => {
    document.getElementById("featured-work")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen overflow-hidden px-6">
      <AuroraBackground />

      <motion.div
        className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center"
        style={{ opacity: heroOpacity, scale: heroScale }}
      >
        <div className="grid w-full grid-cols-1 items-center gap-8 lg:grid-cols-2">
          {/* Left: Text */}
          <div>
            <motion.p
              className="mb-6 text-sm font-medium tracking-[0.25em] uppercase text-accent"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Product Designer
            </motion.p>

            <h1 className="mb-8 text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl lg:text-5xl">
              {headlineWords.map((w, i) => (
                <motion.span
                  key={i}
                  className={`inline-block ${w === "intersection" || w === "AI" ? "bg-gradient-to-r from-accent to-purple-500 bg-clip-text text-transparent" : ""}`}
                  variants={word}
                  initial="hidden"
                  animate="show"
                  custom={i}
                >
                  {w}
                  {i < headlineWords.length - 1 && "\u00A0"}
                </motion.span>
              ))}
            </h1>

            <motion.p
              className="mb-10 max-w-md text-lg text-muted md:text-xl"
              variants={subtitle}
              initial="hidden"
              animate="show"
            >
              I craft intelligent, human-centered products that bridge the gap
              between powerful technology and delightful experiences.
            </motion.p>

            <motion.button
              onClick={scrollToWork}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 text-sm font-medium text-white transition-all hover:scale-105 hover:shadow-lg hover:shadow-accent/25"
              variants={cta}
              initial="hidden"
              animate="show"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              data-cursor="pointer"
            >
              See my work
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <polyline points="19 12 12 19 5 12" />
              </svg>
            </motion.button>
          </div>

          {/* Right: Pinned Polaroid Board */}
          <div className="relative hidden h-[520px] lg:block">
            {polaroids.map((card, i) => (
              <PolaroidCard
                key={card.caption}
                card={card}
                index={i}
                onDragStart={getNextZ}
                topZ={zCounterRef.current}
              />
            ))}
          </div>
        </div>
      </motion.div>

      <ScrollIndicator />
    </section>
  );
}
