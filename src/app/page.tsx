import Hero from "@/components/home/Hero";
import FeaturedWork from "@/components/home/FeaturedWork";
import AboutTeaser from "@/components/home/AboutTeaser";
import RecentFieldNotes from "@/components/home/RecentFieldNotes";

export default function Home() {
  return (
    <>
      <Hero />
      <FeaturedWork />
      <AboutTeaser />
      <RecentFieldNotes />
    </>
  );
}
