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
    accent: "from-fuchsia-50 to-purple-50/50",
  },
  {
    slug: "my-design-process",
    title: "My Design Process Is a Mess (And That's Okay)",
    date: "2026-02-10",
    readingTime: "4 min read",
    tag: "Process",
    accent: "from-teal-50 to-emerald-50/50",
  },
  {
    slug: "community-driven-design",
    title: "What Community Taught Me About Product Design",
    date: "2026-01-28",
    readingTime: "5 min read",
    tag: "Community",
    accent: "from-orange-50 to-amber-50/50",
  },
];

const shadowRest = "0 2px 16px rgba(0,0,0,0.04), 0 1px 3px rgba(0,0,0,0.02)";
const shadowHover = "0 20px 48px rgba(0,0,0,0.08), 0 8px 20px rgba(0,0,0,0.04)";

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
            aria-hidden="true"
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
              <div
                className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all duration-300"
                style={{
                  boxShadow: shadowRest,
                  transition:
                    "box-shadow 0.35s cubic-bezier(0.25, 0.4, 0.25, 1), transform 0.35s cubic-bezier(0.25, 0.4, 0.25, 1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = shadowHover;
                  e.currentTarget.style.transform = "translateY(-4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = shadowRest;
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {/* Subtle gradient accent */}
                <div
                  className={`pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br opacity-60 ${post.accent}`}
                />

                <div className="relative">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="rounded-full border border-border bg-card px-2.5 py-0.5 text-[10px] font-medium text-muted">
                      {post.tag}
                    </span>
                    <span className="text-[10px] text-muted/70">
                      {post.readingTime}
                    </span>
                  </div>
                  <h3 className="mb-2 text-base font-semibold leading-snug tracking-tight text-foreground transition-colors group-hover:text-accent">
                    {post.title}
                  </h3>
                  <p className="text-[10px] text-muted/70">
                    {new Date(post.date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>
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
            aria-hidden="true"
          >
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
          </svg>
        </Link>
      </div>
    </section>
  );
}
