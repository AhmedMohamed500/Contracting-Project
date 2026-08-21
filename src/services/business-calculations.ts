import type { AccountingMapping, Certificate, ErpData, JournalEntry, JournalLine, Project } from "@/types/erp";
import { documentNumber, uid } from "@/utils/format";

export function calculateCertificate(certificate: Pick<Certificate, "grossAmount" | "retentionRate" | "taxRate" | "paidAmount">) {
  const retention = certificate.grossAmount * certificate.retentionRate / 100;
  const tax = certificate.grossAmount * certificate.taxRate / 100;
  const net = certificate.grossAmount + tax - retention;
  return { retention, tax, net, outstanding: Math.max(0, net - certificate.paidAmount) };
}

export function calculateProjectCost(projectId: string, data: ErpData): number {
  const inventoryCost = data.inventoryMovements
    .filter((item) => item.projectId === projectId && item.status === "posted" && item.type === "issue")
    .reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
  const expenses = data.expenses
    .filter((item) => item.projectId === projectId && item.status !== "draft")
    .reduce((sum, item) => sum + item.amount, 0);
  const subcontractorCost = data.certificates
    .filter((item) => item.projectId === projectId && item.type === "subcontractor" && ["approved", "posted"].includes(item.status))
    .reduce((sum, item) => sum + calculateCertificate(item).net, 0);
  const recordedBaseline = data.projects.find((item) => item.id === projectId)?.actualCost ?? 0;
  return recordedBaseline + inventoryCost + expenses + subcontractorCost;
}

export function calculateProjectRevenue(projectId: string, data: ErpData): number {
  return data.certificates
    .filter((item) => item.projectId === projectId && item.type === "customer" && item.status === "posted")
    .reduce((sum, item) => sum + calculateCertificate(item).net, 0);
}

export function calculateProjectProfit(project: Project, data: ErpData) {
  const earnedRevenue = Math.max(calculateProjectRevenue(project.id, data), project.contractValue * project.progress / 100);
  const actualCost = calculateProjectCost(project.id, data);
  const profit = earnedRevenue - actualCost;
  return { revenue: earnedRevenue, actualCost, profit, margin: earnedRevenue ? profit / earnedRevenue * 100 : 0 };
}

export function calculateBudgetVariance(project: Project, data: ErpData) {
  const actual = calculateProjectCost(project.id, data);
  return { budget: project.budget, actual, variance: project.budget - actual, consumed: project.budget ? actual / project.budget * 100 : 0 };
}

export function calculateProjectHealth(project: Project, data: ErpData) {
  const variance = calculateBudgetVariance(project, data);
  const timeElapsed = Math.min(100, Math.max(0, (Date.now() - new Date(project.startDate).getTime()) / (new Date(project.endDate).getTime() - new Date(project.startDate).getTime()) * 100));
  const costPenalty = Math.max(0, variance.consumed - project.progress) * 0.8;
  const schedulePenalty = Math.max(0, timeElapsed - project.progress) * 0.6;
  const score = Math.round(Math.max(0, Math.min(100, 100 - costPenalty - schedulePenalty)));
  return { score, status: score >= 75 ? "healthy" : score >= 50 ? "attention" : "critical" } as const;
}

export function calculateTrialBalance(entries: JournalEntry[]) {
  const map = new Map<string, { account: string; accountName: string; debit: number; credit: number }>();
  entries.filter((entry) => entry.status === "posted").flatMap((entry) => entry.lines).forEach((line) => {
    const row = map.get(line.accountCode) ?? { account: line.accountCode, accountName: line.accountName, debit: 0, credit: 0 };
    row.debit += line.debit;
    row.credit += line.credit;
    map.set(line.accountCode, row);
  });
  return Array.from(map.values()).map((row) => ({ ...row, balance: row.debit - row.credit }));
}

export function assertBalancedJournal(lines: { debit: number; credit: number }[]) {
  const debit = lines.reduce((sum, line) => sum + line.debit, 0);
  const credit = lines.reduce((sum, line) => sum + line.credit, 0);
  if (Math.abs(debit - credit) > 0.001) throw new Error("UNBALANCED_JOURNAL");
  return true;
}

export function inventoryBalance(material: string, warehouse: string, data: ErpData) {
  return data.inventoryMovements.filter((item) => item.material === material && item.warehouse === warehouse && item.status === "posted")
    .reduce((sum, item) => sum + (["receipt", "return"].includes(item.type) ? item.quantity : item.type === "issue" ? -item.quantity : 0), 0);
}

export function projectJournalEntries(projectId: string, data: ErpData) {
  return data.journalEntries.filter((entry) => entry.projectId === projectId || entry.lines.some((line) => line.projectId === projectId));
}

export function projectLedger(projectId: string, data: ErpData) {
  let runningBalance = 0;
  return projectJournalEntries(projectId, data)
    .filter((entry) => entry.status === "posted")
    .sort((a, b) => a.date.localeCompare(b.date))
    .flatMap((entry) => entry.lines.filter((line) => (line.projectId ?? entry.projectId) === projectId).map((line) => {
      runningBalance += line.debit - line.credit;
      return { id: `${entry.id}-${line.accountCode}-${line.debit}-${line.credit}`, date: entry.date, journalNumber: entry.number, accountCode: line.accountCode, accountName: line.accountName, description: line.description, debit: line.debit, credit: line.credit, balance: runningBalance, costCode: line.costCode ?? "—", wbsCode: line.wbsCode ?? "—", boq: line.boqItemId ? data.boqItems.find((item) => item.id === line.boqItemId)?.code ?? line.boqItemId : "—", source: entry.sourceModule, reference: line.reference ?? entry.reference ?? entry.sourceNumber };
    }));
}

export function projectTrialBalance(projectId: string, data: ErpData) {
  const entries = projectJournalEntries(projectId, data).map((entry) => ({ ...entry, lines: entry.lines.filter((line) => (line.projectId ?? entry.projectId) === projectId) }));
  return calculateTrialBalance(entries).map((row) => ({ accountCode: row.account, accountName: row.accountName, openingDebit: 0, openingCredit: 0, periodDebit: row.debit, periodCredit: row.credit, closingDebit: Math.max(row.balance, 0), closingCredit: Math.max(-row.balance, 0) }));
}

export function projectCostLedger(projectId: string, data: ErpData) {
  const postedSources = new Set(projectJournalEntries(projectId, data).filter((entry) => entry.status === "posted").map((entry) => entry.sourceNumber));
  const inventory = data.inventoryMovements.filter((item) => item.projectId === projectId && item.type === "issue" && item.status === "posted" && postedSources.has(item.number)).map((item) => ({ id: item.id, date: item.updatedAt.slice(0, 10), projectId, boq: data.boqItems.find((boq) => boq.projectId === projectId && item.material.includes(boq.description.split(" ")[0]))?.code ?? "—", costCode: "01.03 — Reinforcement", costType: "Materials", source: "Inventory", reference: item.number, amount: item.quantity * item.unitCost }));
  const expenses = data.expenses.filter((item) => item.projectId === projectId && item.status === "posted" && postedSources.has(item.number)).map((item) => ({ id: item.id, date: item.date, projectId, boq: "—", costCode: item.costCode, costType: "Direct Expense", source: "Expenses", reference: item.number, amount: item.amount }));
  const subcontractors = data.certificates.filter((item) => item.projectId === projectId && item.type === "subcontractor" && item.status === "posted" && postedSources.has(item.number)).map((item) => ({ id: item.id, date: item.updatedAt.slice(0, 10), projectId, boq: "—", costCode: "04.00 — Subcontractors", costType: "Subcontractor", source: "Certificates", reference: item.number, amount: item.grossAmount }));
  return [...inventory, ...expenses, ...subcontractors].sort((a, b) => a.date.localeCompare(b.date));
}

export function projectIncomeStatement(projectId: string, data: ErpData) {
  const lines = projectLedger(projectId, data);
  const byAccount = (code: string) => lines.filter((line) => line.accountCode === code).reduce((sum, line) => sum + line.debit - line.credit, 0);
  const mapping = mappingForProject(projectId, data);
  const revenue = -byAccount(mapping.projectRevenue);
  const materialCost = byAccount(mapping.materialCost);
  const laborCost = byAccount(mapping.laborCost);
  const equipmentCost = byAccount(mapping.equipmentCost);
  const subcontractorCost = byAccount(mapping.subcontractorCost);
  const directExpenses = byAccount(mapping.siteExpense);
  const grossProfit = revenue - materialCost - laborCost - equipmentCost - subcontractorCost - directExpenses;
  return { revenue, materialCost, laborCost, equipmentCost, subcontractorCost, directExpenses, grossProfit, allocatedOverhead: 0, operatingProfit: grossProfit };
}

export function projectFinancialPosition(projectId: string, data: ErpData) {
  const mapping = mappingForProject(projectId, data);
  const balances = new Map(projectTrialBalance(projectId, data).map((row) => [row.accountCode, row.closingDebit - row.closingCredit]));
  const balance = (code: string) => balances.get(code) ?? 0;
  const committedCost = data.purchaseOrders.filter((po) => po.projectId === projectId && po.status !== "cancelled").reduce((sum, po) => sum + Math.max(0, po.amount - po.receivedAmount), 0);
  const project = data.projects.find((item) => item.id === projectId);
  const certifiedRevenue = data.certificates.filter((certificate) => certificate.projectId === projectId && certificate.type === "customer" && certificate.status === "posted").reduce((sum, certificate) => sum + certificate.grossAmount, 0);
  const recognizedRevenue = project ? project.contractValue * project.progress / 100 : 0;
  return { customerReceivable: balance(mapping.customerControl), customerRetention: balance(mapping.retentionReceivable), supplierPayables: Math.max(0, -balance(mapping.supplierControl)), subcontractorPayables: Math.max(0, -balance(mapping.subcontractorControl)), projectCash: balance(mapping.cash) + balance(mapping.bank), wip: balance(mapping.wip), commitments: committedCost, certifiedRevenue, unbilledWork: Math.max(0, recognizedRevenue - certifiedRevenue), accruedCosts: 0, advances: 0 };
}

export function projectReconciliation(projectId: string, data: ErpData) {
  const mapping = mappingForProject(projectId, data);
  const costAccounts = new Set([mapping.materialCost, mapping.laborCost, mapping.equipmentCost, mapping.subcontractorCost, mapping.siteExpense]);
  const accountingCost = projectLedger(projectId, data).filter((line) => costAccounts.has(line.accountCode)).reduce((sum, line) => sum + line.debit - line.credit, 0);
  const costLedger = projectCostLedger(projectId, data).reduce((sum, line) => sum + line.amount, 0);
  return { accountingCost, costLedger, difference: accountingCost - costLedger };
}

export function companyIncomeStatement(data: ErpData, companyId: string) {
  const accounts = new Map(data.chartOfAccounts.map((account) => [account.code, account]));
  const lines = data.journalEntries.filter((entry) => entry.companyId === companyId && entry.status === "posted").flatMap((entry) => entry.lines);
  const revenue = lines.filter((line) => accounts.get(line.accountCode)?.type === "revenue").reduce((sum, line) => sum + line.credit - line.debit, 0);
  const directCosts = lines.filter((line) => accounts.get(line.accountCode)?.type === "cost").reduce((sum, line) => sum + line.debit - line.credit, 0);
  const expenses = lines.filter((line) => accounts.get(line.accountCode)?.type === "expense").reduce((sum, line) => sum + line.debit - line.credit, 0);
  return { revenue, directCosts, grossProfit: revenue - directCosts, expenses, operatingProfit: revenue - directCosts - expenses };
}

type AutoJournalInput = { kind: "material-issue" | "purchase-receipt" | "expense" | "customer-certificate" | "subcontractor-certificate"; companyId: string; projectId: string; sourceNumber: string; date: string; description: string; amount: number; costCode?: string; boqItemId?: string; retention?: number; tax?: number; };

export function generateAutomaticJournal(input: AutoJournalInput, data: ErpData): JournalEntry {
  const mapping = mappingForCompany(input.companyId, data);
  const project = data.projects.find((item) => item.id === input.projectId);
  if (!project) throw new Error("PROJECT_REQUIRED");
  const line = (accountCode: string, debit: number, credit: number, description: string): JournalLine => ({ accountCode, accountName: accountName(accountCode, data), description, debit, credit, projectId: input.projectId, costCenterCode: project.costCenterCode, costCode: input.costCode, wbsCode: project.wbsCode, boqItemId: input.boqItemId, reference: input.sourceNumber, sourceModule: sourceModule(input.kind), sourceDocument: input.sourceNumber });
  let lines: JournalLine[] = [];
  if (input.kind === "material-issue") lines = [line(mapping.materialCost, input.amount, 0, input.description), line(mapping.inventory, 0, input.amount, input.description)];
  if (input.kind === "purchase-receipt") lines = [line(mapping.inventory, input.amount, 0, input.description), line(mapping.supplierControl, 0, input.amount, input.description)];
  if (input.kind === "expense") lines = [line(mapping.siteExpense, input.amount, 0, input.description), line(mapping.cash, 0, input.amount, input.description)];
  if (input.kind === "customer-certificate") { const retention = input.retention ?? 0; const tax = input.tax ?? 0; lines = [line(mapping.customerControl, input.amount + tax - retention, 0, input.description), line(mapping.retentionReceivable, retention, 0, "احتجاز مستخلص عميل"), line(mapping.projectRevenue, 0, input.amount, input.description), line(mapping.vatOutput, 0, tax, "ضريبة مستخلص عميل")].filter((item) => item.debit !== 0 || item.credit !== 0); }
  if (input.kind === "subcontractor-certificate") { const retention = input.retention ?? 0; const tax = input.tax ?? 0; lines = [line(mapping.subcontractorCost, input.amount, 0, input.description), line(mapping.vatInput, tax, 0, "ضريبة مستخلص مقاول"), line(mapping.subcontractorControl, 0, input.amount + tax - retention, input.description), line(mapping.retentionPayable, 0, retention, "احتجاز مقاول باطن")].filter((item) => item.debit !== 0 || item.credit !== 0); }
  assertBalancedJournal(lines);
  const now = new Date().toISOString();
  return { id: uid("jv"), createdAt: now, updatedAt: now, number: documentNumber(journalPrefix(input.kind), data.journalEntries.length), companyId: input.companyId, date: input.date, description: input.description, projectId: input.projectId, costCenterCode: project.costCenterCode, reference: input.sourceNumber, journalType: input.kind === "material-issue" ? "inventory" : input.kind.includes("certificate") ? "certificate" : input.kind === "purchase-receipt" ? "purchases" : "general", sourceModule: sourceModule(input.kind), sourceType: input.kind.split("-").map((part) => part[0].toUpperCase() + part.slice(1)).join(" "), sourceNumber: input.sourceNumber, automatic: true, lines, status: "posted", createdBy: "System", postedBy: "System", auditTrail: [{ action: "create", user: "System", timestamp: now }, { action: "post", user: "System", timestamp: now }] };
}

export function reverseJournal(entry: JournalEntry, data: ErpData): JournalEntry {
  if (entry.status !== "posted") throw new Error("ONLY_POSTED_CAN_REVERSE");
  const now = new Date().toISOString();
  return { ...entry, id: uid("rev"), createdAt: now, updatedAt: now, number: documentNumber("REV", data.journalEntries.length), description: `عكس القيد ${entry.number} — ${entry.description}`, reference: entry.number, sourceModule: "Accounting", sourceType: "Journal Reversal", sourceNumber: entry.number, automatic: false, lines: entry.lines.map((line) => ({ ...line, debit: line.credit, credit: line.debit, description: `عكس: ${line.description}`, reference: entry.number, sourceModule: "Accounting", sourceDocument: entry.number })), status: "posted", reversedFromId: entry.id, createdBy: "Finance Manager", postedBy: "Finance Manager", auditTrail: [{ action: "create", user: "Finance Manager", timestamp: now, note: `Reversal of ${entry.number}` }, { action: "post", user: "Finance Manager", timestamp: now }] };
}

function mappingForProject(projectId: string, data: ErpData): AccountingMapping { const project = data.projects.find((item) => item.id === projectId); if (!project) throw new Error("PROJECT_REQUIRED"); return mappingForCompany(project.companyId, data); }
function mappingForCompany(companyId: string, data: ErpData): AccountingMapping { const mapping = data.accountingMappings.find((item) => item.companyId === companyId); if (!mapping) throw new Error("ACCOUNTING_MAPPING_REQUIRED"); return mapping; }
function accountName(code: string, data: ErpData) { return data.chartOfAccounts.find((item) => item.code === code)?.name ?? `حساب ${code}`; }
function sourceModule(kind: AutoJournalInput["kind"]) { return kind === "material-issue" || kind === "purchase-receipt" ? "Inventory" : kind === "expense" ? "Expenses" : "Certificates"; }
function journalPrefix(kind: AutoJournalInput["kind"]) { return kind === "material-issue" ? "INV" : kind === "purchase-receipt" ? "PUR" : kind.includes("certificate") ? "CERT" : "JV"; }
