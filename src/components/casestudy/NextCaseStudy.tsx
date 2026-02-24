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
            whileHover={{ y: -4 }}
            className="group mx-auto max-w-lg"
          >
            <div
              className={`mb-6 h-48 rounded-2xl bg-gradient-to-br ${project.gradient} transition-shadow group-hover:shadow-2xl`}
            />
            <h3 className="mb-2 text-2xl font-bold tracking-tight transition-colors group-hover:text-accent md:text-3xl">
              {project.title}
            </h3>
            <p className="text-muted">{project.subtitle}</p>
          </motion.div>
        </Link>
      </div>
    </section>
  );
}
