import { describe, expect, it } from "vitest";
import { approveAndGenerateJournal, createDraftJournal, documentOutstanding, nextDocumentNumber, postJournal, postSettlement, reviewJournal, statementBalances } from "@/services/accounting-core";
import { demoData } from "@/data/demo-data";
import type { AccountingDocument, ErpData, SettlementDocument } from "@/types/erp";

const clone = (): ErpData => JSON.parse(JSON.stringify(demoData)) as ErpData;

function supplierInvoice(): AccountingDocument {
  return { id: "test-invoice", createdAt: "2026-08-21T10:00:00.000Z", updatedAt: "2026-08-21T10:00:00.000Z", number: "SUP-INV-2026-0001", sourceNumber: "DELTA-778", type: "supplier-invoice", companyId: "co-atlas", projectId: "prj-1", partyId: "sup-1", costCode: "MAT-STEEL", taxableAmount: 100000, taxRate: 14, taxAmount: 14000, withholdingAmount: 0, otherDeductions: 0, grossAmount: 114000, netAmount: 114000, settledAmount: 0, currency: "EGP", documentDate: "2026-08-21", dueDate: "2026-09-20", description: "حديد تسليح", workflowStatus: "submitted", accountingStatus: "classified", settlementStatus: "unpaid", attachments: [], createdBy: "Accountant" };
}

describe("accounting document core", () => {
  it("uses a separate number series per company and document type", () => {
    const data = clone();
    expect(nextDocumentNumber("supplier-invoice", data, "co-atlas", new Date("2026-08-21"))).toBe("SUP-INV-2026-0001");
  });

  it("generates a balanced draft journal from company mapping", () => {
    const data = clone();
    const journal = createDraftJournal(supplierInvoice(), data);
    expect(journal.status).toBe("draft");
    expect(journal.lines.find((line) => line.accountCode === "210100")?.credit).toBe(114000);
    expect(journal.lines.reduce((sum, line) => sum + line.debit - line.credit, 0)).toBe(0);
  });

  it("enforces Draft to Reviewed to Posted lifecycle and updates the source", () => {
    let data = clone();
    data.accountingDocuments.push(supplierInvoice());
    data = approveAndGenerateJournal("test-invoice", data);
    const journalId = data.accountingDocuments.find((item) => item.id === "test-invoice")?.journalId ?? "";
    expect(data.journalEntries.find((item) => item.id === journalId)?.status).toBe("draft");
    data = reviewJournal(journalId, data);
    data = postJournal(journalId, data);
    expect(data.journalEntries.find((item) => item.id === journalId)?.status).toBe("posted");
    expect(data.accountingDocuments.find((item) => item.id === "test-invoice")?.accountingStatus).toBe("posted");
  });

  it("allocates a partial supplier payment and keeps the open balance", () => {
    let data = clone();
    const invoice = { ...supplierInvoice(), accountingStatus: "posted" as const, workflowStatus: "posted" as const };
    data.accountingDocuments.push(invoice);
    const settlement: SettlementDocument = { id: "set-test", createdAt: invoice.createdAt, updatedAt: invoice.updatedAt, number: "SUP-PAY-2026-0001", companyId: "co-atlas", projectId: "prj-1", partyId: "sup-1", type: "supplier-payment", channel: "bank", amount: 40000, date: "2026-08-21", description: "دفعة جزئية", status: "draft", allocations: [{ id: "alloc-1", documentId: invoice.id, amount: 40000 }], createdBy: "Accountant" };
    data = postSettlement(settlement, data);
    const updated = data.accountingDocuments.find((item) => item.id === invoice.id)!;
    expect(updated.settlementStatus).toBe("partially-settled");
    expect(documentOutstanding(updated)).toBe(74000);
  });

  it("builds financial statement balances from posted journals only", () => {
    const data = clone();
    const before = statementBalances(data, "co-atlas");
    data.journalEntries.push({ ...data.journalEntries[0], id: "draft-copy", number: "JV-DRAFT", status: "draft", lines: data.journalEntries[0].lines.map((line) => ({ ...line, debit: line.debit * 100, credit: line.credit * 100 })) });
    expect(statementBalances(data, "co-atlas")).toEqual(before);
  });
});
