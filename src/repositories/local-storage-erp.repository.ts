import type { ErpRepository } from "./erp.repository";
import type { AccountingDocument, AuditEvent, ErpData, FiscalPeriod, JournalEntry, JournalLine, SettlementAllocation, SettlementDocument } from "@/types/erp";
import { withAccountClassification } from "@/services/account-classification";

const STORAGE_KEY = "sitecost-erp-data-v2";
const LEGACY_STORAGE_KEY = "binaa-erp-data-v1";

const asArray = <T>(value: unknown): T[] => Array.isArray(value) ? value.filter((item): item is T => Boolean(item) && typeof item === "object") : [];
const amount = (value: unknown): number => typeof value === "number" && Number.isFinite(value) ? value : Number(value) || 0;

export function defaultClosingTasks(): FiscalPeriod["closingTasks"] {
  return [
    "ترحيل فواتير الموردين", "ترحيل مستخلصات العملاء", "ترحيل مستخلصات مقاولي الباطن",
    "ترحيل التحصيلات", "ترحيل المدفوعات", "مطابقة المخزون", "إتمام الجرد النقدي",
    "مطابقة البنوك", "مراجعة السلف", "ترحيل الاستحقاقات والتسويات",
    "مراجعة ميزان المراجعة", "مراجعة الميزان المعدل", "مراجعة القوائم المالية",
  ].map((label, index) => ({ id: `close-${index + 1}`, label, completed: false }));
}

export function createEmptyErpData(): ErpData {
  return {
    version: 1,
    companies: [], customers: [], suppliers: [], subcontractors: [], projects: [],
    boqItems: [], purchaseOrders: [], inventoryMovements: [], expenses: [], certificates: [],
    contracts: [], variationOrders: [], wbsNodes: [], costCodes: [], warehouses: [],
    chartOfAccounts: [], accountingMappings: [], journalEntries: [], fiscalPeriods: [],
    documents: [], accountingDocuments: [], settlements: [], users: [],
    tenders: [], tenderDocuments: [], tenderAddenda: [], tenderClarifications: [], tenderEstimateVersions: [], bidBonds: [],
    correspondence: [], letterTemplates: [], numberingRules: [], contractGuarantees: [], contractClauses: [],
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
  const companies = asArray<ErpData["companies"][number]>(data.companies);
  const sourceAccounts = asArray<ErpData["chartOfAccounts"][number]>(data.chartOfAccounts);
  const accountNames = new Map(sourceAccounts.map((account) => [account.code, account.name]));
  const projects = asArray<ErpData["projects"][number]>(data.projects).map((project) => ({
    ...project,
    costCenterCode: project.costCenterCode || `CC-${project.code}`,
    wbsCode: project.wbsCode || `WBS-${project.code}`,
  }));
  const fallbackCompany = companies[0]?.id ?? "unassigned-company";
  const customers = asArray<ErpData["customers"][number]>(data.customers).map((item) => ({ ...item, companyId: item.companyId || fallbackCompany }));
  const suppliers = asArray<ErpData["suppliers"][number]>(data.suppliers).map((item) => ({ ...item, companyId: item.companyId || fallbackCompany }));
  const subcontractors = asArray<ErpData["subcontractors"][number]>(data.subcontractors).map((item) => ({ ...item, companyId: item.companyId || fallbackCompany }));
  const chartOfAccounts = companies.flatMap((company) => {
    const companyAccounts = sourceAccounts.filter((account) => (account.companyId || fallbackCompany) === company.id);
    return companyAccounts.map((account) => withAccountClassification({ ...account, active: account.active ?? true, isControl: account.isControl ?? false }));
  });
  const normalizedJournals = asArray<JournalEntry>(data.journalEntries).map((entry) => {
    const project = projects.find((item) => item.id === entry.projectId);
    const auditTrail = asArray<AuditEvent>(entry.auditTrail);
    const legacyLines = asArray<JournalLine & { account?: string }>(entry.lines);
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
      auditTrail: auditTrail.length ? auditTrail : [{ action: "create" as const, user: entry.createdBy || "System Migration", timestamp: entry.createdAt || new Date().toISOString() }],
      lines: legacyLines.map((line) => {
        const accountCode = line.accountCode || line.account || "000000";
        return { ...line, accountCode, accountName: line.accountName || accountNames.get(accountCode) || "حساب غير معرّف", description: line.description || entry.description || "—", debit: amount(line.debit), credit: amount(line.credit), projectId: line.projectId || entry.projectId, costCenterCode: line.costCenterCode || entry.costCenterCode || project?.costCenterCode, wbsCode: line.wbsCode || project?.wbsCode, reference: line.reference || entry.reference || entry.number, sourceModule: line.sourceModule || entry.sourceModule || "Manual Journal", sourceDocument: line.sourceDocument || entry.sourceNumber || entry.number };
      }),
    };
  });
  const fiscalPeriods = asArray<FiscalPeriod>(data.fiscalPeriods).map((period) => {
    const tasks = asArray<FiscalPeriod["closingTasks"][number]>(period.closingTasks).map((task, index) => ({ id: task.id || `close-${index + 1}`, label: task.label || `Closing task ${index + 1}`, completed: Boolean(task.completed) }));
    return { ...period, closingTasks: tasks.length ? tasks : defaultClosingTasks() };
  });
  const accountingDocuments = asArray<AccountingDocument>(data.accountingDocuments).map((document) => ({ ...document, taxableAmount: amount(document.taxableAmount), taxRate: amount(document.taxRate), taxAmount: amount(document.taxAmount), withholdingAmount: amount(document.withholdingAmount), otherDeductions: amount(document.otherDeductions), grossAmount: amount(document.grossAmount), netAmount: amount(document.netAmount), settledAmount: amount(document.settledAmount), attachments: asArray<AccountingDocument["attachments"][number]>(document.attachments) }));
  const settlements = asArray<SettlementDocument>(data.settlements).map((settlement) => ({ ...settlement, amount: amount(settlement.amount), allocations: asArray<SettlementAllocation>(settlement.allocations).map((allocation) => ({ ...allocation, amount: amount(allocation.amount) })) }));
  return {
    ...data,
    companies,
    customers,
    suppliers,
    subcontractors,
    projects,
    boqItems: asArray<ErpData["boqItems"][number]>(data.boqItems),
    purchaseOrders: asArray<ErpData["purchaseOrders"][number]>(data.purchaseOrders),
    inventoryMovements: asArray<ErpData["inventoryMovements"][number]>(data.inventoryMovements),
    expenses: asArray<ErpData["expenses"][number]>(data.expenses),
    certificates: asArray<ErpData["certificates"][number]>(data.certificates),
    contracts: asArray<ErpData["contracts"][number]>(data.contracts),
    variationOrders: asArray<ErpData["variationOrders"][number]>(data.variationOrders),
    wbsNodes: asArray<ErpData["wbsNodes"][number]>(data.wbsNodes),
    costCodes: asArray<ErpData["costCodes"][number]>(data.costCodes),
    warehouses: asArray<ErpData["warehouses"][number]>(data.warehouses),
    chartOfAccounts,
    accountingMappings: asArray<ErpData["accountingMappings"][number]>(data.accountingMappings),
    fiscalPeriods,
    journalEntries: normalizedJournals,
    documents: asArray<ErpData["documents"][number]>(data.documents),
    accountingDocuments,
    settlements,
    tenders: asArray<ErpData["tenders"][number]>(data.tenders).map((tender) => ({ ...tender, checklist: asArray<ErpData["tenders"][number]["checklist"][number]>(tender.checklist), costing: { directCost: amount(tender.costing?.directCost), indirectCost: amount(tender.costing?.indirectCost), overhead: amount(tender.costing?.overhead), contingency: amount(tender.costing?.contingency), markup: amount(tender.costing?.markup), sellingValue: amount(tender.costing?.sellingValue) }, probability: amount(tender.probability), estimatedValue: amount(tender.estimatedValue), bidBondAmount: amount(tender.bidBondAmount) })),
    tenderDocuments: asArray<ErpData["tenderDocuments"][number]>(data.tenderDocuments),
    tenderAddenda: asArray<ErpData["tenderAddenda"][number]>(data.tenderAddenda),
    tenderClarifications: asArray<ErpData["tenderClarifications"][number]>(data.tenderClarifications),
    tenderEstimateVersions: asArray<ErpData["tenderEstimateVersions"][number]>(data.tenderEstimateVersions),
    bidBonds: asArray<ErpData["bidBonds"][number]>(data.bidBonds),
    correspondence: asArray<ErpData["correspondence"][number]>(data.correspondence).map((record) => ({ ...record, attachments: asArray<ErpData["correspondence"][number]["attachments"][number]>(record.attachments), auditTrail: asArray<ErpData["correspondence"][number]["auditTrail"][number]>(record.auditTrail), details: record.details && typeof record.details === "object" ? record.details : {} })),
    letterTemplates: asArray<ErpData["letterTemplates"][number]>(data.letterTemplates),
    numberingRules: asArray<ErpData["numberingRules"][number]>(data.numberingRules),
    contractGuarantees: asArray<ErpData["contractGuarantees"][number]>(data.contractGuarantees),
    contractClauses: asArray<ErpData["contractClauses"][number]>(data.contractClauses),
    users: asArray<ErpData["users"][number]>(data.users).map((user) => ({ ...user, companyIds: Array.isArray(user.companyIds) ? user.companyIds.filter((id): id is string => typeof id === "string") : [], projectIds: Array.isArray(user.projectIds) ? user.projectIds.filter((id): id is string => typeof id === "string") : [] })),
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
      if ((!current && legacy) || JSON.stringify(parsed) !== JSON.stringify(migrated)) this.save(migrated);
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
