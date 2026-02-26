"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";

const storyCards = [
  { src: "/photos/story-1.svg", caption: "Sketching ideas", x: 10, y: 20, rotate: -5 },
  { src: "/photos/story-2.svg", caption: "Whiteboard sessions", x: 170, y: 0, rotate: 4 },
  { src: "/photos/story-3.svg", caption: "Late-night builds", x: 40, y: 195, rotate: 3 },
  { src: "/photos/story-4.svg", caption: "Coffee & pixels", x: 200, y: 175, rotate: -4 },
];

const CARD_W = 140;
const CARD_H = 175;

const shadowRest = "0 2px 16px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02)";
const shadowHover = "0 20px 48px rgba(0,0,0,0.08), 0 8px 20px rgba(0,0,0,0.04)";

function StoryPolaroid({
  card,
  index,
}: {
  card: (typeof storyCards)[number];
  index: number;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="absolute"
      style={{
        left: card.x,
        top: card.y,
        width: CARD_W,
        rotate: isHovered ? 0 : card.rotate,
        zIndex: isHovered ? 20 : index + 1,
      }}
      initial={{ opacity: 0, y: -60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      data-cursor="pointer"
    >
      {/* Push pin */}
      <motion.div
        className="absolute -top-3 left-1/2 -translate-x-1/2"
        style={{ zIndex: 10 }}
        animate={{
          rotate: isHovered ? 45 : 0,
          y: isHovered ? -8 : 0,
          scale: isHovered ? 1.15 : 1,
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <svg
          width="18"
          height="22"
          viewBox="0 0 18 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <motion.line
            x1="9" y1="14" x2="9" y2="22"
            className="stroke-muted/50"
            strokeWidth="1.2"
            animate={{ opacity: isHovered ? 0.3 : 1 }}
          />
          <motion.circle
            cx="9" cy="8" r="7"
            animate={{ fill: isHovered ? "#f87171" : "#dc2626" }}
            transition={{ duration: 0.2 }}
          />
          <circle cx="7" cy="6" r="2.5" fill="white" opacity="0.35" />
          <circle cx="9" cy="8" r="7" fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="0.5" />
        </svg>
        {!isHovered && (
          <div className="absolute top-4 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-foreground/10 blur-[2px]" />
        )}
      </motion.div>

      {/* Polaroid card */}
      <motion.div
        className="border border-border bg-card p-1.5 pb-8"
        style={{
          width: CARD_W,
          height: CARD_H,
          transformOrigin: "center top",
        }}
        animate={{
          scale: isHovered ? 1.12 : 1,
          boxShadow: isHovered ? shadowHover : shadowRest,
        }}
        transition={{
          scale: { duration: 0.4, ease: [0.25, 0.4, 0.25, 1] },
          boxShadow: { duration: 0.4 },
        }}
      >
        <div className="relative h-[calc(100%-1.5rem)] w-full overflow-hidden bg-background">
          <Image
            src={card.src}
            alt={card.caption}
            fill
            className="object-cover"
            sizes={isHovered ? "320px" : "140px"}
          />
        </div>
        <p
          className="mt-1.5 text-center text-[10px] italic text-muted"
          style={{ fontFamily: "Georgia, serif" }}
        >
          {card.caption}
        </p>
      </motion.div>
    </motion.div>
  );
}

export default function AboutTeaser() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="grid items-center gap-12 md:grid-cols-2">
        {/* Left: Story Polaroids */}
        <div className="relative hidden h-[400px] md:block">
          {storyCards.map((card, i) => (
            <StoryPolaroid
              key={card.caption}
              card={card}
              index={i}
            />
          ))}
        </div>

        {/* Mobile fallback: simple grid of polaroids */}
        <div className="grid grid-cols-2 gap-4 md:hidden">
          {storyCards.map((card) => (
            <div key={card.caption}>
              <div
                className="border border-border bg-card p-1.5 pb-6"
                style={{ boxShadow: shadowRest }}
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-background">
                  <Image
                    src={card.src}
                    alt={card.caption}
                    fill
                    className="object-cover"
                    sizes="160px"
                  />
                </div>
                <p
                  className="mt-1.5 text-center text-[10px] italic text-muted"
                  style={{ fontFamily: "Georgia, serif" }}
                >
                  {card.caption}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Text */}
        <div>
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
        </div>
      </div>
    </section>
  );
}
