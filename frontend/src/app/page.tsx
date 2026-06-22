"use client";


import { DetectiveBoard } from "../components/DetectiveBoard";
import { LoadingScreen } from "../components/LoadingScreen";
import { RotateDeviceOverlay } from "../components/RotateDeviceOverlay";
import { useBoardStore } from "../stores/useBoardStore";

export default function Home() {
  const isMobile = useBoardStore((state) => state.isMobile);
  const isTablet = useBoardStore((state) => state.isTablet);
  const isPortrait = useBoardStore((state) => state.isPortrait);

  return (
    <main className="relative h-dvh overflow-hidden">
      <h1 className="sr-only">Detective Table Top — Вечер настольных игр</h1>
      <LoadingScreen />
      {(isMobile || isTablet) && isPortrait && <RotateDeviceOverlay />}
      <DetectiveBoard />
    </main>
  );
}
