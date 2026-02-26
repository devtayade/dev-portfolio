"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import type { FieldNote } from "@/lib/fieldnotes";

const shadowRest = "0 2px 12px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02)";
const shadowHover = "0 14px 32px rgba(0,0,0,0.07), 0 4px 12px rgba(0,0,0,0.04)";

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
        <div
          className="group h-full rounded-md border border-border bg-card p-5 transition-all"
          style={{
            boxShadow: shadowRest,
            transition: "box-shadow 0.35s cubic-bezier(0.25, 0.4, 0.25, 1), transform 0.35s cubic-bezier(0.25, 0.4, 0.25, 1)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = shadowHover;
            e.currentTarget.style.transform = "translateY(-3px)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = shadowRest;
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <div className="mb-3 flex items-center gap-2">
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-border bg-background px-2.5 py-0.5 text-[10px] font-medium text-muted"
              >
                {tag}
              </span>
            ))}
            <span className="text-[10px] text-muted">{note.readingTime}</span>
          </div>
          <h3 className="mb-2 text-base font-semibold leading-snug tracking-tight text-foreground transition-colors group-hover:text-accent">
            {note.title}
          </h3>
          <p className="mb-3 text-xs leading-relaxed text-muted">
            {note.excerpt}
          </p>
          <p className="text-[10px] text-muted/70">
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
