"use client";

import { motion } from "framer-motion";
import type { CommunityEvent } from "@/lib/events";

const typeColors: Record<CommunityEvent["type"], string> = {
  Speaking: "bg-indigo-500/10 text-indigo-500",
  Attending: "bg-cyan-500/10 text-cyan-500",
  Organizing: "bg-rose-500/10 text-rose-500",
  Mentoring: "bg-amber-500/10 text-amber-500",
};

const rotations = [-2, 1.5, -1, 2, -1.5, 1, -2.5, 1.5];

export default function EventCard({
  event,
  index,
}: {
  event: CommunityEvent;
  index: number;
}) {
  const rotation = rotations[index % rotations.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotate: rotation }}
      whileInView={{ opacity: 1, y: 0, rotate: rotation }}
      viewport={{ once: true, amount: 0.3 }}
      whileHover={{ rotate: 0, y: -4, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="group cursor-default"
    >
      <div className="overflow-hidden rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow group-hover:shadow-xl">
        {/* Polaroid-style photo area */}
        <div className="mb-4 aspect-[4/3] rounded-lg bg-gradient-to-br from-accent/10 to-purple-500/10 flex items-center justify-center">
          <span className="text-3xl text-accent/20">
            {event.type === "Speaking" && "🎤"}
            {event.type === "Attending" && "🎫"}
            {event.type === "Organizing" && "📋"}
            {event.type === "Mentoring" && "🧭"}
          </span>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${typeColors[event.type]}`}
          >
            {event.type}
          </span>
          <span className="text-xs text-muted">{event.date}</span>
        </div>

        <h3 className="mb-1 text-base font-bold tracking-tight">
          {event.name}
        </h3>
        <p className="mb-2 text-xs text-muted">{event.location}</p>
        <p className="text-sm leading-relaxed text-muted">
          {event.description}
        </p>
      </div>
    </motion.div>
  );
}
