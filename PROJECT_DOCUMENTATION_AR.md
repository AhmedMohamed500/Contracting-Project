# توثيق مشروع SiteCost ERP

> الوثيقة الرئيسية الموحّدة — محدثة وفق الحالة الفعلية للكود والاختبارات، وليست قائمة رغبات أو Status Matrix شكلية.

## 1. بطاقة المشروع

| البند | القيمة |
| --- | --- |
| المنتج | SiteCost ERP / سايت كوست ERP |
| الوصف الإنجليزي | Construction Financial & Project Control System |
| الوصف العربي | نظام إدارة وتكاليف ومراقبة مشاريع المقاولات |
| النوع | Construction ERP Interactive Prototype |
| المستودع | <https://github.com/AhmedMohamed500/Contracting-Project> |
| Production | <https://binaa-construction-erp.vercel.app/> |
| الفرع | `main` |
| التقنية | Next.js 16.3.2، React، TypeScript، Tailwind، Zustand، Vitest، Playwright |
| التخزين | Browser LocalStorage من خلال Repository Layer |
| Backend / Database | غير مستخدمين عمدًا |
| آخر Milestone | Premium First-Run Setup UI — 23 أغسطس 2026 |
| آخر Commit وظيفي | `98fcf79` |
| حالة النشر | ✅ منشور ومختبر على Production بمتصفح جديد |

## 2. رؤية المنتج

SiteCost ERP نموذج لربط دورة المقاولات من المشروع والعقد والمقايسة والتكلفة والمشتريات والمخازن والموقع والمستخلصات والتحصيلات والمدفوعات حتى القيود والأستاذ والقوائم المالية والرقابة.

المبدأ الحاكم:

```text
THE USER SUPPLIES THE BUSINESS DATA.
SITECOST ERP SUPPLIES THE CONTROL.
```

المستخدم يدخل شركاته وأطرافه ومشروعاته وعقوده وحساباته ومخازنه ومواده ومعاملاته. النظام يحفظ ويراجع ويحسب ويربط ويولد الأثر المحاسبي والتقارير. لا يجوز للنظام اختراع Business Data في التثبيت الجديد.

## 3. المعمارية الحالية

```text
Presentation — Next.js / React
  ↓
Application Actions — CRUD and workflow commands
  ↓
Business Services — costing, certificates, accounting, statements
  ↓
Repository Interfaces
  ↓
LocalStorage / SessionStorage repositories
```

القواعد:

- لا وصول مباشر إلى LocalStorage من Components.
- الحسابات خارج JSX.
- لا Database أو Backend API أو خدمة مدفوعة في مرحلة الـPrototype.
- FileStorageProvider يمثل نقطة الاستبدال المستقبلية؛ الملفات الكبيرة غير محفوظة محليًا.
- الاستبدال المستقبلي بـAPI Repository لا يستلزم إعادة كتابة المحركات الحسابية.

## 4. الهوية المركزية

ملف [src/config/branding.ts](./src/config/branding.ts) هو المصدر المركزي لـ:

- `productName`.
- `productNameArabic`.
- `shortName`.
- `tagline`.
- `taglineArabic`.
- `logo`.

تستخدم الهوية في Metadata وOpen Graph وWeb Manifest وSetup وLogin والـSidebar والتقارير والتوثيق. الألوان فاتحة ومهنية: أبيض، Concrete Gray، Ice Blue، Engineering Blue، Sand، وAmber كلون Accent.

## 5. تجربة أول تشغيل

Fresh installations تبدأ فارغة كليًا:

```text
Open SiteCost ERP
  → No company found
  → Five-step setup
  → Company details
  → Optional logo upload
  → Financial defaults
  → First administrator
  → Review
  → Finish
  → Login screen
  → Empty ERP
```

قبل اكتمال Setup لا يظهر Sidebar أو Dashboard أو Projects أو Accounting. وبعد Setup لا يدخل المستخدم مباشرة؛ يجب أن يختبر Username وPassword على شاشة الدخول.

### خطوات Setup المنفذة

1. بيانات الشركة: الكود، الاسمان العربي والإنجليزي، السجل، الرقم الضريبي، الهاتف، البريد، العنوان والدولة.
2. شعار اختياري: PNG/JPG/WEBP حتى 400 KB.
3. الإعداد المالي: العملة وبداية السنة المالية وVAT وRetention defaults.
4. المدير: الاسم الكامل وUsername وPassword وConfirmation.
5. مراجعة ثم إنهاء.

إذا وُجدت بيانات قديمة بلا Users، تظهر خطوة استكمال إعداد المدير ولا تُستبدل الشركة أو المعاملات القديمة.

## 6. المصادقة المحلية

- Password policy: ثمانية أحرف على الأقل، حرف واحد ورقم واحد.
- Web Crypto PBKDF2 + SHA-256.
- Salt عشوائي مستقل لكل User.
- 120,000 iteration.
- يحفظ Hash وSalt فقط، ولا تحفظ كلمة المرور داخل Company أو LocalStorage.
- Session محلية منفصلة في `sessionStorage`.
- Session Restore يتحقق أن User ما زال Active.
- Logout يمسح Session فقط ويعيد Login ولا يمس بيانات الشركة.
- رسالة الخطأ عامة: اسم المستخدم أو كلمة المرور غير صحيحة.

> المصادقة الحالية Prototype-only ومحلية. يجب استبدالها بمصادقة وصلاحيات Server-side قبل الإنتاج.

## 7. شاشة Login

Desktop:

```text
38% Solid Login Panel | 62% Bright Construction Visual
```

تحتوي البطاقة الواضحة على شعار الشركة واسمها وSiteCost ERP وUsername وPassword وإظهار/إخفاء وكلمة دخول ورسالة الخطأ فقط. المنطقة الأكبر Visual إنشائي فاتح به مبنى حقيقي تحت الإنشاء ورافعة وخطوط Blueprint. على Mobile يتحول المشهد إلى Banner علوي مختصر وتظهر البطاقة بعرض كامل دون Horizontal Scroll.

### Milestone — Premium First-Run Setup UI

- استُبدل الرسم البرمجي القديم بصورة WebP واقعية لمبنى تجاري تحت الإنشاء ورافعة برجية ومخططات هندسية، مولّدة خصيصًا للمشروع ومضغوطة إلى نحو 241KB.
- يستخدم Setup وLogin الأصل البصري نفسه لضمان وحدة المنتج.
- Desktop Setup: مساحة النموذج 43% ومساحة المشهد الإنشائي 57%.
- أُعيد بناء الـStepper إلى دوائر منفصلة، Connector بين الدوائر فقط، وأسماء الخطوات أسفلها بحد أقصى سطرين.
- Mobile يعرض `الخطوة X من 5` واسم الخطوة وProgress Bar بدل ضغط خمس خطوات أفقيًا.
- أصبحت بطاقة Setup ذات Max Width وInternal Scroll وFooter ثابت داخلها حتى يظل زر الإجراء ظاهرًا على Laptop 1366×768.
- حقل المدير Grid حقيقي 2×2 على Desktop وعمود واحد على Mobile، مع Help Text تحت كلمة المرور فقط.
- اختبارات القياس الآلية أكدت عدم تداخل Step labels، وظهور الزر، وعدم وجود Horizontal Overflow، وصحة RTL/LTR.
- أعيد الاختبار بعد النشر على Vercel بمتصفح جديد: الصورة `241,360 bytes` محمّلة، Desktop `43% / 57%`، Mobile visual `180px`، والنتائج كلها ناجحة.

## 8. ملكية البيانات وEmpty Dashboard

بعد أول Login:

| الكيان | العدد |
| --- | ---: |
| Customers | 0 |
| Suppliers | 0 |
| Subcontractors | 0 |
| Projects | 0 |
| Contracts | 0 |
| Warehouses | 0 |
| Certificates | 0 |
| Journals | 0 |

Revenue وCost وProfit وCash تبدأ من صفر. لا يوجد Alert باسم مشروع تجريبي. تظهر قائمة **ابدأ من هنا** لحساب دليل الحسابات والخزينة والأطراف والمشروع والعقد وWBS وCost Codes وBOQ والمخزن والأرصدة الافتتاحية.

## 9. التخزين والهجرة

| البند | القيمة |
| --- | --- |
| المفتاح الحالي | `sitecost-erp-data-v2` |
| المفتاح القديم | `binaa-erp-data-v1` |
| السياسة | Read → Validate → Normalize → Save current key |
| حذف المفتاح القديم | لا يتم تلقائيًا |

`createEmptyErpData()` لا يعتمد على Demo Data. فشل JSON أو Backup غير صالح لا يؤدي إلى تحميل Atlas. الـNormalization يحافظ على السجلات ويضيف الحقول البنيوية الناقصة فقط؛ ولا يحقن حسابات أو قيودًا أو مستندات Demo.

## 10. نموذج البيانات الأساسي

- Company وErpUser.
- Customer / Supplier / Subcontractor.
- Project وContract وVariationOrder.
- WbsNode وCostCode وBoqItem.
- Warehouse وInventoryMovement.
- PurchaseOrder وExpense وCertificate.
- ChartOfAccount وAccountingMapping.
- AccountingDocument وJournalEntry وSettlementDocument.
- FiscalPeriod وDocumentMetadata.

كل User يحمل Company Access وProject Access، لكن شاشة الإدارة الكاملة للمستخدمين والصلاحيات ما زالت Roadmap.

## 11. الشركات والأطراف والمشروعات

### الشركات

Create/Edit/Archive/Persistence منفذة. إضافة شركة جديدة لا تنسخ Demo Chart أو Mapping تلقائيًا. العزل التشغيلي يتم حسب Company context.

### العملاء والموردون ومقاولو الباطن

Create/Edit/Archive/Search/Persistence كأساس تفاعلي. تبدأ القوائم فارغة ويضيف المستخدم سجلاته.

### المشروعات

Create/Edit/Archive والربط بالشركة والعميل والقيم والتقدم والتواريخ منفذة كأساس. يتم توليد Cost Center code وWBS root reference عند إنشاء المشروع. الـProject Creation Wizard ذي التسع خطوات وحقول Consultant/Managers/Accounting Setup لم يكتمل بعد.

## 12. العقود والتغييرات

- Contract number، المشروع، العميل، النوع، القيمة الأصلية، Advance، Retention، Payment Terms، التواريخ والغرامة.
- الأنواع: Lump Sum، Unit Price، Cost Plus، Time & Material، Other.
- Variation Orders بحالات request/pricing/submitted/approved/rejected.
- Revised Contract = Original + Approved Revenue Variations.
- Change Events السابقة للـVariation الرسمية ما زالت غير منفذة كوحدة مستقلة.

## 13. WBS وCost Codes وBOQ والميزانية

- WBS وCost Codes يدعمان Parent/Child، الترتيب والأرشفة والعرض الشجري كأساس.
- BOQ يدعم الكود والوصف والوحدة والكمية وسعر البيع وسعر الميزانية والربط بالمشروع.
- Rate Analysis التفصيلي حسب Material/Labor/Equipment/Subcontract/Transport/Indirect/Markup جزئي.
- Budget Versions وOriginal/Revision/Approved Budget غير مكتملة كوحدة مستقلة.

## 14. المشتريات والمخازن والعمليات

### المنفذ

- Purchase Order أساسي وربطه بالمشروع والمورد.
- PO receipt ينشئ Inventory Receipt وأثرًا محاسبيًا حسب السياسة.
- Receipt/Issue/Transfer/Return أساسية.
- منع الرصيد السالب عند الصرف.
- Warehouse master بأنواعه وربطه الاختياري بالمشروع.
- Project expenses وربطها بـCost Code ومستند محاسبي.

### الجزئي/المتبقي

- PR → RFQ → Quotations → Comparison → PO الكامل.
- Supplier invoice matching وThree-way match.
- Reservations وDetailed Transfers وWaste وStock Count.
- Labor، Equipment، Daily Site Report، Productivity، Physical Progress.
- Material reconciliation الكامل: purchased/received/issued/used/waste/returned/stock.

## 15. المستخلصات التراكمية

الأنواع: Customer وSubcontractor. الطرق المتقدمة فعليًا حاليًا Overall Progress وBOQ Quantities، بينما BOQ Progress/Milestone/Manual Lines تحتاج محركات متخصصة إضافية.

القواعد:

```text
Current Progress = New Cumulative − Previous Cumulative
Current Value = Current Progress × Revised Contract Value
```

اختبار القبول الإلزامي ناجح:

| المستخلص | السابق | التراكمي | الحالي |
| --- | ---: | ---: | ---: |
| #1 | 0% | 20% | 20% |
| #2 | 20% | 35% | 15% |
| #3 | 35% | 50% | 15% |

يوجد منع للانخفاض وتجاوز 100% وتجاوز BOQ quantity وقفل ما بعد Final Certificate. الـWizard ست خطوات ويعرض السابق والحالي والتراكمي والمتبقي والقيم والخصومات، ثم ينشئ Accounting Document للمراجعة بدل الترحيل المباشر.

## 16. الدورة المستندية والمحاسبية

المسار الأساسي:

```text
Source Document
  → Workflow review
  → Accounting classification
  → Draft multi-line journal
  → Review
  → Post
  → General Ledger
  → Trial Balance
  → Financial Statements
```

المنفذ كأساس تفاعلي:

- Accounting Document Register وحالات Workflow/Accounting/Settlement منفصلة.
- Accounting Mapping لكل شركة.
- قيد متعدد السطور.
- Draft/Reviewed/Posted، مع منع الترحيل في فترة مغلقة.
- قفل القيد المرحل وإنشاء Reversal مرتبط بدل الحذف.
- Collections وSupplier/Subcontractor Payments وPartial Allocation وAuto Allocate Oldest.
- Open Items وAging buckets.
- Accountant Workspace وException Center.
- General Ledger وTrial Balance وProject Ledger.

## 17. القوائم المالية

المصدر الوحيد:

```text
Posted Journal Lines + Chart of Accounts Classification
```

| التقرير | الحالة |
| --- | --- |
| قائمة الدخل | ✅ منفذة من القيود المرحلة |
| الميزانية العمومية | ✅ منفذة مع Balance validation |
| التدفقات النقدية | ✅ منفذة مع Cash reconciliation |
| التغير في حقوق الملكية | ✅ منفذة من الحسابات المصنفة |
| ميزان المراجعة التفصيلي | ✅ Opening/Movement/Closing |
| ميزان المراجعة المعدل | ✅ يفصل Adjustment journals |
| ميزان ما بعد الإقفال | ✅ يخفي الحسابات المؤقتة بعد Closing entries |
| Year-end carry forward | ⬜ غير منفذ |

لا تظهر الأرقام إن لم ينشئ المستخدم Accounts وPosted Journals. التوازن المحاسبي واختبارات الاستبعاد للقيود غير المرحلة منفذة.

## 18. حسابات المشروعات

لكل مشروع أساس تفاعلي مستقل:

- Project journal entries وledger.
- Project trial balance.
- Operational project cost ledger.
- Project income statement.
- Project financial position؛ لا يسمى Project Balance Sheet تضليلًا.
- Receivables/Payables/Cash dimensions حسب السطور المتاحة.
- Profitability وCost reconciliation.

```text
Company Financials
= Project Transactions
+ Company-Level Transactions
+ Adjustments / Allocations available in the ledger
```

Forecast/EAC/ETC/Committed وHead-office allocation المتقدمة ما زالت جزئية.

## 19. الواجهة والتنقل

- Arabic RTL وEnglish LTR shell.
- Accounting navigation مقسمة: العمليات اليومية، الأستاذ والذمم، القوائم، نهاية الفترة، الإعداد والرقابة.
- Responsive sidebar drawer.
- Company/Project/Fiscal Period context.
- جداول بها Search/Sort/Pagination كأساس عبر TanStack Table.
- Print وExcel أساسيات.
- Global Search الشامل عبر كل الكيانات غير مكتمل؛ حقل الواجهة موجود فقط ويجب عدم اعتباره Feature مكتملة.
- يوجد عدد من نصوص الوحدات التشغيلية التي تحتاج استكمال Translation Dictionary كامل.

## 20. البيانات التجريبية

ملف `src/data/demo-data.ts` باقٍ فقط للاختبارات وأداة Prototype الاختيارية. لا يُستورد لتكوين Fresh Data، ولا يعمل تلقائيًا. تشغيل الأداة يحتاج Confirmation واضحًا بأنها ستستبدل البيانات الحالية ببيانات تجريبية.

## 21. الاختبارات والتحقق

### Automated

- Vitest: **35/35** اختبارًا ناجحًا في 5 ملفات.
- محرك المستخلصات التراكمية.
- قواعد المخزون والتكلفة والربحية.
- توليد القيود والدورة المحاسبية.
- القوائم والتوازن والتدفق النقدي.
- Fresh data empty.
- عدم Demo injection أثناء migration.
- Password policy وsalted hash وlogin verification success/failure.
- Company access representation.

### Fresh Browser E2E المنفذ

```text
Fresh context
  → Setup only, no Sidebar, no Atlas
  → Enter company
  → Upload PNG logo
  → Create administrator
  → Finish
  → Login card + construction visual
  → Login
  → Projects/Customers/Suppliers/Journals = 0
  → Plain password absent from LocalStorage
  → Mobile width 390px without horizontal overflow
  → Logout returns to Login
```

نتيجة Production بعد Push: Login panel = 38% وConstruction visual = 62% على 1440px، رسالة الفشل عامة، Session Restore ناجح، والأعداد `[customers, suppliers, projects, journals] = [0,0,0,0]`. فحص Mobile على 390px بلا Horizontal Overflow.

### آخر Quality Gate

| الفحص | النتيجة |
| --- | --- |
| TypeScript strict | ✅ ناجح |
| ESLint `--max-warnings=0` | ✅ ناجح |
| Vitest | ✅ 35/35 |
| Next.js production build | ✅ ناجح |

## 22. مصفوفة الحالة الصادقة

| المجال | الحالة | ملاحظة |
| --- | --- | --- |
| Branding/Metadata/Manifest | ✅ | مركزي ومستخدم |
| Fresh empty installation | ✅ | لا Demo auto seed |
| Setup + logo + first admin | ✅ | خمس خطوات |
| Local hash/login/session/logout | ✅ Prototype | ليس Production Auth |
| Empty dashboard/checklist | ✅ | صفر دون Fake KPI |
| Safe legacy migration | ✅ | يحفظ البيانات ولا يحقن Demo |
| Companies/Parties CRUD | 🟡 | الأساس؛ الحقول والملفات المتقدمة لاحقة |
| Project setup | 🟡 | CRUD موجود؛ Wizard الكامل لاحق |
| Contracts/Variations | 🟡 | الأساس التفاعلي موجود؛ Change Events لاحقة |
| WBS/Cost Codes | 🟡 | hierarchy أساسي؛ drag/drop وعمليات موسعة لاحقة |
| BOQ/Rate Analysis/Budget versions | 🟡 | BOQ أساسي؛ التحليل والنسخ غير مكتملين |
| Procurement | 🟡 | PO/receipt؛ PR/RFQ/comparison/matching غير مكتملة |
| Warehouses/Inventory | 🟡 | master والحركات الأساسية؛ الرقابة المتقدمة لاحقة |
| Cumulative Certificates | ✅ للطرق A/B | الطرق C/D/E جزئية |
| Accounting document cycle | ✅ كأساس | workflows الإنتاجية تحتاج اعتماد الشركة |
| Open items/settlements/aging | ✅ كأساس | reconciliations المتقدمة جزئية |
| Financial statements | ✅ كأساس | Year-end carry forward غير منفذ |
| Project accounting | ✅ كأساس | Forecast/allocations المتقدمة جزئية |
| Treasury/Bank reconciliation | 🟡 | المسار موجود؛ الشيكات والمطابقة والجرد جزئية |
| Reporting workspace | 🟡 | قوائم مالية قوية؛ مركز تقارير كل الوحدات لاحق |
| Global search | ⬜ | الحقل موجود دون محرك شامل |
| Users & RBAC | 🟡 | First owner فقط؛ شاشة الإدارة والصلاحيات لاحقة |
| Feedback mode | ⬜ | غير منفذ |
| Labor/Equipment/Site execution | ⬜ | خارطة طريق |
| Backend/DB/real files | ⬜ خارج النطاق | بعد اعتماد التحليل |

## 23. الأعمال المتبقية حسب الأولوية

1. Project Creation Wizard الكامل وعزل صلاحيات المستخدم الفعلية.
2. Chart of Accounts وOpening Balances UX كاملان من إدخال المستخدم.
3. PR/RFQ/quotation comparison/PO/invoice matching.
4. Warehouse reservations/transfers/count/waste/reconciliation.
5. Detailed budgets وversions وCommitted/ETC/EAC/Forecast.
6. Labor/Equipment/Daily Site/Physical Progress.
7. Treasury checks وBank Reconciliation وCash Count.
8. User Management/Roles/Approvals/Audit permissions.
9. Global Search ومحرك Reporting Workspace موحد.
10. Feedback Mode ثم Backend architecture بعد اعتماد الشركة.

## 24. حدود النموذج

- Local browser data غير مشتركة بين الأجهزة.
- مسح Browser storage يمسح البيانات ما لم توجد Backup.
- لا توجد مصادقة إنتاجية أو حماية Server-side.
- لا يوجد File Storage حقيقي.
- لا توجد ضرائب أو تشريعات نهائية قبل اعتماد الشركة والدولة.
- لا تعتبر هذه النسخة نظام محاسبة إنتاجيًا دون مراجعة محاسب الشركة واعتماد دليل الحسابات والسياسات والمستندات والصلاحيات.

## 25. Git والنشر

- Remote الرسمي: `https://github.com/AhmedMohamed500/Contracting-Project.git`.
- ممنوع Force Push أو Destructive Reset.
- كل Stable milestone تمر عبر typecheck وlint وtests وbuild.
- Vercel مرتبط بالمستودع ولا يستخدم خدمات مدفوعة أو Database.
- يجب اختبار Production في Fresh/Incognito browser لتجنب LocalStorage قديمة.

---

آخر تحديث: **23 أغسطس 2026 — Premium First-Run Setup UI**.
