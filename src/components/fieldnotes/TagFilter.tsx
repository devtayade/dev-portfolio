"use client";

import { motion } from "framer-motion";

export default function TagFilter({
  tags,
  activeTag,
  onSelect,
}: {
  tags: string[];
  activeTag: string;
  onSelect: (tag: string) => void;
}) {
  const allTags = ["All", ...tags];

  return (
    <div className="mb-10 flex flex-wrap gap-2">
      {allTags.map((tag) => (
        <button
          key={tag}
          onClick={() => onSelect(tag)}
          className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            activeTag === tag
              ? "text-white"
              : "text-muted hover:text-foreground"
          }`}
          data-cursor="pointer"
        >
          {activeTag === tag && (
            <motion.div
              layoutId="note-tag-filter"
              className="absolute inset-0 rounded-full bg-accent"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <span className="relative z-10">{tag}</span>
        </button>
      ))}
    </div>
  );
}
