import { demoData } from "@/data/demo-data";
import type { ErpRepository } from "./erp.repository";
import type { ErpData } from "@/types/erp";

const STORAGE_KEY = "binaa-erp-data-v1";

function cloneDemo(): ErpData {
  return JSON.parse(JSON.stringify(demoData)) as ErpData;
}

function isErpData(value: unknown): value is ErpData {
  if (!value || typeof value !== "object") return false;
  const data = value as Partial<ErpData>;
  return data.version === 1 && Array.isArray(data.companies) && Array.isArray(data.projects) && Array.isArray(data.journalEntries);
}

export class LocalStorageErpRepository implements ErpRepository {
  load(): ErpData {
    if (typeof window === "undefined") return cloneDemo();
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      const initial = cloneDemo();
      this.save(initial);
      return initial;
    }
    try {
      const parsed: unknown = JSON.parse(saved);
      return isErpData(parsed) ? parsed : cloneDemo();
    } catch {
      return cloneDemo();
    }
  }

  save(data: ErpData): void {
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  clear(): void {
    if (typeof window !== "undefined") window.localStorage.removeItem(STORAGE_KEY);
  }

  export(): string { return JSON.stringify(this.load(), null, 2); }

  restore(json: string): ErpData {
    const parsed: unknown = JSON.parse(json);
    if (!isErpData(parsed)) throw new Error("INVALID_BACKUP");
    this.save(parsed);
    return parsed;
  }
}

export const erpRepository = new LocalStorageErpRepository();
