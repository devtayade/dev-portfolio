export interface CaseStudySection {
  title: string;
  summary: string;
  content: string;
}

export interface CaseStudyContent {
  slug: string;
  sections: CaseStudySection[];
  pullQuotes: { quote: string; attribution?: string; afterSection: number }[];
}

export const caseStudyContent: CaseStudyContent[] = [
  {
    slug: "ai-copilot-redesign",
    sections: [
      {
        title: "The Challenge",
        summary:
          "Our AI assistant had a 23% adoption rate and a 67% drop-off after first use. Users found it confusing, unreliable, and more of a hindrance than a help. The business needed AI to be a core differentiator, not a liability.",
        content:
          "The product team had shipped an AI chatbot 6 months prior, but usage data told a painful story. Enterprise customers were actively avoiding the feature, and some were citing it as a reason to consider competitors. The chatbot suffered from three core problems: unpredictable responses that eroded trust, a conversational interface that didn't match users' mental models for their workflows, and no graceful way to handle AI limitations. Stakeholders wanted a complete reimagining — not a patch job. The constraint? We had 3 months and couldn't disrupt existing workflows.",
      },
      {
        title: "Research & Discovery",
        summary:
          "We conducted 18 user interviews, analyzed 2,000+ support tickets mentioning the AI feature, and ran a competitive audit of 12 AI-powered B2B tools to understand what 'good' looked like.",
        content:
          "I led the research sprint alongside our UX researcher. We segmented users into power users (rare), occasional users (struggling), and avoiders (the majority). The interviews revealed a critical insight: users didn't want a chatbot — they wanted a knowledgeable colleague who could anticipate their needs. Support ticket analysis showed that 40% of complaints were about the AI not understanding context, and 30% were about not knowing what the AI could actually do. Our competitive audit revealed that the best AI tools in the market used progressive disclosure and contextual suggestions rather than open-ended chat interfaces.",
      },
      {
        title: "Problem Framing",
        summary:
          "We reframed from 'How might we make the chatbot better?' to 'How might we make AI feel like a knowledgeable teammate who's always one step ahead?'",
        content:
          "The research synthesis led to three key insights: (1) Users trust AI more when it shows its work — transparency builds confidence. (2) Contextual, proactive suggestions outperform reactive chat 3:1 in task completion. (3) Users need an escape hatch — knowing they can override AI at any point dramatically increases willingness to try it. We created two primary personas: 'Skeptical Sarah' (senior analyst, values control and accuracy) and 'Curious Chris' (junior PM, wants to learn and move fast). The HMW statement became our north star for every design decision.",
      },
      {
        title: "Ideation",
        summary:
          "From 47 initial concepts across 3 design sprints, we converged on a 'Copilot' model — contextual AI that suggests actions within existing workflows rather than requiring users to switch to a chat interface.",
        content:
          "We ran three Crazy 8s sessions with cross-functional teams (design, engineering, data science, customer success). Early concepts ranged from a fully autonomous agent to a simple tooltip system. The breakthrough came when an engineer sketched an 'AI sidebar' that could see what the user was doing and offer relevant suggestions. We concept-tested 5 directions with 8 users and the copilot model won overwhelmingly. Users said it felt like 'having an expert looking over my shoulder — in a good way.' We voted on features using dot voting and prioritized: contextual suggestions, one-click actions, explanation cards, and confidence indicators.",
      },
      {
        title: "Design & Prototyping",
        summary:
          "We went from wireframes to a high-fidelity interactive prototype in 4 weeks, testing 3 major iterations along the way. The design system got 12 new AI-specific components.",
        content:
          "The first wireframes established the spatial model: a collapsible sidebar that contextually populated based on the user's current view and selection. I designed a confidence indicator system — the AI would show how certain it was about each suggestion, using a simple 3-tier visual (high/medium/low). For each suggestion, users could see a brief 'why' explanation before accepting. The interaction model used progressive disclosure: minimal by default, expandable on demand. We prototyped in Figma with smart animations and tested with 6 users per round. Key iteration: Round 1 showed the sidebar was too noisy — we reduced default suggestions from 5 to 3 and added a 'Show more' option.",
      },
      {
        title: "Testing & Reassessing",
        summary:
          "Usability testing revealed our confidence indicators were actually increasing anxiety. Users preferred simpler binary framing: 'Suggested' vs 'Experimental.' We pivoted the entire trust model.",
        content:
          "This was our biggest pivot. The 3-tier confidence system we'd carefully designed was backfiring — when users saw 'medium confidence,' they interpreted it as 'probably wrong' rather than 'worth considering.' We ran an A/B concept test: our original 3-tier system vs. a binary 'Suggested' (high confidence, shown by default) and 'Experimental' (lower confidence, hidden behind a toggle). The binary won on every metric: trust (+34%), willingness to try (+28%), and task completion (+19%). We also discovered that the 'why' explanations were too technical — we rewrote them in plain language with concrete examples. Round 3 testing showed a 78% task completion rate, up from 31% with the old chatbot.",
      },
      {
        title: "Shipping",
        summary:
          "We launched with a phased rollout: 5% → 25% → 100% over 6 weeks, with kill switches and real-time monitoring dashboards. Engineering collaboration was tight — daily syncs during the build phase.",
        content:
          "I worked closely with the engineering team during the 6-week build phase. We had daily 15-minute syncs to resolve design questions and made micro-adjustments based on what was feasible. I created detailed interaction specs with edge cases documented — what happens when the AI has no suggestions, when it's loading, when the user dismisses everything. The phased rollout let us catch issues early: at 5%, we discovered a performance issue with the sidebar on large datasets and optimized before wider release. I built a monitoring dashboard in collaboration with data science to track adoption, suggestion acceptance rates, and user feedback in real-time.",
      },
      {
        title: "Success Metrics & Impact",
        summary:
          "AI adoption jumped from 23% to 71% in 3 months. Suggestion acceptance rate hit 45%. Customer satisfaction with AI features increased by 52 NPS points.",
        content:
          "The numbers told a compelling story: Daily active AI users grew from 23% to 71% within 3 months of full rollout. The suggestion acceptance rate averaged 45%, meaning nearly half the time the AI suggested something, users found it helpful enough to use. Average task completion time decreased by 22% for AI-assisted workflows. Customer NPS for AI features went from -12 to +40 — a 52-point swing. Support tickets mentioning AI complaints dropped by 64%. Three enterprise customers who had been considering churning specifically cited the AI improvement in their renewal conversations. The CEO featured the redesign in the quarterly earnings call.",
      },
      {
        title: "Feedback & Reflection",
        summary:
          "The biggest lesson: trust in AI products isn't about making the AI smarter — it's about making the interface honest. Users forgave AI mistakes when they understood why they happened.",
        content:
          "Post-launch user interviews revealed something surprising: users didn't care if the AI was occasionally wrong — they cared about knowing what they were getting into. The transparency features (explanations, confidence labels) were cited more than the actual AI accuracy. If I could do it again, I'd invest more in the 'Experimental' suggestions space. We played it safe by hiding lower-confidence suggestions, but user feedback suggests there's appetite for an 'explore' mode. I'd also push for more personalization earlier — the copilot currently treats all users the same, but power users want different suggestion densities than beginners. The project reinforced my belief that AI product design is fundamentally about trust design.",
      },
    ],
    pullQuotes: [
      {
        quote: "It feels like having an expert looking over my shoulder — in a good way.",
        attribution: "Usability test participant",
        afterSection: 3,
      },
      {
        quote: "I don't care if it's sometimes wrong. I care that it tells me when it's not sure.",
        attribution: "Enterprise customer, post-launch interview",
        afterSection: 7,
      },
    ],
  },
  {
    slug: "conversational-commerce",
    sections: [
      {
        title: "The Challenge",
        summary:
          "E-commerce search was broken for complex purchases. Users with specific needs — like finding the right laptop for video editing under $1500 — were bouncing after 3+ failed filter attempts.",
        content:
          "The data was clear: for purchases requiring more than 3 filter criteria, conversion dropped by 73%. Users with complex needs were leaving and going to Reddit or YouTube for recommendations instead. The product vision was ambitious: replace the filter-based shopping experience with a natural language interface powered by LLMs. But the risk was high — conversational commerce had failed before (remember early chatbots?). We needed this to feel fundamentally different.",
      },
      {
        title: "Research & Discovery",
        summary:
          "We shadowed 24 users shopping for complex products and analyzed 10,000 customer service chat transcripts to understand how people naturally describe what they want.",
        content:
          "The shadowing sessions were eye-opening. Users didn't think in filter categories — they thought in use cases. Nobody said 'I want 16GB RAM and an RTX 4060.' They said 'I need something that can handle After Effects without stuttering.' Chat transcript analysis revealed common patterns: users lead with their use case, then narrow with constraints (budget, brand preferences, deal-breakers). We mapped these into a conversation framework that our LLM interface would need to support.",
      },
      {
        title: "Problem Framing",
        summary:
          "We reframed from 'How might we add chat to shopping?' to 'How might we make finding the right product feel like talking to a knowledgeable friend?'",
        content:
          "The key insight: the best shopping experiences aren't transactional — they're consultative. Think about a great salesperson in a specialty store. They listen, ask smart follow-up questions, and narrow options without overwhelming you. Our HMW statement prioritized the 'knowledgeable friend' metaphor because it set the right expectation: helpful but not pushy, opinionated but open to alternatives, honest about trade-offs.",
      },
      {
        title: "Ideation",
        summary:
          "We explored 5 interaction models from full chat to hybrid browse-and-ask. The winning concept: a conversational sidebar that enhances the existing browse experience rather than replacing it.",
        content:
          "We tested pure conversational (everything through chat), hybrid (chat + traditional browse), guided (structured questionnaire), and two variations. Users were clear: they didn't want to give up visual browsing. The winning concept let users type naturally while products updated in real-time beside the conversation. The AI could ask clarifying questions, surface relevant products, and explain trade-offs — all while the user maintained the familiar grid browse experience.",
      },
      {
        title: "Design & Prototyping",
        summary:
          "The conversational UI went through 5 major iterations. The hardest design challenge: making AI product recommendations feel trustworthy without feeling salesy.",
        content:
          "We obsessed over the recommendation cards. Early versions looked too much like ads — users distrusted them immediately. The breakthrough was showing the AI's reasoning: 'Based on your need for video editing, this model has a dedicated GPU that handles After Effects well, and it's $200 under your budget.' We also designed 'comparison mode' — when the AI narrowed to 2-3 options, it could generate a side-by-side comparison highlighting the trade-offs relevant to the user's specific needs.",
      },
      {
        title: "Testing & Reassessing",
        summary:
          "First usability test was humbling: users loved the concept but the conversation flow felt robotic. We brought in a copywriter to make the AI's voice feel genuinely human and helpful.",
        content:
          "The UX writing pass was transformative. Instead of 'I found 5 products matching your criteria,' the AI would say 'Found some good options! Two are particularly interesting for video editing — want me to show you why?' We also added personality touches: the AI would acknowledge trade-offs honestly ('This one's great for performance but it's heavy at 5.2 lbs — is portability important to you?'). Second round of testing showed a 40% increase in conversation engagement.",
      },
      {
        title: "Shipping",
        summary:
          "Launched as a beta feature with 10% of users, monitoring conversation quality, recommendation accuracy, and conversion impact daily.",
        content:
          "We built a conversation quality scoring system that flagged interactions where the AI went off-track or users expressed frustration. This let us identify and fix conversation flow issues within hours. We also implemented a feedback mechanism where users could rate recommendations, creating a feedback loop for improving the underlying model. The engineering team built a prompt management system so the design team could iterate on AI personality and behavior without code changes.",
      },
      {
        title: "Success Metrics & Impact",
        summary:
          "Conversational users converted at 2.3x the rate of traditional browse users for complex purchases. Average order value increased by 18%. The feature became the company's top marketing differentiator.",
        content:
          "Results after 3 months of full rollout: Conversion rate for complex purchases (3+ criteria) increased from 4.2% to 9.7% (2.3x). Average order value was 18% higher for conversational users — they bought more confidently. Session duration was actually longer (+35%), but this was positive — users were exploring options rather than rage-quitting. Return rate dropped by 12%, suggesting users were making better-informed purchases. The feature was featured in TechCrunch and became the centerpiece of the company's marketing campaigns.",
      },
      {
        title: "Feedback & Reflection",
        summary:
          "The biggest surprise: users started using the conversational interface for simple purchases too. They liked the efficiency of typing 'red running shoes size 10' more than clicking through filters.",
        content:
          "This wasn't a use case we designed for, but it became the dominant one. It taught me that natural language isn't just for complex queries — it's a fundamentally more efficient input method when done right. If I were starting over, I'd invest more in the 'browsing companion' use case from the start. I'd also push harder on personalization — the AI didn't remember users across sessions, which was a missed opportunity. The project cemented my belief that the future of e-commerce UI is conversational, and traditional filter-based interfaces will look as outdated as command-line interfaces.",
      },
    ],
    pullQuotes: [
      {
        quote: "Finally, a shopping experience that actually listens to what I need instead of making me translate it into filter checkboxes.",
        attribution: "Beta user feedback",
        afterSection: 4,
      },
      {
        quote: "It's like having a friend who really knows tech and doesn't judge you for your budget.",
        attribution: "User interview participant",
        afterSection: 7,
      },
    ],
  },
  {
    slug: "design-system-evolution",
    sections: [
      {
        title: "The Challenge",
        summary:
          "Our design system had 12 components built for one product. Now 5 product teams needed it, each with different requirements, and design inconsistency was becoming a brand risk.",
        content:
          "What started as a small component library for the core product had become a bottleneck. Teams were forking components, creating one-offs, and the visual language was fragmenting. Design reviews revealed that the 5 product surfaces had drifted so far apart they barely looked like the same company. The business asked for a unified design system — but it needed to be flexible enough for a dashboard-heavy analytics product, a mobile-first consumer app, and everything in between.",
      },
      {
        title: "Research & Discovery",
        summary:
          "We audited all 5 products and found 47 unique button styles, 23 card patterns, and zero shared typography scales. We also interviewed every designer and key engineers about their pain points.",
        content:
          "The visual audit was sobering but necessary. We catalogued every UI pattern across all 5 products, grouped by function. Beyond the numbers, the interviews revealed deeper problems: designers felt the existing system was too rigid for their needs, engineers found the component APIs inconsistent and poorly documented, and everyone had a different mental model of how the system should work. The core tension was flexibility vs. consistency — too rigid and teams would keep forking; too flexible and consistency would erode.",
      },
      {
        title: "Problem Framing",
        summary:
          "We reframed from 'How might we build more components?' to 'How might we create a system that makes consistency the path of least resistance?'",
        content:
          "The insight was that a design system isn't a component library — it's a set of decisions made in advance. The best systems make the right thing easy and the wrong thing hard. We established three design principles: (1) Composable over comprehensive — fewer, more flexible primitives rather than more single-purpose components. (2) Convention over configuration — sensible defaults that teams can override when needed. (3) Adoption through value — if using the system isn't faster than building custom, the system has failed.",
      },
      {
        title: "Ideation",
        summary:
          "We explored three system architectures and chose a layered model: design tokens → primitives → composed components → product-specific patterns.",
        content:
          "The layered approach gave us the flexibility-consistency balance we needed. Design tokens (colors, spacing, typography) provided brand consistency across all products. Primitives (Button, Input, Card shell) handled 80% of use cases with sensible defaults. Composed components combined primitives for common patterns. Product-specific patterns sat on top for unique needs. This meant teams could use the system at whatever level of abstraction made sense for their use case, while still inheriting the brand foundations.",
      },
      {
        title: "Design & Prototyping",
        summary:
          "We designed 120 components over 6 months, starting with the 20 highest-impact components identified by cross-team voting. Every component was co-designed with at least 2 consuming teams.",
        content:
          "The co-design process was critical. For each component, we'd gather requirements from all teams, identify the common patterns, and design the API together. We used a 'proposal → feedback → build → test' cycle for each component batch. The biggest design challenge was the token system — getting 5 teams to agree on a color palette that worked for all their use cases required multiple rounds of negotiation. We implemented semantic tokens (success, warning, surface) rather than color-specific tokens (green-500, yellow-300) so teams could theme without breaking the system.",
      },
      {
        title: "Testing & Reassessing",
        summary:
          "The first batch of components had a 60% adoption rate — lower than expected. Exit interviews revealed our documentation was too reference-oriented and lacked practical recipes.",
        content:
          "This was a wake-up call. Technically the components worked, but teams couldn't figure out how to use them for their specific use cases. We completely restructured our documentation: every component page got a 'Recipes' section showing common use cases with copyable code. We added a 'Pattern Library' showing how to compose components for real-world scenarios. We also built a Figma plugin that auto-generated component code, reducing the designer-to-developer handoff friction. After the documentation revamp, adoption jumped to 89%.",
      },
      {
        title: "Shipping",
        summary:
          "We rolled out team-by-team with dedicated migration support. A 'System Champion' on each team became the local expert and feedback conduit.",
        content:
          "Rather than a big-bang migration, we partnered with one team at a time. Each team got a dedicated 2-week migration sprint where a system team member embedded with them. The System Champions model was invaluable — they understood their team's codebase and could translate system concepts into team-specific solutions. We also built migration tooling: codemods for common refactors, a visual regression test suite, and a component usage dashboard that tracked adoption metrics in real-time.",
      },
      {
        title: "Success Metrics & Impact",
        summary:
          "Design consistency score improved from 34% to 91%. New feature development time decreased by 35%. Designer onboarding time dropped from 3 weeks to 1 week.",
        content:
          "We measured design consistency using a quarterly visual audit scored by an external design reviewer. The improvement from 34% to 91% was dramatic and visible — the products genuinely felt like they belonged to the same family now. Engineering velocity improved because teams spent less time building custom UI and more time on product logic. New designers could contribute meaningful work in their first week because the system handled so many decisions for them. The system also enabled our first-ever company-wide rebrand, completed in 3 weeks instead of the estimated 3 months — because we only had to update the token layer.",
      },
      {
        title: "Feedback & Reflection",
        summary:
          "A design system is never 'done' — it's a product with its own users, roadmap, and support model. The biggest lesson: governance matters more than components.",
        content:
          "If I were starting over, I'd invest more time in governance from day one. We spent months building beautiful components but didn't establish clear processes for contribution, deprecation, or conflict resolution until later. I'd also establish the System Champions program from the start rather than halfway through. The most impactful thing wasn't any individual component — it was the shared language and decision-making framework the system gave the organization. Teams stopped debating 'should this be a card or a panel?' because the system had already made that decision. Design systems are 20% components and 80% culture change.",
      },
    ],
    pullQuotes: [
      {
        quote: "The system doesn't constrain my creativity — it frees me from making the same 50 micro-decisions every day so I can focus on the hard problems.",
        attribution: "Product designer, consumer team",
        afterSection: 4,
      },
      {
        quote: "We completed a company-wide rebrand in 3 weeks. A year ago, that would have taken 3 months.",
        attribution: "VP of Design",
        afterSection: 7,
      },
    ],
  },
];
