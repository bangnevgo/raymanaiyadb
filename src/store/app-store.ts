import { create } from 'zustand';

type Page =
  | 'dashboard' | 'goals' | 'daily' | 'learning' | 'certifications'
  | 'portfolio' | 'jobs' | 'networking' | 'income'
  | 'reviews' | 'journal' | 'analytics' | 'ai-coach';

interface AppState {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentPage: 'dashboard',
  setCurrentPage: (page) => set({ currentPage: page }),
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}));

export type { Page };
