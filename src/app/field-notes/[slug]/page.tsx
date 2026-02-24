"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { fieldNotes } from "@/lib/fieldnotes";
import ReadingProgress from "@/components/fieldnotes/ReadingProgress";

export default function FieldNotePage() {
  const params = useParams();
  const slug = params.slug as string;
  const note = fieldNotes.find((n) => n.slug === slug);

  if (!note) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted">Note not found.</p>
      </div>
    );
  }

  // Find prev/next
  const currentIndex = fieldNotes.findIndex((n) => n.slug === slug);
  const prevNote = currentIndex > 0 ? fieldNotes[currentIndex - 1] : null;
  const nextNote =
    currentIndex < fieldNotes.length - 1 ? fieldNotes[currentIndex + 1] : null;

  // Split content into paragraphs
  const paragraphs = note.content.split("\n\n");

  return (
    <>
      <ReadingProgress />

      <article className="mx-auto max-w-3xl px-6 pt-32 pb-24">
        {/* Back link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Link
            href="/field-notes"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted transition-colors hover:text-foreground"
            data-cursor="pointer"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Back to Field Notes
          </Link>
        </motion.div>

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-12"
        >
          <div className="mb-4 flex items-center gap-3">
            {note.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent"
              >
                {tag}
              </span>
            ))}
            <span className="text-sm text-muted">{note.readingTime}</span>
          </div>
          <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight md:text-4xl lg:text-5xl">
            {note.title}
          </h1>
          <p className="text-muted">
            {new Date(note.date).toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </motion.header>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          {paragraphs.map((paragraph, i) => {
            // Handle bold headings
            if (paragraph.startsWith("**") && paragraph.endsWith("**")) {
              const text = paragraph.slice(2, -2);
              return (
                <h2
                  key={i}
                  className="mt-8 text-xl font-bold tracking-tight"
                >
                  {text}
                </h2>
              );
            }

            // Handle paragraphs with inline bold
            const parts = paragraph.split(/(\*\*.*?\*\*)/g);
            return (
              <p key={i} className="text-lg leading-relaxed text-muted">
                {parts.map((part, j) => {
                  if (part.startsWith("**") && part.endsWith("**")) {
                    return (
                      <strong key={j} className="font-semibold text-foreground">
                        {part.slice(2, -2)}
                      </strong>
                    );
                  }
                  return part;
                })}
              </p>
            );
          })}
        </motion.div>

        {/* Navigation */}
        <div className="mt-16 flex items-center justify-between border-t border-border pt-8">
          {prevNote ? (
            <Link
              href={`/field-notes/${prevNote.slug}`}
              className="group flex flex-col"
              data-cursor="pointer"
            >
              <span className="text-xs text-muted">Previous</span>
              <span className="text-sm font-medium transition-colors group-hover:text-accent">
                {prevNote.title}
              </span>
            </Link>
          ) : (
            <div />
          )}
          {nextNote ? (
            <Link
              href={`/field-notes/${nextNote.slug}`}
              className="group flex flex-col text-right"
              data-cursor="pointer"
            >
              <span className="text-xs text-muted">Next</span>
              <span className="text-sm font-medium transition-colors group-hover:text-accent">
                {nextNote.title}
              </span>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </article>
    </>
  );
}
