import { create } from 'zustand';
import type { ParsedDocument } from '../services/documentParser';

interface DocumentState {
    document: ParsedDocument | null;
    file: File | null; // Store raw file for PDF rendering
    isLoading: boolean;
    error: string | null;

    setDocument: (doc: ParsedDocument, file: File) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    clearDocument: () => void;
}

export const useDocumentStore = create<DocumentState>((set) => ({
    document: null,
    file: null, // Added file to initial state
    isLoading: false,
    error: null,

    setDocument: (doc, file) => set({ document: doc, file, isLoading: false, error: null }),
    setLoading: (loading) => set({ isLoading: loading }),
    setError: (error) => set({ error, isLoading: false }),
    clearDocument: () => set({ document: null, file: null, isLoading: false, error: null }),
}));
