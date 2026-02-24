export interface FieldNote {
  slug: string;
  title: string;
  date: string;
  readingTime: string;
  tags: string[];
  excerpt: string;
  content: string;
}

export const fieldNotes: FieldNote[] = [
  {
    slug: "designing-with-ai",
    title: "Designing With AI: Lessons From the Frontier",
    date: "2026-02-20",
    readingTime: "6 min read",
    tags: ["AI"],
    excerpt:
      "After spending two years designing AI-powered products, here are the patterns I keep coming back to — and the mistakes I keep seeing teams make.",
    content: `After spending two years designing AI-powered products, I've noticed patterns that separate delightful AI experiences from frustrating ones. Here are the lessons I keep coming back to.

**1. Transparency beats accuracy**

Users don't need your AI to be perfect. They need to know when it's uncertain. The most successful AI interfaces I've designed all share one trait: they're honest about their limitations. Show confidence levels, explain reasoning, and always give users an escape hatch.

**2. Progressive disclosure is your best friend**

Don't dump everything the AI knows onto the screen at once. Start with the most relevant suggestion, and let users drill deeper if they want. This is especially important for AI-generated content — a summary first, details on demand.

**3. Design the error states first**

What happens when the AI gets it wrong? This is where most AI products fall apart. Users will forgive occasional mistakes if the recovery is graceful. Design the failure modes before the happy path.

**4. Context is everything**

An AI that understands what the user is currently doing is 10x more useful than one that responds to explicit queries. Contextual suggestions that appear at the right moment feel like magic. The same suggestions in a chatbot feel like noise.

**5. Trust is earned, not assumed**

Don't launch with an AI that does everything. Start with one thing it does really well. Let users build confidence through repeated positive experiences. Then gradually expand capabilities.

The AI design space is still young, and we're all learning. But these principles have held up across every project I've worked on. The best AI products don't try to impress users with what the AI can do — they focus on making users feel capable and in control.`,
  },
  {
    slug: "my-design-process",
    title: "My Design Process Is a Mess (And That's Okay)",
    date: "2026-02-10",
    readingTime: "4 min read",
    tags: ["Process"],
    excerpt:
      "Every portfolio shows a clean double-diamond. Reality is messier. Here's what my actual process looks like.",
    content: `Every design portfolio — including this one — presents a clean, linear process. Research leads to insights, insights lead to ideation, ideation leads to design, design leads to testing, testing leads to shipping. The double diamond, but make it aesthetic.

Here's the truth: my actual process looks nothing like that.

**The real process is loops, not lines**

I'll start with research, get excited about an insight, jump into wireframes too early, realize I'm solving the wrong problem, go back to research, discover something that changes everything, scrap the wireframes, start over with a completely different approach, and eventually arrive at something good.

**Mess doesn't mean lack of rigor**

The messy process isn't lazy — it's honest. Creativity doesn't follow a schedule. The key is having enough structure to not get lost, but enough flexibility to follow interesting threads.

My structure: I always start with a clear problem statement. I always test with real users. I always document decisions. But between those checkpoints? It's a beautiful mess.

**Why I'm telling you this**

Because I think the design industry's obsession with clean process is harmful. Junior designers think they're doing it wrong because their process doesn't look like a Medium article. Senior designers perform cleanliness in case studies while doing something entirely different in practice.

The best designers I know embrace the mess. They're comfortable with ambiguity, willing to backtrack, and honest about what worked and what didn't.

So yes, my process is a mess. And that's exactly how it should be.`,
  },
  {
    slug: "community-driven-design",
    title: "What Community Taught Me About Product Design",
    date: "2026-01-28",
    readingTime: "5 min read",
    tags: ["Community"],
    excerpt:
      "The best design insights I've had didn't come from user interviews. They came from the design community.",
    content: `Three years ago, I started attending local UX meetups. I didn't have a grand plan — I just wanted to meet other designers and learn from their experiences. What I didn't expect was how profoundly it would change how I think about design.

**Learning by teaching**

The first time I gave a talk at a meetup, I realized how many gaps were in my own understanding. Preparing to explain my design process to others forced me to examine it critically. Teaching is the best way to learn.

**Cross-pollination of ideas**

At a meetup last year, a service designer described how she maps patient journeys in healthcare. I adapted her approach for mapping AI interaction flows, and it became one of my most useful frameworks. The best ideas come from unexpected sources.

**Mentorship goes both ways**

I mentor three junior designers, and they teach me as much as I teach them. They ask "why?" about things I've accepted as convention. They bring fresh perspectives from bootcamps and courses that cover techniques I never learned. Stay open to learning from everyone.

**The community is the safety net**

When I was struggling with a particularly difficult AI design challenge, I posted about it in a design Slack group. Within hours, three designers who'd faced similar challenges shared their approaches. The community is a distributed brain trust.

**Getting involved**

If you're not part of a design community yet, start small. Attend a meetup. Join a Slack group. Comment on someone's case study. The design community is remarkably generous with knowledge and support.

My advice: don't just consume — contribute. Share your work, your failures, your questions. The community gets stronger when everyone participates.`,
  },
];

export function getAllTags(): string[] {
  const tags = new Set<string>();
  fieldNotes.forEach((note) => note.tags.forEach((tag) => tags.add(tag)));
  return Array.from(tags);
}
