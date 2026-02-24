"use client";

import { motion } from "framer-motion";
import FloatingShapes from "./FloatingShapes";
import ScrollIndicator from "./ScrollIndicator";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.3 },
  },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number] },
  },
};

export default function Hero() {
  const scrollToWork = () => {
    document.getElementById("featured-work")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden px-6">
      <FloatingShapes />

      <motion.div
        className="relative z-10 mx-auto max-w-4xl text-center"
        variants={container}
        initial="hidden"
        animate="show"
      >
        <motion.p
          className="mb-4 text-sm font-medium tracking-widest uppercase text-accent"
          variants={item}
        >
          Product Designer
        </motion.p>

        <motion.h1
          className="mb-6 text-5xl font-bold leading-tight tracking-tight md:text-7xl lg:text-8xl"
          variants={item}
        >
          Designing at the
          <br />
          <span className="bg-gradient-to-r from-accent to-purple-500 bg-clip-text text-transparent">
            intersection
          </span>
          <br />
          of AI &amp; human
          <br />
          experience
        </motion.h1>

        <motion.p
          className="mx-auto mb-10 max-w-xl text-lg text-muted md:text-xl"
          variants={item}
        >
          I craft intelligent, human-centered products that bridge the gap
          between powerful technology and delightful experiences.
        </motion.p>

        <motion.button
          onClick={scrollToWork}
          className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 text-sm font-medium text-white transition-transform hover:scale-105"
          variants={item}
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
      </motion.div>

      <ScrollIndicator />
    </section>
  );
}
