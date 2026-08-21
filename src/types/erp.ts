export type Id = string;
export type Status = "active" | "archived" | "draft" | "submitted" | "approved" | "posted" | "cancelled";
export type JournalStatus = "draft" | "reviewed" | "posted" | "reversed" | "cancelled";
export type AccountType = "asset" | "liability" | "equity" | "revenue" | "cost" | "expense";

export interface BaseRecord { id: Id; createdAt: string; updatedAt: string; }
export interface Company extends BaseRecord { name: string; nameEn: string; taxNumber: string; phone: string; email: string; address: string; status: "active" | "archived"; }
export interface Party extends BaseRecord { name: string; code: string; phone: string; email: string; taxNumber: string; balance: number; status: "active" | "archived"; }
export interface Project extends BaseRecord { code: string; name: string; customerId: Id; companyId: Id; costCenterCode: string; wbsCode: string; location: string; contractValue: number; budget: number; actualCost: number; progress: number; startDate: string; endDate: string; status: "active" | "archived"; }
export interface BoqItem extends BaseRecord { projectId: Id; code: string; description: string; unit: string; quantity: number; unitRate: number; budgetRate: number; actualQuantity: number; }
export interface PurchaseOrder extends BaseRecord { number: string; projectId: Id; supplierId: Id; description: string; amount: number; receivedAmount: number; status: Status; }
export interface InventoryMovement extends BaseRecord { number: string; projectId: Id; material: string; warehouse: string; type: "receipt" | "issue" | "transfer" | "return"; quantity: number; unitCost: number; status: "posted" | "cancelled"; }
export interface Expense extends BaseRecord { number: string; projectId?: Id; costCode: string; description: string; amount: number; date: string; status: "draft" | "approved" | "posted"; }
export interface Certificate extends BaseRecord { number: string; projectId: Id; partyId: Id; type: "customer" | "subcontractor"; grossAmount: number; retentionRate: number; taxRate: number; paidAmount: number; status: Status; }
export interface ChartOfAccount extends BaseRecord { companyId: Id; code: string; name: string; nameEn: string; type: AccountType; parentCode?: string; isControl: boolean; active: boolean; }
export interface AccountingMapping extends BaseRecord { companyId: Id; customerControl: string; supplierControl: string; subcontractorControl: string; inventory: string; materialCost: string; laborCost: string; equipmentCost: string; subcontractorCost: string; siteExpense: string; projectRevenue: string; wip: string; retentionReceivable: string; retentionPayable: string; cash: string; bank: string; vatOutput: string; vatInput: string; }
export interface JournalLine { accountCode: string; accountName: string; description: string; debit: number; credit: number; projectId?: Id; costCenterCode?: string; costCode?: string; wbsCode?: string; boqItemId?: Id; reference?: string; sourceModule?: string; sourceDocument?: string; }
export interface AuditEvent { action: "create" | "review" | "post" | "reverse" | "cancel"; user: string; timestamp: string; note?: string; }
export interface JournalEntry extends BaseRecord { number: string; companyId: Id; date: string; description: string; projectId?: Id; costCenterCode?: string; reference?: string; journalType: "general" | "purchases" | "certificate" | "cash-receipt" | "cash-payment" | "bank" | "inventory" | "subcontractor" | "adjustment" | "closing"; sourceModule: string; sourceType: string; sourceNumber: string; automatic: boolean; lines: JournalLine[]; status: JournalStatus; createdBy: string; postedBy?: string; reversedFromId?: Id; auditTrail: AuditEvent[]; }
export interface FiscalPeriod extends BaseRecord { companyId: Id; fiscalYear: number; month: number; name: string; status: "open" | "soft-closed" | "closed"; closingTasks: { id: string; label: string; completed: boolean }[]; }
export interface DocumentMetadata extends BaseRecord { fileName: string; type: string; size: number; category: string; projectId?: Id; relatedTransaction?: string; description: string; uploadDate: string; }

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
  chartOfAccounts: ChartOfAccount[];
  accountingMappings: AccountingMapping[];
  journalEntries: JournalEntry[];
  fiscalPeriods: FiscalPeriod[];
  documents: DocumentMetadata[];
  settings: { currency: string; vatRate: number; withholdingRate: number; allowNegativeStock: boolean; };
}
