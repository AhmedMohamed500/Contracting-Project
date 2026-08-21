export type Id = string;
export type Status = "active" | "archived" | "draft" | "submitted" | "approved" | "posted" | "cancelled";

export interface BaseRecord { id: Id; createdAt: string; updatedAt: string; }
export interface Company extends BaseRecord { name: string; nameEn: string; taxNumber: string; phone: string; email: string; address: string; status: "active" | "archived"; }
export interface Party extends BaseRecord { name: string; code: string; phone: string; email: string; taxNumber: string; balance: number; status: "active" | "archived"; }
export interface Project extends BaseRecord { code: string; name: string; customerId: Id; companyId: Id; location: string; contractValue: number; budget: number; actualCost: number; progress: number; startDate: string; endDate: string; status: "active" | "archived"; }
export interface BoqItem extends BaseRecord { projectId: Id; code: string; description: string; unit: string; quantity: number; unitRate: number; budgetRate: number; actualQuantity: number; }
export interface PurchaseOrder extends BaseRecord { number: string; projectId: Id; supplierId: Id; description: string; amount: number; receivedAmount: number; status: Status; }
export interface InventoryMovement extends BaseRecord { number: string; projectId: Id; material: string; warehouse: string; type: "receipt" | "issue" | "transfer" | "return"; quantity: number; unitCost: number; status: "posted" | "cancelled"; }
export interface Expense extends BaseRecord { number: string; projectId: Id; costCode: string; description: string; amount: number; date: string; status: "draft" | "approved" | "posted"; }
export interface Certificate extends BaseRecord { number: string; projectId: Id; partyId: Id; type: "customer" | "subcontractor"; grossAmount: number; retentionRate: number; taxRate: number; paidAmount: number; status: Status; }
export interface JournalLine { account: string; description: string; debit: number; credit: number; }
export interface JournalEntry extends BaseRecord { number: string; date: string; description: string; projectId?: Id; lines: JournalLine[]; status: "draft" | "posted" | "reversed"; }
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
  journalEntries: JournalEntry[];
  documents: DocumentMetadata[];
  settings: { currency: string; vatRate: number; withholdingRate: number; allowNegativeStock: boolean; };
}
