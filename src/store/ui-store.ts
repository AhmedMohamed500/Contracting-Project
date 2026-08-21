import { create } from "zustand";

export type Language = "ar" | "en";
export type ModuleKey = "dashboard" | "companies" | "projects" | "parties" | "boq" | "procurement" | "inventory" | "expenses" | "certificates" | "accounting" | "costing" | "documents" | "settings";

interface UiState {
  language: Language;
  module: ModuleKey;
  sidebarOpen: boolean;
  selectedProjectId: string;
  setLanguage: (language: Language) => void;
  setModule: (module: ModuleKey) => void;
  setSidebarOpen: (open: boolean) => void;
  setSelectedProjectId: (id: string) => void;
}

export const useUiStore = create<UiState>((set) => ({
  language: "ar",
  module: "dashboard",
  sidebarOpen: false,
  selectedProjectId: "all",
  setLanguage: (language) => set({ language }),
  setModule: (module) => set({ module, sidebarOpen: false }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setSelectedProjectId: (selectedProjectId) => set({ selectedProjectId }),
}));
