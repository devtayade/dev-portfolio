"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { FieldNote } from "@/lib/fieldnotes";

export default function NoteCard({
  note,
  index,
}: {
  note: FieldNote;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Link href={`/field-notes/${note.slug}`} data-cursor="pointer">
        <div className="group h-full rounded-xl border border-border bg-card p-6 transition-all hover:border-accent/50 hover:shadow-lg">
          <div className="mb-4 flex items-center gap-3">
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent"
              >
                {tag}
              </span>
            ))}
            <span className="text-xs text-muted">{note.readingTime}</span>
          </div>
          <h3 className="mb-3 text-lg font-semibold leading-snug tracking-tight transition-colors group-hover:text-accent">
            {note.title}
          </h3>
          <p className="mb-4 text-sm leading-relaxed text-muted">
            {note.excerpt}
          </p>
          <p className="text-xs text-muted">
            {new Date(note.date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}
