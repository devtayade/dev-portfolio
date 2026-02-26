export interface CommunityEvent {
  name: string;
  type: "Speaking" | "Attending" | "Organizing" | "Mentoring";
  date: string;
  location: string;
  description: string;
  photo: string;
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
    photo: "/photos/hero-1.svg",
  },
  {
    name: "AI Product Design Summit",
    type: "Speaking",
    date: "2025-09",
    location: "New York, NY",
    description:
      "Spoke about 'Designing Trust in AI Products' — sharing frameworks from the AI Copilot redesign project.",
    photo: "/photos/hero-2.svg",
  },
  {
    name: "Local UX Meetup",
    type: "Organizing",
    date: "2025-03",
    location: "Monthly",
    description:
      "Co-organizing monthly UX meetups with 50+ designers. Topics range from research methods to career growth.",
    photo: "/photos/hero-3.svg",
  },
  {
    name: "Design Mentorship Program",
    type: "Mentoring",
    date: "2025-01",
    location: "Remote",
    description:
      "Mentoring 3 junior designers through ADPList. Focus areas: portfolio building, AI design skills, career transitions.",
    photo: "/photos/hero-4.svg",
  },
  {
    name: "Interaction 25",
    type: "Attending",
    date: "2025-02",
    location: "Milan, Italy",
    description:
      "IxDA's flagship conference. Deep dives into conversational interfaces and ethical AI design patterns.",
    photo: "/photos/hero-5.svg",
  },
  {
    name: "Design Systems London",
    type: "Speaking",
    date: "2025-11",
    location: "London, UK",
    description:
      "Talk on 'Scaling Design Systems Across 5 Product Teams' — practical lessons from the Design System Evolution project.",
    photo: "/photos/hero-6.svg",
  },
  {
    name: "HackDesign Workshop",
    type: "Mentoring",
    date: "2025-08",
    location: "Online",
    description:
      "Led a 4-week workshop on AI product design fundamentals for 20 designers transitioning into AI.",
    photo: "/photos/story-2.svg",
  },
  {
    name: "ProductCon",
    type: "Attending",
    date: "2026-01",
    location: "San Francisco, CA",
    description:
      "Product management conference with a design-heavy track. Great cross-pollination between PM and design thinking.",
    photo: "/photos/story-3.svg",
  },
];
