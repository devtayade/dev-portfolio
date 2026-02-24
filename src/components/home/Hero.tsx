"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import FloatingShapes from "./FloatingShapes";
import { projects } from "@/lib/projects";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number],
    },
  },
};

export default function Hero() {
  return (
    <section className="relative overflow-hidden">
      <FloatingShapes />

      <div className="relative z-10 mx-auto max-w-6xl px-6 pt-32 pb-16 md:pt-40 md:pb-20">
        {/* Intro text - compact */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="mb-16 max-w-3xl md:mb-20"
        >
          <motion.div
            variants={item}
            className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/50 px-4 py-1.5 text-xs font-medium text-muted backdrop-blur-sm"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
            Available for new projects
          </motion.div>

          <motion.h1
            variants={item}
            className="mb-6 text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl"
          >
            I design{" "}
            <span className="bg-gradient-to-r from-accent to-purple-500 bg-clip-text text-transparent">
              AI-powered
            </span>{" "}
            products people love using
          </motion.h1>

          <motion.p
            variants={item}
            className="max-w-xl text-lg leading-relaxed text-muted md:text-xl"
          >
            Product Designer specializing in human-AI interaction,
            design systems, and turning complex technology into
            intuitive experiences.
          </motion.p>
        </motion.div>

        {/* Featured case study previews - immediate focus */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-4 md:grid-cols-3"
        >
          {projects.map((project, index) => (
            <motion.div key={project.slug} variants={item}>
              <Link href={`/work/${project.slug}`} data-cursor="pointer">
                <motion.div
                  className="group relative overflow-hidden rounded-2xl border border-border bg-card/50 backdrop-blur-sm transition-all hover:border-accent/50 hover:shadow-xl"
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Gradient preview */}
                  <div
                    className={`h-32 w-full bg-gradient-to-br ${project.gradient} transition-transform duration-500 group-hover:scale-105 md:h-40`}
                  >
                    <div className="flex h-full items-center justify-center">
                      <span className="text-4xl font-bold text-white/20 md:text-5xl">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {project.tags.slice(0, 2).map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="mb-1 text-base font-bold tracking-tight transition-colors group-hover:text-accent">
                      {project.title}
                    </h3>
                    <p className="line-clamp-2 text-sm text-muted">
                      {project.subtitle}
                    </p>

                    <div className="mt-3 flex items-center gap-1 text-xs font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100">
                      Read case study
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </div>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
