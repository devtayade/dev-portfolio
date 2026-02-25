"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";

const storyCards = [
  { src: "/photos/story-1.svg", caption: "Sketching ideas", x: 10, y: 20, rotate: -5 },
  { src: "/photos/story-2.svg", caption: "Whiteboard sessions", x: 170, y: 0, rotate: 4 },
  { src: "/photos/story-3.svg", caption: "Late-night builds", x: 40, y: 195, rotate: 3 },
  { src: "/photos/story-4.svg", caption: "Coffee & pixels", x: 200, y: 175, rotate: -4 },
];

const CARD_W = 140;
const CARD_H = 175;

function StoryPolaroid({
  card,
  index,
  scrollProgress,
}: {
  card: (typeof storyCards)[number];
  index: number;
  scrollProgress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  // Each card starts its animation at a slightly different scroll point (staggered)
  const staggerStart = 0.05 + index * 0.06;
  const staggerEnd = staggerStart + 0.35;

  // Cards drop in from above
  const y = useTransform(
    scrollProgress,
    [staggerStart, staggerEnd],
    [-300, 0]
  );
  const opacity = useTransform(
    scrollProgress,
    [staggerStart, staggerStart + 0.12],
    [0, 1]
  );
  const rotate = useTransform(
    scrollProgress,
    [staggerStart, staggerEnd],
    [card.rotate * 3, card.rotate]
  );
  const scale = useTransform(
    scrollProgress,
    [staggerStart, staggerEnd],
    [0.7, 1]
  );

  return (
    <motion.div
      className="absolute"
      style={{
        left: card.x,
        top: card.y,
        width: CARD_W,
        y,
        opacity,
        rotate,
        scale,
        zIndex: index + 1,
      }}
    >
      {/* Push pin */}
      <div
        className="absolute -top-3 left-1/2 -translate-x-1/2"
        style={{ zIndex: 10 }}
      >
        <svg
          width="18"
          height="22"
          viewBox="0 0 18 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <line x1="9" y1="14" x2="9" y2="22" stroke="#999" strokeWidth="1.2" />
          <circle cx="9" cy="8" r="7" fill="#dc2626" />
          <circle cx="7" cy="6" r="2.5" fill="white" opacity="0.35" />
          <circle
            cx="9"
            cy="8"
            r="7"
            fill="none"
            stroke="rgba(0,0,0,0.15)"
            strokeWidth="0.5"
          />
        </svg>
        <div className="absolute top-4 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-black/10 blur-[2px]" />
      </div>

      {/* Polaroid card */}
      <div
        className="rounded border border-gray-100/60 bg-white p-1.5 pb-8 dark:border-zinc-700/30 dark:bg-zinc-100"
        style={{
          width: CARD_W,
          height: CARD_H,
          boxShadow:
            "0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.08), 0 0 0 0.5px rgba(0,0,0,0.04)",
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
    </motion.div>
  );
}

export default function AboutTeaser() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "center center"],
  });

  // Text fades in as cards land
  const textOpacity = useTransform(scrollYProgress, [0.2, 0.5], [0, 1]);
  const textY = useTransform(scrollYProgress, [0.2, 0.5], [40, 0]);

  return (
    <section ref={sectionRef} className="mx-auto max-w-6xl px-6 py-24">
      <div className="grid items-center gap-12 md:grid-cols-2">
        {/* Left: Story Polaroids */}
        <div className="relative hidden h-[400px] md:block">
          {storyCards.map((card, i) => (
            <StoryPolaroid
              key={card.caption}
              card={card}
              index={i}
              scrollProgress={scrollYProgress}
            />
          ))}
        </div>

        {/* Mobile fallback: simple grid of polaroids */}
        <div className="grid grid-cols-2 gap-4 md:hidden">
          {storyCards.map((card) => (
            <motion.div
              key={card.caption}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5 }}
            >
              <div
                className="rounded border border-gray-100/60 bg-white p-1.5 pb-6 dark:border-zinc-700/30 dark:bg-zinc-100"
                style={{
                  boxShadow:
                    "0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.08), 0 0 0 0.5px rgba(0,0,0,0.04)",
                }}
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100 dark:bg-gray-200">
                  <Image
                    src={card.src}
                    alt={card.caption}
                    fill
                    className="object-cover"
                    sizes="160px"
                  />
                </div>
                <p
                  className="mt-1.5 text-center text-[10px] italic text-gray-500 dark:text-gray-400"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {card.caption}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Right: Text */}
        <motion.div style={{ opacity: textOpacity, y: textY }}>
          <h2 className="mb-6 text-3xl font-bold tracking-tight md:text-4xl">
            The story behind
            <br />
            the designs
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-muted">
            I believe great design is invisible — it gets out of the way and
            lets people do what they came to do. But getting there? That takes
            deep curiosity, relentless iteration, and a genuine love for
            understanding people.
          </p>
          <p className="mb-8 text-lg leading-relaxed text-muted">
            From AI-powered products to design systems that scale, every project
            starts with the same question: <em>how can we make this feel human?</em>
          </p>
          <Link
            href="/about"
            className="inline-flex items-center gap-2 text-sm font-medium text-accent transition-all hover:gap-3"
          >
            Read my story
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
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
