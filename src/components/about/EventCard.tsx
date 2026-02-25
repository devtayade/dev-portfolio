"use client";

import { motion } from "framer-motion";
import type { CommunityEvent } from "@/lib/events";

const typeColors: Record<CommunityEvent["type"], string> = {
  Speaking: "border-indigo-200 bg-indigo-50 text-indigo-600 dark:border-indigo-300 dark:bg-indigo-100 dark:text-indigo-600",
  Attending: "border-cyan-200 bg-cyan-50 text-cyan-600 dark:border-cyan-300 dark:bg-cyan-100 dark:text-cyan-600",
  Organizing: "border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-300 dark:bg-rose-100 dark:text-rose-600",
  Mentoring: "border-amber-200 bg-amber-50 text-amber-600 dark:border-amber-300 dark:bg-amber-100 dark:text-amber-600",
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
      whileHover={{ rotate: 0, y: -3, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="group cursor-default"
    >
      <div
        className="overflow-hidden rounded border border-gray-100/60 bg-white p-2 dark:border-zinc-700/30 dark:bg-zinc-100"
        style={{
          boxShadow:
            "0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.08), 0 0 0 0.5px rgba(0,0,0,0.04)",
          transition: "box-shadow 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.boxShadow =
            "0 4px 12px rgba(0,0,0,0.08), 0 16px 40px rgba(0,0,0,0.12), 0 0 0 0.5px rgba(0,0,0,0.06)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow =
            "0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.08), 0 0 0 0.5px rgba(0,0,0,0.04)";
        }}
      >
        {/* Polaroid-style photo area */}
        <div className="mb-3 aspect-[4/3] overflow-hidden rounded-sm bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center dark:from-zinc-200 dark:to-zinc-100">
          <span className="text-3xl opacity-30">
            {event.type === "Speaking" && "\uD83C\uDFA4"}
            {event.type === "Attending" && "\uD83C\uDFAB"}
            {event.type === "Organizing" && "\uD83D\uDCCB"}
            {event.type === "Mentoring" && "\uD83E\uDDED"}
          </span>
        </div>

        {/* Content — polaroid bottom */}
        <div className="px-1.5 pb-2">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`rounded-full border px-2 py-0.5 text-[10px] font-medium ${typeColors[event.type]}`}
            >
              {event.type}
            </span>
            <span className="text-[10px] text-gray-400">{event.date}</span>
          </div>

          <h3 className="mb-1 text-sm font-bold tracking-tight text-gray-900 dark:text-gray-800">
            {event.name}
          </h3>
          <p className="mb-1.5 text-[10px] text-gray-400">{event.location}</p>
          <p className="text-xs leading-relaxed text-gray-500 dark:text-gray-400">
            {event.description}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
