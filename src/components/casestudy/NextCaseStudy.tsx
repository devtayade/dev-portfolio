"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { Project } from "@/lib/projects";

const shadowRest = "0 2px 16px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02)";
const shadowHover = "0 20px 48px rgba(0,0,0,0.08), 0 8px 20px rgba(0,0,0,0.04)";

export default function NextCaseStudy({ project }: { project: Project }) {
  return (
    <section className="border-t border-border py-16">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted">
          Next Chapter
        </p>
        <Link href={`/work/${project.slug}`} data-cursor="pointer">
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ duration: 0.3 }}
            className="group mx-auto max-w-lg"
          >
            <div
              className="mb-6 overflow-hidden rounded-2xl border border-border bg-card p-2.5"
              style={{
                boxShadow: shadowRest,
                transition: "box-shadow 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = shadowHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = shadowRest;
              }}
            >
              <div
                className={`relative h-44 overflow-hidden rounded-xl bg-gradient-to-br ${project.gradientLight}`}
              />
            </div>
            <h3 className="mb-2 text-2xl font-bold tracking-tight text-foreground transition-colors group-hover:text-accent md:text-3xl">
              {project.title}
            </h3>
            <p className="text-muted">{project.subtitle}</p>
          </motion.div>
        </Link>
      </div>
    </section>
  );
}
