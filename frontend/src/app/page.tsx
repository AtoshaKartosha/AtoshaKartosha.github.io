
import { DetectiveBoard } from "../components/DetectiveBoard";
import { LoadingScreen } from "../components/LoadingScreen";

export default function Home() {
  return (
    <main className="relative w-full h-screen overflow-hidden">
      <h1 className="sr-only">Detective Table Top — Вечер настольных игр</h1>
      <LoadingScreen />
      <DetectiveBoard />
    </main>
  );
}
