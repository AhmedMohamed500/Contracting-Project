import type { Certificate, ErpData, JournalEntry, Project } from "@/types/erp";

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
  const map = new Map<string, { account: string; debit: number; credit: number }>();
  entries.filter((entry) => entry.status === "posted").flatMap((entry) => entry.lines).forEach((line) => {
    const row = map.get(line.account) ?? { account: line.account, debit: 0, credit: 0 };
    row.debit += line.debit;
    row.credit += line.credit;
    map.set(line.account, row);
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
