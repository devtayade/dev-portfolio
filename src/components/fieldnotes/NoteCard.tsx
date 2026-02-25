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
        <div
          className="group h-full rounded border border-gray-100/60 bg-white p-5 transition-all dark:border-zinc-700/30 dark:bg-zinc-100"
          style={{
            boxShadow:
              "0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.08), 0 0 0 0.5px rgba(0,0,0,0.04)",
            transition: "box-shadow 0.3s ease, transform 0.3s ease",
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
        >
          <div className="mb-3 flex items-center gap-2">
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-[10px] font-medium text-gray-500 dark:border-zinc-300 dark:bg-zinc-200 dark:text-zinc-500"
              >
                {tag}
              </span>
            ))}
            <span className="text-[10px] text-gray-400">{note.readingTime}</span>
          </div>
          <h3 className="mb-2 text-base font-semibold leading-snug tracking-tight text-gray-900 transition-colors group-hover:text-accent dark:text-gray-800">
            {note.title}
          </h3>
          <p className="mb-3 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
            {note.excerpt}
          </p>
          <p className="text-[10px] text-gray-400">
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
