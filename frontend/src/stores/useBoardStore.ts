import { create } from "zustand";

interface Position {
  x: number;
  y: number;
}

interface BoardState {
  pinPositions: Record<string, Position>;
  activePopup: string | null;
  panOffset: Position;
  isLoading: boolean;
  hoveredItemId: string | null;
  setPinPositions: (positions: Record<string, Position>) => void;
  setActivePopup: (id: string | null) => void;
  setPanOffset: (pos: Position | ((prev: Position) => Position)) => void;
  setIsLoading: (loading: boolean) => void;
  setHoveredItemId: (id: string | null) => void;
}

export const useBoardStore = create<BoardState>((set) => ({
  pinPositions: {},
  activePopup: null,
  panOffset: { x: 0, y: 0 },
  isLoading: true,
  hoveredItemId: null,
  setPinPositions: (positions) =>
    set((state) => ({
      pinPositions: { ...state.pinPositions, ...positions },
    })),
  setActivePopup: (id) => set({ activePopup: id }),
  setPanOffset: (pos) =>
    set((state) => ({
      panOffset: typeof pos === "function" ? pos(state.panOffset) : pos,
    })),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setHoveredItemId: (id) => set({ hoveredItemId: id }),
}));
