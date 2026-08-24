import { describe, expect, it } from "vitest";
import { demoData } from "@/data/demo-data";
import { normalizeErpData } from "@/repositories/local-storage-erp.repository";
import { buildGeneralLedger } from "@/services/general-ledger";
import type { ErpData, JournalEntry } from "@/types/erp";
import { safeDivide, safeNumber, safeSum } from "@/utils/safe-number";

describe("general ledger isolation", () => {
  it("keeps a separate running balance for each account and includes opening movement", () => {
    const base: Omit<JournalEntry, "id" | "number" | "date" | "lines"> = { companyId: "c", description: "test", reference: "R", journalType: "general", sourceModule: "test", sourceType: "test", sourceNumber: "R", automatic: false, status: "posted", createdBy: "user", auditTrail: [], createdAt: "2026-01-01", updatedAt: "2026-01-01" };
    const entries: JournalEntry[] = [
      { ...base, id: "opening", number: "JV-1", date: "2026-01-01", lines: [{ accountCode: "100", accountName: "Cash", description: "opening", debit: 50, credit: 0 }, { accountCode: "200", accountName: "Equity", description: "opening", debit: 0, credit: 50 }] },
      { ...base, id: "movement", number: "JV-2", date: "2026-02-01", lines: [{ accountCode: "100", accountName: "Cash", description: "sale", debit: 100, credit: 0 }, { accountCode: "400", accountName: "Revenue", description: "sale", debit: 0, credit: 100 }] },
    ];
    const rows = buildGeneralLedger(entries, [], { from: "2026-02-01" });
    expect(rows.find((row) => row.accountCode === "100")?.balance).toBe(150);
    expect(rows.find((row) => row.accountCode === "400")?.balance).toBe(-100);
  });

  it("filters project lines without leaking company-level or other-project lines", () => {
    const entry = JSON.parse(JSON.stringify(demoData.journalEntries.find((item) => item.lines.some((line) => line.projectId)))) as JournalEntry;
    const projectId = entry.lines.find((line) => line.projectId)?.projectId;
    expect(buildGeneralLedger([entry], demoData.projects, { projectId }).every((row) => row.project?.id === projectId)).toBe(true);
  });
});

describe("defensive numeric normalization", () => {
  it("turns malformed stored accounting numbers into finite values", () => {
    const malformed = JSON.parse(JSON.stringify(demoData)) as ErpData;
    Object.assign(malformed.purchaseOrders[0], { amount: "1,250.5", receivedAmount: "bad" });
    Object.assign(malformed.inventoryMovements[0], { quantity: Number.NaN, unitCost: "75" });
    Object.assign(malformed.certificates[0], { grossAmount: "invalid", lines: null });
    const result = normalizeErpData(malformed);
    expect(result.purchaseOrders[0].amount).toBe(1250.5);
    expect(result.purchaseOrders[0].receivedAmount).toBe(0);
    expect(result.inventoryMovements[0].quantity).toBe(0);
    expect(result.inventoryMovements[0].unitCost).toBe(75);
    expect(result.certificates[0].lines).toEqual([]);
  });

  it("provides finite-safe arithmetic helpers", () => {
    expect(safeNumber("1,000")).toBe(1000);
    expect(safeSum([1, Number.NaN, "2"], (value) => value)).toBe(3);
    expect(safeDivide(10, 0)).toBe(0);
  });
});
