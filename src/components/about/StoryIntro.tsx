"use client";

import Image from "next/image";
import { motion } from "framer-motion";

export default function StoryIntro() {
  return (
    <section className="mx-auto max-w-6xl px-6 pt-32 pb-24">
      <div className="grid items-center gap-12 md:grid-cols-2">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4 text-sm font-medium tracking-widest uppercase text-accent"
          >
            My Story
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-6 text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl"
          >
            Design is how I
            <br />
            <span className="bg-gradient-to-r from-accent to-purple-500 bg-clip-text text-transparent">
              make sense
            </span>
            <br />
            of the world
          </motion.h1>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4 text-lg leading-relaxed text-muted"
          >
            <p>
              I didn&apos;t start in design. I started by being endlessly curious
              about why things work the way they do — and frustrated when they
              didn&apos;t work well.
            </p>
            <p>
              That curiosity led me from tinkering with interfaces to studying
              human behavior, from building prototypes to leading product
              teams, and from traditional UX to the frontier of AI-powered
              experiences.
            </p>
            <p>
              Today, I design at the intersection of artificial intelligence and
              human experience — making powerful technology feel simple,
              trustworthy, and genuinely delightful.
            </p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="aspect-[3/4] overflow-hidden border border-border bg-card"
        >
          <Image
            src="/photos/story-1.svg"
            alt="Portrait photo"
            fill={false}
            width={600}
            height={800}
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="h-full w-full object-cover"
          />
        </motion.div>
      </div>
    </section>
  );
}
