"use client";

import { motion } from "framer-motion";

export default function PullQuote({
  quote,
  attribution,
}: {
  quote: string;
  attribution?: string;
}) {
  return (
    <motion.blockquote
      initial={{ opacity: 0, x: -20 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.5 }}
      transition={{ duration: 0.6 }}
      className="my-12 border-l-4 border-accent py-4 pl-6"
    >
      <p className="text-xl font-medium leading-relaxed text-foreground md:text-2xl">
        &ldquo;{quote}&rdquo;
      </p>
      {attribution && (
        <footer className="mt-3 text-sm text-muted">
          &mdash; {attribution}
        </footer>
      )}
    </motion.blockquote>
  );
}
