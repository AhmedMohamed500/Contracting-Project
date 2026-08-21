import type { ErpData } from "@/types/erp";

const now = "2026-08-21T09:00:00.000Z";
const base = { createdAt: now, updatedAt: now };

export const demoData: ErpData = {
  version: 1,
  companies: [{ id: "co-atlas", ...base, name: "أطلس للمقاولات", nameEn: "Atlas Construction", taxNumber: "EG-310-445-990", phone: "+20 2 2456 8800", email: "info@atlas.demo", address: "القاهرة الجديدة، مصر", status: "active" }],
  customers: [
    { id: "cus-1", ...base, name: "شركة الإسكندرية للاستثمار", code: "CUS-001", phone: "+20 3 555 0140", email: "finance@alexinvest.demo", taxNumber: "310-100-221", balance: 1850000, status: "active" },
    { id: "cus-2", ...base, name: "النيل للتطوير العقاري", code: "CUS-002", phone: "+20 2 555 2810", email: "accounts@nile.demo", taxNumber: "310-100-222", balance: 920000, status: "active" }
  ],
  suppliers: [
    { id: "sup-1", ...base, name: "دلتا لمواد البناء", code: "SUP-001", phone: "+20 2 555 1001", email: "sales@delta.demo", taxNumber: "440-201-111", balance: 780000, status: "active" },
    { id: "sup-2", ...base, name: "الإسكندرية لتوريدات الصلب", code: "SUP-002", phone: "+20 3 555 1002", email: "sales@alexsteel.demo", taxNumber: "440-201-112", balance: 640000, status: "active" },
    { id: "sup-3", ...base, name: "القاهرة لتجارة الأسمنت", code: "SUP-003", phone: "+20 2 555 1003", email: "sales@cairocement.demo", taxNumber: "440-201-113", balance: 320000, status: "active" }
  ],
  subcontractors: [{ id: "sub-1", ...base, name: "روّاد للأعمال الكهروميكانيكية", code: "SUB-001", phone: "+20 10 555 1100", email: "ops@rowad.demo", taxNumber: "550-901-212", balance: 470000, status: "active" }],
  projects: [
    { id: "prj-1", ...base, code: "PRJ-026", name: "مركز الإسكندرية للأعمال", customerId: "cus-1", companyId: "co-atlas", location: "سموحة، الإسكندرية", contractValue: 48500000, budget: 38600000, actualCost: 24100000, progress: 68, startDate: "2025-01-15", endDate: "2026-12-20", status: "active" },
    { id: "prj-2", ...base, code: "PRJ-031", name: "كمبوند القاهرة الجديدة السكني", customerId: "cus-2", companyId: "co-atlas", location: "التجمع الخامس، القاهرة", contractValue: 72000000, budget: 58100000, actualCost: 39600000, progress: 54, startDate: "2025-06-01", endDate: "2027-03-30", status: "active" },
    { id: "prj-3", ...base, code: "PRJ-034", name: "منتجع الساحل الشمالي", customerId: "cus-2", companyId: "co-atlas", location: "العلمين الجديدة", contractValue: 36500000, budget: 30200000, actualCost: 10100000, progress: 29, startDate: "2026-02-10", endDate: "2027-06-15", status: "active" }
  ],
  boqItems: [
    { id: "boq-1", ...base, projectId: "prj-1", code: "03-CON-001", description: "خرسانة مسلحة للأساسات", unit: "م³", quantity: 3200, unitRate: 4650, budgetRate: 3900, actualQuantity: 2380 },
    { id: "boq-2", ...base, projectId: "prj-1", code: "05-STL-001", description: "حديد تسليح عالي المقاومة", unit: "طن", quantity: 780, unitRate: 43500, budgetRate: 38100, actualQuantity: 542 },
    { id: "boq-3", ...base, projectId: "prj-2", code: "09-FIN-004", description: "توريد وتركيب بلاط سيراميك", unit: "م²", quantity: 18400, unitRate: 780, budgetRate: 610, actualQuantity: 7200 }
  ],
  purchaseOrders: [
    { id: "po-1", ...base, number: "PO-2026-0047", projectId: "prj-1", supplierId: "sup-2", description: "حديد تسليح 16–25 مم", amount: 3240000, receivedAmount: 2430000, status: "approved" },
    { id: "po-2", ...base, number: "PO-2026-0051", projectId: "prj-2", supplierId: "sup-3", description: "أسمنت بورتلاندي", amount: 1860000, receivedAmount: 1860000, status: "posted" }
  ],
  inventoryMovements: [
    { id: "mov-1", ...base, number: "GRN-2026-0038", projectId: "prj-1", material: "حديد تسليح", warehouse: "مخزن موقع الإسكندرية", type: "receipt", quantity: 65, unitCost: 40500, status: "posted" },
    { id: "mov-2", ...base, number: "MAT-ISS-2026-0081", projectId: "prj-1", material: "حديد تسليح", warehouse: "مخزن موقع الإسكندرية", type: "issue", quantity: 42, unitCost: 40500, status: "posted" },
    { id: "mov-3", ...base, number: "GRN-2026-0040", projectId: "prj-2", material: "أسمنت", warehouse: "مخزن التجمع", type: "receipt", quantity: 900, unitCost: 1980, status: "posted" }
  ],
  expenses: [
    { id: "exp-1", ...base, number: "EXP-2026-0102", projectId: "prj-1", costCode: "SITE-OPS", description: "تشغيل وتجهيزات الموقع", amount: 184000, date: "2026-08-15", status: "posted" },
    { id: "exp-2", ...base, number: "EXP-2026-0108", projectId: "prj-2", costCode: "EQUIP", description: "إيجار معدات رفع", amount: 235000, date: "2026-08-18", status: "approved" }
  ],
  certificates: [
    { id: "cert-1", ...base, number: "CERT-CUS-2026-0008", projectId: "prj-1", partyId: "cus-1", type: "customer", grossAmount: 7200000, retentionRate: 5, taxRate: 14, paidAmount: 5900000, status: "posted" },
    { id: "cert-2", ...base, number: "CERT-SUB-2026-0011", projectId: "prj-1", partyId: "sub-1", type: "subcontractor", grossAmount: 1650000, retentionRate: 10, taxRate: 14, paidAmount: 900000, status: "approved" }
  ],
  journalEntries: [
    { id: "jv-1", ...base, number: "JV-2026-0097", date: "2026-08-15", description: "إثبات مصروف تشغيل الموقع", projectId: "prj-1", status: "posted", lines: [{ account: "5101", description: "مصروفات موقع", debit: 184000, credit: 0 }, { account: "1102", description: "البنك", debit: 0, credit: 184000 }] }
  ],
  documents: [{ id: "doc-1", ...base, fileName: "Alexandria-Contract-v3.pdf", type: "application/pdf", size: 2850000, category: "Contract", projectId: "prj-1", relatedTransaction: "PRJ-026", description: "نسخة العقد المعتمدة", uploadDate: "2026-07-10" }],
  settings: { currency: "EGP", vatRate: 14, withholdingRate: 1, allowNegativeStock: false }
};
