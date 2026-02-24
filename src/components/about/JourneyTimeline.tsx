"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const milestones = [
  {
    year: "2019",
    title: "Started in UX Design",
    description:
      "Fell in love with understanding users. First role as a junior UX designer at a startup, learning by doing.",
  },
  {
    year: "2020",
    title: "Design Systems Deep Dive",
    description:
      "Led my first design system project. Discovered the power of systematic thinking in design.",
  },
  {
    year: "2021",
    title: "Senior Product Designer",
    description:
      "Stepped into a senior role. Started leading end-to-end product design for complex B2B workflows.",
  },
  {
    year: "2022",
    title: "Discovered AI Design",
    description:
      "First project integrating AI into product workflows. Realized this was the future of product design.",
  },
  {
    year: "2023",
    title: "AI Product Specialist",
    description:
      "Focused entirely on AI-powered products. Developed frameworks for trust, transparency, and human-AI interaction.",
  },
  {
    year: "2024",
    title: "Speaking & Community",
    description:
      "Started sharing knowledge through talks and mentoring. Building the AI design community.",
  },
  {
    year: "2025",
    title: "Leading AI Design",
    description:
      "Leading design for AI-first products, mentoring designers, and pushing the boundaries of human-AI experiences.",
  },
];

export default function JourneyTimeline() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 80%", "end 20%"],
  });
  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section ref={containerRef} className="mx-auto max-w-4xl px-6 py-24">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-16 text-center text-3xl font-bold tracking-tight md:text-4xl"
      >
        The Journey So Far
      </motion.h2>

      <div className="relative">
        {/* Static line (background) */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border md:left-1/2 md:-translate-x-1/2" />

        {/* Animated line (fills on scroll) */}
        <motion.div
          className="absolute left-4 top-0 w-0.5 bg-accent md:left-1/2 md:-translate-x-1/2"
          style={{ height: lineHeight }}
        />

        {/* Milestones */}
        <div className="space-y-12">
          {milestones.map((milestone, index) => {
            const isLeft = index % 2 === 0;

            return (
              <motion.div
                key={milestone.year}
                initial={{ opacity: 0, x: isLeft ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.5 }}
                transition={{ duration: 0.5 }}
                className={`relative flex items-start gap-8 pl-12 md:pl-0 ${
                  isLeft ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                {/* Content */}
                <div
                  className={`flex-1 ${
                    isLeft ? "md:text-right md:pr-12" : "md:text-left md:pl-12"
                  }`}
                >
                  <span className="text-sm font-bold text-accent">
                    {milestone.year}
                  </span>
                  <h3 className="mt-1 text-xl font-bold tracking-tight">
                    {milestone.title}
                  </h3>
                  <p className="mt-2 text-muted">{milestone.description}</p>
                </div>

                {/* Dot */}
                <div className="absolute left-4 top-1 flex h-4 w-4 -translate-x-1/2 items-center justify-center md:left-1/2">
                  <div className="h-3 w-3 rounded-full bg-accent ring-4 ring-background" />
                </div>

                {/* Spacer for other side */}
                <div className="hidden flex-1 md:block" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
