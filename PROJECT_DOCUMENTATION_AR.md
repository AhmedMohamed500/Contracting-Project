# توثيق مشروع SiteCost ERP

> وثيقة المشروع الرئيسية — الرؤية، النطاق، المعمارية، الوحدات، قواعد العمل، المحاسبة، التشغيل، الاختبارات، النشر وخارطة الطريق.

## 1. معلومات المشروع

| البند | القيمة |
| --- | --- |
| اسم المنتج | SiteCost ERP / سايت كوست ERP |
| الوصف | Construction Financial & Project Control System |
| نوع المنتج | Construction ERP Prototype |
| الجمهور المستهدف | شركات المقاولات، المقاولون، المكاتب الهندسية، فرق إدارة المشروعات والمواقع |
| المستودع | <https://github.com/AhmedMohamed500/Contracting-Project> |
| النسخة الحية | <https://binaa-construction-erp.vercel.app/> |
| الفرع الرئيسي | `main` |
| التخزين الحالي | Browser LocalStorage |
| Backend حقيقي | غير مستخدم عمدًا في مرحلة الـPrototype |
| Database حقيقية | غير مستخدمة عمدًا في مرحلة الـPrototype |
| الاستضافة | Vercel Free Plan |
| اللغة | العربية RTL والإنجليزية LTR |
| حالة المشروع | Prototype تفاعلي قيد التطوير المرحلي |

## 2. الهدف من المشروع

إنشاء نموذج ERP تفاعلي واقعي لشركة مقاولات، يمكن عرضه على شركة حقيقية لتحليل الدورة المستندية والتشغيلية والمحاسبية قبل اتخاذ قرارات نهائية تخص:

- قاعدة البيانات.
- الـBackend.
- المصادقة والصلاحيات الإنتاجية.
- تخزين الملفات.
- دورة الاعتمادات.
- الضرائب.
- مراكز التكلفة.
- شجرة الحسابات.
- دورة المشتريات والمخازن.
- المقايسات والمستخلصات.
- الإقفال المالي والتقارير النهائية.

الهدف ليس إنشاء Admin Dashboard شكلي، بل تطبيق تعمل داخله العمليات وتؤثر على المخزون والتكاليف والقيود والربحية والتقارير.

## 3. المبدأ التشغيلي العام

```text
Tendering
  ↓
Contracts
  ↓
Projects
  ↓
BOQ / Rate Analysis / Budget
  ↓
Procurement
  ↓
Warehouses / Inventory
  ↓
Site Execution / Expenses
  ↓
Project Cost
  ↓
Progress Certificates
  ↓
Treasury / Banks
  ↓
Accounting
  ↓
Project & Company Profitability
  ↓
Management Dashboard
```

## 4. المبدأ المحاسبي الأساسي

المحاسبة ليست وحدة منفصلة عن المشروعات. جميع عمليات التشغيل يجب أن تغذي الدورة المحاسبية:

```text
Company Accounting
  ↓
Projects
  ↓
Project Transactions
  ↓
Journal Entries
  ↓
General Ledger
  ↓
Trial Balance
  ↓
Financial Reports
```

يمكن استخراج البيانات على مستوى:

- الشركة بالكامل.
- مشروع واحد.
- حساب.
- مركز تكلفة.
- Cost Code.
- WBS.
- BOQ Item.
- مصدر العملية.
- المستند المصدر.

## 5. ما لا يستخدمه المشروع حاليًا

المشروع لا يستخدم في مرحلة الـPrototype:

- PostgreSQL أو MySQL أو SQL Server أو SQLite.
- MongoDB أو Firebase أو Supabase أو Neon.
- Prisma أو Drizzle Database.
- Backend API حقيقي.
- Production Authentication.
- Cloud File Storage.
- خدمات مدفوعة أو APIs تحتاج Billing.
- Paid UI Kits أو Paid Charts أو Paid PDF APIs.

هذا قرار مقصود حتى لا يتم تثبيت Business Rules أو Database Schema قبل تحليل الشركة المستهدفة.

## 6. التقنية المستخدمة

### التطبيق

- Next.js.
- React.
- Strict TypeScript.
- Tailwind CSS.
- Radix UI primitives.
- Lucide React.
- React Hook Form.
- Zod.
- TanStack Table.
- Zustand.
- Apache ECharts.
- ExcelJS.
- date-fns.
- Sonner Toasts.

### الجودة والاختبارات

- Vitest لاختبارات الحسابات وقواعد العمل.
- Playwright ضمن الـStack لاختبارات End-to-End.
- ESLint.
- TypeScript compiler.
- Next.js Production Build.

## 7. معمارية التطبيق

```text
Presentation Layer
  Next.js / React Components
          ↓
Application Actions
  CRUD + Workflow Commands
          ↓
Business / Domain Services
  Costing + Accounting + Inventory + Certificates
          ↓
Repository Interfaces
          ↓
LocalStorage Repository
  Temporary Prototype Persistence
```

### سبب هذا الفصل

- منع استخدام LocalStorage مباشرة داخل المكونات.
- إبقاء الحسابات خارج JSX.
- إمكانية استبدال `LocalStorageErpRepository` لاحقًا بـ`ApiErpRepository`.
- الحفاظ على الواجهة والحسابات عند إضافة Backend.
- سهولة اختبار Business Logic دون تشغيل المتصفح.

## 8. هيكل الملفات الحالي

```text
src/
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── accounting/
│   │   └── accounting-center.tsx
│   ├── forms/
│   │   └── entity-form.tsx
│   ├── shared/
│   │   ├── data-table.tsx
│   │   └── modal.tsx
│   ├── erp-application.tsx
│   └── quick-entry-form.tsx
├── data/
│   └── demo-data.ts
├── repositories/
│   ├── erp.repository.ts
│   └── local-storage-erp.repository.ts
├── services/
│   └── business-calculations.ts
├── store/
│   └── ui-store.ts
├── tests/
│   └── business-calculations.test.ts
├── types/
│   └── erp.ts
└── utils/
    └── format.ts
```

## 9. التخزين المحلي

### LocalStorage Repository

البيانات تحفظ من خلال:

```text
ErpRepository
  ↓
LocalStorageErpRepository
```

المفتاح الحالي:

```text
binaa-erp-data-v1
```

### خصائص التخزين

- البيانات تبقى بعد Refresh.
- أول زيارة تحمل Demo Data تلقائيًا.
- البيانات القديمة يتم Normalization/Migration لها عند القراءة.
- سجلات المستخدم لا يتم حذفها أثناء Migration.
- يمكن تصدير كل البيانات JSON.
- يمكن استعادة JSON بعد Validation.
- يمكن إعادة تحميل البيانات التجريبية بعد Confirmation.

### الهجرة المستقبلية

عند إضافة Backend:

```text
UI
  ↓
Application Services
  ↓
ErpRepository Interface
  ↓
ApiErpRepository
```

لا يجب إعادة كتابة الحسابات أو مكونات العرض.

## 10. نموذج البيانات الحالي

### الكيانات الأساسية

- `Company`
- `Project`
- `Party`
  - Customer
  - Supplier
  - Subcontractor
- `BoqItem`
- `PurchaseOrder`
- `InventoryMovement`
- `Expense`
- `Certificate`
- `ChartOfAccount`
- `AccountingMapping`
- `JournalEntry`
- `JournalLine`
- `FiscalPeriod`
- `DocumentMetadata`

### بيانات المشروع

كل Project يحتوي حاليًا على:

- Code.
- Name.
- Company.
- Customer.
- Project Cost Center.
- WBS Code.
- Location.
- Contract Value.
- Budget.
- Historical/Recorded Actual Cost.
- Progress Percentage.
- Start Date.
- End Date.
- Status.

عند إنشاء مشروع جديد يتم توليد:

```text
Cost Center: CC-{Project Code}
WBS: WBS-{Project Code}
```

## 11. البيانات التجريبية

### الشركة

```text
Atlas Construction / أطلس للمقاولات
```

### المشروعات

- `PRJ-026 — مركز الإسكندرية للأعمال`
- `PRJ-031 — كمبوند القاهرة الجديدة السكني`
- `PRJ-034 — منتجع الساحل الشمالي`

### الموردون

- دلتا لمواد البناء.
- الإسكندرية لتوريدات الصلب.
- القاهرة لتجارة الأسمنت.

### المواد والأعمال

- حديد تسليح.
- أسمنت.
- خرسانة مسلحة.
- سيراميك وتشطيبات.
- مصروفات تشغيل موقع.
- أعمال كهروميكانيكية لمقاول باطن.

البيانات التجريبية ليست Lorem Ipsum؛ جميع الأرقام والعمليات مرتبطة بوحدات النظام.

## 12. الوحدات الحالية

### 12.1 Executive Dashboard

تعرض بيانات محسوبة من العمليات:

- قيمة العقود النشطة.
- الإيراد المكتسب.
- الربح المتوقع حتى تاريخه.
- مستحقات العملاء.
- Revenue vs Cost Chart.
- صحة المشروعات.
- تنبيهات الانحراف والتكلفة.

### 12.2 Companies

- إنشاء شركة.
- تعديل الشركة.
- أرشفة وإعادة تنشيط.
- بحث وفرز وصفحات.
- عند إنشاء شركة يتم نسخ دليل حسابات وAccounting Mapping ابتدائي لها.

### 12.3 Projects

- إنشاء وتعديل وأرشفة المشروع.
- ربط الشركة والعميل.
- Contract Value وBudget.
- Progress.
- Start/End Dates.
- Cost Center وWBS تلقائيًا.
- Project Health Score.

### 12.4 Business Partners

- العملاء.
- الموردون.
- مقاولو الباطن.
- Create/Edit/Archive.
- Code، Tax Number، Contact Data، Balance.

### 12.5 BOQ

- إضافة وحذف بنود المقايسة.
- Project Dimension.
- Code وDescription وUnit.
- Quantity.
- Selling Unit Rate.
- Budget Unit Rate.
- Total Value.
- Unit Margin.

### 12.6 Procurement

- إنشاء Purchase Order.
- ربط المشروع والمورد.
- Approved/Posted status.
- استلام أمر الشراء.
- الاستلام ينشئ Inventory Receipt.
- الاستلام ينشئ Automatic Journal.

### 12.7 Inventory

- Material Receipt.
- Material Issue.
- Transfer.
- Return.
- Warehouse Dimension.
- Quantity وUnit Cost.
- منع الرصيد السالب عند Material Issue.
- Material Issue يغذي Project Cost Ledger.
- Material Issue ينشئ Automatic Journal.

### 12.8 Project Expenses

- تسجيل المصروف.
- Project Optional في النموذج المحاسبي لدعم Company-Level Expenses.
- Cost Code.
- Description، Amount، Date، Status.
- المصروف المرتبط بمشروع ينشئ قيدًا تلقائيًا.

### 12.9 Progress Certificates

- Customer Certificate.
- Subcontractor Certificate.
- Gross Amount.
- Retention Rate.
- Tax Rate.
- Net Amount.
- Paid Amount.
- Outstanding.
- إنشاء القيد التلقائي حسب النوع.

### 12.10 Documents Center

يحفظ Metadata فقط:

- File Name.
- File Type.
- Size.
- Category.
- Project.
- Related Transaction.
- Description.
- Upload Date.

لا يتم حفظ ملفات ضخمة داخل LocalStorage. يوجد `FileStorageProvider` Concept للمستقبل.

### 12.11 Settings

- Backup JSON.
- Restore JSON.
- Reset Demo Data.
- Currency.
- VAT Rate.
- Withholding Rate.
- Negative Stock Policy.

## 13. دورة محاسبة المشروعات

### 13.1 أبعاد سطر القيد

كل `JournalLine` يدعم:

- Account Code.
- Account Name.
- Debit.
- Credit.
- Company من Header القيد.
- Project.
- Cost Center.
- Cost Code.
- WBS.
- BOQ Item.
- Reference.
- Source Module.
- Source Document.
- Description.

### 13.2 قاعدة العرض الإلزامية

الحساب يعرض دائمًا:

```text
510100 — تكلفة مواد المشاريع
```

المشروع يعرض دائمًا:

```text
PRJ-026 — مركز الإسكندرية للأعمال
```

Cost Code يعرض بالشكل:

```text
01.02 — Concrete Works
```

## 14. دليل الحسابات التجريبي

| الكود | الحساب | النوع |
| --- | --- | --- |
| 110100 | النقدية بالصندوق | Asset |
| 110200 | البنوك | Asset |
| 120100 | ذمم العملاء | Asset / Control |
| 120200 | احتجازات لدى العملاء | Asset / Control |
| 130100 | مخزون المواد | Asset / Control |
| 140100 | أعمال تحت التنفيذ | Asset / Control |
| 210100 | ذمم الموردين | Liability / Control |
| 210200 | ذمم مقاولي الباطن | Liability / Control |
| 210300 | احتجازات مقاولي الباطن | Liability / Control |
| 220100 | ضريبة القيمة المضافة | Liability / Control |
| 410100 | إيرادات عقود المشاريع | Revenue |
| 510100 | تكلفة مواد المشاريع | Project Cost |
| 510200 | تكلفة عمالة المشاريع | Project Cost |
| 510300 | تكلفة معدات المشاريع | Project Cost |
| 510400 | تكلفة مقاولي الباطن | Project Cost |
| 510600 | مصروفات المواقع | Project Cost |

هذه الشجرة Demo فقط وقابلة للتغيير بعد تحليل شركة المقاولات.

## 15. Accounting Mapping

كل Company لها Mapping مستقل، ويستخدمه محرك القيود الآلية. الحسابات غير Hardcoded داخل عملية التشغيل.

الـMapping الحالي يدعم:

- Customer Control.
- Supplier Control.
- Subcontractor Control.
- Inventory.
- Material Cost.
- Labor Cost.
- Equipment Cost.
- Subcontractor Cost.
- Site Expense.
- Project Revenue.
- WIP.
- Retention Receivable.
- Retention Payable.
- Cash.
- Banks.
- VAT Input.
- VAT Output.

يمكن تعديل الربط من:

```text
Accounting → ربط الحسابات
```

## 16. القيود الآلية

### 16.1 استلام مواد / Purchase Receipt

```text
Dr  Inventory
Cr  Supplier Control
```

### 16.2 صرف مواد للمشروع

```text
Dr  Project Material Cost
Cr  Inventory
```

الأبعاد:

- Project.
- Cost Center.
- Cost Code.
- WBS.
- BOQ.
- Material Issue Number.

### 16.3 مصروف مشروع

```text
Dr  Project Site Expense
Cr  Cash
```

### 16.4 مستخلص عميل

```text
Dr  Customer Receivable
Dr  Retention Receivable
Cr  Project Revenue
Cr  VAT Output
```

### 16.5 مستخلص مقاول باطن

```text
Dr  Subcontractor Project Cost
Dr  VAT Input
Cr  Subcontractor Payable
Cr  Retention Payable
```

## 17. Manual Journal

المدخلات الحالية:

- Date.
- Description.
- Debit Account: `Code — Name`.
- Credit Account: `Code — Name`.
- Amount.
- Project optional.
- Cost Code optional.
- Reference optional.

قواعد التحقق:

- الحساب المدين مطلوب.
- الحساب الدائن مطلوب.
- القيمة يجب أن تكون صحيحة.
- القيد يجب أن يكون متوازنًا.
- الفترة المغلقة لا تقبل قيدًا عاديًا.

## 18. دورة حياة القيد

الحالات المدعومة في الـDomain:

```text
Draft
Reviewed
Posted
Reversed
Cancelled
```

قواعد أساسية:

- Draft قابل للتعديل.
- Posted لا يتم حذفه مباشرة.
- Posted لا يتم تعديله عشوائيًا.
- عكس القيد ينشئ قيدًا جديدًا.
- القيد العكسي يبدل Debit/Credit.
- القيد العكسي يحتفظ بمرجع القيد الأصلي.
- كل قيد يحتفظ بـAudit Trail.

## 19. Audit Trail

القيد يحتفظ بـ:

- Action.
- User.
- Timestamp.
- Optional Note.

الأحداث الحالية:

- Create.
- Review.
- Post.
- Reverse.
- Cancel.

## 20. Company Accounting

### 20.1 Financial Control

تعرض:

- Current Period.
- Total Debits.
- Total Credits.
- Trial Balance Status.
- Month-End Completion.
- Unbalanced Draft Journals.
- Unposted Source Documents.
- Project Cost Reconciliation Differences.
- Projects without Cost Centers.
- Companies without Mapping.
- Automatic vs Manual Journals.

### 20.2 Company General Ledger

Columns:

- Date.
- Journal.
- Account Code — Name.
- Description.
- Debit.
- Credit.
- Running Balance.
- Project Code — Name.
- Reference.

### 20.3 Company Trial Balance

- Account Code.
- Account Name.
- Total Debit.
- Total Credit.
- Balance.
- Project filter optional.

### 20.4 Company Income Statement

- Project Contract Revenue.
- Direct Project Costs.
- Gross Profit.
- Administrative/General Expenses.
- Operating Profit.

تعتمد النتائج على Posted Journal Lines فقط.

### 20.5 Chart of Accounts

- Code — Name.
- English Name.
- Type.
- Control Account indicator.
- Active status.

### 20.6 Accounting Mapping Editor

يسمح بتحديد حساب كل وظيفة محاسبية لكل شركة.

### 20.7 Month-End Closing

Checklist تجريبية تشمل:

- ترحيل فواتير المشتريات.
- مراجعة مستخلصات العملاء.
- ترحيل مستخلصات مقاولي الباطن.
- اعتماد تسويات المخزون.
- مراجعة البنوك والنقدية.
- إثبات الاستحقاقات.
- مراجعة Trial Balance.
- مراجعة Financial Statements.

## 21. Project Accounting

يتم الوصول إليها من:

```text
التكاليف والربحية → Project Accounting Dimension
```

### 21.1 Project Accounting Snapshot

- Contract Revenue.
- Certified Revenue.
- Accounting Cost.
- Committed Cost.
- Gross Profit.
- Forecast Profit.
- Customer Receivable.
- Retention.
- Cost Center.
- WBS.

### 21.2 Project Ledger

- Date.
- Journal Number.
- Account Code — Name.
- Description.
- Debit.
- Credit.
- Running Net Effect.
- Cost Code.
- BOQ.
- Source.
- Reference.

Journal Number يفتح Journal Drill-down.

### 21.3 Project Trial Balance

- Account Code.
- Account Name.
- Opening Debit.
- Opening Credit.
- Period Debit.
- Period Credit.
- Closing Debit.
- Closing Credit.

### 21.4 Project Cost Ledger

دفتر إداري تشغيلي منفصل عن Accounting Ledger:

- Date.
- Project.
- BOQ.
- Cost Code.
- Cost Type.
- Source.
- Source Document.
- Amount.

### 21.5 Project Income Statement

```text
Project Revenue
- Materials Cost
- Labor Cost
- Equipment Cost
- Subcontractor Cost
- Direct Site Expenses
= Gross Project Profit
- Allocated Overhead
= Project Operating Profit
```

### 21.6 Project Financial Position

- Customer Receivable.
- Customer Retention.
- Supplier Payables.
- Subcontractor Payables.
- Project Cash/Bank Balance.
- WIP.
- Open Commitments.
- Certified Revenue.
- Unbilled Work.
- Accrued Costs.
- Advances.

### 21.7 Project Journals

- Automatic Journals.
- Manual Journals.
- Source Module.
- Source Number.
- Status.
- Total Debit.
- Drill-down.

### 21.8 Journal Drill-down

يعرض:

- Journal Header.
- Company.
- Project Code — Name.
- Cost Center.
- Source Module.
- Source Type.
- Source Number.
- Account Code — Name.
- Cost Code.
- BOQ.
- Debit/Credit.
- Audit Trail.
- Reverse Action للقيود المرحلة.

## 22. Project Cost Reconciliation

المقارنة:

```text
Accounting Project Cost
versus
Operational Project Cost Ledger
```

النتيجة الصحيحة:

```text
Difference = 0
```

إذا ظهر فرق يتم عرضه كWarning ويجب فحص:

- Source Document غير مرحل.
- Missing Mapping.
- Missing Project.
- Missing Cost Code.
- Journal Reversal.
- Manual Journal بدون Operational Source.

في Demo Project `PRJ-026` الفرق الحالي للعمليات المرحلة يساوي صفرًا.

## 23. حساب المستخلص

```text
Retention = Gross Amount × Retention Rate
Tax = Gross Amount × Tax Rate
Net = Gross Amount + Tax - Retention
Outstanding = max(0, Net - Paid Amount)
```

النسب لا يجب اعتبارها Policy نهائية، وهي Configurable من البيانات والإعدادات.

## 24. حساب تكلفة المشروع

التكلفة الإدارية الحالية تجمع:

- Historical/Recorded Baseline.
- Posted Material Issues.
- Approved/Posted Expenses.
- Approved/Posted Subcontractor Certificates.

التكلفة المحاسبية في Project Accounting تعتمد على Posted Journal Lines المرتبطة بالمشروع وحسابات التكلفة في Mapping.

## 25. Budget Variance

```text
Variance = Budget - Actual Cost
Consumed % = Actual Cost / Budget × 100
```

## 26. Project Profit

```text
Earned Revenue = max(Certified Revenue, Contract Value × Progress %)
Profit = Earned Revenue - Actual Cost
Margin % = Profit / Earned Revenue × 100
```

في شاشة Project Accounting يتم أيضًا تحليل الإيراد والتكلفة من القيود المرحلة.

## 27. Project Health Score

Rule-Based Score من `0` إلى `100` يعتمد حاليًا على:

- Budget Consumed vs Physical Progress.
- Schedule Elapsed vs Physical Progress.

الحالات:

- Healthy.
- Attention.
- Critical.

القواعد قابلة للتوسعة لاحقًا لإضافة:

- Cash Flow.
- Collections.
- Procurement Delays.
- Cost Overrun.
- Customer Overdue.

## 28. قواعد سلامة البيانات

- منع صرف مخزون أكبر من الرصيد عند تفعيل المنع.
- منع Journal غير متوازن.
- منع Journal Line بدون حساب صحيح.
- منع العملية إذا لم يوجد Project مطلوب.
- منع Auto Journal إذا لم يوجد Accounting Mapping.
- منع تعديل Posted Journal مباشرة.
- استخدام Reversal بدل حذف القيد.
- منع قيد عادي داخل Closed Period.
- Document Numbers تولد بنمط يمنع التكرار داخل البيانات الحالية.
- Posted Operational Source يظهر كاستثناء إذا لم يوجد له Journal.

## 29. ترقيم المستندات

أمثلة:

```text
PO-2026-0001
GRN-2026-0001
MAT-ISS-2026-0001
EXP-2026-0001
CERT-CUS-2026-0001
CERT-SUB-2026-0001
JV-2026-0001
INV-2026-0001
PUR-2026-0001
REV-2026-0001
```

الترقيم النهائي يجب أن يصبح Configurable لكل شركة بعد تحليل Document Numbering Policy.

## 30. البحث والجداول

`DataTable` الحالية تدعم:

- Global Search.
- Sorting.
- Pagination.
- Responsive horizontal scrolling.
- Row actions.
- Record count.

الوحدات الكبيرة يمكن توسيعها لاحقًا بـ:

- Column Visibility.
- Grouping.
- Advanced Filters.
- Saved Views.
- Row Selection.

## 31. Excel والطباعة

### ExcelJS

التصدير الحالي يدعم تقارير حسب الوحدة، ومن أمثلتها:

- Projects.
- BOQ.
- Trial Balance.

### Browser Printing

- Print CSS مخصص.
- إخفاء Sidebar/Header/Actions.
- طباعة Cards وTables.
- يمكن للمستخدم اختيار Save as PDF من المتصفح.

لا يوجد Paid PDF API.

## 32. اللغات واتجاه العرض

### العربية

- `dir="rtl"`.
- Sidebar RTL.
- Forms وTables RTL.
- أرقام مالية واضحة.
- مواضع Icons تراعي الاتجاه.

### الإنجليزية

- `dir="ltr"`.
- عناوين Navigation الأساسية مترجمة.
- يمكن التبديل من زر Language.

ملاحظة: ما زالت بعض النصوص التشغيلية والتقارير التفصيلية عربية، وتحتاج نقلًا كاملًا إلى Translation Dictionaries في Milestone Localization لاحقة.

## 33. التصميم البصري

الهوية:

```text
Light
Clean
Bright
Premium
Construction-Oriented
Engineering
Financial Control
```

### الألوان

- White / Off White.
- Light Concrete Gray.
- Construction Blue.
- Engineering Blue.
- Safety Amber بشكل محدود.
- Green للنجاح.
- Red للأخطاء الحرجة فقط.

### الممنوع بصريًا

- Black Main Background.
- Dark Navy Pages.
- Purple SaaS Gradients.
- Neon/Cyberpunk.
- Gaming UI.
- Heavy Glassmorphism.
- صور عمال ورافعات بشكل مبالغ.

### اللغة الهندسية

- Blueprint Grid خفيف.
- Structural Geometry.
- Construction Icons.
- Project Progress Visuals.
- Financial Control Cards.

## 34. Responsive Design

يدعم:

- Large Desktop.
- Desktop.
- Laptop.
- Tablet.
- Mobile.

### Desktop

- Fixed light Sidebar.
- Header selectors.
- Multi-column metrics.
- Full tables.

### Mobile

- Drawer navigation.
- Compact header.
- Responsive metrics.
- Horizontal tab scrolling.
- Horizontal tables.
- Touch-friendly actions.
- Dialogs داخل ارتفاع الشاشة.

## 35. حالات الواجهة

التطبيق يدعم حسب الوحدة:

- Loading State.
- Validation Errors.
- Success Toasts.
- Error Toasts.
- Empty Tables.
- Disabled Actions.
- Confirmation قبل الحذف أو Reset.
- Status Badges.
- Responsive Dialogs.

## 36. الاختبارات الحالية

يوجد حاليًا 10 اختبارات Business Logic تغطي:

- Certificate retention/tax/net/outstanding.
- Balanced Journal validation.
- Unbalanced Journal rejection.
- Company Trial Balance balance.
- Inventory receipts/issues balance.
- Project Cost integration.
- Budget Variance.
- Project Health bounds.
- Automatic Material Issue Journal.
- Project/Cost Center/BOQ dimensions.
- Project Ledger.
- Project Trial Balance.
- Project Income Statement.
- Cost Ledger Reconciliation.
- Journal Reversal.

## 37. أوامر التشغيل

### تثبيت الاعتماديات

```bash
npm install
```

### تشغيل Development

```bash
npm run dev
```

الرابط المحلي الافتراضي:

```text
http://localhost:3000
```

### Type Check

```bash
npm run typecheck
```

### Lint

```bash
npm run lint
```

### Unit Tests

```bash
npm test
```

### Production Build

```bash
npm run build
```

### تشغيل Production محليًا

```bash
npm run start
```

## 38. Git Workflow

قبل أي Milestone:

```bash
git status
git remote -v
git branch
```

بوابة الجودة:

```text
TypeCheck
  ↓
Lint
  ↓
Tests
  ↓
Build
  ↓
git status
  ↓
Commit
  ↓
Push
```

قواعد Git:

- لا Push للكود المكسور.
- لا Force Push.
- لا Destructive Reset.
- لا حذف تاريخ أو Branches دون طلب صريح.
- Commit واضح لكل Milestone.

أمثلة Commit Messages:

```text
feat: initialize interactive construction ERP foundation
feat: implement integrated project accounting cycle
feat: implement procurement workflow
feat: add inventory movement engine
feat: implement progress certificates
fix: resolve financial calculation errors
```

## 39. النشر

المشروع مربوط بـ:

```text
GitHub Repository
  ↓
Vercel Project
  ↓
Automatic Production Deployment
```

رابط الإنتاج العام (اسم النطاق القديم محفوظ لتجنب كسر الروابط، بينما هوية المنتج داخله SiteCost ERP):

<https://binaa-construction-erp.vercel.app/>

لا يستخدم المشروع:

- Vercel Pro.
- Paid Database.
- Paid Storage.
- Paid Analytics.
- Paid Add-ons.

## 40. Status Matrix

### مكتمل حاليًا

- ✅ Application Foundation.
- ✅ Light Construction Design System.
- ✅ Responsive Sidebar/Header.
- ✅ Local Repository Architecture.
- ✅ Local Persistence.
- ✅ Backup/Restore.
- ✅ Demo Data Migration.
- ✅ Companies CRUD.
- ✅ Projects CRUD.
- ✅ Customers/Suppliers/Subcontractors CRUD.
- ✅ Basic BOQ.
- ✅ Purchase Orders.
- ✅ Inventory Movements.
- ✅ Negative Stock Rule.
- ✅ Project Expenses.
- ✅ Customer/Subcontractor Certificates.
- ✅ Chart of Accounts Prototype.
- ✅ Company Accounting Mapping.
- ✅ Manual Balanced Journal.
- ✅ Automatic Operational Journals.
- ✅ General Ledger.
- ✅ Trial Balance.
- ✅ Company Income Statement Prototype.
- ✅ Project Ledger.
- ✅ Project Trial Balance.
- ✅ Project Cost Ledger.
- ✅ Project Income Statement.
- ✅ Project Financial Position.
- ✅ Project Journal Drill-down.
- ✅ Journal Audit Trail.
- ✅ Journal Reversal.
- ✅ Project Cost Reconciliation.
- ✅ Month-End Checklist Prototype.
- ✅ Executive Dashboard.
- ✅ Excel Export Prototype.
- ✅ Browser Print/PDF.
- ✅ Arabic RTL / English LTR Shell.
- ✅ Vercel Production Deployment.

### جزئي ويحتاج توسعة

- 🟡 Rate Analysis التفصيلي.
- 🟡 Budget by Cost Code/BOQ.
- 🟡 Procurement يبدأ من PO حاليًا ولا يغطي الدورة كاملة.
- 🟡 Documents Metadata دون File Storage.
- 🟡 Company Income Statement يحتاج كل أنواع الحسابات والقيود.
- 🟡 Fiscal Period Rules Prototype.
- 🟡 Localization لبعض النصوص التفصيلية.
- 🟡 Global Search الحالي UI ولم يتم فهرسة جميع الوحدات بعد.
- 🟡 User/Roles/Permissions لم تتحول بعد لمحرك كامل.

### غير منفذ بعد

- ⬜ Tendering Workflow.
- ⬜ Contracts and Variation Orders.
- ⬜ Purchase Requests.
- ⬜ RFQs.
- ⬜ Supplier Quotations.
- ⬜ Quotation Comparison.
- ⬜ Supplier Invoices.
- ⬜ Treasury and Bank Transactions.
- ⬜ Collections and Payments Workflow.
- ⬜ Cheques and Guarantees.
- ⬜ Employee Advances.
- ⬜ Customer/Supplier/Subcontractor Subsidiary Ledgers الكاملة.
- ⬜ Balance Sheet الكاملة.
- ⬜ Cash Flow Statement الكاملة.
- ⬜ Adjusted Trial Balance.
- ⬜ Adjusting Entry Types UI.
- ⬜ Post-Closing Trial Balance.
- ⬜ Year-End Closing.
- ⬜ Bank Reconciliation.
- ⬜ Cash Count.
- ⬜ Customer/Supplier Reconciliation.
- ⬜ Indirect Cost Allocation Engine.
- ⬜ Allocation Report.
- ⬜ Project Profit Before/After Allocation.
- ⬜ Payroll/Labor.
- ⬜ Equipment/Maintenance.
- ⬜ Site Daily Reports.
- ⬜ Progress Tracking تفاصيل التنفيذ.
- ⬜ Gantt.
- ⬜ WIP Accounting Method Configuration.
- ⬜ Cash Flow Forecast.
- ⬜ EAC/ETC/VAC Forecasting الكامل.
- ⬜ Fraud and Error Radar الكامل.
- ⬜ Advanced Approval Engine.
- ⬜ Notifications Center الكامل.
- ⬜ Owner Mobile Dashboard مستقل.
- ⬜ Production Authentication.
- ⬜ Production Backend/Database/File Storage.

## 41. خارطة الطريق

### Milestone A — Procurement Cycle

```text
Purchase Request
  ↓
RFQ
  ↓
Supplier Quotations
  ↓
Comparison
  ↓
Approval
  ↓
Purchase Order
  ↓
Receipt
  ↓
Supplier Invoice
  ↓
Accounting
```

### Milestone B — Treasury

- Cash Accounts.
- Bank Accounts.
- Customer Collections.
- Supplier Payments.
- Subcontractor Payments.
- Cash/Bank Vouchers.
- Cheques.
- Advances.
- Automatic Journals.

### Milestone C — Full Financial Statements

- Adjusting Entries.
- Adjusted Trial Balance.
- Balance Sheet.
- Cash Flow Statement.
- Closing Entries.
- Post-Closing Trial Balance.
- Period Locking and Reopening permissions.

### Milestone D — Project Controls

- Rate Analysis.
- Budget by BOQ/Cost Code.
- Progress Measurement.
- Variation Orders.
- WIP Accounting.
- ETC/EAC/VAC.
- Cash Flow Forecast.
- Project Contribution Comparison.

### Milestone E — Controls and Governance

- Approval Workflow.
- Roles and Permissions.
- Complete Audit Trail.
- Accounting Exceptions.
- Fraud/Error Rules.
- Notifications.
- Closing Dashboard.

### Milestone F — Backend Discovery

لا يبدأ قبل الاجتماع مع شركة المقاولات وتوثيق:

- دورة المستندات.
- Approval Matrix.
- User Roles.
- Tax Rules.
- Accounting Policies.
- Project Costing Policy.
- WIP/Revenue Recognition Policy.
- Retention Policy.
- Numbering Policy.
- Fiscal Period Policy.
- Required Reports.
- Required Attachments.

## 42. أسئلة اجتماع شركة المقاولات

### المشروعات والعقود

- ما أنواع العقود المستخدمة؟
- هل العقد Lump Sum أم Unit Price أم Cost Plus؟
- كيف يتم التعامل مع Variation Orders؟
- هل المشروع Cost Center واحد أم Hierarchy؟
- ما هي بنية WBS الفعلية؟

### المقايسات والتكلفة

- كيف يتم ترميز BOQ؟
- هل Cost Codes موحدة على الشركة؟
- كيف يتم عمل Rate Analysis؟
- كيف توزع المصروفات غير المباشرة؟
- هل توجد Opening Costs عند نقل مشروع قائم؟

### المشتريات

- من يطلب ومن يعتمد؟
- هل RFQ إلزامي؟
- كم عرض سعر مطلوب؟
- كيف يتم تقييم المورد؟
- متى يتم إثبات المورد: عند الاستلام أم الفاتورة؟

### المخازن

- هل يسمح Negative Stock؟
- ما طريقة تقييم المخزون؟
- هل المخزن تابع للمشروع أم الشركة؟
- هل التحويل بين المشاريع مسموح؟
- كيف يتم التعامل مع الهالك والمرتجعات؟

### المستخلصات

- كيف يتم حساب Retention؟
- ما الضرائب والخصومات؟
- هل يوجد Advance Recovery؟
- هل الإيراد يعترف به بالمستخلص أم Percentage of Completion؟

### المحاسبة

- ما دليل الحسابات الحالي؟
- هل يوجد Project Dimension في النظام الحالي؟
- كيف يتم إثبات WIP؟
- ما قواعد الإقفال الشهري؟
- كيف تعالج Accruals؟
- كيف يتم توزيع Head Office Overhead؟
- هل توجد قيود تلقائية حالية؟

### الخزينة

- ما الصناديق والبنوك؟
- كيف تتم التحصيلات والمدفوعات؟
- هل تستخدم شيكات آجلة؟
- كيف تتم Bank Reconciliation؟
- كيف تتم تسوية Employee Advances؟

### الصلاحيات

- من ينشئ؟
- من يراجع؟
- من يعتمد؟
- من يرحل؟
- من يعكس القيد؟
- من يعيد فتح فترة مغلقة؟

## 43. Definition of Done لأي Module

لا تعتبر الوحدة مكتملة بمجرد وجود صفحة. يجب حسب طبيعتها أن تحتوي على:

- List View.
- Details View.
- Create.
- Edit.
- Delete/Archive/Cancel حسب Workflow.
- Validation.
- Persistence.
- Business Logic.
- Related Data Integration.
- Accounting Impact عند الحاجة.
- Responsive UX.
- RTL/LTR.
- Error Handling.
- Empty State.
- Loading/Disabled State.
- Search/Filter.
- Print/Export عند الحاجة.
- Tests.
- Build Verification.

## 44. شروط الانتقال إلى Backend

لا يتم تصميم Database نهائية إلا بعد:

1. توثيق الدورة الفعلية للشركة.
2. اعتماد Business Glossary.
3. اعتماد Chart of Accounts.
4. اعتماد Project/Cost Center/WBS hierarchy.
5. اعتماد المستندات وترقيمها.
6. اعتماد Journal Mappings.
7. اعتماد Approval Matrix.
8. اعتماد Taxes/Retention policies.
9. اعتماد Closing and Period rules.
10. اعتماد Reporting requirements.

بعدها يتم تصميم:

- API Contracts.
- Database Schema.
- Authentication.
- Authorization.
- File Storage.
- Audit Infrastructure.
- Backup and Disaster Recovery.
- Production Hosting Architecture.

## 45. Prototype Notice

```text
Current prototype stores business data locally in the browser.

This is intentionally temporary until the real construction company's
workflows and backend requirements are fully analyzed.
```

## 46. قواعد الحفاظ على المشروع

- لا تضف Database حقيقية قبل اعتماد التحليل.
- لا تضع الحسابات داخل JSX.
- لا تستخدم LocalStorage مباشرة داخل Components.
- لا Hardcode Account Mapping داخل عمليات التشغيل.
- لا تحذف Posted Transactions.
- لا تستخدم Paid Services دون موافقة صريحة.
- لا تغير الـStack دون ضرورة واضحة.
- لا تضف مكتبات إذا كان الـStack الحالي يكفي.
- حافظ على Strict TypeScript.
- أضف اختبارات لأي Business Rule جديد.
- حدث هذه الوثيقة وREADME مع كل Milestone.
- نفذ TypeCheck وLint وTests وBuild قبل Push.

## 47. دمج الدورة المستندية والمحاسبية داخل الـCore

تم اعتماد المبدأ التالي كمعمارية أساسية للنظام:

```text
DOCUMENT → OPERATION → ACCOUNTING → PROJECT → COMPANY → REPORTING
```

### المكونات المنفذة في الـCore

- Accounting Documents Register موحد مع رقم المصدر ونوع المستند والشركة والمشروع والطرف والضريبة والصافي والحالات والقيد المرتبط.
- فصل Workflow Status عن Accounting Status وعن Settlement Status.
- تسجيل بيانات الفاتورة أو المستند فعليًا بعد اختيار المرفق، مع حفظ File Name وFile Type وFile Size وUpload Date وRelated Document.
- FileStorageProvider قابل للتوسعة مستقبلًا إلى رفع وحذف الملفات الحقيقية.
- Accounting Mapping مستقل لكل شركة، ويستخدم لتوليد القيود بدل الحسابات المكتوبة Hardcoded.
- إدخالات المصروفات والمستخلصات وحركات المخزون التشغيلية تسجل Source Document داخل المركز وتولد Draft Journal للمراجعة؛ واستلام المواد يحترم سياسة Supplier Liability Recognition.
- توليد Draft Journal من المستند المعتمد، ثم دورة Draft → Reviewed → Posted.
- منع الترحيل داخل فترة محاسبية Closed.
- قيد يدوي متعدد السطور بلا حد، مع Company وProject وCost Center وCost Code وWBS وDescription على مستوى السطر.
- قفل القيود المرحلة ومنع تعديلها أو حذفها المباشر، مع استمرار مسار القيد العكسي.
- Collections وSupplier Payments وSubcontractor Payments مع تخصيص يدوي أو Auto Allocate Oldest.
- دعم Partial Settlement وتحديث Outstanding وSettlement Status تلقائيًا.
- Open Items Register وأعمار الذمم: Current و1-30 و31-60 و61-90 و91-120 و120+.
- Accountant Workspace للشركة وProject Accountant Workspace لكل مشروع.
- Accounting Exception Center للمستندات بلا قيود، القيود غير المتوازنة، القيود المعلقة، Cost Code المفقود والدفعات غير المخصصة.
- Company وProject financial statements من Posted Journal Lines فقط، وتشمل Income Statement وBalance Sheet وCash Flow summary.
- سياسات قابلة للضبط تشمل Supplier Liability Recognition وRevenue Recognition وOverhead Allocation.
- ترقيم مستقل حسب الشركة ونوع المستند والسنة.
- ترقية تلقائية للبيانات المحفوظة محليًا لإضافة الكيانات الجديدة دون فقد السجلات السابقة.

### أنواع المستندات المدعومة في نموذج التسجيل

```text
Supplier Invoice
Expense Invoice
Customer Certificate
Subcontractor Certificate
Cash Receipt
Cash Payment
Bank Receipt
Bank Payment
Credit Note
Debit Note
Inventory Adjustment
Opening Balance
```

### حالة التنفيذ المتقدم

| الجزء | الحالة |
| --- | --- |
| Document Register ودورة المراجعة | ✅ منفذ |
| Draft Journal من Accounting Mapping | ✅ منفذ |
| Unlimited Multi-Line Journal | ✅ منفذ |
| Journal Review وPosting وPeriod Lock | ✅ منفذ |
| Open Items وPartial Allocation وAging | ✅ منفذ |
| Company / Project Accountant Workspace | ✅ منفذ |
| Exceptions وTraceability إلى القيد والمصدر | ✅ منفذ كأساس تفاعلي |
| قوائم مالية من Posted Lines | ✅ منفذ كأساس تفاعلي |
| Opening Balance document وOpening journal type | ✅ منفذ كأساس إدخال وتصنيف |
| Bank/Cash/Party reconciliation التفصيلي | 🟡 يحتاج شاشات مطابقة متقدمة |
| Adjusted Trial Balance وAdjusting Register مستقل | 🟡 خدمة القيود موجودة والتقرير المستقل قادم |
| Closing Entries وPost-Closing Trial Balance | 🟡 دورة الفترات وقائمة الإقفال موجودتان والتوليد التفصيلي قادم |
| Year-End carry forward | ⬜ خارطة طريق |
| Tax rules متعددة الأكواد لكل شركة | 🟡 الحقول موجودة ومحرك القواعد المتقدم قادم |
| File Storage حقيقي | ⬜ خارج نطاق النموذج المحلي الحالي |

### اختبارات الدورة الجديدة

تغطي الاختبارات الآلية:

- الترقيم المستقل للمستندات.
- توليد قيد متوازن من Mapping الشركة.
- دورة Draft → Reviewed → Posted وربط حالة المستند بالقيد.
- السداد الجزئي وتحديث الرصيد المفتوح.
- استبعاد القيود غير المرحلة من القوائم المالية.

---

آخر تحديث لهذه الوثيقة: **22 أغسطس 2026**.

## 48. Milestone — SiteCost ERP Audit Completion (22 أغسطس 2026)

### الهوية والتهيئة

- توحيد الاسم إلى **SiteCost ERP** والاسم المختصر **SiteCost** والوصف: **Construction Financial & Project Control System** من ملف Branding مركزي.
- إضافة Setup Wizard من أربع خطوات: الترحيب، بيانات الشركة، الإعدادات المالية، بدء النظام.
- إضافة Company / Project / Fiscal Period Context في الشريط العلوي، مع تصفية المشروعات والأطراف ومدخلات العمليات ودليل الحسابات حسب الشركة.
- نقل مفتاح التخزين المحلي إلى `sitecost-erp-data-v2` مع قراءة المفتاح القديم وترقيته وحفظه تحت المفتاح الجديد دون حذف بيانات المستخدم القديمة.

### العقود والهياكل والمخازن

- سجل عقود المشروع: القيمة الأصلية، الدفعة المقدمة، الاحتجاز، التواريخ، Tax Mode، Payment Terms، والقيمة المعدلة.
- سجل Variation Orders مرتبط بالعقد؛ لا تدخل قيمة التغيير في Revised Contract Value إلا بعد الاعتماد.
- WBS وCost Codes بهيكل Parent/Child، إضافة مستويات، إعادة ترتيب، أرشفة، وعرض شجري.
- Warehouse Master يشمل النوع، المشروع، العنوان، المسؤول، حالة النشاط، والرصيد الفعلي والمحجوز والمتاح، مع تبويبات تشغيلية واضحة للتوسعة التالية.

### محرك المستخلصات التراكمية

- مستخلصات العميل ومقاول الباطن في شاشة واحدة مع فصل التاريخ حسب النوع والمشروع.
- السابق يُجلب تلقائيًا من آخر مستخلص، والحالي = التراكمي الحالي − السابق.
- منع التراكمي الأقل من السابق، ومنع تجاوز 100%، وقفل أي مستخلص لاحق بعد المستخلص النهائي.
- دعم حساب Overall % ودعم BOQ Quantities، مع منع كمية البند التراكمية من تجاوز كمية العقد.
- خصومات تفصيلية: استرداد دفعة مقدمة، احتجاز، خصم منبع، مواد، معدات، غرامات، وخصومات أخرى.
- إنشاء Accounting Document للمستخلص بحالة Submitted ليكمل دورة المراجعة والاعتماد والقيد داخل Accounting Core.

### مصفوفة حالة هذا التدقيق

| المجال | الحالة الحالية |
| --- | --- |
| Branding + Setup + Safe Migration | ✅ منفذ |
| Company/Project/Period Context | ✅ منفذ كأساس تفاعلي |
| Contracts + Variation Orders | ✅ منفذ كأساس تفاعلي |
| WBS + Cost Codes hierarchy | ✅ منفذ كأساس تفاعلي |
| Warehouse Master + stock views | 🟡 الدليل والأرصدة منفذة؛ مستندات التحويل/الحجز التفصيلية لاحقة |
| Cumulative Certificates methods A/B | ✅ منفذ مع Validation واختبارات |
| Certificate methods C/D/E | 🟡 ظاهرة في الاختيار وتحتاج محركات التسعير المتخصصة |
| Accounting Core + Open Items + Statements | ✅ منفذ كأساس تفاعلي |
| Backend/Auth/RBAC/Production DB/File Upload | ⬜ خارج النموذج المحلي الحالي ويتطلب مرحلة Backend معتمدة |

### تحقق الجودة

- TypeScript strict: ناجح.
- ESLint بلا تحذيرات: ناجح.
- Vitest: **22 اختبارًا ناجحًا**، تشمل الدورة المحاسبية وقواعد المستخلصات التراكمية.
- Next.js production build: ناجح.
