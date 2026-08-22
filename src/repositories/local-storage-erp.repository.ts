import type { ErpRepository } from "./erp.repository";
import type { ErpData } from "@/types/erp";

const STORAGE_KEY = "sitecost-erp-data-v2";
const LEGACY_STORAGE_KEY = "binaa-erp-data-v1";

export function createEmptyErpData(): ErpData {
  return {
    version: 1,
    companies: [], customers: [], suppliers: [], subcontractors: [], projects: [],
    boqItems: [], purchaseOrders: [], inventoryMovements: [], expenses: [], certificates: [],
    contracts: [], variationOrders: [], wbsNodes: [], costCodes: [], warehouses: [],
    chartOfAccounts: [], accountingMappings: [], journalEntries: [], fiscalPeriods: [],
    documents: [], accountingDocuments: [], settlements: [], users: [],
    settings: { currency: "EGP", vatRate: 14, withholdingRate: 1, allowNegativeStock: false, supplierLiabilityRecognition: "on-supplier-invoice", revenueRecognitionMethod: "on-certificate", overheadAllocationMethod: "manual" },
  };
}

function isErpData(value: unknown): value is ErpData {
  if (!value || typeof value !== "object") return false;
  const data = value as Partial<ErpData>;
  return data.version === 1 && Array.isArray(data.companies) && Array.isArray(data.projects) && Array.isArray(data.journalEntries);
}

export function normalizeErpData(data: ErpData): ErpData {
  const defaults = createEmptyErpData();
  const accountNames = new Map((data.chartOfAccounts ?? []).map((account) => [account.code, account.name]));
  const projects = data.projects.map((project) => ({
    ...project,
    costCenterCode: project.costCenterCode || `CC-${project.code}`,
    wbsCode: project.wbsCode || `WBS-${project.code}`,
  }));
  const fallbackCompany = data.companies[0]?.id ?? "co-atlas";
  const customers = (data.customers ?? []).map((item) => ({ ...item, companyId: item.companyId || fallbackCompany }));
  const suppliers = (data.suppliers ?? []).map((item) => ({ ...item, companyId: item.companyId || fallbackCompany }));
  const subcontractors = (data.subcontractors ?? []).map((item) => ({ ...item, companyId: item.companyId || fallbackCompany }));
  const currentAccounts = data.chartOfAccounts ?? [];
  const chartOfAccounts = data.companies.flatMap((company) => {
    const companyAccounts = currentAccounts.filter((account) => account.companyId === company.id);
    return companyAccounts.map((account) => ({ ...account, normalBalance: account.normalBalance ?? (["liability", "equity", "revenue"].includes(account.type) ? "credit" as const : "debit" as const), cashFlowCategory: account.cashFlowCategory ?? "operating" as const }));
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
    accountingMappings: data.accountingMappings ?? [],
    fiscalPeriods: data.fiscalPeriods ?? [],
    journalEntries: normalizedJournals,
    accountingDocuments: data.accountingDocuments ?? [],
    settlements: data.settlements ?? [],
    users: data.users ?? [],
    settings: {
      ...defaults.settings,
      ...data.settings,
    },
  };
}

export class LocalStorageErpRepository implements ErpRepository {
  load(): ErpData {
    if (typeof window === "undefined") return createEmptyErpData();
    const current = window.localStorage.getItem(STORAGE_KEY);
    const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    const saved = current ?? legacy;
    if (!saved) {
      const initial = createEmptyErpData();
      this.save(initial);
      return initial;
    }
    try {
      const parsed: unknown = JSON.parse(saved);
      if (!isErpData(parsed)) return createEmptyErpData();
      const migrated = normalizeErpData(parsed);
      if (!current && legacy) this.save(migrated);
      return migrated;
    } catch {
      return createEmptyErpData();
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
    const normalized = normalizeErpData(parsed);
    this.save(normalized);
    return normalized;
  }
}

export const erpRepository = new LocalStorageErpRepository();
