import { Metadata } from "next";
import ProgramsClient from "./ProgramsClient";

export const metadata: Metadata = {
  title: "Programs & Events",
  description: "Browse GDG hackathons, technical codelabs, cloud study jams, and developer meetups.",
};

export default function ProgramsPage() {
  return <ProgramsClient />;
}
