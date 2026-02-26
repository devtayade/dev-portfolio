"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Project } from "@/lib/projects";

const shadowRest = "0 2px 16px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02)";
const shadowHover = "0 20px 48px rgba(0,0,0,0.08), 0 8px 20px rgba(0,0,0,0.04)";

export default function ProjectCard({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{
        duration: 0.6,
        delay: index * 0.12,
        ease: [0.25, 0.4, 0.25, 1],
      }}
    >
      <Link href={`/work/${project.slug}`} data-cursor="pointer">
        <div
          className="group relative flex flex-col overflow-hidden border border-border bg-card transition-all duration-300 sm:flex-row"
          style={{
            boxShadow: shadowRest,
            transition:
              "box-shadow 0.35s cubic-bezier(0.25, 0.4, 0.25, 1), transform 0.35s cubic-bezier(0.25, 0.4, 0.25, 1)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = shadowHover;
            e.currentTarget.style.transform = "translateY(-4px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = shadowRest;
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          {/* Thumbnail */}
          <div className="p-3 pb-0 sm:p-3 sm:pr-0 sm:flex-shrink-0">
            <div
              className={`relative h-48 w-full overflow-hidden bg-gradient-to-br sm:h-full sm:w-64 md:w-80 ${project.gradientLight}`}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-6xl font-bold text-foreground/[0.06]">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 flex items-end bg-black/0 p-4 transition-all duration-300 group-hover:bg-black/15">
                <span className="flex items-center gap-2 bg-white/90 px-3 py-1.5 text-xs font-medium text-foreground opacity-0 backdrop-blur-sm transition-opacity duration-300 group-hover:opacity-100">
                  View Case Study
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
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col justify-center p-5 sm:p-6">
            <div className="mb-3 flex flex-wrap gap-1.5">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="border border-border bg-card px-2.5 py-0.5 text-[10px] font-medium text-muted"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h3 className="mb-2 text-lg font-bold tracking-tight text-foreground sm:text-xl">
              {project.title}
            </h3>
            <p className="mb-4 text-sm leading-relaxed text-muted">
              {project.subtitle}
            </p>
            <div className="flex items-center gap-3 text-xs text-muted/70">
              <span>{project.role}</span>
              <span className="text-border">|</span>
              <span>{project.timeline}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
