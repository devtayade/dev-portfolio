"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function AboutTeaser() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="grid items-center gap-12 md:grid-cols-2">
        {/* Photo */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-gradient-to-br from-accent/20 to-purple-500/20">
            {/* Placeholder for photo */}
            <div className="absolute inset-0 flex items-center justify-center text-6xl text-accent/30">
              &#x1f4f7;
            </div>
          </div>
          {/* Decorative element */}
          <div className="absolute -bottom-4 -right-4 -z-10 h-full w-full rounded-2xl border-2 border-accent/20" />
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h2 className="mb-6 text-3xl font-bold tracking-tight md:text-4xl">
            The story behind
            <br />
            the designs
          </h2>
          <p className="mb-4 text-lg leading-relaxed text-muted">
            I believe great design is invisible — it gets out of the way and
            lets people do what they came to do. But getting there? That takes
            deep curiosity, relentless iteration, and a genuine love for
            understanding people.
          </p>
          <p className="mb-8 text-lg leading-relaxed text-muted">
            From AI-powered products to design systems that scale, every project
            starts with the same question: <em>how can we make this feel human?</em>
          </p>
          <Link
            href="/about"
            className="inline-flex items-center gap-2 text-sm font-medium text-accent transition-all hover:gap-3"
            data-cursor="pointer"
          >
            Read my story
            <svg
              width="16"
              height="16"
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
      </div>
    </section>
  );
}
