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
  → Adjustments
  → Adjusted Trial Balance
  → Financial Statements
  → Closing Journal
  → Post-Closing Trial Balance
  → Year-End Carry Forward
  → New Fiscal Year Opening
```

توجد قيود متعددة السطور، قفل للفترات، قيود عكسية، Open Items، Aging، Collections/Payments allocations، Exceptions، وتتبع من القيد إلى المستند المصدر. يدعم إقفال السنة الحسابات المؤقتة، تحويل صافي النتيجة إلى الأرباح المحتجزة، ترحيل الحسابات الدائمة، قيد افتتاحي متوازن، وفتح 12 فترة للسنة الجديدة مع Audit Trail ومنع التكرار.

## Accounting Runtime Incident — Fixed

كان انهيار صفحات الحسابات مع بعض بيانات المتصفح القديمة ناتجًا عن ترحيل سطحي يحافظ على `fiscalPeriods` بلا `closingTasks` و`settlements` بلا `allocations` وقيود بلا nested arrays سليمة. كانت الواجهة تستدعي `.filter()` و`.reduce()` مباشرة على تلك القيم.

الإصلاح يطبّع كل nested accounting collections عند التحميل والاستعادة، ويحافظ على بيانات المستخدم، ويضيف Empty States واضحة وAccounting Error Boundary. اختبار Playwright يفتح 23 صفحة بالعربية والإنجليزية على Desktop وMobile في Fresh Browser ثم يعيد الاختبار بعد حقن Legacy malformed data.

## Financial Statements

من القيود المرحلة وتصنيف دليل الحسابات فقط:

- Income Statement.
- Balance Sheet مع معادلة التوازن.
- Cash Flow مع reconciliation.
- Changes in Equity.
- Detailed Trial Balance.
- Adjusted Trial Balance.
- Post-Closing Trial Balance.

الحسابات القديمة الناقصة تُصنّف تلقائيًا عند التحميل مع الحفاظ على أي تصنيف يدوي سابق. من **دليل الحسابات** يمكن التحكم في القائمة المالية، بند العرض، طبيعة الرصيد، وتصنيف التدفقات النقدية. تعرض القوائم تحذيرًا للقيود غير المرحلة أو الحسابات المستخدمة غير الموجودة في الدليل، كما تستخدم تاريخ الشركة المحلي بدل UTC حتى لا تُستبعد قيود اليوم.

## Project Accounting

يدعم أساسًا تفاعليًا لـProject Ledger وProject Trial Balance وCost Ledger وProject Income Statement وProject Financial Position والربحية والمطابقة بين التكلفة التشغيلية والمحاسبية. تجميع الشركة = معاملات المشروعات + معاملات الشركة + التسويات المتاحة.

## Tendering & Official Correspondence

توجد وحدة مستقلة داخل الـSidebar باسم **المناقصات والعقود** ووحدة **المكاتبات والمستندات**، وتشمل:

- Tender Register وPipeline وDeadlines وWin Rate.
- Checklist من 18 خطوة، Costing، Estimate Versioning، Documents، Addenda، Clarifications وBid Bonds.
- تحويل Tender فائزة إلى Project مع `originTenderId` وBudget Baseline ونسخ Document Metadata.
- Outgoing/Incoming Letters وRFI وSubmittals وTransmittals وSite Instructions وInspections وNCR وClaims وMeeting Minutes وAction Tracker.
- 31 قالبًا مرجعيًا مع User-created templates وFavorite/Duplicate/Archive.
- Smart variables مثل `{{companyName}}` و`{{projectName}}` و`{{letterNumber}}`.
- Numbering configurable لكل Company ولكل Record Type.
- Draft → Prepared → Reviewed → Approved → Issued مع Audit Trail.
- Company header حقيقي من Company Profile، ومرفقات Metadata فقط، وطباعة HTML/CSS أو Browser Save as PDF.
- Excel export للسجلات، Company/Project isolation، Deadline وBid Bond alerts، وCorrespondence Timeline.

لا يرسل النظام Email أو WhatsApp تلقائيًا؛ المستخدم يملك النص ويعدله ويعتمده قبل الإصدار.

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

آخر Quality Gate: TypeScript ناجح، ESLint بلا تحذيرات، **55/55** اختبار Vitest ناجح في 7 ملفات، وNext.js production build ناجح. نجح Accounting Playwright Smoke وتصنيف الحسابات القديمة القابل للتحكم **4/4** على Desktop وMobile، كما نجح Tender → Award → Project → RFI/Submittal/Instruction/Claim acceptance flow.

## Git Workflow

المستودع الرسمي: <https://github.com/AhmedMohamed500/Contracting-Project>

لا Force Push ولا destructive reset. لا تُرفع نسخة قبل نجاح typecheck وlint وtests وbuild.

## Vercel Deployment

Production: <https://binaa-construction-erp.vercel.app/>

النشر متصل بـGitHub ولا يحتاج Database أو Add-ons مدفوعة. إصلاح تصنيف الحسابات والقوائم `a4ea56b` اختُبر على Production في Desktop وMobile: ترقية حسابات Legacy، ظهور الإيراد، ثم تغيير بند عرضه من داخل دليل الحسابات؛ النتيجة **2/2 passed**. إصدار المناقصات `de2e95f` ما زال مجتازًا مسار القبول الكامل. يجب تكرار الاختبارات مع كل نشر لأن البيانات محلية لكل متصفح.

## Current Prototype Limitations

- ليست مصادقة إنتاجية ولا RBAC خادميًا.
- لا توجد قاعدة بيانات أو مزامنة بين الأجهزة.
- تخزين الملفات الحقيقي خارج النطاق الحالي.
- Procurement/RFQ/quotations، المخازن المتقدمة، العمالة والمعدات، Project Wizard الكامل، User Management، Report Workspace العام، Bank Reconciliation، وGlobal Search الشامل ما زالت جزئية أو خارطة طريق.
- النماذج المتخصصة الموسعة لـSite Visit Photos، Material technical sheets، Contract Guarantees/Clauses وHistorical Unit Cost Library لها Data foundation أو سجل عام، لكنها تحتاج شاشات تفصيلية إضافية قبل اعتبارها مكتملة إنتاجيًا.
- دليل الحسابات وOpening Balances يدخلها المستخدم؛ لا يُنشئ النظام Business Data تلقائيًا.
