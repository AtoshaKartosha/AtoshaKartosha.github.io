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
  isMobile: boolean;
  isTablet: boolean;
  setIsTablet: (v: boolean) => void;
  setPinPositions: (positions: Record<string, Position>) => void;
  setActivePopup: (id: string | null) => void;
  setPanOffset: (pos: Position | ((prev: Position) => Position)) => void;
  setIsLoading: (loading: boolean) => void;
  setHoveredItemId: (id: string | null) => void;
  setIsMobile: (v: boolean) => void;
  isPortrait: boolean;
  setIsPortrait: (v: boolean) => void;
  isMagnifierActive: boolean;
  setIsMagnifierActive: (v: boolean) => void;
}

export const useBoardStore = create<BoardState>((set) => ({
  pinPositions: {},
  activePopup: null,
  panOffset: { x: 0, y: 0 },
  isLoading: true,
  hoveredItemId: null,
  isMobile: false,
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
  setIsMobile: (v) => set({ isMobile: v }),
  isTablet: false,
  setIsTablet: (v) => set({ isTablet: v }),
  isPortrait: false,
  setIsPortrait: (v) => set({ isPortrait: v }),
  isMagnifierActive: false,
  setIsMagnifierActive: (v) => set({ isMagnifierActive: v }),
}));
