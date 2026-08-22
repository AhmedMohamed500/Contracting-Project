import type { AccountType, AccountingDocument, AccountingDocumentType, ErpData, JournalEntry, JournalLine, SettlementDocument } from "@/types/erp";
import { assertBalancedJournal } from "@/services/business-calculations";
import { uid } from "@/utils/format";

const documentPrefixes: Record<AccountingDocumentType, string> = {
  "supplier-invoice": "SUP-INV", "expense-invoice": "EXP", "customer-certificate": "CUS-CERT",
  "subcontractor-certificate": "SUB-CERT", "cash-receipt": "CRV", "cash-payment": "CPV",
  "bank-receipt": "BANK-RCV", "bank-payment": "BANK-PAY", "bank-transfer": "BANK-TRF",
  "employee-advance": "ADV", "advance-settlement": "ADV-SET", "credit-note": "CN",
  "debit-note": "DN", "inventory-adjustment": "INV-ADJ", "journal-voucher": "JV", "opening-balance": "OPEN",
};

export const documentTypeLabels: Record<AccountingDocumentType, string> = {
  "supplier-invoice": "فاتورة مورد", "expense-invoice": "فاتورة مصروف", "customer-certificate": "مستخلص عميل",
  "subcontractor-certificate": "مستخلص مقاول باطن", "cash-receipt": "سند قبض نقدي", "cash-payment": "سند صرف نقدي",
  "bank-receipt": "إيداع بنكي", "bank-payment": "دفعة بنكية", "bank-transfer": "تحويل بنكي",
  "employee-advance": "عهدة موظف", "advance-settlement": "تسوية عهدة", "credit-note": "إشعار دائن",
  "debit-note": "إشعار مدين", "inventory-adjustment": "تسوية مخزون", "journal-voucher": "سند قيد", "opening-balance": "رصيد افتتاحي",
};

function now() { return new Date().toISOString(); }
function accountName(data: ErpData, code: string) { return data.chartOfAccounts.find((account) => account.code === code)?.name ?? `حساب ${code}`; }
function projectDimensions(data: ErpData, document: AccountingDocument) {
  const project = data.projects.find((item) => item.id === document.projectId);
  return { projectId: document.projectId, costCenterCode: document.costCenterCode || project?.costCenterCode, costCode: document.costCode, wbsCode: document.wbsCode || project?.wbsCode, boqItemId: document.boqItemId };
}
function line(data: ErpData, document: AccountingDocument, accountCode: string, debit: number, credit: number, description: string): JournalLine {
  return { accountCode, accountName: accountName(data, accountCode), debit, credit, description, ...projectDimensions(data, document), reference: document.reference || document.number, sourceModule: "Accounting Documents", sourceDocument: document.number };
}

export function nextDocumentNumber(type: AccountingDocumentType, data: ErpData, companyId: string, date = new Date()) {
  const prefix = documentPrefixes[type];
  const year = date.getFullYear();
  const count = data.accountingDocuments.filter((item) => item.companyId === companyId && item.type === type && new Date(item.documentDate).getFullYear() === year).length + 1;
  return `${prefix}-${year}-${String(count).padStart(4, "0")}`;
}

export function registerOperationalDocument(input: { type: AccountingDocumentType; sourceNumber: string; companyId: string; projectId?: string; partyId?: string; taxableAmount: number; taxAmount?: number; deductions?: number; settledAmount?: number; date: string; description: string; costCode?: string; journal?: JournalEntry }, data: ErpData): AccountingDocument {
  const timestamp = now();
  const project = data.projects.find((item) => item.id === input.projectId);
  const taxAmount = input.taxAmount ?? 0;
  const deductions = input.deductions ?? 0;
  const grossAmount = input.taxableAmount + taxAmount;
  const netAmount = grossAmount - deductions;
  const settledAmount = input.settledAmount ?? 0;
  const hasSettlement = ["supplier-invoice", "customer-certificate", "subcontractor-certificate"].includes(input.type);
  return { id: uid("adoc"), createdAt: timestamp, updatedAt: timestamp, number: nextDocumentNumber(input.type, data, input.companyId, new Date(input.date)), sourceNumber: input.sourceNumber, type: input.type, companyId: input.companyId, projectId: input.projectId, partyId: input.partyId, wbsCode: project?.wbsCode, costCenterCode: project?.costCenterCode, costCode: input.costCode, taxableAmount: input.taxableAmount, taxRate: input.taxableAmount ? taxAmount / input.taxableAmount * 100 : 0, taxAmount, withholdingAmount: 0, otherDeductions: deductions, grossAmount, netAmount, settledAmount, currency: data.settings.currency, documentDate: input.date, reference: input.sourceNumber, description: input.description, workflowStatus: input.journal ? "approved" : "submitted", accountingStatus: input.journal ? "draft-journal" : "not-classified", settlementStatus: hasSettlement ? (settledAmount >= netAmount - .005 ? "settled" : settledAmount > 0 ? "partially-settled" : "unpaid") : "not-applicable", journalId: input.journal?.id, attachments: [], createdBy: "System" };
}

export function assertOpenPeriod(companyId: string, date: string, data: ErpData) {
  const value = new Date(date);
  const period = data.fiscalPeriods.find((item) => item.companyId === companyId && item.fiscalYear === value.getFullYear() && item.month === value.getMonth() + 1);
  if (period?.status === "closed") throw new Error("الفترة المحاسبية مغلقة. يلزم إعادة فتحها بصلاحية قبل الترحيل.");
}

export function createDraftJournal(document: AccountingDocument, data: ErpData): JournalEntry {
  const mapping = data.accountingMappings.find((item) => item.companyId === document.companyId);
  if (!mapping) throw new Error("لا يوجد Accounting Mapping للشركة المختارة.");
  assertOpenPeriod(document.companyId, document.documentDate, data);
  const netBase = document.taxableAmount || document.netAmount;
  const payable = Math.max(0, document.netAmount);
  let lines: JournalLine[] = [];
  if (document.type === "supplier-invoice") {
    const debitAccount = document.accountCode || (document.projectId ? mapping.materialCost : mapping.siteExpense);
    lines = [line(data, document, debitAccount, netBase, 0, document.description), ...(document.taxAmount ? [line(data, document, mapping.vatInput, document.taxAmount, 0, "ضريبة مدخلات")] : []), line(data, document, mapping.supplierControl, 0, payable, "ذمة المورد")];
  } else if (document.type === "expense-invoice") {
    lines = [line(data, document, document.accountCode || mapping.siteExpense, netBase, 0, document.description), ...(document.taxAmount ? [line(data, document, mapping.vatInput, document.taxAmount, 0, "ضريبة مدخلات")] : []), line(data, document, document.partyId ? mapping.supplierControl : mapping.bank, 0, payable, document.partyId ? "ذمة المورد" : "سداد المصروف")];
  } else if (document.type === "customer-certificate") {
    lines = [line(data, document, mapping.customerControl, document.netAmount, 0, "ذمة العميل"), ...(document.otherDeductions ? [line(data, document, mapping.retentionReceivable, document.otherDeductions, 0, "احتجاز لدى العميل")] : []), line(data, document, mapping.projectRevenue, 0, document.taxableAmount, "إيراد المشروع"), ...(document.taxAmount ? [line(data, document, mapping.vatOutput, 0, document.taxAmount, "ضريبة مخرجات")] : [])];
  } else if (document.type === "subcontractor-certificate") {
    lines = [line(data, document, mapping.subcontractorCost, document.taxableAmount, 0, "تكلفة مقاول الباطن"), ...(document.taxAmount ? [line(data, document, mapping.vatInput, document.taxAmount, 0, "ضريبة مدخلات")] : []), ...(document.otherDeductions ? [line(data, document, mapping.retentionPayable, 0, document.otherDeductions, "احتجاز مقاول الباطن")] : []), line(data, document, mapping.subcontractorControl, 0, document.netAmount, "ذمة مقاول الباطن")];
  } else if (["cash-receipt", "bank-receipt"].includes(document.type)) {
    lines = [line(data, document, document.type === "cash-receipt" ? mapping.cash : mapping.bank, document.netAmount, 0, document.description), line(data, document, document.accountCode || mapping.customerControl, 0, document.netAmount, "تسوية حساب الطرف")];
  } else if (["cash-payment", "bank-payment"].includes(document.type)) {
    lines = [line(data, document, document.accountCode || mapping.supplierControl, document.netAmount, 0, "تسوية حساب الطرف"), line(data, document, document.type === "cash-payment" ? mapping.cash : mapping.bank, 0, document.netAmount, document.description)];
  } else {
    throw new Error("نوع المستند يحتاج تصنيفًا يدويًا عبر سند قيد متعدد السطور.");
  }
  assertBalancedJournal(lines);
  const createdAt = now();
  return { id: uid("jv"), createdAt, updatedAt: createdAt, number: `JV-${new Date(document.documentDate).getFullYear()}-${String(data.journalEntries.length + 1).padStart(4, "0")}`, companyId: document.companyId, date: document.documentDate, description: document.description, projectId: document.projectId, costCenterCode: document.costCenterCode, reference: document.reference || document.number, journalType: journalType(document.type), sourceModule: "Accounting Documents", sourceType: documentTypeLabels[document.type], sourceNumber: document.number, automatic: true, lines, status: "draft", createdBy: "System", auditTrail: [{ action: "create", user: "System", timestamp: createdAt, note: "Generated from approved source document" }] };
}

function journalType(type: AccountingDocumentType): JournalEntry["journalType"] {
  if (type === "supplier-invoice") return "purchases";
  if (type.includes("certificate")) return type === "customer-certificate" ? "certificate" : "subcontractor";
  if (type === "cash-receipt") return "cash-receipt";
  if (type === "cash-payment") return "cash-payment";
  if (type.startsWith("bank")) return "bank";
  if (type === "inventory-adjustment") return "inventory";
  if (type === "opening-balance") return "general";
  return "general";
}

export function approveAndGenerateJournal(documentId: string, data: ErpData): ErpData {
  const document = data.accountingDocuments.find((item) => item.id === documentId);
  if (!document) throw new Error("المستند غير موجود.");
  if (document.journalId) return data;
  const journal = createDraftJournal({ ...document, workflowStatus: "approved", accountingStatus: "classified" }, data);
  return { ...data, accountingDocuments: data.accountingDocuments.map((item) => item.id === documentId ? { ...item, workflowStatus: "approved", accountingStatus: "draft-journal", journalId: journal.id, updatedAt: now() } : item), journalEntries: [...data.journalEntries, journal] };
}

export function reviewJournal(journalId: string, data: ErpData): ErpData {
  const journal = data.journalEntries.find((item) => item.id === journalId);
  if (!journal || journal.status !== "draft") throw new Error("يمكن مراجعة القيود المسودة فقط.");
  assertBalancedJournal(journal.lines);
  const timestamp = now();
  return { ...data, journalEntries: data.journalEntries.map((item) => item.id === journalId ? { ...item, status: "reviewed", updatedAt: timestamp, auditTrail: [...item.auditTrail, { action: "review", user: "Finance Reviewer", timestamp }] } : item) };
}

export function postJournal(journalId: string, data: ErpData): ErpData {
  const journal = data.journalEntries.find((item) => item.id === journalId);
  if (!journal || journal.status !== "reviewed") throw new Error("يجب مراجعة القيد قبل الترحيل.");
  assertOpenPeriod(journal.companyId, journal.date, data);
  assertBalancedJournal(journal.lines);
  const timestamp = now();
  return { ...data, journalEntries: data.journalEntries.map((item) => item.id === journalId ? { ...item, status: "posted", postedBy: "Finance Manager", updatedAt: timestamp, auditTrail: [...item.auditTrail, { action: "post", user: "Finance Manager", timestamp }] } : item), accountingDocuments: data.accountingDocuments.map((item) => item.journalId === journalId ? { ...item, workflowStatus: "posted", accountingStatus: "posted", updatedAt: timestamp } : item) };
}

export function documentOutstanding(document: AccountingDocument) { return Math.max(0, document.netAmount - document.settledAmount); }
export function agingBucket(dueDate?: string, today = new Date()) {
  if (!dueDate) return "Current";
  const days = Math.floor((today.getTime() - new Date(dueDate).getTime()) / 86400000);
  if (days <= 0) return "Current";
  if (days <= 30) return "1-30";
  if (days <= 60) return "31-60";
  if (days <= 90) return "61-90";
  if (days <= 120) return "91-120";
  return "120+";
}

export function openItems(data: ErpData, kind: "customers" | "suppliers" | "subcontractors" | "all" = "all") {
  const allowed: AccountingDocumentType[] = kind === "customers" ? ["customer-certificate", "debit-note"] : kind === "suppliers" ? ["supplier-invoice", "expense-invoice"] : kind === "subcontractors" ? ["subcontractor-certificate"] : ["customer-certificate", "debit-note", "supplier-invoice", "expense-invoice", "subcontractor-certificate"];
  return data.accountingDocuments.filter((item) => item.accountingStatus === "posted" && allowed.includes(item.type) && documentOutstanding(item) > .005).map((item) => ({ ...item, outstanding: documentOutstanding(item), age: agingBucket(item.dueDate) }));
}

export function postSettlement(settlement: SettlementDocument, data: ErpData): ErpData {
  assertOpenPeriod(settlement.companyId, settlement.date, data);
  const allocated = settlement.allocations.reduce((sum, item) => sum + item.amount, 0);
  if (allocated > settlement.amount + .005) throw new Error("قيمة التخصيص أكبر من قيمة التحصيل أو السداد.");
  for (const allocation of settlement.allocations) {
    const source = data.accountingDocuments.find((item) => item.id === allocation.documentId);
    if (!source || allocation.amount > documentOutstanding(source) + .005) throw new Error("قيمة تخصيص غير صالحة لأحد المستندات.");
  }
  const mapping = data.accountingMappings.find((item) => item.companyId === settlement.companyId);
  if (!mapping) throw new Error("لا يوجد Accounting Mapping للشركة.");
  const isReceipt = settlement.type === "customer-collection";
  const control = isReceipt ? mapping.customerControl : settlement.type === "subcontractor-payment" ? mapping.subcontractorControl : mapping.supplierControl;
  const cash = settlement.channel === "cash" ? mapping.cash : mapping.bank;
  const amount = settlement.amount;
  const journalLines: JournalLine[] = [
    { accountCode: isReceipt ? cash : control, accountName: accountName(data, isReceipt ? cash : control), description: settlement.description, debit: amount, credit: 0, projectId: settlement.projectId, reference: settlement.reference || settlement.number, sourceModule: "Settlements", sourceDocument: settlement.number },
    { accountCode: isReceipt ? control : cash, accountName: accountName(data, isReceipt ? control : cash), description: settlement.description, debit: 0, credit: amount, projectId: settlement.projectId, reference: settlement.reference || settlement.number, sourceModule: "Settlements", sourceDocument: settlement.number },
  ];
  const timestamp = now();
  const journal: JournalEntry = { id: uid("jv"), createdAt: timestamp, updatedAt: timestamp, number: `JV-${new Date(settlement.date).getFullYear()}-${String(data.journalEntries.length + 1).padStart(4, "0")}`, companyId: settlement.companyId, date: settlement.date, description: settlement.description, projectId: settlement.projectId, reference: settlement.reference || settlement.number, journalType: isReceipt ? (settlement.channel === "cash" ? "cash-receipt" : "bank") : (settlement.channel === "cash" ? "cash-payment" : "bank"), sourceModule: "Settlements", sourceType: settlement.type, sourceNumber: settlement.number, automatic: true, lines: journalLines, status: "posted", createdBy: settlement.createdBy, postedBy: "Finance Manager", auditTrail: [{ action: "create", user: "System", timestamp }, { action: "review", user: "Finance Reviewer", timestamp }, { action: "post", user: "Finance Manager", timestamp }] };
  return { ...data, journalEntries: [...data.journalEntries, journal], settlements: [...data.settlements, { ...settlement, status: "posted", journalId: journal.id }], accountingDocuments: data.accountingDocuments.map((document) => { const allocation = settlement.allocations.find((item) => item.documentId === document.id); if (!allocation) return document; const settledAmount = document.settledAmount + allocation.amount; return { ...document, settledAmount, settlementStatus: settledAmount >= document.netAmount - .005 ? "settled" : "partially-settled", updatedAt: timestamp }; }) };
}

export function accountingExceptions(data: ErpData) {
  const exceptions: { type: string; reference: string; detail: string }[] = [];
  data.accountingDocuments.filter((item) => item.workflowStatus === "approved" && !item.journalId).forEach((item) => exceptions.push({ type: "Source Document Without Journal", reference: item.number, detail: "مستند معتمد بدون قيد" }));
  data.journalEntries.filter((item) => item.status === "draft" && Math.abs(item.lines.reduce((sum, line) => sum + line.debit - line.credit, 0)) > .005).forEach((item) => exceptions.push({ type: "Unbalanced Journal", reference: item.number, detail: "القيد غير متوازن" }));
  data.journalEntries.filter((item) => item.status !== "posted" && item.status !== "reversed").forEach((item) => exceptions.push({ type: "Document Pending Posting", reference: item.number, detail: `الحالة: ${item.status}` }));
  data.accountingDocuments.filter((item) => item.projectId && !item.costCode && ["supplier-invoice", "expense-invoice", "subcontractor-certificate"].includes(item.type)).forEach((item) => exceptions.push({ type: "Missing Cost Code", reference: item.number, detail: "مستند مشروع بدون Cost Code" }));
  data.settlements.filter((item) => item.status === "posted" && item.allocations.reduce((sum, allocation) => sum + allocation.amount, 0) < item.amount - .005).forEach((item) => exceptions.push({ type: "Unallocated Payment", reference: item.number, detail: "يوجد جزء غير مخصص" }));
  return exceptions;
}

export function statementBalances(data: ErpData, companyId: string, projectId?: string) {
  const accounts = new Map(data.chartOfAccounts.filter((item) => item.companyId === companyId).map((item) => [item.code, item]));
  const balances = new Map<string, number>();
  data.journalEntries.filter((entry) => entry.companyId === companyId && entry.status === "posted").flatMap((entry) => entry.lines.filter((line) => !projectId || line.projectId === projectId || entry.projectId === projectId)).forEach((line) => balances.set(line.accountCode, (balances.get(line.accountCode) || 0) + line.debit - line.credit));
  const byType = (type: AccountType) => [...balances].filter(([code]) => accounts.get(code)?.type === type).reduce((sum, [, balance]) => sum + balance, 0);
  const assets = byType("asset");
  const liabilities = -byType("liability");
  const equity = -byType("equity");
  const revenue = -byType("revenue");
  const costs = byType("cost");
  const expenses = byType("expense");
  return { balances, assets, liabilities, equity, revenue, costs, expenses, profit: revenue - costs - expenses };
}

export function cashFlow(data: ErpData, companyId: string) {
  const mapping = data.accountingMappings.find((item) => item.companyId === companyId);
  if (!mapping) return { operating: 0, investing: 0, financing: 0, net: 0 };
  const cashCodes = new Set([mapping.cash, mapping.bank]);
  let operating = 0, investing = 0, financing = 0;
  data.journalEntries.filter((entry) => entry.companyId === companyId && entry.status === "posted").forEach((entry) => entry.lines.filter((line) => cashCodes.has(line.accountCode)).forEach((line) => { const movement = line.debit - line.credit; if (entry.sourceType.toLowerCase().includes("asset")) investing += movement; else if (entry.journalType === "opening" || entry.journalType === "closing") financing += movement; else operating += movement; }));
  return { operating, investing, financing, net: operating + investing + financing };
}
