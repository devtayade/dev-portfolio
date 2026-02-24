"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const socialLinks = [
  { label: "LinkedIn", href: "https://linkedin.com", icon: "in" },
  { label: "Dribbble", href: "https://dribbble.com", icon: "Dr" },
  { label: "Twitter", href: "https://twitter.com", icon: "X" },
  { label: "GitHub", href: "https://github.com", icon: "GH" },
];

export default function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 py-16">
        {/* CTA Section */}
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
            Let&apos;s write the next chapter together
          </h2>
          <p className="mb-6 text-muted">
            Got a story to tell? I&apos;d love to help design it.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-white transition-transform hover:scale-105"
            data-cursor="pointer"
          >
            Get in touch
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>

        {/* Bottom row */}
        <div className="flex flex-col items-center justify-between gap-6 border-t border-border pt-8 md:flex-row">
          <div className="flex items-center gap-6">
            {socialLinks.map((social) => (
              <motion.a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-xs font-bold text-muted transition-colors hover:border-accent hover:text-accent"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                data-cursor="pointer"
                aria-label={social.label}
              >
                {social.icon}
              </motion.a>
            ))}
          </div>

          <div className="flex items-center gap-4 text-sm text-muted">
            <a
              href="mailto:hello@example.com"
              className="transition-colors hover:text-foreground"
              data-cursor="pointer"
            >
              hello@example.com
            </a>
            <span>|</span>
            <a
              href="/resume.pdf"
              download
              className="transition-colors hover:text-foreground"
              data-cursor="pointer"
            >
              Resume
            </a>
          </div>

          <p className="text-sm text-muted">
            &copy; {new Date().getFullYear()} All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
