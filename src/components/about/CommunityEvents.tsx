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

export default function CommunityEvents() {
  return (
    <section className="py-24">
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

      {/* Full-viewport carousel — breaks out of max-w-6xl */}
      <div className="w-screen relative left-1/2 -translate-x-1/2">
        <div className="scrollbar-hide flex gap-3 overflow-x-auto px-6 pb-4 md:px-12">
          {events.map((event, index) => (
            <motion.div
              key={event.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ scale: 1.05, zIndex: 10 }}
              className="relative flex-shrink-0 w-72 md:w-80"
            >
              <div className="group relative aspect-[3/2] overflow-hidden rounded-lg bg-card">
                {/* Photo — blurred at rest */}
                <Image
                  src={event.photo}
                  alt={event.name}
                  fill
                  className="object-cover brightness-90 blur-[4px] transition-[filter,transform] duration-400 group-hover:brightness-100 group-hover:blur-0 group-hover:scale-105"
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
        </div>
      </div>
    </section>
  );
}
