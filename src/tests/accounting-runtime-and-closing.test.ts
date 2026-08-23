import { describe, expect, it } from "vitest";
import { demoData } from "@/data/demo-data";
import { createEmptyErpData, normalizeErpData } from "@/repositories/local-storage-erp.repository";
import { closeFiscalYear } from "@/services/period-closing";
import type { ErpData } from "@/types/erp";

const clone = (): ErpData => JSON.parse(JSON.stringify(demoData)) as ErpData;

describe("accounting legacy runtime migration", () => {
  it("repairs missing nested collections used by accounting routes", () => {
    const legacy = clone() as unknown as Record<string, unknown>;
    const periods = legacy.fiscalPeriods as Array<Record<string, unknown>>;
    delete periods[0].closingTasks;
    const journals = legacy.journalEntries as Array<Record<string, unknown>>;
    delete journals[0].auditTrail;
    delete journals[0].lines;
    legacy.settlements = [{ id: "old-settlement", companyId: "co-atlas", status: "posted", amount: "40" }];
    const normalized = normalizeErpData(legacy as unknown as ErpData);
    expect(normalized.fiscalPeriods[0].closingTasks.length).toBeGreaterThan(0);
    expect(normalized.journalEntries[0].lines).toEqual([]);
    expect(normalized.journalEntries[0].auditTrail.length).toBeGreaterThan(0);
    expect(normalized.settlements[0].allocations).toEqual([]);
    expect(normalized.settlements[0].amount).toBe(40);
  });

  it("keeps a genuinely empty accounting installation safe", () => {
    expect(normalizeErpData(createEmptyErpData())).toMatchObject({ chartOfAccounts: [], journalEntries: [], fiscalPeriods: [], accountingDocuments: [], settlements: [] });
  });
});

describe("year-end closing", () => {
  it("closes temporary balances, carries permanent accounts, and opens twelve periods", () => {
    const data = clone();
    const result = closeFiscalYear(data, "co-atlas", 2026);
    const closing = result.journalEntries.find((entry) => entry.sourceType === "Year-End Closing");
    const opening = result.journalEntries.find((entry) => entry.sourceType === "New Fiscal Year Opening");
    expect(closing?.lines.reduce((sum, line) => sum + line.debit - line.credit, 0)).toBeCloseTo(0);
    expect(opening?.lines.reduce((sum, line) => sum + line.debit - line.credit, 0)).toBeCloseTo(0);
    expect(opening?.lines.every((line) => !data.chartOfAccounts.some((account) => account.code === line.accountCode && temporaryTypes.includes(account.type)))).toBe(true);
    expect(result.fiscalPeriods.filter((period) => period.companyId === "co-atlas" && period.fiscalYear === 2027)).toHaveLength(12);
    expect(result.fiscalPeriods.filter((period) => period.companyId === "co-atlas" && period.fiscalYear === 2026).every((period) => period.status === "closed")).toBe(true);
  });

  it("prevents duplicate year-end execution", () => {
    const once = closeFiscalYear(clone(), "co-atlas", 2026);
    expect(() => closeFiscalYear(once, "co-atlas", 2026)).toThrow(/بالفعل/);
  });
});

const temporaryTypes = ["revenue", "cost", "expense"];
