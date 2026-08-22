import { create } from "zustand";

export type Language = "ar" | "en";
export type ModuleKey = "dashboard" | "companies" | "projects" | "contracts" | "structures" | "warehouses" | "parties" | "boq" | "procurement" | "inventory" | "expenses" | "certificates" | "accounting" | "costing" | "documents" | "settings";

interface UiState {
  language: Language;
  module: ModuleKey;
  sidebarOpen: boolean;
  selectedCompanyId: string;
  selectedProjectId: string;
  selectedPeriodId: string;
  setLanguage: (language: Language) => void;
  setModule: (module: ModuleKey) => void;
  setSidebarOpen: (open: boolean) => void;
  setSelectedCompanyId: (id: string) => void;
  setSelectedProjectId: (id: string) => void;
  setSelectedPeriodId: (id: string) => void;
}

export const useUiStore = create<UiState>((set) => ({
  language: "ar",
  module: "dashboard",
  sidebarOpen: false,
  selectedCompanyId: "all",
  selectedProjectId: "all",
  selectedPeriodId: "all",
  setLanguage: (language) => set({ language }),
  setModule: (module) => set({ module, sidebarOpen: false }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setSelectedCompanyId: (selectedCompanyId) => set({ selectedCompanyId, selectedProjectId: "all", selectedPeriodId: "all" }),
  setSelectedProjectId: (selectedProjectId) => set({ selectedProjectId }),
  setSelectedPeriodId: (selectedPeriodId) => set({ selectedPeriodId }),
}));
