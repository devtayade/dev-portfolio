"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { fieldNotes, getAllTags } from "@/lib/fieldnotes";
import TagFilter from "@/components/fieldnotes/TagFilter";
import NoteGrid from "@/components/fieldnotes/NoteGrid";

export default function FieldNotesClient() {
  const [activeTag, setActiveTag] = useState("All");
  const tags = getAllTags();

  const filtered =
    activeTag === "All"
      ? fieldNotes
      : fieldNotes.filter((note) => note.tags.includes(activeTag));

  return (
    <div className="mx-auto max-w-6xl px-6 pt-32 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
          Field Notes
        </h1>
        <p className="max-w-xl text-lg text-muted">
          Thoughts, observations, and lessons gathered from the field.
          Unpolished ideas, honest reflections, and things I&apos;m still
          figuring out.
        </p>
      </motion.div>

      <TagFilter tags={tags} activeTag={activeTag} onSelect={setActiveTag} />
      <NoteGrid notes={filtered} />
    </div>
  );
}
