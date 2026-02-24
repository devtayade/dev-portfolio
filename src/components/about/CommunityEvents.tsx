"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { events, type CommunityEvent } from "@/lib/events";
import EventCard from "./EventCard";

const filters: ("All" | CommunityEvent["type"])[] = [
  "All",
  "Speaking",
  "Attending",
  "Organizing",
  "Mentoring",
];

export default function CommunityEvents() {
  const [activeFilter, setActiveFilter] = useState<string>("All");

  const filtered =
    activeFilter === "All"
      ? events
      : events.filter((e) => e.type === activeFilter);

  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="mb-12"
      >
        <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
          Beyond the Screen
        </h2>
        <p className="max-w-xl text-muted">
          Design doesn&apos;t happen in isolation. I learn, share, and grow
          through the incredible design community.
        </p>
      </motion.div>

      {/* Filter tabs */}
      <div className="mb-10 flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeFilter === filter
                ? "text-white"
                : "text-muted hover:text-foreground"
            }`}
            data-cursor="pointer"
          >
            {activeFilter === filter && (
              <motion.div
                layoutId="event-filter"
                className="absolute inset-0 rounded-full bg-accent"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative z-10">{filter}</span>
          </button>
        ))}
      </div>

      {/* Events grid */}
      <motion.div layout className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((event, index) => (
            <motion.div
              key={event.name}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <EventCard event={event} index={index} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>
    </section>
  );
}
