import type { Metadata } from "next";
import FieldNotesClient from "./client";

export const metadata: Metadata = {
  title: "Field Notes",
  description:
    "Thoughts, observations, and lessons from the field — unpolished ideas, honest reflections, and things I'm still figuring out.",
};

export default function FieldNotesPage() {
  return <FieldNotesClient />;
}
