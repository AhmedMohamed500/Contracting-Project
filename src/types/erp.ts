export type Id = string;
export type Status = "active" | "archived" | "draft" | "submitted" | "approved" | "posted" | "cancelled";
export type JournalStatus = "draft" | "reviewed" | "posted" | "reversed" | "cancelled";
export type AccountType = "asset" | "liability" | "equity" | "revenue" | "cost" | "expense";
export type StatementType = "balance-sheet" | "income-statement";
export type NormalBalance = "debit" | "credit";
export type CashFlowCategory = "operating" | "investing" | "financing" | "non-cash";
export type AccountingDocumentType = "supplier-invoice" | "expense-invoice" | "customer-certificate" | "subcontractor-certificate" | "cash-receipt" | "cash-payment" | "bank-receipt" | "bank-payment" | "bank-transfer" | "employee-advance" | "advance-settlement" | "credit-note" | "debit-note" | "inventory-adjustment" | "journal-voucher" | "opening-balance";
export type DocumentWorkflowStatus = "draft" | "submitted" | "under-review" | "approved" | "posted" | "rejected" | "cancelled";
export type SettlementStatus = "unpaid" | "partially-settled" | "settled" | "not-applicable";

export interface BaseRecord { id: Id; createdAt: string; updatedAt: string; }
export interface Company extends BaseRecord { code?: string; name: string; nameEn: string; commercialRegistration?: string; taxNumber: string; phone: string; email: string; address: string; country?: string; currency?: string; fiscalYearStartMonth?: number; defaultTaxRate?: number; defaultRetentionRate?: number; logoMetadata?: string; logoDataUrl?: string; status: "active" | "archived"; }
export type UserRole = "owner" | "general-manager" | "finance-manager" | "accountant" | "project-manager" | "site-engineer" | "procurement" | "warehouse-keeper" | "auditor";
export interface ErpUser extends BaseRecord { fullName: string; username: string; passwordHash: string; passwordSalt: string; passwordIterations: number; role: UserRole; companyIds: Id[]; projectIds: Id[]; status: "active" | "archived"; }
export interface Party extends BaseRecord { companyId?: Id; name: string; code: string; phone: string; email: string; taxNumber: string; balance: number; status: "active" | "archived"; }
export interface Project extends BaseRecord { code: string; name: string; customerId: Id; companyId: Id; costCenterCode: string; wbsCode: string; location: string; contractValue: number; budget: number; actualCost: number; progress: number; startDate: string; endDate: string; status: "active" | "archived"; }
export interface BoqItem extends BaseRecord { projectId: Id; code: string; description: string; unit: string; quantity: number; unitRate: number; budgetRate: number; actualQuantity: number; }
export interface PurchaseOrder extends BaseRecord { number: string; projectId: Id; supplierId: Id; description: string; amount: number; receivedAmount: number; status: Status; }
export interface InventoryMovement extends BaseRecord { number: string; projectId: Id; material: string; warehouse: string; type: "receipt" | "issue" | "transfer" | "return"; quantity: number; unitCost: number; status: "posted" | "cancelled"; }
export interface Expense extends BaseRecord { number: string; projectId?: Id; costCode: string; description: string; amount: number; date: string; status: "draft" | "approved" | "posted"; }
export type CertificateMethod = "overall-progress" | "boq-quantities" | "boq-progress" | "milestone" | "manual-lines";
export interface CertificateLine { id: Id; boqItemId?: Id; description: string; contractQuantity: number; previousQuantity: number; currentQuantity: number; cumulativeQuantity: number; unitRate: number; currentValue: number; cumulativeValue: number; }
export interface Certificate extends BaseRecord { number: string; projectId: Id; partyId: Id; type: "customer" | "subcontractor"; method?: CertificateMethod; period?: string; previousCertificateId?: Id; previousProgress?: number; currentPeriodProgress?: number; cumulativeProgress?: number; approvedVariations?: number; advanceOriginal?: number; previousAdvanceRecovery?: number; currentAdvanceRecovery?: number; releasedRetention?: number; withholdingAmount?: number; materialDeductions?: number; equipmentDeductions?: number; penaltyAmount?: number; otherDeductions?: number; isFinal?: boolean; lines?: CertificateLine[]; grossAmount: number; retentionRate: number; taxRate: number; paidAmount: number; status: Status; }
export interface Contract extends BaseRecord { number: string; companyId: Id; projectId: Id; customerId: Id; type: "lump-sum" | "unit-price" | "cost-plus" | "time-material" | "other"; originalValue: number; startDate: string; endDate: string; advanceRate: number; retentionRate: number; paymentTerms: string; penaltyRate: number; status: "draft" | "active" | "completed" | "closed" | "cancelled"; }
export interface VariationOrder extends BaseRecord { number: string; companyId: Id; projectId: Id; contractId: Id; description: string; costImpact: number; revenueImpact: number; scheduleImpactDays: number; status: "request" | "under-pricing" | "submitted" | "approved" | "rejected"; }
export interface WbsNode extends BaseRecord { companyId: Id; projectId: Id; code: string; name: string; parentId?: Id; order: number; status: "active" | "archived"; }
export interface CostCode extends BaseRecord { companyId: Id; code: string; name: string; parentId?: Id; order: number; status: "active" | "archived"; }
export interface Warehouse extends BaseRecord { companyId: Id; projectId?: Id; code: string; name: string; type: "company-main" | "project" | "site" | "temporary" | "equipment"; location: string; keeper: string; reservedStock: number; status: "active" | "archived"; }
export interface ChartOfAccount extends BaseRecord { companyId: Id; code: string; name: string; nameEn: string; type: AccountType; statementType?: StatementType; statementSection?: string; normalBalance?: NormalBalance; cashFlowCategory?: CashFlowCategory; parentCode?: string; isControl: boolean; active: boolean; }
export interface AccountingMapping extends BaseRecord { companyId: Id; customerControl: string; supplierControl: string; subcontractorControl: string; inventory: string; materialCost: string; laborCost: string; equipmentCost: string; subcontractorCost: string; siteExpense: string; projectRevenue: string; wip: string; retentionReceivable: string; retentionPayable: string; cash: string; bank: string; vatOutput: string; vatInput: string; }
export interface JournalLine { accountCode: string; accountName: string; description: string; debit: number; credit: number; projectId?: Id; costCenterCode?: string; costCode?: string; wbsCode?: string; boqItemId?: Id; reference?: string; sourceModule?: string; sourceDocument?: string; }
export interface AuditEvent { action: "create" | "review" | "post" | "reverse" | "cancel"; user: string; timestamp: string; note?: string; }
export interface JournalEntry extends BaseRecord { number: string; companyId: Id; date: string; description: string; projectId?: Id; costCenterCode?: string; reference?: string; journalType: "opening" | "general" | "purchases" | "certificate" | "cash-receipt" | "cash-payment" | "bank-receipt" | "bank-payment" | "bank-transfer" | "bank" | "inventory" | "subcontractor" | "adjustment" | "closing" | "reversal"; sourceModule: string; sourceType: string; sourceNumber: string; automatic: boolean; lines: JournalLine[]; status: JournalStatus; createdBy: string; postedBy?: string; reversedFromId?: Id; auditTrail: AuditEvent[]; }
export interface FiscalPeriod extends BaseRecord { companyId: Id; fiscalYear: number; month: number; name: string; status: "open" | "soft-closed" | "closed"; closingTasks: { id: string; label: string; completed: boolean }[]; }
export interface DocumentMetadata extends BaseRecord { fileName: string; type: string; size: number; category: string; projectId?: Id; relatedTransaction?: string; description: string; uploadDate: string; }
export interface DocumentAttachment { id: Id; fileName: string; fileType: string; fileSize: number; uploadDate: string; relatedDocument: string; }
export interface AccountingDocument extends BaseRecord {
  number: string;
  sourceNumber: string;
  type: AccountingDocumentType;
  companyId: Id;
  projectId?: Id;
  partyId?: Id;
  contractId?: Id;
  purchaseOrderId?: Id;
  receiptId?: Id;
  certificateId?: Id;
  wbsCode?: string;
  boqItemId?: Id;
  costCode?: string;
  costCenterCode?: string;
  accountCode?: string;
  taxCode?: string;
  taxableAmount: number;
  taxRate: number;
  taxAmount: number;
  withholdingAmount: number;
  otherDeductions: number;
  grossAmount: number;
  netAmount: number;
  settledAmount: number;
  currency: string;
  documentDate: string;
  dueDate?: string;
  reference?: string;
  description: string;
  paymentTerms?: string;
  workflowStatus: DocumentWorkflowStatus;
  accountingStatus: "not-classified" | "classified" | "draft-journal" | "posted" | "reversed";
  settlementStatus: SettlementStatus;
  journalId?: Id;
  attachments: DocumentAttachment[];
  createdBy: string;
}
export interface SettlementAllocation { id: Id; documentId: Id; amount: number; }
export interface SettlementDocument extends BaseRecord { number: string; companyId: Id; projectId?: Id; partyId: Id; type: "customer-collection" | "supplier-payment" | "subcontractor-payment"; channel: "cash" | "bank"; amount: number; date: string; reference?: string; description: string; status: "draft" | "posted" | "cancelled"; allocations: SettlementAllocation[]; journalId?: Id; createdBy: string; }

export interface ErpData {
  version: 1;
  companies: Company[];
  customers: Party[];
  suppliers: Party[];
  subcontractors: Party[];
  projects: Project[];
  boqItems: BoqItem[];
  purchaseOrders: PurchaseOrder[];
  inventoryMovements: InventoryMovement[];
  expenses: Expense[];
  certificates: Certificate[];
  contracts: Contract[];
  variationOrders: VariationOrder[];
  wbsNodes: WbsNode[];
  costCodes: CostCode[];
  warehouses: Warehouse[];
  chartOfAccounts: ChartOfAccount[];
  accountingMappings: AccountingMapping[];
  journalEntries: JournalEntry[];
  fiscalPeriods: FiscalPeriod[];
  documents: DocumentMetadata[];
  accountingDocuments: AccountingDocument[];
  settlements: SettlementDocument[];
  users: ErpUser[];
  settings: { currency: string; vatRate: number; withholdingRate: number; allowNegativeStock: boolean; supplierLiabilityRecognition: "on-receipt" | "on-supplier-invoice"; revenueRecognitionMethod: "on-certificate" | "percentage-of-completion"; overheadAllocationMethod: "manual" | "revenue" | "direct-cost" | "contract-value"; };
}
