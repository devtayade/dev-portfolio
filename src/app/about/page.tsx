import type { Metadata } from "next";
import StoryIntro from "@/components/about/StoryIntro";
import JourneyTimeline from "@/components/about/JourneyTimeline";
import CommunityEvents from "@/components/about/CommunityEvents";

export const metadata: Metadata = {
  title: "About",
  description:
    "The story behind the designs — my journey, community work, and what drives me as a product designer.",
};

export default function AboutPage() {
  return (
    <>
      <StoryIntro />
      <JourneyTimeline />
      <CommunityEvents />
    </>
  );
}
