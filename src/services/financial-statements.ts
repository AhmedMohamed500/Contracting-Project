import type { CashFlowCategory, ChartOfAccount, ErpData, JournalEntry, JournalLine } from "@/types/erp";

export interface FinancialFilters { companyId: string; projectId?: string; from?: string; to: string; }
export interface TrialBalanceRow { accountCode: string; accountName: string; parentCode?: string; openingDebit: number; openingCredit: number; periodDebit: number; periodCredit: number; closingDebit: number; closingCredit: number; }
export interface StatementLine { code?: string; label: string; amount: number; section: string; accountCodes: string[]; }

function posted(data: ErpData, filters: FinancialFilters, includeBefore = false) {
  return data.journalEntries.filter((entry) => entry.companyId === filters.companyId && entry.status === "posted" && entry.date <= filters.to && (includeBefore || !filters.from || entry.date >= filters.from));
}

function scopedLines(entry: JournalEntry, projectId?: string) {
  return entry.lines.filter((line) => !projectId || line.projectId === projectId || (!line.projectId && entry.projectId === projectId));
}

function lineBalance(lines: JournalLine[]) { return lines.reduce((sum, line) => sum + line.debit - line.credit, 0); }
function displayBalance(account: ChartOfAccount, balance: number) { return account.normalBalance === "credit" ? -balance : balance; }

export function detailedTrialBalance(data: ErpData, filters: FinancialFilters, mode: "trial" | "adjusted" | "post-closing" = "trial"): TrialBalanceRow[] {
  const accounts = data.chartOfAccounts.filter((account) => account.companyId === filters.companyId && account.active);
  const eligible = (entry: JournalEntry) => mode === "trial" ? entry.journalType !== "adjustment" && entry.journalType !== "closing" : mode === "adjusted" ? entry.journalType !== "closing" : true;
  const rows = accounts.map((account) => {
    const openingLines = filters.from ? posted(data, filters, true).filter((entry) => entry.date < filters.from! && eligible(entry)).flatMap((entry) => scopedLines(entry, filters.projectId)).filter((line) => line.accountCode === account.code) : [];
    const periodLines = posted(data, filters).filter(eligible).flatMap((entry) => scopedLines(entry, filters.projectId)).filter((line) => line.accountCode === account.code);
    const opening = lineBalance(openingLines); const movement = lineBalance(periodLines); const closing = opening + movement;
    const postClosing = mode === "post-closing" && ["revenue", "cost", "expense"].includes(account.type) ? 0 : closing;
    return { accountCode: account.code, accountName: account.name, parentCode: account.parentCode, openingDebit: Math.max(opening, 0), openingCredit: Math.max(-opening, 0), periodDebit: periodLines.reduce((sum, line) => sum + line.debit, 0), periodCredit: periodLines.reduce((sum, line) => sum + line.credit, 0), closingDebit: Math.max(postClosing, 0), closingCredit: Math.max(-postClosing, 0) };
  });
  const included = new Set(rows.filter((row) => row.openingDebit || row.openingCredit || row.periodDebit || row.periodCredit || row.closingDebit || row.closingCredit).map((row) => row.accountCode));
  let changed = true; while (changed) { changed = false; rows.forEach((row) => { if (included.has(row.accountCode) && row.parentCode && !included.has(row.parentCode)) { included.add(row.parentCode); changed = true; } }); }
  return rows.filter((row) => included.has(row.accountCode));
}

function accountBalances(data: ErpData, filters: FinancialFilters) {
  const trial = detailedTrialBalance(data, { ...filters, from: undefined });
  return new Map(trial.map((row) => [row.accountCode, row.closingDebit - row.closingCredit]));
}

export function incomeStatement(data: ErpData, filters: FinancialFilters) {
  const accounts = data.chartOfAccounts.filter((account) => account.companyId === filters.companyId && account.statementType === "income-statement");
  const balances = new Map<string, number>();
  posted(data, filters).flatMap((entry) => scopedLines(entry, filters.projectId)).forEach((line) => balances.set(line.accountCode, (balances.get(line.accountCode) ?? 0) + line.debit - line.credit));
  const amount = (section: string) => accounts.filter((account) => account.statementSection === section).reduce((sum, account) => sum + displayBalance(account, balances.get(account.code) ?? 0), 0);
  const projectRevenue = amount("project-revenue"), otherIncome = amount("other-income"), projectCost = amount("project-cost"), operatingExpenses = amount("operating-expense"), otherExpenses = amount("other-expense");
  const grossProfit = projectRevenue + otherIncome - projectCost; const operatingProfit = grossProfit - operatingExpenses; const netProfit = operatingProfit - otherExpenses;
  return { projectRevenue, otherIncome, projectCost, grossProfit, operatingExpenses, operatingProfit, otherExpenses, netProfit };
}

export function balanceSheet(data: ErpData, filters: FinancialFilters) {
  const accounts = data.chartOfAccounts.filter((account) => account.companyId === filters.companyId && account.statementType === "balance-sheet");
  const balances = accountBalances(data, filters);
  const lines = accounts.map((account) => ({ code: account.code, label: account.name, amount: displayBalance(account, balances.get(account.code) ?? 0), section: account.statementSection ?? account.type, accountCodes: [account.code] }));
  const sectionTotal = (section: string) => lines.filter((line) => line.section === section).reduce((sum, line) => sum + line.amount, 0);
  const currentAssets = sectionTotal("current-assets") + sectionTotal("cash") + sectionTotal("banks"), nonCurrentAssets = sectionTotal("non-current-assets"), contraAssets = sectionTotal("contra-assets");
  const liabilities = sectionTotal("current-liabilities") + sectionTotal("non-current-liabilities"); const equity = sectionTotal("equity"); const currentProfit = incomeStatement(data, { ...filters, from: undefined }).netProfit;
  const assets = currentAssets + nonCurrentAssets - contraAssets; const liabilitiesAndEquity = liabilities + equity + currentProfit;
  return { lines, currentAssets, nonCurrentAssets, contraAssets, assets, liabilities, equity, currentProfit, liabilitiesAndEquity, difference: assets - liabilitiesAndEquity };
}

export function cashFlowStatement(data: ErpData, filters: FinancialFilters) {
  const accounts = new Map(data.chartOfAccounts.filter((account) => account.companyId === filters.companyId).map((account) => [account.code, account]));
  const cashCodes = new Set([...accounts.values()].filter((account) => account.statementSection === "cash" || account.statementSection === "banks").map((account) => account.code));
  const movements: Record<Exclude<CashFlowCategory, "non-cash">, number> = { operating: 0, investing: 0, financing: 0 };
  const applicable = posted(data, filters);
  applicable.forEach((entry) => {
    const lines = scopedLines(entry, filters.projectId); const cashMovement = lines.filter((line) => cashCodes.has(line.accountCode)).reduce((sum, line) => sum + line.debit - line.credit, 0);
    if (!cashMovement) return;
    const category = lines.filter((line) => !cashCodes.has(line.accountCode)).map((line) => accounts.get(line.accountCode)?.cashFlowCategory).find((value) => value && value !== "non-cash") ?? "operating";
    movements[category as keyof typeof movements] += cashMovement;
  });
  const openingFilters = { ...filters, to: filters.from ? previousDay(filters.from) : "0000-01-01", from: undefined };
  const openingCash = filters.from ? posted(data, openingFilters).flatMap((entry) => scopedLines(entry, filters.projectId)).filter((line) => cashCodes.has(line.accountCode)).reduce((sum, line) => sum + line.debit - line.credit, 0) : 0;
  const netChange = movements.operating + movements.investing + movements.financing; const closingCash = openingCash + netChange;
  const balanceCash = [...accountBalances(data, filters)].filter(([code]) => cashCodes.has(code)).reduce((sum, [, balance]) => sum + balance, 0);
  return { ...movements, openingCash, netChange, closingCash, balanceCash, difference: closingCash - balanceCash };
}

function previousDay(date: string) { const value = new Date(`${date}T00:00:00`); value.setDate(value.getDate() - 1); return value.toISOString().slice(0, 10); }

export function equityStatement(data: ErpData, filters: FinancialFilters) {
  const accounts = data.chartOfAccounts.filter((account) => account.companyId === filters.companyId && account.statementSection === "equity");
  const periodEntries = posted(data, filters); const openingEntries = filters.from ? posted(data, filters, true).filter((entry) => entry.date < filters.from!) : [];
  const sum = (entries: JournalEntry[], predicate?: (account: ChartOfAccount) => boolean) => entries.flatMap((entry) => scopedLines(entry, filters.projectId)).reduce((total, line) => { const account = accounts.find((item) => item.code === line.accountCode); return total + (account && (!predicate || predicate(account)) ? line.credit - line.debit : 0); }, 0);
  const opening = sum(openingEntries); const capitalAdditions = sum(periodEntries, (account) => account.statementSection === "equity" && !/مسحوبات|توزيعات|Drawings/i.test(`${account.name} ${account.nameEn}`)); const drawings = sum(periodEntries, (account) => /مسحوبات|توزيعات|Drawings/i.test(`${account.name} ${account.nameEn}`)); const netProfit = incomeStatement(data, filters).netProfit;
  return { opening, capitalAdditions, netProfit, drawings, adjustments: 0, closing: opening + capitalAdditions + netProfit + drawings };
}

export function accountJournalLines(data: ErpData, filters: FinancialFilters, accountCodes: string[]) {
  return posted(data, { ...filters, from: undefined }).flatMap((entry) => scopedLines(entry, filters.projectId).filter((line) => accountCodes.includes(line.accountCode)).map((line) => ({ entry, line })));
}
