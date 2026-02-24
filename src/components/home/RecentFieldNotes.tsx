"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const placeholderPosts = [
  {
    slug: "designing-with-ai",
    title: "Designing With AI: Lessons From the Frontier",
    date: "2026-02-20",
    readingTime: "6 min read",
    tag: "AI",
  },
  {
    slug: "my-design-process",
    title: "My Design Process Is a Mess (And That's Okay)",
    date: "2026-02-10",
    readingTime: "4 min read",
    tag: "Process",
  },
  {
    slug: "community-driven-design",
    title: "What Community Taught Me About Product Design",
    date: "2026-01-28",
    readingTime: "5 min read",
    tag: "Community",
  },
];

export default function RecentFieldNotes() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-12 flex items-end justify-between"
      >
        <div>
          <h2 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl">
            Field Notes
          </h2>
          <p className="text-muted">
            Thoughts, observations, and lessons from the field.
          </p>
        </div>
        <Link
          href="/field-notes"
          className="hidden items-center gap-2 text-sm font-medium text-accent transition-all hover:gap-3 md:inline-flex"
          data-cursor="pointer"
        >
          Read all notes
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
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-3">
        {placeholderPosts.map((post, index) => (
          <motion.div
            key={post.slug}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Link href={`/field-notes/${post.slug}`} data-cursor="pointer">
              <div className="group rounded-xl border border-border bg-card p-6 transition-all hover:border-accent/50 hover:shadow-lg">
                <div className="mb-4 flex items-center gap-3">
                  <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
                    {post.tag}
                  </span>
                  <span className="text-xs text-muted">{post.readingTime}</span>
                </div>
                <h3 className="mb-3 text-lg font-semibold leading-snug tracking-tight transition-colors group-hover:text-accent">
                  {post.title}
                </h3>
                <p className="text-sm text-muted">
                  {new Date(post.date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="mt-8 text-center md:hidden">
        <Link
          href="/field-notes"
          className="inline-flex items-center gap-2 text-sm font-medium text-accent"
          data-cursor="pointer"
        >
          Read all notes
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
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
