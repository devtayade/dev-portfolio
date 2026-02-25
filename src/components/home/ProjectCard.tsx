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
        <div
          className="group relative overflow-hidden rounded border border-gray-100/60 bg-white transition-all dark:border-zinc-700/30 dark:bg-zinc-100"
          style={{
            boxShadow:
              "0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.08), 0 0 0 0.5px rgba(0,0,0,0.04)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow =
              "0 4px 12px rgba(0,0,0,0.08), 0 16px 40px rgba(0,0,0,0.12), 0 0 0 0.5px rgba(0,0,0,0.06)";
            e.currentTarget.style.transform = "translateY(-3px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow =
              "0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.08), 0 0 0 0.5px rgba(0,0,0,0.04)";
            e.currentTarget.style.transform = "translateY(0)";
          }}
          onFocus={(e) => {
            e.currentTarget.style.boxShadow =
              "0 4px 12px rgba(0,0,0,0.08), 0 16px 40px rgba(0,0,0,0.12), 0 0 0 0.5px rgba(0,0,0,0.06)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow =
              "0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.08), 0 0 0 0.5px rgba(0,0,0,0.04)";
          }}
        >
          {/* Thumbnail area — polaroid-style padding */}
          <div className="p-2 pb-0">
            <div
              className={`relative h-56 w-full overflow-hidden rounded-sm bg-gradient-to-br ${project.gradient} md:h-64`}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-6xl font-bold text-white/20">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              {/* Hover overlay */}
              <div className="absolute inset-0 flex items-end bg-black/0 p-4 transition-all duration-300 group-hover:bg-black/15">
                <span className="flex items-center gap-2 rounded-full bg-white/90 px-3 py-1.5 text-xs font-medium text-gray-900 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
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
                  >
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </span>
              </div>
            </div>
          </div>

          {/* Content — polaroid bottom area */}
          <div className="p-4 pt-3">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-[10px] font-medium text-gray-500 dark:border-zinc-300 dark:bg-zinc-200 dark:text-zinc-500"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h3 className="mb-1 text-base font-bold tracking-tight text-gray-900 dark:text-gray-800">
              {project.title}
            </h3>
            <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
              {project.subtitle}
            </p>
            <div className="mt-3 flex items-center gap-2 text-[10px] text-gray-400 dark:text-gray-400">
              <span>{project.role}</span>
              <span className="text-gray-300">|</span>
              <span>{project.timeline}</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
