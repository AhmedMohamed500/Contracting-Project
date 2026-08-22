# SiteCost ERP

**Construction Financial & Project Control System**<br>
**نظام إدارة وتكاليف ومراقبة مشاريع المقاولات**

نموذج ERP تفاعلي محلي لشركات المقاولات يربط بيانات الشركات والمشروعات والعقود وWBS وأكواد التكلفة والمخازن والمستخلصات بالدورة المحاسبية والقوائم المالية. التوثيق العربي الكامل موجود في [PROJECT_DOCUMENTATION_AR.md](./PROJECT_DOCUMENTATION_AR.md).

## First Run Setup

Fresh installations start completely empty. لا تُحمّل أي شركة أو عميل أو مورد أو مشروع أو حركة Demo تلقائيًا.

```text
No company
  → Company setup
  → Optional company logo
  → Financial defaults
  → Create first administrator
  → Review and finish
  → Login
  → Empty ERP + Getting Started checklist
```

يدخل المستخدم بيانات شركته بنفسه. Sample Data اختيارية فقط من أدوات الـPrototype داخل Settings وبعد رسالة تحذير صريحة.

تعتمد صفحة Setup وLogin نظامًا بصريًا موحدًا بصورة إنشاءات واقعية مضيئة. على Desktop تشغل صورة Setup نحو 57% والنموذج 43%، بينما يستخدم Mobile Banner إنشائيًا مختصرًا وStepper مبسطًا دون تزاحم.

## Company Logo

- PNG وJPG وWEBP فقط.
- حد أقصى 400 KB.
- يُحفظ كـData URL خفيف داخل بيانات النموذج المحلي.
- يظهر في Setup وLogin وهوية النظام.
- المستندات الكبيرة لا تُحفظ داخل LocalStorage؛ النظام يحفظ Metadata فقط حاليًا.

## Local Authentication

- أول Admin ينشئه المستخدم أثناء Setup.
- كلمة المرور لا تُحفظ Plain Text.
- يستخدم النموذج Web Crypto PBKDF2 + SHA-256 + random salt و120,000 iteration.
- Session منفصلة في `sessionStorage`، وLogout يمسح Session فقط دون بيانات الشركة.
- الخطأ لا يكشف هل اسم المستخدم أم كلمة المرور هو غير الصحيح.

> Current authentication is prototype-only and stored locally. It must be replaced with server-side authentication when the production backend architecture is approved.

## User-Owned Data

The user supplies the business data. SiteCost ERP supplies validation, calculations, workflow, accounting, project costing, reconciliation, reporting, and control.

بعد أول Login تكون أعداد العملاء والموردين ومقاولي الباطن والمشروعات والمخازن والمواد والمستخلصات والفواتير والقيود صفرًا. Dashboard لا تعرض أرقامًا تجريبية؛ وتعرض قائمة **ابدأ من هنا**.

## Architecture

```text
Next.js / React UI
  → Application actions
  → Business and accounting services
  → Repository interfaces
  → LocalStorage repositories (prototype only)
```

- لا يوجد Database أو Backend API أو خدمة مدفوعة.
- لا تستخدم Components `localStorage` أو `sessionStorage` مباشرة.
- يمكن استبدال Repository المحلي لاحقًا بـAPI repository دون نقل قواعد الحساب إلى JSX.
- Storage key الحالي: `sitecost-erp-data-v2`.
- المفتاح القديم `binaa-erp-data-v1` يُقرأ ويُرقّى دون حذفه تلقائيًا.
- الـNormalization لا يحقن Demo accounts أو journals أو documents في بيانات المستخدم.

## Cumulative Certificates

محرك المستخلصات يدعم السابق والحالي والتراكمي على مستوى المشروع:

```text
20% cumulative → current 20%
35% cumulative → previous 20% → current 15%
50% cumulative → previous 35% → current 15%
```

يشمل Validation لعدم الانخفاض أو تجاوز 100%، طرق Overall Progress وBOQ Quantities، الاسترداد والاحتجاز والخصومات، وإنشاء Accounting Document للمراجعة.

## Accounting Cycle

```text
Source Document
  → Classification and company mapping
  → Draft Journal
  → Review
  → Post
  → General Ledger
  → Trial Balance
  → Financial Statements
```

توجد قيود متعددة السطور، قفل للفترات، قيود عكسية، Open Items، Aging، Collections/Payments allocations، Exceptions، وتتبع من القيد إلى المستند المصدر.

## Financial Statements

من القيود المرحلة وتصنيف دليل الحسابات فقط:

- Income Statement.
- Balance Sheet مع معادلة التوازن.
- Cash Flow مع reconciliation.
- Changes in Equity.
- Detailed Trial Balance.
- Adjusted Trial Balance.
- Post-Closing Trial Balance.

## Project Accounting

يدعم أساسًا تفاعليًا لـProject Ledger وProject Trial Balance وCost Ledger وProject Income Statement وProject Financial Position والربحية والمطابقة بين التكلفة التشغيلية والمحاسبية. تجميع الشركة = معاملات المشروعات + معاملات الشركة + التسويات المتاحة.

## Run Locally

```bash
npm install
npm run dev
```

افتح `http://localhost:3000`.

## Testing

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

آخر Quality Gate: TypeScript ناجح، ESLint بلا تحذيرات، **35/35** اختبار Vitest ناجح، وNext.js production build ناجح. تم كذلك اختبار Fresh Browser flow ورفع الشعار والدخول والخروج واستعادة Session والـMobile overflow عبر Playwright/Chromium.

## Git Workflow

المستودع الرسمي: <https://github.com/AhmedMohamed500/Contracting-Project>

لا Force Push ولا destructive reset. لا تُرفع نسخة قبل نجاح typecheck وlint وtests وbuild.

## Vercel Deployment

Production: <https://binaa-construction-erp.vercel.app/>

النشر متصل بـGitHub ولا يحتاج Database أو Add-ons مدفوعة. آخر نشر اختُبر على Browser profile فارغ في Desktop وMobile، وشمل Setup وLogin failure/success وSession restore وEmpty Dashboard. يجب تكرار هذا الاختبار مع كل نشر لأن البيانات محلية لكل متصفح.

## Current Prototype Limitations

- ليست مصادقة إنتاجية ولا RBAC خادميًا.
- لا توجد قاعدة بيانات أو مزامنة بين الأجهزة.
- تخزين الملفات الحقيقي خارج النطاق الحالي.
- Procurement/RFQ/quotations، المخازن المتقدمة، العمالة والمعدات، Project Wizard الكامل، User Management، Report Workspace العام، Bank Reconciliation، Year-End Closing، وGlobal Search الشامل ما زالت جزئية أو خارطة طريق.
- دليل الحسابات وOpening Balances يدخلها المستخدم؛ لا يُنشئ النظام Business Data تلقائيًا.
