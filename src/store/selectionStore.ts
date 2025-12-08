import { create } from 'zustand';

interface SelectionState {
    selectedText: string;
    isSelecting: boolean;

    setSelectedText: (text: string) => void;
    setIsSelecting: (selecting: boolean) => void;
    clearSelection: () => void;
}

export const useSelectionStore = create<SelectionState>((set) => ({
    selectedText: '',
    isSelecting: false,

    setSelectedText: (text) => set({ selectedText: text }),
    setIsSelecting: (selecting) => set({ isSelecting: selecting }),
    clearSelection: () => set({ selectedText: '', isSelecting: false }),
}));
