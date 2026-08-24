import type { JournalEntry, Project } from "@/types/erp";
import { safeNumber } from "@/utils/safe-number";

export interface GeneralLedgerFilters { accountCode?: string; projectId?: string; from?: string; to?: string }
export interface GeneralLedgerRow {
  id: string; date: string; journal: string; accountCode: string; account: string; description: string;
  debit: number; credit: number; balance: number; project?: Project; reference: string; entry: JournalEntry;
}

const matchesDimension = (entry: JournalEntry, projectId: string | undefined, lineProjectId: string | undefined) => !projectId || lineProjectId === projectId || (!lineProjectId && entry.projectId === projectId);

export function buildGeneralLedger(entries: JournalEntry[], projects: Project[], filters: GeneralLedgerFilters = {}): GeneralLedgerRow[] {
  const posted = entries.filter((entry) => entry.status === "posted").sort((a, b) => a.date.localeCompare(b.date) || a.number.localeCompare(b.number));
  const balances = new Map<string, number>();
  if (filters.from) posted.filter((entry) => entry.date < filters.from!).forEach((entry) => entry.lines.forEach((line) => {
    if ((!filters.accountCode || line.accountCode === filters.accountCode) && matchesDimension(entry, filters.projectId, line.projectId)) balances.set(line.accountCode, (balances.get(line.accountCode) ?? 0) + safeNumber(line.debit) - safeNumber(line.credit));
  }));
  return posted.filter((entry) => (!filters.from || entry.date >= filters.from) && (!filters.to || entry.date <= filters.to)).flatMap((entry) => entry.lines.flatMap((line, index) => {
    if ((filters.accountCode && line.accountCode !== filters.accountCode) || !matchesDimension(entry, filters.projectId, line.projectId)) return [];
    const debit = safeNumber(line.debit), credit = safeNumber(line.credit); const balance = (balances.get(line.accountCode) ?? 0) + debit - credit; balances.set(line.accountCode, balance);
    return [{ id: `${entry.id}-${index}`, date: entry.date, journal: entry.number, accountCode: line.accountCode, account: `${line.accountCode} — ${line.accountName}`, description: line.description, debit, credit, balance, project: projects.find((project) => project.id === (line.projectId ?? entry.projectId)), reference: line.reference ?? entry.reference ?? entry.sourceNumber, entry }];
  }));
}
