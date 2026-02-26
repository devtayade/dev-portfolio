"use client";

import { motion } from "framer-motion";

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

export default function Hero() {
  const scrollToWork = () => {
    document.getElementById("featured-work")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative min-h-screen overflow-hidden px-6">
      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl items-center justify-center">
        <div className="max-w-2xl text-center">
          <motion.p
            className="mb-6 text-sm font-medium tracking-[0.25em] uppercase text-accent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            Product Designer
          </motion.p>

          <h1 className="mb-8 text-3xl font-bold leading-[1.1] tracking-tight sm:text-4xl md:text-5xl lg:text-6xl">
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
            className="mx-auto mb-10 max-w-lg text-lg text-muted md:text-xl"
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
      </div>
    </section>
  );
}
