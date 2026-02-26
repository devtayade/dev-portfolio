"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const milestones = [
  {
    year: "2025 — Present",
    title: "Design Lead",
    role: "Design Lead",
    company: "Aether Labs",
    description:
      "Leading design for AI-first products, mentoring designers, and pushing the boundaries of human-AI experiences.",
  },
  {
    year: "2024",
    title: "Speaker & Mentor",
    role: "Speaker & Mentor",
    company: "Independent",
    description:
      "Started sharing knowledge through talks and mentoring. Building the AI design community.",
  },
  {
    year: "2022 — 2023",
    title: "Product Designer",
    role: "Product Designer",
    company: "Synth AI",
    description:
      "Focused entirely on AI-powered products. Developed frameworks for trust, transparency, and human-AI interaction.",
  },
  {
    year: "2021",
    title: "Senior Designer",
    role: "Senior Designer",
    company: "Clearpath Analytics",
    description:
      "Stepped into a senior role. Leading end-to-end product design for complex B2B workflows.",
  },
  {
    year: "2020",
    title: "Design Systems Lead",
    role: "Design Systems Lead",
    company: "Nebula Software",
    description:
      "Led my first design system project. Discovered the power of systematic thinking in design.",
  },
  {
    year: "2019",
    title: "Junior UX Designer",
    role: "Junior UX Designer",
    company: "Launchpad Studios",
    description:
      "Fell in love with understanding users. First role as a junior UX designer at a startup.",
  },
];

const easeCustom = [0.25, 0.4, 0.25, 1] as const;

function TimelineRow({
  milestone,
  index,
}: {
  milestone: (typeof milestones)[number];
  index: number;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="border-b border-border"
    >
      <div
        className="flex cursor-pointer items-center justify-between py-5"
        data-cursor="pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsExpanded((prev) => !prev)}
      >
        {/* Left: Company + Role */}
        <div className="relative min-h-[28px] flex-1 overflow-hidden">
          {/* Default state */}
          <motion.div
            className="flex items-baseline gap-3"
            animate={{
              y: isHovered ? -28 : 0,
              opacity: isHovered ? 0 : 1,
            }}
            transition={{ duration: 0.25, ease: easeCustom }}
          >
            <span className="text-base font-bold tracking-tight md:text-lg">
              {milestone.company}
            </span>
            <span className="hidden text-sm text-muted sm:inline">
              {milestone.role}
            </span>
          </motion.div>

          {/* Hover state */}
          <motion.div
            className="absolute inset-0 flex items-baseline gap-1"
            animate={{
              y: isHovered ? 0 : 28,
              opacity: isHovered ? 1 : 0,
            }}
            transition={{ duration: 0.25, ease: easeCustom }}
          >
            <span className="text-base font-bold tracking-tight text-accent md:text-lg">
              My Work
            </span>
            <span className="text-base text-muted/50 md:text-lg">
              @
            </span>
            <span className="text-base font-bold tracking-tight text-foreground md:text-lg">
              {milestone.company}
            </span>
          </motion.div>
        </div>

        {/* Right: Year + Arrow */}
        <div className="flex items-center gap-3">
          <motion.span
            className="font-mono text-xs"
            animate={{
              color: isHovered
                ? "var(--color-accent)"
                : "var(--color-muted)",
            }}
            transition={{ duration: 0.25, ease: easeCustom }}
          >
            {milestone.year}
          </motion.span>

          {/* Arrow */}
          <motion.svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-accent"
            animate={{
              opacity: isHovered ? 1 : 0,
              x: isHovered ? 0 : -8,
            }}
            transition={{ duration: 0.25, ease: easeCustom }}
          >
            <path
              d="M1 7h12M8 2l5 5-5 5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="square"
              strokeLinejoin="miter"
            />
          </motion.svg>
        </div>
      </div>

      {/* Expandable description */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: easeCustom }}
            className="overflow-hidden"
          >
            <p className="max-w-xl pb-5 text-sm leading-relaxed text-muted">
              {milestone.description}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function JourneyTimeline() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
          The Journey So Far
        </h2>
      </motion.div>

      {/* Stacked resume rows */}
      <div className="border-t border-border">
        {milestones.map((milestone, index) => (
          <TimelineRow
            key={milestone.company}
            milestone={milestone}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}
