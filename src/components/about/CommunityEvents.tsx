"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { events } from "@/lib/events";

const typeBadgeColor: Record<string, string> = {
  Speaking: "bg-indigo-500/90",
  Attending: "bg-emerald-500/90",
  Organizing: "bg-amber-500/90",
  Mentoring: "bg-rose-500/90",
};

// Duplicate events for continuous scrolling effect
const duplicatedEvents = [...events, ...events];

export default function CommunityEvents() {
  return (
    <section className="py-24 overflow-hidden">
      {/* Heading stays inside the container */}
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-12"
        >
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Beyond the Screen
          </h2>
        </motion.div>
      </div>

      {/* Full-viewport continuous carousel */}
      <div className="w-screen relative left-1/2 -translate-x-1/2">
        <motion.div
          className="flex gap-3 w-max"
          animate={{ x: ["0%", "-50%"] }}
          transition={{
            x: {
              duration: 30,
              repeat: Infinity,
              ease: "linear",
            },
          }}
        >
          {duplicatedEvents.map((event, index) => (
            <motion.div
              key={`${event.name}-${index}`}
              whileHover={{ scale: 1.05, zIndex: 10 }}
              className="relative flex-shrink-0 w-72 md:w-80"
            >
              <div className="group relative aspect-[3/2] overflow-hidden rounded-lg bg-card">
                <Image
                  src={event.photo}
                  alt={event.name}
                  fill
                  className="object-cover transition-transform duration-400 group-hover:scale-105"
                  sizes="(max-width: 768px) 288px, 320px"
                />

                {/* Hover overlay — fades in from bottom */}
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-black/0 to-transparent p-4 opacity-0 transition-opacity duration-400 group-hover:opacity-100">
                  <div className="translate-y-2 transition-transform duration-400 group-hover:translate-y-0">
                    <p className="text-sm font-bold text-white leading-tight">
                      {event.name}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white ${typeBadgeColor[event.type] ?? "bg-gray-500/90"}`}
                      >
                        {event.type}
                      </span>
                      <span className="text-xs text-white/80">
                        {event.location}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
