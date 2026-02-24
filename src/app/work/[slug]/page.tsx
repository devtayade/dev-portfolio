"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { projects } from "@/lib/projects";
import CaseStudyHeader from "@/components/casestudy/CaseStudyHeader";
import VideoWalkthrough from "@/components/casestudy/VideoWalkthrough";
import ReadingModeToggle from "@/components/casestudy/ReadingModeToggle";

export default function CaseStudyPage() {
  const params = useParams();
  const slug = params.slug as string;
  const project = projects.find((p) => p.slug === slug);
  const [readingMode, setReadingMode] = useState<"quick" | "full">("quick");

  if (!project) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted">Project not found.</p>
      </div>
    );
  }

  return (
    <>
      <CaseStudyHeader project={project} />
      <VideoWalkthrough color={project.color} />
      <ReadingModeToggle mode={readingMode} onToggle={setReadingMode} />

      <div id="case-study-content" className="mx-auto max-w-4xl px-6 py-16">
        {/* Content sections will be added in Task 7 */}
        <p className="text-center text-muted">
          Case study content loading...
        </p>
      </div>
    </>
  );
}
