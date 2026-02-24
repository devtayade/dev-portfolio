"use client";

import { motion } from "framer-motion";

const skillCategories = [
  {
    category: "Design",
    skills: [
      "UI Design",
      "UX Design",
      "Interaction Design",
      "Visual Design",
      "Prototyping",
      "Design Systems",
    ],
  },
  {
    category: "Research",
    skills: [
      "User Interviews",
      "Usability Testing",
      "Survey Design",
      "Data Analysis",
      "Competitive Analysis",
      "Journey Mapping",
    ],
  },
  {
    category: "AI / ML",
    skills: [
      "AI Product Design",
      "LLM UX Patterns",
      "Prompt Engineering",
      "Conversational UI",
      "Trust Design",
      "Human-AI Interaction",
    ],
  },
  {
    category: "Tools",
    skills: [
      "Figma",
      "Framer",
      "Protopie",
      "Maze",
      "Notion",
      "Miro",
    ],
  },
];

export default function SkillsGrid() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-12 text-3xl font-bold tracking-tight md:text-4xl"
      >
        Skills & Tools
      </motion.h2>

      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        {skillCategories.map((cat, catIndex) => (
          <motion.div
            key={cat.category}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: catIndex * 0.1 }}
          >
            <h3 className="mb-4 text-sm font-bold tracking-widest uppercase text-accent">
              {cat.category}
            </h3>
            <div className="flex flex-wrap gap-2">
              {cat.skills.map((skill) => (
                <motion.span
                  key={skill}
                  whileHover={{
                    scale: 1.05,
                    backgroundColor: "var(--accent)",
                    color: "#ffffff",
                  }}
                  className="rounded-full border border-border px-3 py-1.5 text-sm text-muted transition-colors"
                >
                  {skill}
                </motion.span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
