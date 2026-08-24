import { expect, test, type Page } from "@playwright/test";

const tenderModules = ["المناقصات", "تسعير المناقصات", "استفسارات المناقصات", "خطابات المناقصات", "الضمانات الابتدائية"];
const modules = [...tenderModules, "مركز المكاتبات", "الخطابات الصادرة", "الخطابات الواردة", "طلبات المعلومات (RFI)", "الاعتمادات (Submittals)", "خطابات الإرسال (Transmittals)", "تعليمات الموقع", "طلبات الفحص", "تقارير عدم المطابقة (NCR)", "المطالبات", "محاضر الاجتماعات", "متابعة الإجراءات", "قوالب الخطابات"];

async function setup(page: Page) {
  await page.goto("/");
  await page.getByLabel("كود الشركة").fill("TND");
  await page.getByLabel("اسم الشركة بالعربية").fill("شركة المناقصات");
  await page.getByLabel("اسم الشركة بالإنجليزية").fill("Tender Company");
  await page.getByLabel("الرقم الضريبي").fill("998877");
  await page.getByLabel("الهاتف").fill("01000000000");
  await page.getByLabel("البريد الإلكتروني").fill("tender@example.com");
  await page.getByRole("button", { name: "التالي" }).click(); await page.getByRole("button", { name: "التالي" }).click(); await page.getByRole("button", { name: "التالي" }).click();
  await page.getByLabel("الاسم الكامل").fill("مدير المناقصات"); await page.getByLabel("اسم المستخدم").fill("tenderadmin");
  await page.locator('input[autocomplete="new-password"]').first().fill("Tender123"); await page.getByLabel("تأكيد كلمة المرور").fill("Tender123");
  await page.getByRole("button", { name: "التالي" }).click(); await page.getByRole("button", { name: "إنهاء والانتقال لتسجيل الدخول" }).click();
  await page.getByLabel("اسم المستخدم").fill("tenderadmin"); await page.locator('input[autocomplete="current-password"]').fill("Tender123"); await page.getByRole("button", { name: "دخول" }).click();
  await expect(page.getByRole("heading", { name: "لوحة الإدارة" })).toBeVisible();
}

async function openModule(page: Page, name: string) {
  if ((page.viewportSize()?.width ?? 1366) <= 760) await page.locator("button.mobile-menu").click({ force: true });
  const aside = page.locator("aside"); const target = aside.getByRole("button", { name, exact: true });
  if (!await target.isVisible()) { const parent = aside.getByRole("button", { name: tenderModules.includes(name) ? "المناقصات والعقود" : "المكاتبات والمستندات", exact: true }); if (await parent.getAttribute("aria-expanded") === "false") await parent.dispatchEvent("click"); }
  await target.dispatchEvent("click");
  await expect(page.locator("main h2").filter({ hasText: name })).toBeVisible();
}

test.beforeEach(async ({ page }) => { await page.goto("/"); await page.evaluate(() => localStorage.clear()); });

test("Tender → award → project → correspondence acceptance flow", async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", error => errors.push(error.message)); await setup(page);
  for (const name of modules) await openModule(page, name);

  await openModule(page, "المناقصات"); await page.getByRole("button", { name: "مناقصة جديدة" }).click();
  await page.getByLabel("اسم المناقصة").fill("مناقصة إنشاء مبنى إداري"); await page.getByLabel("اسم العميل").fill("الهيئة العامة للمشروعات");
  await page.getByLabel("الاستشاري").fill("المكتب الاستشاري"); await page.getByLabel("اسم المشروع").fill("المبنى الإداري الجديد");
  await page.getByLabel("القيمة التقديرية").fill("1500000"); await page.getByLabel("المسؤول").fill("أحمد مهندس التسعير");
  await page.getByRole("button", { name: "حفظ المناقصة" }).click(); await expect(page.getByText("TND-2026-0001", { exact: true })).toBeVisible();
  await page.getByText("TND-2026-0001", { exact: true }).click(); await expect(page.getByRole("heading", { name: /TND-2026-0001/ })).toBeVisible();
  await page.getByLabel("التكلفة المباشرة").fill("1000000"); await page.getByLabel("التكلفة غير المباشرة").fill("100000"); await page.getByLabel("المصاريف العمومية").fill("50000"); await page.getByLabel("الاحتياطي").fill("50000"); await page.getByLabel("Markup").fill("300000"); await page.getByLabel("قيمة البيع").fill("1500000");
  await page.getByRole("button", { name: "حفظ نسخة" }).click(); await expect(page.getByText("Estimate Version 1")).toBeVisible();
  const bondCard = page.locator("section.mini-register").filter({ hasText: "الضمانات الابتدائية" }); await bondCard.getByRole("button").click();
  await page.getByLabel("الرقم").fill("BB-2026-0001"); await page.getByLabel("البنك").fill("البنك الأهلي"); await page.getByLabel("القيمة").fill("30000"); await page.getByRole("button", { name: "حفظ", exact: true }).click(); await expect(bondCard.getByText("BB-2026-0001")).toBeVisible();
  await page.getByRole("button", { name: "إنشاء خطاب تقديم" }).click();
  await page.locator(".commercial-hero select").selectOption("won"); page.once("dialog", dialog => dialog.accept()); await page.getByRole("button", { name: "تحويل إلى مشروع" }).click();

  await openModule(page, "طلبات المعلومات (RFI)"); await page.getByRole("button", { name: "إنشاء سجل" }).click();
  await page.getByLabel("المشروع").selectOption({ label: "PRJ-2026-0001 — المبنى الإداري الجديد" }); await page.getByLabel("إلى", { exact: true }).fill("المكتب الاستشاري"); await page.getByLabel("الموضوع").fill("استفسار تفاصيل الأساسات"); await page.getByLabel("نص الخطاب / السؤال / الوصف").fill("يرجى توضيح تفصيلة التسليح.");
  await page.locator(".dialog").getByRole("checkbox").check(); await page.getByLabel("تاريخ الرد المتوقع").fill("2026-09-01"); await page.getByRole("button", { name: "حفظ للمراجعة" }).click(); await expect(page.getByText("RFI-2026-0001", { exact: true })).toBeVisible();

  for (const [module, subject] of [["الاعتمادات (Submittals)", "اعتماد مادة خرسانة"], ["تعليمات الموقع", "تعليمات تعديل المدخل"], ["المطالبات", "مطالبة تغيير أعمال المدخل"]] as const) {
    await openModule(page, module); await page.getByRole("button", { name: "إنشاء سجل" }).click(); await page.getByLabel("المشروع").selectOption({ label: "PRJ-2026-0001 — المبنى الإداري الجديد" }); await page.getByLabel("الموضوع").fill(subject); await page.getByLabel("نص الخطاب / السؤال / الوصف").fill(subject); await page.getByRole("button", { name: "حفظ للمراجعة" }).click();
  }
  await openModule(page, "مركز المكاتبات"); await expect(page.getByText("استفسار تفاصيل الأساسات")).toBeVisible(); expect(errors).toEqual([]);
});
