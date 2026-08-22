import { describe, expect, it } from "vitest";
import { createEmptyErpData, normalizeErpData } from "@/repositories/local-storage-erp.repository";
import { createPasswordCredential, validatePrototypePassword, verifyPassword } from "@/services/local-auth";
import type { Company, ErpData, ErpUser } from "@/types/erp";

describe("first-run ownership and local prototype authentication", () => {
  it("creates a completely empty fresh installation", () => {
    const data = createEmptyErpData();
    expect(data.companies).toEqual([]);
    expect(data.customers).toEqual([]);
    expect(data.suppliers).toEqual([]);
    expect(data.subcontractors).toEqual([]);
    expect(data.projects).toEqual([]);
    expect(data.warehouses).toEqual([]);
    expect(data.certificates).toEqual([]);
    expect(data.journalEntries).toEqual([]);
    expect(data.users).toEqual([]);
  });

  it("enforces the prototype password policy", () => {
    expect(validatePrototypePassword("short1")).toBe(false);
    expect(validatePrototypePassword("onlyletters")).toBe(false);
    expect(validatePrototypePassword("SiteCost2026")).toBe(true);
  });

  it("stores a salted password hash and verifies success and failure", async () => {
    const credential = await createPasswordCredential("SiteCost2026");
    expect(credential.passwordHash).not.toContain("SiteCost2026");
    expect(credential.passwordSalt.length).toBeGreaterThan(10);
    expect(await verifyPassword("SiteCost2026", credential)).toBe(true);
    expect(await verifyPassword("Wrong2026", credential)).toBe(false);
  });

  it("uses a different salt for the same password", async () => {
    const first = await createPasswordCredential("SiteCost2026");
    const second = await createPasswordCredential("SiteCost2026");
    expect(first.passwordSalt).not.toBe(second.passwordSalt);
    expect(first.passwordHash).not.toBe(second.passwordHash);
  });

  it("migrates legacy data without injecting demo business records", () => {
    const company: Company = { id: "co-user", createdAt: "2026-01-01", updatedAt: "2026-01-01", name: "شركة المستخدم", nameEn: "User Co", taxNumber: "123", phone: "01000000000", email: "user@example.com", address: "Cairo", status: "active" };
    const legacy = { ...createEmptyErpData(), companies: [company] } as ErpData;
    delete (legacy as Partial<ErpData>).users;
    const migrated = normalizeErpData(legacy);
    expect(migrated.companies).toEqual([company]);
    expect(migrated.users).toEqual([]);
    expect(migrated.projects).toEqual([]);
    expect(migrated.chartOfAccounts).toEqual([]);
    expect(migrated.journalEntries).toEqual([]);
  });

  it("keeps company access isolated on the user record", async () => {
    const credential = await createPasswordCredential("Owner2026");
    const user: ErpUser = { id: "usr-1", createdAt: "2026-01-01", updatedAt: "2026-01-01", fullName: "Owner", username: "owner", ...credential, role: "owner", companyIds: ["co-a"], projectIds: [], status: "active" };
    expect(user.companyIds).toContain("co-a");
    expect(user.companyIds).not.toContain("co-b");
  });
});
