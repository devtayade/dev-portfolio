"use client";

const skills = [
  "AI Product Design",
  "LLM UX Patterns",
  "Prompt Design",
  "Conversational UI",
  "Human-AI Interaction",
  "Design Systems",
  "User Research",
  "Prototyping",
  "Interaction Design",
  "Design Strategy",
];

export default function AIMarquee() {
  const doubled = [...skills, ...skills];

  return (
    <section className="relative overflow-hidden border-y border-border py-6">
      {/* Fade edges */}
      <div className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-background to-transparent" />
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-background to-transparent" />

      <div className="animate-marquee flex w-max items-center gap-4">
        {doubled.map((skill, i) => (
          <span key={i} className="flex items-center gap-4">
            <span className="whitespace-nowrap rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:border-accent hover:text-accent">
              {skill}
            </span>
            <span className="text-muted/40">&#x2022;</span>
          </span>
        ))}
      </div>
    </section>
  );
}
