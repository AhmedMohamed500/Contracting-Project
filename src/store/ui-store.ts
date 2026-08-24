import { create } from "zustand";
import { uiPreferencesRepository } from "@/repositories/ui-preferences.repository";

export type Language = "ar" | "en";
export type ModuleKey = "dashboard" | "companies" | "projects" | "contracts" | "structures" | "warehouses" | "parties" | "boq" | "procurement" | "inventory" | "expenses" | "certificates" | "tenders" | "tender-costing" | "tender-clarifications" | "tender-letters" | "bid-bonds" | "correspondence-dashboard" | "outgoing-letters" | "incoming-letters" | "rfi" | "submittals" | "transmittals" | "site-instructions" | "inspections" | "ncr" | "claims" | "meeting-minutes" | "action-tracker" | "letter-templates" | "accounting" | "accounting-documents" | "accounting-journals" | "general-ledger" | "subsidiary-ledger" | "trial-balance" | "financial-statements" | "income-statement" | "balance-sheet" | "cash-flow-statement" | "equity-statement" | "adjusted-trial" | "post-closing-trial" | "receivables" | "payables" | "treasury" | "settlements" | "accounting-closing" | "chart-accounts" | "cost-centers" | "account-mapping" | "accounting-control" | "costing" | "documents" | "settings";

interface UiState {
  language: Language;
  module: ModuleKey;
  sidebarOpen: boolean;
  selectedCompanyId: string;
  selectedProjectId: string;
  selectedPeriodId: string;
  expandedNavigationGroups: string[];
  preferencesHydrated: boolean;
  hydratePreferences: () => void;
  setLanguage: (language: Language) => void;
  setModule: (module: ModuleKey) => void;
  setSidebarOpen: (open: boolean) => void;
  setSelectedCompanyId: (id: string) => void;
  setSelectedProjectId: (id: string) => void;
  setSelectedPeriodId: (id: string) => void;
  toggleNavigationGroup: (id: string) => void;
  ensureNavigationGroupsExpanded: (ids: string[]) => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  language: "ar",
  module: "dashboard",
  sidebarOpen: false,
  selectedCompanyId: "all",
  selectedProjectId: "all",
  selectedPeriodId: "all",
  expandedNavigationGroups: [],
  preferencesHydrated: false,
  hydratePreferences: () => set({ ...uiPreferencesRepository.load(), preferencesHydrated: true }),
  setLanguage: (language) => { set({ language }); const state = get(); uiPreferencesRepository.save({ language, module: state.module, expandedNavigationGroups: state.expandedNavigationGroups }); },
  setModule: (module) => { set({ module, sidebarOpen: false }); const state = get(); uiPreferencesRepository.save({ language: state.language, module, expandedNavigationGroups: state.expandedNavigationGroups }); },
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  setSelectedCompanyId: (selectedCompanyId) => set({ selectedCompanyId, selectedProjectId: "all", selectedPeriodId: "all" }),
  setSelectedProjectId: (selectedProjectId) => set({ selectedProjectId }),
  setSelectedPeriodId: (selectedPeriodId) => set({ selectedPeriodId }),
  toggleNavigationGroup: (id) => { const state = get(); const expandedNavigationGroups = state.expandedNavigationGroups.includes(id) ? state.expandedNavigationGroups.filter((value) => value !== id) : [...state.expandedNavigationGroups, id]; set({ expandedNavigationGroups }); uiPreferencesRepository.save({ language: state.language, module: state.module, expandedNavigationGroups }); },
  ensureNavigationGroupsExpanded: (ids) => { const state = get(); const expandedNavigationGroups = [...new Set([...state.expandedNavigationGroups, ...ids])]; if (expandedNavigationGroups.length === state.expandedNavigationGroups.length) return; set({ expandedNavigationGroups }); uiPreferencesRepository.save({ language: state.language, module: state.module, expandedNavigationGroups }); },
}));
