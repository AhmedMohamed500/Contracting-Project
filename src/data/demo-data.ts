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
    { id: "prj-1", ...base, code: "PRJ-026", name: "مركز الإسكندرية للأعمال", customerId: "cus-1", companyId: "co-atlas", costCenterCode: "CC-PRJ-026", wbsCode: "WBS-ABC", location: "سموحة، الإسكندرية", contractValue: 48500000, budget: 38600000, actualCost: 24100000, progress: 68, startDate: "2025-01-15", endDate: "2026-12-20", status: "active" },
    { id: "prj-2", ...base, code: "PRJ-031", name: "كمبوند القاهرة الجديدة السكني", customerId: "cus-2", companyId: "co-atlas", costCenterCode: "CC-PRJ-031", wbsCode: "WBS-NCR", location: "التجمع الخامس، القاهرة", contractValue: 72000000, budget: 58100000, actualCost: 39600000, progress: 54, startDate: "2025-06-01", endDate: "2027-03-30", status: "active" },
    { id: "prj-3", ...base, code: "PRJ-034", name: "منتجع الساحل الشمالي", customerId: "cus-2", companyId: "co-atlas", costCenterCode: "CC-PRJ-034", wbsCode: "WBS-NCRS", location: "العلمين الجديدة", contractValue: 36500000, budget: 30200000, actualCost: 10100000, progress: 29, startDate: "2026-02-10", endDate: "2027-06-15", status: "active" }
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
  chartOfAccounts: [
    { id: "acc-110100", ...base, companyId: "co-atlas", code: "110100", name: "النقدية بالصندوق", nameEn: "Cash on Hand", type: "asset", isControl: false, active: true },
    { id: "acc-110200", ...base, companyId: "co-atlas", code: "110200", name: "البنوك", nameEn: "Banks", type: "asset", isControl: true, active: true },
    { id: "acc-120100", ...base, companyId: "co-atlas", code: "120100", name: "ذمم العملاء", nameEn: "Customer Receivables", type: "asset", isControl: true, active: true },
    { id: "acc-120200", ...base, companyId: "co-atlas", code: "120200", name: "احتجازات لدى العملاء", nameEn: "Retention Receivable", type: "asset", isControl: true, active: true },
    { id: "acc-130100", ...base, companyId: "co-atlas", code: "130100", name: "مخزون المواد", nameEn: "Materials Inventory", type: "asset", isControl: true, active: true },
    { id: "acc-140100", ...base, companyId: "co-atlas", code: "140100", name: "أعمال تحت التنفيذ", nameEn: "Work in Progress", type: "asset", isControl: true, active: true },
    { id: "acc-210100", ...base, companyId: "co-atlas", code: "210100", name: "ذمم الموردين", nameEn: "Supplier Payables", type: "liability", isControl: true, active: true },
    { id: "acc-210200", ...base, companyId: "co-atlas", code: "210200", name: "ذمم مقاولي الباطن", nameEn: "Subcontractor Payables", type: "liability", isControl: true, active: true },
    { id: "acc-210300", ...base, companyId: "co-atlas", code: "210300", name: "احتجازات مقاولي الباطن", nameEn: "Retention Payable", type: "liability", isControl: true, active: true },
    { id: "acc-220100", ...base, companyId: "co-atlas", code: "220100", name: "ضريبة القيمة المضافة", nameEn: "VAT Control", type: "liability", isControl: true, active: true },
    { id: "acc-410100", ...base, companyId: "co-atlas", code: "410100", name: "إيرادات عقود المشاريع", nameEn: "Project Contract Revenue", type: "revenue", isControl: false, active: true },
    { id: "acc-510100", ...base, companyId: "co-atlas", code: "510100", name: "تكلفة مواد المشاريع", nameEn: "Project Materials Cost", type: "cost", parentCode: "510000", isControl: false, active: true },
    { id: "acc-510200", ...base, companyId: "co-atlas", code: "510200", name: "تكلفة عمالة المشاريع", nameEn: "Project Labor Cost", type: "cost", parentCode: "510000", isControl: false, active: true },
    { id: "acc-510300", ...base, companyId: "co-atlas", code: "510300", name: "تكلفة معدات المشاريع", nameEn: "Project Equipment Cost", type: "cost", parentCode: "510000", isControl: false, active: true },
    { id: "acc-510400", ...base, companyId: "co-atlas", code: "510400", name: "تكلفة مقاولي الباطن", nameEn: "Subcontractor Cost", type: "cost", parentCode: "510000", isControl: false, active: true },
    { id: "acc-510600", ...base, companyId: "co-atlas", code: "510600", name: "مصروفات المواقع", nameEn: "Site Expenses", type: "cost", parentCode: "510000", isControl: false, active: true }
  ],
  accountingMappings: [{ id: "map-atlas", ...base, companyId: "co-atlas", customerControl: "120100", supplierControl: "210100", subcontractorControl: "210200", inventory: "130100", materialCost: "510100", laborCost: "510200", equipmentCost: "510300", subcontractorCost: "510400", siteExpense: "510600", projectRevenue: "410100", wip: "140100", retentionReceivable: "120200", retentionPayable: "210300", cash: "110100", bank: "110200", vatOutput: "220100", vatInput: "220100" }],
  journalEntries: [
    { id: "jv-1", ...base, number: "JV-2026-0097", companyId: "co-atlas", date: "2026-08-15", description: "إثبات مصروف تشغيل الموقع", projectId: "prj-1", costCenterCode: "CC-PRJ-026", reference: "EXP-2026-0102", journalType: "general", sourceModule: "Expenses", sourceType: "Project Expense", sourceNumber: "EXP-2026-0102", automatic: true, status: "posted", createdBy: "System", postedBy: "Finance Manager", auditTrail: [{ action: "create", user: "System", timestamp: now }, { action: "post", user: "Finance Manager", timestamp: now }], lines: [{ accountCode: "510600", accountName: "مصروفات المواقع", description: "تشغيل وتجهيزات الموقع", debit: 184000, credit: 0, projectId: "prj-1", costCenterCode: "CC-PRJ-026", costCode: "SITE-OPS", wbsCode: "WBS-ABC", reference: "EXP-2026-0102", sourceModule: "Expenses", sourceDocument: "EXP-2026-0102" }, { accountCode: "110200", accountName: "البنوك", description: "سداد مصروفات الموقع", debit: 0, credit: 184000, projectId: "prj-1", costCenterCode: "CC-PRJ-026", costCode: "SITE-OPS", wbsCode: "WBS-ABC", reference: "EXP-2026-0102", sourceModule: "Expenses", sourceDocument: "EXP-2026-0102" }] },
    { id: "jv-2", ...base, number: "INV-2026-0081", companyId: "co-atlas", date: "2026-08-16", description: "صرف حديد تسليح للمشروع", projectId: "prj-1", costCenterCode: "CC-PRJ-026", reference: "MAT-ISS-2026-0081", journalType: "inventory", sourceModule: "Inventory", sourceType: "Material Issue", sourceNumber: "MAT-ISS-2026-0081", automatic: true, status: "posted", createdBy: "System", postedBy: "System", auditTrail: [{ action: "create", user: "System", timestamp: now }, { action: "post", user: "System", timestamp: now }], lines: [{ accountCode: "510100", accountName: "تكلفة مواد المشاريع", description: "حديد تسليح", debit: 1701000, credit: 0, projectId: "prj-1", costCenterCode: "CC-PRJ-026", costCode: "01.03 — Reinforcement", wbsCode: "WBS-ABC", boqItemId: "boq-2", reference: "MAT-ISS-2026-0081", sourceModule: "Inventory", sourceDocument: "MAT-ISS-2026-0081" }, { accountCode: "130100", accountName: "مخزون المواد", description: "صرف حديد تسليح", debit: 0, credit: 1701000, projectId: "prj-1", costCenterCode: "CC-PRJ-026", costCode: "01.03 — Reinforcement", wbsCode: "WBS-ABC", boqItemId: "boq-2", reference: "MAT-ISS-2026-0081", sourceModule: "Inventory", sourceDocument: "MAT-ISS-2026-0081" }] },
    { id: "jv-3", ...base, number: "CERT-2026-0008", companyId: "co-atlas", date: "2026-08-12", description: "مستخلص عميل رقم 8", projectId: "prj-1", costCenterCode: "CC-PRJ-026", reference: "CERT-CUS-2026-0008", journalType: "certificate", sourceModule: "Certificates", sourceType: "Customer Certificate", sourceNumber: "CERT-CUS-2026-0008", automatic: true, status: "posted", createdBy: "System", postedBy: "Finance Manager", auditTrail: [{ action: "create", user: "System", timestamp: now }, { action: "post", user: "Finance Manager", timestamp: now }], lines: [{ accountCode: "120100", accountName: "ذمم العملاء", description: "صافي مستخلص العميل", debit: 7848000, credit: 0, projectId: "prj-1", costCenterCode: "CC-PRJ-026", wbsCode: "WBS-ABC", reference: "CERT-CUS-2026-0008", sourceModule: "Certificates", sourceDocument: "CERT-CUS-2026-0008" }, { accountCode: "120200", accountName: "احتجازات لدى العملاء", description: "احتجاز 5%", debit: 360000, credit: 0, projectId: "prj-1", costCenterCode: "CC-PRJ-026", wbsCode: "WBS-ABC", reference: "CERT-CUS-2026-0008", sourceModule: "Certificates", sourceDocument: "CERT-CUS-2026-0008" }, { accountCode: "410100", accountName: "إيرادات عقود المشاريع", description: "إيراد مستخلص العميل", debit: 0, credit: 7200000, projectId: "prj-1", costCenterCode: "CC-PRJ-026", wbsCode: "WBS-ABC", reference: "CERT-CUS-2026-0008", sourceModule: "Certificates", sourceDocument: "CERT-CUS-2026-0008" }, { accountCode: "220100", accountName: "ضريبة القيمة المضافة", description: "ضريبة المستخلص", debit: 0, credit: 1008000, projectId: "prj-1", costCenterCode: "CC-PRJ-026", wbsCode: "WBS-ABC", reference: "CERT-CUS-2026-0008", sourceModule: "Certificates", sourceDocument: "CERT-CUS-2026-0008" }] }
  ],
  fiscalPeriods: [{ id: "period-2026-08", ...base, companyId: "co-atlas", fiscalYear: 2026, month: 8, name: "أغسطس 2026", status: "open", closingTasks: [{ id: "purchases", label: "ترحيل فواتير المشتريات", completed: true }, { id: "customers", label: "مراجعة مستخلصات العملاء", completed: true }, { id: "subcontractors", label: "ترحيل مستخلصات مقاولي الباطن", completed: false }, { id: "inventory", label: "اعتماد تسويات المخزون", completed: false }, { id: "banks", label: "مراجعة البنوك والنقدية", completed: true }, { id: "accruals", label: "إثبات الاستحقاقات", completed: false }, { id: "trial", label: "مراجعة ميزان المراجعة", completed: false }, { id: "statements", label: "مراجعة القوائم المالية", completed: false }] }],
  documents: [{ id: "doc-1", ...base, fileName: "Alexandria-Contract-v3.pdf", type: "application/pdf", size: 2850000, category: "Contract", projectId: "prj-1", relatedTransaction: "PRJ-026", description: "نسخة العقد المعتمدة", uploadDate: "2026-07-10" }],
  settings: { currency: "EGP", vatRate: 14, withholdingRate: 1, allowNegativeStock: false }
};
