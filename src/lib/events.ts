export interface CommunityEvent {
  name: string;
  type: "Speaking" | "Attending" | "Organizing" | "Mentoring";
  date: string;
  location: string;
  description: string;
  link?: string;
}

export const events: CommunityEvent[] = [
  {
    name: "Config 2025",
    type: "Attending",
    date: "2025-06",
    location: "San Francisco, CA",
    description:
      "Figma's annual design conference. Connected with design system leads from Stripe, Airbnb, and Shopify.",
  },
  {
    name: "AI Product Design Summit",
    type: "Speaking",
    date: "2025-09",
    location: "New York, NY",
    description:
      "Spoke about 'Designing Trust in AI Products' — sharing frameworks from the AI Copilot redesign project.",
  },
  {
    name: "Local UX Meetup",
    type: "Organizing",
    date: "2025-03",
    location: "Monthly",
    description:
      "Co-organizing monthly UX meetups with 50+ designers. Topics range from research methods to career growth.",
  },
  {
    name: "Design Mentorship Program",
    type: "Mentoring",
    date: "2025-01",
    location: "Remote",
    description:
      "Mentoring 3 junior designers through ADPList. Focus areas: portfolio building, AI design skills, career transitions.",
  },
  {
    name: "Interaction 25",
    type: "Attending",
    date: "2025-02",
    location: "Milan, Italy",
    description:
      "IxDA's flagship conference. Deep dives into conversational interfaces and ethical AI design patterns.",
  },
  {
    name: "Design Systems London",
    type: "Speaking",
    date: "2025-11",
    location: "London, UK",
    description:
      "Talk on 'Scaling Design Systems Across 5 Product Teams' — practical lessons from the Design System Evolution project.",
  },
  {
    name: "HackDesign Workshop",
    type: "Mentoring",
    date: "2025-08",
    location: "Online",
    description:
      "Led a 4-week workshop on AI product design fundamentals for 20 designers transitioning into AI.",
  },
  {
    name: "ProductCon",
    type: "Attending",
    date: "2026-01",
    location: "San Francisco, CA",
    description:
      "Product management conference with a design-heavy track. Great cross-pollination between PM and design thinking.",
  },
];
