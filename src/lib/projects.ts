export interface Project {
  slug: string;
  title: string;
  subtitle: string;
  role: string;
  tags: string[];
  gradient: string;
  gradientLight: string;
  color: string;
  timeline: string;
  team: string;
}

export const projects: Project[] = [
  {
    slug: "ai-copilot-redesign",
    title: "AI Copilot Redesign",
    subtitle:
      "Reimagining the AI assistant experience for a B2B SaaS platform — from confusing chatbot to intuitive copilot.",
    role: "Lead Product Designer",
    tags: ["AI", "B2B SaaS", "UX Research"],
    gradient: "from-fuchsia-500/30 via-purple-900/50 to-zinc-950",
    gradientLight: "from-fuchsia-100 via-purple-50 to-white",
    color: "#d946ef",
    timeline: "3 months",
    team: "4 engineers, 1 PM, 1 researcher",
  },
  {
    slug: "conversational-commerce",
    title: "Conversational Commerce",
    subtitle:
      "Designing a natural language shopping experience powered by LLMs — making AI feel like a knowledgeable friend.",
    role: "Senior Product Designer",
    tags: ["AI", "Mobile", "Conversational UI"],
    gradient: "from-teal-500/30 via-emerald-900/40 to-zinc-950",
    gradientLight: "from-teal-100 via-emerald-50 to-white",
    color: "#14b8a6",
    timeline: "4 months",
    team: "6 engineers, 2 PMs, 1 data scientist",
  },
  {
    slug: "design-system-evolution",
    title: "Design System Evolution",
    subtitle:
      "Scaling a design system from 12 to 120 components while maintaining coherence across 5 product teams.",
    role: "Design System Lead",
    tags: ["Design Systems", "Leadership", "Tooling"],
    gradient: "from-blue-500/30 via-indigo-900/50 to-zinc-950",
    gradientLight: "from-blue-100 via-indigo-50 to-white",
    color: "#3b82f6",
    timeline: "6 months",
    team: "3 designers, 2 engineers",
  },
];
