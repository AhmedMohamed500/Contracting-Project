import { expect, test, type Page } from "@playwright/test";

const routes = [
  "لوحة المحاسب", "المستندات المحاسبية", "القيود اليومية", "الخزينة والبنوك", "التسويات",
  "دفتر الأستاذ العام", "الأستاذ المساعد", "الذمم المدينة", "الذمم الدائنة", "ميزان المراجعة",
  "القوائم المالية", "قائمة الدخل", "قائمة المركز المالي", "قائمة التدفقات النقدية", "قائمة التغيرات في حقوق الملكية",
  "ميزان المراجعة المعدل", "إقفال الفترة", "ميزان ما بعد الإقفال", "دليل الحسابات", "مراكز التكلفة",
  "الربط المحاسبي", "الرقابة المحاسبية", "تكاليف وربحية المشروعات",
];
const englishRoutes = [
  "Accountant Dashboard", "Accounting Documents", "Journal Entries", "Treasury & Banks", "Settlements",
  "General Ledger", "Subsidiary Ledgers", "Receivables", "Payables", "Trial Balance",
  "Financial Statements", "Income Statement", "Financial Position", "Cash Flow Statement", "Changes in Equity",
  "Adjusted Trial Balance", "Period Closing", "Post-closing Trial Balance", "Chart of Accounts", "Cost Centers",
  "Account Mapping", "Accounting Control", "Project Costing",
];

async function createFreshCompany(page: Page) {
  await page.goto("/");
  await page.getByLabel("كود الشركة").fill("E2E");
  await page.getByLabel("اسم الشركة بالعربية").fill("شركة اختبار الحسابات");
  await page.getByLabel("اسم الشركة بالإنجليزية").fill("Accounting Test Company");
  await page.getByLabel("الرقم الضريبي").fill("123456789");
  await page.getByLabel("الهاتف").fill("01000000000");
  await page.getByLabel("البريد الإلكتروني").fill("accounting@example.com");
  await page.getByRole("button", { name: "التالي" }).click();
  await page.getByRole("button", { name: "التالي" }).click();
  await page.getByRole("button", { name: "التالي" }).click();
  await page.getByLabel("الاسم الكامل").fill("مدير الاختبار");
  await page.getByLabel("اسم المستخدم").fill("e2eadmin");
  await page.locator('input[autocomplete="new-password"]').first().fill("Testing123");
  await page.getByLabel("تأكيد كلمة المرور").fill("Testing123");
  await page.getByRole("button", { name: "التالي" }).click();
  await page.getByRole("button", { name: "إنهاء والانتقال لتسجيل الدخول" }).click();
  await page.getByLabel("اسم المستخدم").fill("e2eadmin");
  await page.locator('input[autocomplete="current-password"]').fill("Testing123");
  await page.getByRole("button", { name: "دخول" }).click();
  await expect(page.getByRole("heading", { name: "لوحة الإدارة" })).toBeVisible();
}

async function openModule(page: Page, name: string) {
  if ((page.viewportSize()?.width ?? 1366) <= 760) await page.locator("button.mobile-menu").click({ force: true });
  const aside = page.locator("aside");
  const target = aside.getByRole("button", { name, exact: true });
  if (!await target.isVisible()) {
    const english = englishRoutes.includes(name);
    const parent = aside.getByRole("button", { name: english ? "Accounting" : "الحسابات", exact: true });
    if (await parent.getAttribute("aria-expanded") === "false") await parent.dispatchEvent("click");
    for (const button of await aside.locator(".nav-subgroup-button[aria-expanded='false']").all()) if (await button.isVisible()) await button.dispatchEvent("click");
  }
  await target.dispatchEvent("click");
  if ((page.viewportSize()?.width ?? 1366) <= 760) await expect(page.locator("aside")).not.toHaveClass(/open/);
}

test.beforeEach(async ({ page }) => {
  await page.context().clearCookies();
  await page.goto("/");
  await page.evaluate(() => localStorage.clear());
});

test("Accounting Navigation Smoke Test — fresh and legacy nested data", async ({ page }) => {
  const runtimeErrors: string[] = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  await createFreshCompany(page);

  for (const name of routes) {
    await openModule(page, name);
    await expect(page.locator("main").getByRole("heading", { name, exact: true })).toBeVisible();
    await expect(page.locator("main")).not.toBeEmpty();
    if (name === "لوحة المحاسب") await expect(page.getByText("لم يتم إعداد دليل الحسابات بعد")).toBeVisible();
  }

  await page.evaluate(() => {
    const key = "sitecost-erp-data-v2";
    const data = JSON.parse(localStorage.getItem(key) ?? "{}");
    if (data.fiscalPeriods?.[0]) delete data.fiscalPeriods[0].closingTasks;
    data.settlements = [{ id: "legacy-settlement", companyId: data.companies[0].id, status: "posted", amount: 100 }];
    localStorage.setItem(key, JSON.stringify(data));
  });
  await page.reload();
  await openModule(page, "لوحة المحاسب");
  await expect(page.getByText("لم يتم إعداد دليل الحسابات بعد")).toBeVisible();
  await openModule(page, "القيود اليومية");
  await page.reload();
  await expect(page.locator("main").getByRole("heading", { name: "القيود اليومية", exact: true })).toBeVisible();
  await expect(page.locator("aside").getByRole("button", { name: "الحسابات", exact: true })).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator("aside").getByRole("button", { name: "العمليات اليومية", exact: true })).toHaveAttribute("aria-expanded", "true");
  await page.getByRole("button", { name: "Language" }).click();
  for (const name of englishRoutes) {
    await openModule(page, name);
    await expect(page.locator("main").getByRole("heading", { name, exact: true })).toBeVisible();
    await expect(page.locator("main")).not.toBeEmpty();
  }
  expect(runtimeErrors).toEqual([]);
});

test("Legacy account classification feeds statements and remains user-configurable", async ({ page }) => {
  const runtimeErrors: string[] = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  await createFreshCompany(page);
  await page.evaluate(() => {
    const key = "sitecost-erp-data-v2";
    const data = JSON.parse(localStorage.getItem(key) ?? "{}");
    const companyId = data.companies[0].id;
    const timestamp = new Date().toISOString();
    const base = { companyId, createdAt: timestamp, updatedAt: timestamp, isControl: false, active: true };
    data.chartOfAccounts = [
      { ...base, id: "legacy-bank", code: "110200", name: "البنوك", nameEn: "Banks", type: "asset" },
      { ...base, id: "legacy-revenue", code: "410100", name: "إيرادات عقود المشاريع", nameEn: "Project Revenue", type: "revenue" },
    ];
    data.journalEntries = [{ id: "legacy-posted", createdAt: timestamp, updatedAt: timestamp, number: "JV-2026-0001", companyId, date: "2026-08-24", description: "Legacy posted revenue", journalType: "general", sourceModule: "Migration", sourceType: "Legacy Journal", sourceNumber: "LEGACY-1", automatic: false, status: "posted", createdBy: "Accountant", postedBy: "Accountant", auditTrail: [], lines: [
      { accountCode: "110200", accountName: "البنوك", description: "تحصيل", debit: 1000, credit: 0 },
      { accountCode: "410100", accountName: "إيرادات عقود المشاريع", description: "إيراد", debit: 0, credit: 1000 },
    ] }];
    localStorage.setItem(key, JSON.stringify(data));
  });
  await page.reload();
  await openModule(page, "قائمة الدخل");
  const expected = new Intl.NumberFormat("ar-EG", { style: "currency", currency: "EGP", maximumFractionDigits: 0 }).format(1000);
  await expect(page.locator(".financial-row").filter({ hasText: "إيرادات المشروعات" })).toContainText(expected);
  await openModule(page, "دليل الحسابات");
  await expect(page.getByLabel("بند العرض 410100")).toHaveValue("project-revenue");
  await page.getByLabel("بند العرض 410100").selectOption("other-income");
  await openModule(page, "قائمة الدخل");
  await expect(page.locator(".financial-row").filter({ hasText: "إيرادات أخرى" })).toContainText(expected);
  expect(runtimeErrors).toEqual([]);
});
