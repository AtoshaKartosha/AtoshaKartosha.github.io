"use client";

import { DetectiveBoard } from "../components/DetectiveBoard";
import { LoadingScreen } from "../components/LoadingScreen";

export default function Home() {
  return (
    <main className="relative w-full h-screen overflow-hidden">
      <LoadingScreen />
      <DetectiveBoard />
    </main>
  );
}
