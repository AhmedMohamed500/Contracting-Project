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

function normalize(data: ErpData): ErpData {
  const accountNames = new Map(demoData.chartOfAccounts.map((account) => [account.code, account.name]));
  const projects = data.projects.map((project) => ({
    ...project,
    costCenterCode: project.costCenterCode || `CC-${project.code}`,
    wbsCode: project.wbsCode || `WBS-${project.code}`,
  }));
  const fallbackCompany = data.companies[0]?.id ?? "co-atlas";
  const normalizedJournals = (data.journalEntries ?? []).map((entry) => {
    const legacy = entry as unknown as { lines: { account?: string; accountCode?: string; accountName?: string; description: string; debit: number; credit: number; }[] };
    const project = projects.find((item) => item.id === entry.projectId);
    return {
      ...entry,
      companyId: entry.companyId || project?.companyId || fallbackCompany,
      costCenterCode: entry.costCenterCode || project?.costCenterCode,
      reference: entry.reference || entry.number,
      journalType: entry.journalType || "general",
      sourceModule: entry.sourceModule || "Manual Journal",
      sourceType: entry.sourceType || "General Journal",
      sourceNumber: entry.sourceNumber || entry.number,
      automatic: entry.automatic ?? false,
      createdBy: entry.createdBy || "Demo User",
      auditTrail: entry.auditTrail ?? [{ action: "create" as const, user: "Demo User", timestamp: entry.createdAt }],
      lines: legacy.lines.map((line) => {
        const accountCode = line.accountCode || line.account || "000000";
        return { ...line, accountCode, accountName: line.accountName || accountNames.get(accountCode) || "حساب غير معرّف", projectId: entry.projectId, costCenterCode: entry.costCenterCode || project?.costCenterCode, wbsCode: project?.wbsCode, reference: entry.reference || entry.number, sourceModule: entry.sourceModule || "Manual Journal", sourceDocument: entry.sourceNumber || entry.number };
      }),
    };
  });
  const demoJournals = cloneDemo().journalEntries;
  const isAtlasSeed = data.companies.some((company) => company.id === "co-atlas") && data.projects.some((project) => project.id === "prj-1");
  const journalEntries = isAtlasSeed
    ? [...normalizedJournals.map((entry) => entry.id === "jv-1" ? demoJournals.find((demo) => demo.id === "jv-1") ?? entry : entry), ...demoJournals.filter((demo) => demo.id !== "jv-1" && !normalizedJournals.some((entry) => entry.id === demo.id))]
    : normalizedJournals;
  return {
    ...data,
    projects,
    chartOfAccounts: data.chartOfAccounts?.length ? data.chartOfAccounts : cloneDemo().chartOfAccounts,
    accountingMappings: data.accountingMappings?.length ? data.accountingMappings : cloneDemo().accountingMappings,
    fiscalPeriods: data.fiscalPeriods?.length ? data.fiscalPeriods : cloneDemo().fiscalPeriods,
    journalEntries,
  };
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
      return isErpData(parsed) ? normalize(parsed) : cloneDemo();
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
    const normalized = normalize(parsed);
    this.save(normalized);
    return normalized;
  }
}

export const erpRepository = new LocalStorageErpRepository();
