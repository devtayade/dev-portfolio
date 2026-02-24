"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Project } from "@/lib/projects";

export default function ProjectCard({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.6,
        delay: index * 0.15,
        ease: [0.25, 0.4, 0.25, 1] as [number, number, number, number],
      }}
    >
      <Link href={`/work/${project.slug}`} data-cursor="pointer">
        <motion.div
          layoutId={`project-card-${project.slug}`}
          className="group relative overflow-hidden rounded-2xl border border-border bg-card transition-shadow hover:shadow-2xl"
          whileHover={{ y: -4 }}
          transition={{ duration: 0.3 }}
        >
          {/* Thumbnail area */}
          <div
            className={`relative h-64 w-full bg-gradient-to-br ${project.gradient} md:h-80`}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl font-bold text-white/20">
                {String(index + 1).padStart(2, "0")}
              </span>
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 flex items-end bg-black/0 p-6 transition-all duration-300 group-hover:bg-black/20">
              <motion.span
                className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-gray-900 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              >
                View Case Study
                <svg
                  width="14"
                  height="14"
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
              </motion.span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="mb-3 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h3 className="mb-2 text-xl font-bold tracking-tight">
              {project.title}
            </h3>
            <p className="text-sm leading-relaxed text-muted">
              {project.subtitle}
            </p>
            <div className="mt-4 flex items-center gap-3 text-xs text-muted">
              <span>{project.role}</span>
              <span className="text-border">|</span>
              <span>{project.timeline}</span>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );
}
