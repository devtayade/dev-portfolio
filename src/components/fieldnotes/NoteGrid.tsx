"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { FieldNote } from "@/lib/fieldnotes";
import NoteCard from "./NoteCard";

export default function NoteGrid({ notes }: { notes: FieldNote[] }) {
  return (
    <motion.div layout className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <AnimatePresence mode="popLayout">
        {notes.map((note, index) => (
          <motion.div
            key={note.slug}
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            <NoteCard note={note} index={index} />
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}
