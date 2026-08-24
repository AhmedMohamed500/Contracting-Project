import type { Language, ModuleKey } from "@/store/ui-store";

const STORAGE_KEY = "sitecost-ui-preferences-v1";

export interface UiPreferences {
  language: Language;
  module: ModuleKey;
  expandedNavigationGroups: string[];
}

const defaults: UiPreferences = { language: "ar", module: "dashboard", expandedNavigationGroups: [] };

class UiPreferencesRepository {
  load(): UiPreferences {
    if (typeof window === "undefined") return defaults;
    try {
      const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null") as Partial<UiPreferences> | null;
      return {
        language: parsed?.language === "en" ? "en" : "ar",
        module: typeof parsed?.module === "string" ? parsed.module as ModuleKey : "dashboard",
        expandedNavigationGroups: Array.isArray(parsed?.expandedNavigationGroups)
          ? parsed.expandedNavigationGroups.filter((value): value is string => typeof value === "string")
          : [],
      };
    } catch {
      return defaults;
    }
  }

  save(preferences: UiPreferences): void {
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }
}

export const uiPreferencesRepository = new UiPreferencesRepository();
