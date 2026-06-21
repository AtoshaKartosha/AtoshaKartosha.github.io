"use client";


import { DetectiveBoard } from "../components/DetectiveBoard";
import { LoadingScreen } from "../components/LoadingScreen";
import { PortraitDossierList } from "../components/PortraitDossierList";
import { useBoardStore } from "../stores/useBoardStore";
import { useState } from "react";

export default function Home() {
  const [showBoardAnyway, setShowBoardAnyway] = useState(false);
  const isPortrait = useBoardStore((state) => state.isPortrait);

  const [prevIsPortrait, setPrevIsPortrait] = useState(isPortrait);
  if (isPortrait !== prevIsPortrait) {
    setPrevIsPortrait(isPortrait);
    if (!isPortrait) {
      setShowBoardAnyway(false);
    }
  }

  return (
    <main className="relative h-dvh overflow-hidden">
      <h1 className="sr-only">Detective Table Top — Вечер настольных игр</h1>
      <LoadingScreen />
      {!showBoardAnyway && (
        <PortraitDossierList onShowBoardAnyway={() => setShowBoardAnyway(true)} />
      )}
      <DetectiveBoard />
    </main>
  );
}
