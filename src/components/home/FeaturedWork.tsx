"use client";

import { motion } from "framer-motion";
import { projects } from "@/lib/projects";
import ProjectCard from "./ProjectCard";

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
          Selected Work
        </h2>
        <p className="max-w-xl text-muted">
          Each project is a chapter in my design journey — exploring how
          thoughtful design can make complex technology feel effortless.
        </p>
      </motion.div>

      <div className="flex flex-col gap-6">
        {projects.map((project, index) => (
          <ProjectCard key={project.slug} project={project} index={index} />
        ))}
      </div>
    </section>
  );
}
