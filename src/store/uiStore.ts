import { create } from 'zustand'

interface UIState {
  darkMode: boolean
  sidebarOpen: boolean
  toggleDarkMode: () => void
  setSidebarOpen: (open: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  darkMode: false,
  sidebarOpen: true,
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
}))

