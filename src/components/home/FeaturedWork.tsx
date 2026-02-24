"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { projects } from "@/lib/projects";

export default function FeaturedWork() {
  return (
    <section id="featured-work" className="mx-auto max-w-6xl px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-16"
      >
        <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
          Case Studies
        </h2>
        <p className="max-w-xl text-muted">
          Deep dives into how thoughtful design and research turned
          complex challenges into products people love.
        </p>
      </motion.div>

      <div className="space-y-8">
        {projects.map((project, index) => (
          <motion.div
            key={project.slug}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: 0.6,
              delay: index * 0.1,
              ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number],
            }}
          >
            <Link href={`/work/${project.slug}`} data-cursor="pointer">
              <div className="group grid overflow-hidden rounded-2xl border border-border bg-card transition-all hover:border-accent/30 hover:shadow-2xl md:grid-cols-2">
                {/* Left: gradient visual */}
                <div
                  className={`relative h-56 bg-gradient-to-br ${project.gradient} transition-transform duration-700 group-hover:scale-[1.02] md:h-auto md:min-h-[320px] ${
                    index % 2 === 1 ? "md:order-2" : ""
                  }`}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-7xl font-bold text-white/10 md:text-9xl">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                  </div>
                  {/* Hover arrow */}
                  <div className="absolute bottom-4 right-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/20 opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <line x1="7" y1="17" x2="17" y2="7" />
                      <polyline points="7 7 17 7 17 17" />
                    </svg>
                  </div>
                </div>

                {/* Right: content */}
                <div
                  className={`flex flex-col justify-center p-8 md:p-10 ${
                    index % 2 === 1 ? "md:order-1" : ""
                  }`}
                >
                  <div className="mb-4 flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <h3 className="mb-3 text-2xl font-bold tracking-tight transition-colors group-hover:text-accent md:text-3xl">
                    {project.title}
                  </h3>

                  <p className="mb-6 leading-relaxed text-muted">
                    {project.subtitle}
                  </p>

                  <div className="flex items-center gap-4 text-sm text-muted">
                    <span>{project.role}</span>
                    <span className="text-border">|</span>
                    <span>{project.timeline}</span>
                  </div>

                  <div className="mt-6 flex items-center gap-2 text-sm font-medium text-accent">
                    Read full case study
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    >
                      <line x1="5" y1="12" x2="19" y2="12" />
                      <polyline points="12 5 19 12 12 19" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
