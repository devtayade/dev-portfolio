"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Project } from "@/lib/projects";

export default function NextCaseStudy({ project }: { project: Project }) {
  return (
    <section className="border-t border-border py-16">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <p className="mb-4 text-sm font-medium tracking-widest uppercase text-muted">
          Next Chapter
        </p>
        <Link href={`/work/${project.slug}`} data-cursor="pointer">
          <motion.div
            whileHover={{ y: -3 }}
            className="group mx-auto max-w-lg"
          >
            <div
              className="mb-6 overflow-hidden rounded border border-gray-100/60 bg-white p-2 dark:border-zinc-700/30 dark:bg-zinc-100"
              style={{
                boxShadow:
                  "0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.08), 0 0 0 0.5px rgba(0,0,0,0.04)",
                transition: "box-shadow 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(0,0,0,0.08), 0 16px 40px rgba(0,0,0,0.12), 0 0 0 0.5px rgba(0,0,0,0.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.08), 0 0 0 0.5px rgba(0,0,0,0.04)";
              }}
            >
              <div
                className={`h-44 rounded-sm bg-gradient-to-br ${project.gradient}`}
              />
            </div>
            <h3 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 transition-colors group-hover:text-accent dark:text-foreground md:text-3xl">
              {project.title}
            </h3>
            <p className="text-gray-500 dark:text-muted">{project.subtitle}</p>
          </motion.div>
        </Link>
      </div>
    </section>
  );
}
