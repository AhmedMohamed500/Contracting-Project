import { demoData } from "@/data/demo-data";
import type { ErpRepository } from "./erp.repository";
import type { ErpData } from "@/types/erp";

const STORAGE_KEY = "sitecost-erp-data-v2";
const LEGACY_STORAGE_KEY = "binaa-erp-data-v1";

function cloneDemo(): ErpData {
  return JSON.parse(JSON.stringify(demoData)) as ErpData;
}

function emptyPrototype(): ErpData {
  const data = cloneDemo();
  return { ...data, companies: [], customers: [], suppliers: [], subcontractors: [], projects: [], boqItems: [], purchaseOrders: [], inventoryMovements: [], expenses: [], certificates: [], contracts: [], variationOrders: [], wbsNodes: [], costCodes: [], warehouses: [], chartOfAccounts: [], accountingMappings: [], journalEntries: [], fiscalPeriods: [], documents: [], accountingDocuments: [], settlements: [] };
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
  const customers = (data.customers ?? []).map((item) => ({ ...item, companyId: item.companyId || fallbackCompany }));
  const suppliers = (data.suppliers ?? []).map((item) => ({ ...item, companyId: item.companyId || fallbackCompany }));
  const subcontractors = (data.subcontractors ?? []).map((item) => ({ ...item, companyId: item.companyId || fallbackCompany }));
  const accountTemplate = cloneDemo().chartOfAccounts;
  const currentAccounts = data.chartOfAccounts ?? [];
  const chartOfAccounts = data.companies.flatMap((company) => {
    const companyAccounts = currentAccounts.filter((account) => account.companyId === company.id);
    const enriched = companyAccounts.map((account) => {
      const template = accountTemplate.find((item) => item.code === account.code);
      return { ...template, ...account, statementType: account.statementType ?? template?.statementType, statementSection: account.statementSection ?? template?.statementSection, normalBalance: account.normalBalance ?? template?.normalBalance ?? (["liability", "equity", "revenue"].includes(account.type) ? "credit" as const : "debit" as const), cashFlowCategory: account.cashFlowCategory ?? template?.cashFlowCategory ?? "operating" as const };
    });
    const existingCodes = new Set(enriched.map((account) => account.code));
    const missing = accountTemplate.filter((account) => !existingCodes.has(account.code)).map((account) => ({ ...account, id: `${company.id}-${account.code}`, companyId: company.id }));
    return [...enriched, ...missing];
  });
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
    customers,
    suppliers,
    subcontractors,
    projects,
    contracts: data.contracts ?? [],
    variationOrders: data.variationOrders ?? [],
    wbsNodes: data.wbsNodes ?? [],
    costCodes: data.costCodes ?? [],
    warehouses: data.warehouses ?? [],
    chartOfAccounts,
    accountingMappings: data.accountingMappings?.length ? data.accountingMappings : cloneDemo().accountingMappings,
    fiscalPeriods: data.fiscalPeriods?.length ? data.fiscalPeriods : cloneDemo().fiscalPeriods,
    journalEntries,
    accountingDocuments: data.accountingDocuments ?? cloneDemo().accountingDocuments,
    settlements: data.settlements ?? [],
    settings: {
      ...cloneDemo().settings,
      ...data.settings,
    },
  };
}

export class LocalStorageErpRepository implements ErpRepository {
  load(): ErpData {
    if (typeof window === "undefined") return cloneDemo();
    const current = window.localStorage.getItem(STORAGE_KEY);
    const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    const saved = current ?? legacy;
    if (!saved) {
      const initial = emptyPrototype();
      this.save(initial);
      return initial;
    }
    try {
      const parsed: unknown = JSON.parse(saved);
      if (!isErpData(parsed)) return cloneDemo();
      const migrated = normalize(parsed);
      if (!current && legacy) this.save(migrated);
      return migrated;
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
