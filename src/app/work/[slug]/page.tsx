"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { projects } from "@/lib/projects";
import { caseStudyContent } from "@/lib/case-study-content";
import CaseStudyHeader from "@/components/casestudy/CaseStudyHeader";
import VideoWalkthrough from "@/components/casestudy/VideoWalkthrough";
import ReadingModeToggle from "@/components/casestudy/ReadingModeToggle";
import ExpandableSection from "@/components/casestudy/ExpandableSection";
import PullQuote from "@/components/casestudy/PullQuote";
import BeforeAfterSlider from "@/components/casestudy/BeforeAfterSlider";
import NextCaseStudy from "@/components/casestudy/NextCaseStudy";

export default function CaseStudyPage() {
  const params = useParams();
  const slug = params.slug as string;
  const project = projects.find((p) => p.slug === slug);
  const content = caseStudyContent.find((c) => c.slug === slug);
  const [readingMode, setReadingMode] = useState<"quick" | "full">("quick");

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted">Project not found.</p>
      </div>
    );
  }

  // Find next project
  const currentIndex = projects.findIndex((p) => p.slug === slug);
  const nextProject = projects[(currentIndex + 1) % projects.length];

  return (
    <>
      <CaseStudyHeader project={project} />
      <VideoWalkthrough color={project.color} />
      <ReadingModeToggle mode={readingMode} onToggle={setReadingMode} />

      <div id="case-study-content" className="mx-auto max-w-4xl px-6 py-16">
        {content?.sections.map((section, index) => (
          <div key={section.title}>
            <ExpandableSection
              title={section.title}
              number={index + 1}
              summary={section.summary}
              isFullMode={readingMode === "full"}
            >
              <p className="leading-relaxed">{section.content}</p>

              {/* Show before/after slider in Design & Prototyping section */}
              {section.title === "Design & Prototyping" && (
                <BeforeAfterSlider
                  beforeColor={project.color}
                  afterColor="#06b6d4"
                />
              )}
            </ExpandableSection>

            {/* Pull quotes after specific sections */}
            {content.pullQuotes
              .filter((pq) => pq.afterSection === index)
              .map((pq) => (
                <PullQuote
                  key={pq.quote}
                  quote={pq.quote}
                  attribution={pq.attribution}
                />
              ))}
          </div>
        ))}
      </div>

      <NextCaseStudy project={nextProject} />
    </>
  );
}
