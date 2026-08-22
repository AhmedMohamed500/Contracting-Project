# SiteCost ERP

التوثيق العربي الشامل للمشروع: [PROJECT_DOCUMENTATION_AR.md](./PROJECT_DOCUMENTATION_AR.md)

Construction Financial & Project Control System — an interactive, local-first ERP prototype for construction companies, contractors, engineering offices, and project-control teams. The current milestone connects company and project master data with contracts, WBS, cost codes, warehouses, BOQ, procurement, inventory, expenses, cumulative certificates, accounting, costing, documents, and the executive dashboard.

The accounting cycle is part of the core architecture: source documents are registered first, classified through company mappings, converted to reviewable draft journals, posted to the shared ledger, and traced into open items, aging and financial statements.

## Architecture

```text
Presentation (Next.js / React)
  → Application actions
  → Business calculation services
  → Repository interfaces
  → LocalStorage repository (temporary prototype)
```

Business calculations live outside React components. `ErpRepository` can later be implemented by an API repository without rewriting the user interface or calculation engine. `FileStorageProvider` is represented as an interface; the prototype intentionally stores attachment metadata only.

## Technology

Next.js, React, strict TypeScript, Tailwind CSS, Radix primitives, Lucide React, React Hook Form, Zod, TanStack Table, Zustand, Apache ECharts, ExcelJS, date-fns, Vitest, and Playwright. All core dependencies are free/open-source.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Quality checks

```bash
npm run typecheck
npm run lint
npm test
npm run build
```

## First run and demo data

The first visit opens a four-step setup wizard for company identity and financial defaults. Use **Settings → Reset Demo Data** to load the Atlas Construction scenario with three projects, customers, suppliers, a subcontractor, BOQ items, purchase orders, inventory movements, expenses, cumulative progress certificates, journals, contracts, WBS, cost codes, and warehouse records.

## Local persistence and backup

Current prototype stores business data locally in the browser. This is intentionally temporary until the real construction company's workflows and backend requirements are fully analyzed.

- Data persists after refresh through the `LocalStorageErpRepository`.
- **Backup All Data** downloads versioned JSON.
- **Restore Backup** validates the JSON shape before replacing local data.
- No real database, backend, paid storage, or production authentication is used.

## Implemented workflow

- Companies, projects, customers, suppliers, and subcontractors: create, edit, archive, search, and persist.
- BOQ, purchase orders, inventory movements, expenses, certificates, journals, and document metadata: create, search, and persist.
- Receiving a purchase order creates a posted inventory receipt.
- Material issues enforce available-stock policy.
- Posted material issues, approved expenses, and subcontract certificates feed project cost.
- Customer certificates feed revenue and receivables.
- Balanced journal creation feeds the trial balance.
- Project cost, budget variance, profit, margin, and health update the dashboard from transaction data.
- Arabic RTL / English LTR shell, responsive drawer navigation, print styles, and Excel export.
- A global company/project/period context isolates operational lists and accounting workspaces.
- Cumulative customer and subcontractor certificates automatically carry forward previous progress and reject lower or over-100% cumulative values.
- Contracts include approved variation orders and revised contract value; WBS and cost codes support parent-child hierarchy, ordering, and archiving.

## Project accounting milestone

- Every project receives an automatic cost center and WBS dimension.
- Journal lines carry company, project, cost center, cost code, WBS, BOQ, source module, source document, reference, account code, and account name.
- Material issues, material receipts, project expenses, customer certificates, and subcontractor certificates create balanced automatic journals from the company accounting mapping.
- Posted journals are locked; reversing a posted journal creates a new linked reversal with an audit trail.
- Company Accounting includes financial-control exceptions, general ledger, trial balance, company income statement, chart of accounts, configurable account mapping, and month-end closing checklist.
- Project Accounting includes project ledger, project trial balance, operational cost ledger, project income statement, financial position, profitability snapshot, journal drill-down, and accounting-to-cost-ledger reconciliation.
- Existing browser data is migrated in place; user-created records are preserved.

## Accounting UX and financial statements

- Accounting & Finance is organized as sidebar workflows: daily operations, ledgers and subledgers, financial statements, period end, configuration, and control. The accounting landing page no longer exposes a growing horizontal tab bar.
- The financial statements center provides Arabic/English income statement, balance sheet, cash flow, changes in equity, detailed trial balance, adjusted trial balance, and post-closing trial balance.
- Statements use posted journal lines and chart-of-accounts classification only. Balance-sheet and cash-flow reconciliation warnings are calculated, not hardcoded.
- Company statements can be filtered by project; project selection intentionally shows a project financial position instead of a misleading full project balance sheet.
- Trial balance displays opening debit/credit, period movement, and closing debit/credit with expandable account hierarchy.
- Certificate creation uses a six-step wizard with live previous/current/cumulative progress and value calculations, approved variation impact, deductions, review, and submission to the accounting-document workflow.
- Automated coverage currently includes 29 business-rule and financial-reconciliation tests.

## Prototype limitations and future migration

This is a discovery prototype, not a production accounting system. Roles, approvals, taxes, numbering, accounting mappings, and transaction workflows must be confirmed with the target contractor before final backend design. The future migration replaces repositories with API implementations and connects a production file provider, authentication, audit, and approved database schema.

## Deployment

The repository is intended for GitHub-connected Vercel deployment. No paid Vercel features, database, analytics, or add-ons are required.
