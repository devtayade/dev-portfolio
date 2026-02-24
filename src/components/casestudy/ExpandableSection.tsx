"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ExpandableSection({
  title,
  number,
  summary,
  children,
  isFullMode,
}: {
  title: string;
  number: number;
  summary: string;
  children: React.ReactNode;
  isFullMode: boolean;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const showFull = isFullMode || isExpanded;

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5 }}
      className="border-b border-border py-12"
    >
      <div className="mb-6 flex items-baseline gap-4">
        <span className="text-sm font-bold text-accent">
          {String(number).padStart(2, "0")}
        </span>
        <h2 className="text-2xl font-bold tracking-tight md:text-3xl">
          {title}
        </h2>
      </div>

      {/* Summary always visible */}
      <p className="mb-6 text-lg leading-relaxed text-muted">{summary}</p>

      {/* Full content */}
      <AnimatePresence>
        {showFull && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="prose prose-lg max-w-none text-foreground prose-headings:text-foreground prose-p:text-muted prose-strong:text-foreground prose-a:text-accent">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expand toggle (only in quick mode) */}
      {!isFullMode && !isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="mt-4 flex items-center gap-2 text-sm font-medium text-accent transition-all hover:gap-3"
          data-cursor="pointer"
        >
          Read the full story
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      )}

      {!isFullMode && isExpanded && (
        <button
          onClick={() => setIsExpanded(false)}
          className="mt-4 flex items-center gap-2 text-sm font-medium text-muted transition-all hover:gap-3 hover:text-foreground"
          data-cursor="pointer"
        >
          Collapse
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>
      )}
    </motion.section>
  );
}
